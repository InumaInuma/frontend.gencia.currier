import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import type { IDistrito } from '../../../domain/models/IDistrito';
import type { DistritoTarifaDto, ZonaAlejadaDto, ZonaRestringidaDto } from '../../../application/useCases/useCoberturaAdmin';
import type { IZonaCoberturaInfo } from '../../../infrastructure/utils/coberturaData';
import {
  obtenerPoligonoCobertura,
  obtenerZonasRestringidas,
} from '../../../infrastructure/utils/coberturaData';
import { selectedPinIcon, MapClickListener, MapController } from './agendarEnvioUtils';

interface Props {
  errorMsg: string;
  activeRestrictedZone: { id: number; nombre: string; descripcion: string } | null;
  activeYellowZone?: ZonaAlejadaDto | null;
  idDistritoDestinatario: number | '';
  setIdDistritoDestinatario: (val: number | '') => void;
  direccionDestinatario: string;
  setDireccionDestinatario: (val: string) => void;
  referenciaDestinatario: string;
  setReferenciaDestinatario: (val: string) => void;
  googleMapsUrl: string;
  setGoogleMapsUrl: (val: string) => void;
  selectedCoords: { lat: number; lng: number };
  setSelectedCoords: (coords: { lat: number; lng: number }) => void;
  distritoInfo: IZonaCoberturaInfo;
  distritos: IDistrito[] | undefined;
  loadingDistritos: boolean;
  distritosList: DistritoTarifaDto[];
  greenPolygon: [number, number][];
  redZones: ZonaRestringidaDto[];
  yellowZones?: ZonaAlejadaDto[];
  isPending: boolean;
  handleSubmit: () => void;
  onBackToStep1: () => void;
}

