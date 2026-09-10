import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import {
  useMonitoreoRecojosAdmin,
  useAdminPedidos,
  useEditarPedidoAdmin,
  useCancelarRecojoPedidoIndividual
} from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { TablaMonitoreoRecojo } from '../../components/TablaMonitoreoRecojo';
import { TablaPedidos } from '../../components/TablaPedidos';
import { ModalEditarPedidoAdmin } from '../../components/adminMonitoreo/ModalEditarPedidoAdmin';
import { ModalCancelarRecojoPedido } from '../../components/motorizadoRecojos/ModalCancelarRecojoPedido';
import type { IMonitoreoRecojo } from '../../../domain/models/IMonitoreoRecojo';
import type { IPedido } from '../../../domain/models/IPedido';
import { openWhatsAppWithPedidoMessage } from '../../../infrastructure/utils/whatsappMessageHelper';
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
  Store,
  Calendar,
  CheckCircle2,
  AlertCircle
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

interface ComercioGroup {
  idComercio: number;
  nombreComercial: string;
  razonSocial: string;
  ruc: string;
  direccionRecojo: string;
  referenciaRecojo: string;
  telefonoComercio: string;
  googleMapsUrl?: string;
  pedidos: IPedido[];
  totalMonto: number;
}

const getTodayFormatted = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export const MonitoreoRecojosPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [activeTab, setActiveTab] = useState<'comercios' | 'rutas'>('comercios');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<string>('todos');
  const [openRouteIds, setOpenRouteIds] = useState<number[]>([]);
  const [openCommerceIds, setOpenCommerceIds] = useState<number[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Toast feedback state
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [pedidoAEditar, setPedidoAEditar] = useState<IPedido | null>(null);
  const [pedidoACancelar, setPedidoACancelar] = useState<IMonitoreoRecojo | null>(null);

  // Filtros por Rango de Fechas
  const [fechaInicio, setFechaInicio] = useState<string>(getTodayFormatted());
  const [fechaFin, setFechaFin] = useState<string>(getTodayFormatted());

  // Hook 1: Pedidos por Comercio
  const { data: pedidos, isLoading: loadingPedidos, refetch: refetchPedidos, isRefetching: refetchingPedidos } = useAdminPedidos({
    fechaInicio: fechaInicio || undefined,
    fechaFin: fechaFin || undefined,
  });

  // Hook 2: Rutas por Motorizado
  const { data: monitoreoItems, isLoading: loadingMonitoreo, refetch: refetchMonitoreo, isRefetching: refetchingMonitoreo } = useMonitoreoRecojosAdmin({
    fechaInicio: fechaInicio || undefined,
    fechaFin: fechaFin || undefined,
  });

  // Mutations
  const editarPedidoMutation = useEditarPedidoAdmin();
  const cancelarPedidoMutation = useCancelarRecojoPedidoIndividual();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRefresh = () => {
    refetchPedidos();
    refetchMonitoreo();
  };

  const handleCopyCode = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiedCode(codigo);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareWhatsApp = (pedido: IPedido) => {
    openWhatsAppWithPedidoMessage({
      nombreDestinatario: pedido.nombreDestinatario,
      telefonoDestinatario: pedido.telefonoDestinatario,
      nombreComercio: pedido.nombreComercial,
      descripcionProducto: pedido.descripcionProducto,
      direccionDestinatario: pedido.direccionDestinatario,
      distritoNombre: pedido.distritoNombre,
      referenciaDestinatario: pedido.referenciaDestinatario,
      googleMapsUrl: pedido.googleMapsUrl,
      montoCobrar: pedido.montoCobrar,
      tarifaEnvio: pedido.tarifaEnvio,
      destinatarioPagaEnvio: pedido.destinatarioPagaEnvio,
      codigoSeguimiento: pedido.codigoSeguimiento,
    });
  };

  // Handle Edit Save from Modal
  const handleConfirmEditPedido = async (data: {
    idPedido: number;
    nombreDestinatario: string;
    telefonoDestinatario: string;
    direccionDestinatario: string;
    referenciaDestinatario?: string;
    observaciones?: string;
    montoCobrar: number;
    tarifaEnvio: number;
    destinatarioPagaEnvio: boolean;
    idEstadosPedido?: number;
  }) => {
    setFeedbackMsg(null);
    try {
      await editarPedidoMutation.mutateAsync(data);
      setFeedbackMsg({
        type: 'success',
        text: `Pedido #${data.idPedido} y tarifa de envío actualizados correctamente.`,
      });
      handleRefresh();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al actualizar el pedido.',
      });
      throw err;
    }
  };

  // Handle Cancel Confirm from Modal
  const handleConfirmCancelPedido = async (idPedido: number, motivo: string, observaciones: string) => {
    setFeedbackMsg(null);
    try {
      await cancelarPedidoMutation.mutateAsync({
        idPedido,
        motivo,
        observaciones
      });
      setFeedbackMsg({
        type: 'success',
        text: `El envío #${idPedido} fue cancelado correctamente.`,
      });
      handleRefresh();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al cancelar el envío.',
      });
      throw err;
    }
  };

  // Group orders by Comercio for Tab 1
  const comercioGroups = useMemo(() => {
    if (!pedidos || pedidos.length === 0) return [];

    const query = searchTerm.toLowerCase().trim();
    const groupMap: { [key: number]: ComercioGroup } = {};

    pedidos.forEach((p) => {
      const matchSearch =
        !query ||
        p.codigoSeguimiento.toLowerCase().includes(query) ||
        p.nombreDestinatario.toLowerCase().includes(query) ||
        p.telefonoDestinatario.toLowerCase().includes(query) ||
        (p.nombreComercial && p.nombreComercial.toLowerCase().includes(query)) ||
        (p.ruc && p.ruc.toLowerCase().includes(query)) ||
        (p.distritoNombre && p.distritoNombre.toLowerCase().includes(query));

      if (!matchSearch) return;

      const comId = p.idComercio || 0;
      if (!groupMap[comId]) {
        groupMap[comId] = {
          idComercio: comId,
          nombreComercial: p.nombreComercial || 'Comercio',
          razonSocial: p.razonSocial || '',
          ruc: p.ruc || '',
          direccionRecojo: p.direccionRecojo || '',
          referenciaRecojo: p.referenciaRecojo || '',
          telefonoComercio: p.telefonoComercio || '',
          googleMapsUrl: p.googleMapsUrlComercio || p.googleMapsUrl,
          pedidos: [],
          totalMonto: 0,
        };
      }
      groupMap[comId].pedidos.push(p);
      groupMap[comId].totalMonto += (p.montoCobrar || 0) + (p.tarifaEnvio || 0);
    });

    return Object.values(groupMap);
  }, [pedidos, searchTerm]);

  // Filtered Monitored Packages for Tab 2 (Single Unified Table)
  const filteredMonitoreoItems = useMemo(() => {
    if (!monitoreoItems || monitoreoItems.length === 0) return [];

    const query = searchTerm.toLowerCase().trim();

    return monitoreoItems.filter((item) => {
      if (selectedDriverFilter !== 'todos' && String(item.idConductor) !== selectedDriverFilter) {
        return false;
      }

      if (!query) return true;

      return (
        (item.nombreConductor && item.nombreConductor.toLowerCase().includes(query)) ||
        (item.nombreComercial && item.nombreComercial.toLowerCase().includes(query)) ||
        (item.codigoSeguimiento && item.codigoSeguimiento.toLowerCase().includes(query)) ||
        (item.nombreDestinatario && item.nombreDestinatario.toLowerCase().includes(query)) ||
        (item.distritoNombre && item.distritoNombre.toLowerCase().includes(query)) ||
        (item.direccionDestinatario && item.direccionDestinatario.toLowerCase().includes(query)) ||
        (item.telefonoDestinatario && item.telefonoDestinatario.includes(query)) ||
        (item.placaVehiculo && item.placaVehiculo.toLowerCase().includes(query)) ||
        (item.ruc && item.ruc.toLowerCase().includes(query))
      );
    });
  }, [monitoreoItems, searchTerm, selectedDriverFilter]);

  const uniqueDrivers = useMemo(() => {
    if (!monitoreoItems) return [];
    const map = new Map<number, string>();
    monitoreoItems.forEach((i) => map.set(i.idConductor, i.nombreConductor));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [monitoreoItems]);

  const toggleCommerceAccordion = (id: number) => {
    setOpenCommerceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalAgendadosCount = useMemo(() => {
    if (!pedidos) return 0;
    return pedidos.length;
  }, [pedidos]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Modal Editar Pedido Admin */}
      <ModalEditarPedidoAdmin
        pedido={pedidoAEditar}
        isOpen={!!pedidoAEditar}
        onClose={() => setPedidoAEditar(null)}
        onConfirmSave={handleConfirmEditPedido}
        isPending={editarPedidoMutation.isPending}
      />

      {/* Modal Cancelar Pedido Admin */}
      <ModalCancelarRecojoPedido
        pedido={pedidoACancelar}
        isOpen={!!pedidoACancelar}
        onClose={() => setPedidoACancelar(null)}
        onConfirmCancel={handleConfirmCancelPedido}
        isPending={cancelarPedidoMutation.isPending}
      />

      <LeftSidebar
        contraido={contraido}
        setContraido={setContraido}
        movilAbierto={movilAbierto}
        setMovilAbierto={setMovilAbierto}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          contraido ? 'md:ml-20' : 'md:ml-64'
        } pb-24`}
      >
        {/* Top Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Navigation size={20} />
            </div>
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Centro de Monitoreo de Pedidos
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Seguimiento operativo en tiempo real de comercios y choferes en ruta.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refetchingPedidos || refetchingMonitoreo}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw size={14} className={refetchingPedidos || refetchingMonitoreo ? 'animate-spin' : ''} />
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
          {/* Toast feedback */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 text-sm font-semibold shadow-lg ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-red-500/10 text-red-300 border-red-500/30'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="shrink-0 text-emerald-400" size={20} />
              ) : (
                <AlertCircle className="shrink-0 text-red-400" size={20} />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Store size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Comercios Activos</span>
                <h3 className="text-2xl font-extrabold text-white font-mono">{comercioGroups.length}</h3>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Package size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Paquetes Agendados</span>
                <h3 className="text-2xl font-extrabold text-white font-mono">{totalAgendadosCount}</h3>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 flex items-center justify-center shrink-0">
                <Bike size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Motorizados Activos</span>
                <h3 className="text-2xl font-extrabold text-yellow-300 font-mono">{uniqueDrivers.length}</h3>
              </div>
            </div>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex border-b border-slate-800 gap-2">
            <button
              onClick={() => setActiveTab('comercios')}
              className={`px-5 py-3 font-bold text-xs rounded-t-2xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'comercios'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border-t border-x border-purple-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-900 border-t border-x border-transparent'
              }`}
            >
              <Store size={16} />
              <span>1. Envíos Agendados por Comercio ({comercioGroups.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rutas')}
              className={`px-5 py-3 font-bold text-xs rounded-t-2xl transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'rutas'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border-t border-x border-purple-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-900 border-t border-x border-transparent'
              }`}
            >
              <Bike size={16} />
              <span>2. Rutas por Motorizado ({filteredMonitoreoItems.length})</span>
            </button>
          </div>

          {/* Global Controls & Filters */}
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Buscar comercio, RUC, cliente, chofer, código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-purple-500 transition-all font-medium"
              />
            </div>

            {/* Date Range & Driver Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                <Calendar size={14} className="text-purple-400 shrink-0" />
                <span className="text-slate-400 text-[11px]">Desde:</span>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="bg-transparent text-white font-medium outline-none cursor-pointer"
                />
                <span className="text-slate-400 text-[11px]">Hasta:</span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="bg-transparent text-white font-medium outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setFechaInicio(getTodayFormatted());
                  setFechaFin(getTodayFormatted());
                }}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-600/30 transition-all cursor-pointer"
              >
                Hoy
              </button>

              {activeTab === 'rutas' && uniqueDrivers.length > 0 && (
                <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
                  <Filter size={14} className="text-yellow-400 shrink-0" />
                  <select
                    value={selectedDriverFilter}
                    onChange={(e) => setSelectedDriverFilter(e.target.value)}
                    className="bg-transparent text-slate-200 outline-none font-medium cursor-pointer"
                  >
                    <option value="todos" className="bg-slate-900 text-white">Todos los Motorizados</option>
                    {uniqueDrivers.map((driver) => (
                      <option key={driver.id} value={String(driver.id)} className="bg-slate-900 text-white">
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: ENVÍOS AGENDADOS POR COMERCIO */}
          {activeTab === 'comercios' && (
            <div className="space-y-4">
              {loadingPedidos ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 animate-pulse text-xs font-bold">
                  Cargando envíos por comercio...
                </div>
              ) : comercioGroups.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                  <Store size={40} className="mx-auto text-slate-600 opacity-60" />
                  <h3 className="text-base font-bold text-white">No hay envíos agendados en este rango</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Intenta cambiar los filtros de fecha o búsqueda arriba para encontrar envíos de comercios.
                  </p>
                </div>
              ) : (
                comercioGroups.map((group) => {
                  const isOpen = openCommerceIds.length === 0 || openCommerceIds.includes(group.idComercio);
                  return (
                    <div
                      key={`comercio_${group.idComercio}`}
                      className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-xl transition-all"
                    >
                      {/* Commerce Header Accordion */}
                      <div
                        onClick={() => toggleCommerceAccordion(group.idComercio)}
                        className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/20 border-b border-slate-800 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-extrabold text-base shrink-0 shadow-lg">
                            {group.nombreComercial.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="font-extrabold text-white text-base sm:text-lg">
                                {group.nombreComercial}
                              </h3>
                              <span className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                                RUC: {group.ruc || 'S/R'}
                              </span>
                            </div>

                            <div className="text-xs text-purple-300 flex items-center gap-1.5 mt-1 flex-wrap">
                              <MapPin size={13} className="text-purple-400 shrink-0" />
                              <span>{group.direccionRecojo}</span>
                              {group.telefonoComercio && (
                                <span className="flex items-center gap-1 text-slate-400 ml-2 font-mono text-[11px]">
                                  <Phone size={11} className="text-slate-500" />
                                  {group.telefonoComercio}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-800/60 pt-3 sm:pt-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl font-mono">
                              {group.pedidos.length} {group.pedidos.length === 1 ? 'Pedido' : 'Pedidos'}
                            </span>
                            <span className="text-xs font-bold text-slate-400 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
                              Total: <strong className="text-emerald-400 font-extrabold">S/ {group.totalMonto.toFixed(2)}</strong>
                            </span>
                          </div>

                          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </div>
                      </div>

                      {/* Accordion Body */}
                      {isOpen && (
                        <div className="p-5 space-y-4 bg-slate-950/40">
                          {/* Pick Up Point Details Banner */}
                          <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <MapPin size={16} className="text-purple-400 shrink-0" />
                              <div>
                                <span className="text-slate-300 font-semibold block">PUNTOS DE RECOJO DE PAQUETES:</span>
                                <span className="text-slate-400">{group.direccionRecojo} {group.referenciaRecojo ? `(${group.referenciaRecojo})` : ''}</span>
                              </div>
                            </div>

                            {group.googleMapsUrl && (
                              <a
                                href={group.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-xl font-bold transition-all text-xs shrink-0 self-start sm:self-auto"
                              >
                                <Navigation size={13} />
                                <span>GPS Waze / Google Maps</span>
                              </a>
                            )}
                          </div>

                          {/* Orders Table with Admin Edit & Cancel Actions */}
                          <TablaPedidos
                            pedidos={group.pedidos}
                            onCopyCode={handleCopyCode}
                            onShareWhatsApp={handleShareWhatsApp}
                            copiedCode={copiedCode}
                            onEditarPedido={(p) => setPedidoAEditar(p)}
                            onCancelarPedido={(p) =>
                              setPedidoACancelar({
                                idPedido: p.id,
                                codigoSeguimiento: p.codigoSeguimiento,
                                idComercio: p.idComercio || 0,
                                nombreComercial: p.nombreComercial || '',
                                razonSocial: p.razonSocial || '',
                                ruc: p.ruc || '',
                                direccionRecojo: p.direccionRecojo || '',
                                nombreDestinatario: p.nombreDestinatario,
                                telefonoDestinatario: p.telefonoDestinatario,
                                direccionDestinatario: p.direccionDestinatario,
                                idDistritoDestinatario: 0,
                                distritoNombre: p.distritoNombre,
                                montoCobrar: p.montoCobrar,
                                idEstadosPedido: p.idEstadosPedido || 1,
                                estadoPedido: p.estadoNombre,
                                fechaRegistro: p.fechaRegistro,
                                idAsignacionRecojo: 0,
                                idConductor: 0,
                                nombreConductor: '',
                                placaVehiculo: '',
                                tipoVehiculo: '',
                                idEstadosRecojo: 0,
                                estadoAsignacion: '',
                                fechaAsignacion: ''
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: RUTAS POR MOTORIZADO (TABLA ÚNICA CONSOLIDADA) */}
          {activeTab === 'rutas' && (
            <div className="space-y-4">
              {loadingMonitoreo ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 animate-pulse text-xs font-bold">
                  Cargando monitoreo de rutas de motorizados...
                </div>
              ) : filteredMonitoreoItems.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                  <Truck size={40} className="mx-auto text-slate-600 opacity-60" />
                  <h3 className="text-base font-bold text-white">No hay envíos asignados en este rango</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {selectedDriverFilter !== 'todos' || searchTerm
                      ? 'No se encontraron paquetes asignados con los filtros aplicados.'
                      : "Asigna recojos en el módulo 'Asignar Recojos' para monitorear los paquetes en ruta aquí."}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-5 space-y-4">
                  {/* Table Header Summary */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 flex items-center justify-center shrink-0">
                        <Bike size={20} />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base">
                          Monitoreo de Envíos en Ruta
                        </h3>
                        <p className="text-xs text-slate-400">
                          Control operativo en tiempo real de todos los paquetes asignados a motorizados.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 px-3 py-1.5 rounded-xl font-mono">
                        {uniqueDrivers.length} {uniqueDrivers.length === 1 ? 'Motorizado' : 'Motorizados'}
                      </span>
                      <span className="text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-xl font-mono">
                        {filteredMonitoreoItems.length} {filteredMonitoreoItems.length === 1 ? 'Paquete' : 'Paquetes'}
                      </span>
                      <span className="text-xs font-bold text-slate-300 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
                        Total Cobro: <strong className="text-emerald-400 font-extrabold">S/ {filteredMonitoreoItems.reduce((acc, curr) => acc + (curr.montoCobrar || 0), 0).toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Tabla Única de Monitoreo de Envíos */}
                  <TablaMonitoreoRecojo
                    pedidos={filteredMonitoreoItems}
                    mostrarMotorizado={true}
                    mostrarComercio={true}
                    onCopyCode={handleCopyCode}
                    copiedCode={copiedCode}
                    onEditarPedido={(m) =>
                      setPedidoAEditar({
                        id: m.idPedido,
                        codigoSeguimiento: m.codigoSeguimiento,
                        idComercio: m.idComercio || 0,
                        nombreComercial: m.nombreComercial || '',
                        razonSocial: m.razonSocial || '',
                        ruc: m.ruc || '',
                        direccionRecojo: m.direccionRecojo || '',
                        nombreDestinatario: m.nombreDestinatario,
                        telefonoDestinatario: m.telefonoDestinatario,
                        direccionDestinatario: m.direccionDestinatario,
                        referenciaDestinatario: m.referenciaDestinatario,
                        distritoNombre: m.distritoNombre,
                        descripcionProducto: m.descripcionProducto,
                        observaciones: m.observaciones,
                        montoCobrar: m.montoCobrar,
                        tarifaEnvio: m.tarifaEnvio || 0,
                        destinatarioPagaEnvio: m.destinatarioPagaEnvio || false,
                        idEstadosPedido: m.idEstadosPedido || 1,
                        estadoNombre: m.estadoPedido,
                        fechaRegistro: m.fechaRegistro || '',
                        motivoCancelacion: m.motivoCancelacion,
                        observacionCancelacion: m.observacionCancelacion,
                      })
                    }
                    onCancelarPedido={(p) => setPedidoACancelar(p)}
                  />
                </div>
              )}
            </div>
          )}
        </main>

        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default MonitoreoRecojosPage;
