'use client';

import { BarChart3, Download, Calendar, Filter, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const data = [
  { name: 'Bebidas', value: 45 },
  { name: 'Snacks', value: 25 },
  { name: 'Licores', value: 20 },
  { name: 'Otros', value: 10 },
];

const COLORS = ['#9EFF00', '#0B0B0B', '#6B7280', '#E5E7EB'];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-text-main">Reportes</h1>
          <p className="text-text-secondary">Analiza el rendimiento de tu negocio.</p>
        </div>
        <button className="bg-white px-6 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 font-bold hover:bg-gray-50 transition-colors">
          <Download className="w-5 h-5" />
          Exportar PDF
        </button>
      </header>

      <div className="flex gap-4">
        <button className="px-6 py-3 bg-white rounded-2xl border border-primary shadow-sm flex items-center gap-2 font-bold text-primary-dark">
          <Calendar className="w-5 h-5" />
          Últimos 30 días
        </button>
        <button className="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 font-semibold hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          Filtrar por Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-8">Ventas por Categoría</h3>
          <div className="h-[400px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4 pr-12">
              {data.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-sm font-bold text-text-main">{item.name}</span>
                  <span className="text-sm text-text-secondary ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-bold text-text-main">Crecimiento Mensual</h4>
            </div>
            <p className="text-3xl font-black text-text-main">+24.5%</p>
            <p className="text-sm text-green-500 font-bold mt-1">↑ $3,200 más que el mes pasado</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h4 className="font-bold text-text-main">Clientes Recurrentes</h4>
            </div>
            <p className="text-3xl font-black text-text-main">68%</p>
            <p className="text-sm text-text-secondary font-medium mt-1">Basado en 450 ventas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
