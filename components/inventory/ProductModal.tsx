'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Save, ImagePlus, Trash2 } from 'lucide-react';
import { Product, Category } from '@/types';
import { createProduct, updateProduct } from '@/app/actions/products';
import { useTransition, useEffect, useState, useRef } from 'react';
import { getCategories } from '@/app/actions/categories';
import { createClient } from '@/lib/supabase/client';
import { ProductSchema } from '@/lib/schemas';


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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProductFormData>({
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
          image_url: product.image_url || '',
        });
        setImagePreview(product.image_url || null);
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
          image_url: '',
        });
        setImagePreview(null);
      }
      setImageFile(null);
    }
  }, [isOpen, product, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    const supabase = await createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  if (!isOpen) return null;

  const onSubmit = (formData: ProductFormData) => {
    startTransition(async () => {
      try {
        let finalImageUrl = formData.image_url;

        // Si hay un nuevo archivo seleccionado, lo subimos
        if (imageFile) {
          finalImageUrl = await uploadImage(imageFile);
        }

        const result = product 
          ? await updateProduct(product.id, { ...formData, image_url: finalImageUrl })
          : await createProduct({ ...formData, image_url: finalImageUrl });

        if (result.error) {
          alert(result.error);
        } else {
          onSuccess();
          onClose();
        }
      } catch (error: any) {
        alert("Error al subir la imagen: " + (error.message || "Error desconocido"));
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

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-y-auto space-y-8">
          {/* Image Upload Area */}
          <div className="flex flex-col items-center justify-center">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group w-48 h-48 rounded-[40px] border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all overflow-hidden"
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ImagePlus className="w-10 h-10 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-primary transition-colors">
                  <ImagePlus className="w-12 h-12" />
                  <span className="text-xs font-bold uppercase tracking-widest">Añadir Foto</span>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
            {imagePreview && (
              <button 
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                  setValue('image_url', '');
                }}
                className="mt-3 flex items-center gap-1.5 text-xs font-bold text-red-500 uppercase tracking-widest hover:bg-red-50 px-3 py-1.5 rounded-full transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            )}
          </div>

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
                <input type="checkbox" {...register('is_active')} id="is_active" className="w-5 h-5 accent-primary cursor-pointer" />
                <label htmlFor="is_active" className="text-sm font-bold text-text-main cursor-pointer select-none">Activo para venta</label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Compra</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input 
                  {...register('purchase_price')} 
                  type="number" step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Venta</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input 
                  {...register('sale_price')} 
                  type="number" step="0.01"
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-bold outline-none"
                />
              </div>
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
            className="flex-1 py-4 bg-white border border-gray-200 text-text-secondary rounded-2xl font-bold hover:bg-gray-100 transition-all font-semibold"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="flex-[2] py-4 bg-primary text-background-dark rounded-2xl font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
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
