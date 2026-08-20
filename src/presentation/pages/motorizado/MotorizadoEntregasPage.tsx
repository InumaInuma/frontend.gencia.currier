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
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';

import { HeaderRutaMotorizado } from '../../components/motorizadoEntregas/HeaderRutaMotorizado';
import { ModalConfirmarEntrega } from '../../components/motorizadoEntregas/ModalConfirmarEntrega';
import { ModalReprogramarEntrega } from '../../components/motorizadoEntregas/ModalReprogramarEntrega';
import { ModalIntentoFallido } from '../../components/motorizadoEntregas/ModalIntentoFallido';
import { TablaEntregasMotorizado } from '../../components/motorizadoEntregas/TablaEntregasMotorizado';

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
  const [rescheduleModalItem, setRescheduleModalItem] = useState<IMonitoreoEntrega | null>(null);

  // Payment form state inside Confirm Modal
  const [tipoPago, setTipoPago] = useState<'efectivo' | 'yape' | 'dividido' | 'comercio'>('efectivo');
  const [montoEfectivo, setMontoEfectivo] = useState<string>('');
  const [montoYape, setMontoYape] = useState<string>('');
  const [referenciaYape, setReferenciaYape] = useState<string>('');

  // Failed & Reschedule modal state
  const [motivoFallo, setMotivoFallo] = useState<string>('Cliente ausente / No responde llamadas');
  const [motivoReprogramacion, setMotivoReprogramacion] = useState(
    'Cliente solicitó reprogramar entrega para el día de mañana'
  );

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
      tipoVehiculo: first.tipoVehiculo,
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
        idEstado: EstadoPedidoEnum.EnRuta, // 9
      });
      setFeedbackMsg({
        type: 'success',
        text: `Se notificó al cliente ${item.nombreDestinatario} que estás en camino.`,
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
        idEstado: EstadoPedidoEnum.A5Minutos, // 10
      });
      setFeedbackMsg({
        type: 'success',
        text: `Se notificó a ${item.nombreDestinatario} que estás a 20 minutos de llegar.`,
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
    const totalCalculado = item.montoCobrar + (item.destinatarioPagaEnvio ? (item.tarifaEnvio || 0) : 0);
    if (totalCalculado > 0) {
      setTipoPago('efectivo');
      setMontoEfectivo(totalCalculado.toString());
      setMontoYape('0');
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
        referenciaYape: referenciaYape.trim(),
      });

      setFeedbackMsg({
        type: 'success',
        text: `¡Paquete entregado a ${deliveryModalItem.nombreDestinatario} exitosamente!`,
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
        observacion: motivoFallo,
      });

      setFeedbackMsg({
        type: 'success',
        text: `Paquete registrado como NO ENTREGADO (${failedModalItem.nombreDestinatario}).`,
      });
      setFailedModalItem(null);
      refetch();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Error al marcar no entregado.' });
    }
  };

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
        observacion: motivoReprogramacion,
      });

      setFeedbackMsg({
        type: 'success',
        text: `Paquete registrado como REPROGRAMADO (${rescheduleModalItem.nombreDestinatario}).`,
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
              <HeaderRutaMotorizado
                misItems={misItems}
                esRutaIniciada={esRutaIniciada}
                onIniciarRuta={handleIniciarRuta}
                isPending={iniciarRutaMutation.isPending}
              />

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

              {/* Delivery Table & Mobile Cards Component */}
              <TablaEntregasMotorizado
                filteredItems={filteredItems}
                esRutaIniciada={esRutaIniciada}
                isPending={actualizarEstadoMutation.isPending}
                onSetEnCaminoCliente={handleSetEnCaminoCliente}
                onSetA20MinutosCliente={handleSetA20MinutosCliente}
                onOpenConfirmModal={openConfirmModal}
                onOpenRescheduleModal={openRescheduleModal}
                onOpenFailedModal={openFailedModal}
                onOpenWhatsApp={handleOpenWhatsApp}
                onOpenCall={handleOpenCall}
              />
            </>
          )}
        </main>

        {/* Modal Confirmar Entrega y Registrar Cobro */}
        <ModalConfirmarEntrega
          deliveryModalItem={deliveryModalItem}
          onClose={() => setDeliveryModalItem(null)}
          tipoPago={tipoPago}
          setTipoPago={setTipoPago}
          montoEfectivo={montoEfectivo}
          setMontoEfectivo={setMontoEfectivo}
          montoYape={montoYape}
          setMontoYape={setMontoYape}
          referenciaYape={referenciaYape}
          setReferenciaYape={setReferenciaYape}
          onConfirmarEntrega={handleConfirmarEntrega}
          isPending={actualizarEstadoMutation.isPending}
        />

        {/* Modal Reprogramar Entrega */}
        <ModalReprogramarEntrega
          rescheduleModalItem={rescheduleModalItem}
          onClose={() => setRescheduleModalItem(null)}
          motivoReprogramacion={motivoReprogramacion}
          setMotivoReprogramacion={setMotivoReprogramacion}
          onConfirmarReprogramacion={handleConfirmarReprogramacion}
          isPending={actualizarEstadoMutation.isPending}
        />

        {/* Modal Intento Fallido */}
        <ModalIntentoFallido
          failedModalItem={failedModalItem}
          onClose={() => setFailedModalItem(null)}
          motivoFallo={motivoFallo}
          setMotivoFallo={setMotivoFallo}
          onConfirmarNoEntregado={handleConfirmarNoEntregado}
          isPending={actualizarEstadoMutation.isPending}
        />

        {/* Mobile Bottom Nav */}
        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default MotorizadoEntregasPage;
