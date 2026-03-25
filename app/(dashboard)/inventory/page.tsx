"use client";

import { Package, Plus, Search, Filter, AlertCircle, Loader2, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useTransition } from 'react';
import { getProducts } from '@/app/actions/products';
import { Product } from '@/types';
import { ProductModal } from '@/components/inventory/ProductModal';
import { AdjustmentModal } from '@/components/inventory/AdjustmentModal';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchProducts = async () => {
    const { data } = await getProducts();
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode?.includes(search)
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-text-main">Inventario</h1>
          <p className="text-text-secondary font-medium">Gestiona tus productos y niveles de stock.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="px-6 py-3 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 font-bold text-text-secondary hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeftRight className="w-5 h-5 text-gray-400" />
            Ajustar Stock
          </button>
          <button 
            onClick={handleNew}
            className="neon-button px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>
      </header>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
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

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Producto</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Precio</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Stock</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-main">{item.name}</span>
                        <span className="text-[10px] font-black text-gray-400 tracking-wider">SKU: {item.barcode || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-gray-50 rounded-xl text-xs font-black text-text-secondary uppercase tracking-wider">
                      {item.category?.name || 'S/C'}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-black text-lg text-text-main">${Number(item.sale_price).toFixed(2)}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-black text-lg",
                        item.stock_actual <= item.stock_min ? "text-red-500" : "text-text-main"
                      )}>
                        {item.stock_actual}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">/ MIN {item.stock_min}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {item.stock_actual <= item.stock_min ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider shadow-sm shadow-red-500/5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Stock Bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider shadow-sm shadow-green-500/5">
                        En Stock
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="px-4 py-2 hover:bg-white rounded-xl font-black text-sm text-primary-dark hover:shadow-sm transition-all uppercase tracking-widest"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center text-gray-400">
                    <div className="flex flex-col items-center">
                      <Package className="w-16 h-16 mb-4 opacity-10" />
                      <p className="text-xl font-bold">No se encontraron productos</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <ProductModal 
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
      />

      <AdjustmentModal 
        products={products}
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}


