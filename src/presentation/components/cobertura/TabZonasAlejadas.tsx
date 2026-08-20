import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Pencil, Save, ChevronUp, ChevronDown, Trash2, Info, Percent } from 'lucide-react';
import type { ZonaAlejadaDto, ZonaRestringidaDto } from '../../../application/useCases/useCoberturaAdmin';
import { yellowVertexIcon } from './coberturaIcons';
import { MapClickAdder, MapController } from './MapHelpers';

interface Props {
  zonasAlejadas: ZonaAlejadaDto[];
  editingZonaId: number | null;
  setEditingZonaId: (id: number | null) => void;
  expandedZonaId: number | null;
  setExpandedZonaId: (id: number | null) => void;
  handleAddZonaAlejada: () => void;
  handleDeleteZonaAlejada: (id: number) => void;
  handleUpdateZonaNombre: (id: number, nombre: string) => void;
  handleUpdateZonaDesc: (id: number, desc: string) => void;
  handleUpdateZonaRecargo: (id: number, porcentaje: number) => void;
  handleAddYellowVertex: (lat: number, lng: number) => void;
  handleDragYellowVertex: (zonaId: number, idx: number, lat: number, lng: number) => void;
  handleDeleteYellowVertex: (zonaId: number, idx: number) => void;
  setPendingZonaAlejadaToSave: (zona: ZonaAlejadaDto) => void;
  greenDisplay: [number, number][];
  zonasRestringidas: ZonaRestringidaDto[];
  mapFocusCenter: [number, number] | null;
}

