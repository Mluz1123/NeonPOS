'use client';

import { Package, Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_INVENTORY = [
  { id: '1', name: 'Cerveza Corona 355ml', category: 'Bebidas', price: 35, stock: 100, minStock: 10, status: 'active' },
  { id: '2', name: 'Coca Cola 600ml', category: 'Bebidas', price: 18, stock: 5, minStock: 10, status: 'low_stock' },
  { id: '3', name: 'Papas Sabritas Sal', category: 'Snacks', price: 15, stock: 30, minStock: 5, status: 'active' },
  { id: '4', name: 'Whisky Johnnie Walker', category: 'Licores', price: 850, stock: 2, minStock: 5, status: 'low_stock' },
];

export default function InventoryPage() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-text-main">Inventario</h1>
          <p className="text-text-secondary">Gestiona tus productos y niveles de stock.</p>
        </div>
        <button className="neon-button px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </header>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button className="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 font-semibold hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          Filtros
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_INVENTORY.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-text-main">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-text-secondary font-medium">{item.category}</td>
                <td className="px-6 py-4 font-bold">${item.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-bold",
                      item.stock <= item.minStock ? "text-red-500" : "text-text-main"
                    )}>
                      {item.stock}
                    </span>
                    <span className="text-xs text-gray-400">/ min {item.minStock}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {item.stock <= item.minStock ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold">
                      <AlertCircle className="w-3 h-3" />
                      Stock Bajo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs font-bold">
                      Activo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary-dark font-bold text-sm hover:underline">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
