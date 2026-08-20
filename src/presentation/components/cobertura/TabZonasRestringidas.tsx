import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldOff, Plus, Pencil, Save, ChevronUp, ChevronDown, Trash2, Info, MapPin } from 'lucide-react';
import type { DistritoTarifaDto, ZonaAlejadaDto, ZonaRestringidaDto } from '../../../application/useCases/useCoberturaAdmin';
import { redVertexIcon } from './coberturaIcons';
import { MapClickAdder, MapController } from './MapHelpers';

interface Props {
  zonas: ZonaRestringidaDto[];
  editingZonaId: number | null;
  setEditingZonaId: (id: number | null) => void;
  expandedZonaId: number | null;
  setExpandedZonaId: (id: number | null) => void;
  handleAddZona: () => void;
  handleDeleteZona: (id: number) => void;
  handleUpdateZonaNombre: (id: number, nombre: string) => void;
  handleUpdateZonaDesc: (id: number, desc: string) => void;
  handleAddRedVertex: (lat: number, lng: number) => void;
  handleDragRedVertex: (zonaId: number, idx: number, lat: number, lng: number) => void;
  handleDeleteRedVertex: (zonaId: number, idx: number) => void;
  setPendingZonaToSave: (zona: ZonaRestringidaDto) => void;
  greenDisplay: [number, number][];
  zonasAlejadas?: ZonaAlejadaDto[];
  distritosList: DistritoTarifaDto[];
  mapFocusCenter: [number, number] | null;
  setMapFocusCenter: (center: [number, number] | null) => void;
}

