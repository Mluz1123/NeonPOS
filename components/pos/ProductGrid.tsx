'use client';

import { Search, Grid, Package, Plus } from 'lucide-react';
import { Product } from '@/types';
import { usePOSStore } from '@/stores/usePOSStore';

const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Cerveza Corona 355ml', sale_price: 35, category_id: '1', stock_actual: 100, stock_min: 10, is_active: true, purchase_price: 20 },
  { id: '2', name: 'Coca Cola 600ml', sale_price: 18, category_id: '2', stock_actual: 50, stock_min: 5, is_active: true, purchase_price: 12 },
  { id: '3', name: 'Papas Sabritas Sal', sale_price: 15, category_id: '3', stock_actual: 30, stock_min: 5, is_active: true, purchase_price: 10 },
  { id: '4', name: 'Whisky Johnnie Walker Black', sale_price: 850, category_id: '1', stock_actual: 12, stock_min: 2, is_active: true, purchase_price: 600 },
  { id: '5', name: 'Agua Ciel 1L', sale_price: 12, category_id: '2', stock_actual: 80, stock_min: 10, is_active: true, purchase_price: 6 },
  { id: '6', name: 'Nachos con Queso', sale_price: 45, category_id: '3', stock_actual: 20, stock_min: 5, is_active: true, purchase_price: 25 },
];

export function ProductGrid() {
  const { addToCart } = usePOSStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar producto o escanear código..."
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <button className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
          <Grid className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['Todos', 'Bebidas', 'Snacks', 'Licores', 'Abarrotes'].map((cat) => (
          <button
            key={cat}
            className="px-6 py-2 rounded-xl bg-white border border-gray-100 text-sm font-semibold hover:border-primary transition-all whitespace-nowrap"
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2">
        {MOCK_PRODUCTS.map((product) => (
          <button
            key={product.id}
            onClick={() => addToCart(product)}
            className="flex flex-col bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary transition-all text-left group"
          >
            <div className="w-full aspect-square bg-gray-50 rounded-2xl mb-4 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
              <Package className="w-12 h-12 text-gray-200 group-hover:text-primary/40" />
            </div>
            <p className="font-bold text-text-main line-clamp-2 mb-1">{product.name}</p>
            <p className="text-primary-dark font-black text-lg mt-auto">${product.sale_price.toFixed(2)}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 uppercase font-bold">Stock: {product.stock_actual}</span>
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus className="w-4 h-4 text-primary" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
