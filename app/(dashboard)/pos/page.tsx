'use client';

import { POSTabs } from '@/components/pos/POSTabs';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { POSCart } from '@/components/pos/POSCart';
import { useState } from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePOSStore } from '@/stores/usePOSStore';

export default function POSPage() {
  const [activeView, setActiveView] = useState<'products' | 'cart'>('products');
  const { tabs, activeTabId } = usePOSStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const itemCount = activeTab?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Mobile Header & View Toggle */}
      <div className="lg:hidden space-y-4">
        <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
          <button 
            onClick={() => setActiveView('products')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest",
              activeView === 'products' ? "bg-primary text-background-dark shadow-md" : "text-gray-400"
            )}
          >
            <Package className="w-4 h-4" />
            Catálogo
          </button>
          <button 
            onClick={() => setActiveView('cart')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest relative",
              activeView === 'cart' ? "bg-primary text-background-dark shadow-md" : "text-gray-400"
            )}
          >
            <ShoppingCart className="w-4 h-4" />
            Venta
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-black animate-bounce">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <POSTabs />
      
      <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-0">
        <div className={cn(
          "flex-[1.5] lg:flex flex-col min-h-0",
          activeView === 'products' ? "flex animate-in fade-in slide-in-from-left-4" : "hidden"
        )}>
          <ProductGrid />
        </div>
        
        <div className={cn(
          "flex-1 lg:flex flex-col min-h-0",
          activeView === 'cart' ? "flex animate-in fade-in slide-in-from-right-4" : "hidden"
        )}>
          <div className="h-full">
            <POSCart />
          </div>
        </div>
      </div>
    </div>
  );
}
