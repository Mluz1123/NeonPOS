'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Save } from 'lucide-react';
import { Product, Category } from '@/types';
import { createProduct, updateProduct } from '@/app/actions/products';
import { useTransition, useEffect, useState } from 'react';
import { getCategories } from '@/app/actions/categories';

const ProductSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  barcode: z.string().optional(),
  category_id: z.string().uuid('Categoría inválida'),
  purchase_price: z.coerce.number().min(0, 'Precio inválido'),
  sale_price: z.coerce.number().min(0, 'Precio inválido'),
  stock_actual: z.coerce.number().int().min(0, 'Stock inválido'),
  stock_min: z.coerce.number().int().min(0, 'Stock inválido'),
  is_active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof ProductSchema>;

interface ProductModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductModal({ product, isOpen, onClose, onSuccess }: ProductModalProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
  });

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await getCategories();
      if (data) setCategories(data);
    }
    if (isOpen) {
      fetchCategories();
      if (product) {
        reset({
          name: product.name,
          barcode: product.barcode || '',
          category_id: product.category_id,
          purchase_price: product.purchase_price,
          sale_price: product.sale_price,
          stock_actual: product.stock_actual,
          stock_min: product.stock_min,
          is_active: product.is_active,
        });
      } else {
        reset({
          name: '',
          barcode: '',
          category_id: '',
          purchase_price: 0,
          sale_price: 0,
          stock_actual: 0,
          stock_min: 0,
          is_active: true,
        });
      }
    }
  }, [isOpen, product, reset]);

  if (!isOpen) return null;

  const onSubmit = (formData: ProductFormData) => {
    startTransition(async () => {
      const result = product 
        ? await updateProduct(product.id, formData)
        : await createProduct(formData);

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
      <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-2xl font-black text-text-main">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Nombre</label>
              <input 
                {...register('name')} 
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none"
                placeholder="Nombre del producto"
              />
              {errors.name && <p className="text-red-500 text-xs font-medium pl-1">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Código de Barras</label>
              <input 
                {...register('barcode')} 
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none"
                placeholder="750123456789"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Categoría</label>
              <select 
                {...register('category_id')}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-semibold outline-none appearance-none"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-xs font-medium pl-1">{errors.category_id.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Estado</label>
              <div className="flex items-center gap-4 py-3">
                <input type="checkbox" {...register('is_active')} id="is_active" className="w-5 h-5 accent-primary" />
                <label htmlFor="is_active" className="text-sm font-bold text-text-main">Activo para venta</label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Compra</label>
              <input 
                {...register('purchase_price')} 
                type="number" step="0.01"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Venta</label>
              <input 
                {...register('sale_price')} 
                type="number" step="0.01"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Stock Actual</label>
              <input 
                {...register('stock_actual')} 
                type="number"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Stock Mín.</label>
              <input 
                {...register('stock_min')} 
                type="number"
                className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold outline-none"
              />
            </div>
          </div>
        </form>

        <div className="p-8 bg-gray-50 flex gap-4">
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
            className="flex-[2] py-4 bg-primary text-background-dark rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                <Save className="w-6 h-6" />
                {product ? 'Guardar Cambios' : 'Crear Producto'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
