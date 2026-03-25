"use client";

import { ArrowUpRight, ArrowDownLeft, Search, Filter, Calendar, RefreshCcw, Loader2, AlertTriangle, ShoppingBag, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useTransition } from 'react';
import { getInventoryMovements } from '@/app/actions/inventory';
import { InventoryMovement } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function MovementsPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isPending, startTransition] = useTransition();

  const fetchMovements = async () => {
    setLoading(true);
    const { data } = await getInventoryMovements();
    if (data) setMovements(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const filteredMovements = movements.filter(m => 
    (m.product as any)?.name.toLowerCase().includes(search.toLowerCase()) || 
    m.reason?.toLowerCase().includes(search.toLowerCase())
  );

  const getMovementLabel = (type: string) => {
    switch(type) {
      case 'sale': return 'Venta';
      case 'purchase': return 'Compra';
      case 'loss': return 'Merma';
      case 'adjustment': return 'Ajuste';
      default: return type;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-text-main">Kardex de Inventario</h1>
          <p className="text-text-secondary font-medium">Historial completo de entradas y salidas de mercancía.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchMovements}
            className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCcw className={cn("w-6 h-6 text-gray-400", loading && "animate-spin")} />
          </button>
        </div>
      </header>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por producto o motivo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
          />
        </div>
        <button className="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 font-bold text-text-secondary hover:bg-gray-50 transition-all">
          <Filter className="w-5 h-5" />
          Filtros
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
        {loading ? (
          <div className="h-[500px] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Producto</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Tipo</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Cantidad</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Motivo / Folio</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-primary/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-text-main group-hover:text-primary transition-colors">{(m.product as any)?.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">SKU: {(m.product as any)?.barcode || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider",
                        m.type === 'purchase' ? "bg-green-50 text-green-600" :
                        m.type === 'sale' ? "bg-blue-50 text-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.1)]" :
                        m.type === 'loss' ? "bg-red-50 text-red-600" :
                        "bg-amber-50 text-amber-600"
                      )}>
                        {m.type === 'purchase' && <ArrowDownLeft className="w-3.5 h-3.5" />}
                        {m.type === 'sale' && <ShoppingBag className="w-3.5 h-3.5" />}
                        {m.type === 'loss' && <AlertTriangle className="w-3.5 h-3.5" />}
                        {getMovementLabel(m.type)}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-lg">
                      <span className={m.quantity > 0 ? "text-green-500" : "text-red-500"}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-text-secondary font-bold text-sm tracking-tight">{m.reason}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-main">
                          {format(new Date(m.created_at), "d 'de' MMMM", { locale: es })}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {format(new Date(m.created_at), "HH:mm 'hrs'")}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMovements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <RefreshCcw className="w-16 h-16 mb-4 opacity-10" />
                        <p className="text-xl font-bold">No se encontraron movimientos registrados</p>
                        <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

