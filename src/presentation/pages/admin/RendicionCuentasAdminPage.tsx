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
import { FiltroRangoFechasRendicion } from '../../components/rendicion/FiltroRangoFechasRendicion';
import { TablaResumenRendicion } from '../../components/rendicion/TablaResumenRendicion';
import { VistaDetalleRendicionMotorizado } from '../../components/rendicion/VistaDetalleRendicionMotorizado';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Receipt,
  ArrowLeft
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

  // Motorizado seleccionado para Vista Detalle Completa
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

          {/* Barra de Controles de Rango de Fechas */}
          <FiltroRangoFechasRendicion
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            onChangeFechaInicio={setFechaInicio}
            onChangeFechaFin={setFechaFin}
            onSetHoy={() => {
              const today = getTodayFormatted();
              setFechaInicio(today);
              setFechaFin(today);
            }}
            isToday={fechaInicio === getTodayFormatted() && fechaFin === getTodayFormatted()}
          />

          {/* VISTA 1: Resumen General vs VISTA 2: Vista Detalle del Motorizado */}
          {!selectedConductor ? (
            <TablaResumenRendicion
              resumenList={resumenList}
              isLoading={isLoading}
              filteredResumen={filteredResumen}
              searchTerm={searchTerm}
              onChangeSearchTerm={setSearchTerm}
              totalesGlobales={totalesGlobales}
              onSelectConductor={setSelectedConductor}
              onConfirmarRendicion={handleConfirmarRendicion}
              isPendingConfirmacion={confirmarRendicionMutation.isPending}
            />
          ) : (
            <VistaDetalleRendicionMotorizado
              selectedConductor={selectedConductor}
              detalleList={detalleList}
              isLoadingDetalle={isLoadingDetalle}
              resumenDetalle={resumenDetalle}
              onVolver={() => setSelectedConductor(null)}
              onConfirmarRendicion={handleConfirmarRendicion}
              isPendingConfirmacion={confirmarRendicionMutation.isPending}
            />
          )}
        </main>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default RendicionCuentasAdminPage;
