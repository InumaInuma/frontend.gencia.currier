import React, { useState } from 'react';
import { useAuth } from '../../../application/context/AuthContext';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import type { IZonaCoberturaInfo } from '../../../infrastructure/utils/coberturaData';
import {
  obtenerDistritosCobertura,
  guardarDistritosCobertura,
  LIMA_COVERAGE_MAIN_POLYGON
} from '../../../infrastructure/utils/coberturaData';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck
} from 'lucide-react';

// Fix Leaflet icons in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const greenPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const CoberturaAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  // Local state initialized with saved coverage settings
  const [distritosList, setDistritosList] = useState<IZonaCoberturaInfo[]>(() => obtenerDistritosCobertura());
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) return null;

  const handleToggleCobertura = (idDistrito: number) => {
    const updated = distritosList.map((item) =>
      item.id === idDistrito ? { ...item, coberturaActiva: !item.coberturaActiva } : item
    );
    setDistritosList(updated);
    guardarDistritosCobertura(updated);

    const target = updated.find((d) => d.id === idDistrito);
    setFeedbackMsg({
      type: 'success',
      text: `Estado de cobertura actualizado para ${target?.nombre}: ${target?.coberturaActiva ? '🟢 HABILITADO' : '🔴 DESHABILITADO'}.`
    });
  };

  const handleUpdateTarifa = (idDistrito: number, nuevaTarifa: number) => {
    const updated = distritosList.map((item) =>
      item.id === idDistrito ? { ...item, tarifaDespacho: nuevaTarifa } : item
    );
    setDistritosList(updated);
    guardarDistritosCobertura(updated);
  };

  const distritosFiltrados = distritosList.filter(
    (d) =>
      d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.zonaNombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActivos = distritosList.filter((d) => d.coberturaActiva).length;
  const totalRestringidos = distritosList.length - totalActivos;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Left Sidebar */}
      <LeftSidebar
        contraido={contraido}
        setContraido={setContraido}
        movilAbierto={movilAbierto}
        setMovilAbierto={setMovilAbierto}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          contraido ? 'md:ml-20' : 'md:ml-64'
        } pb-20 md:pb-8`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
              <MapPin size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                Zonas de Cobertura y Tarifas
              </h1>
              <p className="text-xs text-slate-400">
                Configura la disponibilidad geográfica de distritos para los envíos de los comercios.
              </p>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Feedback Msg */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 shadow-lg ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {feedbackMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <div className="flex-1">{feedbackMsg.text}</div>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Distritos
                </span>
                <div className="text-3xl font-extrabold text-white font-mono mt-1">
                  {distritosList.length}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
                <MapPin size={24} />
              </div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-5 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Cobertura Activa
                </span>
                <div className="text-3xl font-extrabold text-emerald-300 font-mono mt-1">
                  {totalActivos}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Restringidos / Sin Cobertura
                </span>
                <div className="text-3xl font-extrabold text-amber-300 font-mono mt-1">
                  {totalRestringidos}
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>

          {/* Interactive Leaflet Map Preview of Lima Coverage */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-4 shadow-xl space-y-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin size={16} className="text-purple-400" />
              <span>Mapa Interactivo de Cobertura en Lima Metropolitana</span>
            </h2>

            <div className="h-[320px] rounded-2xl overflow-hidden border border-slate-800">
              <MapContainer
                center={[-12.085, -77.035]}
                zoom={12}
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Main continuous green coverage area */}
                <Polygon
                  positions={LIMA_COVERAGE_MAIN_POLYGON}
                  pathOptions={{
                    fillColor: '#10b981',
                    color: '#34d399',
                    fillOpacity: 0.35,
                    weight: 2.5,
                  }}
                />

                {/* District markers */}
                {distritosList.map((d) => (
                  <Marker
                    key={`admin_map_pin_${d.id}`}
                    position={[d.lat, d.lng]}
                    icon={d.coberturaActiva ? greenPinIcon : redPinIcon}
                  >
                    <Popup>
                      <div className="text-slate-900 font-bold text-xs">
                        {d.nombre} ({d.zonaNombre})
                        <br />
                        Estado: {d.coberturaActiva ? '🟢 Cobertura Activa' : '🔴 Sin Cobertura'}
                        <br />
                        Tarifa: S/ {d.tarifaDespacho.toFixed(2)}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* District Table & Settings */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar distrito o zona..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              <span className="text-xs text-slate-400">
                Mostrando <strong className="text-white font-mono">{distritosFiltrados.length}</strong> distritos
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-900">
              <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[11px] bg-slate-950/80">
                    <th className="p-3.5">Distrito</th>
                    <th className="p-3.5">Zona / Sector</th>
                    <th className="p-3.5 text-center">Tarifa Referencial (S/)</th>
                    <th className="p-3.5 text-center">Estado de Cobertura</th>
                    <th className="p-3.5 text-center">Acción / Switch</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-900">
                  {distritosFiltrados.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="p-3.5 font-bold text-white">{d.nombre}</td>
                      <td className="p-3.5 text-slate-400 font-mono">{d.zonaNombre}</td>
                      <td className="p-3.5 text-center font-mono font-bold text-emerald-400">
                        <input
                          type="number"
                          value={d.tarifaDespacho}
                          onChange={(e) => handleUpdateTarifa(d.id, parseFloat(e.target.value) || 0)}
                          className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono font-bold text-emerald-400 text-xs focus:outline-none focus:border-purple-500"
                        />
                      </td>
                      <td className="p-3.5 text-center">
                        {d.coberturaActiva ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                            <CheckCircle2 size={13} />
                            En Cobertura
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                            <AlertCircle size={13} />
                            Sin Cobertura
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleCobertura(d.id)}
                          className={`p-2 rounded-xl transition-all cursor-pointer font-bold text-xs inline-flex items-center gap-2 ${
                            d.coberturaActiva
                              ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                          }`}
                        >
                          {d.coberturaActiva ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          <span>{d.coberturaActiva ? 'Desactivar' : 'Activar'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};
