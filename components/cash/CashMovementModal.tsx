'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { createCashMovement } from '@/app/actions/cash';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';

const MovementSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Monto inválido'),
  reason: z.string().min(3, 'Debes escribir un concepto'),
});

type MovementFormData = z.infer<typeof MovementSchema>;

interface CashMovementModalProps {
  type: 'income' | 'expense';
  cashRegisterId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CashMovementModal({ type, cashRegisterId, isOpen, onClose, onSuccess }: CashMovementModalProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MovementFormData>({
    resolver: zodResolver(MovementSchema),
    defaultValues: { amount: 0, reason: '' }
  });

  if (!isOpen) return null;

  const onSubmit = (formData: MovementFormData) => {
    startTransition(async () => {
      const result = await createCashMovement({
        cash_register_id: cashRegisterId,
        type,
        amount: formData.amount,
        reason: formData.reason,
      });

      if (result.error) {
        alert(result.error);
      } else {
        reset();
        onSuccess();
        onClose();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className={cn(
          "p-8 border-b border-gray-100 flex justify-between items-center transition-colors",
          type === 'income' ? "bg-green-50" : "bg-red-50"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-2xl shadow-lg",
              type === 'income' ? "bg-green-500 shadow-green-500/20" : "bg-red-500 shadow-red-500/20"
            )}>
              {type === 'income' ? <ArrowUpCircle className="w-6 h-6 text-white" /> : <ArrowDownCircle className="w-6 h-6 text-white" />}
            </div>
            <h2 className="text-2xl font-black text-text-main">
              {type === 'income' ? 'Registrar Ingreso' : 'Registrar Egreso'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/50 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Concepto</label>
            <input 
              {...register('reason')} 
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none"
              placeholder={type === 'income' ? "Concepto del ingreso..." : "Concepto del gasto..."}
              autoFocus
            />
            {errors.reason && <p className="text-red-500 text-xs font-medium pl-1">{errors.reason.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Monto</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">$</span>
              <input 
                {...register('amount')} 
                type="number" step="0.01"
                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold text-2xl outline-none"
                placeholder="0.00"
              />
            </div>
            {errors.amount && <p className="text-red-500 text-xs font-medium pl-1">{errors.amount.message}</p>}
          </div>

          <button 
            disabled={isPending}
            className={cn(
              "w-full py-5 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2",
              type === 'income' ? "bg-green-600 shadow-lg shadow-green-500/20" : "bg-red-600 shadow-lg shadow-red-500/20",
              "hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            )}
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar'}
          </button>
        </form>
      </div>
    </div>
  );
}
