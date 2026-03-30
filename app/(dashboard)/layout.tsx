import { Sidebar } from '@/components/layout/Sidebar';
import { getBusinessSettings } from '@/app/actions/settings';
import { getStaffMembers } from '@/app/actions/staff';
import { AuthManager } from '@/components/auth/AuthManager';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ data: settings }, { data: staff }] = await Promise.all([
    getBusinessSettings(),
    getStaffMembers()
  ]);

  const hasStaff = staff && staff.length > 0;

  return (
    <div className="flex min-h-screen bg-background-light">
      <AuthManager permissions={settings?.role_permissions || {}} hasStaff={hasStaff} />
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8 transition-all duration-300">
        <div className="max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
