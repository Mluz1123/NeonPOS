'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Product } from '@/types';

export const ProductSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  barcode: z.string().optional(),
  category_id: z.string().uuid('Categoría inválida'),
  purchase_price: z.coerce.number().min(0, 'Precio inválido'),
  sale_price: z.coerce.number().min(0, 'Precio inválido'),
  stock_actual: z.coerce.number().int().min(0, 'Stock inválido'),
  stock_min: z.coerce.number().int().min(0, 'Stock inválido'),
  is_active: z.boolean().default(true),
  image_url: z.string().url('URL de imagen inválida').optional().or(z.literal('')),
});

type ActionResult<T> = { data: T; error: null } | { data: null; error: string };

export async function getProducts(): Promise<ActionResult<Product[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name)')
    .order('name');

  if (error) return { data: null, error: error.message };
  return { data: data as any, error: null };
}

export async function createProduct(formData: z.infer<typeof ProductSchema>): Promise<ActionResult<Product>> {
  const parsed = ProductSchema.safeParse(formData);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .insert(parsed.data)
    .select('*, category:categories(id, name)')
    .single();

  if (error) return { data: null, error: error.message };
  
  revalidatePath('/inventory');
  revalidatePath('/pos');
  return { data: data as any, error: null };
}

export async function updateProduct(id: string, formData: z.infer<typeof ProductSchema>): Promise<ActionResult<Product>> {
  const parsed = ProductSchema.safeParse(formData);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .update(parsed.data)
    .eq('id', id)
    .select('*, category:categories(id, name)')
    .single();

  if (error) return { data: null, error: error.message };
  
  revalidatePath('/inventory');
  revalidatePath('/pos');
  return { data: data as any, error: null };
}

export async function deleteProduct(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient();
  
  // Try to delete physically
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    // If it's a FK constraint violation (code 23503)
    // It means the product is referenced in sales, movements, etc.
    if (error.code === '23503') {
      const { error: updateError } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);
        
      if (updateError) return { data: null, error: updateError.message };
      
      revalidatePath('/inventory');
      revalidatePath('/pos');
      // We return null error but maybe we want to notify it was archived
      return { data: null, error: null }; 
    }
    return { data: null, error: error.message };
  }
  
  revalidatePath('/inventory');
  revalidatePath('/pos');
  return { data: null, error: null };
}
