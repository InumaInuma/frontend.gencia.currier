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
  Download,
  Phone,
  Mail,
  MapPin,
  Star,
  Users,
  Award,
  Calendar,
  Send,
  Menu,
  X
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { isInstalled, promptInstall } = usePWAInstall();

  const [inputCode, setInputCode] = useState('');
  const [activeCode, setActiveCode] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Quick contact form state
  const [contactName, setContactName] = useState('');
  const [contactBusiness, setContactBusiness] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const { data: pedidoData, isLoading, isError } = useRastrearPedidoPorCodigo(activeCode);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      setActiveCode(inputCode.trim());
      // Smooth scroll to tracking results if submitted
      const resultsEl = document.getElementById('resultado-rastreo');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSendWhatsAppContact = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = '51966622023'; // WhatsApp Fragata Courier
    const text = `Hola Fragata Courier, me contacto desde la web.%0A*Nombre:* ${encodeURIComponent(contactName)}%0A*Comercio:* ${encodeURIComponent(contactBusiness)}%0A*Teléfono:* ${encodeURIComponent(contactPhone)}%0A*Consulta:* ${encodeURIComponent(contactMessage || 'Deseo cotizar envíos para mi negocio.')}`;
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-red-600 selection:text-white overflow-x-hidden font-sans">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER / NAVBAR
      ────────────────────────────────────────────────────────────── */}
      <header className="h-20 border-b border-slate-900 bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logofragata.jpg"
              alt="Logo Fragata Courier"
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-2xl object-contain bg-white/95 p-1 shadow-lg shadow-red-500/10 border border-slate-800 group-hover:scale-105 transition-all"
            />
            <div>
              <span className="font-black text-white text-lg sm:text-xl tracking-tight block leading-tight">
                FRAGATA <span className="text-red-500">COURIER</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Agencia Logística Expresa
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-300">
            <a href="#rastreo" className="hover:text-red-400 transition-colors">
              Rastrear Envío
            </a>
            <a href="#nosotros" className="hover:text-red-400 transition-colors">
              Quiénes Somos
            </a>
            <a href="#servicios" className="hover:text-red-400 transition-colors">
              Servicios
            </a>
            <a href="#empresas" className="hover:text-red-400 transition-colors">
              Empresas Aliadas
            </a>
            <a href="#contacto" className="hover:text-red-400 transition-colors">
              Contacto
            </a>
          </nav>

          {/* User Auth Buttons or Panel Link */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated && user ? (
              <Link
                to="/dashboard"
                className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-red-600/30 transition-all flex items-center gap-2"
              >
                <span>Panel ({user.rolNombre})</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <LogIn size={15} />
                  <span>Ingresar</span>
                </Link>

                <Link
                  to="/register"
                  className="px-3.5 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-lg shadow-red-600/20 transition-all flex items-center gap-1.5"
                >
                  <UserPlus size={15} />
                  <span className="hidden sm:inline">Afiliar Comercio</span>
                  <span className="sm:hidden">Registro</span>
                </Link>
              </>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fade-in">
            <a
              href="#rastreo"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-300 hover:text-red-400 py-1"
            >
              🔍 Rastrear Envío
            </a>
            <a
              href="#nosotros"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-300 hover:text-red-400 py-1"
            >
              🏢 Quiénes Somos
            </a>
            <a
              href="#servicios"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-300 hover:text-red-400 py-1"
            >
              📦 Servicios
            </a>
            <a
              href="#empresas"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-300 hover:text-red-400 py-1"
            >
              🤝 Empresas Aliadas
            </a>
            <a
              href="#contacto"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-slate-300 hover:text-red-400 py-1"
            >
              📞 Contacto
            </a>
          </div>
        )}
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN HERO & TRACKING SEARCH SECTION
      ────────────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <section id="rastreo" className="relative py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
          
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />

          {/* Hero Header Text */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider shadow-sm">
              <Zap size={14} className="text-red-400 animate-pulse" />
              <span>Seguimiento de Envíos en Tiempo Real • Lima & Callao</span>
            </div>

            {/* Prominent PWA Download/Install Button */}
            {!isInstalled && (
              <div className="pt-2 pb-1 flex justify-center">
                <button
                  onClick={promptInstall}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-red-950/90 via-slate-900 to-slate-950 border border-red-500/40 hover:border-red-400 text-white text-xs sm:text-sm font-extrabold shadow-xl shadow-red-600/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-3.5 group"
                >
                  <img src="/logofragata.jpg" alt="Logo Fragata" className="w-7 h-7 object-contain rounded-lg bg-white p-0.5 shadow-md shrink-0" />
                  <div className="text-left">
                    <span className="block leading-tight font-extrabold text-red-200">Instalar FRAGATA COURIER App</span>
                    <span className="block text-[10px] text-slate-400 font-normal">Añadir a pantalla de inicio en Android / iOS / Windows</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-red-600/30 border border-red-500/50 text-red-300 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all ml-1 shrink-0">
                    <Download size={16} />
                  </div>
                </button>
              </div>
            )}

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Rastrea tu pedido sin necesidad de registrarte
            </h1>

            <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              Si compraste en una tienda afiliada a <strong className="text-white">FRAGATA COURIER</strong>, ingresa aquí tu código de envío para conocer el estado y ubicación de tu paquete en vivo.
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
                  placeholder="CÓDIGO DE ENVÍO (EJ. DD-20260909-178E32)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-all uppercase"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Search size={16} />
                <span>Rastrear Envío</span>
              </button>
            </form>
          </div>

          {/* Results Container */}
          <div id="resultado-rastreo">
            {/* Loading State */}
            {isLoading && activeCode && (
              <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <Clock className="animate-spin text-red-400" size={28} />
                <span>Consultando paquete en vivo con la central operativa...</span>
              </div>
            )}

            {/* Not Found State */}
            {!isLoading && isError && activeCode && (
              <div className="max-w-2xl mx-auto py-10 px-6 bg-red-950/20 border border-red-500/30 rounded-3xl text-center space-y-3">
                <AlertCircle className="mx-auto text-red-400" size={40} />
                <h3 className="text-base font-bold text-white">No encontramos el envío con código "{activeCode}"</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Verifica que el código de seguimiento coincida con el proporcionado por tu tienda remitente.
                </p>
              </div>
            )}

            {/* Result Tracking Details */}
            {!isLoading && pedidoData && (
              <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                
                {/* Package Summary Card */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[11px] text-red-400 font-bold uppercase tracking-wider block">
                        Código de Seguimiento Activo
                      </span>
                      <h3 className="text-2xl font-mono font-extrabold text-white mt-0.5">
                        {pedidoData.codigoSeguimiento}
                      </h3>
                    </div>

                    <div className="px-4 py-2 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 font-extrabold text-sm flex items-center gap-2">
                      <Truck size={18} />
                      <span>{pedidoData.estadoNombre}</span>
                    </div>
                  </div>

                  {/* 6-Step Visual Timeline Progress */}
                  <div className="space-y-4 pt-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                      Línea de Tiempo de Entrega
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
                          currentStep >= 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>1</span>
                        <CheckCircle2 className="mx-auto mb-1" size={18} />
                        <span className="text-[11px] font-bold block">1. Registrado</span>
                        <span className="text-[9px] block text-slate-400">Por Tienda</span>
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
                          currentStep >= 2 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>2</span>
                        <Building2 className="mx-auto mb-1" size={18} />
                        <span className="text-[11px] font-bold block">2. En Almacén</span>
                        <span className="text-[9px] block text-slate-400">Clasificado</span>
                      </div>

                      {/* Step 3: Asignado a Chofer */}
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
                          currentStep >= 3 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>3</span>
                        <Bike className="mx-auto mb-1" size={18} />
                        <span className="text-[11px] font-bold block">3. Asignado</span>
                        <span className="text-[9px] block text-slate-400">A Repartidor</span>
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
                          currentStep >= 4 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>4</span>
                        <Truck className="mx-auto mb-1" size={18} />
                        <span className="text-[11px] font-bold block">4. En Ruta</span>
                        <span className="text-[9px] block text-slate-400">Hacia Destino</span>
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
                          currentStep >= 5 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>5</span>
                        <Navigation className="mx-auto mb-1" size={18} />
                        <span className="text-[11px] font-bold block">5. Próximo</span>
                        <span className="text-[9px] block text-slate-400">A 20 Minutos</span>
                      </div>

                      {/* Step 6: Entregado */}
                      <div
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          currentStep >= 6
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-extrabold ring-1 ring-emerald-500/40'
                            : 'bg-slate-950/60 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span className={`w-6 h-6 rounded-full font-mono font-extrabold text-[11px] flex items-center justify-center mx-auto mb-1.5 ${
                          currentStep >= 6 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}>6</span>
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
                          <span className="text-slate-400 block text-[11px]">Tienda / Remitente:</span>
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
                            <span className="text-[10px] text-red-400 font-bold uppercase block">
                              Repartidor Asignado
                            </span>
                            <div className="flex items-center justify-between">
                              <div>
                                <strong className="text-white block text-sm">{pedidoData.nombreConductor}</strong>
                                <span className="text-[11px] text-slate-400">
                                  {pedidoData.tipoVehiculo} (Placa: <strong className="text-slate-200">{pedidoData.placaVehiculo}</strong>)
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
          </div>

          {/* Quick Pillars Grid */}
          <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
            
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-3 hover:border-red-500/30 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold">
                <Zap size={24} />
              </div>
              <h3 className="font-bold text-white text-base">Rastreo WebSockets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Línea de tiempo conectada en vivo. Entérate al instante cuando el motorizado esté en camino a tu domicilio.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-3 hover:border-red-500/30 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <Store size={24} />
              </div>
              <h3 className="font-bold text-white text-base">Agendamiento Comercio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Comercios y tiendas agendan recojos con carga masiva de Excel o registro 1 a 1 para despachar el mismo día.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-3 hover:border-red-500/30 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Bike size={24} />
              </div>
              <h3 className="font-bold text-white text-base">Drivers Calificados</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Flota de motorizados capacitados con asignación de rutas inteligentes por distritos y zonas de cobertura.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl space-y-3 hover:border-red-500/30 transition-all shadow-lg">
              <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-white text-base">Cobros Contra-Entrega</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Opción de pago en efectivo o transferencia Yape/Plin al momento de recibir el producto con liquidación en 24h.
              </p>
            </div>

          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3. QUIÉNES SOMOS (ABOUT US)
        ────────────────────────────────────────────────────────────── */}
        <section id="nosotros" className="py-20 px-4 sm:px-8 border-t border-slate-900 bg-slate-900/20 relative">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-extrabold uppercase tracking-wider">
                🏢 Nuestra Agencia
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Puntualidad, Confianza y Tecnología en Cada Entrega
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                En <strong className="text-white">Fragata Courier</strong> somos especialistas en logística express de última milla para comercio electrónico, marcas y emprendimientos en Lima Metropolitana y Callao.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <p className="text-sm text-slate-300 leading-relaxed">
                  Nuestra misión es conectar tu tienda con tus clientes finales en tiempo récord, eliminando las fricciones del transporte y brindando tranquilidad financiera mediante liquidaciones seguras y transparentes.
                </p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Contamos con un sistema inteligente de asignación de rutas por distritos, conductores verificados con antecedentes y una plataforma digital donde monitoreas tus paquetes con total transparencia desde el recojo hasta la entrega.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs text-red-400 font-extrabold uppercase">✓ Entregas Same-Day</span>
                    <p className="text-xs text-slate-400">Despachos el mismo día si agendas antes de las 9:30 AM.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs text-emerald-400 font-extrabold uppercase">✓ Liquidación 24 Horas</span>
                    <p className="text-xs text-slate-400">Rendición puntual de cobros contra-entrega a tu cuenta.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs text-cyan-400 font-extrabold uppercase">✓ Trazabilidad GPS</span>
                    <p className="text-xs text-slate-400">Ubicación y estado en vivo para ti y para tu cliente.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-xs text-purple-400 font-extrabold uppercase">✓ Evidencias de Entrega</span>
                    <p className="text-xs text-slate-400">Fotografías y comprobantes capturados en el acto.</p>
                  </div>
                </div>
              </div>

              {/* Metrics Counter Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center space-y-2 shadow-xl">
                  <span className="text-3xl sm:text-4xl font-black text-red-500 font-mono">+50,000</span>
                  <span className="text-xs font-bold text-white block">Envíos Completados</span>
                  <p className="text-[11px] text-slate-400">Entregas exitosas en Lima y Callao</p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center space-y-2 shadow-xl">
                  <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">99.4%</span>
                  <span className="text-xs font-bold text-white block">Efectividad Operativa</span>
                  <p className="text-[11px] text-slate-400">Puntualidad en recojo y entrega</p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center space-y-2 shadow-xl">
                  <span className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">+350</span>
                  <span className="text-xs font-bold text-white block">Comercios Afiliados</span>
                  <p className="text-[11px] text-slate-400">Marcas activas despachando a diario</p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center space-y-2 shadow-xl">
                  <span className="text-3xl sm:text-4xl font-black text-rose-400 font-mono">100%</span>
                  <span className="text-xs font-bold text-white block">Cobertura Distrital</span>
                  <p className="text-[11px] text-slate-400">Llegamos a cada rincón de la ciudad</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. NUESTROS SERVICIOS
        ────────────────────────────────────────────────────────────── */}
        <section id="servicios" className="py-20 px-4 sm:px-8 border-t border-slate-900 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-extrabold uppercase tracking-wider">
                📦 Servicios Especializados
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Soluciones a la Medida de Tu Negocio
              </h2>
              <p className="text-sm text-slate-400">
                Diseñamos cada servicio para que tu comercio venda más, fidelice a sus clientes y ahorre tiempo en gestiones operativas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Service 1 */}
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/90 hover:border-red-500/40 transition-all space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20">
                  <Truck size={24} />
                </div>
                <h3 className="text-lg font-extrabold text-white">Envíos Same Day & 24 Horas</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Recojo directo en tu tienda o taller y entrega rápida en la puerta del cliente en el mismo día o en 24 horas garantizadas.
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">✓ Recojo matutino antes de las 11:00 AM</li>
                  <li className="flex items-center gap-2">✓ Notificación por WhatsApp al cliente</li>
                  <li className="flex items-center gap-2">✓ Almacén intermedio seguro</li>
                </ul>
              </div>

              {/* Service 2 */}
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/90 hover:border-emerald-500/40 transition-all space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg font-extrabold text-white">Recaudación Contra-Entrega (COD)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cobro seguro en efectivo o con código QR Yape/Plin al momento de entregar el paquete, reduciendo las ventas perdidas.
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">✓ Cero billetes falsos con verificación</li>
                  <li className="flex items-center gap-2">✓ Captura de comprobante digital</li>
                  <li className="flex items-center gap-2">✓ Liquidación directa en tu cuenta bancaria</li>
                </ul>
              </div>

              {/* Service 3 */}
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/90 hover:border-purple-500/40 transition-all space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <FileText size={24} />
                </div>
                <h3 className="text-lg font-extrabold text-white">Panel Web & Carga Masiva Excel</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sube cientos de envíos en segundos con nuestra plantilla de Excel estilizada o agenda pedidos individuales con buscador GPS.
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">✓ Plantilla descargable con leyenda de distritos</li>
                  <li className="flex items-center gap-2">✓ Cálculo automático de tarifas de envío</li>
                  <li className="flex items-center gap-2">✓ Reportes históricos y métricas financieras</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            5. EMPRESAS ALIADAS & TESTIMONIOS
        ────────────────────────────────────────────────────────────── */}
        <section id="empresas" className="py-20 px-4 sm:px-8 border-t border-slate-900 bg-slate-900/20">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-extrabold uppercase tracking-wider">
                🤝 Alianzas Comerciales
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Marcas y Tiendas que Confían en Nuestra Logística
              </h2>
              <p className="text-sm text-slate-400">
                Acompañamos el crecimiento de comercios electrónicos en calzado, moda, accesorios, tecnología y más.
              </p>
            </div>

            {/* Partner Brands Pills Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { name: 'Mochilas Premium', category: 'Accesorios & Viajes', ruc: 'RUC 20999888777' },
                { name: 'Urban Streetwear', category: 'Moda & Ropa Urbana', ruc: 'Tienda Oficial' },
                { name: 'Sneakers Perú', category: 'Calzados & Zapatillas', ruc: 'E-commerce' },
                { name: 'Glow Cosmetics', category: 'Belleza & Maquillaje', ruc: 'Tienda Online' },
                { name: 'Tech Store Lima', category: 'Gadgets & Celulares', ruc: 'Distribuidora' },
                { name: 'NutriFit Suplementos', category: 'Salud & Proteínas', ruc: 'Venta Directa' },
                { name: 'Boutique D’Luxe', category: 'Vestidos & Accesorios', ruc: 'Showroom' },
                { name: 'Baby Joy Kids', category: 'Juguetes & Bebés', ruc: 'Tienda Virtual' },
              ].map((partner, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 hover:border-red-500/40 transition-all shadow-md group"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 font-black text-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {partner.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-extrabold text-white text-xs block truncate">{partner.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{partner.category}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "Desde que trabajamos con Fragata Courier, nuestras entregas contra-entrega no fallan. La liquidación de dinero es exacta y al día siguiente."
                </p>
                <div className="pt-2 border-t border-slate-800">
                  <span className="font-bold text-white text-xs block">Contacto Mochilas Premium</span>
                  <span className="text-[10px] text-slate-500">Comercio Afiliado desde 2024</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "La carga masiva en Excel nos ahorra horas de trabajo cada mañana. Subimos 40 pedidos en un minuto y el repartidor llega puntual a recoger."
                </p>
                <div className="pt-2 border-t border-slate-800">
                  <span className="font-bold text-white text-xs block">Tienda Sneakers Perú</span>
                  <span className="text-[10px] text-slate-500">Calzado & Moda</span>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                  <Star size={16} fill="currentColor" />
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "A nuestros clientes les encanta poder rastrear con su código DD sin registrarse y saber con 20 minutos de anticipación cuándo llega el chofer."
                </p>
                <div className="pt-2 border-t border-slate-800">
                  <span className="font-bold text-white text-xs block">Glow Cosmetics</span>
                  <span className="text-[10px] text-slate-500">Belleza & Cuidado Personal</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            6. CONTACTO & COTIZACIONES
        ────────────────────────────────────────────────────────────── */}
        <section id="contacto" className="py-20 px-4 sm:px-8 border-t border-slate-900 bg-slate-950">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-extrabold uppercase tracking-wider">
                📞 Comunícate con Nosotros
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ¿Listo para Coordinar Tus Envíos?
              </h2>
              <p className="text-sm text-slate-400">
                Escríbenos por WhatsApp o déjanos un mensaje. Nuestro equipo de soporte comercial te responderá al instante.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Contact Channels */}
              <div className="space-y-4">
                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <MessageCircle size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">WhatsApp Comercial & Operaciones</span>
                    <span className="text-xs text-slate-400 block mt-0.5">+51 966 622 023</span>
                    <a
                      href="https://wa.me/51966622023?text=Hola%20Fragata%20Courier,%20deseo%20afiliar%20mi%20tienda%20para%20env%C3%ADos."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold mt-2 hover:underline"
                    >
                      Iniciar chat directo <ArrowRight size={14} />
                    </a>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center shrink-0">
                    <Mail size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Correo Corporativo</span>
                    <span className="text-xs text-slate-400 block mt-0.5">contacto@fragatacourier.pe</span>
                    <span className="text-[11px] text-slate-500 block">Atención a empresas y contratos corporativos</span>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                    <MapPin size={22} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Almacén Central & Operaciones</span>
                    <span className="text-xs text-slate-400 block mt-0.5">Av. Principal 456, San Isidro, Lima, Perú</span>
                    <span className="text-[11px] text-slate-500 block">Horario de recepción: Lunes a Sábado de 08:00 AM a 07:00 PM</span>
                  </div>
                </div>
              </div>

              {/* Quick Message Form */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-4">
                <h3 className="text-lg font-bold text-white">Envíanos un Mensaje</h3>
                <p className="text-xs text-slate-400">
                  Déjanos tus datos y nos pondremos en contacto contigo para coordinar las tarifas especiales para tu tienda.
                </p>

                <form onSubmit={handleSendWhatsAppContact} className="space-y-3 pt-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Tu Nombre *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Ej. Carlos Mendoza"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Nombre de Tienda / Marca *</label>
                      <input
                        type="text"
                        required
                        value={contactBusiness}
                        onChange={(e) => setContactBusiness(e.target.value)}
                        placeholder="Ej. Ropa & Estilo"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 block mb-1">Teléfono WhatsApp *</label>
                      <input
                        type="tel"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="Ej. 966622023"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">Mensaje / Volumen estimado de envíos</label>
                    <textarea
                      rows={3}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Ej. Deseo afiliarme, tengo un promedio de 10 a 15 envíos diarios en Lima."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    <span>Enviar Consulta por WhatsApp</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            7. CALL TO ACTION BANNER (REGISTER)
        ────────────────────────────────────────────────────────────── */}
        <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-red-950/80 via-slate-900 to-rose-950/80 border border-red-500/30 rounded-3xl p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                ¿Tienes una tienda o emprendimiento?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                Afíliate gratis a <strong className="text-red-400">FRAGATA COURIER</strong> para gestionar tus envíos, definir direcciones de recojo y brindar seguimiento en vivo a tus clientes.
              </p>
            </div>

            <Link
              to={isAuthenticated ? (user?.rolNombre === 'ClienteFinal' ? '/comercio/upgrade' : '/dashboard') : '/register'}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all shrink-0 cursor-pointer flex items-center gap-2"
            >
              <span>{isAuthenticated && user?.rolNombre === 'ClienteFinal' ? 'Completar Afiliación a Comercio' : 'Afiliar Mi Comercio Ahora'}</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          8. FOOTER
      ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-900 py-10 px-4 sm:px-8 bg-slate-950 text-xs text-slate-500 space-y-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/logofragata.jpg"
              alt="Fragata Courier"
              className="w-8 h-8 rounded-xl object-contain bg-white p-0.5 shadow-sm"
            />
            <span className="font-extrabold text-white text-sm">FRAGATA COURIER S.A.C.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-xs font-medium">
            <a href="#rastreo" className="hover:text-white transition-colors">Rastrear Pedido</a>
            <a href="#nosotros" className="hover:text-white transition-colors">Quiénes Somos</a>
            <a href="#servicios" className="hover:text-white transition-colors">Servicios</a>
            <a href="#empresas" className="hover:text-white transition-colors">Empresas Aliadas</a>
            <a href="#contacto" className="hover:text-white transition-colors">Contacto</a>
            <Link to="/login" className="hover:text-white transition-colors">Portal Clientes</Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-center border-t border-slate-900/80 pt-6">
          <p>© {new Date().getFullYear()} FRAGATA COURIER. Todos los derechos reservados. Lima, Perú.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
