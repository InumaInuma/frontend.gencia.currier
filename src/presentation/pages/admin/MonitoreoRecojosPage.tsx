import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { useMonitoreoRecojosAdmin } from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { TablaMonitoreoRecojo } from '../../components/TablaMonitoreoRecojo';
import type { IMonitoreoRecojo } from '../../../domain/models/IMonitoreoRecojo';
import {
  Bike,
  Navigation,
  MapPin,
  ExternalLink,
  Phone,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LogOut,
  Search,
  Clock,
  Truck,
  Filter,
  UserCheck,
  Package,
  Store
} from 'lucide-react';

// ─────────────────────────────────────────────
// Helpers & Sub-Types
// ─────────────────────────────────────────────

interface GroupedByComercio {
  idComercio: number;
  nombreComercial: string;
  ruc: string;
  direccionRecojo: string;
  referenciaRecojo?: string;
  telefonoComercio?: string;
  googleMapsUrlComercio?: string;
  pedidos: IMonitoreoRecojo[];
}

interface GroupedDriverRoute {
  idAsignacionRecojo: number;
  idConductor: number;
  nombreConductor: string;
  telefonoConductor?: string;
  placaVehiculo: string;
  tipoVehiculo: string;
  estadoAsignacion: string;
  fechaAsignacion: string;
  comercios: GroupedByComercio[];
  totalPedidos: number;
}



// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export const MonitoreoRecojosPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<string>('todos');
  const [openRouteIds, setOpenRouteIds] = useState<number[]>([]);

  const { data: monitoreoItems, isLoading, refetch } = useMonitoreoRecojosAdmin();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Group by Assignment + Driver → Comercio → Pedidos
  const driverRoutes = useMemo<GroupedDriverRoute[]>(() => {
    if (!monitoreoItems || monitoreoItems.length === 0) return [];

    const routeMap: Record<string, GroupedDriverRoute> = {};

    monitoreoItems.forEach((item) => {
      const routeKey = `conductor_${item.idConductor}`;

      if (!routeMap[routeKey]) {
        routeMap[routeKey] = {
          idAsignacionRecojo: item.idAsignacionRecojo,
          idConductor: item.idConductor,
          nombreConductor: item.nombreConductor,
          telefonoConductor: item.telefonoConductor,
          placaVehiculo: item.placaVehiculo,
          tipoVehiculo: item.tipoVehiculo,
          estadoAsignacion: item.estadoAsignacion,
          fechaAsignacion: item.fechaAsignacion,
          comercios: [],
          totalPedidos: 0
        };
      }

      let comGroup = routeMap[routeKey].comercios.find((c) => c.idComercio === item.idComercio);
      if (!comGroup) {
        comGroup = {
          idComercio: item.idComercio,
          nombreComercial: item.nombreComercial,
          ruc: item.ruc,
          direccionRecojo: item.direccionRecojo,
          referenciaRecojo: item.referenciaRecojo,
          telefonoComercio: item.telefonoComercio,
          googleMapsUrlComercio: item.googleMapsUrlComercio,
          pedidos: []
        };
        routeMap[routeKey].comercios.push(comGroup);
      }

      if (!comGroup.pedidos.some((p) => p.idPedido === item.idPedido)) {
        comGroup.pedidos.push(item);
        routeMap[routeKey].totalPedidos += 1;
      }
    });

    return Object.values(routeMap).filter((route) => {
      if (selectedDriverFilter !== 'todos' && route.idConductor.toString() !== selectedDriverFilter) return false;
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        route.nombreConductor.toLowerCase().includes(term) ||
        route.placaVehiculo.toLowerCase().includes(term) ||
        route.comercios.some(
          (c) =>
            c.nombreComercial.toLowerCase().includes(term) ||
            c.pedidos.some(
              (p) =>
                p.codigoSeguimiento.toLowerCase().includes(term) ||
                p.nombreDestinatario.toLowerCase().includes(term)
            )
        )
      );
    });
  }, [monitoreoItems, searchTerm, selectedDriverFilter]);

  // Open all route accordions by default
  React.useEffect(() => {
    if (driverRoutes.length > 0) {
      setOpenRouteIds(driverRoutes.map((r) => r.idConductor));
    }
  }, [driverRoutes.length]);

  const toggleRouteAccordion = (id: number) => {
    setOpenRouteIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const uniqueDrivers = useMemo(() => {
    if (!monitoreoItems) return [];
    const map = new Map<number, string>();
    monitoreoItems.forEach((i) => map.set(i.idConductor, i.nombreConductor));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [monitoreoItems]);

  if (!user) return null;

  const totalAssignedPackages = monitoreoItems?.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <LeftSidebar
        contraido={contraido}
        setContraido={setContraido}
        movilAbierto={movilAbierto}
        setMovilAbierto={setMovilAbierto}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${contraido ? 'md:ml-20' : 'md:ml-64'} pb-24`}>
        {/* Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="text-violet-400 shrink-0" size={24} />
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Monitoreo de Recojos Asignados
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Seguimiento de comercios y paquetes asignados a cada motorizado.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 cursor-pointer transition-all"
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                <Bike size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Rutas Activas</span>
                <h3 className="text-xl font-extrabold text-white">{driverRoutes.length}</h3>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Paquetes Asignados</span>
                <h3 className="text-xl font-extrabold text-white">{totalAssignedPackages}</h3>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                <UserCheck size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Motorizados en Ruta</span>
                <h3 className="text-xl font-extrabold text-white">{uniqueDrivers.length}</h3>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Buscar por motorizado, comercio o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={16} className="text-slate-400 shrink-0" />
              <select
                value={selectedDriverFilter}
                onChange={(e) => setSelectedDriverFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 cursor-pointer w-full sm:w-auto"
              >
                <option value="todos">Todos los Motorizados</option>
                {uniqueDrivers.map((d) => (
                  <option key={d.id} value={d.id.toString()}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="py-20 text-center text-slate-400 text-xs">Cargando monitoreo de recojos...</div>
          )}

          {/* Empty */}
          {!isLoading && driverRoutes.length === 0 && (
            <div className="py-20 px-4 bg-slate-900/30 border border-slate-900 rounded-3xl text-center space-y-3">
              <Truck className="mx-auto text-slate-600" size={48} />
              <h3 className="text-base font-bold text-white">No hay rutas de recojo asignadas activas</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Asigna recojos en el módulo <span className="text-violet-400 font-bold">Asignar Recojos</span> para ver el seguimiento aquí.
              </p>
            </div>
          )}

          {/* Route Cards */}
          {!isLoading && driverRoutes.map((route) => {
            const isOpen = openRouteIds.includes(route.idConductor);

            return (
              <div
                key={`route_conductor_${route.idConductor}`}
                className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl"
              >
                {/* Driver Banner */}
                <div
                  onClick={() => toggleRouteAccordion(route.idConductor)}
                  className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-violet-950/30 border-b border-slate-900 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shrink-0">
                      <Bike size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-extrabold text-white text-base md:text-lg">{route.nombreConductor}</h3>
                        <span className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-md">
                          {route.placaVehiculo} ({route.tipoVehiculo})
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 flex-wrap">
                        {route.telefonoConductor && (
                          <span className="flex items-center gap-1">
                            <Phone size={13} className="text-slate-500" />
                            {route.telefonoConductor}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-slate-500" />
                          Asignado: {new Date(route.fechaAsignacion).toLocaleString('es-PE')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${
                        route.estadoAsignacion.toLowerCase().includes('completado')
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : route.estadoAsignacion.toLowerCase().includes('camino')
                          ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        Ruta: {route.estadoAsignacion}
                      </span>
                      <span className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 px-3 py-1 rounded-full font-bold">
                        {route.comercios.length} {route.comercios.length === 1 ? 'Comercio' : 'Comercios'}
                      </span>
                      <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
                        {route.totalPedidos} {route.totalPedidos === 1 ? 'Pedido' : 'Pedidos'}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRouteAccordion(route.idConductor);
                      }}
                      className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                    >
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Comercios Accordion Body */}
                {isOpen && (
                  <div className="divide-y divide-slate-900">
                    {route.comercios.map((comercio) => (
                      <div key={`com_${comercio.idComercio}`} className="p-4 sm:p-6 space-y-4">
                        {/* Comercio Sub-Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                              <Store size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-white">{comercio.nombreComercial}</h4>
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                                  RUC: {comercio.ruc}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <MapPin size={12} className="text-violet-400 shrink-0" />
                                {comercio.direccionRecojo}
                                {comercio.referenciaRecojo && (
                                  <span className="text-slate-500">({comercio.referenciaRecojo})</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {comercio.telefonoComercio && (
                              <span className="text-xs text-slate-300 font-bold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                                📞 {comercio.telefonoComercio}
                              </span>
                            )}
                            {comercio.googleMapsUrlComercio && (
                              <a
                                href={comercio.googleMapsUrlComercio}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                              >
                                <ExternalLink size={13} />
                                GPS Mapa
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Packages Table */}
                        <div className="overflow-hidden">
                          <TablaMonitoreoRecojo pedidos={comercio.pedidos} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </main>

        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default MonitoreoRecojosPage;
