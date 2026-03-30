import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StaffMember } from '@/app/actions/staff';

interface AuthState {
  currentStaff: StaffMember | null;
  permissions: { [role: string]: { [permission: string]: boolean } };
  setPermissions: (perms: { [role: string]: { [permission: string]: boolean } }) => void;
  login: (staff: StaffMember) => void;
  logout: () => void;
  hasPermission: (action: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentStaff: null,
      permissions: {},
      
      setPermissions: (perms) => set({ permissions: perms }),
      
      login: (staff) => set({ currentStaff: staff }),
      
      logout: () => set({ currentStaff: null }),
      
      hasPermission: (action: string) => {
        const { currentStaff, permissions } = get();
        if (!currentStaff) return false;
        
        // Admin can do everything
        if (currentStaff.role === 'admin') return true;
        
        // Check dynamic permissions for the specific role
        const rolePerms = permissions[currentStaff.role];
        return rolePerms ? !!rolePerms[action] : false;
      }
    }),
    {
      name: 'neon-pos-auth',
      partialize: (state) => ({ currentStaff: state.currentStaff }), // Only persist staff session
    }
  )
);
