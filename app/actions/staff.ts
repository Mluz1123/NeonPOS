'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface StaffMember {
  id: string;
  name: string;
  pin_code: string;
  role: 'admin' | 'manager' | 'cashier';
  is_active: boolean;
}

const StaffSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  pin_code: z.string().length(4, 'El PIN debe ser de 4 dígitos').regex(/^\d+$/, 'El PIN solo debe contener números'),
  role: z.enum(['admin', 'manager', 'cashier']),
  is_active: z.boolean().default(true),
});

type ActionResult<T> = { data: T; error: null } | { data: null; error: string };

export async function getStaffMembers(): Promise<ActionResult<StaffMember[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data as any, error: null };
}

export async function createStaffMember(formData: z.infer<typeof StaffSchema>): Promise<ActionResult<StaffMember>> {
  const parsed = StaffSchema.safeParse(formData);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  
  // Check if PIN already exists for this business
  const { data: existingPins } = await supabase.from('staff').select('pin_code').eq('pin_code', parsed.data.pin_code);
  if (existingPins && existingPins.length > 0) {
    return { data: null, error: 'Este PIN ya está en uso' };
  }

  const { data, error } = await supabase
    .from('staff')
    .insert(parsed.data)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  
  revalidatePath('/(dashboard)/settings');
  return { data: data as any, error: null };
}

export async function updateStaffMember(id: string, formData: Partial<z.infer<typeof StaffSchema>>): Promise<ActionResult<StaffMember>> {
  const supabase = await createClient();
  
  // If pin changed, check for duplicates
  if (formData.pin_code) {
    const { data: existingPins } = await supabase.from('staff').select('id').eq('pin_code', formData.pin_code).neq('id', id);
    if (existingPins && existingPins.length > 0) {
      return { data: null, error: 'Este PIN ya está en uso por otro empleado' };
    }
  }

  const { data, error } = await supabase
    .from('staff')
    .update(formData)
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  
  revalidatePath('/(dashboard)/settings');
  return { data: data as any, error: null };
}

export async function deleteStaffMember(id: string): Promise<ActionResult<null>> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('staff')
    .delete()
    .eq('id', id);

  if (error) return { data: null, error: error.message };
  
  revalidatePath('/(dashboard)/settings');
  return { data: null, error: null };
}

export async function validatePin(pinCode: string): Promise<ActionResult<StaffMember>> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('pin_code', pinCode)
    .single();

  if (error || !data) return { data: null, error: 'PIN incorrecto o no encontrado' };
  if (!data.is_active) return { data: null, error: 'Usuario inactivo, contacta a un administrador' };

  return { data: data as any, error: null };
}
