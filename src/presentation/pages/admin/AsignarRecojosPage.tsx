import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import {
  useConductoresDisponibles,
  usePedidosPendientesRecojo,
  useAsignarRecojo
} from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import {
  Bike,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { RecojosKpiCards } from '../../components/asignarRecojos/RecojosKpiCards';
import { SeleccionMotorizadoRecojo } from '../../components/asignarRecojos/SeleccionMotorizadoRecojo';
import { FiltrosRecojosBar } from '../../components/asignarRecojos/FiltrosRecojosBar';
import { AcordeonComercioRecojo, type ComercioPendingGroup } from '../../components/asignarRecojos/AcordeonComercioRecojo';
import { BarraAsignarRecojoFlotante } from '../../components/asignarRecojos/BarraAsignarRecojoFlotante';

const getTodayFormatted = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AsignarRecojosPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [openCommerceIds, setOpenCommerceIds] = useState<number[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [selectedPedidoIds, setSelectedPedidoIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaInicio, setFechaInicio] = useState<string>(getTodayFormatted());
  const [fechaFin, setFechaFin] = useState<string>(getTodayFormatted());
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { data: conductores, isLoading: loadingConductores, refetch: refetchConductores } = useConductoresDisponibles();
  const { data: pendientes, isLoading: loadingPendientes, refetch: refetchPendientes } = usePedidosPendientesRecojo({ fechaInicio, fechaFin });
  const asignarMutation = useAsignarRecojo();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Group pending orders by Comercio (filtered by Date and Search)
  const comercioGroups = useMemo<ComercioPendingGroup[]>(() => {
    if (!pendientes || pendientes.length === 0) return [];

    // Filter by Date Range
    const dateFiltered = pendientes.filter((p) => {
      if (!p.fechaRegistro) return true;
      const pDateStr = p.fechaRegistro.split('T')[0];
      if (fechaInicio && pDateStr < fechaInicio) return false;
      if (fechaFin && pDateStr > fechaFin) return false;
      return true;
    });

    const groupMap: { [key: string]: ComercioPendingGroup } = {};

    dateFiltered.forEach((p) => {
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
          totalMontoCobrar: 0,
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
  }, [pendientes, fechaInicio, fechaFin, searchTerm]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(comercioGroups.length / pageSize));
  const paginatedComercioGroups = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return comercioGroups.slice(start, start + pageSize);
  }, [comercioGroups, currentPage, pageSize]);

  // Open all accordions by default
  useEffect(() => {
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
        idPedidos: selectedPedidoIds,
      });

      setFeedbackMsg({
        type: 'success',
        text: `¡Ruta de recojo asignada exitosamente con ${selectedPedidoIds.length} paquetes para recojo!`,
      });

      setSelectedPedidoIds([]);
      setSelectedDriverId(null);
      refetchPendientes();
      refetchConductores();
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Error al asignar la ruta de recojo al motorizado.',
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
              type="button"
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

          {/* Top KPI Summary Cards */}
          <RecojosKpiCards
            totalPendientesCount={totalPendientesCount}
            totalComerciosCount={comercioGroups.length}
            totalConductoresCount={conductores?.length ?? 0}
          />

          {/* STEP 1: Driver Selection Grid */}
          <SeleccionMotorizadoRecojo
            conductores={conductores}
            loadingConductores={loadingConductores}
            selectedDriverId={selectedDriverId}
            handleToggleDriver={handleToggleDriver}
            selectedDriverName={selectedDriver?.nombreCompleto}
          />

          {/* Controls Bar: Search & Date Filters */}
          <FiltrosRecojosBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            fechaInicio={fechaInicio}
            setFechaInicio={setFechaInicio}
            fechaFin={fechaFin}
            setFechaFin={setFechaFin}
            todayFormatted={getTodayFormatted()}
            onResetPage={() => setCurrentPage(1)}
            selectedCount={selectedPedidoIds.length}
          />

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
            paginatedComercioGroups.map((group) => (
              <AcordeonComercioRecojo
                key={`pending_comercio_${group.idComercio}`}
                group={group}
                isOpen={openCommerceIds.includes(group.idComercio)}
                onToggleAccordion={toggleAccordion}
                selectedPedidoIds={selectedPedidoIds}
                onTogglePedido={handleTogglePedido}
                onToggleComercioAll={handleToggleComercioAll}
              />
            ))}

          {/* Pagination Controls */}
          {!loadingPendientes && comercioGroups.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-900 text-xs">
              <span className="text-slate-400 font-medium">
                Mostrando {Math.min((currentPage - 1) * pageSize + 1, comercioGroups.length)} a{' '}
                {Math.min(currentPage * pageSize, comercioGroups.length)} de{' '}
                <strong className="text-white">{comercioGroups.length}</strong> comercios con recojos pendientes
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
        <BarraAsignarRecojoFlotante
          selectedPedidoIds={selectedPedidoIds}
          selectedDriver={selectedDriver}
          selectedDriverId={selectedDriverId}
          isPending={asignarMutation.isPending}
          onAsignarRuta={handleAsignarRuta}
        />

        {/* Mobile Bottom Nav */}
        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default AsignarRecojosPage;
