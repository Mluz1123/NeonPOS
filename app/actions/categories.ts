'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Category } from '@/types';

const CategorySchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string().optional(),
});

type ActionResult<T> = { data: T; error: null } | { data: null; error: string };

export async function getCategories(): Promise<ActionResult<Category[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function createCategory(formData: z.infer<typeof CategorySchema>): Promise<ActionResult<Category>> {
  const parsed = CategorySchema.safeParse(formData);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .insert(parsed.data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  
  revalidatePath('/inventory');
  return { data, error: null };
}

export async function updateCategory(id: string, formData: z.infer<typeof CategorySchema>): Promise<ActionResult<Category>> {
  const parsed = CategorySchema.safeParse(formData);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  
  revalidatePath('/inventory');
  return { data, error: null };
}

export async function deleteCategory(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    if (error.code === '23503') return { data: null, error: 'No se puede eliminar: tiene productos asociados' };
    return { data: null, error: error.message };
  }
  
  revalidatePath('/inventory');
  return { data: null, error: null };
}
