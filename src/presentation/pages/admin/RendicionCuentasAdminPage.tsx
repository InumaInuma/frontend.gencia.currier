import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import {
  useLiquidacionesResumenAdmin,
  useLiquidacionDetalleMotorizado,
  useConfirmarRendicionDinero
} from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import type { ILiquidacionResumen } from '../../../domain/models/ILiquidacionResumen';
import {
  DollarSign,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Search,
  Bike,
  Receipt,
  Eye,
  ArrowLeft,
  Calendar,
  Wallet,
  Building2,
  XCircle,
  Clock,
  Package,
  Phone,
  MapPin
} from 'lucide-react';

const getTodayFormatted = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const RendicionCuentasAdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filtro Global de Rango de Fechas (por defecto en HOY)
  const [fechaInicio, setFechaInicio] = useState<string>(getTodayFormatted());
  const [fechaFin, setFechaFin] = useState<string>(getTodayFormatted());

  // Motorizado seleccionado para Vista Detalle Completa (NO MODAL)
  const [selectedConductor, setSelectedConductor] = useState<ILiquidacionResumen | null>(null);

  // Query de resumen global por fechas
  const { data: resumenList, isLoading, refetch } = useLiquidacionesResumenAdmin({
    fechaInicio: fechaInicio || undefined,
    fechaFin: fechaFin || undefined,
  });

  // Query de detalle del motorizado seleccionado por fechas
  const { data: detalleList, isLoading: isLoadingDetalle } = useLiquidacionDetalleMotorizado(
    selectedConductor ? selectedConductor.idConductor : null,
    {
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
    }
  );

  const confirmarRendicionMutation = useConfirmarRendicionDinero();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Resumen filtrado por término de búsqueda
  const filteredResumen = useMemo(() => {
    if (!resumenList) return [];
    if (!searchTerm.trim()) return resumenList;
    const term = searchTerm.toLowerCase();
    return resumenList.filter(
      (item) =>
        item.nombreConductor.toLowerCase().includes(term) ||
        item.placaVehiculo.toLowerCase().includes(term) ||
        (item.telefonoConductor && item.telefonoConductor.includes(term))
    );
  }, [resumenList, searchTerm]);

  // Totales globales consolidados
  const totalesGlobales = useMemo(() => {
    if (!resumenList) return { efectivoPendiente: 0, efectivoRendido: 0, yapeDigital: 0, transferencia: 0, totalGeneral: 0 };
    return resumenList.reduce(
      (acc, item) => {
        acc.efectivoPendiente += item.montoEfectivoPendiente;
        acc.efectivoRendido += item.montoEfectivoRendido;
        acc.yapeDigital += item.montoYapeDigital;
        acc.transferencia += item.montoTransferencia || 0;
        acc.totalGeneral += item.montoTotalCobrado;
        return acc;
      },
      { efectivoPendiente: 0, efectivoRendido: 0, yapeDigital: 0, transferencia: 0, totalGeneral: 0 }
    );
  }, [resumenList]);

  // Métricas específicas del detalle del motorizado seleccionado
  const resumenDetalle = useMemo(() => {
    if (!detalleList) return { totalAsignados: 0, entregados: 0, noEntregados: 0, efectivo: 0, yape: 0, transferencia: 0, total: 0 };
    return detalleList.reduce(
      (acc, item) => {
        acc.totalAsignados++;
        if (item.idEstadosPedido === 11) {
          acc.entregados++;
        } else {
          acc.noEntregados++;
        }
        acc.efectivo += item.montoEfectivo || 0;
        acc.yape += item.montoYape || 0;
        acc.transferencia += item.montoTransferencia || 0;
        acc.total += item.montoTotalPedido || 0;
        return acc;
      },
      { totalAsignados: 0, entregados: 0, noEntregados: 0, efectivo: 0, yape: 0, transferencia: 0, total: 0 }
    );
  }, [detalleList]);

  const handleConfirmarRendicion = async (idConductor: number, nombreMotorizado: string) => {
    if (!window.confirm(`¿Confirmas que el motorizado ${nombreMotorizado} ha entregado físicamente todo el efectivo recaudado al almacén?`)) {
      return;
    }
    setFeedbackMsg(null);
    try {
      await confirmarRendicionMutation.mutateAsync(idConductor);
      setFeedbackMsg({
        type: 'success',
        text: `¡Rendición confirmada! Se registró la recepción física del dinero en efectivo de ${nombreMotorizado}.`
      });
      refetch();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al confirmar la recepción de dinero.'
      });
    }
  };

  if (!user) return null;

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
        } pb-28 md:pb-12`}
      >
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedConductor ? (
              <button
                onClick={() => setSelectedConductor(null)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Volver a Liquidaciones</span>
              </button>
            ) : (
              <Receipt className="text-emerald-400 shrink-0" size={24} />
            )}

            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                {selectedConductor
                  ? `Detalle de Rendición: ${selectedConductor.nombreConductor}`
                  : 'Rendición de Cuentas & Arqueo de Caja'}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {selectedConductor
                  ? `Placa: ${selectedConductor.placaVehiculo} — Revisa paquetes entregados, no entregados y método de cobro.`
                  : 'Recepción física de dinero cobrado en contra-entrega por los motorizados.'}
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

          {/* Barra de Controles de Rango de Fechas (Compartida para Resumen y Detalle) */}
          <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Calendar size={16} className="text-emerald-400" />
              <span className="font-bold text-white">Filtrar Liquidaciones por Fecha:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span className="text-slate-400 text-[11px] font-semibold">Desde:</span>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <span className="text-slate-400 text-[11px] font-semibold">Hasta:</span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
                />
              </div>

              <button
                onClick={() => {
                  const today = getTodayFormatted();
                  setFechaInicio(today);
                  setFechaFin(today);
                }}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer text-xs ${
                  fechaInicio === getTodayFormatted() && fechaFin === getTodayFormatted()
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Filtrar liquidaciones de hoy"
              >
                Hoy
              </button>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              VISTA 1: RESUMEN GENERAL DE TODOS LOS MOTORIZADOS (SI NO HAY MOTORIZADO SELECCIONADO)
             ════════════════════════════════════════════════════════════════════════ */}
          {!selectedConductor ? (
            <>
              {/* Metric Cards Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Efectivo Pendiente */}
                <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider block">
                      Efectivo por Recaudar
                    </span>
                    <h3 className="text-xl font-mono font-extrabold text-amber-400">
                      S/ {totalesGlobales.efectivoPendiente.toFixed(2)}
                    </h3>
                    <span className="text-[10px] text-slate-400 block">En bolsillo de motorizados</span>
                  </div>
                </div>

                {/* Efectivo Ya Rendido */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider block">
                      Efectivo Liquidado
                    </span>
                    <h3 className="text-xl font-mono font-extrabold text-emerald-400">
                      S/ {totalesGlobales.efectivoRendido.toFixed(2)}
                    </h3>
                    <span className="text-[10px] text-slate-400 block">Entregado en almacén</span>
                  </div>
                </div>

                {/* Total Yape Digital */}
                <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold">
                    <QrCode size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] text-purple-300 font-bold uppercase tracking-wider block">
                      Cobrado Yape/Plin
                    </span>
                    <h3 className="text-xl font-mono font-extrabold text-purple-400">
                      S/ {totalesGlobales.yapeDigital.toFixed(2)}
                    </h3>
                    <span className="text-[10px] text-slate-400 block">Transferencias digitales</span>
                  </div>
                </div>

                {/* Total General */}
                <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <span className="text-[11px] text-cyan-300 font-bold uppercase tracking-wider block">
                      Total Recaudación
                    </span>
                    <h3 className="text-xl font-mono font-extrabold text-white">
                      S/ {totalesGlobales.totalGeneral.toFixed(2)}
                    </h3>
                    <span className="text-[10px] text-slate-400 block">Efectivo + Yape combinado</span>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por motorizado o placa..."
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Loading */}
              {isLoading && (
                <div className="py-20 text-center text-slate-400 text-xs">Cargando arqueo de liquidaciones...</div>
              )}

              {/* Empty */}
              {!isLoading && (!resumenList || resumenList.length === 0) && (
                <div className="py-20 px-4 bg-slate-900/30 border border-slate-900 rounded-3xl text-center space-y-3">
                  <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
                  <h3 className="text-base font-bold text-white">¡No hay entregas registradas en las fechas seleccionadas!</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Prueba cambiando las fechas para inspeccionar la rendición de cuentas de días anteriores.
                  </p>
                </div>
              )}

              {/* Summary Table */}
              {!isLoading && resumenList && resumenList.length > 0 && (
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[950px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] bg-slate-950/80">
                        <th className="p-3.5">Motorizado / Repartidor</th>
                        <th className="p-3.5 text-center">Rendimiento Entregas</th>
                        <th className="p-3.5 text-right text-amber-400">Efectivo Pendiente</th>
                        <th className="p-3.5 text-right text-emerald-400">Efectivo Liquidado</th>
                        <th className="p-3.5 text-right text-purple-400">Total Yape/Plin</th>
                        <th className="p-3.5 text-right text-white">Total Recaudado</th>
                        <th className="p-3.5 text-center">Estado Rendición</th>
                        <th className="p-3.5 text-center">Acciones Administrador</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {filteredResumen.map((item) => {
                        const tienePendiente = item.montoEfectivoPendiente > 0;

                        return (
                          <tr
                            key={`liquidation_row_${item.idConductor}`}
                            className={`transition-colors hover:bg-slate-900/80 ${
                              tienePendiente ? 'bg-amber-950/10' : ''
                            }`}
                          >
                            {/* Driver details */}
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                                  <Bike size={18} />
                                </div>
                                <div>
                                  <span className="font-bold text-white block text-sm">{item.nombreConductor}</span>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                    <span>Placa: <strong className="text-cyan-300">{item.placaVehiculo}</strong></span>
                                    {item.telefonoConductor && <span>• {item.telefonoConductor}</span>}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Deliveries Count & Breakdown */}
                            <td className="p-3.5 text-center">
                              <div className="inline-flex items-center gap-1.5 text-xs font-semibold">
                                <span className="text-emerald-400 font-bold">{item.totalPedidosEntregados} entregados</span>
                                {item.totalPedidosNoEntregados > 0 && (
                                  <span className="text-red-400 text-[11px]">({item.totalPedidosNoEntregados} no entregados)</span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 block">Total: {item.totalPedidosAsignados || (item.totalPedidosEntregados + item.totalPedidosNoEntregados)} paquetes</span>
                            </td>

                            {/* Cash Pending */}
                            <td className="p-3.5 text-right font-mono font-extrabold text-sm text-amber-400">
                              S/ {item.montoEfectivoPendiente.toFixed(2)}
                            </td>

                            {/* Cash Settled */}
                            <td className="p-3.5 text-right font-mono font-bold text-xs text-emerald-400">
                              S/ {item.montoEfectivoRendido.toFixed(2)}
                            </td>

                            {/* Yape Digital */}
                            <td className="p-3.5 text-right font-mono font-bold text-xs text-purple-400">
                              S/ {item.montoYapeDigital.toFixed(2)}
                            </td>

                            {/* Total Collected */}
                            <td className="p-3.5 text-right font-mono font-extrabold text-sm text-white">
                              S/ {item.montoTotalCobrado.toFixed(2)}
                            </td>

                            {/* Status Badge */}
                            <td className="p-3.5 text-center">
                              {tienePendiente ? (
                                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold inline-flex items-center gap-1">
                                  <AlertCircle size={13} /> Pendiente Dinero
                                </span>
                              ) : (
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold inline-flex items-center gap-1">
                                  <CheckCircle2 size={13} /> Liquidado
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {/* Full Page Detail View Button */}
                                <button
                                  onClick={() => setSelectedConductor(item)}
                                  className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                                  title="Ver desglose completo de paquetes en vista dedicada"
                                >
                                  <Eye size={14} />
                                  Ver Detalle
                                </button>

                                {/* Confirm Cash Receipt Button */}
                                {tienePendiente && (
                                  <button
                                    onClick={() => handleConfirmarRendicion(item.idConductor, item.nombreConductor)}
                                    disabled={confirmarRendicionMutation.isPending}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                                    title="Confirmar recepción física del dinero en efectivo"
                                  >
                                    <DollarSign size={14} />
                                    Liquidar Efectivo
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            /* ════════════════════════════════════════════════════════════════════════
               VISTA 2: VISTA COMPLETA Y DEDICADA DEL DETALLE DE LIQUIDACIÓN DEL MOTORIZADO (NO MODAL)
               ════════════════════════════════════════════════════════════════════════ */
            <div className="space-y-6">
              
              {/* Driver Header Card */}
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-violet-500/20">
                    <Bike size={28} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-extrabold text-white">{selectedConductor.nombreConductor}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
                        {selectedConductor.placaVehiculo}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                      {selectedConductor.telefonoConductor && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Phone size={13} className="text-emerald-400" />
                          {selectedConductor.telefonoConductor}
                        </span>
                      )}
                      <span>Vehículo: <strong className="text-white">{selectedConductor.tipoVehiculo || 'Motorizado'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {selectedConductor.montoEfectivoPendiente > 0 && (
                    <button
                      onClick={() => handleConfirmarRendicion(selectedConductor.idConductor, selectedConductor.nombreConductor)}
                      disabled={confirmarRendicionMutation.isPending}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                    >
                      <DollarSign size={16} />
                      Liquidar Efectivo (S/ {selectedConductor.montoEfectivoPendiente.toFixed(2)})
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedConductor(null)}
                    className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
                  >
                    ← Volver a Resumen
                  </button>
                </div>
              </div>

              {/* Metrics Grid of the Selected Driver */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                
                {/* Total Paquetes Asignados */}
                <div className="bg-slate-900/40 border border-slate-800 p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Paquetes Asignados</span>
                  <div className="text-xl font-bold text-white flex items-center justify-center gap-1">
                    <Package size={18} className="text-slate-400" />
                    {resumenDetalle.totalAsignados}
                  </div>
                </div>

                {/* Entregados */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] text-emerald-300 uppercase font-semibold block mb-1">Entregados</span>
                  <div className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 size={18} />
                    {resumenDetalle.entregados}
                  </div>
                </div>

                {/* No Entregados */}
                <div className="bg-red-950/20 border border-red-500/30 p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] text-red-300 uppercase font-semibold block mb-1">No Entregados</span>
                  <div className="text-xl font-bold text-red-400 flex items-center justify-center gap-1">
                    <XCircle size={18} />
                    {resumenDetalle.noEntregados}
                  </div>
                </div>

                {/* Efectivo Recaudado */}
                <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] text-amber-300 uppercase font-semibold block mb-1">Efectivo Recaudado</span>
                  <div className="text-lg font-mono font-extrabold text-amber-400">
                    S/ {resumenDetalle.efectivo.toFixed(2)}
                  </div>
                </div>

                {/* Yape / Plin */}
                <div className="bg-purple-950/20 border border-purple-500/30 p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] text-purple-300 uppercase font-semibold block mb-1">Yape / Plin</span>
                  <div className="text-lg font-mono font-extrabold text-purple-400">
                    S/ {resumenDetalle.yape.toFixed(2)}
                  </div>
                </div>

                {/* Total Cobrado */}
                <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl text-center">
                  <span className="text-[10px] text-cyan-300 uppercase font-semibold block mb-1">Total Cobrado</span>
                  <div className="text-lg font-mono font-extrabold text-white">
                    S/ {resumenDetalle.total.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Granular Table of All Packages Assigned in Selected Date Range */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Receipt size={18} className="text-violet-400" />
                      Listado Detallado de Paquetes Asignados
                    </h3>
                    <p className="text-xs text-slate-400">
                      Muestra todos los paquetes que el repartidor tuvo que entregar y el método de cobro registrado.
                    </p>
                  </div>

                  <span className="text-xs text-slate-400 font-semibold bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                    Mostrando <strong className="text-white">{detalleList?.length || 0}</strong> pedidos
                  </span>
                </div>

                {/* Loading state */}
                {isLoadingDetalle && (
                  <div className="py-16 text-center text-slate-400 text-xs">Cargando desglose de paquetes...</div>
                )}

                {/* Empty State */}
                {!isLoadingDetalle && (!detalleList || detalleList.length === 0) && (
                  <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                    <Clock className="mx-auto text-slate-500" size={36} />
                    <p className="font-semibold">No se registraron asignaciones para este motorizado en las fechas seleccionadas.</p>
                  </div>
                )}

                {/* Full Package Table */}
                {!isLoadingDetalle && detalleList && detalleList.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[900px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/80">
                          <th className="p-3">Código Tracking</th>
                          <th className="p-3">Comercio Remitente</th>
                          <th className="p-3">Cliente Destinatario</th>
                          <th className="p-3 text-center">Estado del Pedido</th>
                          <th className="p-3 text-right">Monto Pedido</th>
                          <th className="p-3 text-right text-amber-400">Cobro Efectivo</th>
                          <th className="p-3 text-right text-purple-400">Cobro Yape/Plin</th>
                          <th className="p-3">Ref. Pago Yape</th>
                          <th className="p-3 text-center">Rendición Efectivo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900">
                        {detalleList.map((det) => {
                          const esEntregado = det.idEstadosPedido === 11;

                          return (
                            <tr key={`det_full_row_${det.idPedido}`} className="hover:bg-slate-950/60 transition-colors">
                              
                              {/* Tracking Code */}
                              <td className="p-3">
                                <span className="font-mono font-extrabold text-violet-300 block text-xs">
                                  {det.codigoSeguimiento}
                                </span>
                              </td>

                              {/* Commerce */}
                              <td className="p-3 font-bold text-white">
                                {det.nombreComercial}
                              </td>

                              {/* Customer */}
                              <td className="p-3">
                                <span className="font-bold text-slate-200 block">{det.nombreDestinatario}</span>
                                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <MapPin size={11} className="text-slate-500 shrink-0" />
                                  <span>{det.distritoNombre} — {det.direccionDestinatario}</span>
                                </div>
                              </td>

                              {/* Final Status */}
                              <td className="p-3 text-center">
                                {esEntregado ? (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold inline-flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Entregado
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold inline-flex items-center gap-1">
                                    <AlertCircle size={12} /> {det.estadoPedido || 'No Entregado'}
                                  </span>
                                )}
                              </td>

                              {/* Total Amount to Collect */}
                              <td className="p-3 text-right font-mono font-extrabold text-white">
                                S/ {(det.montoCobrar || det.montoTotalPedido || 0).toFixed(2)}
                              </td>

                              {/* Cash collected */}
                              <td className="p-3 text-right font-mono font-bold text-amber-400">
                                {det.montoEfectivo > 0 ? `S/ ${det.montoEfectivo.toFixed(2)}` : '-'}
                              </td>

                              {/* Yape/Plin collected */}
                              <td className="p-3 text-right font-mono font-bold text-purple-400">
                                {det.montoYape > 0 ? `S/ ${det.montoYape.toFixed(2)}` : '-'}
                              </td>

                              {/* Yape Reference */}
                              <td className="p-3 font-mono text-[11px] text-slate-300">
                                {det.referenciaYape || '-'}
                              </td>

                              {/* Cash Liquidation Status */}
                              <td className="p-3 text-center">
                                {det.montoEfectivo > 0 ? (
                                  det.esRendido === 1 ? (
                                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                      Liquidado
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                      Pendiente S/
                                    </span>
                                  )
                                ) : (
                                  <span className="text-slate-500 text-[11px]">N/A (Sin efectivo)</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default RendicionCuentasAdminPage;
