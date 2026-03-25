'use client';

import { useState, useEffect, useTransition } from 'react';
import { User, Building2, MapPin, Phone, Mail, Hash, FileText, Check, Loader2, Save } from 'lucide-react';
import { getBusinessSettings, updateBusinessSettings, BusinessSettings } from '@/app/actions/settings';
import { cn } from '@/lib/utils';

export function ProfileSection() {
  const [settings, setSettings] = useState<Partial<BusinessSettings>>({
    name: '',
    tax_id: '',
    address: '',
    phone: '',
    email: '',
    footer_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await getBusinessSettings();
      if (data) {
        // Asegurar que nulos sean strings vacíos para inputs controlados
        const safeData = {
          ...data,
          tax_id: data.tax_id || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          footer_text: data.footer_text || '',
        };
        setSettings(safeData);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = () => {
    setErrorStatus(null);
    startTransition(async () => {
      const { data, error } = await updateBusinessSettings(settings);
      if (data) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else if (error) {
        setErrorStatus(error);
        setTimeout(() => setErrorStatus(null), 5000);
      }
    });
  };

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight uppercase">Perfil del Negocio</h2>
          <p className="text-text-secondary font-medium">Esta información aparecerá en tus facturas y reportes.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-2xl font-black transition-all shadow-lg",
            saveSuccess 
              ? "bg-green-500 text-white shadow-green-500/20" 
              : errorStatus
                ? "bg-red-500 text-white shadow-red-500/20"
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
          ) : errorStatus ? (
            <>
               <Hash className="w-5 h-5" />
               Reintentar
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Cambios
            </>
          )}
        </button>
      </div>

      {errorStatus && (
         <div className="bg-red-50 border border-red-100 p-6 rounded-[24px] animate-in fade-in zoom-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-4 text-red-600">
               <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
               </div>
               <div>
                  <h4 className="font-black text-sm uppercase tracking-wider">Error al Guardar</h4>
                  <p className="text-xs font-bold opacity-80">{errorStatus}</p>
               </div>
            </div>
         </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Info Principal */}
        <section className="space-y-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-primary/10" />
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <Building2 className="w-3 h-3" />
            Identificación Comercial
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-text-main ml-4 uppercase tracking-wider">Nombre del Negocio</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-text-main"
                  placeholder="Ej: Neon Fast Food"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-text-main ml-4 uppercase tracking-wider">NIT / RUT / TAX ID</label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={settings.tax_id || ''}
                  onChange={(e) => setSettings({ ...settings, tax_id: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-text-main"
                  placeholder="Ej: 900.123.456-7"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section className="space-y-6 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-blue-100/50" />
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <MapPin className="w-3 h-3" />
            Información de Contacto
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-text-main ml-4 uppercase tracking-wider">Dirección Local</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-text-main"
                  placeholder="Calle 123 #45-67, Ciudad"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-text-main ml-4 uppercase tracking-wider">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={settings.phone || ''}
                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-text-main"
                    placeholder="+57 300..."
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-text-main ml-4 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50/50 rounded-2xl border border-transparent focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-bold text-text-main"
                    placeholder="contacto@negocio.com"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Facturación / Ticket */}
        <section className="md:col-span-2 space-y-6 bg-background-dark p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-tl-full -mr-32 -mb-32 transition-all group-hover:bg-primary/20 blur-3xl" />
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Personalización de Ticket
            </h3>
            <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Impresora Térmica 80mm
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-white/60 ml-4 uppercase tracking-wider">Mensaje al pié del ticket (Footer)</label>
              <textarea
                value={settings.footer_text || ''}
                onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
                rows={4}
                className="w-full p-6 bg-white/5 rounded-3xl border border-white/10 focus:bg-white/10 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-white resize-none"
                placeholder="Ej: Gracias por su compra. ¡Vuelva pronto!"
              />
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
             <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Hash className="w-5 h-5 text-primary" />
             </div>
             <p className="text-xs font-medium text-gray-400 max-w-md">
                Esta configuración se aplica automáticamente a todos los tickets generados por el punto de venta (POS).
             </p>
          </div>
        </section>
      </div>
    </div>
  );
}
