'use client';

import { useState, useEffect, useTransition } from 'react';
import { Moon, Sun, Monitor, Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBusinessSettings, updateBusinessSettings } from '@/app/actions/settings';
import { toast } from 'sonner';

const COLOR_PRESETS = [
  { name: 'Neon Lime', value: '#9EFF00' },
  { name: 'Electric Cyan', value: '#00F0FF' },
  { name: 'Vibrant Pink', value: '#FF00E5' },
  { name: 'Solar Orange', value: '#FF9900' },
  { name: 'Royal Purple', value: '#A855F7' },
  { name: 'Classic Blue', value: '#3B82F6' },
];

export function AppearanceSection() {
  const [settings, setSettings] = useState<any>(null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await getBusinessSettings();
      if (data) setSettings(data);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleUpdate = (updates: any) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    
    startTransition(async () => {
      const { error } = await updateBusinessSettings(updates);
      if (error) {
        toast.error('Error al guardar: ' + error);
      } else {
        toast.success('Apariencia actualizada');
      }
    });
  };

  if (loading) return <div className="p-8 text-center text-text-secondary">Cargando preferencias...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Theme Selection */}
      <section className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-secondary">Tema del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { id: 'light', label: 'Claro', icon: Sun },
            { id: 'dark', label: 'Oscuro', icon: Moon },
            { id: 'system', label: 'Sistema', icon: Monitor },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleUpdate({ theme_mode: theme.id })}
              className={cn(
                "flex flex-col items-center justify-center gap-4 p-8 rounded-[32px] border-2 transition-all group relative overflow-hidden",
                settings?.theme_mode === theme.id 
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/10" 
                  : "border-gray-100 bg-white hover:border-gray-200"
              )}
            >
              <div className={cn(
                "p-4 rounded-2xl transition-all",
                settings?.theme_mode === theme.id ? "bg-primary text-background-dark" : "bg-gray-50 text-gray-400 group-hover:scale-110"
              )}>
                <theme.icon className="w-6 h-6" />
              </div>
              <span className={cn("font-bold text-sm uppercase tracking-widest", settings?.theme_mode === theme.id ? "text-text-main" : "text-text-secondary")}>
                {theme.label}
              </span>
              {settings?.theme_mode === theme.id && (
                <div className="absolute top-4 right-4 text-primary">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Primary Color selection */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-secondary">Color de Marca (Neon)</h2>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
            <div 
              className="w-4 h-4 rounded-full shadow-sm" 
              style={{ backgroundColor: settings?.primary_color }} 
            />
            <span className="text-xs font-mono font-bold text-text-secondary uppercase">{settings?.primary_color}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleUpdate({ primary_color: color.value })}
              className={cn(
                "aspect-square rounded-full flex items-center justify-center transition-all hover:scale-110 relative group shadow-lg",
                settings?.primary_color === color.value ? "ring-4 ring-offset-4 ring-primary/20" : ""
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
              {settings?.primary_color === color.value && (
                <Check className="w-6 h-6 text-white drop-shadow-md" />
              )}
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-background-dark text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                {color.name}
              </div>
            </button>
          ))}
          
          {/* Custom Color Picker */}
          <div className="relative group aspect-square rounded-full bg-white border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-primary transition-all cursor-pointer overflow-hidden">
            <input 
              type="color" 
              value={settings?.primary_color}
              onChange={(e) => handleUpdate({ primary_color: e.target.value })}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <Palette className="w-6 h-6 text-gray-400 group-hover:text-primary" />
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="pt-8 border-t border-gray-100">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-text-secondary mb-6 text-center">Vista Previa de Componentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-10 bg-gray-50 rounded-[40px] border border-gray-100">
          <div className="space-y-6">
             <button className="w-full neon-button py-4 rounded-2xl shadow-xl shadow-primary/20">
               Botón Principal
             </button>
             <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-primary mb-1">Badge Activo</p>
                <h4 className="font-bold text-lg mb-2">Tarjeta de Ejemplo</h4>
                <p className="text-sm text-text-secondary">Así es como se verán tus elementos con la configuración actual.</p>
             </div>
          </div>
          <div className="space-y-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">N</div>
                <div>
                   <p className="font-black text-sm tracking-tight">NeonPOS Dashboard</p>
                   <p className="text-xs text-text-secondary font-medium">Sincronizado con el tema</p>
                </div>
             </div>
             <div className="flex gap-2">
                <div className="h-2 flex-1 bg-primary rounded-full" />
                <div className="h-2 flex-1 bg-primary/40 rounded-full" />
                <div className="h-2 flex-1 bg-primary/10 rounded-full" />
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
