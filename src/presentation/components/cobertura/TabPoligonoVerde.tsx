import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Pencil, Save, Info, PlusCircle, Trash2 } from 'lucide-react';
import type { DistritoTarifaDto, ZonaRestringidaDto } from '../../../application/useCases/useCoberturaAdmin';
import { greenPinIcon, redPinIcon, vertexIcon } from './coberturaIcons';
import { MapClickAdder, MapController } from './MapHelpers';

interface Props {
  editGreen: boolean;
  setEditGreen: (val: boolean) => void;
  greenVertices: [number, number][];
  savedGreenVertices: [number, number][];
  setGreenVertices: React.Dispatch<React.SetStateAction<[number, number][]>>;
  handleAddGreenVertex: (lat: number, lng: number) => void;
  handleDragGreenVertex: (idx: number, lat: number, lng: number) => void;
  handleDeleteGreenVertex: (idx: number) => void;
  onRequestSaveConfirm: () => void;
  distritosList: DistritoTarifaDto[];
  zonas: ZonaRestringidaDto[];
  mapFocusCenter: [number, number] | null;
  setMapFocusCenter: (center: [number, number] | null) => void;
}

export const TabPoligonoVerde: React.FC<Props> = ({
  editGreen,
  setEditGreen,
  greenVertices,
  savedGreenVertices,
  setGreenVertices,
  handleAddGreenVertex,
  handleDragGreenVertex,
  handleDeleteGreenVertex,
  onRequestSaveConfirm,
  distritosList,
  zonas,
  mapFocusCenter,
  setMapFocusCenter,
}) => {
  const greenDisplay: [number, number][] =
    greenVertices.length > 0 ? [...greenVertices, greenVertices[0]] : [];

  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 shadow-xl space-y-4">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin size={15} className="text-emerald-400" />
            Editor de Zona de Cobertura Principal
            {editGreen && (
              <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                EDITANDO
              </span>
            )}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {editGreen
              ? '📍 Clic en el mapa para agregar vértice · Arrastra los puntos naranjas · Clic en vértice para eliminar'
              : 'Define con precisión hasta dónde llegan tus motorizados.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {!editGreen ? (
            <button
              type="button"
              onClick={() => setEditGreen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-orange-600/30"
            >
              <Pencil size={13} /> Editar Zona
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onRequestSaveConfirm}
                disabled={greenVertices.length < 3}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all"
              >
                <Save size={13} /> Guardar Zona
              </button>
              <button
                type="button"
                onClick={() => {
                  setGreenVertices([...savedGreenVertices]);
                  setEditGreen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer border border-slate-700"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>

      {editGreen && (
        <div className="flex items-start gap-2.5 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-3 text-xs text-orange-200">
          <Info size={15} className="text-orange-400 mt-0.5 shrink-0" />
          <ul className="list-disc pl-3 space-y-0.5 text-orange-200/80">
            <li><strong>Agregar:</strong> Haz clic en el mapa para añadir un punto al polígono.</li>
            <li><strong>Mover:</strong> Arrastra el punto naranja 🟠 a la posición deseada.</li>
            <li><strong>Eliminar:</strong> Clic en el punto naranja → botón Eliminar en el popup.</li>
          </ul>
        </div>
      )}

      {editGreen && (
        <div className="flex items-center gap-2 text-xs">
          <PlusCircle size={13} className="text-orange-400" />
          <span className="text-slate-400">Vértices:</span>
          <span className="font-bold text-white font-mono">{greenVertices.length}</span>
          {greenVertices.length < 3 && <span className="text-amber-400">(mínimo 3 puntos)</span>}
        </div>
      )}

      {/* District Focus Combo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <MapPin size={15} className="text-emerald-400" />
          <span>Ubicar / Enfocar Distrito en Mapa:</span>
        </div>
        <select
          onChange={(e) => {
            const target = distritosList.find((d) => d.nombre === e.target.value);
            if (target) setMapFocusCenter([target.latitud, target.longitud]);
          }}
          defaultValue=""
          className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-emerald-400 cursor-pointer w-full sm:w-auto"
        >
          <option value="" disabled>-- Selecciona un distrito para centrar --</option>
          {distritosList.map((d) => (
            <option key={d.id} value={d.nombre}>
              {d.nombre} ({d.zonaNombre}) {d.coberturaActiva ? '🟢' : '🔴'}
            </option>
          ))}
        </select>
      </div>

      {/* Leaflet Map */}
      <div className={`rounded-2xl overflow-hidden border transition-all ${editGreen ? 'border-orange-500/50 h-[520px]' : 'border-slate-800 h-[380px]'}`}>
        <MapContainer center={[-12.085, -77.035]} zoom={11} style={{ width: '100%', height: '100%' }} doubleClickZoom={!editGreen}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapClickAdder active={editGreen} onAdd={handleAddGreenVertex} />
          <MapController center={mapFocusCenter} />

          {/* Green polygon */}
          {greenDisplay.length >= 3 && (
            <Polygon
              positions={greenDisplay}
              pathOptions={{
                fillColor: '#10b981',
                color: editGreen ? '#f97316' : '#34d399',
                fillOpacity: 0.33,
                weight: editGreen ? 3 : 2.5,
                dashArray: editGreen ? '6,4' : undefined
              }}
            />
          )}

          {/* Context restricted red zones */}
          {zonas.map((z) =>
            z.vertices.length >= 3 ? (
              <Polygon
                key={`ctx_red_${z.id}`}
                positions={[
                  ...z.vertices.map((v) => [v.latitud, v.longitud] as [number, number]),
                  [z.vertices[0].latitud, z.vertices[0].longitud]
                ]}
                pathOptions={{ fillColor: '#ef4444', color: '#f87171', fillOpacity: 0.35, weight: 2 }}
              />
            ) : null
          )}

          {/* Draggable orange vertices */}
          {editGreen &&
            greenVertices.map((v, idx) => (
              <Marker
                key={`gv_${idx}`}
                position={v}
                icon={vertexIcon}
                draggable
                eventHandlers={{
                  dragend(e) {
                    const ll = (e.target as L.Marker).getLatLng();
                    handleDragGreenVertex(idx, ll.lat, ll.lng);
                  },
                }}
              >
                <Popup>
                  <div className="text-slate-900 text-xs space-y-1">
                    <div className="font-bold">Vértice #{idx + 1}</div>
                    <div className="font-mono text-[10px]">{v[0].toFixed(5)}, {v[1].toFixed(5)}</div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGreenVertex(idx)}
                      className="flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg cursor-pointer w-full justify-center"
                    >
                      <Trash2 size={11} /> Eliminar
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Read-only district markers */}
          {!editGreen &&
            distritosList.map((d) => (
              <Marker key={`dp_${d.id}`} position={[d.latitud, d.longitud]} icon={d.coberturaActiva ? greenPinIcon : redPinIcon}>
                <Popup>
                  <div className="text-slate-900 font-bold text-xs">
                    {d.nombre}<br />
                    {d.coberturaActiva ? '🟢 Activo' : '🔴 Sin Cobertura'}<br />
                    S/ {d.tarifaDespacho.toFixed(2)}
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
};
