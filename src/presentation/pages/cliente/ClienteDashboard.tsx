import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { useRastrearPedidoPorCodigo } from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Store,
  LogOut,
  Bike,
  MessageCircle,
  FileText,
  AlertCircle,
  Building2,
  Navigation
} from 'lucide-react';

export const ClienteDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState('');
  const [activeCode, setActiveCode] = useState('');
  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  const { data: pedidoData, isLoading, isError } = useRastrearPedidoPorCodigo(activeCode);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setActiveCode(inputCode.trim());
    }
  };

  if (!user) return null;

  // Helper to determine active step in visual timeline (1 to 6)
  const getStepProgress = (idEstado: number) => {
    if (!idEstado) return 1;
    switch (idEstado) {
      case 1: // Registrado
      case 2: // RecojoAsignado
      case 3: // En Camino al Comercio
      case 4: // Llegó al Comercio
      case 5: // Recogido
      case 6: // En Camino al Almacén
        return 1;
      case 7: // En Almacén
        return 2;
      case 8: // EntregaAsignada
        return 3;
      case 9: // En Ruta
        return 4;
      case 10: // A 20 Minutos
        return 5;
      case 11: // Entregado
        return 6;
      default:
        return 1;
    }
  };

  const currentStep = pedidoData ? getStepProgress(pedidoData.idEstadosPedido) : 0;

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
            <Search className="text-violet-400 shrink-0" size={24} />
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Rastreo de Paquetes & Envíos
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Consulta la ubicación y estado en tiempo real de tus compras agendadas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
              Cliente Final
            </span>
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
        <main className="flex-1 p-4 sm:p-8 max-w-5xl w-full mx-auto space-y-8">
          
          {/* Banner Opciones para Hacerse Comercio */}
          {user.rolNombre === 'ClienteFinal' && (
            <div className="bg-gradient-to-r from-violet-950/60 via-indigo-950/40 to-slate-900/60 border border-violet-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/20">
                  <Store size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">¿Tienes una tienda o emprendimiento?</h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Conviértete en Comercio Afiliado para agendar envíos, definir tu dirección de recojo y solicitar motorizados en tiempo real.
                  </p>
                </div>
              </div>
              <Link
                to="/comercio/upgrade"
                className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all shrink-0 cursor-pointer"
              >
                Activar Perfil Comercio
              </Link>
            </div>
          )}

          {/* Code Search Box Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="text-center sm:text-left space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                <Package className="text-violet-400" size={20} />
                Ingresa tu Código de Seguimiento
              </h2>
              <p className="text-xs text-slate-400">
                Introduce el código alfanumérico proporcionado por la tienda o comercio (Ejemplo: <strong className="text-violet-300">DD-20260727-EF126C</strong>).
              </p>
            </div>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Ej. DD-20260727-EF126C"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all uppercase"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Search size={16} />
                <span>Rastrear Envío</span>
              </button>
            </form>
          </div>

          {/* Loading State */}
          {isLoading && activeCode && (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Clock className="animate-spin text-violet-400" size={28} />
              <span>Buscando paquete en el sistema...</span>
            </div>
          )}

          {/* Not Found State */}
          {!isLoading && isError && activeCode && (
            <div className="py-12 px-6 bg-red-950/20 border border-red-500/30 rounded-3xl text-center space-y-3">
              <AlertCircle className="mx-auto text-red-400" size={40} />
              <h3 className="text-base font-bold text-white">No encontramos el envío con código "{activeCode}"</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Verifica que el código esté escrito correctamente o consulta con el comercio donde realizaste la compra.
              </p>
            </div>
          )}

          {/* Result Tracking Details */}
          {!isLoading && pedidoData && (
            <div className="space-y-6">
              
              {/* Package Summary Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] text-violet-400 font-bold uppercase tracking-wider block">
                      Código de Seguimiento
                    </span>
                    <h3 className="text-2xl font-mono font-extrabold text-white mt-0.5">
                      {pedidoData.codigoSeguimiento}
                    </h3>
                  </div>

                  <div className="px-4 py-2 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-300 font-extrabold text-sm flex items-center gap-2">
                    <Truck size={18} />
                    <span>{pedidoData.estadoNombre}</span>
                  </div>
                </div>

                {/* 6-Step Visual Timeline Progress */}
                <div className="space-y-4 pt-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                    Línea de Tiempo del Envió
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {/* Step 1: Registrado */}
                    <div
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        currentStep >= 1
                          ? currentStep === 1
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-extrabold ring-1 ring-emerald-500/40 animate-pulse'
                            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full font-mono font-extrabold text-[11px] flex items-center justify-center mx-auto mb-1.5 ${
                        currentStep >= 1 ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border border-slate-800 text-slate-600'
                      }`}>
                        1
                      </span>
                      <FileText className="mx-auto mb-1" size={18} />
                      <span className="text-[11px] font-bold block">1. Registrado</span>
                      <span className="text-[9px] block text-slate-400">Por Comercio</span>
                    </div>

                    {/* Step 2: En Almacén */}
                    <div
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        currentStep >= 2
                          ? currentStep === 2
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-extrabold ring-1 ring-emerald-500/40 animate-pulse'
                            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full font-mono font-extrabold text-[11px] flex items-center justify-center mx-auto mb-1.5 ${
                        currentStep >= 2 ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border border-slate-800 text-slate-600'
                      }`}>
                        2
                      </span>
                      <Building2 className="mx-auto mb-1" size={18} />
                      <span className="text-[11px] font-bold block">2. En Almacén</span>
                      <span className="text-[9px] block text-slate-400">Recepcionado</span>
                    </div>

                    {/* Step 3: Entrega Asignada */}
                    <div
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        currentStep >= 3
                          ? currentStep === 3
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-extrabold ring-1 ring-emerald-500/40 animate-pulse'
                            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full font-mono font-extrabold text-[11px] flex items-center justify-center mx-auto mb-1.5 ${
                        currentStep >= 3 ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border border-slate-800 text-slate-600'
                      }`}>
                        3
                      </span>
                      <Bike className="mx-auto mb-1" size={18} />
                      <span className="text-[11px] font-bold block">3. Asignado</span>
                      <span className="text-[9px] block text-slate-400">A Driver</span>
                    </div>

                    {/* Step 4: En Ruta */}
                    <div
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        currentStep >= 4
                          ? currentStep === 4
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-extrabold ring-1 ring-emerald-500/40 animate-pulse'
                            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full font-mono font-extrabold text-[11px] flex items-center justify-center mx-auto mb-1.5 ${
                        currentStep >= 4 ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border border-slate-800 text-slate-600'
                      }`}>
                        4
                      </span>
                      <Truck className="mx-auto mb-1" size={18} />
                      <span className="text-[11px] font-bold block">4. En Ruta</span>
                      <span className="text-[9px] block text-slate-400">En camino</span>
                    </div>

                    {/* Step 5: A 20 Minutos */}
                    <div
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        currentStep >= 5
                          ? currentStep === 5
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-extrabold ring-1 ring-emerald-500/40 animate-pulse'
                            : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full font-mono font-extrabold text-[11px] flex items-center justify-center mx-auto mb-1.5 ${
                        currentStep >= 5 ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300' : 'bg-slate-900 border border-slate-800 text-slate-600'
                      }`}>
                        5
                      </span>
                      <Navigation className="mx-auto mb-1" size={18} />
                      <span className="text-[11px] font-bold block">5. A 20 Min</span>
                      <span className="text-[9px] block text-slate-400">Cerca al punto</span>
                    </div>

                    {/* Step 6: Entregado */}
                    <div
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        currentStep >= 6
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-extrabold'
                          : 'bg-slate-950/60 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full font-mono font-extrabold text-[11px] flex items-center justify-center mx-auto mb-1.5 ${
                        currentStep >= 6 ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-900 border border-slate-800 text-slate-600'
                      }`}>
                        6
                      </span>
                      <CheckCircle2 className="mx-auto mb-1" size={18} />
                      <span className="text-[11px] font-bold block">6. Entregado</span>
                      <span className="text-[9px] block text-slate-400">Completado</span>
                    </div>
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800 text-xs">
                  {/* Origin & Destination */}
                  <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-900">
                    <span className="font-bold text-slate-300 block text-xs">
                      Información del Envío
                    </span>
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Comercio Remitente:</span>
                        <strong className="text-white text-sm">{pedidoData.nombreRemitente}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Cliente Destinatario:</span>
                        <strong className="text-slate-200">{pedidoData.nombreDestinatario} ({pedidoData.telefonoDestinatario})</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Dirección de Entrega:</span>
                        <span className="text-slate-300">📍 {pedidoData.distritoNombre} — {pedidoData.direccionDestinatario}</span>
                      </div>
                      {pedidoData.referenciaDestinatario && (
                        <div>
                          <span className="text-slate-400 block text-[11px]">Referencia:</span>
                          <span className="text-slate-400 italic">{pedidoData.referenciaDestinatario}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment & Driver Details */}
                  <div className="space-y-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-900 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="font-bold text-slate-300 block text-xs">
                        Pago contra-entrega & Repartidor
                      </span>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Cobro Total Delivery / Producto:</span>
                        <strong className="text-emerald-400 text-lg font-mono font-extrabold">
                          S/ {pedidoData.montoCobrar.toFixed(2)}
                        </strong>
                      </div>

                      {/* Driver Card if assigned */}
                      {pedidoData.nombreConductor ? (
                        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1 mt-2">
                          <span className="text-[10px] text-cyan-400 font-bold uppercase block">
                            Repartidor Asignado
                          </span>
                          <div className="flex items-center justify-between">
                            <div>
                              <strong className="text-white block text-sm">{pedidoData.nombreConductor}</strong>
                              <span className="text-[11px] text-slate-400">
                                {pedidoData.tipoVehiculo} (Placa: <strong className="text-cyan-300">{pedidoData.placaVehiculo}</strong>)
                              </span>
                            </div>

                            {pedidoData.telefonoConductor && (
                              <a
                                href={`https://wa.me/51${pedidoData.telefonoConductor.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                              >
                                <MessageCircle size={14} />
                                WSp
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 text-[11px]">
                          Motorizado pendiente de asignación por almacén.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

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

export default ClienteDashboard;
