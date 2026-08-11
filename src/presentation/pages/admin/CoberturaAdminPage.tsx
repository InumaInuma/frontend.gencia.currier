import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../application/context/AuthContext';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import type { IZonaCoberturaInfo } from '../../../infrastructure/utils/coberturaData';
import {
  obtenerDistritosCobertura,
  guardarDistritosCobertura,
  obtenerPoligonoCobertura,
  guardarPoligonoCobertura,
  resetPoligonoCobertura,
  LIMA_COVERAGE_MAIN_POLYGON,
} from '../../../infrastructure/utils/coberturaData';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Search,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Pencil,
  Save,
  Trash2,
  RotateCcw,
  PlusCircle,
  Info,
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
  shadowSize: [41, 41],
});

const redPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Draggable vertex icon - orange circle
const vertexIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width: 18px; height: 18px;
    background: #f97316;
    border: 3px solid #ffffff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    cursor: grab;
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ---- Sub-component: listens for map clicks to add new polygon vertex ----
const MapClickAdder: React.FC<{
  editMode: boolean;
  onAddVertex: (lat: number, lng: number) => void;
}> = ({ editMode, onAddVertex }) => {
  useMapEvents({
    click(e) {
      if (editMode) {
        onAddVertex(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// ---- Main Component ----
export const CoberturaAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  // Districts
  const [distritosList, setDistritosList] = useState<IZonaCoberturaInfo[]>(() => obtenerDistritosCobertura());
  const [searchTerm, setSearchTerm] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Polygon editor state
  const [editMode, setEditMode] = useState(false);
  // Vertices: array without the closing duplicate (we close it visually)
  const [vertices, setVertices] = useState<[number, number][]>(() => {
    const poly = obtenerPoligonoCobertura();
    // Remove duplicate last point if it closes the polygon
    const pts = [...poly];
    if (
      pts.length > 1 &&
      pts[0][0] === pts[pts.length - 1][0] &&
      pts[0][1] === pts[pts.length - 1][1]
    ) {
      pts.pop();
    }
    return pts;
  });
  const [savedVertices, setSavedVertices] = useState<[number, number][]>(() => {
    const poly = obtenerPoligonoCobertura();
    const pts = [...poly];
    if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) pts.pop();
    return pts;
  });

  // Dragging state handled via Leaflet eventHandlers on each Marker

  if (!user) return null;

  // ---- District handlers ----
  const handleToggleCobertura = (idDistrito: number) => {
    const updated = distritosList.map((item) =>
      item.id === idDistrito ? { ...item, coberturaActiva: !item.coberturaActiva } : item
    );
    setDistritosList(updated);
    guardarDistritosCobertura(updated);
    const target = updated.find((d) => d.id === idDistrito);
    setFeedbackMsg({
      type: 'success',
      text: `Estado actualizado para ${target?.nombre}: ${target?.coberturaActiva ? '🟢 HABILITADO' : '🔴 DESHABILITADO'}.`,
    });
  };

  const handleUpdateTarifa = (idDistrito: number, nuevaTarifa: number) => {
    const updated = distritosList.map((item) =>
      item.id === idDistrito ? { ...item, tarifaDespacho: nuevaTarifa } : item
    );
    setDistritosList(updated);
    guardarDistritosCobertura(updated);
  };

  // ---- Polygon editor handlers ----
  const handleAddVertex = useCallback((lat: number, lng: number) => {
    setVertices((prev) => [...prev, [lat, lng]]);
  }, []);

  const handleDragVertex = (index: number, lat: number, lng: number) => {
    setVertices((prev) => {
      const updated = [...prev];
      updated[index] = [lat, lng];
      return updated;
    });
  };

  const handleDeleteVertex = (index: number) => {
    setVertices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSavePolygon = () => {
    // Append closing point
    const closed: [number, number][] = [...vertices, vertices[0]];
    guardarPoligonoCobertura(closed);
    setSavedVertices([...vertices]);
    setEditMode(false);
    setFeedbackMsg({ type: 'success', text: '🗺️ Zona de cobertura guardada correctamente. Se sincronizará automáticamente con la vista del Comercio.' });
  };

  const handleResetPolygon = () => {
    resetPoligonoCobertura();
    const defaultPts = [...LIMA_COVERAGE_MAIN_POLYGON];
    if (defaultPts.length > 1 && defaultPts[0][0] === defaultPts[defaultPts.length - 1][0]) defaultPts.pop();
    setVertices(defaultPts);
    setSavedVertices(defaultPts);
    setEditMode(false);
    setFeedbackMsg({ type: 'success', text: '🔄 Zona de cobertura restablecida al mapa predeterminado de Lima Metropolitana.' });
  };

  const handleCancelEdit = () => {
    setVertices([...savedVertices]);
    setEditMode(false);
  };

  // Polygon to display (always close it for rendering)
  const displayPolygon: [number, number][] = vertices.length > 0
    ? [...vertices, vertices[0]]
    : [];

  const distritosFiltrados = distritosList.filter(
    (d) =>
      d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.zonaNombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActivos = distritosList.filter((d) => d.coberturaActiva).length;
  const totalRestringidos = distritosList.length - totalActivos;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <LeftSidebar
        contraido={contraido}
        setContraido={setContraido}
        movilAbierto={movilAbierto}
        setMovilAbierto={setMovilAbierto}
      />

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
                Configura el polígono de cobertura y los distritos disponibles para los envíos.
              </p>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">

          {/* Feedback */}
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
              <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white cursor-pointer text-lg font-bold">×</button>
            </div>
          )}

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Distritos</span>
                <div className="text-3xl font-extrabold text-white font-mono mt-1">{distritosList.length}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
                <MapPin size={24} />
              </div>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl p-5 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Cobertura Activa</span>
                <div className="text-3xl font-extrabold text-emerald-300 font-mono mt-1">{totalActivos}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 flex items-center justify-between shadow-xl">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Sin Cobertura</span>
                <div className="text-3xl font-extrabold text-amber-300 font-mono mt-1">{totalRestringidos}</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>

          {/* ========== INTERACTIVE POLYGON EDITOR MAP ========== */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 shadow-xl space-y-4">
            {/* Editor Header & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin size={16} className="text-purple-400" />
                  <span>Editor de Zona de Cobertura</span>
                  {editMode && (
                    <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                      MODO EDICIÓN ACTIVO
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {editMode
                    ? '📍 Haz clic en el mapa para agregar vértices • Arrastra los puntos naranjas para moverlos • Haz clic en un vértice para eliminarlo'
                    : 'Activa el modo edición para personalizar la zona exacta donde llegan tus motorizados.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-orange-600/30"
                    >
                      <Pencil size={14} />
                      Editar Zona de Cobertura
                    </button>
                    <button
                      onClick={handleResetPolygon}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all cursor-pointer border border-slate-700"
                    >
                      <RotateCcw size={14} />
                      Restablecer
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSavePolygon}
                      disabled={vertices.length < 3}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={14} />
                      Guardar Zona
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-all cursor-pointer border border-slate-700"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Edit Mode Instruction Banner */}
            {editMode && (
              <div className="flex items-start gap-2.5 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-3 text-xs text-orange-200">
                <Info size={16} className="text-orange-400 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold text-orange-300">Cómo editar tu zona de cobertura:</p>
                  <ul className="space-y-0.5 text-orange-200/80 list-disc pl-4">
                    <li><strong>Agregar vértice:</strong> Haz clic en cualquier punto del mapa para agregar un nuevo punto de esquina al polígono.</li>
                    <li><strong>Mover vértice:</strong> Arrastra cualquier punto naranja 🟠 para reposicionarlo.</li>
                    <li><strong>Eliminar vértice:</strong> Haz clic sobre un punto naranja y selecciona "Eliminar".</li>
                    <li>Mínimo 3 puntos para guardar. El polígono se cierra automáticamente.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Vertex Counter */}
            {editMode && (
              <div className="flex items-center gap-2 text-xs">
                <PlusCircle size={14} className="text-orange-400" />
                <span className="text-slate-400">Vértices actuales:</span>
                <span className="font-bold text-white font-mono">{vertices.length}</span>
                {vertices.length < 3 && (
                  <span className="text-amber-400">(mínimo 3 puntos para guardar)</span>
                )}
              </div>
            )}

            {/* MAP */}
            <div
              className={`rounded-2xl overflow-hidden border transition-all ${
                editMode ? 'border-orange-500/50 shadow-lg shadow-orange-500/10 h-[520px]' : 'border-slate-800 h-[380px]'
              }`}
            >
              <MapContainer
                center={[-12.085, -77.035]}
                zoom={11}
                style={{ width: '100%', height: '100%' }}
                doubleClickZoom={!editMode}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Click listener to add vertices in edit mode */}
                <MapClickAdder editMode={editMode} onAddVertex={handleAddVertex} />

                {/* Live coverage polygon */}
                {displayPolygon.length >= 3 && (
                  <Polygon
                    positions={displayPolygon}
                    pathOptions={{
                      fillColor: '#10b981',
                      color: editMode ? '#f97316' : '#34d399',
                      fillOpacity: 0.35,
                      weight: editMode ? 3 : 2.5,
                      dashArray: editMode ? '6, 4' : undefined,
                    }}
                  />
                )}

                {/* Draggable vertex markers (edit mode only) */}
                {editMode &&
                  vertices.map((vertex, index) => (
                    <Marker
                      key={`vertex_${index}`}
                      position={vertex}
                      icon={vertexIcon}
                      draggable={true}
                      eventHandlers={{
                        dragend(e) {
                          const latLng = (e.target as L.Marker).getLatLng();
                          handleDragVertex(index, latLng.lat, latLng.lng);
                        },
                      }}
                    >
                      <Popup>
                        <div className="text-slate-900 text-xs space-y-1">
                          <div className="font-bold">Vértice #{index + 1}</div>
                          <div className="font-mono text-[10px] text-slate-600">
                            {vertex[0].toFixed(5)}, {vertex[1].toFixed(5)}
                          </div>
                          <button
                            onClick={() => handleDeleteVertex(index)}
                            className="flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg cursor-pointer transition-colors w-full justify-center"
                          >
                            <Trash2 size={11} />
                            Eliminar este punto
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                {/* Read-only mode: district pins */}
                {!editMode &&
                  distritosList.map((d) => (
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

            {/* Vertex list table (edit mode) */}
            {editMode && vertices.length > 0 && (
              <div className="rounded-2xl border border-slate-800 overflow-hidden">
                <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Lista de Vértices del Polígono
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">{vertices.length} puntos</span>
                </div>
                <div className="max-h-40 overflow-y-auto divide-y divide-slate-900">
                  {vertices.map((v, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-2 hover:bg-slate-900/40 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold text-[10px] flex items-center justify-center">
                          {i + 1}
                        </div>
                        <span className="font-mono text-slate-400">
                          Lat: <span className="text-white">{v[0].toFixed(5)}</span> &nbsp; Lng: <span className="text-white">{v[1].toFixed(5)}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteVertex(i)}
                        className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ========== DISTRICT TABLE ========== */}
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

        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};
