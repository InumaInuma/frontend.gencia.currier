import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { useAdminPedidos } from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { TablaPedidos } from '../../components/TablaPedidos';
import type { IPedido } from '../../../domain/models/IPedido';
import {
  Shield,
  Search,
  Store,
  Package,
  DollarSign,
  MapPin,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LogOut,
  Navigation,
  Calendar
} from 'lucide-react';

const getTodayFormatted = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface ComercioGroup {
  idComercio: number;
  nombreComercial: string;
  razonSocial: string;
  ruc: string;
  direccionRecojo: string;
  referenciaRecojo: string;
  telefonoComercio: string;
  googleMapsUrl?: string;
  pedidos: IPedido[];
  totalMonto: number;
}

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openCommerceIds, setOpenCommerceIds] = useState<number[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Filtro de Rango de Fechas por defecto en HOY
  const [fechaInicio, setFechaInicio] = useState<string>(getTodayFormatted());
  const [fechaFin, setFechaFin] = useState<string>(getTodayFormatted());

  const { data: pedidos, isLoading, refetch, isRefetching } = useAdminPedidos({
    fechaInicio: fechaInicio || undefined,
    fechaFin: fechaFin || undefined,
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCopyCode = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiedCode(codigo);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleShareWhatsApp = (codigo: string, destinatario: string, telefono: string) => {
    const text = `Hola ${destinatario}, tu envío ha sido agendado con el código de seguimiento *${codigo}*. Rastrealo en nuestra plataforma.`;
    const cleanPhone = telefono.replace(/\D/g, '');
    const url = `https://wa.me/51${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Group and order orders by Comercio
  const comercioGroups = useMemo(() => {
    if (!pedidos || pedidos.length === 0) return [];

    const groupMap: { [key: string]: ComercioGroup } = {};

    pedidos.forEach((p) => {
      const idCom = p.idComercio || 0;
      const key = `comercio_${idCom}_${p.nombreComercial || 'SinComercio'}`;

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
          totalMonto: 0
        };
      }

      groupMap[key].pedidos.push(p);
      groupMap[key].totalMonto += (p.montoCobrar || 0);
    });

    // Filter by search term
    const result = Object.values(groupMap).filter((group) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();

      const matchesCommerce =
        group.nombreComercial.toLowerCase().includes(term) ||
        group.ruc.toLowerCase().includes(term) ||
        group.direccionRecojo.toLowerCase().includes(term);

      const matchesOrders = group.pedidos.some(
        (p) =>
          p.codigoSeguimiento.toLowerCase().includes(term) ||
          p.nombreDestinatario.toLowerCase().includes(term) ||
          p.distritoNombre.toLowerCase().includes(term)
      );

      return matchesCommerce || matchesOrders;
    });

    return result;
  }, [pedidos, searchTerm]);

  // Expand all commerce accordions by default once data arrives
  React.useEffect(() => {
    if (comercioGroups.length > 0 && openCommerceIds.length === 0) {
      setOpenCommerceIds(comercioGroups.map((g) => g.idComercio));
    }
  }, [comercioGroups]);

  const toggleAccordion = (id: number) => {
    setOpenCommerceIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalPedidos = pedidos ? pedidos.length : 0;
  const totalRecaudar = pedidos ? pedidos.reduce((acc, curr) => acc + (curr.montoCobrar || 0), 0) : 0;

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
        } pb-20 md:pb-0`}
      >
        {/* Top Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-violet-500 shrink-0" size={24} />
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Panel Admin - Envíos por Comercio
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Visualización centralizada de paquetes registrados para la recolección logística.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
              title="Actualizar datos"
            >
              <RefreshCw size={14} className={isRefetching ? 'animate-spin text-violet-400' : ''} />
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
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Comercios Activos</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{comercioGroups.length}</h3>
                <p className="text-[11px] text-violet-400 mt-1">Con envíos agendados</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Store size={24} />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Paquetes</p>
                <h3 className="text-2xl font-extrabold text-white mt-1">{totalPedidos}</h3>
                <p className="text-[11px] text-emerald-400 mt-1">Listos para recojo</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Package size={24} />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cobranza Contra Entrega</p>
                <h3 className="text-2xl font-extrabold text-amber-400 mt-1">S/ {totalRecaudar.toFixed(2)}</h3>
                <p className="text-[11px] text-slate-400 mt-1">Monto total a recolectar</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          {/* Search & Date Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/40 p-4 rounded-2xl border border-slate-900">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Buscar por comercio, RUC, código o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Controles de Rango de Fechas */}
            <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <Calendar size={13} className="text-violet-400" />
                <span className="text-slate-400 text-[11px] font-semibold">Desde:</span>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
                <Calendar size={13} className="text-violet-400" />
                <span className="text-slate-400 text-[11px] font-semibold">Hasta:</span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
                />
              </div>

              <button
                onClick={() => {
                  const today = getTodayFormatted();
                  setFechaInicio(today);
                  setFechaFin(today);
                }}
                className={`px-2.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer text-xs ${
                  fechaInicio === getTodayFormatted() && fechaFin === getTodayFormatted()
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Filtrar envíos del día de hoy"
              >
                Hoy
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <RefreshCw className="animate-spin mx-auto text-violet-500" size={32} />
              <p className="text-sm font-medium">Cargando envíos de comercios...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && comercioGroups.length === 0 && (
            <div className="py-16 px-4 bg-slate-900/30 border border-slate-900 rounded-3xl text-center space-y-3">
              <Package className="mx-auto text-slate-600" size={48} />
              <h3 className="text-lg font-bold text-white">No hay envíos registrados</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                {searchTerm
                  ? 'No se encontraron comercios ni pedidos con el criterio de búsqueda ingresado.'
                  : 'Aún ningún comercio ha registrado sus envíos del día.'}
              </p>
            </div>
          )}

          {/* Grouped Commerce Cards / Accordions Reusing <TablaPedidos> */}
          {!isLoading && comercioGroups.map((group) => {
            const isOpen = openCommerceIds.includes(group.idComercio);

            return (
              <div
                key={`comercio_group_${group.idComercio}_${group.nombreComercial}`}
                className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl transition-all space-y-0"
              >
                {/* Commerce Header Accordion Bar */}
                <div
                  onClick={() => toggleAccordion(group.idComercio)}
                  className="p-5 bg-slate-900/80 hover:bg-slate-900 border-b border-slate-900 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-extrabold text-base shrink-0">
                      {group.nombreComercial.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-white">{group.nombreComercial}</h2>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono border border-slate-700">
                          RUC: {group.ruc}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 text-violet-300 font-medium">
                          <MapPin size={14} className="text-violet-400 shrink-0" />
                          {group.direccionRecojo}
                        </span>
                        {group.telefonoComercio && group.telefonoComercio !== '-' && (
                          <span className="flex items-center gap-1">
                            <Phone size={14} className="text-slate-500 shrink-0" />
                            {group.telefonoComercio}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 px-3 py-1 rounded-full font-bold inline-block">
                        {group.pedidos.length} {group.pedidos.length === 1 ? 'Pedido' : 'Pedidos'}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        Total: <span className="font-extrabold text-amber-400">S/ {group.totalMonto.toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950 text-slate-400 border border-slate-800">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Highlighted Commerce Pickup Location Box */}
                {isOpen && (
                  <div className="bg-gradient-to-r from-violet-950/30 via-slate-900/60 to-slate-950/30 p-5 border-b border-slate-900 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
                        <Navigation size={16} className="text-violet-400 shrink-0" />
                        Punto de Recojo de Paquetes (Comercio Remitente)
                      </div>
                      {group.googleMapsUrl && (
                        <a
                          href={group.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl flex items-center gap-2 font-bold text-xs shadow-lg shadow-emerald-500/10 transition-all cursor-pointer shrink-0"
                        >
                          <ExternalLink size={14} />
                          Navegar con GPS (Google Maps / Waze)
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* 1. Dirección de Recojo */}
                      <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">
                          Dirección de Recojo:
                        </span>
                        <p className="text-white font-bold text-sm leading-snug">
                          {group.direccionRecojo}
                        </p>
                      </div>

                      {/* 2. Referencia del Recojo */}
                      <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">
                          Referencia de Recojo:
                        </span>
                        <p className={`font-semibold text-xs ${group.referenciaRecojo && group.referenciaRecojo !== 'Sin referencia' ? 'text-amber-300' : 'text-slate-500 italic'}`}>
                          {group.referenciaRecojo && group.referenciaRecojo !== 'Sin referencia' ? group.referenciaRecojo : 'Sin referencia específica registrada'}
                        </p>
                      </div>

                      {/* 3. Teléfono de Contacto */}
                      <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-1">
                        <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">
                          Teléfono de Contacto / Coordinación:
                        </span>
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-violet-400 shrink-0" />
                          <span className="text-white font-bold text-sm">{group.telefonoComercio}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reusing <TablaPedidos> Component */}
                {isOpen && (
                  <div className="p-4 bg-slate-950/20">
                    <TablaPedidos
                      pedidos={group.pedidos}
                      onCopyCode={handleCopyCode}
                      onShareWhatsApp={handleShareWhatsApp}
                      copiedCode={copiedCode}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          onOpenMenu={() => setMovilAbierto(true)}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
