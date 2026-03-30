'use client';

import { BarChart3, Download, Calendar, Filter, TrendingUp, Users, ShoppingBag, Loader2, DollarSign, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useState, useTransition } from 'react';
import { getSalesByCategory, getMonthlyGrowth, getDashboardStats, DashboardStats, getRecentSales } from '@/app/actions/reports';
import { exportReportToPDF } from '@/utils/reports/pdfExport';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const COLORS = ['#9EFF00', '#0B0B0B', '#3B82F6', '#6366F1', '#EC4899', '#E5E7EB'];

export default function ReportsPage() {
  const [categorySales, setCategorySales] = useState<{ name: string; value: number }[]>([]);
  const [growth, setGrowth] = useState<{ growth: number; diff: number } | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [isPending, startTransition] = useTransition();

  const fetchData = async (days: number) => {
    setLoading(true);
    const [{ data: cats }, { data: grwth }, { data: sts }, { data: sales }] = await Promise.all([
      getSalesByCategory(),
      getMonthlyGrowth(),
      getDashboardStats(),
      getRecentSales(days)
    ]);
    if (cats) setCategorySales(cats);
    if (grwth) setGrowth(grwth);
    if (sts) setStats(sts);
    if (sales) setRecentSales(sales);
    setLoading(false);
  };

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const handleExportPDF = () => {
    if (!stats || !growth || categorySales.length === 0) return;
    startTransition(async () => {
      await exportReportToPDF({ stats, growth, categorySales, recentSales });
    });
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-text-main tracking-tight">Reportes de Inteligencia</h1>
          <p className="text-text-secondary font-medium">Visualización de datos operativos y analítica de ventas.</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isPending}
          className="w-full md:w-auto bg-text-main text-white px-8 py-4 rounded-[24px] shadow-xl shadow-gray-200 flex items-center justify-center gap-3 font-black hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-6 h-6 text-primary" />}
          Exportar Reporte Completo
        </button>
      </header>

      <div className="flex flex-wrap gap-3">
        {[7, 15, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={cn(
              "px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all",
              period === days
                ? "bg-primary text-background-dark shadow-lg shadow-primary/20"
                : "bg-white text-text-secondary border border-gray-100 hover:bg-gray-50"
            )}
          >
            Últimos {days} Días
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-2xl font-black text-text-main mb-12 flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/10">
              <BarChart3 className="w-6 h-6 text-background-dark" />
            </div>
            Mix de Productos por Categoría
          </h3>

          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="w-full max-w-[320px] aspect-square relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    innerRadius={100}
                    outerRadius={140}
                    paddingAngle={8}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 800 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Mix</p>
                <p className="text-4xl font-black text-text-main">100%</p>
              </div>
            </div>

            <div className="space-y-4 w-full md:w-auto min-w-[220px]">
              {categorySales.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                  <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-black text-text-main uppercase tracking-tight">{item.name}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="text-xs font-black text-primary-dark w-8 text-right">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8 flex flex-col">
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex-1 hover:shadow-xl hover:scale-[1.01] transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10" />
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-primary/10 rounded-[24px] group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="font-black text-text-main uppercase text-[10px] tracking-[0.2em] text-gray-400 mb-1">Crecimiento</h4>
                <p className="text-3xl font-black text-text-main">
                  {growth?.growth ? (growth.growth >= 0 ? '+' : '') : ''}{growth?.growth || 0}%
                </p>
              </div>
            </div>

            <div className={cn(
              "p-5 rounded-[24px] font-black text-sm transition-all flex items-center justify-between",
              (growth?.diff || 0) >= 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            )}>
              <span className="flex items-center gap-2">
                {(growth?.diff || 0) >= 0 ? '↑' : '↓'}
                ${growth?.diff ? Math.abs(growth.diff).toFixed(2) : '0.00'}
              </span>
              <span className="text-[10px] uppercase opacity-60 tracking-wider">vs mes anterior</span>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex-1 hover:shadow-xl hover:scale-[1.01] transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-10 -mt-10" />
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-blue-50 rounded-[24px] group-hover:bg-blue-100 transition-colors">
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <h4 className="font-black uppercase text-[10px] tracking-[0.2em] text-gray-400 mb-1">Transacciones</h4>
                <p className="text-3xl font-black text-text-main">{recentSales.length}</p>
              </div>
            </div>
            <p className="text-[11px] text-text-secondary font-bold uppercase tracking-widest leading-relaxed">
              Total de operaciones registradas en el periodo seleccionado.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden mt-12">
        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-black text-text-main uppercase tracking-widest flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Historial Detallado de Ventas
          </h3>
          <span className="px-4 py-1.5 bg-gray-50 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {period} Días
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Referencia</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fecha</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Artículos</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pago</th>
                <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-10 py-5">
                    <span className="font-black text-xs text-text-main uppercase tracking-widest">
                      #{sale.id.split('-')[0]}
                    </span>
                  </td>
                  <td className="px-10 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-text-main">
                        {format(new Date(sale.created_at), 'dd MMM yyyy', { locale: es })}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(sale.created_at), 'hh:mm a')}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-5">
                    <div className="flex -space-x-2">
                      {sale.items.slice(0, 3).map((item: any, i: number) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-white border-2 border-gray-50 flex items-center justify-center text-[10px] font-black text-text-main shadow-sm" title={item.product?.name}>
                          {item.product?.name?.[0].toUpperCase()}
                        </div>
                      ))}
                      {sale.items.length > 3 && (
                        <div className="w-8 h-8 rounded-full bg-primary text-background-dark border-2 border-white flex items-center justify-center text-[10px] font-black shadow-sm">
                          +{sale.items.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                      sale.payment_method === 'cash' ? "bg-green-50 text-green-600" : 
                      sale.payment_method === 'card' ? "bg-blue-50 text-blue-600" : 
                      "bg-purple-50 text-purple-600"
                    )}>
                      {sale.payment_method === 'cash' ? 'Efectivo' : 
                       sale.payment_method === 'card' ? 'Tarjeta' : 
                       'Transferencia'}
                    </span>
                  </td>
                  <td className="px-10 py-5 text-right font-black text-lg text-text-main">
                    ${Number(sale.total_amount).toFixed(2)}
                  </td>
                </tr>
              ))}
              {recentSales.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <ShoppingBag className="w-12 h-12 mb-4 opacity-10" />
                      <p className="font-bold">No hay ventas en este periodo</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


