'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Package, ShoppingBag, DollarSign, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const data = [
  { name: 'Lun', sales: 4000 },
  { name: 'Mar', sales: 3000 },
  { name: 'Mie', sales: 2000 },
  { name: 'Jue', sales: 2780 },
  { name: 'Vie', sales: 1890 },
  { name: 'Sab', sales: 2390 },
  { name: 'Dom', sales: 3490 },
];

const stats = [
  { label: 'Ventas del Día', value: '$12,450', icon: DollarSign, color: 'bg-primary/10 text-primary' },
  { label: 'Pedidos Hoy', value: '48', icon: ShoppingBag, color: 'bg-blue-50 text-blue-500' },
  { label: 'Stock Bajo', value: '12', icon: AlertTriangle, color: 'bg-red-50 text-red-500' },
  { label: 'Productos Activos', value: '1,240', icon: Package, color: 'bg-purple-50 text-purple-500' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-text-main">Dashboard</h1>
          <p className="text-text-secondary">Bienvenido de nuevo, aquí está el resumen de hoy.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2 text-sm font-bold">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Caja Abierta: $1,500.00
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={cn("p-4 rounded-2xl", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">{stat.label}</p>
              <p className="text-2xl font-black text-text-main">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Ventas de la Semana
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9EFF00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9EFF00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#9EFF00" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Productos más vendidos</h3>
          <div className="space-y-6">
            {[
              { name: 'Cerveza Corona', sales: 145, trend: '+12%' },
              { name: 'Coca Cola 600ml', sales: 98, trend: '+5%' },
              { name: 'Nachos con Queso', sales: 76, trend: '+8%' },
              { name: 'Papas Sabritas', sales: 64, trend: '-2%' },
            ].map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-text-main">{item.name}</p>
                    <p className="text-xs text-text-secondary">{item.sales} unidades</p>
                  </div>
                </div>
                <span className={cn(
                  "text-sm font-bold",
                  item.trend.startsWith('+') ? "text-green-500" : "text-red-500"
                )}>
                  {item.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