export const TabZonasRestringidas: React.FC<Props> = ({
  zonas,
  editingZonaId,
  setEditingZonaId,
  expandedZonaId,
  setExpandedZonaId,
  handleAddZona,
  handleDeleteZona,
  handleUpdateZonaNombre,
  handleUpdateZonaDesc,
  handleAddRedVertex,
  handleDragRedVertex,
  handleDeleteRedVertex,
  setPendingZonaToSave,
  greenDisplay,
  zonasAlejadas = [],
  distritosList,
  mapFocusCenter,
  setMapFocusCenter,
}) => {
  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldOff size={15} className="text-red-400" />
            Zonas Restringidas / Sin Cobertura
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Define polígonos rojos sobre áreas específicas donde el motorizado no puede entregar (zonas de riesgo, acceso restringido, etc.).
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddZona}
          className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-red-700/30"
        >
          <Plus size={14} /> Nueva Zona Restringida
        </button>
      </div>

      {zonas.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-xs space-y-2">
          <ShieldOff size={36} className="mx-auto text-slate-700" />
          <p>No hay zonas restringidas configuradas.</p>
          <p>Haz clic en <strong className="text-red-400">"Nueva Zona Restringida"</strong> para agregar una.</p>
        </div>
      )}

      {/* Zone Cards */}
      {zonas.map((zona) => {
        const isEditing = editingZonaId === zona.id;
        const isExpanded = expandedZonaId === zona.id;
        const vList: [number, number][] = zona.vertices.map((v) => [v.latitud, v.longitud]);
        const zDisplay: [number, number][] = vList.length >= 3 ? [...vList, vList[0]] : [];

        return (
          <div
            key={zona.id}
            className={`bg-slate-900/40 border rounded-3xl shadow-xl transition-all ${
              isEditing ? 'border-red-500/50 shadow-red-500/10' : 'border-slate-800'
            }`}
          >
            {/* Card Header */}
            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
                <ShieldOff size={16} />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <input
                  value={zona.nombre}
                  onChange={(e) => handleUpdateZonaNombre(zona.id, e.target.value)}
                  className="w-full bg-transparent border-b border-slate-700 focus:border-red-400 text-sm font-bold text-white outline-none pb-0.5 transition-colors"
                  placeholder="Nombre de la zona..."
                />
                <input
                  value={zona.descripcion}
                  onChange={(e) => handleUpdateZonaDesc(zona.id, e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-400 outline-none"
                  placeholder="Descripción (opcional)..."
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                    zona.vertices.length >= 3
                      ? 'bg-red-500/20 text-red-300 border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {zona.vertices.length} vértices
                </span>

                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => setPendingZonaToSave(zona)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md transition-all"
                  >
                    <Save size={12} /> Listo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingZonaId(zona.id);
                      setExpandedZonaId(zona.id);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700/40 hover:bg-red-700/60 text-red-300 rounded-xl font-bold text-xs cursor-pointer border border-red-500/30"
                  >
                    <Pencil size={12} /> Editar
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setExpandedZonaId(isExpanded ? null : zona.id)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteZona(zona.id)}
                  className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Expanded: Map + Vertex List */}
            {isExpanded && (
              <div className="px-4 pb-4 space-y-3">
                {isEditing && (
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-xs text-red-200">
                    <Info size={15} className="text-red-400 mt-0.5 shrink-0" />
                    <ul className="list-disc pl-3 space-y-0.5 text-red-200/80">
                      <li><strong>Agregar:</strong> Haz clic en el mapa para añadir un punto al polígono rojo.</li>
                      <li><strong>Mover:</strong> Arrastra el punto rojo 🔴 a la posición exacta.</li>
                      <li><strong>Eliminar:</strong> Clic en el punto rojo → botón Eliminar.</li>
                    </ul>
                  </div>
                )}

                {/* District Focus Combo */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-bold">
                    <MapPin size={15} className="text-red-400" />
                    <span>Ubicar / Enfocar Distrito en Mapa:</span>
                  </div>
                  <select
                    onChange={(e) => {
                      const target = distritosList.find((d) => d.nombre === e.target.value);
                      if (target) setMapFocusCenter([target.latitud, target.longitud]);
                    }}
                    defaultValue=""
                    className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-red-400 cursor-pointer w-full sm:w-auto"
                  >
                    <option value="" disabled>-- Selecciona un distrito para centrar el mapa --</option>
                    {distritosList.map((d) => (
                      <option key={d.id} value={d.nombre}>
                        {d.nombre} ({d.zonaNombre}) {d.coberturaActiva ? '🟢' : '🔴'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Map */}
                <div className={`rounded-2xl overflow-hidden border ${isEditing ? 'border-red-500/50 h-[460px]' : 'border-slate-800 h-[300px]'}`}>
                  <MapContainer center={[-12.085, -77.035]} zoom={12} style={{ width: '100%', height: '100%' }} doubleClickZoom={!isEditing}>
                    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickAdder active={isEditing} onAdd={handleAddRedVertex} />
                    <MapController center={mapFocusCenter} />

                    {/* Green main coverage as context */}
                    {greenDisplay.length >= 3 && (
                      <Polygon positions={greenDisplay} pathOptions={{ fillColor: '#10b981', color: '#34d399', fillOpacity: 0.22, weight: 2 }} />
                    )}

                    {/* Yellow remote sub-zones as context */}
                    {zonasAlejadas.map((za) => {
                      const aList: [number, number][] = za.vertices.map((v) => [v.latitud, v.longitud]);
                      if (aList.length < 3) return null;
                      return (
                        <Polygon
                          key={`ctx_yellow_${za.id}`}
                          positions={[...aList, aList[0]]}
                          pathOptions={{ fillColor: '#eab308', color: '#ca8a04', fillOpacity: 0.25, weight: 1.5 }}
                        />
                      );
                    })}

                    {/* All other red zones as context */}
                    {zonas
                      .filter((z) => z.id !== zona.id)
                      .map(
                        (z) =>
                          z.vertices.length >= 3 && (
                            <Polygon
                              key={`ctx_${z.id}`}
                              positions={[
                                ...z.vertices.map((v) => [v.latitud, v.longitud] as [number, number]),
                                [z.vertices[0].latitud, z.vertices[0].longitud]
                              ]}
                              pathOptions={{ fillColor: '#ef4444', color: '#f87171', fillOpacity: 0.28, weight: 1.5 }}
                            />
                          )
                      )}

                    {/* This zone polygon */}
                    {zDisplay.length >= 3 && (
                      <Polygon
                        positions={zDisplay}
                        pathOptions={{
                          fillColor: '#ef4444',
                          color: isEditing ? '#fca5a5' : '#f87171',
                          fillOpacity: 0.42,
                          weight: isEditing ? 3 : 2,
                          dashArray: isEditing ? '6,4' : undefined
                        }}
                      />
                    )}

                    {/* Draggable red vertices */}
                    {isEditing &&
                      zona.vertices.map((v, idx) => (
                        <Marker
                          key={`rv_${idx}`}
                          position={[v.latitud, v.longitud]}
                          icon={redVertexIcon}
                          draggable
                          eventHandlers={{
                            dragend(e) {
                              const ll = (e.target as L.Marker).getLatLng();
                              handleDragRedVertex(zona.id, idx, ll.lat, ll.lng);
                            },
                          }}
                        >
                          <Popup>
                            <div className="text-slate-900 text-xs space-y-1">
                              <div className="font-bold">Vértice #{idx + 1}</div>
                              <div className="font-mono text-[10px]">{v.latitud.toFixed(5)}, {v.longitud.toFixed(5)}</div>
                              <button
                                type="button"
                                onClick={() => handleDeleteRedVertex(zona.id, idx)}
                                className="flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg cursor-pointer w-full justify-center"
                              >
                                <Trash2 size={11} /> Eliminar
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                  </MapContainer>
                </div>

                {/* Vertex List */}
                {zona.vertices.length > 0 && (
                  <div className="rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Vértices del Polígono</span>
                      <span className="font-mono">{zona.vertices.length} puntos</span>
                    </div>
                    <div className="max-h-36 overflow-y-auto divide-y divide-slate-900">
                      {zona.vertices.map((v, i) => (
                        <div key={i} className="flex items-center justify-between px-4 py-2 hover:bg-slate-900/40 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-[10px] flex items-center justify-center">
                              {i + 1}
                            </div>
                            <span className="font-mono text-slate-400">
                              <span className="text-white">{v.latitud.toFixed(5)}</span>, <span className="text-white">{v.longitud.toFixed(5)}</span>
                            </span>
                          </div>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRedVertex(zona.id, i)}
                              className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
