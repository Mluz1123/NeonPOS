'use client';

import { Search, Grid, List, Package, Plus, Loader2 } from 'lucide-react';
import { Product, Category } from '@/types';
import { usePOSStore } from '@/stores/usePOSStore';
import { cn, formatCurrency } from '@/lib/utils';
import { useEffect, useState, useTransition } from 'react';
import { getProducts } from '@/app/actions/products';
import { getCategories } from '@/app/actions/categories';

export function ProductGrid() {
  const { addToCart } = usePOSStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchData() {
      const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      
      if (productsData) setProducts(productsData);
      if (categoriesData) setCategories(categoriesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.barcode?.includes(search);
    const matchesCategory = selectedCategory === 'Todos' || 
                            p.category?.name === selectedCategory;
    return matchesSearch && matchesCategory && p.is_active;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar producto o escanear código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
          />
        </div>
        <button 
          onClick={() => setViewMode(v => v === 'grid' ? 'list' : 'grid')}
          className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-95 group shadow-sm hover:shadow-md"
          title={viewMode === 'grid' ? 'Cambiar a Lista' : 'Cambiar a Cuadrícula'}
        >
          {viewMode === 'grid' ? (
            <Grid className="w-6 h-6 text-primary transition-transform group-hover:scale-110" />
          ) : (
            <List className="w-6 h-6 text-primary transition-transform group-hover:scale-110" />
          )}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('Todos')}
          className={`px-6 py-2 rounded-xl border transition-all whitespace-nowrap text-sm font-semibold tracking-wide ${
            selectedCategory === 'Todos' 
              ? 'bg-primary text-background-dark border-primary' 
              : 'bg-white border-gray-100 text-text-secondary hover:border-primary'
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-6 py-2 rounded-xl border transition-all whitespace-nowrap text-sm font-semibold tracking-wide ${
              selectedCategory === cat.name 
                ? 'bg-primary text-background-dark border-primary' 
                : 'bg-white border-gray-100 text-text-secondary hover:border-primary'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock_actual <= 0}
              className={`flex flex-col bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary transition-all text-left group relative ${
                product.stock_actual <= 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="w-full aspect-square bg-gray-50 rounded-2xl mb-4 flex items-center justify-center group-hover:bg-primary/5 transition-all overflow-hidden relative border border-transparent group-hover:border-primary/20">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                  <Package className={cn("w-12 h-12 text-gray-200 group-hover:text-primary/40", product.stock_actual <= 0 && "text-red-200")} />
                )}
              </div>
              {product.stock_actual <= 0 && (
                <span className="absolute top-6 left-6 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">Agotado</span>
              )}
              <p className="font-bold text-text-main line-clamp-2 mb-1">{product.name}</p>
              <p className="font-black text-primary-dark text-lg mt-auto">{formatCurrency(product.sale_price)}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className={cn(
                  "text-[10px] uppercase font-bold",
                  product.stock_actual <= product.stock_min ? "text-red-500" : "text-gray-400"
                )}>
                  Stock: {product.stock_actual}
                </span>
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock_actual <= 0}
              className={`flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary transition-all group relative ${
                product.stock_actual <= 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-transparent group-hover:border-primary/20 transition-all">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-8 h-8 text-gray-200 group-hover:text-primary/40" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-bold text-text-main truncate">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded-md">
                    {product.category?.name || 'S/C'}
                  </span>
                  <span className={cn("text-[10px] font-bold uppercase", product.stock_actual <= product.stock_min ? "text-red-500" : "text-gray-400")}>
                    {product.stock_actual} en stock
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right pr-2">
                <p className="font-black text-primary-dark text-lg">{formatCurrency(product.sale_price)}</p>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
              </div>

              {product.stock_actual <= 0 && (
                <div className="absolute inset-0 bg-white/40 flex items-center justify-center rounded-2xl">
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">Agotado</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
      
      {filteredProducts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-20">
          <Package className="w-16 h-16 mb-4 opacity-10" />
          <p className="text-xl font-bold">No se encontraron productos</p>
          <p className="text-sm">Intenta buscar con otros filtros o términos.</p>
        </div>
      )}
    </div>
  );
}
