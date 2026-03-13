'use client';

import { Settings, User, Bell, Shield, Database, Palette, HelpCircle } from 'lucide-react';

const settingsSections = [
  { icon: User, label: 'Perfil y Cuenta', description: 'Gestiona tu información personal y contraseña.' },
  { icon: Palette, label: 'Apariencia', description: 'Personaliza los colores y el tema del sistema.' },
  { icon: Bell, label: 'Notificaciones', description: 'Configura alertas de stock y cierres de caja.' },
  { icon: Shield, label: 'Seguridad', description: 'Roles de usuario y permisos del sistema.' },
  { icon: Database, label: 'Base de Datos', description: 'Exportar respaldos y limpiar historial.' },
  { icon: HelpCircle, label: 'Soporte', description: 'Centro de ayuda y documentación técnica.' },
];

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h1 className="text-3xl font-black text-text-main">Configuración</h1>
        <p className="text-text-secondary">Personaliza el funcionamiento de tu NeonPOS.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {settingsSections.map((section) => (
          <button
            key={section.label}
            className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:border-primary hover:shadow-md transition-all text-left group"
          >
            <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-primary/10 transition-colors">
              <section.icon className="w-6 h-6 text-gray-400 group-hover:text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-text-main text-lg">{section.label}</h3>
              <p className="text-text-secondary text-sm">{section.description}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary/20 group-hover:text-primary transition-all">
              →
            </div>
          </button>
        ))}
      </div>

      <div className="p-8 bg-background-dark rounded-3xl text-white flex justify-between items-center">
        <div>
          <p className="font-bold text-xl mb-1">NeonPOS Premium</p>
          <p className="text-gray-400 text-sm">Tu suscripción vence en 245 días.</p>
        </div>
        <button className="neon-button px-6 py-3 rounded-xl">
          Gestionar Plan
        </button>
      </div>
    </div>
  );
}
