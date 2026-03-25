'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Unlock } from 'lucide-react';
import { openCashRegister } from '@/app/actions/cash';
import { useTransition } from 'react';

const OpenCashSchema = z.object({
  initial_amount: z.coerce.number().min(0, 'Monto inválido'),
});

type OpenCashFormData = z.infer<typeof OpenCashSchema>;

interface OpenCashModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export function OpenCashModal({ isOpen, onSuccess }: OpenCashModalProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState: { errors } } = useForm<OpenCashFormData>({
    resolver: zodResolver(OpenCashSchema),
    defaultValues: { initial_amount: 0 }
  });

  if (!isOpen) return null;

  const onSubmit = (formData: OpenCashFormData) => {
    startTransition(async () => {
      const result = await openCashRegister(formData.initial_amount);
      if (result.error) {
        alert(result.error);
      } else {
        onSuccess();
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
              <Unlock className="w-6 h-6 text-background-dark" />
            </div>
            <h2 className="text-2xl font-black text-text-main">Abrir Caja</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <p className="text-text-secondary font-medium">
            Ingresa el monto inicial de efectivo con el que inicias este turno.
          </p>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Efectivo Inicial</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-400">$</span>
              <input 
                {...register('initial_amount')} 
                type="number" step="0.01"
                className="w-full pl-12 pr-6 py-6 bg-gray-50 border border-transparent rounded-[24px] focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-black text-3xl outline-none"
                placeholder="0.00"
                autoFocus
              />
            </div>
            {errors.initial_amount && <p className="text-red-500 text-xs font-medium pl-1">{errors.initial_amount.message}</p>}
          </div>

          <button 
            disabled={isPending}
            className="w-full py-6 bg-primary text-background-dark rounded-[24px] font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Iniciar Turno'}
          </button>
        </form>
      </div>
    </div>
  );
}
