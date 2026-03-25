'use server';

import { createClient } from '@/lib/supabase/server';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

type ActionResult<T> = { data: T; error: null } | { data: null; error: string };

export interface DashboardStats {
  today_sales: number;
  today_orders: number;
  low_stock_count: number;
  active_products: number;
}

export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  const supabase = await createClient();
  const today = new Date();
  const start = startOfDay(today).toISOString();
  const end = endOfDay(today).toISOString();

  // Today's Sales & Orders
  const { data: sales, error: saleError } = await supabase
    .from('sales')
    .select('total_amount')
    .eq('status', 'completed')
    .gte('created_at', start)
    .lte('created_at', end);

  if (saleError) return { data: null, error: saleError.message };

  const today_sales = sales?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;
  const today_orders = sales?.length || 0;

  // Low Stock Count
  const { count: lowStock, error: lowError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .lt('stock_actual', 'stock_min'); // SQL: stock_actual < stock_min

  if (lowError) return { data: null, error: lowError.message };

  // Active Products
  const { count: activeCount, error: activeError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  if (activeError) return { data: null, error: activeError.message };

  return {
    data: {
      today_sales,
      today_orders,
      low_stock_count: lowStock || 0,
      active_products: activeCount || 0,
    },
    error: null,
  };
}

export async function getWeeklySalesChart(): Promise<ActionResult<{ name: string; sales: number }[]>> {
  const supabase = await createClient();
  const chartData: { name: string; sales: number }[] = [];
  
  // Use last 7 days including today
  for (let i = 6; i >= 0; i--) {
    const day = subDays(new Date(), i);
    const start = startOfDay(day).toISOString();
    const end = endOfDay(day).toISOString();

    const { data: sales } = await supabase
      .from('sales')
      .select('total_amount')
      .eq('status', 'completed')
      .gte('created_at', start)
      .lte('created_at', end);

    const total = sales?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;
    
    chartData.push({
      name: format(day, 'EEE'), // Short day name in current locale
      sales: total
    });
  }

  return { data: chartData, error: null };
}

export async function getTopProducts(limit: number = 5): Promise<ActionResult<{ name: string; sales: number; trend: string }[]>> {
  const supabase = await createClient();
  
  // Query sale_items and sum quantity grouped by product
  // For simplicity, we sample recent history
  const { data, error } = await supabase
    .from('sale_items')
    .select('product:products(name), quantity')
    .limit(100); // Sample of recent sales

  if (error) return { data: null, error: error.message };

  const productsMap = new Map<string, number>();
  data?.forEach(item => {
    const name = (item.product as any)?.name || 'Desconocido';
    productsMap.set(name, (productsMap.get(name) || 0) + item.quantity);
  });

  const topProducts = Array.from(productsMap.entries())
    .map(([name, sales]) => ({ name, sales, trend: '+0%' })) // Trends requires historical comparison, setting static for now
    .sort((a, b) => b.sales - a.sales)
    .slice(0, limit);

  return { data: topProducts, error: null };
}
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function getSalesByCategory(): Promise<ActionResult<{ name: string; value: number }[]>> {
  const supabase = await createClient();
  
  // Real joins for category report
  const { data, error } = await supabase
    .from('sale_items')
    .select('quantity, unit_price, product:products(category:categories(name))');

  if (error) return { data: null, error: error.message };

  const categoryTotalMap = new Map<string, number>();
  let totalAll = 0;

  data?.forEach(item => {
    const catName = (item.product as any)?.category?.name || 'Otros';
    const subtotal = item.quantity * item.unit_price;
    categoryTotalMap.set(catName, (categoryTotalMap.get(catName) || 0) + subtotal);
    totalAll += subtotal;
  });

  const chartData = Array.from(categoryTotalMap.entries())
    .map(([name, value]) => ({ 
      name, 
      value: totalAll > 0 ? Math.round((value / totalAll) * 100) : 0 
    }))
    .sort((a, b) => b.value - a.value);

  return { data: chartData, error: null };
}

export async function getMonthlyGrowth(): Promise<ActionResult<{ growth: number; diff: number }>> {
  const supabase = await createClient();
  const now = new Date();
  
  // Current Month
  const startCurr = startOfMonth(now).toISOString();
  const endCurr = endOfMonth(now).toISOString();
  
  // Previous Month
  const lastMonth = subMonths(now, 1);
  const startPrev = startOfMonth(lastMonth).toISOString();
  const endPrev = endOfMonth(lastMonth).toISOString();

  const [{ data: currSales }, { data: prevSales }] = await Promise.all([
    supabase.from('sales').select('total_amount').eq('status', 'completed').gte('created_at', startCurr).lte('created_at', endCurr),
    supabase.from('sales').select('total_amount').eq('status', 'completed').gte('created_at', startPrev).lte('created_at', endPrev)
  ]);

  const totalCurr = currSales?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;
  const totalPrev = prevSales?.reduce((acc, s) => acc + Number(s.total_amount), 0) || 0;

  const diff = totalCurr - totalPrev;
  const growth = totalPrev > 0 ? (diff / totalPrev) * 100 : 100;

  return { data: { growth: Math.round(growth * 10) / 10, diff }, error: null };
}

export async function getRecentSales(days: number = 30): Promise<ActionResult<any[]>> {
  const supabase = await createClient();
  const startDate = subDays(new Date(), days);

  const { data, error } = await supabase
    .from('sales')
    .select('*, items:sale_items(quantity, unit_price, product:products(name))')
    .gte('created_at', format(startDate, 'yyyy-MM-dd'))
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as any, error: null };
}
