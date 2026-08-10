import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../application/context/AuthContext';
import { useAdminPedidos, useActualizarEstadoEntregaPedido } from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { EstadoPedidoEnum } from '../../../domain/enums/EstadoPedidoEnum';
import type { IPedido } from '../../../domain/models/IPedido';
import {
  CalendarClock,
  Search,
  RefreshCw,
  Phone,
  Store,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Bike,
  CheckSquare,
  Square,
  ArrowRight
} from 'lucide-react';

export const ReprogramacionesAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<string>('todos');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch all orders for Admin
  const { data: pedidos, isLoading, refetch } = useAdminPedidos();
  const actualizarEstadoMutation = useActualizarEstadoEntregaPedido();

  // Filter rescheduled orders
  const reprogramadosList = useMemo(() => {
    if (!pedidos) return [];
    return pedidos.filter((p: IPedido) => {
      const isReprogramado = p.idEstadosPedido === EstadoPedidoEnum.Reprogramado || p.idEstadosPedido === 14 || p.estadoNombre === 'Reprogramado';
      if (!isReprogramado) return false;

      // Filter by Driver name if selected
      if (selectedDriver !== 'todos') {
        const driverName = p.nombreConductor || 'Sin Asignar';
        if (driverName !== selectedDriver) return false;
      }

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.codigoSeguimiento.toLowerCase().includes(term) ||
        p.nombreDestinatario.toLowerCase().includes(term) ||
        (p.distritoNombre && p.distritoNombre.toLowerCase().includes(term)) ||
        (p.nombreComercial && p.nombreComercial.toLowerCase().includes(term)) ||
        (p.nombreConductor && p.nombreConductor.toLowerCase().includes(term))
      );
    });
  }, [pedidos, searchTerm, selectedDriver]);

  // Unique drivers list for filter
  const driversList = useMemo(() => {
    if (!pedidos) return [];
    const setNames = new Set<string>();
    pedidos.forEach((p: IPedido) => {
      if ((p.idEstadosPedido === 14 || p.estadoNombre === 'Reprogramado') && p.nombreConductor) {
        setNames.add(p.nombreConductor);
      }
    });
    return Array.from(setNames);
  }, [pedidos]);

  // Checkbox selection handlers
  const handleToggleSelectAll = () => {
    if (selectedIds.length === reprogramadosList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reprogramadosList.map((p) => p.id));
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle single re-queue package for delivery (Move from Reprogramado -> En Almacén / State 7)
  const handleReasignarPaquete = async (idPedido: number, codigo: string) => {
    setFeedbackMsg(null);
    try {
      await actualizarEstadoMutation.mutateAsync({
        idAsignacionEntrega: 0,
        idPedido,
        idEstado: EstadoPedidoEnum.EnAlmacen, // State 7
        observacion: 'Reactivado desde el módulo de Reprogramaciones para nueva ruta de entrega'
      });

      setFeedbackMsg({
        type: 'success',
        text: `¡El pedido ${codigo} ha sido enviado a ALMACÉN y ya está disponible en "Asignar Entregas"!`
      });
      setSelectedIds((prev) => prev.filter((i) => i !== idPedido));
      refetch();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error al reactivar el pedido.' });
    }
  };

  // Handle batch re-assignment
  const handleReasignarLote = async () => {
    if (selectedIds.length === 0) return;
    setFeedbackMsg(null);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          actualizarEstadoMutation.mutateAsync({
            idAsignacionEntrega: 0,
            idPedido: id,
            idEstado: EstadoPedidoEnum.EnAlmacen,
            observacion: 'Reactivado en lote desde el módulo de Reprogramaciones'
          })
        )
      );

      setFeedbackMsg({
        type: 'success',
        text: `¡Se enviaron ${selectedIds.length} pedidos a ALMACÉN! Ya están listos para ser asignados a la ruta de mañana.`
      });
      setSelectedIds([]);
      refetch();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error al procesar el lote de pedidos.' });
    }
  };

  if (!user) return null;

  const totalReprogramados = reprogramadosList.length;
  const comerciosAfectados = new Set(reprogramadosList.map((p: IPedido) => p.idComercio)).size;

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
        } pb-20 md:pb-8`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
              <CalendarClock size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                Módulo de Reprogramaciones
              </h1>
              <p className="text-xs text-slate-400">
                Visualiza qué motorizado reprogramó cada pedido y revólvelos a Almacén para asignar entregas mañana.
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualizar Lista</span>
          </button>
        </header>

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Feedback Messages */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 shadow-lg ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {feedbackMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <div className="flex-1">{feedbackMsg.text}</div>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-slate-950/40 border border-purple-500/30 rounded-3xl p-5 flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Envíos Reprogramados
                </span>
                <div className="text-3xl font-extrabold text-white font-mono">
                  {totalReprogramados} <span className="text-xs font-normal text-purple-300">pedidos</span>
                </div>
                <p className="text-[11px] text-slate-400">Listos para enviar al módulo "Asignar Entregas".</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center">
                <CalendarClock size={24} />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 flex items-center justify-between shadow-xl">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Comercios Impactados
                </span>
                <div className="text-3xl font-extrabold text-white font-mono">
                  {comerciosAfectados} <span className="text-xs font-normal text-slate-400">tiendas</span>
                </div>
                <p className="text-[11px] text-slate-400">Comercios con envíos agendados para reprogramación.</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
                <Store size={24} />
              </div>
            </div>
          </div>

          {/* Filter Bar & Batch Action */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar código, cliente, motorizado..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Driver Filter Dropdown */}
              <div className="w-full sm:w-auto flex items-center gap-2">
                <Bike size={16} className="text-slate-400 shrink-0" />
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full sm:w-auto bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="todos">Todos los Motorizados</option>
                  {driversList.map((driverName) => (
                    <option key={driverName} value={driverName}>
                      {driverName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Batch Re-assignment Button */}
            {selectedIds.length > 0 && (
              <button
                onClick={handleReasignarLote}
                disabled={actualizarEstadoMutation.isPending}
                className="w-full md:w-auto px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-600/30 active:scale-95"
              >
                <ArrowRight size={16} />
                Mandar {selectedIds.length} Seleccionado(s) a Asignar Entregas
              </button>
            )}
          </div>

          {/* Reprogrammed Orders Table */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[11px] bg-slate-950/80">
                  <th className="p-3.5 w-10 text-center">
                    <button
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                      title="Seleccionar Todos"
                    >
                      {reprogramadosList.length > 0 && selectedIds.length === reprogramadosList.length ? (
                        <CheckSquare size={16} className="text-purple-400" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Código Envío</th>
                  <th className="p-3.5">Comercio Remitente</th>
                  <th className="p-3.5">Motorizado Repartidor</th>
                  <th className="p-3.5">Cliente / Contacto</th>
                  <th className="p-3.5">Dirección & Distrito</th>
                  <th className="p-3.5 max-w-xs">Motivo / Observación Motorizado</th>
                  <th className="p-3.5 text-center">Monto Cobro</th>
                  <th className="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-900">
                {isLoading && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Cargando pedidos reprogramados...
                    </td>
                  </tr>
                )}

                {!isLoading && reprogramadosList.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-16 text-center text-slate-400 space-y-2">
                      <CalendarClock className="mx-auto text-slate-600" size={40} />
                      <p className="font-semibold text-slate-300">No hay envíos pendientes de reprogramación.</p>
                      <p className="text-xs text-slate-500">Todos los pedidos se encuentran entregados o en ruta activa.</p>
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  reprogramadosList.map((item: IPedido) => {
                    const isSelected = selectedIds.includes(item.id);

                    return (
                      <tr
                        key={`reprog_${item.id}`}
                        className={`hover:bg-slate-950/60 transition-colors ${
                          isSelected ? 'bg-purple-500/10' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleToggleSelect(item.id)}
                            className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                          >
                            {isSelected ? (
                              <CheckSquare size={16} className="text-purple-400" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        {/* Tracking Code */}
                        <td className="p-3.5">
                          <span className="font-mono font-bold text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                            {item.codigoSeguimiento}
                          </span>
                        </td>

                        {/* Commerce Sender */}
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{item.nombreComercial || 'Comercio'}</span>
                          {item.ruc && <span className="text-[11px] text-slate-400 font-mono">RUC: {item.ruc}</span>}
                        </td>

                        {/* Motorizado who Rescheduled */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              <Bike size={14} />
                            </div>
                            <div>
                              <span className="font-bold text-purple-300 block text-xs">
                                {item.nombreConductor || 'Asignado previamente'}
                              </span>
                              {item.telefonoConductor && (
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                  <Phone size={10} /> {item.telefonoConductor}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{item.nombreDestinatario}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone size={11} /> {item.telefonoDestinatario}
                          </span>
                        </td>

                        {/* Address */}
                        <td className="p-3.5 max-w-xs">
                          <span className="font-bold text-cyan-300 block">📍 {item.distritoNombre}</span>
                          <span className="text-slate-300 text-xs truncate block">{item.direccionDestinatario}</span>
                        </td>

                        {/* Driver Observation */}
                        <td className="p-3.5 max-w-xs">
                          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-2 text-xs text-purple-200 italic">
                            {item.observaciones || 'Cliente solicitó reprogramar entrega para el día de mañana.'}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="p-3.5 text-center font-mono font-bold text-slate-200">
                          {item.montoCobrar > 0 ? (
                            <span className="text-emerald-400">S/ {item.montoCobrar.toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-400">S/ 0.00 (Pagado)</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleReasignarPaquete(item.id, item.codigoSeguimiento)}
                            disabled={actualizarEstadoMutation.isPending}
                            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-600/20 active:scale-95 mx-auto"
                            title="Mandar a Almacén para que aparezca en el módulo Asignar Entregas para mañana"
                          >
                            <RotateCcw size={13} />
                            <span>Mandar a Asignar Entregas</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};
