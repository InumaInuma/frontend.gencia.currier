import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { 
  Users, UserPlus, Bike, Shield, Search, RefreshCw, KeyRound, 
  AlertCircle, LogOut, ChevronDown 
} from 'lucide-react';
import { colaboradoresRepository, type IColaborador } from '../../../infrastructure/repositories/ColaboradoresRepository';
import { ModalNuevoColaborador } from '../../components/admin/ModalNuevoColaborador';
import { TablaColaboradores } from '../../components/admin/TablaColaboradores';

export const ColaboradoresAdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  const [colaboradores, setColaboradores] = useState<IColaborador[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState<'TODOS' | 'MOTORIZADO' | 'ADMIN'>('TODOS');
  const [filtroClave, setFiltroClave] = useState<'TODOS' | 'PENDIENTE' | 'ACTUALIZADA'>('TODOS');
  
  const [modalNuevoAbierto, setModalNuevoAbierto] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const cargarColaboradores = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await colaboradoresRepository.listar();
      setColaboradores(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los colaboradores.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarColaboradores();
  }, []);

  // Filtrado reactivo
  const colaboradoresFiltrados = colaboradores.filter((colab) => {
    const q = busqueda.toLowerCase();
    const coincideTexto = 
      colab.personaNombre.toLowerCase().includes(q) ||
      colab.correo.toLowerCase().includes(q) ||
      colab.numeroDocumento.toLowerCase().includes(q) ||
      (colab.placaVehiculo && colab.placaVehiculo.toLowerCase().includes(q));

    const coincideRol = 
      filtroRol === 'TODOS' ? true :
      filtroRol === 'MOTORIZADO' ? colab.idRol === 3 :
      colab.idRol === 1;

    const coincideClave = 
      filtroClave === 'TODOS' ? true :
      filtroClave === 'PENDIENTE' ? colab.debeCambiarClave :
      !colab.debeCambiarClave;

    return coincideTexto && coincideRol && coincideClave;
  });

  // Métricas
  const totalMotorizados = colaboradores.filter(c => c.idRol === 3).length;
  const totalAdmins = colaboradores.filter(c => c.idRol === 1).length;
  const totalPendientesClave = colaboradores.filter(c => c.debeCambiarClave).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Barra Lateral Izquierda */}
      <LeftSidebar
        contraido={contraido}
        setContraido={setContraido}
        movilAbierto={movilAbierto}
        setMovilAbierto={setMovilAbierto}
      />

      {/* Contenedor Principal */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          contraido ? 'md:ml-20' : 'md:ml-64'
        } pb-24 md:pb-8`}
      >
        {/* Header Superior Sticky */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Gestión de Colaboradores
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Administración de accesos, conductores y asignación de roles.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarColaboradores}
              disabled={cargando}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
              title="Actualizar lista"
            >
              <RefreshCw size={14} className={cargando ? 'animate-spin text-rose-400' : ''} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={() => setModalNuevoAbierto(true)}
              className="py-2 px-3 sm:px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus size={15} />
              <span>Nuevo Colaborador</span>
            </button>

            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 cursor-pointer transition-all"
            >
              <LogOut size={14} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* TARJETAS DE RESUMEN (KPIS) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                <Users size={22} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">{colaboradores.length}</div>
                <div className="text-[11px] font-medium text-slate-400">Total Registrados</div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Bike size={22} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">{totalMotorizados}</div>
                <div className="text-[11px] font-medium text-slate-400">Motorizados</div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Shield size={22} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">{totalAdmins}</div>
                <div className="text-[11px] font-medium text-slate-400">Administradores</div>
              </div>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <KeyRound size={22} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">{totalPendientesClave}</div>
                <div className="text-[11px] font-medium text-slate-400">Pendiente 1er Acceso</div>
              </div>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-center gap-3">
            {/* Buscador */}
            <div className="relative w-full md:flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, DNI, correo o placa..."
                className="w-full bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            </div>

            {/* Combos de Filtros */}
            <div className="flex w-full md:w-auto items-center gap-2">
              {/* Combo Rol */}
              <div className="relative flex-1 md:flex-initial">
                <select
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value as any)}
                  className="w-full md:w-auto bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer appearance-none transition-colors"
                >
                  <option value="TODOS" className="bg-slate-900 text-white">Todos los Roles ({colaboradores.length})</option>
                  <option value="MOTORIZADO" className="bg-slate-900 text-white">Motorizados ({totalMotorizados})</option>
                  <option value="ADMIN" className="bg-slate-900 text-white">Administradores ({totalAdmins})</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Combo Estado de Clave */}
              <div className="relative flex-1 md:flex-initial">
                <select
                  value={filtroClave}
                  onChange={(e) => setFiltroClave(e.target.value as any)}
                  className="w-full md:w-auto bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer appearance-none transition-colors"
                >
                  <option value="TODOS" className="bg-slate-900 text-white">Todas las Claves</option>
                  <option value="PENDIENTE" className="bg-slate-900 text-white">Pendiente 1er Acceso ({totalPendientesClave})</option>
                  <option value="ACTUALIZADA" className="bg-slate-900 text-white">Clave Actualizada</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-xs text-rose-300">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* CONTENIDO: COMPONENTE TABLA MODULAR */}
          {cargando ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Cargando colaboradores de Fragata Courier...</p>
            </div>
          ) : (
            <TablaColaboradores colaboradores={colaboradoresFiltrados} />
          )}
        </main>
      </div>

      {/* Navegación móvil inferior */}
      <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />

      {/* MODAL NUEVO COLABORADOR */}
      <ModalNuevoColaborador
        isOpen={modalNuevoAbierto}
        onClose={() => setModalNuevoAbierto(false)}
        onSuccess={() => {
          cargarColaboradores();
        }}
      />
    </div>
  );
};
