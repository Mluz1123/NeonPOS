"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Package, ShoppingBag, DollarSign, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { getDashboardStats, getWeeklySalesChart, getTopProducts, DashboardStats } from '@/app/actions/reports';
import { getCurrentCashRegister, getCurrentCashStatus } from '@/app/actions/cash';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<{ name: string; sales: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sales: number; trend: string }[]>([]);
  const [cashStatus, setCashStatus] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const [{ data: statsData }, { data: chartDataData }, { data: topData }, { data: cashReg }] = await Promise.all([
        getDashboardStats(),
        getWeeklySalesChart(),
        getTopProducts(4),
        getCurrentCashRegister()
      ]);

      if (statsData) setStats(statsData);
      if (chartDataData) setChartData(chartDataData);
      if (topData) setTopProducts(topData);

      if (cashReg) {
        const { data: status } = await getCurrentCashStatus(cashReg.id);
        if (status) setCashStatus(Number(cashReg.initial_amount) + status.total_cash);
      }
      
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Ventas del Día', value: `$${stats?.today_sales.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'bg-primary/10 text-primary' },
    { label: 'Pedidos Hoy', value: stats?.today_orders.toString() || '0', icon: ShoppingBag, color: 'bg-blue-50 text-blue-500' },
    { label: 'Stock Bajo', value: stats?.low_stock_count.toString() || '0', icon: AlertTriangle, color: 'bg-red-50 text-red-500' },
    { label: 'Productos Activos', value: stats?.active_products.toString() || '0', icon: Package, color: 'bg-purple-50 text-purple-500' },
  ];

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-text-main tracking-tight">Dashboard</h1>
          <p className="text-text-secondary font-medium">Resumen general de las operaciones de hoy.</p>
        </div>
        {cashStatus > 0 && (
          <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 text-sm font-black text-text-main animate-in fade-in slide-in-from-right-4">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.5)]" />
            Caja Abierta: <span className="text-primary-dark">${cashStatus.toFixed(2)}</span>
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md hover:scale-[1.02] transition-all">
            <div className={cn("p-5 rounded-[24px]", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-text-secondary font-black uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-text-main">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            Ventas de la Semana
          </h3>
          <div className="h-[350px] w-full pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9EFF00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9EFF00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280', fontSize: 13, fontWeight: 700}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#6B7280', fontSize: 13, fontWeight: 700}} 
                  dx={-10}
                  tickFormatter={(val) => `$${val}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '16px'
                  }}
                  itemStyle={{ fontWeight: 800, color: '#0F172A' }}
                  cursor={{ stroke: '#9EFF00', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#9EFF00" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorSales)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold mb-8">Productos más vendidos</h3>
          <div className="space-y-6 flex-1">
            {topProducts.map((item) => (
              <div key={item.name} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2 -m-2 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-text-main line-clamp-1">{item.name}</p>
                    <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{item.sales} unidades</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-sm font-black px-2 py-1 rounded-lg",
                    item.trend.startsWith('+') ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  )}>
                    {item.trend}
                  </span>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <ShoppingBag className="w-12 h-12 mb-2 opacity-10" />
                <p className="font-medium">Sin ventas registradas</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-50">
            <button className="w-full py-4 bg-gray-50 text-text-secondary rounded-2xl font-bold hover:bg-primary hover:text-background-dark transition-all text-sm uppercase tracking-widest">
              Ver Reporte Completo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

