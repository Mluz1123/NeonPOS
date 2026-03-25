'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const AuthSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export async function login(formData: z.infer<typeof AuthSchema>) {
  const parsed = AuthSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { data: null, error: error.message === 'Invalid login credentials' ? 'Credenciales inválidas' : error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: z.infer<typeof AuthSchema>) {
  const parsed = AuthSchema.safeParse(formData);
  if (!parsed.success) {
    return { data: null, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp(parsed.data);

  if (error) {
    return { data: null, error: error.message };
  }

  return { 
    data: 'Revisa tu correo para confirmar tu cuenta', 
    error: null 
  };
}
