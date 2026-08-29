import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { useAdminPedidos } from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import {
  Shield,
  BarChart3,
  PieChart,
  TrendingUp,
  Package,
  DollarSign,
  MapPin,
  RefreshCw,
  LogOut,
  Calendar,
  Store,
  CheckCircle2,
  Clock,
  Truck,
  ArrowRight,
  AlertTriangle,
  Award,
  Wallet
} from 'lucide-react';

const getTodayFormatted = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  // Filtro por fecha por defecto HOY
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

  // ---- Calculated Metrics & Data Aggregations ----
  const metrics = useMemo(() => {
    if (!pedidos || pedidos.length === 0) {
      return {
        total: 0,
        registrados: 0,
        enRecojo: 0,
        enRuta: 0,
        entregados: 0,
        reprogramados: 0,
        efectividad: 0,
        totalContraEntrega: 0,
        totalFletes: 0,
        topDistritos: [],
        topComercios: [],
        estadoBreakdown: []
      };
    }

    const total = pedidos.length;

    let registrados = 0;
    let enRecojo = 0;
    let enRuta = 0;
    let entregados = 0;
    let reprogramados = 0;
    let totalContraEntrega = 0;
    let totalFletes = 0;

    const distritosMap: Record<string, number> = {};
    const comerciosMap: Record<string, { count: number; contraEntrega: number; fletes: number; ruc: string }> = {};

    pedidos.forEach((p) => {
      const st = (p.estadoNombre || '').toLowerCase();
      if (st.includes('registrado') || p.idEstadosPedido === 1) registrados++;
      else if (st.includes('recoj') || p.idEstadosPedido === 2) enRecojo++;
      else if (st.includes('ruta') || p.idEstadosPedido === 3) enRuta++;
      else if (st.includes('entregad') || p.idEstadosPedido === 4) entregados++;
      else if (st.includes('reprogram')) reprogramados++;
      else registrados++;

      totalContraEntrega += p.montoCobrar || 0;
      totalFletes += p.tarifaEnvio || 0;

      // Distritos
      const dist = p.distritoNombre || 'Sin Distrito';
      distritosMap[dist] = (distritosMap[dist] || 0) + 1;

      // Comercios
      const comName = p.nombreComercial || p.nombreRemitente || 'Comercio No Registrado';
      if (!comerciosMap[comName]) {
        comerciosMap[comName] = { count: 0, contraEntrega: 0, fletes: 0, ruc: p.ruc || '20000000001' };
      }
      comerciosMap[comName].count++;
      comerciosMap[comName].contraEntrega += p.montoCobrar || 0;
      comerciosMap[comName].fletes += p.tarifaEnvio || 0;
    });

    const efectividad = total > 0 ? Math.round((entregados / total) * 100) : 0;

    // Sort Top Distritos
    const topDistritos = Object.entries(distritosMap)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Sort Top Comercios
    const topComercios = Object.entries(comerciosMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const estadoBreakdown = [
      { name: 'Registrado', count: registrados, color: '#3b82f6', bg: 'bg-blue-500' },
      { name: 'En Recojo', count: enRecojo, color: '#a855f7', bg: 'bg-purple-500' },
      { name: 'En Ruta', count: enRuta, color: '#eab308', bg: 'bg-yellow-500' },
      { name: 'Entregado', count: entregados, color: '#22c55e', bg: 'bg-emerald-500' },
      { name: 'Reprogramado', count: reprogramados, color: '#f97316', bg: 'bg-orange-500' },
    ].filter((e) => e.count > 0);

    return {
      total,
      registrados,
      enRecojo,
      enRuta,
      entregados,
      reprogramados,
      efectividad,
      totalContraEntrega,
      totalFletes,
      topDistritos,
      topComercios,
      estadoBreakdown
    };
  }, [pedidos]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <LeftSidebar
        contraido={contraido}
        setContraido={setContraido}
        movilAbierto={movilAbierto}
        setMovilAbierto={setMovilAbierto}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${contraido ? 'md:ml-20' : 'md:ml-64'
          } pb-20 md:pb-8`}
      >
        {/* Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Dashboard Ejecutivo & Analíticas
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Visión estratégica en tiempo real de operaciones, estados y volumen financiero.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refetch()}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
              title="Actualizar datos"
            >
              <RefreshCw size={14} className={isRefetching ? 'animate-spin text-purple-400' : ''} />
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

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Controls Bar: Date Range Filter & Navigation to Monitoring */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <Calendar size={16} className="text-purple-400 shrink-0" />
              <span className="text-xs font-bold text-slate-300 shrink-0">Filtrar por Rango:</span>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-purple-500 transition-all cursor-pointer"
                />
                <span className="text-slate-500 text-xs font-bold">hasta</span>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-white text-xs font-semibold rounded-xl px-3 py-2 outline-none focus:border-purple-500 transition-all cursor-pointer"
                />
                <button
                  onClick={() => {
                    setFechaInicio(getTodayFormatted());
                    setFechaFin(getTodayFormatted());
                  }}
                  className="px-3 py-2 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20 text-xs font-bold transition-all cursor-pointer"
                >
                  Hoy
                </button>
              </div>
            </div>

            <button
              onClick={() => navigate('/admin/monitoreo-recojos')}
              className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span>Ver Monitoreo Operativo de Pedidos</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* KPI Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* KPI 1: Total Envíos */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/50 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-all" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Envíos</span>
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                  <Package size={18} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-3xl font-extrabold text-white font-mono">{metrics.total}</h3>
                <p className="text-[11px] text-slate-400 mt-1">Paquetes registrados en periodo</p>
              </div>
            </div>

            {/* KPI 2: En Ruta */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-yellow-500/50 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl group-hover:bg-yellow-500/20 transition-all" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">En Ruta</span>
                <div className="w-9 h-9 rounded-xl bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 flex items-center justify-center">
                  <Truck size={18} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-3xl font-extrabold text-yellow-300 font-mono">{metrics.enRuta + metrics.enRecojo}</h3>
                <p className="text-[11px] text-slate-400 mt-1">Recojos y entregas en tránsito</p>
              </div>
            </div>

            {/* KPI 3: Efectividad */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Efectividad</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-3xl font-extrabold text-emerald-400 font-mono">{metrics.efectividad}%</h3>
                <p className="text-[11px] text-slate-400 mt-1">{metrics.entregados} de {metrics.total} entregados</p>
              </div>
            </div>

            {/* KPI 4: Total Contra Entrega */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/50 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contra Entrega</span>
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center justify-center">
                  <Wallet size={18} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-300 font-mono">S/ {metrics.totalContraEntrega.toFixed(2)}</h3>
                <p className="text-[11px] text-slate-400 mt-1">Cobro de productos a recaudar</p>
              </div>
            </div>

            {/* KPI 5: Total Fletes */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Fletes</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                  <DollarSign size={18} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">S/ {metrics.totalFletes.toFixed(2)}</h3>
                <p className="text-[11px] text-slate-400 mt-1">Ingresos por tarifa delivery</p>
              </div>
            </div>
          </div>

          {/* Charts Row 1: Donut Chart (Estado de Envíos) & Bar Chart (Top Distritos) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Estado de Envíos (Futuristic Animated Glowing SVG Donut + Pipeline Bar) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-500/10">
                    <PieChart size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">Distribución por Estado de Envío</h3>
                    <p className="text-[11px] text-slate-400">Proporción en tiempo real del flujo de paquetes</p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
                  LIVE METRICS
                </span>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-bold animate-pulse">
                  Cargando analíticas...
                </div>
              ) : metrics.total === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Package size={36} className="mb-2 opacity-40 text-purple-400" />
                  <span>No hay envíos registrados en la fecha seleccionada.</span>
                </div>
              ) : (
                <div className="space-y-5 my-auto">
                  {/* Multi-Segment Pipeline Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                      <span>FLUJO DE PROCESAMIENTO</span>
                      <span className="font-mono text-purple-300">{metrics.total} PAQUETES ACTIVOS</span>
                    </div>
                    <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5 shadow-inner">
                      {metrics.estadoBreakdown.map((item, idx) => {
                        const pct = (item.count / metrics.total) * 100;
                        return (
                          <div
                            key={idx}
                            style={{ width: `${pct}%`, backgroundColor: item.color }}
                            className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-1000 shadow-md hover:brightness-125"
                            title={`${item.name}: ${item.count} (${Math.round(pct)}%)`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-2">
                    {/* Glowing Center SVG Donut */}
                    <div className="relative flex items-center justify-center py-2">
                      {/* Ambient Spinning Background Aura */}
                      <div className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-purple-600/20 via-indigo-600/10 to-blue-600/20 blur-xl animate-pulse" />

                      <svg className="w-44 h-44 transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                        {/* Background track circle */}
                        <circle
                          cx="50"
                          cy="50"
                          r="15.91549430918954"
                          fill="transparent"
                          stroke="#1e293b"
                          strokeWidth="7"
                        />

                        {(() => {
                          let accumulatedPercent = 0;
                          return metrics.estadoBreakdown.map((item, idx) => {
                            const pct = (item.count / metrics.total) * 100;
                            const strokeDasharray = `${pct} ${100 - pct}`;
                            const strokeDashoffset = -accumulatedPercent;
                            accumulatedPercent += pct;
                            return (
                              <circle
                                key={idx}
                                cx="50"
                                cy="50"
                                r="15.91549430918954"
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="7.5"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 hover:stroke-[9] cursor-pointer"
                              />
                            );
                          });
                        })()}
                      </svg>

                      {/* Inner Animated Badge */}
                      <div className="absolute z-20 flex flex-col items-center justify-center text-center bg-slate-950/80 backdrop-blur-md rounded-full w-28 h-28 border border-slate-800 shadow-2xl">
                        <div className="w-7 h-7 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs mb-0.5 animate-bounce">
                          📦
                        </div>
                        <span className="text-2xl font-extrabold text-white font-mono tracking-tight">{metrics.total}</span>
                        <span className="text-[9px] text-purple-300 font-extrabold uppercase tracking-widest">EN TOTAL</span>
                      </div>
                    </div>

                    {/* Rich Glassmorphic Cards Grid */}
                    <div className="space-y-2.5">
                      {metrics.estadoBreakdown.map((item, idx) => {
                        const pct = Math.round((item.count / metrics.total) * 100);
                        return (
                          <div
                            key={idx}
                            className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3 flex items-center justify-between hover:border-slate-700 hover:bg-slate-900/60 transition-all shadow-md group/item"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="w-3.5 h-3.5 rounded-lg shrink-0 shadow-md transition-transform group-hover/item:scale-125"
                                style={{ backgroundColor: item.color }}
                              />
                              <div>
                                <span className="text-xs font-bold text-slate-200 block leading-tight">{item.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono font-medium">
                                  {pct}% del total
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-white font-mono text-sm px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800">
                                {item.count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chart 2: Top Distritos de Entrega (Progress Bars) */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">Top Distritos con Mayor Volumen</h3>
                    <p className="text-[11px] text-slate-400">Destinos más solicitados por los comercios</p>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="h-64 flex items-center justify-center text-slate-500 text-xs font-bold animate-pulse">
                  Cargando datos de distritos...
                </div>
              ) : metrics.topDistritos.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <MapPin size={32} className="mb-2 opacity-50" />
                  <span>Sin datos de destino disponibles.</span>
                </div>
              ) : (
                <div className="space-y-4 my-auto">
                  {metrics.topDistritos.map((dist, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-slate-800 text-purple-300 text-[10px] font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <span className="text-white font-medium">{dist.name}</span>
                        </div>
                        <span className="font-mono text-purple-300 font-bold">{dist.count} envíos ({dist.pct}%)</span>
                      </div>

                      <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${dist.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Top Comercios Activos Table & Financial Breakdown Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Comercios Ranking List (2 cols) */}
            <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
                    <Store size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">Top Comercios Activos del Día</h3>
                    <p className="text-[11px] text-slate-400">Comercios con mayor número de paquetes solicitados</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/admin/monitoreo-recojos')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Ver Todos</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-slate-500 text-xs animate-pulse">Cargando ranking de comercios...</div>
              ) : metrics.topComercios.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">No hay comercios con envíos registrados hoy.</div>
              ) : (
                <div className="divide-y divide-slate-800/60 border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/40">
                  {metrics.topComercios.map((com, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-900/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold flex items-center justify-center text-sm shrink-0">
                          {com.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{com.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">RUC: {com.ruc}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Paquetes</span>
                          <span className="text-xs font-extrabold text-purple-300 font-mono">{com.count} envíos</span>
                        </div>

                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] text-slate-400 block font-medium">Fletes Total</span>
                          <span className="text-xs font-extrabold text-emerald-400 font-mono">S/ {com.fletes.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Summary Card (1 col) */}
            <div className="bg-gradient-to-b from-slate-900/80 via-slate-900/40 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">Balance Financiero</h3>
                  <p className="text-[11px] text-slate-400">Resumen monetario del periodo</p>
                </div>
              </div>

              <div className="space-y-3 my-auto">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Total Fletes (Tarifas)</span>
                    <span className="text-lg font-extrabold text-emerald-400 font-mono">S/ {metrics.totalFletes.toFixed(2)}</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign size={16} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Cobranza Contra Entrega</span>
                    <span className="text-lg font-extrabold text-blue-300 font-mono">S/ {metrics.totalContraEntrega.toFixed(2)}</span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Wallet size={16} />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-purple-300 block font-bold">Monto Total Administrado</span>
                    <span className="text-xl font-extrabold text-white font-mono">
                      S/ {(metrics.totalFletes + metrics.totalContraEntrega).toFixed(2)}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-xs">
                    💰
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/admin/monitoreo-recojos')}
                className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-bold py-3 rounded-xl transition-all cursor-pointer text-center"
              >
                Ir a Monitoreo Detallado ➔
              </button>
            </div>
          </div>
        </main>

        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default AdminDashboard;
