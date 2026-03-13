'use client';

import { ArrowUpRight, ArrowDownLeft, Search, Filter, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_MOVEMENTS = [
  { id: '1', product: 'Cerveza Corona 355ml', type: 'sale', quantity: -2, reason: 'Venta #1024', date: '2024-03-13 14:20' },
  { id: '2', product: 'Coca Cola 600ml', type: 'purchase', quantity: 24, reason: 'Compra a proveedor', date: '2024-03-13 12:00' },
  { id: '3', product: 'Papas Sabritas Sal', type: 'loss', quantity: -1, reason: 'Producto dañado', date: '2024-03-13 10:30' },
  { id: '4', product: 'Whisky Johnnie Walker', type: 'adjustment', quantity: 1, reason: 'Ajuste de inventario', date: '2024-03-12 18:00' },
];

export default function MovementsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-text-main">Movimientos</h1>
        <p className="text-text-secondary">Historial de entradas y salidas de mercancía.</p>
      </header>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por producto o motivo..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button className="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 font-semibold hover:bg-gray-50">
          <Calendar className="w-5 h-5" />
          Fecha
        </button>
        <button className="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 font-semibold hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          Tipo
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Motivo</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_MOVEMENTS.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-text-main">{m.product}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase",
                    m.type === 'purchase' ? "bg-green-50 text-green-600" :
                    m.type === 'sale' ? "bg-blue-50 text-blue-600" :
                    m.type === 'loss' ? "bg-red-50 text-red-600" :
                    "bg-gray-50 text-gray-600"
                  )}>
                    {m.type === 'purchase' && <ArrowDownLeft className="w-3 h-3" />}
                    {m.type === 'sale' && <ArrowUpRight className="w-3 h-3" />}
                    {m.type}
                  </span>
                </td>
                <td className={cn(
                  "px-6 py-4 font-black",
                  m.quantity > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                </td>
                <td className="px-6 py-4 text-text-secondary text-sm">{m.reason}</td>
                <td className="px-6 py-4 text-text-secondary text-sm">{m.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
