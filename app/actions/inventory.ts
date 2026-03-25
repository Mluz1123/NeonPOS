'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { InventoryMovement } from '@/types';

type ActionResult<T> = { data: T; error: null } | { data: null; error: string };

const AdjustmentSchema = z.object({
  product_id: z.string().uuid(),
  type: z.enum(['purchase', 'adjustment', 'loss']),
  quantity: z.number().int(), // Positive for purchase, negative for loss
  reason: z.string().min(1, 'Motivo requerido'),
});

export async function getInventoryMovements(productId?: string, limit: number = 50): Promise<ActionResult<InventoryMovement[]>> {
  const supabase = await createClient();
  let query = supabase
    .from('inventory_movements')
    .select('*, product:products(name, barcode)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data, error } = await query;

  if (error) return { data: null, error: error.message };
  return { data: data as any, error: null };
}

export async function createInventoryAdjustment(params: z.infer<typeof AdjustmentSchema>): Promise<ActionResult<InventoryMovement>> {
  const parsed = AdjustmentSchema.safeParse(params);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  
  // NOTE: Database Trigger 'on_inventory_movement' handles updating 'products.stock_actual'
  // for any movement where type != 'sale'.
  
  const { data, error } = await supabase
    .from('inventory_movements')
    .insert(parsed.data)
    .select('*, product:products(name, barcode)')
    .single();

  if (error) return { data: null, error: error.message };
  
  revalidatePath('/inventory');
  revalidatePath('/movements');
  return { data: data as any, error: null };
}
