import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../application/context/AuthContext';
import { InstallPwaButton } from './InstallPwaButton';
import {
  ShoppingBag,
  Package,
  Truck,
  LayoutDashboard,
  Store,
  Search,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bike,
  Navigation,
  X,
  Repeat,
  Receipt,
  CalendarClock,
  MapPin,
  Plus,
} from 'lucide-react';

interface SidebarProps {
  contraido: boolean;
  setContraido: (val: boolean) => void;
  movilAbierto?: boolean;
  setMovilAbierto?: (val: boolean) => void;
  onOpenAgendarModal?: () => void;
}

export interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  isAction?: boolean;
  actionKey?: string;
}

export const LeftSidebar: React.FC<SidebarProps> = ({
  contraido,
  setContraido,
  movilAbierto,
  setMovilAbierto,
  onOpenAgendarModal
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isMobileOpen = movilAbierto !== undefined ? movilAbierto : internalMobileOpen;

  const setMobileOpen = (val: boolean) => {
    if (setMovilAbierto) {
      setMovilAbierto(val);
    } else {
      setInternalMobileOpen(val);
    }
  };

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isComercioAccount = user.rolNombre.toLowerCase() === 'comercio';
  const isCurrentlyInClientView = location.pathname.startsWith('/cliente');

  const userInitials = user.nombreCompleto
    ? user.nombreCompleto
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'US';

  const handleToggleMode = () => {
    if (isCurrentlyInClientView) {
      navigate('/comercio/dashboard');
    } else {
      navigate('/cliente/dashboard');
    }
    setMobileOpen(false);
  };

  // Resolve menu items based on current active view mode & user role
  const getMenuItems = (): MenuItem[] => {
    const role = user.rolNombre.toLowerCase();

    if (role === 'comercio' && !isCurrentlyInClientView) {
      return [
        { path: '/comercio/dashboard', label: 'Gestión de Envíos', icon: <ShoppingBag size={20} /> },
        { path: '/comercio/agendar-envio', label: 'Agendar Nuevo Envío', icon: <Plus size={20} /> },
      ];
    }

    if (role === 'motorizado') {
      return [
        { path: '/motorizado/recojos', label: 'Mis Recojos Asignados', icon: <Package size={20} /> },
        { path: '/motorizado/entregas', label: 'Entregas Asignadas', icon: <Truck size={20} /> },
      ];
    }

    if (role === 'administrador' || role === 'admin' || role === 'superadmin') {
      return [
        { path: '/admin/dashboard', label: 'Panel Principal', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/asignar-recojos', label: 'Asignar Recojos', icon: <Bike size={20} /> },
        { path: '/admin/asignar-entregas', label: 'Asignar Entregas', icon: <Truck size={20} /> },
        { path: '/admin/reprogramaciones', label: 'Reprogramaciones', icon: <CalendarClock size={20} /> },
        { path: '/admin/cobertura', label: 'Zonas de Cobertura', icon: <MapPin size={20} /> },
        { path: '/admin/monitoreo-recojos', label: 'Monitoreo de Pedidos', icon: <Navigation size={20} /> },
        { path: '/admin/rendicion-cuentas', label: 'Rendición & Caja', icon: <Receipt size={20} /> },
      ];
    }

    // Cliente View (or Comercio switched to Cliente view)
    return [
      { path: '/cliente/dashboard', label: 'Rastrear por Código', icon: <Search size={20} /> },
    ];
  };

  const menuItems = getMenuItems();

  const renderItem = (item: MenuItem) => {
    if (item.isAction) {
      return (
        <li key={item.label}>
          <button
            onClick={() => {
              if (item.actionKey === 'agendar' && onOpenAgendarModal) {
                onOpenAgendarModal();
                setMobileOpen(false);
              }
            }}
            title={item.label}
            className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 text-violet-400 hover:bg-violet-600/20 font-semibold cursor-pointer ${
              contraido ? 'justify-center px-0' : 'px-4 gap-4'
            }`}
          >
            <span className="shrink-0 relative">{item.icon}</span>
            {!contraido && <span className="font-medium text-sm">{item.label}</span>}
          </button>
        </li>
      );
    }

    return (
      <li key={item.path}>
        <NavLink
          to={item.path}
          onClick={() => setMobileOpen(false)}
          title={item.label}
          className={({ isActive }) => `
            w-full flex items-center py-3 rounded-xl transition-all duration-200 group cursor-pointer 
            ${contraido ? 'justify-center px-0' : 'px-4 gap-4'} 
            ${isActive ? 'bg-violet-600 text-white font-bold shadow-lg shadow-violet-500/20' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}
          `}
        >
          <span className="shrink-0 relative">{item.icon}</span>
          {!contraido && <span className="font-medium text-sm">{item.label}</span>}
        </NavLink>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] md:hidden"
        />
      )}

      {/* Sidebar Drawer - Sliding from Right on Mobile / Fixed on Desktop */}
      <aside
        className={`fixed top-0 h-[100dvh] bg-slate-950 border-l md:border-r border-slate-900 text-slate-100 flex flex-col z-[110] transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
        } right-0 md:left-0 ${contraido ? 'w-20' : 'w-64'}`}
      >
        {/* Header Logo & Mobile Close Button */}
        <div className={`h-16 flex items-center justify-between border-b border-slate-900 ${contraido ? 'justify-center px-2' : 'px-6'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-sm shrink-0 shadow-lg shadow-violet-500/20">
              AC
            </div>
            {!contraido && (
              <div className="flex flex-col truncate">
                <span className="font-bold tracking-tight text-white text-base">ALMAIN CURRIER</span>
                <span className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">
                  {isCurrentlyInClientView ? 'Vista Cliente Final' : user.rolNombre}
                </span>
              </div>
            )}
          </div>

          {/* Close button on Mobile Drawer */}
          {!contraido && (
            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* User Identity Banner (Full or Collapsed Avatar Circle) */}
        {contraido ? (
          <div className="my-4 flex justify-center">
            <div
              className="w-10 h-10 rounded-full border-2 border-cyan-400 bg-cyan-500/10 text-cyan-300 flex items-center justify-center font-extrabold text-xs shadow-md shadow-cyan-500/20"
              title={user.nombreCompleto}
            >
              {userInitials}
            </div>
          </div>
        ) : (
          <div className="p-4 mx-3 my-3 bg-slate-900/60 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              {user.nombreCompleto.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">
                {isCurrentlyInClientView ? user.nombreCompleto : (user.nombreComercial || user.nombreCompleto)}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user.correo}
              </p>
            </div>
          </div>
        )}

        {/* Upper Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {!contraido && (
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              {isCurrentlyInClientView ? 'Menú Compras Cliente' : 'Menú Principal'}
            </div>
          )}
          <ul className="space-y-1">
            {menuItems.map((item) => renderItem(item))}

            {/* Cerrar Sesión Button directly below Perfil Comercio */}
            <li key="logout-nav">
              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className={`w-full flex items-center py-3 rounded-xl transition-all duration-200 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold cursor-pointer ${
                  contraido ? 'justify-center px-0' : 'px-4 gap-4'
                }`}
              >
                <LogOut size={20} className="shrink-0" />
                {!contraido && <span className="font-medium text-sm">Cerrar Sesión</span>}
              </button>
            </li>
          </ul>
        </nav>

        {/* Fixed Bottom Footer Area */}
        <div className="p-3 border-t border-slate-900 space-y-2 bg-slate-950">
          
          {/* Upgrade CTA for ClienteFinal Users */}
          {user.rolNombre === 'ClienteFinal' && (
            <NavLink
              to="/comercio/upgrade"
              onClick={() => setMobileOpen(false)}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg transition-all cursor-pointer ${
                contraido ? 'justify-center px-0' : ''
              }`}
              title="Convertirme en Comercio (Agendar Envíos)"
            >
              <Store size={18} className="shrink-0" />
              {!contraido && (
                <div className="text-left">
                  <span className="font-bold text-xs block">¿Tienes un Negocio?</span>
                  <span className="text-[10px] text-violet-200 block">Activar Perfil Comercio</span>
                </div>
              )}
            </NavLink>
          )}

          {/* Mode Switcher for Comercio Users */}
          {isComercioAccount && (
            <button
              onClick={handleToggleMode}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gradient-to-r ${
                isCurrentlyInClientView
                  ? 'from-indigo-600/20 to-violet-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'from-amber-500/10 to-orange-500/10 text-amber-300 border border-amber-500/20'
              } hover:brightness-125 transition-all cursor-pointer ${
                contraido ? 'justify-center px-0' : ''
              }`}
              title={isCurrentlyInClientView ? 'Volver a Panel de Comercio' : 'Ir a Mis Compras como Cliente'}
            >
              <Repeat size={18} className="shrink-0" />
              {!contraido && (
                <div className="text-left">
                  <span className="font-bold text-xs block">
                    {isCurrentlyInClientView ? 'Modo Comercio' : 'Modo Cliente Final'}
                  </span>
                  <span className="text-[10px] opacity-80 block">
                    {isCurrentlyInClientView ? 'Gestionar mis envíos' : 'Ver compras realizadas'}
                  </span>
                </div>
              )}
            </button>
          )}

          {/* PWA App Install Button */}
          <InstallPwaButton variant={contraido ? "compact" : "full"} />

          {/* Square Toggle Button: Contraer (<) / Expandir (>) a Iconos (Visible on Mobile & Desktop) */}
          <button
            onClick={() => setContraido(!contraido)}
            className={`flex items-center justify-center rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer ${
              contraido ? 'w-12 h-12 mx-auto' : 'w-full py-2.5 px-3 gap-3'
            }`}
            title={contraido ? 'Expandir menú (>)' : 'Solo Mostrar Iconos (<)'}
          >
            {contraido ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!contraido && <span className="font-semibold text-xs">Solo Mostrar Iconos</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
