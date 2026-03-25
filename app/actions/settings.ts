'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface BusinessSettings {
  id: string;
  name: string;
  tax_id: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  footer_text: string | null;
  logo_url: string | null;
}

type ActionResult<T> = { data: T; error: null } | { data: null; error: string };

export async function getBusinessSettings(): Promise<ActionResult<BusinessSettings>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'No autorizado' };

  const { data, error } = await supabase
    .from('business_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    return { data: null, error: error.message };
  }

  if (!data) {
    // Return default empty settings if not found
    return {
      data: {
        id: '',
        name: 'NeonPOS',
        tax_id: '',
        address: '',
        phone: '',
        email: '',
        footer_text: '',
        logo_url: '',
      },
      error: null
    };
  }

  return { data, error: null };
}

export async function updateBusinessSettings(formData: Partial<BusinessSettings>): Promise<ActionResult<BusinessSettings>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'No autorizado' };

  // Limpiar datos para evitar conflictos
  const { id, ...dataToSave } = formData;
  const cleanData = {
    ...dataToSave,
    user_id: user.id,
    updated_at: new Date().toISOString()
  };

  // Usar upsert basado en user_id
  const { data, error } = await supabase
    .from('business_settings')
    .upsert(cleanData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving settings:', error);
    return { data: null, error: error.message };
  }
  
  revalidatePath('/(dashboard)/settings');
  return { data, error: null };
}
