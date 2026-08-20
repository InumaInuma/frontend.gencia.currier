import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import {
  useMisRecojosMotorizado,
  useActualizarEstadoComercioRecojo,
  useActualizarEstadoAlmacenRecojo
} from '../../../application/useCases/useMisPedidos';
import { EstadoPedidoEnum } from '../../../domain/enums/EstadoPedidoEnum';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import {
  RefreshCw,
  LogOut,
  Package,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { RecojosKpiHeader } from '../../components/motorizadoRecojos/RecojosKpiHeader';
import { AcordeonComercioMotorizado, type GroupedByComercio } from '../../components/motorizadoRecojos/AcordeonComercioMotorizado';
import { TarjetaAlmacenRetorno } from '../../components/motorizadoRecojos/TarjetaAlmacenRetorno';

export const MotorizadoRecojosPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [openComercioIds, setOpenComercioIds] = useState<number[]>([]);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: misItems, isLoading, refetch } = useMisRecojosMotorizado();
  const actualizarComercioMutation = useActualizarEstadoComercioRecojo();
  const actualizarAlmacenMutation = useActualizarEstadoAlmacenRecojo();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Group items by Comercio and calculate current commerce status
  const { misRecojosComercios, idAsignacionRecojo, estadoRutaGlobal } = useMemo(() => {
    if (!misItems || misItems.length === 0) {
      return { misRecojosComercios: [], idAsignacionRecojo: 0, estadoRutaGlobal: 'Asignado' };
    }

    const firstAsignacionId = misItems[0].idAsignacionRecojo;
    const firstEstadoAsignacion = misItems[0].estadoAsignacion;
    const groupMap: { [key: number]: GroupedByComercio } = {};

    misItems.forEach((item) => {
      if (!groupMap[item.idComercio]) {
        groupMap[item.idComercio] = {
          idComercio: item.idComercio,
          nombreComercial: item.nombreComercial,
          ruc: item.ruc,
          direccionRecojo: item.direccionRecojo,
          referenciaRecojo: item.referenciaRecojo,
          telefonoComercio: item.telefonoComercio,
          googleMapsUrlComercio: item.googleMapsUrlComercio || item.googleMapsUrl,
          pedidos: [],
          estadoComercio: 'Asignado',
        };
      }
      groupMap[item.idComercio].pedidos.push(item);
    });

    // Determine state of each comercio group based on package status IDs (EstadoPedidoEnum)
    const comercios = Object.values(groupMap).map((comercio) => {
      const ids = comercio.pedidos.map((p) => p.idEstadosPedido);

      if (
        ids.every(
          (id) =>
            id === EstadoPedidoEnum.Recogido ||
            id === EstadoPedidoEnum.EnCaminoAlAlmacen ||
            id === EstadoPedidoEnum.EnAlmacen
        )
      ) {
        comercio.estadoComercio = 'Recogido';
      } else if (ids.some((id) => id === EstadoPedidoEnum.LlegoAlComercio)) {
        comercio.estadoComercio = 'Llegó al Comercio';
      } else if (ids.some((id) => id === EstadoPedidoEnum.EnCaminoAlComercio)) {
        comercio.estadoComercio = 'En Camino al Comercio';
      } else {
        comercio.estadoComercio = 'Asignado';
      }

      return comercio;
    });

    return {
      misRecojosComercios: comercios,
      idAsignacionRecojo: firstAsignacionId,
      estadoRutaGlobal: firstEstadoAsignacion,
    };
  }, [misItems]);

  // Open all accordions by default
  React.useEffect(() => {
    if (misRecojosComercios.length > 0 && openComercioIds.length === 0) {
      setOpenComercioIds(misRecojosComercios.map((c) => c.idComercio));
    }
  }, [misRecojosComercios]);

  const toggleAccordion = (id: number) => {
    setOpenComercioIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Step 1, 2, 3: Update Commerce Status by Enum ID
  const handleActualizarEstadoComercio = async (idComercio: number, idEstado: EstadoPedidoEnum) => {
    if (!idAsignacionRecojo) return;

    setFeedbackMsg(null);
    try {
      await actualizarComercioMutation.mutateAsync({
        idAsignacionRecojo,
        idComercio,
        idEstado,
      });

      setFeedbackMsg({
        type: 'success',
        text: 'Estado del recojo actualizado correctamente.',
      });
      refetch();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al actualizar el estado del comercio.',
      });
    }
  };

  // Step 4 & 5: Update Warehouse Status by Enum ID
  const handleActualizarEstadoAlmacen = async (idEstado: EstadoPedidoEnum) => {
    if (!idAsignacionRecojo) return;

    setFeedbackMsg(null);
    try {
      await actualizarAlmacenMutation.mutateAsync({
        idAsignacionRecojo,
        idEstado,
      });

      setFeedbackMsg({
        type: 'success',
        text: '¡Ruta hacia almacén actualizada correctamente!',
      });
      refetch();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al actualizar el estado del almacén.',
      });
    }
  };

  if (!user) return null;

  const totalPaquetes = misRecojosComercios.reduce((acc, c) => acc + c.pedidos.length, 0);
  const todosComerciosRecogidos =
    misRecojosComercios.length > 0 &&
    misRecojosComercios.every((c) => c.estadoComercio === 'Recogido');

  const estaEnCaminoAlmacen = !!misItems && misItems.some((i) => i.idEstadosPedido === EstadoPedidoEnum.EnCaminoAlAlmacen);
  const estaEntregadoAlmacen = !!misItems && misItems.every((i) => i.idEstadosPedido === EstadoPedidoEnum.EnAlmacen);

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
            <Package className="text-emerald-400 shrink-0" size={24} />
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Mis Recojos Asignados
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Avisa el estado de tu ruta de recojo en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden md:flex items-center gap-2 text-xs font-semibold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 cursor-pointer transition-all"
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Main Content */}
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

          {/* Summary Stats Component */}
          <RecojosKpiHeader
            totalComercios={misRecojosComercios.length}
            totalPaquetes={totalPaquetes}
            estadoRutaGlobal={estadoRutaGlobal}
          />

          {/* Loading */}
          {isLoading && (
            <div className="py-20 text-center text-slate-400 text-xs">Cargando tus recojos asignados...</div>
          )}

          {/* Empty */}
          {!isLoading && misRecojosComercios.length === 0 && (
            <div className="py-20 px-4 bg-slate-900/30 border border-slate-900 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
              <h3 className="text-base font-bold text-white">¡Sin recojos pendientes asignados!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No tienes recojos de comercios pendientes asignados en este momento.
              </p>
            </div>
          )}

          {/* Commerce Accordions with Action Buttons */}
          {!isLoading &&
            misRecojosComercios.map((comercio, index) => (
              <AcordeonComercioMotorizado
                key={`comercio_${comercio.idComercio}`}
                comercio={comercio}
                index={index}
                isOpen={openComercioIds.includes(comercio.idComercio)}
                onToggleAccordion={toggleAccordion}
                onActualizarEstadoComercio={handleActualizarEstadoComercio}
                isPending={actualizarComercioMutation.isPending}
              />
            ))}

          {/* Warehouse Return Action Card & Route Finished Banner */}
          <TarjetaAlmacenRetorno
            todosComerciosRecogidos={todosComerciosRecogidos}
            estaEnCaminoAlmacen={estaEnCaminoAlmacen}
            estaEntregadoAlmacen={estaEntregadoAlmacen}
            onActualizarEstadoAlmacen={handleActualizarEstadoAlmacen}
            isPending={actualizarAlmacenMutation.isPending}
          />
        </main>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default MotorizadoRecojosPage;
