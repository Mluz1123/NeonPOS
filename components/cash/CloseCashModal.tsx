'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Lock, AlertTriangle, ArrowRight } from 'lucide-react';
import { closeCashRegister } from '@/app/actions/cash';
import { useTransition, useState } from 'react';
import { cn, formatCurrency } from '@/lib/utils';

const CloseCashSchema = z.object({
  final_amount: z.coerce.number().min(0, 'Monto inválido'),
});

type CloseCashFormData = z.infer<typeof CloseCashSchema>;

interface CloseCashModalProps {
  cashRegisterId: string;
  expectedAmount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CloseCashModal({ cashRegisterId, expectedAmount, isOpen, onClose, onSuccess }: CloseCashModalProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CloseCashFormData>({
    resolver: zodResolver(CloseCashSchema),
    defaultValues: { final_amount: 0 }
  });

  const finalAmount = watch('final_amount') || 0;
  const diff = Number(finalAmount) - Number(expectedAmount);

  if (!isOpen) return null;

  const onSubmit = (formData: CloseCashFormData) => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    startTransition(async () => {
      const result = await closeCashRegister(cashRegisterId, formData.final_amount);
      if (result.error) {
        alert(result.error);
      } else {
        onSuccess();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-red-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500 rounded-2xl shadow-lg shadow-red-500/20">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-black text-text-main">Cerrar Caja</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Efectivo Esperado</p>
              <p className="text-xl font-bold text-text-main">{formatCurrency(expectedAmount)}</p>
            </div>
            <div className={cn(
              "p-4 rounded-2xl transition-colors",
              diff === 0 ? "bg-green-50" : diff > 0 ? "bg-blue-50" : "bg-red-50"
            )}>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Diferencia</p>
              <p className={cn(
                "text-xl font-bold",
                diff === 0 ? "text-green-600" : diff > 0 ? "text-blue-600" : "text-red-600"
              )}>
                {diff >= 0 ? '+' : '-'}{formatCurrency(Math.abs(diff))}
              </p>
            </div>
          </div>

          {!showConfirmation ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Efectivo Real en Caja</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">$</span>
                  <input 
                    {...register('final_amount')} 
                    type="number" step="0.01"
                    className="w-full pl-12 pr-6 py-6 bg-gray-50 border border-transparent rounded-[24px] focus:bg-white focus:border-red-500 transition-all font-black text-3xl outline-none"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
                {errors.final_amount && <p className="text-red-500 text-xs font-medium pl-1">{errors.final_amount.message}</p>}
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-text-main text-white rounded-2xl font-black text-lg shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                Continuar con Arqueo
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800 leading-relaxed font-medium">
                  Estás cerrando el turno con un arqueo de <strong>{formatCurrency(finalAmount)}</strong>. 
                  {diff !== 0 && (
                    <span> Existe un {diff > 0 ? 'sobrante' : 'faltante'} de <strong>{formatCurrency(Math.abs(diff))}</strong>.</span>
                  )} 
                  ¿Deseas confirmar el cierre? Esta acción no se puede deshacer.
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 py-4 bg-gray-100 text-text-secondary rounded-2xl font-bold hover:bg-gray-200 transition-all"
                >
                  Regresar
                </button>
                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar Cierre'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
