import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../application/context/AuthContext';
import { useRastrearPedidoPorCodigo } from '../../application/useCases/useMisPedidos';
import { usePWAInstall } from '../../application/hooks/usePWAInstall';
import {
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Store,
  Bike,
  Building2,
  Navigation,
  FileText,
  AlertCircle,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  LogIn,
  UserPlus,
  Download
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { isInstalled, promptInstall } = usePWAInstall();

  const [inputCode, setInputCode] = useState('');
  const [activeCode, setActiveCode] = useState('');

  const { data: pedidoData, isLoading, isError } = useRastrearPedidoPorCodigo(activeCode);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setActiveCode(inputCode.trim());
    }
  };

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
      case 10: // A 5 Minutos
        return 5;
      case 11: // Entregado
        return 6;
      default:
        return 1;
    }
  };

  const currentStep = pedidoData ? getStepProgress(pedidoData.idEstadosPedido) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-violet-600 selection:text-white overflow-x-hidden">
      
      {/* Top Navbar */}
      <header className="h-20 border-b border-slate-900 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white font-black text-lg flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-all">
              AC
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight block leading-tight">
                ALMAIN CURRIER
              </span>
              <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider block">
                Agencia Logística Expresa
              </span>
            </div>
          </Link>

          {/* User Auth Buttons or Panel Link */}
          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated && user ? (
              <Link
                to="/dashboard"
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-violet-600/30 transition-all flex items-center gap-2"
              >
                <span>Ir a mi Panel ({user.rolNombre})</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all flex items-center gap-2"
                >
                  <LogIn size={15} />
                  <span>Ingresar</span>
                </Link>

                <Link
                  to="/register"
                  className="px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-violet-600/20 transition-all flex items-center gap-2"
                >
                  <UserPlus size={15} />
                  <span className="hidden sm:inline">Afiliar Comercio</span>
                  <span className="sm:hidden">Registro</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero & Tracking Search Section */}
      <main className="flex-1">
        <section className="relative py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
          
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-violet-600/10 blur-[120px] pointer-events-none rounded-full" />

          {/* Hero Header Text */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider">
              <Zap size={14} className="text-violet-400 animate-pulse" />
              <span>Seguimiento de Envíos en Tiempo Real</span>
            </div>

            {/* Prominent PWA Download/Install Button below the badge */}
            {!isInstalled && (
              <div className="pt-2 pb-1 flex justify-center">
                <button
                  onClick={promptInstall}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-950/90 via-slate-900 to-indigo-950/90 border border-violet-500/50 hover:border-violet-400 text-white text-xs sm:text-sm font-extrabold shadow-xl shadow-violet-600/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <img src="/logoAlmain.png" alt="Logo Almain" className="w-7 h-7 object-contain rounded-lg shadow-md shrink-0" />
                  <div className="text-left">
                    <span className="block leading-tight font-extrabold text-violet-200">Instalar ALMAIN CURRIER App</span>
                    <span className="block text-[10px] text-slate-400 font-normal">Añadir a pantalla de inicio en Android / iOS / Windows</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/50 text-violet-300 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all ml-1 shrink-0">
                    <Download size={16} />
                  </div>
                </button>
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Rastrea tu pedido sin necesidad de registrarte
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Si compraste en una tienda afiliada a <strong className="text-slate-200">ALMAIN CURRIER</strong>, ingresa aquí tu código de envío para conocer el estado y ubicación de tu paquete en vivo.
            </p>
          </div>

          {/* Public Search Bar Box */}
          <div className="max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 relative z-10">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Código de envío (Ej. DD-20260727-EF126C)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all uppercase"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
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
              <span>Consultando paquete en vivo con los almacenes...</span>
            </div>
          )}

          {/* Not Found State */}
          {!isLoading && isError && activeCode && (
            <div className="max-w-2xl mx-auto py-10 px-6 bg-red-950/20 border border-red-500/30 rounded-3xl text-center space-y-3">
              <AlertCircle className="mx-auto text-red-400" size={40} />
              <h3 className="text-base font-bold text-white">No encontramos el envío con código "{activeCode}"</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Verifica que el código de seguimiento coincida con el proporcionado por tu comercio remitente.
              </p>
            </div>
          )}

          {/* Result Tracking Details */}
          {!isLoading && pedidoData && (
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Package Summary Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] text-violet-400 font-bold uppercase tracking-wider block">
                      Código de Seguimiento Activo
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
                    Avance de Entrega en Tiempo Real
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

                    {/* Step 5: A 5 Minutos */}
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
                      <span className="text-[11px] font-bold block">5. A 5 Min</span>
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
                      Detalles del Destino
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
                        Monto a Cobrar & Repartidor
                      </span>

                      <div>
                        <span className="text-slate-400 block text-[11px]">Cobro Total Contra-Entrega:</span>
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
                          El paquete se encuentra en el almacén central listo para ser asignado al motorizado de ruta.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Feature Highlights Grid */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            
            {/* Feature 1 */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-white text-base">Rastreo WebSockets</h3>
              <p className="text-xs text-slate-400">
                Línea de tiempo conectada en tiempo real. Entérate cuando el motorizado esté a 5 minutos de tu puerta.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Store size={24} />
              </div>
              <h3 className="font-bold text-white text-base">Agendamiento Comercio</h3>
              <p className="text-xs text-slate-400">
                Comercios y tiendas afiliadas agendan recojos directamente para despachar paquetes el mismo día.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Bike size={24} />
              </div>
              <h3 className="font-bold text-white text-base">Drivers Calificados</h3>
              <p className="text-xs text-slate-400">
                Flota de motorizados capacitados con asignación inteligente de rutas por distritos y zonas de entrega.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-white text-base">Cobros Contra-Entrega</h3>
              <p className="text-xs text-slate-400">
                Opción de pago en efectivo o transferencia digital Yape/Plin al momento de recibir el producto.
              </p>
            </div>

          </div>

          {/* CTA Banner for Commerce Affiliation */}
          <div className="bg-gradient-to-r from-violet-950/80 via-indigo-950/60 to-slate-900/80 border border-violet-500/30 rounded-3xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                ¿Tienes una tienda o emprendimiento?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Afíliate a <strong className="text-violet-300">ALMAIN CURRIER</strong> para gestionar tus envíos, definir direcciones de recojo y brindar seguimiento en vivo a tus clientes.
              </p>
            </div>

            <Link
              to={isAuthenticated ? (user?.rolNombre === 'ClienteFinal' ? '/comercio/upgrade' : '/dashboard') : '/register'}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-violet-600/30 transition-all shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>{isAuthenticated && user?.rolNombre === 'ClienteFinal' ? 'Completar Afiliación a Comercio' : 'Afiliar Mi Comercio Ahora'}</span>
              <ArrowRight size={18} />
            </Link>
          </div>

        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-400">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white text-xs font-black flex items-center justify-center">
            AC
          </div>
          <span>ALMAIN CURRIER S.A.C.</span>
        </div>
        <p>© {new Date().getFullYear()} ALMAIN CURRIER. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
