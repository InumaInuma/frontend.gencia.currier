import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import {
  useConductoresDisponibles,
  usePedidosPendientesRecojo,
  useAsignarRecojo
} from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import type { IPedido } from '../../../domain/models/IPedido';
import {
  Bike,
  Store,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LogOut,
  Package,
  CheckCircle2,
  AlertCircle,
  Phone,
  Search
} from 'lucide-react';

interface ComercioPendingGroup {
  idComercio: number;
  nombreComercial: string;
  razonSocial: string;
  ruc: string;
  direccionRecojo: string;
  referenciaRecojo?: string;
  telefonoComercio?: string;
  googleMapsUrl?: string;
  pedidos: IPedido[];
  totalMontoCobrar: number;
}

export const AsignarRecojosPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [openCommerceIds, setOpenCommerceIds] = useState<number[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedPedidoIds, setSelectedPedidoIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: conductores, isLoading: loadingConductores, refetch: refetchConductores } = useConductoresDisponibles();
  const { data: pendientes, isLoading: loadingPendientes, refetch: refetchPendientes } = usePedidosPendientesRecojo();
  const asignarMutation = useAsignarRecojo();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Group pending orders by Comercio
  const comercioGroups = useMemo<ComercioPendingGroup[]>(() => {
    if (!pendientes || pendientes.length === 0) return [];

    const groupMap: { [key: string]: ComercioPendingGroup } = {};

    pendientes.forEach((p) => {
      const idCom = p.idComercio || 0;
      const key = `comercio_pending_${idCom}_${p.nombreComercial || 'SinComercio'}`;

      if (!groupMap[key]) {
        groupMap[key] = {
          idComercio: idCom,
          nombreComercial: p.nombreComercial || p.nombreRemitente || 'Comercio Registrado',
          razonSocial: p.razonSocial || '',
          ruc: p.ruc || '20000000001',
          direccionRecojo: p.direccionRecojo || 'Dirección de recojo no especificada',
          referenciaRecojo: p.referenciaRecojo || 'Sin referencia',
          telefonoComercio: p.telefonoComercio || '-',
          googleMapsUrl: p.googleMapsUrlComercio || p.googleMapsUrl,
          pedidos: [],
          totalMontoCobrar: 0
        };
      }

      groupMap[key].pedidos.push(p);
      groupMap[key].totalMontoCobrar += p.montoCobrar || 0;
    });

    return Object.values(groupMap).filter((group) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        group.nombreComercial.toLowerCase().includes(term) ||
        group.direccionRecojo.toLowerCase().includes(term) ||
        group.pedidos.some(
          (p) =>
            p.codigoSeguimiento.toLowerCase().includes(term) ||
            p.nombreDestinatario.toLowerCase().includes(term) ||
            p.distritoNombre.toLowerCase().includes(term)
        )
      );
    });
  }, [pendientes, searchTerm]);

  // Open all accordions by default
  React.useEffect(() => {
    if (comercioGroups.length > 0 && openCommerceIds.length === 0) {
      setOpenCommerceIds(comercioGroups.map((g) => g.idComercio));
    }
  }, [comercioGroups]);

  const toggleAccordion = (id: number) => {
    setOpenCommerceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Driver Toggle Handler (Select / Deselect on click)
  const handleToggleDriver = (driverId: number) => {
    setSelectedDriverId((prev) => (prev === driverId ? null : driverId));
  };

  // Checkbox helpers
  const handleTogglePedido = (pedidoId: number) => {
    setSelectedPedidoIds((prev) =>
      prev.includes(pedidoId) ? prev.filter((id) => id !== pedidoId) : [...prev, pedidoId]
    );
  };

  const handleToggleComercioAll = (group: ComercioPendingGroup) => {
    const groupPedidoIds = group.pedidos.map((p) => p.id);
    const allSelected = groupPedidoIds.every((id) => selectedPedidoIds.includes(id));

    if (allSelected) {
      setSelectedPedidoIds((prev) => prev.filter((id) => !groupPedidoIds.includes(id)));
    } else {
      setSelectedPedidoIds((prev) => Array.from(new Set([...prev, ...groupPedidoIds])));
    }
  };

  // Submit Assignment
  const handleAsignarRuta = async () => {
    if (!selectedDriverId) {
      setFeedbackMsg({ type: 'error', text: 'Por favor, selecciona un motorizado para la ruta.' });
      return;
    }

    if (selectedPedidoIds.length === 0) {
      setFeedbackMsg({ type: 'error', text: 'Por favor, selecciona al menos un paquete para asignar.' });
      return;
    }

    setFeedbackMsg(null);

    try {
      await asignarMutation.mutateAsync({
        idConductor: selectedDriverId,
        idPedidos: selectedPedidoIds
      });

      setFeedbackMsg({
        type: 'success',
        text: `¡Ruta de recojo asignada exitosamente con ${selectedPedidoIds.length} paquetes para recojo!`
      });

      setSelectedPedidoIds([]);
      setSelectedDriverId(null);
      refetchPendientes();
      refetchConductores();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al asignar la ruta de recojo al motorizado.'
      });
    }
  };

  if (!user) return null;

  const totalPendientesCount = pendientes ? pendientes.length : 0;
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

      {/* Main Container */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          contraido ? 'md:ml-20' : 'md:ml-64'
        } pb-32 md:pb-24`}
      >
        {/* Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bike className="text-emerald-400 shrink-0" size={24} />
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Asignación de Rutas de Recojo
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Asigna los paquetes de los comercios a un motorizado para la recolección matutina.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                refetchConductores();
                refetchPendientes();
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

        {/* Content Body */}
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

          {/* Top KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold">
                <Package size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Pendientes de Recojo</span>
                <h3 className="text-xl font-extrabold text-white">{totalPendientesCount}</h3>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <Store size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Comercios a Visitar</span>
                <h3 className="text-xl font-extrabold text-white">{comercioGroups.length}</h3>
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

          {/* STEP 1: Driver Selection Grid */}
          <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Bike className="text-cyan-400" size={18} />
                Paso 1: Selecciona el Motorizado para la Ruta de Recojo
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
                No hay motorizados registrados o disponibles en este momento.
              </div>
            )}

            {!loadingConductores && conductores && conductores.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {conductores.map((driver) => {
                  const isSelected = selectedDriverId === driver.idConductor;
                  return (
                    <div
                      key={`driver_recojo_select_${driver.idConductor}`}
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

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por comercio, dirección o código..."
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
              />
            </div>

            {selectedPedidoIds.length > 0 && (
              <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                {selectedPedidoIds.length} paquetes seleccionados
              </span>
            )}
          </div>

          {/* STEP 2: Commerce Accordions List */}
          {loadingPendientes && (
            <div className="py-20 text-center text-slate-400 text-xs">Cargando paquetes pendientes...</div>
          )}

          {!loadingPendientes && comercioGroups.length === 0 && (
            <div className="py-20 px-4 bg-slate-900/30 border border-slate-900 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
              <h3 className="text-base font-bold text-white">¡No hay recojos pendientes!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Todos los paquetes agendados por los comercios ya cuentan con una ruta de recojo asignada.
              </p>
            </div>
          )}

          {!loadingPendientes &&
            comercioGroups.map((group) => {
              const isOpen = openCommerceIds.includes(group.idComercio);
              const groupPedidoIds = group.pedidos.map((p) => p.id);
              const isComercioFullySelected =
                groupPedidoIds.length > 0 &&
                groupPedidoIds.every((id) => selectedPedidoIds.includes(id));
              const isComercioPartiallySelected =
                groupPedidoIds.some((id) => selectedPedidoIds.includes(id)) &&
                !isComercioFullySelected;

              return (
                <div
                  key={`pending_comercio_${group.idComercio}`}
                  className={`bg-slate-900/40 border rounded-2xl overflow-hidden shadow-xl transition-all ${
                    isComercioFullySelected
                      ? 'border-emerald-500/40 bg-emerald-950/10'
                      : 'border-slate-900'
                  }`}
                >
                  {/* Commerce Group Header Bar */}
                  <div
                    onClick={() => toggleAccordion(group.idComercio)}
                    className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-violet-950/20 border-b border-slate-900 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Select All Checkbox for Commerce */}
                      <input
                        type="checkbox"
                        checked={isComercioFullySelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isComercioPartiallySelected;
                        }}
                        onChange={() => handleToggleComercioAll(group)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />

                      <div className="w-10 h-10 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-extrabold text-sm shrink-0">
                        <Store size={20} />
                      </div>

                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-extrabold text-white text-base sm:text-lg">
                            {group.nombreComercial}
                          </h3>
                          <span className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                            RUC: {group.ruc}
                          </span>
                        </div>

                        <p className="text-xs text-violet-300 flex items-center gap-1.5 mt-1">
                          <MapPin size={14} className="text-violet-400 shrink-0" />
                          {group.direccionRecojo}
                          {group.referenciaRecojo && (
                            <span className="text-slate-400 font-medium">({group.referenciaRecojo})</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {group.googleMapsUrl && (
                        <a
                          href={group.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                        >
                          <ExternalLink size={13} />
                          GPS Mapa
                        </a>
                      )}

                      <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                        {group.pedidos.length} {group.pedidos.length === 1 ? 'Paquete' : 'Paquetes'}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAccordion(group.idComercio);
                        }}
                        className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                      >
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Commerce Pickup Point Details */}
                  {isOpen && (
                    <div className="p-4 sm:p-6 space-y-4">
                      {group.telefonoComercio && (
                        <div className="text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2">
                          <Phone size={14} className="text-violet-400" />
                          <span>Teléfono de contacto comercio: <strong className="text-white">{group.telefonoComercio}</strong></span>
                        </div>
                      )}

                      {/* Package Table Component */}
                      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[700px]">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[11px] bg-slate-950/40">
                              <th className="p-3 w-10 text-center">Sel.</th>
                              <th className="p-3">Código Envío</th>
                              <th className="p-3">Destinatario / Celular</th>
                              <th className="p-3">Distrito & Dirección</th>
                              <th className="p-3">Notas / Ref.</th>
                              <th className="p-3 text-right">Cobro Delivery</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900">
                            {group.pedidos.map((pedido) => {
                              const isChecked = selectedPedidoIds.includes(pedido.id);

                              return (
                                <tr
                                  key={`pedido_recojo_${pedido.id}`}
                                  onClick={() => handleTogglePedido(pedido.id)}
                                  className={`cursor-pointer transition-colors hover:bg-slate-900/80 ${
                                    isChecked ? 'bg-emerald-500/10' : ''
                                  }`}
                                >
                                  <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleTogglePedido(pedido.id)}
                                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                                    />
                                  </td>

                                  <td className="p-3 font-mono font-bold text-violet-300">
                                    {pedido.codigoSeguimiento}
                                  </td>

                                  <td className="p-3">
                                    <span className="font-semibold text-white">{pedido.nombreDestinatario}</span>
                                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                      <Phone size={11} /> {pedido.telefonoDestinatario}
                                    </div>
                                  </td>

                                  <td className="p-3">
                                    <span className="font-bold text-slate-200">{pedido.distritoNombre}</span>
                                    <div className="text-[11px] text-slate-400 truncate">{pedido.direccionDestinatario}</div>
                                  </td>

                                  <td className="p-3 max-w-xs">
                                    {pedido.referenciaDestinatario && (
                                      <div className="text-[11px] text-slate-300 truncate">
                                        Ref: {pedido.referenciaDestinatario}
                                      </div>
                                    )}
                                    {pedido.observaciones && (
                                      <div className="text-[11px] text-slate-400 truncate">
                                        Obs: {pedido.observaciones}
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
                    </div>
                  )}
                </div>
              );
            })}
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
                      ? `Asignando ruta de recojo a: ${selectedDriver.nombreCompleto}`
                      : 'Por favor, selecciona un motorizado arriba para asignar.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleAsignarRuta}
                disabled={!selectedDriverId || selectedPedidoIds.length === 0 || asignarMutation.isPending}
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-violet-500/25 active:scale-95"
              >
                <Bike size={18} />
                Asignar Ruta de Recojo ({selectedPedidoIds.length})
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

export default AsignarRecojosPage;
