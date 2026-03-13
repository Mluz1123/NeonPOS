import type {Metadata} from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'NeonPOS - Sistema de Punto de Venta',
  description: 'Modern POS system for bars and grocery stores',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es">
      <body suppressHydrationWarning className="bg-background-light text-text-main">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
