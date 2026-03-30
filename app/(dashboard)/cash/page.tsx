"use client";

import { Calculator, ArrowUpCircle, ArrowDownCircle, Lock, Unlock, DollarSign, Loader2, Minus, Plus, RefreshCcw } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useState, useEffect, useTransition } from 'react';
import { getCurrentCashRegister, getCurrentCashStatus, getCashMovements } from '@/app/actions/cash';
import { CashRegister, CashMovement } from '@/types';
import { OpenCashModal } from '@/components/cash/OpenCashModal';
import { CashMovementModal } from '@/components/cash/CashMovementModal';
import { CloseCashModal } from '@/components/cash/CloseCashModal';

export default function CashPage() {
  const [cashRegister, setCashRegister] = useState<CashRegister | null>(null);
  const [status, setStatus] = useState<{ cash_sales: number; net_movements: number; total_cash: number } | null>(null);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementType, setMovementType] = useState<'income' | 'expense'>('income');
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchData = async () => {
    setLoading(true);
    const { data: reg } = await getCurrentCashRegister();
    if (reg) {
      setCashRegister(reg);
      const [{ data: statusData }, { data: movsData }] = await Promise.all([
        getCurrentCashStatus(reg.id),
        getCashMovements(reg.id)
      ]);
      if (statusData) setStatus(statusData);
      if (movsData) setMovements(movsData);
    } else {
      setCashRegister(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  // If no open register, show "Open Box" CTA
  if (!cashRegister) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="p-8 bg-primary/10 rounded-[48px] animate-pulse">
          <Lock className="w-24 h-24 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-text-main mb-2">Caja Cerrada</h1>
          <p className="text-xl text-text-secondary max-w-md mx-auto">Debes abrir un turno para comenzar a vender y gestionar efectivo.</p>
        </div>
        <OpenCashModal isOpen={true} onSuccess={fetchData} />
      </div>
    );
  }

  const expectedAmount = Number(cashRegister.initial_amount) + (status?.total_cash || 0);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-text-main tracking-tighter">Caja de Turno</h1>
          <p className="text-text-secondary flex items-center gap-2 font-medium">
            Iniciada: {new Date(cashRegister.opened_at).toLocaleTimeString()}
            <span className="w-1 h-1 bg-gray-300 rounded-full" />
            Vendedor: Tú
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={fetchData}
            className="p-4 md:p-3 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCcw className={cn("w-6 h-6 text-gray-400", isPending && "animate-spin")} />
          </button>
          <button 
            onClick={() => setIsCloseModalOpen(true)}
            className="flex-1 md:flex-none px-6 py-4 md:py-3 bg-white rounded-2xl border border-red-100 shadow-sm flex items-center justify-center gap-3 font-black text-red-500 hover:bg-red-50 transition-colors uppercase tracking-widest text-xs"
          >
            <Lock className="w-5 h-5" />
            Cerrar Turno
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Monto Inicial</p>
          <p className="text-2xl md:text-3xl font-black text-text-main">{formatCurrency(cashRegister.initial_amount)}</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Ventas Efectivo</p>
          <p className="text-2xl md:text-3xl font-black text-green-500">+{formatCurrency(status?.cash_sales || 0)}</p>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Mov. Manuales</p>
          <p className={cn(
            "text-2xl md:text-3xl font-black",
            (status?.net_movements || 0) >= 0 ? "text-blue-500" : "text-red-500"
          )}>
            {(status?.net_movements || 0) >= 0 ? '+' : ''}{formatCurrency(status?.net_movements || 0)}
          </p>
        </div>
        <div className="bg-primary p-6 md:p-8 rounded-[32px] border border-primary shadow-xl shadow-primary/20">
          <p className="text-[10px] text-background-dark/60 font-black uppercase tracking-widest mb-2">En Caja</p>
          <p className="text-2xl md:text-3xl font-black text-background-dark">{formatCurrency(expectedAmount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-xl">
                <ArrowUpCircle className="w-6 h-6 text-green-500" />
              </div>
              Ingresos Manuales
            </h3>
            <button 
              onClick={() => { setMovementType('income'); setIsMovementModalOpen(true); }}
              className="p-2 bg-gray-50 rounded-xl hover:bg-green-50 hover:text-green-600 transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {movements.filter(m => m.type === 'income').map((m) => (
              <div key={m.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
                <div>
                  <p className="font-bold text-text-main">{m.reason}</p>
                  <p className="text-xs text-gray-400">{new Date(m.created_at).toLocaleTimeString()}</p>
                </div>
                <p className="font-black text-green-600 text-lg">+{formatCurrency(m.amount)}</p>
              </div>
            ))}
            {movements.filter(m => m.type === 'income').length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <ArrowUpCircle className="w-12 h-12 mb-2 opacity-10" />
                <p className="font-medium">Sin ingresos registrados</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-xl">
                <ArrowDownCircle className="w-6 h-6 text-red-500" />
              </div>
              Egresos Manuales
            </h3>
            <button 
              onClick={() => { setMovementType('expense'); setIsMovementModalOpen(true); }}
              className="p-2 bg-gray-50 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
            {movements.filter(m => m.type === 'expense').map((m) => (
              <div key={m.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
                <div>
                  <p className="font-bold text-text-main">{m.reason}</p>
                  <p className="text-xs text-gray-400">{new Date(m.created_at).toLocaleTimeString()}</p>
                </div>
                <p className="font-black text-red-600 text-lg">-{formatCurrency(m.amount)}</p>
              </div>
            ))}
            {movements.filter(m => m.type === 'expense').length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-300">
                <ArrowDownCircle className="w-12 h-12 mb-2 opacity-10" />
                <p className="font-medium">Sin egresos registrados</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CashMovementModal 
        isOpen={isMovementModalOpen}
        type={movementType}
        cashRegisterId={cashRegister.id}
        onClose={() => setIsMovementModalOpen(false)}
        onSuccess={fetchData}
      />

      <CloseCashModal 
        isOpen={isCloseModalOpen}
        cashRegisterId={cashRegister.id}
        expectedAmount={expectedAmount}
        onClose={() => setIsCloseModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}

