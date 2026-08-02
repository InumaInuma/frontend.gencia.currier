import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../application/context/AuthContext';
import { Home, FileText, Bell, Menu } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const userInitials = user.nombreCompleto
    ? user.nombreCompleto
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'US';

  const getProfilePath = () => {
    const role = user.rolNombre.toLowerCase();
    if (role === 'comercio') return '/comercio/perfil';
    if (role === 'motorizado') return '/motorizado/perfil';
    if (role === 'administrador' || role === 'admin') return '/admin/perfil';
    return '/cliente/perfil';
  };

  const getHistoryPath = () => {
    const role = user.rolNombre.toLowerCase();
    if (role === 'comercio') return '/comercio/pedidos';
    if (role === 'motorizado') return '/motorizado/entregas';
    return '/cliente/dashboard';
  };

  const isProfileActive = location.pathname.includes('/perfil');
  const isHistoryActive = location.pathname.includes('/pedidos') || location.pathname.includes('/entregas');
  const isHomeActive = location.pathname === '/dashboard' || location.pathname === '/comercio/dashboard' || location.pathname === '/cliente/dashboard';

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/90 backdrop-blur-md border-t border-slate-900 z-[100] md:hidden px-3 flex items-center justify-around">
      
      {/* 1. Avatar / Perfil (Izquierda con indicador verde) */}
      <button
        onClick={() => navigate(getProfilePath())}
        className={`relative flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer ${
          isProfileActive ? 'text-violet-400' : 'text-slate-400 hover:text-white'
        }`}
        title="Mi Perfil"
      >
        <div className="relative w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shadow-inner">
          {userInitials}
          {/* Status Online Indicator */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
        </div>
      </button>

      {/* 2. Documentos / Fichas */}
      <button
        onClick={() => navigate(getHistoryPath())}
        className={`flex flex-col items-center justify-center p-2 transition-all cursor-pointer ${
          isHistoryActive ? 'text-violet-400' : 'text-slate-400 hover:text-white'
        }`}
        title="Historial / Pedidos"
      >
        <FileText size={22} />
      </button>

      {/* 3. Inicio (Botón Central Flotante) */}
      <div className="relative -translate-y-4">
        <button
          onClick={() => navigate('/dashboard')}
          className={`w-14 h-14 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 border-4 border-slate-950 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 cursor-pointer ${
            isHomeActive ? 'ring-2 ring-emerald-400' : ''
          }`}
          title="Inicio"
        >
          <Home size={24} />
        </button>
      </div>

      {/* 4. Notificaciones */}
      <button
        onClick={() => alert('No tienes notificaciones pendientes.')}
        className="relative flex flex-col items-center justify-center p-2 text-slate-400 hover:text-white transition-all cursor-pointer"
        title="Notificaciones"
      >
        <Bell size={22} />
        {/* Notification Ping Badge */}
        <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
        <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* 5. Menú Hamburguesa (Derecha - Abre Drawer) */}
      <button
        onClick={onOpenMenu}
        className="flex flex-col items-center justify-center p-2 text-slate-400 hover:text-white transition-all cursor-pointer"
        title="Menú Principal"
      >
        <Menu size={22} />
      </button>

    </nav>
  );
};

export default MobileBottomNav;
