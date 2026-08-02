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
  X,
  Wallet,
  Building2
} from 'lucide-react';

export const RendicionCuentasAdminPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected driver for Detail Modal
  const [selectedConductorId, setSelectedConductorId] = useState<number | null>(null);
  const [selectedConductorNombre, setSelectedConductorNombre] = useState<string>('');

  const { data: resumenList, isLoading, refetch } = useLiquidacionesResumenAdmin();
  const { data: detalleList, isLoading: isLoadingDetalle } = useLiquidacionDetalleMotorizado(selectedConductorId);
  const confirmarRendicionMutation = useConfirmarRendicionDinero();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Filtered Summary List
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

  // Overall Financial Totals
  const totalesGlobales = useMemo(() => {
    if (!resumenList) return { efectivoPendiente: 0, efectivoRendido: 0, yapeDigital: 0, totalGeneral: 0 };
    return resumenList.reduce(
      (acc, item) => {
        acc.efectivoPendiente += item.montoEfectivoPendiente;
        acc.efectivoRendido += item.montoEfectivoRendido;
        acc.yapeDigital += item.montoYapeDigital;
        acc.totalGeneral += item.montoTotalCobrado;
        return acc;
      },
      { efectivoPendiente: 0, efectivoRendido: 0, yapeDigital: 0, totalGeneral: 0 }
    );
  }, [resumenList]);

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
        {/* Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="text-emerald-400 shrink-0" size={24} />
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Rendición de Cuentas & Arqueo de Caja
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Recepción física de dinero cobrado en contra-entrega por los motorizados.
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
                  Cobrado por Yape/Plin
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
              <h3 className="text-base font-bold text-white">¡No hay entregas pendientes de liquidación!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Los cobros registrados por los motorizados aparecerán aquí para la rendición de cuentas.
              </p>
            </div>
          )}

          {/* Liquidations Summary Table */}
          {!isLoading && resumenList && resumenList.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[950px]">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px] bg-slate-950/80">
                    <th className="p-3.5">Motorizado / Repartidor</th>
                    <th className="p-3.5 text-center">Entregas Realizadas</th>
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

                        {/* Delivered Count */}
                        <td className="p-3.5 text-center font-mono font-bold text-slate-200">
                          {item.totalPedidosEntregados} {item.totalPedidosEntregados === 1 ? 'paquete' : 'paquetes'}
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
                            {/* Detail Button */}
                            <button
                              onClick={() => {
                                setSelectedConductorId(item.idConductor);
                                setSelectedConductorNombre(item.nombreConductor);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
                              title="Ver desglose de paquetes y cobros"
                            >
                              <Eye size={14} />
                              Detalle
                            </button>

                            {/* Confirm Cash Receipt Button */}
                            {tienePendiente && (
                              <button
                                onClick={() => handleConfirmarRendicion(item.idConductor, item.nombreConductor)}
                                disabled={confirmarRendicionMutation.isPending}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer shadow-md shadow-emerald-500/20 transition-all active:scale-95"
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
        </main>

        {/* Modal Detalle Granular del Motorizado */}
        {selectedConductorId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <button
                onClick={() => setSelectedConductorId(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50"
              >
                <X size={18} />
              </button>

              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
                  Desglose de Entregas & Cobros
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Repartidor: {selectedConductorNombre}
                </h3>
              </div>

              {isLoadingDetalle && (
                <div className="py-12 text-center text-slate-400 text-xs">Cargando detalle de paquetes...</div>
              )}

              {!isLoadingDetalle && detalleList && (
                <div className="flex-1 overflow-y-auto overflow-x-auto space-y-4 pr-1">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/80 sticky top-0">
                        <th className="p-3">Código</th>
                        <th className="p-3">Comercio Remitente</th>
                        <th className="p-3">Cliente / Dirección</th>
                        <th className="p-3 text-right">Efectivo</th>
                        <th className="p-3 text-right">Yape/Plin</th>
                        <th className="p-3">Código Yape</th>
                        <th className="p-3 text-right">Total Pedido</th>
                        <th className="p-3 text-center">Estado Rendición</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {detalleList.map((det) => (
                        <tr key={`det_row_${det.idPedido}`} className="hover:bg-slate-950/50">
                          <td className="p-3 font-mono font-bold text-violet-300">{det.codigoSeguimiento}</td>
                          <td className="p-3 font-bold text-white">{det.nombreComercial}</td>
                          <td className="p-3">
                            <span className="font-bold text-slate-200 block">{det.nombreDestinatario}</span>
                            <span className="text-[11px] text-slate-400">📍 {det.distritoNombre} — {det.direccionDestinatario}</span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            {det.montoEfectivo > 0 ? `S/ ${det.montoEfectivo.toFixed(2)}` : '-'}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-purple-400">
                            {det.montoYape > 0 ? `S/ ${det.montoYape.toFixed(2)}` : '-'}
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-300">
                            {det.referenciaYape || '-'}
                          </td>
                          <td className="p-3 text-right font-mono font-extrabold text-white">
                            S/ {det.montoTotalPedido.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            {det.esRendido === 1 ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                Liquidado
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                                Pendiente S/
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedConductorId(null)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                >
                  Cerrar Detalle
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Nav */}
        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default RendicionCuentasAdminPage;
