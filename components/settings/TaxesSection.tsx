'use client';

import { useState, useTransition } from 'react';
import { BusinessSettings, TaxSetting, updateBusinessSettings } from '@/app/actions/settings';
import { toast } from 'sonner';
import { Plus, Trash2, Percent, Save, AlertCircle, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaxesSectionProps {
  settings: BusinessSettings;
}

export function TaxesSection({ settings }: TaxesSectionProps) {
  const [taxes, setTaxes] = useState<TaxSetting[]>(settings.tax_settings || []);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(false);
    startTransition(async () => {
      const { error } = await updateBusinessSettings({
        tax_settings: taxes
      });

      if (error) {
        toast.error('Error al guardar', { description: error });
      } else {
        setSaveSuccess(true);
        toast.success('Impuestos actualizados');
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  };

  const updateTax = (id: string, updates: Partial<TaxSetting>) => {
    setTaxes(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addTax = () => {
    const newId = `tax_${Math.random().toString(36).substring(7)}`;
    setTaxes(prev => [...prev, {
      id: newId,
      name: 'Nuevo Impuesto',
      percentage: 0,
      enabled: true
    }]);
  };

  const removeTax = (id: string) => {
    setTaxes(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight uppercase flex items-center gap-3">
             <Percent className="w-6 h-6 text-primary" />
             Gestión de Impuestos
          </h2>
          <p className="text-text-secondary font-medium">Configura IVA e Impoconsumo aplicables globalmente.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addTax}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all bg-gray-50 text-text-secondary hover:bg-gray-100 border border-transparent shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nuevo
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className={cn(
              "flex items-center gap-2 px-8 py-3 rounded-2xl font-black transition-all shadow-lg",
              saveSuccess 
                ? "bg-green-500 text-white shadow-green-500/20" 
                : "neon-button shadow-primary/20 disabled:opacity-50"
            )}
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                ¡Guardado!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {taxes.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/50 rounded-[40px] border-2 border-dashed border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-text-secondary font-bold">No hay impuestos configurados.</p>
            <button onClick={addTax} className="text-primary font-black uppercase text-xs mt-2 hover:underline">Agregar el primero</button>
          </div>
        ) : (
          taxes.map((tax) => (
            <div 
              key={tax.id}
              className="group flex flex-col md:flex-row md:items-center gap-6 p-8 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
              
              <div className="flex-1 space-y-2 relative z-10">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nombre del Impuesto</label>
                <input 
                  type="text"
                  value={tax.name}
                  onChange={(e) => updateTax(tax.id, { name: e.target.value })}
                  className="w-full px-6 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-text-main"
                  placeholder="Ej: IVA"
                />
              </div>

              <div className="w-full md:w-40 space-y-2 relative z-10">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Porcentaje (%)</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={tax.percentage}
                    onChange={(e) => updateTax(tax.id, { percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-6 pr-12 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-text-main"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-gray-400">%</span>
                </div>
              </div>

              <div className="flex items-center gap-6 relative z-10 pt-4 md:pt-6">
                <div className="flex flex-col items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Estado</span>
                  <button
                    onClick={() => updateTax(tax.id, { enabled: !tax.enabled })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative flex items-center px-1",
                      tax.enabled ? "bg-primary" : "bg-gray-200"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                      tax.enabled ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>
                
                <button 
                  onClick={() => removeTax(tax.id)}
                  className="p-4 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-8 bg-primary/5 rounded-[40px] border border-primary/10 flex items-start gap-6">
        <div className="p-4 bg-primary/20 rounded-2xl">
          <AlertCircle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h4 className="text-sm font-black text-text-main uppercase tracking-widest mb-1">Resumen de Aplicación</h4>
          <p className="text-xs text-text-secondary font-medium leading-relaxed">
            Actualmente se aplicará un recargo total de <span className="text-primary font-black tracking-tighter">
              {taxes.filter(t => t.enabled).reduce((acc, curr) => acc + curr.percentage, 0)}%
            </span> sobre el subtotal de cada venta. 
            Este cálculo es global y aparecerá desglosado en el resumen del carrito antes de finalizar la compra.
          </p>
        </div>
      </div>
    </div>
  );
}
