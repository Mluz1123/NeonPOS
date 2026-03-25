'use client';

import { Search, Grid, Package, Plus, Loader2 } from 'lucide-react';
import { Product, Category } from '@/types';
import { usePOSStore } from '@/stores/usePOSStore';
import { cn } from '@/lib/utils';
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
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>
        <button className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors">
          <Grid className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('Todos')}
          className={`px-6 py-2 rounded-xl border transition-all whitespace-nowrap text-sm font-semibold ${
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
            className={`px-6 py-2 rounded-xl border transition-all whitespace-nowrap text-sm font-semibold ${
              selectedCategory === cat.name 
                ? 'bg-primary text-background-dark border-primary' 
                : 'bg-white border-gray-100 text-text-secondary hover:border-primary'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

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
            <div className="w-full aspect-square bg-gray-50 rounded-2xl mb-4 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
              <Package className={cn("w-12 h-12 text-gray-200 group-hover:text-primary/40", product.stock_actual <= 0 && "text-red-200")} />
            </div>
            {product.stock_actual <= 0 && (
              <span className="absolute top-6 left-6 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">Agotado</span>
            )}
            <p className="font-bold text-text-main line-clamp-2 mb-1">{product.name}</p>
            <p className="text-primary-dark font-black text-lg mt-auto">${Number(product.sale_price).toFixed(2)}</p>
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
      
      {filteredProducts.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <Package className="w-16 h-16 mb-4 opacity-10" />
          <p className="text-lg font-medium">No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}
