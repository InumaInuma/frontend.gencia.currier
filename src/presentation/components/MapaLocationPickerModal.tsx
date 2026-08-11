import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { IZonaCoberturaInfo } from '../../infrastructure/utils/coberturaData';
import { obtenerDistritosCobertura, detectarDistritoCercano } from '../../infrastructure/utils/coberturaData';
import { MapPin, X, Check, Navigation, Search, AlertTriangle } from 'lucide-react';

// Fix Leaflet default marker icon paths in React / Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Red Pin Icon for Selected Location
const selectedPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapaLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (data: {
    lat: number;
    lng: number;
    googleMapsUrl: string;
    distrito: IZonaCoberturaInfo;
  }) => void;
  initialLat?: number;
  initialLng?: number;
}

// Sub-component to capture map click events
const MapClickListener: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const MapaLocationPickerModal: React.FC<MapaLocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLat = -12.1221,
  initialLng = -77.0312,
}) => {
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({
    lat: initialLat,
    lng: initialLng,
  });

  const [distritoInfo, setDistritoInfo] = useState<IZonaCoberturaInfo>(() =>
    detectarDistritoCercano(initialLat, initialLng)
  );

  const [searchDistrict, setSearchDistrict] = useState('');

  useEffect(() => {
    const info = detectarDistritoCercano(selectedCoords.lat, selectedCoords.lng);
    setDistritoInfo(info);
  }, [selectedCoords]);

  if (!isOpen) return null;

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
  };

  const handleSelectDistrictPreset = (d: IZonaCoberturaInfo) => {
    setSelectedCoords({ lat: d.lat, lng: d.lng });
  };

  const handleConfirmarUbicacion = () => {
    const gmapsUrl = `https://www.google.com/maps?q=${selectedCoords.lat.toFixed(6)},${selectedCoords.lng.toFixed(6)}`;
    onSelectLocation({
      lat: selectedCoords.lat,
      lng: selectedCoords.lng,
      googleMapsUrl: gmapsUrl,
      distrito: distritoInfo,
    });
    onClose();
  };

  const distritosList = obtenerDistritosCobertura();

  const distritosFiltrados = distritosList.filter((d) =>
    d.nombre.toLowerCase().includes(searchDistrict.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-bold">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Mapa de Cobertura y Seleccionador GPS
              </h2>
              <p className="text-xs text-slate-400">
                Haz clic en el mapa sobre la ubicación exacta de entrega para autocompletar el GPS.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Main Grid (Sidebar list + Map Container) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Left Column: Quick District Selector & Cobertura Status */}
          <div className="p-4 bg-slate-950/60 border-r border-slate-800/80 flex flex-col gap-3 overflow-y-auto max-h-[260px] md:max-h-full">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                1. Buscar o Elegir Distrito
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={searchDistrict}
                  onChange={(e) => setSearchDistrict(e.target.value)}
                  placeholder="Filtrar distrito..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto pr-1">
              {distritosFiltrados.map((d) => {
                const isSelected = d.id === distritoInfo.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => handleSelectDistrictPreset(d)}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 text-white font-bold'
                        : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <span className="block leading-tight">{d.nombre}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{d.zonaNombre}</span>
                    </div>
                    {d.coberturaActiva ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        Cobertura Directa
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                        Sin Cobertura
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Interactive Leaflet Map */}
          <div className="md:col-span-2 relative min-h-[350px] md:min-h-[460px] bg-slate-950 flex flex-col">
            <MapContainer
              center={[selectedCoords.lat, selectedCoords.lng]}
              zoom={14}
              style={{ width: '100%', height: '100%', minHeight: '350px' }}
              className="z-10"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickListener onMapClick={handleMapClick} />

              {/* Render transparent green (covered) and red (uncovered) zone shapes */}
              {distritosList.map((d) => (
                <Circle
                  key={`map_circle_${d.id}`}
                  center={[d.lat, d.lng]}
                  radius={2300}
                  pathOptions={{
                    fillColor: d.coberturaActiva ? '#10b981' : '#ef4444',
                    color: d.coberturaActiva ? '#059669' : '#dc2626',
                    fillOpacity: d.coberturaActiva ? 0.35 : 0.38,
                    weight: 2.5,
                  }}
                >
                  <Popup>
                    <div className="text-slate-900 font-bold text-xs">
                      {d.nombre} ({d.zonaNombre})
                      <br />
                      Estado: {d.coberturaActiva ? '🟢 Cobertura Directa' : '🔴 Sin Cobertura (Restringido)'}
                    </div>
                  </Popup>
                </Circle>
              ))}

              <Marker position={[selectedCoords.lat, selectedCoords.lng]} icon={selectedPinIcon}>
                <Popup>
                  <div className="text-slate-900 font-bold text-xs">
                    📍 Ubicación de Entrega Marcada
                    <br />
                    Distrito: {distritoInfo.nombre}
                    <br />
                    Estado: {distritoInfo.coberturaActiva ? '🟢 En Cobertura' : '🔴 Sin Cobertura (Restringido)'}
                  </div>
                </Popup>
              </Marker>
            </MapContainer>

            {/* Bottom floating info badge */}
            <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border font-bold ${
                    distritoInfo.coberturaActiva
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
                  }`}
                >
                  {distritoInfo.coberturaActiva ? <Navigation size={18} /> : <AlertTriangle size={18} />}
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>Distrito:</span>
                    <span className="text-purple-300 font-mono">{distritoInfo.nombre}</span>
                    {distritoInfo.coberturaActiva ? (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                        🟢 En Cobertura
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                        ⚠️ Sin Cobertura Directa
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    GPS: {selectedCoords.lat.toFixed(6)}, {selectedCoords.lng.toFixed(6)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmarUbicacion}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ${
                  distritoInfo.coberturaActiva
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                }`}
              >
                <Check size={16} />
                <span>{distritoInfo.coberturaActiva ? 'Usar Esta Ubicación GPS' : 'Usar GPS (Zona Restringida)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
