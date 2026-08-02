import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { LogOut, Navigation, MapPin, Package, ClipboardList, CheckCircle, Bike } from 'lucide-react';

export const MotorizadoDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
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
        } pb-24`}
      >
        {/* Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bike className="text-violet-400 shrink-0" size={24} />
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight">
                Consola del Repartidor
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Revisa y despacha tus entregas asignadas en tiempo real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">
              Conductor Conectado
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

        {/* Main Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Welcome */}
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Navigation className="text-emerald-500 animate-pulse" size={22} />
              ¡Hola, {user.nombreCompleto}!
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Aquí puedes ver tu envío asignado actual y el resumen de tus actividades del día.
            </p>
          </div>

          {/* Dashboard Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Job detail */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Delivery Detail Card */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-xs text-slate-500 uppercase font-semibold">Envío Asignado Actual</span>
                    <h3 className="text-lg font-bold text-white font-mono mt-0.5">#ENV-3098</h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    En Camino al Destino
                  </span>
                </div>

                {/* Delivery Details */}
                <div className="space-y-4">
                  {/* Pick up */}
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-violet-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs text-slate-500 font-semibold uppercase">Punto de Recojo (Comercio)</h5>
                      <p className="text-sm font-bold text-slate-200">Tienda Mochilas Demo</p>
                      <p className="text-xs text-slate-400">Calle Las Amatistas 123, La Victoria</p>
                    </div>
                  </div>

                  {/* Drop off */}
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs text-slate-500 font-semibold uppercase">Destino (Cliente Final)</h5>
                      <p className="text-sm font-bold text-slate-200">Juan Pérez Castro</p>
                      <p className="text-xs text-slate-400">Av. Javier Prado 1024, San Isidro</p>
                    </div>
                  </div>

                  {/* Package description */}
                  <div className="flex items-start gap-3">
                    <Package size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs text-slate-500 font-semibold uppercase">Paquete / Observación</h5>
                      <p className="text-xs text-slate-300">1x Mochila Impermeable de Cuero (Frágil)</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 pt-6 border-t border-slate-800 flex gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold rounded-xl py-3 cursor-pointer shadow-lg shadow-emerald-500/10 transition-all duration-200">
                    <CheckCircle size={16} />
                    Marcar como Entregado
                  </button>
                  <button className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold rounded-xl px-5 py-3 cursor-pointer transition-all duration-200">
                    Ver Mapa
                  </button>
                </div>
              </div>
            </div>

            {/* Rider status and stats */}
            <div className="space-y-6">
              {/* Stats Card */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 shadow-xl">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <ClipboardList size={16} className="text-emerald-500" />
                  Resumen de Hoy
                </h4>

                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                    <span className="text-xs text-slate-500 font-medium">Entregas Completadas</span>
                    <span className="text-sm font-bold text-slate-200">5</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-800/40">
                    <span className="text-xs text-slate-500 font-medium">Ganancias del día</span>
                    <span className="text-sm font-bold text-emerald-400">S/. 65.50</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-slate-500 font-medium">Distancia Recorrida</span>
                    <span className="text-sm font-bold text-slate-200">22.4 km</span>
                  </div>
                </div>
              </div>

              {/* Profile info widget */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 text-xs text-slate-400 space-y-2 shadow-xl">
                <p>
                  <span className="font-bold text-white">Vehículo asociado:</span> Moto Honda Cargo (Placa: 4567-XY)
                </p>
                <p>
                  <span className="font-bold text-white">Estado:</span> Conectado &amp; Disponible
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default MotorizadoDashboard;
