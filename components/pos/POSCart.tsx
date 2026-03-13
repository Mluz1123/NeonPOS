'use client';

import { usePOSStore } from '@/stores/usePOSStore';
import { Trash2, Minus, Plus, CreditCard, Banknote, Landmark } from 'lucide-react';

export function POSCart() {
  const { tabs, activeTabId, updateQuantity, removeFromCart, clearCart } = usePOSStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  
  const subtotal = activeTab?.items.reduce((acc, item) => acc + item.subtotal, 0) || 0;
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  if (!activeTab || activeTab.items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 h-full flex flex-col items-center justify-center text-gray-400 border border-gray-100">
        <Trash2 className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">El carrito está vacío</p>
        <p className="text-sm">Agrega productos para comenzar</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl flex flex-col h-full border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h2 className="text-xl font-bold">Resumen de Venta</h2>
        <button 
          onClick={clearCart}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Limpiar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {activeTab.items.map((item) => (
          <div key={item.product_id} className="flex items-center gap-4 group">
            <div className="flex-1">
              <p className="font-semibold text-text-main line-clamp-1">{item.product?.name}</p>
              <p className="text-sm text-text-secondary">${item.unit_price.toFixed(2)} c/u</p>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
              <button 
                onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}
                className="p-1 hover:bg-white rounded-lg shadow-sm transition-all"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-bold">{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                className="p-1 hover:bg-white rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="w-20 text-right">
              <p className="font-bold text-primary-dark">${item.subtotal.toFixed(2)}</p>
            </div>

            <button 
              onClick={() => removeFromCart(item.product_id)}
              className="p-2 text-gray-300 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 bg-gray-50 space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-text-secondary">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-text-secondary">
            <span>IVA (16%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-2xl font-black text-text-main pt-2 border-t border-gray-200">
            <span>Total</span>
            <span className="text-primary-dark">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 hover:border-primary hover:bg-white transition-all gap-1 group">
            <Banknote className="w-6 h-6 text-gray-400 group-hover:text-primary" />
            <span className="text-[10px] font-bold uppercase">Efectivo</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 hover:border-primary hover:bg-white transition-all gap-1 group">
            <CreditCard className="w-6 h-6 text-gray-400 group-hover:text-primary" />
            <span className="text-[10px] font-bold uppercase">Tarjeta</span>
          </button>
          <button className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 hover:border-primary hover:bg-white transition-all gap-1 group">
            <Landmark className="w-6 h-6 text-gray-400 group-hover:text-primary" />
            <span className="text-[10px] font-bold uppercase">Transf.</span>
          </button>
        </div>

        <button className="w-full neon-button py-4 rounded-2xl text-lg shadow-lg shadow-primary/20">
          Pagar Venta
        </button>
      </div>
    </div>
  );
}
