"use client";

import { Package, Plus, Search, Filter, AlertCircle, Loader2, ArrowLeftRight, Tags, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useTransition } from 'react';
import { getProducts, deleteProduct } from '@/app/actions/products';
import { Product } from '@/types';
import { ProductModal } from '@/components/inventory/ProductModal';
import { AdjustmentModal } from '@/components/inventory/AdjustmentModal';
import { CategoryModal } from '@/components/inventory/CategoryModal';
import { FilterPopover, InventoryFilters } from '@/components/inventory/FilterPopover';
import { getCategories } from '@/app/actions/categories';
import { Category } from '@/types';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<InventoryFilters>({
    categoryId: 'all',
    status: 'all',
    stock: 'all',
    sortBy: 'name'
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isPending, startTransition] = useTransition();

  const fetchData = async () => {
    setLoading(true);
    const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
      getProducts(),
      getCategories()
    ]);
    if (productsData) setProducts(productsData);
    if (categoriesData) setCategories(categoriesData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    // Search filter
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search);

    // Category filter
    const matchesCategory = filters.categoryId === 'all' || p.category_id === filters.categoryId;

    // Status filter
    const matchesStatus = filters.status === 'all' ||
      (filters.status === 'active' ? p.is_active : !p.is_active);

    // Stock filter
    const matchesStock = filters.stock === 'all' ||
      (filters.stock === 'low' && p.stock_actual <= p.stock_min && p.stock_actual > 0) ||
      (filters.stock === 'out' && p.stock_actual === 0);

    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'price_asc':
        return Number(a.sale_price) - Number(b.sale_price);
      case 'price_desc':
        return Number(b.sale_price) - Number(a.sale_price);
      case 'stock_asc':
        return a.stock_actual - b.stock_actual;
      case 'stock_desc':
        return b.stock_actual - a.stock_actual;
      default:
        return 0;
    }
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setDeletingProduct(product);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;

    startTransition(async () => {
      // Optimistic delete: hide immediately
      setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
      setIsConfirmOpen(false);

      const result = await deleteProduct(deletingProduct.id);

      if (result.error) {
        alert(result.error);
        await fetchData(); // Rollback on error
      } else {
        setDeletingProduct(null);
        await fetchData(); // Sync final state
      }
    });
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
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-6 py-3 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 font-bold text-text-secondary hover:bg-gray-50 transition-all shadow-sm"
          >
            <Tags className="w-5 h-5 text-gray-400" />
            Nueva Categoría
          </button>
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
        <FilterPopover
          categories={categories}
          filters={filters}
          onFilterChange={setFilters}
          onClear={() => setFilters({
            categoryId: 'all',
            status: 'all',
            stock: 'all',
            sortBy: 'name'
          })}
        />
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
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Disponibilidad</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all overflow-hidden border border-transparent group-hover:border-primary/20">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6" />
                        )}
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
                    {item.stock_actual === 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-wider shadow-sm shadow-gray-500/5 whitespace-nowrap">
                        Sin Stock
                      </span>
                    ) : item.stock_actual <= item.stock_min ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider shadow-sm shadow-red-500/5 whitespace-nowrap">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Stock Bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-wider shadow-sm shadow-green-500/5 whitespace-nowrap">
                        En Stock
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex justify-center items-center gap-2">
                      {item.is_active ? (
                        <div className="shadow-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                          </span>
                        </div>
                      ) : (
                        <div className="shadow-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-3 hover:bg-primary/10 rounded-2xl text-primary-dark hover:text-primary transition-all group/edit shadow-sm hover:shadow-md border border-transparent hover:border-primary/20"
                        title="Editar Producto"
                      >
                        <Pencil className="w-5 h-5 transition-transform group-hover/edit:scale-110" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-3 hover:bg-red-50 rounded-2xl text-red-400 hover:text-red-600 transition-all group/delete shadow-sm hover:shadow-md border border-transparent hover:border-red-100"
                        title="Eliminar Producto"
                      >
                        <Trash2 className="w-5 h-5 transition-transform group-hover/delete:scale-110" />
                      </button>
                    </div>
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
        onSuccess={fetchData}
      />

      <AdjustmentModal
        products={products}
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        onSuccess={fetchData}
      />
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={fetchData}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar producto?"
        description={`Estás a punto de eliminar "${deletingProduct?.name}". Esta acción es irreversible y afectará el historial de inventario.`}
        confirmText="Sí, eliminar"
        isPending={isPending}
        variant="danger"
      />
    </div>
  );
}