export const Paso2UbicacionGPS: React.FC<Props> = ({
  errorMsg,
  activeRestrictedZone,
  activeYellowZone,
  idDistritoDestinatario,
  setIdDistritoDestinatario,
  direccionDestinatario,
  setDireccionDestinatario,
  referenciaDestinatario,
  setReferenciaDestinatario,
  googleMapsUrl,
  setGoogleMapsUrl,
  selectedCoords,
  setSelectedCoords,
  distritoInfo,
  distritos,
  loadingDistritos,
  distritosList,
  greenPolygon,
  redZones,
  yellowZones,
  isPending,
  handleSubmit,
  onBackToStep1,
}) => {
  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle size={15} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Warning banner for restricted zone */}
      {activeRestrictedZone && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold shadow-lg animate-pulse">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <span>
            🔴 <strong>Ubicación Restringida:</strong> La ubicación marcada en el mapa se encuentra dentro de la "
            <strong>{activeRestrictedZone.nombre}</strong>" ({activeRestrictedZone.descripcion}). Por seguridad, no se aceptan entregas en este punto.
          </span>
        </div>
      )}

      {/* Notice banner for Yellow Remote Zone Surcharge */}
      {activeYellowZone && !activeRestrictedZone && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 text-xs font-bold shadow-lg">
          <MapPin size={18} className="text-yellow-400 shrink-0" />
          <span>
            🟡 <strong>Zona Alejada Detectada ({activeYellowZone.nombre}):</strong> Esta ubicación se encuentra en una sub-zona distante. Se aplicará un recargo especial de <strong>+{activeYellowZone.porcentajeRecargo}%</strong> sobre la tarifa base de envío.
          </span>
        </div>
      )}

      {/* Step 2 Form Card: Distrito, Dirección Exacta, Referencia */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <MapPin size={16} className="text-violet-400" />
          <span>Dirección de Entrega y Destino</span>
        </h2>

        {/* Distrito y Dirección */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              2. Distrito de Entrega *
            </label>
            <select
              value={idDistritoDestinatario}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : '';
                setIdDistritoDestinatario(val);
                if (val) {
                  const match = distritosList.find((d) => {
                    const distritosApiMatch = distritos?.find((ap) => ap.id === val);
                    return (
                      (distritosApiMatch && d.nombre.toLowerCase() === distritosApiMatch.nombre.toLowerCase()) ||
                      d.id === val
                    );
                  });
                  if (match && match.latitud !== 0 && match.longitud !== 0) {
                    setSelectedCoords({ lat: match.latitud, lng: match.longitud });
                  }
                }
              }}
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 outline-none focus:border-violet-500 transition-colors"
            >
              <option value="">Seleccionar Distrito</option>
              {loadingDistritos ? (
                <option disabled>Cargando...</option>
              ) : (
                distritos?.map((d) => {
                  const info = distritosList.find((c) => c.nombre.toLowerCase() === d.nombre.toLowerCase());
                  const tarifa = info ? info.tarifaDespacho : d.tarifaDespacho || 10;
                  const zona = info?.zonaNombre ? `(${info.zonaNombre}) ` : '';
                  const activa = info ? info.coberturaActiva : true;
                  return (
                    <option key={d.id} value={d.id}>
                      {d.nombre} {zona}— S/ {tarifa.toFixed(2)} {activa ? '🟢' : '🔴'}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              3. Dirección Exacta *
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={direccionDestinatario}
                onChange={(e) => setDireccionDestinatario(e.target.value)}
                placeholder="Av. Brasil 1234 Int 402"
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 4. Referencia */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            4. Referencia de Entrega
          </label>
          <input
            type="text"
            value={referenciaDestinatario}
            onChange={(e) => setReferenciaDestinatario(e.target.value)}
            placeholder="Ej: Frente al parque central, puerta negra"
            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Map Section Card */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-5 py-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white leading-tight">5. Ubicación de Entrega en Mapa</h2>
              <p className="text-[11px] text-slate-400">Haz clic en el mapa para marcar el punto exacto de entrega.</p>
            </div>
          </div>
        </div>

        {/* Map Full Width */}
        <div className="relative min-h-[480px]">
          <MapContainer center={[selectedCoords.lat, selectedCoords.lng]} zoom={14} style={{ width: '100%', height: '100%', minHeight: '480px' }} className="z-10">
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <MapClickListener onMapClick={handleMapClick} />
            <MapController center={selectedCoords} />

            {/* Green coverage polygon */}
            <Polygon
              positions={greenPolygon.length > 0 ? greenPolygon : obtenerPoligonoCobertura()}
              pathOptions={{ fillColor: '#10b981', color: '#34d399', fillOpacity: 0.33, weight: 2.5 }}
              eventHandlers={{ click: (e) => handleMapClick(e.latlng.lat, e.latlng.lng) }}
            />

            {/* Yellow remote sub-zones */}
            {(yellowZones || []).map((zona) => {
              const pts = zona.vertices.map((v) => [v.latitud, v.longitud] as [number, number]);
              if (pts.length < 3) return null;
              return (
                <Polygon
                  key={`yz_${zona.id}`}
                  positions={[...pts, pts[0]]}
                  pathOptions={{ fillColor: '#eab308', color: '#ca8a04', fillOpacity: 0.35, weight: 2.5, dashArray: '4,4' }}
                  eventHandlers={{ click: (e) => handleMapClick(e.latlng.lat, e.latlng.lng) }}
                >
                  <Popup>
                    <div className="text-slate-900 font-bold text-xs">
                      🟡 {zona.nombre}<br />
                      <span className="text-yellow-700 font-bold">Recargo: +{zona.porcentajeRecargo}%</span>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

            {/* Red restricted zones */}
            {(redZones.length > 0
              ? redZones.map((z) => ({ id: z.id, nombre: z.nombre, descripcion: z.descripcion, vertices: z.vertices.map((v) => [v.latitud, v.longitud] as [number, number]) }))
              : obtenerZonasRestringidas()
            ).map((zona) =>
              zona.vertices.length >= 3 ? (
                <Polygon
                  key={`rz_${zona.id}`}
                  positions={[...zona.vertices, zona.vertices[0]]}
                  pathOptions={{ fillColor: '#ef4444', color: '#f87171', fillOpacity: 0.45, weight: 2.5, dashArray: '5,4' }}
                  eventHandlers={{ click: (e) => handleMapClick(e.latlng.lat, e.latlng.lng) }}
                >
                  <Popup>
                    <div className="text-slate-900 font-bold text-xs">
                      🔴 {zona.nombre}<br />
                      <span className="text-red-600 font-normal">{zona.descripcion}</span>
                    </div>
                  </Popup>
                </Polygon>
              ) : null
            )}

            {/* Selected location marker */}
            <Marker position={[selectedCoords.lat, selectedCoords.lng]} icon={selectedPinIcon}>
              <Popup>
                <div className="text-slate-900 font-bold text-xs">
                  📍 Ubicación de Entrega<br />
                  Distrito:{' '}
                  {(() => {
                    const matched = distritosList.find((d) => {
                      const apMatch = distritos?.find((ap) => ap.id === idDistritoDestinatario);
                      return (apMatch && d.nombre.toLowerCase() === apMatch.nombre.toLowerCase()) || d.id === idDistritoDestinatario;
                    });
                    return matched ? matched.nombre : distritoInfo.nombre;
                  })()}<br />
                  {(() => {
                    const matched = distritosList.find((d) => {
                      const apMatch = distritos?.find((ap) => ap.id === idDistritoDestinatario);
                      return (apMatch && d.nombre.toLowerCase() === apMatch.nombre.toLowerCase()) || d.id === idDistritoDestinatario;
                    });
                    const active = matched ? matched.coberturaActiva : distritoInfo.coberturaActiva;
                    const fee = matched ? matched.tarifaDespacho : distritoInfo.tarifaDespacho;
                    return active ? `🟢 En Cobertura (S/ ${fee.toFixed(2)})` : '🔴 Sin Cobertura';
                  })()}
                </div>
              </Popup>
            </Marker>
          </MapContainer>

          {/* Floating bottom info badge */}
          {(() => {
            const matched = distritosList.find((d) => {
              const apMatch = distritos?.find((ap) => ap.id === idDistritoDestinatario);
              return (apMatch && d.nombre.toLowerCase() === apMatch.nombre.toLowerCase()) || d.id === idDistritoDestinatario;
            });
            const name = matched ? matched.nombre : distritoInfo.nombre;
            const active = matched ? matched.coberturaActiva : distritoInfo.coberturaActiva;
            const baseFee = matched ? matched.tarifaDespacho : distritoInfo.tarifaDespacho;

            const finalFee = activeYellowZone
              ? activeYellowZone.usarPorcentaje
                ? Math.round(baseFee * (1 + activeYellowZone.porcentajeRecargo / 100) * 100) / 100
                : baseFee + activeYellowZone.montoFijoRecargo
              : baseFee;

            if (activeYellowZone && active) {
              return (
                <div className="absolute bottom-3 left-3 right-3 z-20 bg-gradient-to-r from-yellow-950/95 via-slate-900/95 to-slate-900/95 backdrop-blur-md border-2 border-yellow-500/60 rounded-2xl p-3.5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
                      <MapPin size={22} className="animate-bounce" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                        <span>Distrito:</span>
                        <span className="text-yellow-300 font-mono text-sm">{name}</span>
                        <span className="text-[10px] bg-yellow-500/25 text-yellow-300 border border-yellow-500/40 px-2.5 py-0.5 rounded-full font-bold">
                          🟡 Zona Alejada ({activeYellowZone.nombre})
                        </span>
                      </div>
                      <div className="text-[11px] text-yellow-200/90 font-medium">
                        Recargo especial del <strong>+{activeYellowZone.porcentajeRecargo}%</strong> por sub-zona distante
                      </div>
                    </div>
                  </div>

                  {/* Big Animated Yellow Delivery Fee Badge */}
                  <div className="flex flex-col items-end bg-yellow-500/20 border-2 border-yellow-500/60 px-4 py-2 rounded-2xl self-end sm:self-auto shadow-xl shadow-yellow-500/20">
                    <span className="text-yellow-400 text-[10px] uppercase font-bold tracking-widest">COSTO TOTAL DE ENVÍO</span>
                    <span className="font-extrabold text-yellow-300 font-mono text-xl sm:text-2xl tracking-tight drop-shadow-md animate-bounce">
                      S/ {finalFee.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-yellow-200/70 font-mono">
                      (Base S/ {baseFee.toFixed(2)} + {activeYellowZone.porcentajeRecargo}%)
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border font-bold ${active ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'}`}>
                    {active ? <Navigation size={18} /> : <AlertTriangle size={18} />}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                      <span>Distrito:</span>
                      <span className="text-purple-300 font-mono">{name}</span>
                      {active ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">🟢 En Cobertura</span>
                      ) : (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">⚠️ Sin Cobertura</span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      GPS: {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
                    </div>
                  </div>
                </div>

                {/* Delivery fee display */}
                <div className="flex items-center gap-2.5 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 self-end sm:self-auto shadow-inner">
                  <span className="text-slate-400 text-xs font-medium">Costo de Envío:</span>
                  <span className="font-extrabold text-emerald-400 font-mono text-base sm:text-lg">
                    {active ? `S/ ${baseFee.toFixed(2)}` : 'Sin Cobertura'}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* GPS URL preview + Submit */}
        <div className="p-5 border-t border-slate-800 space-y-4 bg-slate-950/40">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              9. Link GPS generado automáticamente
            </label>
            <div className="relative">
              <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                placeholder="Haz clic en el mapa para generar el link..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-violet-400 hover:text-violet-300 mt-1 inline-flex items-center gap-1"
              >
                <MapPin size={11} /> Abrir en Google Maps
              </a>
            )}
          </div>

          {/* Submit button */}
          <div className="pt-2">
            {(() => {
              const matched = distritosList.find((d) => {
                const apMatch = distritos?.find((ap) => ap.id === idDistritoDestinatario);
                return (apMatch && d.nombre.toLowerCase() === apMatch.nombre.toLowerCase()) || d.id === idDistritoDestinatario;
              });
              const isInactive = matched ? !matched.coberturaActiva : false;
              const isBlocked = isPending || isInactive || !!activeRestrictedZone;

              let label = 'Agendar Envío y Generar Código';
              if (isPending) {
                label = 'Agendando...';
              } else if (activeRestrictedZone) {
                label = `🔴 Zona Restringida: ${activeRestrictedZone.nombre} (Bloqueado)`;
              } else if (isInactive) {
                label = '🚫 Sin Cobertura — Selecciona un distrito habilitado (🟢)';
              }

              return (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isBlocked}
                  className={`w-full flex items-center justify-center gap-2 text-white text-sm font-semibold rounded-xl py-3.5 px-4 shadow-lg transition-all duration-200 ${
                    isBlocked
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/25 cursor-pointer'
                  }`}
                >
                  {isPending ? <Loader2 className="animate-spin" size={18} /> : label}
                </button>
              );
            })()}
          </div>

          <button
            type="button"
            onClick={onBackToStep1}
            className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer py-1"
          >
            ← Volver a editar datos del envío
          </button>
        </div>
      </div>
    </div>
  );
};
