import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import type { IDistrito } from '../../../../domain/models/IDistrito';
import type { DistritoTarifaDto, ZonaAlejadaDto, ZonaRestringidaDto } from '../../../../application/useCases/useCoberturaAdmin';
import type { IZonaCoberturaInfo } from '../../../../infrastructure/utils/coberturaData';
import {
  obtenerPoligonoCobertura,
  obtenerZonasRestringidas,
} from '../../../../infrastructure/utils/coberturaData';
import { selectedPinIcon, MapClickListener, MapController } from '../agendarEnvioUtils';
import { DeliveryFeeBadge } from './DeliveryFeeBadge';

interface Props {
  selectedCoords: { lat: number; lng: number };
  handleMapClick: (lat: number, lng: number) => void;
  greenPolygon: [number, number][];
  yellowZones?: ZonaAlejadaDto[];
  redZones: ZonaRestringidaDto[];
  idDistritoDestinatario: number | '';
  distritosList: DistritoTarifaDto[];
  distritos: IDistrito[] | undefined;
  distritoInfo: IZonaCoberturaInfo;
  activeYellowZone?: ZonaAlejadaDto | null;
}

export const LocationMapPicker: React.FC<Props> = ({
  selectedCoords,
  handleMapClick,
  greenPolygon,
  yellowZones,
  redZones,
  idDistritoDestinatario,
  distritosList,
  distritos,
  distritoInfo,
  activeYellowZone,
}) => {
  return (
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
        <DeliveryFeeBadge
          distritosList={distritosList}
          distritos={distritos}
          idDistritoDestinatario={idDistritoDestinatario}
          distritoInfo={distritoInfo}
          activeYellowZone={activeYellowZone}
          selectedCoords={selectedCoords}
        />
      </div>
    </div>
  );
};
