'use client';

import { LayoutDashboard, ShoppingCart, Package, ArrowLeftRight, Calculator, BarChart3, Settings, LogOut, Lock } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ShoppingCart, label: 'POS', href: '/pos' },
  { icon: Package, label: 'Inventario', href: '/inventory' },
  { icon: ArrowLeftRight, label: 'Movimientos', href: '/movements' },
  { icon: Calculator, label: 'Caja', href: '/cash' },
  { icon: BarChart3, label: 'Reportes', href: '/reports' },
  { icon: Settings, label: 'Configuración', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen dark-sidebar flex flex-col fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <ShoppingCart className="w-8 h-8" />
          NeonPOS
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-background-dark font-semibold" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-background-dark" : "group-hover:text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10 space-y-2">
        <button 
          onClick={() => {
            import('@/stores/useAuthStore').then(({ useAuthStore }) => {
              useAuthStore.getState().logout();
            });
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-yellow-400 transition-colors group rounded-xl hover:bg-white/5"
        >
          <Lock className="w-5 h-5 group-hover:text-yellow-400" />
          Bloquear Terminal
        </button>

        <form action="/auth/signout" method="post">
          <button 
            type="submit"
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:text-red-400 transition-colors group rounded-xl hover:bg-white/5"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-400" />
            Cerrar Sesión Negocio
          </button>
        </form>
      </div>
    </div>
  );
}
