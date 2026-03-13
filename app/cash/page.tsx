'use client';

import { Calculator, ArrowUpCircle, ArrowDownCircle, Lock, Unlock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CashPage() {
  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-text-main">Caja</h1>
          <p className="text-text-secondary">Control de flujo de efectivo y cierres de turno.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2 font-bold text-red-500 hover:bg-red-50 transition-colors">
            <Lock className="w-5 h-5" />
            Cerrar Caja
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-sm text-text-secondary font-bold uppercase tracking-wider mb-2">Monto Inicial</p>
          <p className="text-3xl font-black text-text-main">$1,500.00</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-sm text-text-secondary font-bold uppercase tracking-wider mb-2">Ventas en Efectivo</p>
          <p className="text-3xl font-black text-green-500">$8,420.00</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm border-l-4 border-l-primary">
          <p className="text-sm text-text-secondary font-bold uppercase tracking-wider mb-2">Efectivo Esperado</p>
          <p className="text-3xl font-black text-text-main">$9,920.00</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ArrowUpCircle className="w-6 h-6 text-green-500" />
            Ingresos Manuales
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold">Cambio inicial</p>
                <p className="text-xs text-gray-400">13 Mar, 08:00 AM</p>
              </div>
              <p className="font-black text-green-600">+$1,500.00</p>
            </div>
            <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-primary hover:text-primary transition-all">
              + Registrar Ingreso
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ArrowDownCircle className="w-6 h-6 text-red-500" />
            Egresos Manuales
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold">Pago a proveedor (Hielo)</p>
                <p className="text-xs text-gray-400">13 Mar, 11:30 AM</p>
              </div>
              <p className="font-black text-red-600">-$250.00</p>
            </div>
            <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-red-400 hover:text-red-400 transition-all">
              + Registrar Egreso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
