import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeManager } from '@/components/layout/ThemeManager';
import { getBusinessSettings } from '@/app/actions/settings';

export const metadata: Metadata = {
  title: 'NeonPOS - Sistema de Punto de Venta',
  description: 'Modern POS system for bars and grocery stores',
};

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const { data: settings } = await getBusinessSettings();

  return (
    <html lang="es">
      <body suppressHydrationWarning className="bg-background-light text-text-main">
        <ThemeManager 
          themeMode={settings?.theme_mode} 
          primaryColor={settings?.primary_color} 
        />
        {children}
        <Toaster position="top-right" richColors expand={true} />
      </body>
    </html>
  );
}
