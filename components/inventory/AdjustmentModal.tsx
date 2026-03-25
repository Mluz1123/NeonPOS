'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Package, ArrowDownLeft, AlertTriangle } from 'lucide-react';
import { createInventoryAdjustment } from '@/app/actions/inventory';
import { useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Product } from '@/types';

const AdjustmentSchema = z.object({
  product_id: z.string().uuid('Selecciona un producto'),
  type: z.enum(['purchase', 'adjustment', 'loss']),
  quantity: z.coerce.number().int().refine(n => n !== 0, 'La cantidad no puede ser cero'),
  reason: z.string().min(3, 'Escribe un motivo válido'),
});

type AdjustmentFormData = z.infer<typeof AdjustmentSchema>;

interface AdjustmentModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdjustmentModal({ products, isOpen, onClose, onSuccess }: AdjustmentModalProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<AdjustmentFormData>({
    resolver: zodResolver(AdjustmentSchema),
    defaultValues: { type: 'adjustment', quantity: 0, reason: '' }
  });

  if (!isOpen) return null;

  const type = watch('type');

  const onSubmit = (formData: AdjustmentFormData) => {
    startTransition(async () => {
      const result = await createInventoryAdjustment(formData);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 text-left">
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-text-main rounded-2xl shadow-lg">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-text-main">Ajuste de Stock</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Producto</label>
            <select 
              {...register('product_id')}
              className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold outline-none"
            >
              <option value="">Seleccionar producto...</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.stock_actual} en stock)</option>
              ))}
            </select>
            {errors.product_id && <p className="text-red-500 text-[10px] font-bold pl-1 uppercase">{errors.product_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Tipo de Movimiento</label>
              <select 
                {...register('type')}
                className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold outline-none"
              >
                <option value="purchase">Entrada por Compra</option>
                <option value="adjustment">Ajuste Manual</option>
                <option value="loss">Salida por Merma / Daño</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Cantidad</label>
              <input 
                {...register('quantity')}
                type="number"
                placeholder="Ej: 10 o -5"
                className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold outline-none"
              />
              {errors.quantity && <p className="text-red-500 text-[10px] font-bold pl-1 uppercase">{errors.quantity.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Motivo / Concepto</label>
            <input 
              {...register('reason')}
              className="w-full px-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold outline-none"
              placeholder="Ej: Restocking semanal, Producto roto, etc."
            />
            {errors.reason && <p className="text-red-500 text-[10px] font-bold pl-1 uppercase">{errors.reason.message}</p>}
          </div>

          {type === 'loss' && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-[10px] text-red-700 font-bold uppercase leading-relaxed">
                Advertencia: Los movimientos de merma afectarán negativamente tu stock y reportes de utilidad.
              </p>
            </div>
          )}

          <button 
            disabled={isPending}
            className="w-full py-5 bg-text-main text-primary rounded-2xl font-black text-lg shadow-xl shadow-gray-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Registrar Movimiento'}
          </button>
        </form>
      </div>
    </div>
  );
}