export const TabZonasAlejadas: React.FC<Props> = ({
  zonasAlejadas,
  editingZonaId,
  setEditingZonaId,
  expandedZonaId,
  setExpandedZonaId,
  handleAddZonaAlejada,
  handleDeleteZonaAlejada,
  handleUpdateZonaNombre,
  handleUpdateZonaDesc,
  handleUpdateZonaRecargo,
  handleAddYellowVertex,
  handleDragYellowVertex,
  handleDeleteYellowVertex,
  setPendingZonaAlejadaToSave,
  greenDisplay,
  zonasRestringidas,
  mapFocusCenter,
}) => {
  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin size={15} className="text-yellow-400" />
            Zonas Alejadas / Recargo Especial (+60%)
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Define polígonos amarillos sobre áreas distantes (ej. Ate Huaycán, Comas Collique). Al elegir una dirección en esta área, el sistema sumará el % de recargo configurado.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddZonaAlejada}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-yellow-600/30 transition-all shrink-0"
        >
          <Plus size={14} /> Nueva Zona Alejada
        </button>
      </div>

      {zonasAlejadas.length === 0 && (
        <div className="text-center py-12 text-slate-500 text-xs space-y-2">
          <MapPin size={36} className="mx-auto text-slate-700" />
          <p>No hay zonas alejadas configuradas.</p>
          <p>Haz clic en <strong className="text-yellow-400">"Nueva Zona Alejada"</strong> para crear una sub-zona de recargo.</p>
        </div>
      )}

      {/* Zone Cards */}
      {zonasAlejadas.map((zona) => {
        const isEditing = editingZonaId === zona.id;
        const isExpanded = expandedZonaId === zona.id;
        const vList: [number, number][] = zona.vertices.map((v) => [v.latitud, v.longitud]);
        const zDisplay: [number, number][] = vList.length >= 3 ? [...vList, vList[0]] : [];

        return (
          <div
            key={zona.id}
            className={`bg-slate-900/40 border rounded-3xl shadow-xl transition-all ${
              isEditing ? 'border-yellow-500/50 shadow-yellow-500/10' : 'border-slate-800'
            }`}
          >
            {/* Card Header */}
            <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5 w-full">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <input
                    type="text"
                    value={zona.nombre}
                    onChange={(e) => handleUpdateZonaNombre(zona.id, e.target.value)}
                    placeholder="Nombre de la zona (ej. Ate - Huaycán)..."
                    className="bg-transparent font-bold text-white text-xs border-b border-transparent hover:border-slate-700 focus:border-yellow-500 focus:outline-none py-0.5 w-full sm:w-64"
                  />

                  {/* Recargo Percentage Badge Input */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 text-xs font-bold shrink-0">
                    <Percent size={12} />
                    <span>Recargo: +</span>
                    <input
                      type="number"
                      value={zona.porcentajeRecargo}
                      onChange={(e) => handleUpdateZonaRecargo(zona.id, parseFloat(e.target.value) || 0)}
                      className="w-12 bg-slate-950 border border-yellow-500/40 rounded px-1 text-center font-mono font-bold text-yellow-300 text-xs focus:outline-none focus:border-yellow-400"
                    />
                    <span>%</span>
                  </div>
                </div>

                <input
                  type="text"
                  value={zona.descripcion || ''}
                  onChange={(e) => handleUpdateZonaDesc(zona.id, e.target.value)}
                  placeholder="Descripción opcional (ej. Zona distante con tarifa +60%)..."
                  className="bg-transparent text-slate-400 text-[11px] border-b border-transparent hover:border-slate-700 focus:border-yellow-500 focus:outline-none py-0.5 w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                  {zona.vertices.length} vértices
                </span>

                <button
                  type="button"
                  onClick={() => setEditingZonaId(isEditing ? null : zona.id)}
                  className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    isEditing
                      ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  <Pencil size={13} />
                  <span>{isEditing ? 'Editando...' : 'Editar'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setExpandedZonaId(isExpanded ? null : zona.id)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  title="Ver vértices"
                >
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {vList.length >= 3 && (
                  <button
                    type="button"
                    onClick={() => setPendingZonaAlejadaToSave(zona)}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-lg shadow-emerald-600/30 cursor-pointer"
                    title="Guardar esta zona alejada"
                  >
                    <Save size={13} />
                    <span>Guardar</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteZonaAlejada(zona.id)}
                  className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                  title="Eliminar zona alejada"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Editing Help Banner */}
            {isEditing && (
              <div className="mx-4 mb-3 p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs flex items-start gap-2">
                <Info size={15} className="shrink-0 mt-0.5" />
                <div>
                  <strong>Modo edición activo para "{zona.nombre}":</strong> Haz clic en el mapa de abajo para agregar vértices amarillos o arrastra los puntos amarillos existentes para ajustar el área distante.
                </div>
              </div>
            )}

            {/* Accordion Vertices List */}
            {isExpanded && (
              <div className="border-t border-slate-800 p-4 space-y-2 bg-slate-950/40 rounded-b-3xl">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Vértices de la Zona ({zona.vertices.length})
                </span>

                {zona.vertices.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Sin vértices. Activa "Editar" y haz clic en el mapa.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {zona.vertices.map((v, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                      >
                        <span className="font-mono text-slate-400 text-[11px]">
                          P{v.orden}: {v.latitud.toFixed(4)}, {v.longitud.toFixed(4)}
                        </span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleDeleteYellowVertex(zona.id, idx)}
                            className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Map Container inside Card when Editing */}
            {isEditing && (
              <div className="p-4 border-t border-slate-800 space-y-2">
                <div className="h-80 rounded-2xl overflow-hidden border border-slate-800 relative z-0">
                  <MapContainer center={[-12.046374, -77.042793]} zoom={12} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapController center={mapFocusCenter} />
                    <MapClickAdder active={isEditing} onAdd={(lat, lng) => handleAddYellowVertex(lat, lng)} />

                    {/* Polígono Verde (Cobertura Principal) */}
                    {greenDisplay.length >= 3 && (
                      <Polygon
                        positions={greenDisplay}
                        pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.1, weight: 2 }}
                      />
                    )}

                    {/* Zonas Restringidas (Rojas) */}
                    {zonasRestringidas.map((zr) => {
                      const rList: [number, number][] = zr.vertices.map((v) => [v.latitud, v.longitud]);
                      if (rList.length < 3) return null;
                      return (
                        <Polygon
                          key={`zr-${zr.id}`}
                          positions={[...rList, rList[0]]}
                          pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.3, weight: 2 }}
                        />
                      );
                    })}

                    {/* Zonas Alejadas inactivas */}
                    {zonasAlejadas
                      .filter((z) => z.id !== zona.id)
                      .map((za) => {
                        const aList: [number, number][] = za.vertices.map((v) => [v.latitud, v.longitud]);
                        if (aList.length < 3) return null;
                        return (
                          <Polygon
                            key={`za-${za.id}`}
                            positions={[...aList, aList[0]]}
                            pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.25, weight: 2 }}
                          />
                        );
                      })}

                    {/* Zona Alejada en edición activa */}
                    {zDisplay.length >= 3 && (
                      <Polygon
                        positions={zDisplay}
                        pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.4, weight: 3, dashArray: '5,5' }}
                      />
                    )}

                    {/* Drag Markers for Active Yellow Polygon */}
                    {vList.map((coords, idx) => (
                      <Marker
                        key={idx}
                        position={coords}
                        icon={yellowVertexIcon}
                        draggable
                        eventHandlers={{
                          dragend: (e: any) => {
                            const marker = e.target;
                            const pos = marker.getLatLng();
                            handleDragYellowVertex(zona.id, idx, pos.lat, pos.lng);
                          },
                        }}
                      >
                        <Popup>
                          <div className="text-slate-900 font-bold text-xs">
                            📍 {zona.nombre} - Vértice #{idx + 1}
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
