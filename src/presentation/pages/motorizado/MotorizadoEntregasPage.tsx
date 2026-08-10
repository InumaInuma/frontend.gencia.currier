import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import {
  useMisEntregasMotorizado,
  useIniciarRutaEntrega,
  useActualizarEstadoEntregaPedido
} from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { EstadoPedidoEnum } from '../../../domain/enums/EstadoPedidoEnum';
import type { IMonitoreoEntrega } from '../../../domain/models/IMonitoreoEntrega';
import {
  Truck,
  Bike,
  Phone,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  QrCode,
  XCircle,
  X,
  Search,
  CalendarClock
} from 'lucide-react';

export const MotorizadoEntregasPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals state
  const [deliveryModalItem, setDeliveryModalItem] = useState<IMonitoreoEntrega | null>(null);
  const [failedModalItem, setFailedModalItem] = useState<IMonitoreoEntrega | null>(null);

  // Payment form state inside Confirm Modal
  const [tipoPago, setTipoPago] = useState<'efectivo' | 'yape' | 'dividido' | 'comercio'>('efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState<string>('');
  const [montoYape, setMontoYape] = useState<string>('');
  const [referenciaYape, setReferenciaYape] = useState<string>('');

  // Failed modal state
  const [motivoFallo, setMotivoFallo] = useState<string>('Cliente ausente / No responde llamadas');

  const { data: misItems, isLoading, refetch } = useMisEntregasMotorizado();
  const iniciarRutaMutation = useIniciarRutaEntrega();
  const actualizarEstadoMutation = useActualizarEstadoEntregaPedido();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Active Route Header
  const asignacionHeader = useMemo(() => {
    if (!misItems || misItems.length === 0) return null;
    const first = misItems[0];
    return {
      idAsignacionEntrega: first.idAsignacionEntrega || first.idPedido,
      idEstadosEntrega: first.idEstadosEntrega || 1, // 1: Creado, 2: En Ruta, 3: Completado
      estadoAsignacion: first.estadoAsignacion || 'Creado',
      placaVehiculo: first.placaVehiculo,
      tipoVehiculo: first.tipoVehiculo
    };
  }, [misItems]);

  const esRutaIniciada = asignacionHeader?.idEstadosEntrega === 2;

  // Filtered packages
  const filteredItems = useMemo(() => {
    if (!misItems) return [];
    if (!searchTerm.trim()) return misItems;
    const term = searchTerm.toLowerCase();
    return misItems.filter(
      (item) =>
        item.codigoSeguimiento.toLowerCase().includes(term) ||
        item.nombreDestinatario.toLowerCase().includes(term) ||
        item.nombreComercial.toLowerCase().includes(term) ||
        item.distritoNombre.toLowerCase().includes(term)
    );
  }, [misItems, searchTerm]);

  const handleIniciarRuta = async () => {
    if (!misItems || misItems.length === 0) return;
    setFeedbackMsg(null);
    try {
      const idAsignacion = misItems[0].idAsignacionEntrega || misItems[0].idPedido;
      await iniciarRutaMutation.mutateAsync(idAsignacion);
      setFeedbackMsg({ type: 'success', text: '¡Excelente! La ruta de entrega ha sido marcada como EN RUTA.' });
      refetch();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error al iniciar la ruta de entrega.' });
    }
  };

  const handleSetEnCaminoCliente = async (item: IMonitoreoEntrega) => {
    if (!esRutaIniciada) {
      setFeedbackMsg({ type: 'error', text: 'Debes presionar "Comenzar Ruta de Reparto" antes de avisar al cliente.' });
      return;
    }
    setFeedbackMsg(null);
    try {
      await actualizarEstadoMutation.mutateAsync({
        idAsignacionEntrega: item.idAsignacionEntrega || item.idPedido,
        idPedido: item.idPedido,
        idEstado: EstadoPedidoEnum.EnRuta // 9
      });
      setFeedbackMsg({
        type: 'success',
        text: `Se notificó al cliente ${item.nombreDestinatario} que estás en camino.`
      });
      refetch();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error al actualizar estado.' });
    }
  };

  const handleSetA20MinutosCliente = async (item: IMonitoreoEntrega) => {
    if (!esRutaIniciada) {
      setFeedbackMsg({ type: 'error', text: 'Debes presionar "Comenzar Ruta de Reparto" antes de notificar los 20 minutos.' });
      return;
    }
    setFeedbackMsg(null);
    try {
      await actualizarEstadoMutation.mutateAsync({
        idAsignacionEntrega: item.idAsignacionEntrega || item.idPedido,
        idPedido: item.idPedido,
        idEstado: EstadoPedidoEnum.A5Minutos // 10
      });
      setFeedbackMsg({
        type: 'success',
        text: `Se notificó a ${item.nombreDestinatario} que estás a 20 minutos de llegar.`
      });
      refetch();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error al actualizar estado.' });
    }
  };

  const openConfirmModal = (item: IMonitoreoEntrega) => {
    if (!esRutaIniciada) {
      setFeedbackMsg({ type: 'error', text: 'Debes presionar "Comenzar Ruta de Reparto" antes de confirmar la entrega.' });
      return;
    }
    setDeliveryModalItem(item);
    if (item.montoCobrar > 0) {
      setTipoPago('efectivo');
      setMontoEfectivo(item.montoCobrar.toString());
      setMontoYape('');
    } else {
      setTipoPago('comercio');
      setMontoEfectivo('0');
      setMontoYape('0');
    }
    setReferenciaYape('');
  };

  const handleConfirmarEntrega = async () => {
    if (!deliveryModalItem) return;
    setFeedbackMsg(null);

    let efec = 0;
    let yap = 0;

    if (tipoPago === 'efectivo') {
      efec = Number(montoEfectivo) || deliveryModalItem.montoCobrar;
    } else if (tipoPago === 'yape') {
      yap = Number(montoYape) || deliveryModalItem.montoCobrar;
    } else if (tipoPago === 'dividido') {
      efec = Number(montoEfectivo) || 0;
      yap = Number(montoYape) || 0;
    }

    try {
      await actualizarEstadoMutation.mutateAsync({
        idAsignacionEntrega: deliveryModalItem.idAsignacionEntrega || deliveryModalItem.idPedido,
        idPedido: deliveryModalItem.idPedido,
        idEstado: EstadoPedidoEnum.Entregado, // 11
        montoEfectivo: efec,
        montoYape: yap,
        referenciaYape: referenciaYape.trim()
      });

      setFeedbackMsg({
        type: 'success',
        text: `¡Paquete entregado a ${deliveryModalItem.nombreDestinatario} exitosamente!`
      });
      setDeliveryModalItem(null);
      refetch();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error al confirmar la entrega.' });
    }
  };

  const openFailedModal = (item: IMonitoreoEntrega) => {
    if (!esRutaIniciada) {
      setFeedbackMsg({ type: 'error', text: 'Debes presionar "Comenzar Ruta de Reparto" primero.' });
      return;
    }
    setFailedModalItem(item);
  };

  const handleConfirmarNoEntregado = async () => {
    if (!failedModalItem) return;
    setFeedbackMsg(null);

    try {
      await actualizarEstadoMutation.mutateAsync({
        idAsignacionEntrega: failedModalItem.idAsignacionEntrega || failedModalItem.idPedido,
        idPedido: failedModalItem.idPedido,
        idEstado: EstadoPedidoEnum.NoEntregado, // 12
        observacion: motivoFallo
      });

      setFeedbackMsg({
        type: 'success',
        text: `Paquete registrado como NO ENTREGADO (${failedModalItem.nombreDestinatario}).`
      });
      setFailedModalItem(null);
      refetch();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error al marcar no entregado.' });
    }
  };

  const [rescheduleModalItem, setRescheduleModalItem] = useState<IMonitoreoEntrega | null>(null);
  const [motivoReprogramacion, setMotivoReprogramacion] = useState('Cliente solicitó reprogramar entrega para el día de mañana');

  const openRescheduleModal = (item: IMonitoreoEntrega) => {
    if (!esRutaIniciada) {
      setFeedbackMsg({ type: 'error', text: 'Debes presionar "Comenzar Ruta de Reparto" primero.' });
      return;
    }
    setRescheduleModalItem(item);
    setMotivoReprogramacion('Cliente solicitó reprogramar entrega para el día de mañana');
  };

  const handleConfirmarReprogramacion = async () => {
    if (!rescheduleModalItem) return;
    setFeedbackMsg(null);

    try {
      await actualizarEstadoMutation.mutateAsync({
        idAsignacionEntrega: rescheduleModalItem.idAsignacionEntrega || rescheduleModalItem.idPedido,
        idPedido: rescheduleModalItem.idPedido,
        idEstado: EstadoPedidoEnum.Reprogramado, // 14
        observacion: motivoReprogramacion
      });

      setFeedbackMsg({
        type: 'success',
        text: `Paquete registrado como REPROGRAMADO (${rescheduleModalItem.nombreDestinatario}).`
      });
      setRescheduleModalItem(null);
      refetch();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error al reprogramar pedido.' });
    }
  };

  const handleOpenWhatsApp = (telefono: string, cliente: string, codigoSeguimiento: string) => {
    const num = telefono.replace(/\D/g, '');
    const cleanNum = num.startsWith('51') ? num : `51${num}`;
    const msg = `¡Hola ${cliente}! Le saluda su repartidor de ALMAIN CURRIER 🏍️.\nLe informamos que su paquete está en camino a su ubicación.\n\n📦 *Código de envío:* ${codigoSeguimiento}\n🌐 Puedes hacerle seguimiento en tiempo real con este código ingresando a nuestra web:\nhttps://currier-almain.vercel.app/`;
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOpenCall = (telefono: string) => {
    const num = telefono.replace(/\D/g, '');
    window.open(`tel:${num}`);
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
            <Truck className="text-cyan-400 shrink-0" size={24} />
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Entregas Asignadas (Última Milla)
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Hoja de ruta e itinerario de entregas cliente a cliente.
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

          {isLoading && (
            <div className="py-20 text-center text-slate-400 text-xs">Cargando hoja de ruta de entregas...</div>
          )}

          {!isLoading && (!misItems || misItems.length === 0) && (
            <div className="py-20 px-4 bg-slate-900/30 border border-slate-900 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="mx-auto text-emerald-400" size={48} />
              <h3 className="text-base font-bold text-white">¡No tienes entregas pendientes asignadas!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Cuando el Administrador te asigne paquetes desde el almacén central, aparecerán en esta pantalla.
              </p>
            </div>
          )}

          {!isLoading && misItems && misItems.length > 0 && (
            <>
              {/* Route Action Control Header */}
              <div className="bg-slate-900/50 border border-slate-900 p-5 rounded-2xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block">
                      Hoja de Ruta de Reparto Asignada
                    </span>
                    <h2 className="text-lg font-extrabold text-white mt-0.5">
                      Ruta #{misItems[0].idAsignacionEntrega || misItems[0].idPedido} — {misItems.length} {misItems.length === 1 ? 'Paquete a entregar' : 'Paquetes a entregar'}
                    </h2>
                  </div>

                  {/* Route Status Button */}
                  {!esRutaIniciada ? (
                    <button
                      onClick={handleIniciarRuta}
                      disabled={iniciarRutaMutation.isPending}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
                    >
                      <Bike size={18} />
                      Comenzar Ruta de Reparto (Salir de Almacén)
                    </button>
                  ) : (
                    <span className="px-4 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold flex items-center gap-2">
                      <Bike size={16} className="animate-pulse text-cyan-400" />
                      Ruta en Curso (Salida de Almacén Registrada)
                    </span>
                  )}
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
                    placeholder="Buscar por código, cliente o distrito..."
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
                  />
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  {!esRutaIniciada ? (
                    <span className="text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-lg">
                      ⚠️ Inicia la ruta para activar el cambio de estados 1 a 1
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg">
                      ✓ Controles activos por paquete
                    </span>
                  )}
                </div>
              </div>

              {/* Custom Deliveries Table Component */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[950px]">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[11px] bg-slate-950/80">
                      <th className="p-3.5 w-10 text-center">#</th>
                      <th className="p-3.5">Código Envío</th>
                      <th className="p-3.5">Comercio Remitente</th>
                      <th className="p-3.5">Cliente / Contacto Directo</th>
                      <th className="p-3.5">Dirección & Distrito</th>
                      <th className="p-3.5 text-right">Cobro</th>
                      <th className="p-3.5 text-center">Estado del Paquete</th>
                      <th className="p-3.5 text-center">Acciones Fila (1 a 1)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {filteredItems.map((item, index) => {
                      const isEntregado = item.idEstadosPedido === EstadoPedidoEnum.Entregado; // 11
                      const isNoEntregado = item.idEstadosPedido === EstadoPedidoEnum.NoEntregado; // 12
                      const isEnRuta = item.idEstadosPedido === EstadoPedidoEnum.EnRuta; // 9
                      const isA5Min = item.idEstadosPedido === EstadoPedidoEnum.A5Minutos; // 10
                      const isAsignado = item.idEstadosPedido === EstadoPedidoEnum.EntregaAsignada; // 8

                      return (
                        <tr
                          key={`delivery_table_row_${item.idPedido}`}
                          className={`transition-colors hover:bg-slate-900/80 ${
                            isEntregado
                              ? 'bg-emerald-950/10'
                              : isNoEntregado
                              ? 'bg-red-950/10'
                              : isA5Min
                              ? 'bg-amber-950/20'
                              : isEnRuta
                              ? 'bg-cyan-950/20'
                              : ''
                          }`}
                        >
                          {/* Row Index */}
                          <td className="p-3.5 text-center font-bold text-slate-400">
                            {index + 1}
                          </td>

                          {/* Tracking Code */}
                          <td className="p-3.5 font-mono font-bold text-violet-300">
                            {item.codigoSeguimiento}
                          </td>

                          {/* Commerce */}
                          <td className="p-3.5">
                            <span className="font-bold text-white block">{item.nombreComercial}</span>
                            <span className="text-[11px] text-slate-400 font-mono">RUC: {item.ruc}</span>
                          </td>

                          {/* Customer Contact */}
                          <td className="p-3.5">
                            <span className="font-bold text-white block text-sm">{item.nombreDestinatario}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <button
                                onClick={() => handleOpenWhatsApp(item.telefonoDestinatario, item.nombreDestinatario, item.codigoSeguimiento)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                                title="Enviar WhatsApp"
                              >
                                <MessageCircle size={12} />
                                WA
                              </button>
                              <button
                                onClick={() => handleOpenCall(item.telefonoDestinatario)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                                title="Llamar al cliente"
                              >
                                <Phone size={12} />
                                {item.telefonoDestinatario}
                              </button>
                            </div>
                          </td>

                          {/* Address & District */}
                          <td className="p-3.5 max-w-xs">
                            <span className="font-bold text-cyan-300 block">📍 {item.distritoNombre}</span>
                            <span className="text-slate-200 font-medium truncate block">{item.direccionDestinatario}</span>
                            {item.referenciaDestinatario && (
                              <span className="text-[11px] text-slate-400 truncate block">Ref: {item.referenciaDestinatario}</span>
                            )}
                            {item.googleMapsUrl && (
                              <a
                                href={item.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 mt-0.5 hover:underline"
                              >
                                <ExternalLink size={10} /> Abrir GPS
                              </a>
                            )}
                          </td>

                          {/* Price Collect */}
                          <td className="p-3.5 text-right font-mono font-extrabold text-sm text-emerald-400">
                            S/ {item.montoCobrar.toFixed(2)}
                          </td>

                          {/* Status Badge */}
                          <td className="p-3.5 text-center">
                            {isEntregado && (
                              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold inline-flex items-center gap-1">
                                <CheckCircle2 size={13} /> Entregado
                              </span>
                            )}
                            {isNoEntregado && (
                              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-extrabold inline-flex items-center gap-1">
                                <XCircle size={13} /> No Entregado
                              </span>
                            )}
                            {isA5Min && (
                              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold inline-flex items-center gap-1 animate-pulse">
                                <Clock size={13} /> A 20 Minutos
                              </span>
                            )}
                            {isEnRuta && (
                              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-extrabold inline-flex items-center gap-1 animate-pulse">
                                <Bike size={13} /> En Ruta a Cliente
                              </span>
                            )}
                            {isAsignado && (
                              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold">
                                Entrega Asignada
                              </span>
                            )}
                          </td>

                          {/* Per-Row Action Buttons */}
                          <td className="p-3.5 text-center">
                            {isEntregado || isNoEntregado ? (
                              <span className="text-[11px] text-slate-500 font-semibold italic">Finalizado</span>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Button 1: Voy en camino */}
                                {isAsignado && (
                                  <button
                                    onClick={() => handleSetEnCaminoCliente(item)}
                                    disabled={!esRutaIniciada || actualizarEstadoMutation.isPending}
                                    title="Avisar a este cliente que vas en camino"
                                    className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/20 flex items-center gap-1 text-[11px]"
                                  >
                                    <Bike size={14} />
                                    <span className="hidden xl:inline">En Camino</span>
                                  </button>
                                )}

                                {/* Button 2: A 20 minutos */}
                                {isEnRuta && (
                                  <button
                                    onClick={() => handleSetA20MinutosCliente(item)}
                                    disabled={!esRutaIniciada || actualizarEstadoMutation.isPending}
                                    title="Notificar cliente a 20 minutos"
                                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1 text-[11px]"
                                  >
                                    <Clock size={14} />
                                    <span className="hidden xl:inline">A 20 Min</span>
                                  </button>
                                )}

                                {/* Button 3: Confirmar Entrega / Cobro */}
                                <button
                                  onClick={() => openConfirmModal(item)}
                                  disabled={!esRutaIniciada}
                                  title="Confirmar entrega realizada y cobrar"
                                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1 text-[11px]"
                                >
                                  <CheckCircle2 size={14} />
                                  <span className="hidden xl:inline">Entregar</span>
                                </button>

                                {/* Button 4: Reprogramar Entrega */}
                                <button
                                  onClick={() => openRescheduleModal(item)}
                                  disabled={!esRutaIniciada}
                                  title="Reprogramar entrega por solicitud del cliente"
                                  className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-purple-300 border border-purple-500/40 font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                                >
                                  <CalendarClock size={14} />
                                  <span className="hidden xl:inline">Reprogramar</span>
                                </button>

                                {/* Button 5: No Entregado */}
                                <button
                                  onClick={() => openFailedModal(item)}
                                  disabled={!esRutaIniciada}
                                  title="Marcar intento fallido / no entregado"
                                  className="p-2 rounded-xl bg-slate-950 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-red-400 border border-slate-800 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                                >
                                  <XCircle size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>

        {/* Modal Confirmar Entrega y Registrar Cobro */}
        {deliveryModalItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
              <button
                onClick={() => setDeliveryModalItem(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50"
              >
                <X size={18} />
              </button>

              <div>
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
                  Confirmación de Entrega
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  Cliente: {deliveryModalItem.nombreDestinatario}
                </h3>
                <p className="text-xs text-slate-400">
                  Monto a cobrar registrado: <strong className="text-emerald-400 font-mono">S/ {deliveryModalItem.montoCobrar.toFixed(2)}</strong>
                </p>
              </div>

              {/* Payment Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">¿Cómo realizó el pago el cliente?</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setTipoPago('efectivo')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      tipoPago === 'efectivo'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <DollarSign size={16} /> Efectivo
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoPago('yape')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      tipoPago === 'yape'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <QrCode size={16} /> Yape / Plin
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoPago('dividido')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      tipoPago === 'dividido'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ⚖️ Pago Dividido
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoPago('comercio')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      tipoPago === 'comercio'
                        ? 'bg-slate-800 border-slate-600 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🛍️ Pagó al Comercio
                  </button>
                </div>
              </div>

              {/* Dynamic Payment Amount Fields */}
              {tipoPago === 'efectivo' && (
                <div>
                  <label className="text-[11px] text-slate-400 font-bold block mb-1">Monto Cobrado en Efectivo (S/)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={montoEfectivo}
                    onChange={(e) => setMontoEfectivo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              {tipoPago === 'yape' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">Monto Cobrado por Yape/Plin (S/)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={montoYape}
                      onChange={(e) => setMontoYape(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-mono text-purple-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">Código de Operación Yape (Opcional)</label>
                    <input
                      type="text"
                      value={referenciaYape}
                      onChange={(e) => setReferenciaYape(e.target.value)}
                      placeholder="Ej: 9874521"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              )}

              {tipoPago === 'dividido' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold block mb-1">Monto Efectivo (S/)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={montoEfectivo}
                        onChange={(e) => setMontoEfectivo(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 font-bold block mb-1">Monto Yape (S/)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={montoYape}
                        onChange={(e) => setMontoYape(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-purple-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 font-bold block mb-1">Código de Operación Yape (Opcional)</label>
                    <input
                      type="text"
                      value={referenciaYape}
                      onChange={(e) => setReferenciaYape(e.target.value)}
                      placeholder="Ej: 9874521"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs font-mono text-slate-200"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleConfirmarEntrega}
                disabled={actualizarEstadoMutation.isPending}
                className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <CheckCircle2 size={18} />
                Confirmar Entrega Realizada
              </button>
            </div>
          </div>
        )}

        {/* Modal No Entregado */}
        {failedModalItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <button
                onClick={() => setFailedModalItem(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50"
              >
                <X size={18} />
              </button>

              <div>
                <span className="text-xs text-red-400 font-bold uppercase tracking-wider block">
                  Intento Fallido de Entrega
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Cliente: {failedModalItem.nombreDestinatario}
                </h3>
                <p className="text-xs text-slate-400">
                  Registra el motivo por el cual no se logró concretar la entrega del paquete.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Motivo o Incidencia:</label>
                <textarea
                  value={motivoFallo}
                  onChange={(e) => setMotivoFallo(e.target.value)}
                  rows={3}
                  placeholder="Ej: Cliente no responde llamadas, dirección vacía, rechazado..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200"
                />
              </div>

              <button
                onClick={handleConfirmarNoEntregado}
                disabled={actualizarEstadoMutation.isPending}
                className="w-full py-3 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-500/20 active:scale-95 transition-all"
              >
                <XCircle size={16} />
                Registrar Intento Fallido
              </button>
            </div>
          </div>
        )}

        {/* Modal Reprogramar Entrega */}
        {rescheduleModalItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <button
                onClick={() => setRescheduleModalItem(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50"
              >
                <X size={18} />
              </button>

              <div>
                <span className="text-xs text-purple-400 font-bold uppercase tracking-wider block flex items-center gap-1.5">
                  <CalendarClock size={14} /> Reprogramación de Entrega
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Cliente: {rescheduleModalItem.nombreDestinatario}
                </h3>
                <p className="text-xs text-slate-400">
                  Código de Envío: <strong className="text-purple-300 font-mono">{rescheduleModalItem.codigoSeguimiento}</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 block">Observación / Solicitud del Cliente:</label>
                <textarea
                  value={motivoReprogramacion}
                  onChange={(e) => setMotivoReprogramacion(e.target.value)}
                  rows={3}
                  placeholder="Ej: Cliente solicitó entregar el día de mañana por estar ausente hoy..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-purple-500 outline-none"
                />
              </div>

              <button
                onClick={handleConfirmarReprogramacion}
                disabled={actualizarEstadoMutation.isPending}
                className="w-full py-3 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
              >
                <CalendarClock size={16} />
                Guardar Reprogramación
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

export default MotorizadoEntregasPage;
