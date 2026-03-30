'use client';

import { LayoutDashboard, ShoppingCart, Package, ArrowLeftRight, Calculator, BarChart3, Settings, LogOut, Lock, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { RequirePermission } from '@/components/auth/RequirePermission';
import { useState, useEffect } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: ShoppingCart, label: 'POS', href: '/pos' },
  { icon: Package, label: 'Inventario', href: '/inventory', permission: 'manage_products' },
  { icon: ArrowLeftRight, label: 'Movimientos', href: '/movements' },
  { icon: Calculator, label: 'Caja', href: '/cash', permission: 'close_cash' },
  { icon: BarChart3, label: 'Reportes', href: '/reports', permission: 'view_reports' },
  { icon: Settings, label: 'Configuración', href: '/settings', permission: 'manage_settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-[60] flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-background-dark text-primary rounded-2xl shadow-xl shadow-black/20 border border-white/10"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={cn(
        "w-64 h-screen dark-sidebar flex flex-col fixed left-0 top-0 z-[55] transition-transform duration-300 transform",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8">
          <h1 className="text-2xl font-black text-primary flex items-center gap-3 tracking-tighter">
            <div className="p-2 bg-primary/20 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            NeonPOS
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            const LinkElement = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex font-semibold items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-14px font-bold",
                  isActive
                    ? "bg-primary text-background-dark shadow-lg shadow-primary/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-background-dark" : "text-gray-500 group-hover:text-primary transition-colors")} />
                {item.label}
              </Link>
            );

            if (item.permission) {
              return (
                <RequirePermission key={item.href} action={item.permission}>
                  {LinkElement}
                </RequirePermission>
              );
            }

            return LinkElement;
          })}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-2">
          <button
            onClick={() => {
              import('@/stores/useAuthStore').then(({ useAuthStore }) => {
                useAuthStore.getState().logout();
              });
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-14px font-semibold text-gray-400 hover:text-yellow-400 transition-colors group rounded-2xl hover:bg-white/5"
          >
            <Lock className="w-4 h-4 text-gray-500 group-hover:text-yellow-400" />
            Bloquear Terminal
          </button>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-3 w-full text-14px font-semibold text-gray-400 hover:text-red-400 transition-colors group rounded-2xl hover:bg-white/5"
            >
              <LogOut className="w-4 h-4 text-gray-500 group-hover:text-red-400" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
