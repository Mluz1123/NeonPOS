'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { PINLockScreen } from '@/components/auth/PINLockScreen';

export function AuthManager({ permissions, hasStaff }: { permissions: any, hasStaff: boolean | null }) {
  const setPermissions = useAuthStore(state => state.setPermissions);

  useEffect(() => {
    if (permissions) {
      setPermissions(permissions);
    }
  }, [permissions, setPermissions]);

  return <PINLockScreen hasStaff={hasStaff} />;
}
