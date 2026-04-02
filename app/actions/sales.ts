'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Sale, SaleItem } from '@/types';
import { SaleSchema } from '@/lib/schemas';

type ActionResult<T> = { data: T; error: null } | { data: null; error: string };


export async function createSale(params: z.infer<typeof SaleSchema>): Promise<ActionResult<Sale>> {
  const parsed = SaleSchema.safeParse(params);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: 'No autorizado.' };
  }

  // 1. Verify Cash Register is OPEN
  const { data: cashReg, error: cashError } = await supabase
    .from('cash_registers')
    .select('id, status')
    .eq('id', params.cash_register_id)
    .single();

  if (cashError) return { data: null, error: 'Error al verificar caja registradora' };
  if (cashReg.status !== 'open') return { data: null, error: 'La caja registradora está cerrada' };

  // 2. Insert Sale Header
  const { data: sale, error: saleError } = await supabase
    .from('sales')
    .insert({
      cash_register_id: params.cash_register_id,
      total_amount: params.total_amount,
      tax_amount: params.tax_amount,
      payment_method: params.payment_method,
      customer_name: params.customer_name,
      status: 'completed'
    })
    .select()
    .single();

  if (saleError) return { data: null, error: `Error al crear venta: ${saleError.message}` };

  // 3. Insert Sale Items
  const itemsToInsert = params.items.map(item => ({
    sale_id: sale.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    subtotal: item.subtotal
  }));

  const { error: itemsError } = await supabase
    .from('sale_items')
    .insert(itemsToInsert);

  if (itemsError) {
    // Attempt cleanup (Soft Rollback)
    await supabase.from('sales').delete().eq('id', sale.id);
    return { data: null, error: `Error al insertar items: ${itemsError.message}` };
  }

  // Stock is decremented by DATABASE TRIGGER automatically
  revalidatePath('/pos');
  revalidatePath('/inventory');
  revalidatePath('/movements');
  revalidatePath('/reports');
  revalidatePath('/'); // Dashboard

  return { data: sale as any, error: null };
}

export async function getSales(): Promise<ActionResult<Sale[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sales')
    .select('*, items:sale_items(*, product:products(*))')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as any, error: null };
}
