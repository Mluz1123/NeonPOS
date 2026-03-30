'use client';

import { usePOSStore } from '@/stores/usePOSStore';
import { Trash2, Minus, Plus, CreditCard, Banknote, Landmark, Loader2, AlertCircle, CheckCircle2, Package } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { createSale } from '@/app/actions/sales';
import { getCurrentCashRegister } from '@/app/actions/cash';
import { CashRegister } from '@/types';
import { cn } from '@/lib/utils';

export function POSCart() {
  const { tabs, activeTabId, updateQuantity, removeFromCart, clearCart } = usePOSStore();
  const activeTab = tabs.find(t => t.id === activeTabId);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchRegister() {
      const { data } = await getCurrentCashRegister();
      if (data) setCashRegister(data);
    }
    fetchRegister();
  }, [activeTabId]); // Refresh when changing tabs

  const subtotal = activeTab?.items.reduce((acc, item) => acc + item.subtotal, 0) || 0;
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const handlePay = async () => {
    if (!activeTab || activeTab.items.length === 0) return;
    if (!cashRegister) {
      setError('Debes abrir la caja antes de vender');
      return;
    }

    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const result = await createSale({
        cash_register_id: cashRegister.id,
        total_amount: total,
        tax_amount: tax,
        payment_method: paymentMethod,
        items: activeTab.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal
        }))
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('¡Venta realizada con éxito!');
        clearCart();
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      }
    });
  };

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
    <div className="bg-white rounded-3xl flex flex-col h-full border border-gray-100 shadow-sm overflow-hidden relative">
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
          <div key={item.product_id} className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-transparent hover:border-gray-100 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-100">
              {item.product?.image_url ? (
                <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-main line-clamp-1">{item.product?.name}</p>
              <p className="text-sm text-text-secondary">${Number(item.unit_price).toFixed(2)} c/u</p>
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
              <p className="font-bold text-primary-dark">${Number(item.subtotal).toFixed(2)}</p>
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
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-2xl text-xs font-bold animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-2xl text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            {success}
          </div>
        )}

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
          <button 
            onClick={() => setPaymentMethod('cash')}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-1 group",
              paymentMethod === 'cash' ? "border-primary bg-white shadow-sm" : "border-gray-200 hover:border-primary/50"
            )}
          >
            <Banknote className={cn("w-6 h-6", paymentMethod === 'cash' ? "text-primary" : "text-gray-400 group-hover:text-primary/70")} />
            <span className={cn("text-[10px] font-bold uppercase", paymentMethod === 'cash' ? "text-text-main" : "text-gray-400")}>Efectivo</span>
          </button>
          
          <button 
            onClick={() => setPaymentMethod('card')}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-1 group",
              paymentMethod === 'card' ? "border-primary bg-white shadow-sm" : "border-gray-200 hover:border-primary/50"
            )}
          >
            <CreditCard className={cn("w-6 h-6", paymentMethod === 'card' ? "text-primary" : "text-gray-400 group-hover:text-primary/70")} />
            <span className={cn("text-[10px] font-bold uppercase", paymentMethod === 'card' ? "text-text-main" : "text-gray-400")}>Tarjeta</span>
          </button>
          
          <button 
            onClick={() => setPaymentMethod('transfer')}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-1 group",
              paymentMethod === 'transfer' ? "border-primary bg-white shadow-sm" : "border-gray-200 hover:border-primary/50"
            )}
          >
            <Landmark className={cn("w-6 h-6", paymentMethod === 'transfer' ? "text-primary" : "text-gray-400 group-hover:text-primary/70")} />
            <span className={cn("text-[10px] font-bold uppercase", paymentMethod === 'transfer' ? "text-text-main" : "text-gray-400")}>Transf.</span>
          </button>
        </div>

        <button 
          onClick={handlePay}
          disabled={isPending}
          className="w-full neon-button py-4 rounded-2xl text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Pagar Venta'}
        </button>
      </div>
    </div>
  );
}

