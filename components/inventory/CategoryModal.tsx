'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Save, Tags } from 'lucide-react';
import { createCategory } from '@/app/actions/categories';
import { useTransition } from 'react';

const CategorySchema = z.object({
  name: z.string().min(1, 'Nombre de categoría requerido'),
  description: z.string().optional(),
});

type CategoryFormData = z.infer<typeof CategorySchema>;

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryModal({ isOpen, onClose, onSuccess }: CategoryModalProps) {
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  if (!isOpen) return null;

  const onSubmit = (formData: CategoryFormData) => {
    startTransition(async () => {
      const result = await createCategory(formData);

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
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Tags className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-black text-text-main">Nueva Categoría</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Nombre</label>
            <input 
              {...register('name')} 
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none"
              placeholder="Ej. Bebidas, Golosinas..."
            />
            {errors.name && <p className="text-red-500 text-xs font-medium pl-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Descripción (Opcional)</label>
            <textarea 
              {...register('description')} 
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none resize-none"
              placeholder="Breve descripción de la categoría"
            />
          </div>
        </form>

        <div className="p-8 bg-gray-50 flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-white border border-gray-200 text-text-secondary rounded-2xl font-bold hover:bg-gray-100 transition-all"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="flex-[2] py-4 bg-primary text-background-dark rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <Save className="w-6 h-6" />
                Crear Categoría
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
