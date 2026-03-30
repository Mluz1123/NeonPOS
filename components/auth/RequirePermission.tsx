'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { ReactNode } from 'react';

interface RequirePermissionProps {
  action: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePermission({ action, children, fallback = null }: RequirePermissionProps) {
  const hasPermission = useAuthStore(state => state.hasPermission(action));

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
