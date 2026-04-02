'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { CashRegister, CashMovement } from '@/types';

type ActionResult<T> = { data: T; error: null } | { data: null; error: string };

export async function getCurrentCashRegister(): Promise<ActionResult<CashRegister | null>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'No autorizado' };

  const { data, error } = await supabase
    .from('cash_registers')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'open')
    .single();

  if (error && error.code !== 'PGRST116') return { data: null, error: error.message };
  return { data: data as any, error: null };
}

export async function openCashRegister(initialAmount: number): Promise<ActionResult<CashRegister>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'No autorizado' };

  // Check if there is an open register already
  const { data: openReg } = await getCurrentCashRegister();
  if (openReg) return { data: null, error: 'Ya tienes una caja abierta' };

  const { data, error } = await supabase
    .from('cash_registers')
    .insert({ user_id: user.id, initial_amount: initialAmount, status: 'open' })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  
  revalidatePath('/cash');
  revalidatePath('/pos'); // Enable items to be added to sale
  return { data: data as any, error: null };
}

export async function closeCashRegister(id: string, finalAmount: number): Promise<ActionResult<CashRegister>> {
  const supabase = await createClient();
  
  // Calculate expected amount
  const { data: sales, error: saleError } = await supabase
    .from('sales')
    .select('total_amount, payment_method')
    .eq('cash_register_id', id);

  if (saleError) return { data: null, error: saleError.message };

  const { data: cashReg, error: cashRegError } = await supabase
    .from('cash_registers')
    .select('initial_amount')
    .eq('id', id)
    .single();

  if (cashRegError) return { data: null, error: cashRegError.message };

  const cashSalesTotal = sales?.filter(s => s.payment_method === 'cash').reduce((total, s) => total + Number(s.total_amount), 0) || 0;
  
  // Calculate net cash movements (income - expense)
  const { data: movs, error: movsError } = await supabase
    .from('cash_movements')
    .select('amount, type')
    .eq('cash_register_id', id);

  if (movsError) return { data: null, error: movsError.message };
  
  const movementsTotal = movs?.reduce((total, m) => {
    return m.type === 'income' ? total + Number(m.amount) : total - Number(m.amount);
  }, 0) || 0;

  const expectedAmount = Number(cashReg.initial_amount) + cashSalesTotal + movementsTotal;

  const { data, error } = await supabase
    .from('cash_registers')
    .update({ final_amount: finalAmount, expected_amount: expectedAmount, status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  
  revalidatePath('/cash');
  revalidatePath('/pos'); // Disable sale ability
  revalidatePath('/'); // Refresh dashboard status
  return { data: data as any, error: null };
}

export async function getCashMovements(cashRegisterId: string): Promise<ActionResult<CashMovement[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cash_movements')
    .select('*')
    .eq('cash_register_id', cashRegisterId)
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as any, error: null };
}

export const CashMovementSchema = z.object({
  cash_register_id: z.string().uuid('Caja registradora inválida'),
  type: z.enum(['income', 'expense'], { errorMap: () => ({ message: 'Tipo de movimiento inválido' }) }),
  amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a cero'),
  reason: z.string().min(3, 'La razón debe tener al menos 3 caracteres'),
});

export async function createCashMovement(params: z.infer<typeof CashMovementSchema>): Promise<ActionResult<CashMovement>> {
  const parsed = CashMovementSchema.safeParse(params);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cash_movements')
    .insert(params)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  
  revalidatePath('/cash');
  return { data: data as any, error: null };
}
export async function getCurrentCashStatus(cashRegisterId: string): Promise<ActionResult<{ cash_sales: number; net_movements: number; total_cash: number }>> {
  const supabase = await createClient();
  
  // Cash sales
  const { data: sales, error: saleError } = await supabase
    .from('sales')
    .select('total_amount')
    .eq('cash_register_id', cashRegisterId)
    .eq('payment_method', 'cash');

  if (saleError) return { data: null, error: saleError.message };
  const cashSales = sales?.reduce((t, s) => t + Number(s.total_amount), 0) || 0;

  // Movements
  const { data: movs, error: movsError } = await supabase
    .from('cash_movements')
    .select('amount, type')
    .eq('cash_register_id', cashRegisterId);

  if (movsError) return { data: null, error: movsError.message };
  const netMovements = movs?.reduce((t, m) => m.type === 'income' ? t + Number(m.amount) : t - Number(m.amount), 0) || 0;

  return { 
    data: { 
      cash_sales: cashSales, 
      net_movements: netMovements, 
      total_cash: cashSales + netMovements 
    }, 
    error: null 
  };
}
