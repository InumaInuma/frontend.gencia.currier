import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { useMisPedidos } from '../../../application/useCases/useMisPedidos';
import { CrearPedidoModal } from '../../components/CrearPedidoModal';
import { TablaPedidos } from '../../components/TablaPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { LogOut, ShoppingBag, Plus, ShoppingCart, Clock, Truck, CheckCircle2 } from 'lucide-react';

export const ComercioDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  const { data: pedidos, isLoading: loadingPedidos } = useMisPedidos();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareWhatsApp = (codigo: string, destinatario: string, telefono: string) => {
    const text = `¡Hola ${destinatario}! Tu pedido ha sido agendado con Dream Drivers. Código de seguimiento: ${codigo}`;
    window.open(`https://wa.me/51${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!user) return null;

  const totalPedidos = pedidos?.length || 0;
  const pedidosPendientes = pedidos?.filter(p => p.estadoNombre === 'Registrado').length || 0;
  const pedidosEnCamino = pedidos?.filter(p => p.estadoNombre === 'En Camino').length || 0;
  const pedidosEntregados = pedidos?.filter(p => p.estadoNombre === 'Entregado').length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex pb-20 md:pb-0">
      {/* Reusable Left Sidebar */}
      <LeftSidebar
        contraido={contraido}
        setContraido={setContraido}
        movilAbierto={movilAbierto}
        setMovilAbierto={setMovilAbierto}
        onOpenAgendarModal={() => setIsModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${contraido ? 'md:ml-20' : 'md:ml-64'}`}>
        
        {/* Sticky Header */}
        <header className="border-b border-slate-900 bg-slate-900/40 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between pl-14 md:pl-8">
            <div className="flex items-center gap-3">
              <span className="font-bold tracking-tight text-white text-base">
                {user.nombreComercial || 'Dream Drivers (Comercio)'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-block text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-medium">
                {user.nombreComercial ? `${user.nombreComercial} · RUC ${user.ruc}` : 'Comercio Afiliado'}
              </span>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 text-sm text-slate-400 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-3.5 py-1.5 cursor-pointer transition-all duration-200"
              >
                <LogOut size={16} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Welcome & Main Action */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                <ShoppingBag className="text-indigo-500" />
                {user.nombreComercial || 'Gestión de Envíos'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Bienvenido, {user.nombreCompleto}{user.ruc ? ` (RUC: ${user.ruc})` : ''}. Agenda envíos y realiza seguimiento en tiempo real.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl px-5 py-3.5 cursor-pointer shadow-lg shadow-violet-500/20 transition-all duration-200"
            >
              <Plus size={18} />
              Agendar Nuevo Envío
            </button>
          </div>

          {/* Dashboard Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 sm:p-5">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <span className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Agendados</span>
                <ShoppingCart size={18} className="text-indigo-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{totalPedidos} Envíos</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Registrados en plataforma</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 sm:p-5">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <span className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold">Pendientes Recojo</span>
                <Clock size={18} className="text-amber-500 animate-pulse" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{pedidosPendientes}</h3>
              <p className="text-[11px] text-amber-400 mt-0.5">En espera de recojo</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 sm:p-5">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <span className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold">En Camino</span>
                <Truck size={18} className="text-violet-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{pedidosEnCamino}</h3>
              <p className="text-[11px] text-violet-400 mt-0.5">Rutas en progreso</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 sm:p-5">
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <span className="text-[11px] sm:text-xs text-slate-500 uppercase tracking-wider font-semibold">Entregados</span>
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{pedidosEntregados}</h3>
              <p className="text-[11px] text-emerald-400 mt-0.5">Completados con éxito</p>
            </div>
          </div>

          {/* Live Orders Container */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Historial de Envíos Agendados</h2>
                <p className="text-xs text-slate-400 mt-0.5">Monitorea y comparte los códigos de seguimiento con tus clientes.</p>
              </div>
            </div>

            {loadingPedidos ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Cargando historial de envíos...
              </div>
            ) : !pedidos || pedidos.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl p-8">
                <ShoppingBag className="mx-auto text-slate-600 mb-3" size={36} />
                <h3 className="text-sm font-semibold text-slate-300">Aún no has agendado envíos</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Haz clic en el botón "Agendar Nuevo Envío" para programar la entrega de tus paquetes.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
                >
                  <Plus size={16} />
                  Agendar Mi Primer Envío
                </button>
              </div>
            ) : (
              <TablaPedidos
                pedidos={pedidos}
                onCopyCode={handleCopy}
                onShareWhatsApp={handleShareWhatsApp}
                copiedCode={copiedCode}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modal Form */}
      <CrearPedidoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultSenderName={user.nombreComercial || user.nombreCompleto}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
    </div>
  );
};

export default ComercioDashboard;
