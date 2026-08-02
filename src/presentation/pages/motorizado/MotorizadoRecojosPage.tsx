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
import { TablaMonitoreoRecojo } from '../../components/TablaMonitoreoRecojo';
import type { IMonitoreoRecojo } from '../../../domain/models/IMonitoreoRecojo';
import {
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LogOut,
  Package,
  Store,
  CheckCircle2,
  Navigation,
  Bike,
  Truck,
  Building2,
  AlertCircle
} from 'lucide-react';

interface GroupedByComercio {
  idComercio: number;
  nombreComercial: string;
  ruc: string;
  direccionRecojo: string;
  referenciaRecojo?: string;
  telefonoComercio?: string;
  googleMapsUrlComercio?: string;
  pedidos: IMonitoreoRecojo[];
  estadoComercio: string; // 'Asignado' | 'En Camino al Comercio' | 'Llegó al Comercio' | 'Recogido'
}

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
          estadoComercio: 'Asignado'
        };
      }
      groupMap[item.idComercio].pedidos.push(item);
    });

    // Determine state of each comercio group based on package status IDs (EstadoPedidoEnum)
    const comercios = Object.values(groupMap).map((comercio) => {
      const ids = comercio.pedidos.map((p) => p.idEstadosPedido);

      if (ids.every((id) => id === EstadoPedidoEnum.Recogido || id === EstadoPedidoEnum.EnCaminoAlAlmacen || id === EstadoPedidoEnum.EnAlmacen)) {
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
      estadoRutaGlobal: firstEstadoAsignacion
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
        idEstado
      });

      setFeedbackMsg({
        type: 'success',
        text: 'Estado del recojo actualizado correctamente.'
      });
      refetch();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al actualizar el estado del comercio.'
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
        idEstado
      });

      setFeedbackMsg({
        type: 'success',
        text: '¡Ruta hacia almacén actualizada correctamente!'
      });
      refetch();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al actualizar el estado del almacén.'
      });
    }
  };

  if (!user) return null;

  const totalPaquetes = misRecojosComercios.reduce((acc, c) => acc + c.pedidos.length, 0);
  const todosComerciosRecogidos =
    misRecojosComercios.length > 0 &&
    misRecojosComercios.every((c) => c.estadoComercio === 'Recogido');

  const estaEnCaminoAlmacen = misItems && misItems.some((i) => i.idEstadosPedido === EstadoPedidoEnum.EnCaminoAlAlmacen);
  const estaEntregadoAlmacen = misItems && misItems.every((i) => i.idEstadosPedido === EstadoPedidoEnum.EnAlmacen);

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

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold">
                <Store size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Comercios a Recoger</span>
                <h3 className="text-xl font-extrabold text-white">{misRecojosComercios.length}</h3>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <Package size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Total Paquetes Asignados</span>
                <h3 className="text-xl font-extrabold text-white">{totalPaquetes}</h3>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
                <Bike size={24} />
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Estado Asignación Ruta</span>
                <h3 className="text-sm font-extrabold text-amber-400">
                  {estadoRutaGlobal || 'Asignado'}
                </h3>
              </div>
            </div>
          </div>

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
            misRecojosComercios.map((comercio, index) => {
              const isOpen = openComercioIds.includes(comercio.idComercio);
              const isRecogido = comercio.estadoComercio === 'Recogido';
              const isLlego = comercio.estadoComercio === 'Llegó al Comercio';
              const isEnCamino = comercio.estadoComercio === 'En Camino al Comercio';

              return (
                <div
                  key={`comercio_${comercio.idComercio}`}
                  className={`bg-slate-900/40 border rounded-2xl overflow-hidden shadow-xl transition-all ${
                    isRecogido
                      ? 'border-emerald-500/30 bg-emerald-950/10'
                      : isLlego
                      ? 'border-cyan-500/40 bg-cyan-950/10'
                      : isEnCamino
                      ? 'border-amber-500/40 bg-amber-950/10'
                      : 'border-slate-900'
                  }`}
                >
                  {/* Comercio Header */}
                  <div
                    onClick={() => toggleAccordion(comercio.idComercio)}
                    className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-violet-950/20 border-b border-slate-900 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-extrabold text-sm shrink-0">
                        {index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-extrabold text-white text-base sm:text-lg">
                            {comercio.nombreComercial}
                          </h3>
                          <span className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                            RUC: {comercio.ruc}
                          </span>
                        </div>

                        <p className="text-xs text-violet-300 flex items-center gap-1.5 mt-1">
                          <MapPin size={14} className="text-violet-400 shrink-0" />
                          {comercio.direccionRecojo}
                          {comercio.referenciaRecojo && (
                            <span className="text-slate-400 font-medium">({comercio.referenciaRecojo})</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
                      {/* Commerce Status Badge */}
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          isRecogido
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : isLlego
                            ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                            : isEnCamino
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isRecogido
                          ? '✅ Recogido'
                          : isLlego
                          ? '📍 En Comercio'
                          : isEnCamino
                          ? '🏍️ En Camino'
                          : '🕒 Pendiente'}
                      </span>

                      {comercio.googleMapsUrlComercio && (
                        <a
                          href={comercio.googleMapsUrlComercio}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                        >
                          <ExternalLink size={13} />
                          GPS Mapa
                        </a>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAccordion(comercio.idComercio);
                        }}
                        className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                      >
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* Comercio Details & Interactive Driver Actions */}
                  {isOpen && (
                    <div className="p-4 sm:p-6 space-y-4">
                      {/* Driver Status Progression Buttons */}
                      <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs text-slate-300 space-y-1 w-full sm:w-auto">
                          <div className="flex items-center gap-2 font-bold text-white">
                            <Navigation size={14} className="text-violet-400" />
                            <span>Acción del Repartidor para este Comercio:</span>
                          </div>
                          <p className="text-slate-400">
                            {comercio.referenciaRecojo ? `Ref: ${comercio.referenciaRecojo}` : 'Sin referencia'}
                            {comercio.telefonoComercio && ` — 📞 Teléfono: ${comercio.telefonoComercio}`}
                          </p>
                        </div>

                        {/* Action State Buttons using EstadoPedidoEnum IDs */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          {!isRecogido && !isLlego && !isEnCamino && (
                            <button
                              onClick={() => handleActualizarEstadoComercio(comercio.idComercio, EstadoPedidoEnum.EnCaminoAlComercio)}
                              disabled={actualizarComercioMutation.isPending}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-600/20 active:scale-95"
                            >
                              <Bike size={16} />
                              Voy en Camino al Comercio
                            </button>
                          )}

                          {isEnCamino && (
                            <button
                              onClick={() => handleActualizarEstadoComercio(comercio.idComercio, EstadoPedidoEnum.LlegoAlComercio)}
                              disabled={actualizarComercioMutation.isPending}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-600/20 active:scale-95"
                            >
                              <MapPin size={16} />
                              Llegué al Comercio
                            </button>
                          )}

                          {isLlego && (
                            <button
                              onClick={() => handleActualizarEstadoComercio(comercio.idComercio, EstadoPedidoEnum.Recogido)}
                              disabled={actualizarComercioMutation.isPending}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-95"
                            >
                              <CheckCircle2 size={16} />
                              Paquetes Recogidos del Comercio
                            </button>
                          )}

                          {isRecogido && (
                            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                              <CheckCircle2 size={16} />
                              Recojo de Comercio Completado
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Package Table Component */}
                      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden">
                        <TablaMonitoreoRecojo pedidos={comercio.pedidos} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          {/* Warehouse Return Action Card (When all Comercios are collected or currently returning) */}
          {todosComerciosRecogidos && !estaEntregadoAlmacen && (
            <div className="bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-500/40 p-6 rounded-3xl shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shrink-0">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base sm:text-lg">
                      ¡Todos los recojos de comercios han sido completados!
                    </h3>
                    <p className="text-xs text-slate-300">
                      {estaEnCaminoAlmacen
                        ? '📍 Te encuentras en camino hacia el Almacén General (La Victoria).'
                        : 'Avisa a la central cuando inicies tu retorno al Almacén General.'}
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  {!estaEnCaminoAlmacen ? (
                    <button
                      onClick={() => handleActualizarEstadoAlmacen(EstadoPedidoEnum.EnCaminoAlAlmacen)}
                      disabled={actualizarAlmacenMutation.isPending}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl shadow-violet-500/30 active:scale-95"
                    >
                      <Truck size={20} />
                      Voy en Camino al Almacén
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActualizarEstadoAlmacen(EstadoPedidoEnum.EnAlmacen)}
                      disabled={actualizarAlmacenMutation.isPending}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl shadow-emerald-500/30 active:scale-95"
                    >
                      <Building2 size={20} />
                      Llegué y Entregué Paquetes en Almacén
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Route Finished Card */}
          {estaEntregadoAlmacen && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-center space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
              <h3 className="text-base font-extrabold text-white">¡Ruta de Recojo Completada Exitosamente!</h3>
              <p className="text-xs text-emerald-300 font-semibold max-w-lg mx-auto">
                Todos los paquetes han sido recogidos de los comercios e ingresados formalmente en el Almacén General.
              </p>
            </div>
          )}
        </main>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default MotorizadoRecojosPage;
