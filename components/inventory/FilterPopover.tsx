'use client';

import { useState } from 'react';
import { Filter, X, Check, ChevronDown } from 'lucide-react';
import { Category } from '@/types';
import { cn } from '@/lib/utils';

export interface InventoryFilters {
  categoryId: string;
  status: 'all' | 'active' | 'inactive';
  stock: 'all' | 'low' | 'out';
  sortBy: 'name' | 'price_asc' | 'price_desc' | 'stock_asc' | 'stock_desc';
}

interface FilterPopoverProps {
  categories: Category[];
  filters: InventoryFilters;
  onFilterChange: (filters: InventoryFilters) => void;
  onClear: () => void;
}

export function FilterPopover({ categories, filters, onFilterChange, onClear }: FilterPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = [
    filters.categoryId !== 'all',
    filters.status !== 'all',
    filters.stock !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "px-6 py-3 rounded-2xl border shadow-sm flex items-center gap-2 font-bold transition-all whitespace-nowrap",
          activeFiltersCount > 0 
            ? "bg-primary/10 border-primary text-primary" 
            : "bg-white border-gray-100 text-text-secondary hover:bg-gray-50"
        )}
      >
        <Filter className="w-5 h-5" />
        Filtros
        {activeFiltersCount > 0 && (
          <span className="ml-1 px-2 py-0.5 bg-primary text-background-dark rounded-full text-[10px] font-black">
            {activeFiltersCount}
          </span>
        )}
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-[32px] shadow-2xl border border-gray-100 p-6 z-[101] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-text-main text-lg">Filtrar por</h3>
              <button onClick={onClear} className="text-xs font-bold text-primary hover:underline">Limpiar</button>
            </div>

            <div className="space-y-6">
              {/* Categoría */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Categoría</label>
                <select 
                  value={filters.categoryId}
                  onChange={(e) => onFilterChange({ ...filters, categoryId: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-semibold outline-none text-sm appearance-none"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Estado</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'active', 'inactive'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => onFilterChange({ ...filters, status: s })}
                      className={cn(
                        "py-2 rounded-xl text-[10px] font-bold uppercase transition-all border",
                        filters.status === s 
                          ? "bg-primary border-primary text-background-dark shadow-sm" 
                          : "bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100"
                      )}
                    >
                      {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Stock</label>
                <div className="flex flex-col gap-2">
                  {(['all', 'low', 'out'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => onFilterChange({ ...filters, stock: v })}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all border",
                        filters.stock === v 
                          ? "bg-primary/5 border-primary text-primary shadow-sm" 
                          : "bg-gray-50 border-transparent text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {v === 'all' ? 'Todos los niveles' : v === 'low' ? 'Bajo Stock / Mínimos' : 'Sin Stock (Agotados)'}
                      {filters.stock === v && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ordenar */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Ordenar por</label>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all font-semibold outline-none text-sm appearance-none"
                >
                  <option value="name">Nombre (A-Z)</option>
                  <option value="price_asc">Precio: Menor a Mayor</option>
                  <option value="price_desc">Precio: Mayor a Menor</option>
                  <option value="stock_asc">Stock: Menor a Mayor</option>
                  <option value="stock_desc">Stock: Mayor a Menor</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="w-full mt-6 py-4 bg-background-dark text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all"
            >
              Aplicar Filtros
            </button>
          </div>
        </>
      )}
    </div>
  );
}
