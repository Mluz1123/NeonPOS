import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NeonPOS - Sistema de Punto de Venta',
  description: 'Modern POS system for bars and grocery stores',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es">
      <body suppressHydrationWarning className="bg-background-light text-text-main">
        {children}
      </body>
    </html>
  );
}
