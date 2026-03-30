'use client';

import { useState, useEffect, useTransition } from 'react';
import { Bell, Package, Receipt, Mail, Save, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBusinessSettings, updateBusinessSettings } from '@/app/actions/settings';
import { toast } from 'sonner';

export function NotificationsSection() {
  const [settings, setSettings] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await getBusinessSettings();
      if (data) setSettings(data);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleToggle = (key: string) => {
    const newValue = !settings[key];
    const newSettings = { ...settings, [key]: newValue };
    setSettings(newSettings);
    
    startTransition(async () => {
      const { error } = await updateBusinessSettings({ [key]: newValue });
      if (error) toast.error('Error: ' + error);
      else toast.success('Preferencia actualizada');
    });
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSaveField = (key: string) => {
    startTransition(async () => {
      const { error } = await updateBusinessSettings({ [key]: settings[key] });
      if (error) toast.error('Error: ' + error);
      else toast.success('Guardado correctamente');
    });
  };

  if (loading) return <div className="p-8 text-center text-text-secondary">Cargando configuración...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      {/* Stock Alerts Group */}
      <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm space-y-8 transition-all hover:shadow-md">
        <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
          <div className="p-4 bg-orange-50 rounded-2xl text-orange-500">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-text-main">Inventorio y Stock</h2>
            <p className="text-sm text-text-secondary font-medium">Controla cómo recibes alertas sobre tus productos.</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between group">
            <div className="space-y-1">
              <p className="font-bold text-text-main group-hover:text-primary transition-colors">Alertas de Stock Bajo</p>
              <p className="text-xs text-text-secondary font-medium mr-10">Muestra notificaciones cuando un producto alcance su nivel mínimo de stock configurado.</p>
            </div>
            <button
              onClick={() => handleToggle('notify_low_stock')}
              className={cn(
                "w-14 h-8 rounded-full transition-all relative flex items-center px-1",
                settings?.notify_low_stock ? "bg-primary" : "bg-gray-200"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full bg-white shadow-md transition-transform",
                settings?.notify_low_stock ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
            <div className="space-y-1">
              <p className="font-bold text-text-main">Umbral Crítico Global</p>
              <p className="text-xs text-text-secondary font-medium max-w-xs">Define un nivel de stock para alertas prioritarias si el producto no tiene uno específico.</p>
            </div>
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                value={settings?.stock_alert_threshold}
                onChange={(e) => handleInputChange('stock_alert_threshold', parseInt(e.target.value))}
                className="w-24 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-center focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <button 
                onClick={() => handleSaveField('stock_alert_threshold')}
                disabled={isPending}
                className="p-3 bg-white border border-gray-100 rounded-2xl text-text-secondary hover:text-primary hover:border-primary transition-all shadow-sm"
              >
                <Save className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Operations Group */}
      <div className="bg-background-dark rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-8 relative z-10">
          <div className="p-4 bg-primary/20 rounded-2xl text-primary">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black italic tracking-tight">Operaciones de Caja</h2>
            <p className="text-sm text-gray-400 font-medium">Alertas sobre el flujo de efectivo y cierres diarios.</p>
          </div>
        </div>

        <div className="space-y-10 relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-bold text-white">Notificar Cierres de Caja</p>
              <p className="text-xs text-gray-500 font-medium mr-10">Recibe una confirmación visual detallada cada vez que se cierre una caja registradora.</p>
            </div>
            <button
              onClick={() => handleToggle('notify_cash_closure')}
              className={cn(
                "w-14 h-8 rounded-full transition-all relative flex items-center px-1",
                settings?.notify_cash_closure ? "bg-primary" : "bg-white/10"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full bg-white shadow-md transition-transform",
                settings?.notify_cash_closure ? "translate-x-6" : "translate-x-0"
              )} />
            </button>
          </div>

          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-primary" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Email para Reportes Diarios</p>
            </div>
            <div className="bg-white/5 p-2 rounded-[28px] border border-white/10 flex items-center group-focus-within:border-primary/50 transition-all">
              <input 
                type="email" 
                placeholder="ejemplo@negocio.com"
                value={settings?.notification_email || ''}
                onChange={(e) => handleInputChange('notification_email', e.target.value)}
                className="flex-1 bg-transparent px-6 py-3 border-none outline-none font-medium text-sm placeholder:text-gray-600"
              />
              <button 
                onClick={() => handleSaveField('notification_email')}
                className="bg-primary text-background-dark px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Warning (Dumb section for visual polish) */}
      <div className="p-8 bg-primary/5 rounded-[32px] border border-primary/10 flex items-start gap-5">
        <div className="mt-1">
          <AlertTriangle className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-bold text-text-main text-sm mb-1">Nota sobre las notificaciones</p>
          <p className="text-xs text-text-secondary leading-relaxed font-medium">Las alertas de stock utilizan los valores individuales configurados en cada producto. Asegúrate de tener stock mínimo definido en tu <a href="/inventory" className="text-primary hover:underline font-bold">Inventario</a> para un funcionamiento óptimo.</p>
        </div>
      </div>
    </div>
  );
}
