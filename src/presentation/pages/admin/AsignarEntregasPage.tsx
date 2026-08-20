import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import {
  usePedidosPendientesEntregaPorDistrito,
  useConductoresDisponibles,
  useAsignarEntrega
} from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import type { IMonitoreoRecojo } from '../../../domain/models/IMonitoreoRecojo';
import {
  Truck,
  MapPin,
  Package,
  Bike,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Phone,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const getTodayFormatted = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface DistrictPendingGroup {
  idDistrito: number;
  distritoNombre: string;
  comerciosCount: number;
  pedidos: IMonitoreoRecojo[];
  totalMontoCobrar: number;
}

export const AsignarEntregasPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [openDistrictIds, setOpenDistrictIds] = useState<number[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedPedidoIds, setSelectedPedidoIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState<string>(getTodayFormatted());
  const [fechaFin, setFechaFin] = useState<string>(getTodayFormatted());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: pendientesEntrega, isLoading: loadingPendientes, refetch: refetchPendientes } = usePedidosPendientesEntregaPorDistrito({ fechaInicio, fechaFin });
  const { data: conductores, isLoading: loadingConductores, refetch: refetchConductores } = useConductoresDisponibles();

  const asignarEntregaMutation = useAsignarEntrega();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Group warehouse pending packages by District (filtered by Date and Search)
  const districtGroups = useMemo<DistrictPendingGroup[]>(() => {
    if (!pendientesEntrega || pendientesEntrega.length === 0) return [];

    const dateFiltered = pendientesEntrega.filter((p) => {
      if (!p.fechaRegistro) return true;
      const pDateStr = p.fechaRegistro.split('T')[0];
      if (fechaInicio && pDateStr < fechaInicio) return false;
      if (fechaFin && pDateStr > fechaFin) return false;
      return true;
    });

    const groupMap: { [key: number]: DistrictPendingGroup } = {};

    dateFiltered.forEach((p) => {
      const idDist = p.idDistritoDestinatario || 0;
      if (!groupMap[idDist]) {
        groupMap[idDist] = {
          idDistrito: idDist,
          distritoNombre: p.distritoNombre || 'Distrito No Especificado',
          comerciosCount: 0,
          pedidos: [],
          totalMontoCobrar: 0
        };
      }

      groupMap[idDist].pedidos.push(p);
      groupMap[idDist].totalMontoCobrar += p.montoCobrar || 0;
    });

    // Calculate unique comercios per district
    return Object.values(groupMap).map((dist) => {
      const uniqueComercios = new Set(dist.pedidos.map((p) => p.idComercio));
      dist.comerciosCount = uniqueComercios.size;
      return dist;
    }).filter((dist) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        dist.distritoNombre.toLowerCase().includes(term) ||
        dist.pedidos.some(
          (p) =>
            p.nombreComercial.toLowerCase().includes(term) ||
            p.nombreDestinatario.toLowerCase().includes(term) ||
            p.codigoSeguimiento.toLowerCase().includes(term)
        )
      );
    });
  }, [pendientesEntrega, fechaInicio, fechaFin, searchTerm]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(districtGroups.length / pageSize));
  const paginatedDistrictGroups = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return districtGroups.slice(start, start + pageSize);
  }, [districtGroups, currentPage, pageSize]);

  // Open all district accordions by default
  React.useEffect(() => {
    if (districtGroups.length > 0 && openDistrictIds.length === 0) {
      setOpenDistrictIds(districtGroups.map((d) => d.idDistrito));
    }
  }, [districtGroups]);

  const toggleAccordion = (id: number) => {
    setOpenDistrictIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleDriver = (driverId: number) => {
    setSelectedDriverId((prev) => (prev === driverId ? null : driverId));
  };

  const handleTogglePedido = (pedidoId: number) => {
    setSelectedPedidoIds((prev) =>
      prev.includes(pedidoId) ? prev.filter((id) => id !== pedidoId) : [...prev, pedidoId]
    );
  };

  const handleToggleDistrictAll = (group: DistrictPendingGroup) => {
    const groupPedidoIds = group.pedidos.map((p) => p.idPedido);
    const allSelected = groupPedidoIds.every((id) => selectedPedidoIds.includes(id));

    if (allSelected) {
      setSelectedPedidoIds((prev) => prev.filter((id) => !groupPedidoIds.includes(id)));
    } else {
      setSelectedPedidoIds((prev) => Array.from(new Set([...prev, ...groupPedidoIds])));
    }
  };

  const handleAsignarEntrega = async () => {
    if (!selectedDriverId) {
      setFeedbackMsg({ type: 'error', text: 'Por favor, selecciona un motorizado para asignar las entregas.' });
      return;
    }

    if (selectedPedidoIds.length === 0) {
      setFeedbackMsg({ type: 'error', text: 'Por favor, selecciona al menos un paquete para entregar.' });
      return;
    }

    setFeedbackMsg(null);

    try {
      await asignarEntregaMutation.mutateAsync({
        idConductor: selectedDriverId,
        pedidoIds: selectedPedidoIds
      });

      setFeedbackMsg({
        type: 'success',
        text: `¡Ruta de entrega de última milla asignada exitosamente con ${selectedPedidoIds.length} paquetes!`
      });

      setSelectedPedidoIds([]);
      setSelectedDriverId(null);
      refetchPendientes();
      refetchConductores();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al asignar la ruta de entrega al motorizado.'
      });
    }
  };

  if (!user) return null;

  const totalPaquetesEnAlmacen = pendientesEntrega?.length ?? 0;
  const selectedDriver = conductores?.find((c) => c.idConductor === selectedDriverId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Left Sidebar */}
      <LeftSidebar
        contraido={contraido}
        setContraido={setContraido}
        movilAbierto={movilAbierto}
        setMovilAbierto={setMovilAbierto}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          contraido ? 'md:ml-20' : 'md:ml-64'
        } pb-32 md:pb-24`}
      >
        {/* Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="text-violet-400 shrink-0" size={24} />
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Asignar Entregas por Distritos (Última Milla)
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Agrupa envíos en Almacén por Distrito de Destino y organízalos para despacho.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchPendientes();
                refetchConductores();
              }}
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

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Feedback Toast */}
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

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold">
                <Package size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Paquetes en Almacén</span>
                <h3 className="text-xl font-extrabold text-white">{totalPaquetesEnAlmacen}</h3>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <MapPin size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Distritos con Envíos</span>
                <h3 className="text-xl font-extrabold text-white">{districtGroups.length}</h3>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                <Bike size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Motorizados Disponibles</span>
                <h3 className="text-xl font-extrabold text-white">{conductores?.length ?? 0}</h3>
              </div>
            </div>
          </div>

          {/* Driver Selection Grid */}
          <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Bike className="text-cyan-400" size={18} />
                Paso 1: Selecciona el Motorizado para la Entrega
              </h3>
              {selectedDriver && (
                <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
                  Seleccionado: {selectedDriver.nombreCompleto}
                </span>
              )}
            </div>

            {loadingConductores && (
              <div className="text-xs text-slate-400 py-4 text-center">Cargando motorizados disponibles...</div>
            )}

            {!loadingConductores && (!conductores || conductores.length === 0) && (
              <div className="text-xs text-slate-400 py-4 text-center bg-slate-950 rounded-xl">
                No hay motorizados disponibles registrados en este momento.
              </div>
            )}

            {!loadingConductores && conductores && conductores.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {conductores.map((driver) => {
                  const isSelected = selectedDriverId === driver.idConductor;
                  return (
                    <div
                      key={`driver_select_${driver.idConductor}`}
                      onClick={() => handleToggleDriver(driver.idConductor)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected
                              ? 'bg-cyan-500 text-slate-950'
                              : 'bg-slate-900 text-cyan-400 border border-slate-800'
                          }`}
                        >
                          <Bike size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs">{driver.nombreCompleto}</h4>
                          <span className="text-[11px] text-slate-400">
                            {driver.placaVehiculo} ({driver.tipoVehiculo})
                          </span>
                        </div>
                      </div>

                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Controls Bar: Search & Date Filters */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-900">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por distrito, comercio o cliente..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>

            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <Calendar size={13} className="text-violet-400" />
                <span className="text-slate-400 text-[11px] font-semibold">Desde:</span>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => {
                    setFechaInicio(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <Calendar size={13} className="text-violet-400" />
                <span className="text-slate-400 text-[11px] font-semibold">Hasta:</span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => {
                    setFechaFin(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const today = getTodayFormatted();
                  setFechaInicio(today);
                  setFechaFin(today);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer text-xs ${
                  fechaInicio === getTodayFormatted() && fechaFin === getTodayFormatted()
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Filtrar entregas del día de hoy"
              >
                Hoy
              </button>

              {(fechaInicio || fechaFin) && (
                <button
                  type="button"
                  onClick={() => {
                    setFechaInicio('');
                    setFechaFin('');
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs cursor-pointer"
                >
                  Ver Todos
                </button>
              )}

              {selectedPedidoIds.length > 0 && (
                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl ml-auto md:ml-0">
                  {selectedPedidoIds.length} seleccionados
                </span>
              )}
            </div>
          </div>

          {/* District Accordions List */}
          {loadingPendientes && (
            <div className="py-20 text-center text-slate-400 text-xs">Cargando paquetes en almacén...</div>
          )}

          {!loadingPendientes && districtGroups.length === 0 && (
            <div className="py-20 px-4 bg-slate-900/30 border border-slate-900 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
              <h3 className="text-base font-bold text-white">¡No hay paquetes pendientes en almacén!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Todos los envíos de los comercios se encuentran asignados o entregados.
              </p>
            </div>
          )}

          {!loadingPendientes &&
            paginatedDistrictGroups.map((group) => {
              const isOpen = openDistrictIds.includes(group.idDistrito);
              const groupPedidoIds = group.pedidos.map((p) => p.idPedido);
              const isDistrictFullySelected =
                groupPedidoIds.length > 0 &&
                groupPedidoIds.every((id) => selectedPedidoIds.includes(id));
              const isDistrictPartiallySelected =
                groupPedidoIds.some((id) => selectedPedidoIds.includes(id)) &&
                !isDistrictFullySelected;

              return (
                <div
                  key={`district_group_${group.idDistrito}`}
                  className={`bg-slate-900/40 border rounded-2xl overflow-hidden shadow-xl transition-all ${
                    isDistrictFullySelected
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-900'
                  }`}
                >
                  {/* District Header */}
                  <div
                    onClick={() => toggleAccordion(group.idDistrito)}
                    className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-violet-950/20 border-b border-slate-900 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isDistrictFullySelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isDistrictPartiallySelected;
                        }}
                        onChange={() => handleToggleDistrictAll(group)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />

                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <MapPin size={20} />
                      </div>

                      <div>
                        <h3 className="font-extrabold text-white text-base sm:text-lg flex items-center gap-2">
                          📍 {group.distritoNombre}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {group.comerciosCount} {group.comerciosCount === 1 ? 'Comercio' : 'Comercios'} distintos — Cobro acumulado: S/ {group.totalMontoCobrar.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {group.pedidos.length} {group.pedidos.length === 1 ? 'Paquete' : 'Paquetes'}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAccordion(group.idDistrito);
                        }}
                        className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                      >
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* District Package Table Body */}
                  {isOpen && (
                    <div className="p-4 sm:p-6 overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[11px] bg-slate-950/40">
                            <th className="p-3 w-10 text-center">Sel.</th>
                            <th className="p-3">Código</th>
                            <th className="p-3">Comercio Remitente</th>
                            <th className="p-3">Destinatario / Teléfono</th>
                            <th className="p-3">Dirección & Ref.</th>
                            <th className="p-3 text-right">Cobro</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {group.pedidos.map((pedido) => {
                            const isSelected = selectedPedidoIds.includes(pedido.idPedido);
                            return (
                              <tr
                                key={`pedido_district_${pedido.idPedido}`}
                                onClick={() => handleTogglePedido(pedido.idPedido)}
                                className={`cursor-pointer transition-colors hover:bg-slate-900/80 ${
                                  isSelected ? 'bg-emerald-500/10' : ''
                                }`}
                              >
                                <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleTogglePedido(pedido.idPedido)}
                                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                                  />
                                </td>

                                <td className="p-3 font-mono font-bold text-violet-300">
                                  {pedido.codigoSeguimiento}
                                </td>

                                <td className="p-3">
                                  <span className="font-bold text-white">{pedido.nombreComercial}</span>
                                  <div className="text-[11px] text-slate-400 font-mono">RUC: {pedido.ruc}</div>
                                </td>

                                <td className="p-3">
                                  <span className="font-semibold text-white">{pedido.nombreDestinatario}</span>
                                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <Phone size={11} /> {pedido.telefonoDestinatario}
                                  </div>
                                </td>

                                <td className="p-3 max-w-xs">
                                  <div className="text-white font-medium truncate">{pedido.direccionDestinatario}</div>
                                  {pedido.referenciaDestinatario && (
                                    <div className="text-[11px] text-slate-400 truncate">
                                      Ref: {pedido.referenciaDestinatario}
                                    </div>
                                  )}
                                </td>

                                <td className="p-3 text-right font-mono font-extrabold text-emerald-400">
                                  S/ {pedido.montoCobrar.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

          {/* Pagination Controls */}
          {!loadingPendientes && districtGroups.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-900 text-xs">
              <span className="text-slate-400 font-medium">
                Mostrando {Math.min((currentPage - 1) * pageSize + 1, districtGroups.length)} a{' '}
                {Math.min(currentPage * pageSize, districtGroups.length)} de{' '}
                <strong className="text-white">{districtGroups.length}</strong> distritos con entregas pendientes
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  title="Página anterior"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl font-mono text-violet-300 font-bold">
                  {currentPage} / {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
                  title="Página siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Floating Action Bar */}
        {selectedPedidoIds.length > 0 && (
          <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-4 transition-all">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-300 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <span className="font-bold text-white text-sm">
                    {selectedPedidoIds.length} {selectedPedidoIds.length === 1 ? 'Paquete Seleccionado' : 'Paquetes Seleccionados'}
                  </span>
                  <p className="text-cyan-400 font-semibold">
                    {selectedDriver
                      ? `Asignando ruta de entrega a: ${selectedDriver.nombreCompleto}`
                      : 'Por favor, selecciona un motorizado arriba para despachar.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleAsignarEntrega}
                disabled={!selectedDriverId || selectedPedidoIds.length === 0 || asignarEntregaMutation.isPending}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-violet-500/25 active:scale-95"
              >
                <Truck size={18} />
                Asignar Ruta de Entrega ({selectedPedidoIds.length})
              </button>
            </div>
          </div>
        )}

        {/* Mobile Bottom Nav */}
        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default AsignarEntregasPage;
