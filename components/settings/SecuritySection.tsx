'use client';

import { useState, useEffect, useTransition } from 'react';
import { UserPlus, Shield, KeyRound, Check, X, Trash2, Edit2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getBusinessSettings, updateBusinessSettings } from '@/app/actions/settings';
import { getStaffMembers, createStaffMember, updateStaffMember, deleteStaffMember, StaffMember } from '@/app/actions/staff';
import { toast } from 'sonner';

const PERMISSION_KEYS = [
  { id: 'manage_products', label: 'Gestión de Inventario', desc: 'Crear, editar y eliminar productos.' },
  { id: 'manage_discounts', label: 'Modificar Precios Pos', desc: 'Aplicar descuentos en ventas en curso.' },
  { id: 'close_cash', label: 'Cierre de Caja', desc: 'Realizar cortes y movimientos de efectivo.' },
  { id: 'view_reports', label: 'Acceder a Reportes', desc: 'Ver historial de ventas y analytics.' },
  { id: 'manage_settings', label: 'Configuración', desc: 'Modificar apariencia, roles y ajustes.' },
];

export function SecuritySection() {
  const [settings, setSettings] = useState<any>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState<{name: string, pin_code: string, role: 'admin'|'manager'|'cashier', is_active: boolean}>({ name: '', pin_code: '', role: 'cashier', is_active: true });

  useEffect(() => {
    async function loadData() {
      const [settingsRes, staffRes] = await Promise.all([getBusinessSettings(), getStaffMembers()]);
      if (settingsRes.data) setSettings(settingsRes.data);
      if (staffRes.data) setStaffList(staffRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  const handlePermissionToggle = (role: string, permission: string) => {
    const currentPerms = settings?.role_permissions || {};
    const rolePerms = currentPerms[role] || {};
    
    const newPermissions = {
      ...currentPerms,
      [role]: {
        ...rolePerms,
        [permission]: !rolePerms[permission]
      }
    };
    
    setSettings({ ...settings, role_permissions: newPermissions });
    
    startTransition(async () => {
      const { error } = await updateBusinessSettings({ role_permissions: newPermissions });
      if (error) toast.error('Error al actualizar permisos');
    });
  };

  const openModal = (staff?: StaffMember) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({ name: staff.name, pin_code: staff.pin_code, role: staff.role, is_active: staff.is_active });
    } else {
      setEditingStaff(null);
      setFormData({ name: '', pin_code: '', role: 'cashier', is_active: true });
    }
    setIsModalOpen(true);
  };

  const handleSaveStaff = async () => {
    startTransition(async () => {
      let res;
      if (editingStaff) {
        // Enviar Partial<Update> para no pisar si el pin es igual (o la acción ya lo maneja)
        // Pero nuestra validación de PIN verifica no.dígitos. Si se envía id igual al que edita, está bien.
        res = await updateStaffMember(editingStaff.id, formData);
      } else {
        res = await createStaffMember(formData as any);
      }
      
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(editingStaff ? 'Empleado actualizado' : 'Empleado creado');
        setIsModalOpen(false);
        // Refresh list
        const latest = await getStaffMembers();
        if (latest.data) setStaffList(latest.data);
      }
    });
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${name}?`)) return;
    
    startTransition(async () => {
      const { error } = await deleteStaffMember(id);
      if (error) toast.error(error);
      else {
        toast.success('Empleado eliminado');
        setStaffList(staffList.filter(s => s.id !== id));
      }
    });
  };

  if (loading) return <div className="p-8 text-center text-text-secondary">Cargando seguridad...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">

      {/* Staff Management */}
      <div className="bg-white rounded-[40px] border border-gray-100 p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary/10 rounded-2xl text-primary">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-text-main">Personal (Cajeros)</h2>
              <p className="text-sm text-text-secondary font-medium">Asigna PINs de acceso para compartir el mismo terminal.</p>
            </div>
          </div>
          <button 
            onClick={() => openModal()}
            className="neon-button px-6 py-3 rounded-2xl flex items-center gap-2 text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Añadir Empleado
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {staffList.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-gray-50 rounded-[24px]">
              <KeyRound className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-text-main font-bold">No hay personal registrado</p>
              <p className="text-sm text-text-secondary">Añade empleados para que puedan utilizar el POS de forma segura.</p>
            </div>
          ) : (
            staffList.map(staff => (
              <div key={staff.id} className="p-6 border border-gray-100 rounded-[28px] flex items-center justify-between group hover:border-primary/50 transition-all hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-black text-lg text-text-main">
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main flex items-center gap-2">
                      {staff.name}
                      {!staff.is_active && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase">Inactivo</span>}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                        staff.role === 'admin' ? "bg-red-50 text-red-600" :
                        staff.role === 'manager' ? "bg-blue-50 text-blue-600" :
                        "bg-green-50 text-green-700"
                      )}>
                        {staff.role === 'admin' ? 'Administrador' : staff.role === 'manager' ? 'Gerente' : 'Cajero'}
                      </span>
                      <span className="text-xs font-mono text-text-secondary">PIN: ••••</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(staff)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteStaff(staff.id, staff.name)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Role Permissions Matrix */}
      <div className="bg-background-dark rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48" />
        
        <div className="flex items-center gap-4 border-b border-white/10 pb-6 mb-8 relative z-10">
          <div className="p-4 bg-primary/20 rounded-2xl text-primary">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black italic tracking-tight">Matriz de Permisos</h2>
            <p className="text-sm text-gray-400 font-medium">Define qué pueden hacer los gerentes y cajeros en el terminal.</p>
          </div>
        </div>

        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-4 px-2 font-black text-xs uppercase tracking-widest text-gray-500">Privilegio / Acción</th>
                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-center text-blue-400">Gerente</th>
                <th className="py-4 px-6 font-black text-xs uppercase tracking-widest text-center text-green-400">Cajero</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {PERMISSION_KEYS.map((perm) => (
                <tr key={perm.id} className="hover:bg-white/5 transition-colors group/row">
                  <td className="py-5 px-2">
                    <p className="font-bold text-sm text-white">{perm.label}</p>
                    <p className="text-[11px] text-gray-500 font-medium">{perm.desc}</p>
                  </td>
                  
                  {['manager', 'cashier'].map(role => {
                     const isGranted = settings?.role_permissions?.[role]?.[perm.id] ?? false;
                     return (
                        <td key={role} className="py-5 px-6 text-center">
                          <button
                            onClick={() => handlePermissionToggle(role, perm.id)}
                            className={cn(
                              "inline-flex items-center justify-center w-10 h-10 rounded-[14px] transition-all relative overflow-hidden",
                              isGranted ? "bg-primary/20 hover:bg-primary/30 text-primary" : "bg-white/5 hover:bg-white/10 text-gray-500"
                            )}
                          >
                             {isGranted ? <Check className="w-5 h-5 absolute z-10" /> : <X className="w-4 h-4 absolute z-10" />}
                             {isGranted && <div className="absolute inset-0 bg-primary/10 blur-sm animate-pulse" />}
                          </button>
                        </td>
                     );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-center text-gray-500 mt-6 font-medium">Nota: El rol Administrador siempre tiene acceso total al sistema y no depende de esta tabla.</p>
        </div>
      </div>

      {/* Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 space-y-6">
              <h3 className="font-black text-2xl tracking-tight text-text-main">
                {editingStaff ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Nombre Completo</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej. Ana Gómez"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest text-text-secondary">PIN (4 dígitos)</label>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={formData.pin_code}
                      onChange={e => setFormData({...formData, pin_code: e.target.value.replace(/\D/g, '')})}
                      placeholder="****"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold tracking-[0.5em] text-center focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest text-text-secondary">Rol Principal</label>
                    <select
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as 'admin'|'manager'|'cashier'})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-text-main focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                    >
                      <option value="cashier">Cajero</option>
                      <option value="manager">Gerente</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                   <input 
                      type="checkbox" 
                      id="isActive"
                      checked={formData.is_active}
                      onChange={e => setFormData({...formData, is_active: e.target.checked})}
                      className="w-5 h-5 rounded accent-primary" 
                   />
                   <label htmlFor="isActive" className="font-bold text-sm text-text-main cursor-pointer">
                      Cuenta Activa (Permitir acceso)
                   </label>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-text-secondary rounded-[20px] font-bold transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveStaff}
                  disabled={isPending || formData.name.length === 0 || formData.pin_code.length !== 4}
                  className="flex-1 neon-button px-6 py-4 rounded-[20px] font-black uppercase tracking-wider flex justify-center items-center gap-2 disabled:opacity-50 disabled:hover:transform-none"
                >
                  {isPending ? 'Guardando...' : (
                    <>
                      <Save className="w-5 h-5" /> Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
