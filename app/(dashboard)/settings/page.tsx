'use client';

import { Settings, User, Bell, Shield, Database, Palette, HelpCircle, ArrowLeft, Percent, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ProfileSection } from '@/components/settings/ProfileSection';
import { AppearanceSection } from '@/components/settings/AppearanceSection';
import { NotificationsSection } from '@/components/settings/NotificationsSection';
import { SecuritySection } from '@/components/settings/SecuritySection';
import { TaxesSection } from '@/components/settings/TaxesSection';
import { ComingSoon } from '@/components/settings/ComingSoon';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/useAuthStore';
import { RequirePermission } from '@/components/auth/RequirePermission';

const settingsSections = [
  { id: 'profile', icon: User, label: 'Perfil y Cuenta', description: 'Gestiona la información de tu negocio y ticket.', permission: 'manage_settings' },
  { id: 'taxes', icon: Percent, label: 'Impuestos', description: 'IVA, Impoconsumo y porcentajes globales.', permission: 'manage_settings' },
  { id: 'appearance', icon: Palette, label: 'Apariencia', description: 'Personaliza los colores y el tema del sistema.' },
  { id: 'notifications', icon: Bell, label: 'Notificaciones', description: 'Configura alertas de stock y cierres de caja.', permission: 'manage_settings' },
  { id: 'security', icon: Shield, label: 'Seguridad', description: 'Roles de usuario y permisos del sistema.', permission: 'manage_settings' },
  { id: 'database', icon: Database, label: 'Base de Datos', description: 'Exportar respaldos y limpiar historial.', permission: 'manage_settings' },
  { id: 'support', icon: HelpCircle, label: 'Soporte', description: 'Centro de ayuda y documentación técnica.' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const renderSection = () => {
    const section = settingsSections.find(s => s.id === activeSection);

    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'security':
        return <SecuritySection />;
      case 'taxes':
        return <TaxesSectionWrapper />;
      case null:
        return (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            {settingsSections.map((section) => {
              const button = (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-primary hover:shadow-xl transition-all text-left group hover:-translate-y-1 w-full"
                >
                  <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-primary/10 transition-colors">
                    <section.icon className={cn(
                      "w-6 h-6 transition-colors",
                      activeSection === section.id ? "text-primary" : "text-gray-400 group-hover:text-primary"
                    )} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-text-main text-lg">{section.label}</h3>
                    <p className="text-text-secondary text-sm font-medium">{section.description}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary/20 group-hover:text-primary transition-all">
                    →
                  </div>
                </button>
              );

              if (section.permission) {
                return (
                  <RequirePermission key={section.id} action={section.permission}>
                    {button}
                  </RequirePermission>
                );
              }

              return button;
            })}
          </div>
        );
      default:
        return <ComingSoon title={section?.label || 'Sección'} />;
    }
  };

  return (
    <div className="contents space-y-8 max-w-5xl pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 overflow-hidden">
        <div>
          {activeSection && (
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 text-text-secondary font-black text-xs uppercase tracking-widest hover:text-primary transition-colors mb-4 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver a Configuración
            </button>
          )}
          <h1 className="text-4xl font-black text-text-main tracking-tight">
            {activeSection ? settingsSections.find(s => s.id === activeSection)?.label : 'Configuración'}
          </h1>
          <p className="text-text-secondary font-medium mt-1">
            {activeSection ? 'Personaliza esta sección para adaptarla a tus necesidades.' : 'Personaliza el funcionamiento y estética de tu NeonPOS.'}
          </p>
        </div>

        {!activeSection && (
          <div className="flex items-center gap-3 p-2 bg-background-dark rounded-[24px] pr-6 shadow-xl group hover:scale-[1.02] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden border border-white/10">
              <div className="w-6 h-6 bg-primary rounded-full animate-pulse shadow-[0_0_15px_rgba(158,255,0,0.5)]" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estado del Sistema</p>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Plan Premium Activo</p>
            </div>
          </div>
        )}
      </header>

      {renderSection()}

      {!activeSection && (
        <div className="mt-12 p-10 bg-gradient-to-br from-background-dark to-slate-900 rounded-[40px] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10">
            <h2 className="font-black text-3xl mb-2 tracking-tight">NeonPOS Intelligence <span className="text-primary italic">Pro</span></h2>
            <p className="text-gray-400 font-medium max-w-md">Tu infraestructura de datos está sincronizada globalmente. Próxima actualización programada en 12 horas.</p>
          </div>
          <button className="relative z-10 neon-button px-10 py-5 rounded-[22px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
            Ver Roadmap
          </button>
        </div>
      )}
    </div>
  );
}

function TaxesSectionWrapper() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/app/actions/settings').then(({ getBusinessSettings }) => {
      getBusinessSettings().then(({ data }) => {
        if (data) setSettings(data);
        setLoading(false);
      });
    });
  }, []);

  if (loading) return (
    <div className="h-[400px] flex items-center justify-center">
       <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  );
  return <TaxesSection settings={settings} />;
}
