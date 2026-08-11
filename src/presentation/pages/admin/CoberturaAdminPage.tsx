import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../application/context/AuthContext';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import type { IZonaCoberturaInfo, IZonaRestringida } from '../../../infrastructure/utils/coberturaData';
import {
  obtenerDistritosCobertura,
  guardarDistritosCobertura,
  obtenerPoligonoCobertura,
  guardarPoligonoCobertura,
  resetPoligonoCobertura,
  LIMA_COVERAGE_MAIN_POLYGON,
  obtenerZonasRestringidas,
  guardarZonasRestringidas,
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
  ShieldOff,
  Plus,
  ChevronDown,
  ChevronUp,
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
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const redPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Orange vertex icon for green polygon editor
const vertexIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#f97316;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.5);cursor:grab"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

// Red vertex icon for restricted zone editor
const redVertexIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:18px;height:18px;background:#ef4444;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.5);cursor:grab"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

// ---- Map click listener sub-component ----
const MapClickAdder: React.FC<{
  active: boolean;
  onAdd: (lat: number, lng: number) => void;
}> = ({ active, onAdd }) => {
  useMapEvents({
    click(e) {
      if (active) onAdd(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// ---- Helpers ----
function stripClosingVertex(coords: [number, number][]): [number, number][] {
  const pts = [...coords];
  if (pts.length > 1 && pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1]) {
    pts.pop();
  }
  return pts;
}

// ============================================================
//  MAIN COMPONENT
// ============================================================
export const CoberturaAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [activeTab, setActiveTab] = useState<'cobertura' | 'restringidas' | 'distritos'>('cobertura');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ---- Districts ----
  const [distritosList, setDistritosList] = useState<IZonaCoberturaInfo[]>(() => obtenerDistritosCobertura());
  const [searchTerm, setSearchTerm] = useState('');

  // ---- Green coverage polygon editor ----
  const [editGreen, setEditGreen] = useState(false);
  const [greenVertices, setGreenVertices] = useState<[number, number][]>(() => stripClosingVertex(obtenerPoligonoCobertura()));
  const [savedGreenVertices, setSavedGreenVertices] = useState<[number, number][]>(() => stripClosingVertex(obtenerPoligonoCobertura()));

  // ---- Red restricted zones editor ----
  const [zonas, setZonas] = useState<IZonaRestringida[]>(() => obtenerZonasRestringidas());
  const [editingZonaId, setEditingZonaId] = useState<number | null>(null);
  const [expandedZonaId, setExpandedZonaId] = useState<number | null>(null);

  if (!user) return null;

  const showFeedback = (type: 'success' | 'error', text: string) => setFeedbackMsg({ type, text });

  // ---- District handlers ----
  const handleToggleCobertura = (id: number) => {
    const updated = distritosList.map((d) => d.id === id ? { ...d, coberturaActiva: !d.coberturaActiva } : d);
    setDistritosList(updated);
    guardarDistritosCobertura(updated);
    const t = updated.find((d) => d.id === id);
    showFeedback('success', `${t?.nombre}: ${t?.coberturaActiva ? '🟢 HABILITADO' : '🔴 DESHABILITADO'}`);
  };

  const handleUpdateTarifa = (id: number, tarifa: number) => {
    const updated = distritosList.map((d) => d.id === id ? { ...d, tarifaDespacho: tarifa } : d);
    setDistritosList(updated);
    guardarDistritosCobertura(updated);
  };

  // ---- Green polygon handlers ----
  const handleAddGreenVertex = useCallback((lat: number, lng: number) => {
    setGreenVertices((prev) => [...prev, [lat, lng]]);
  }, []);

  const handleDragGreenVertex = (idx: number, lat: number, lng: number) => {
    setGreenVertices((prev) => { const u = [...prev]; u[idx] = [lat, lng]; return u; });
  };

  const handleDeleteGreenVertex = (idx: number) => {
    setGreenVertices((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveGreen = () => {
    const closed: [number, number][] = [...greenVertices, greenVertices[0]];
    guardarPoligonoCobertura(closed);
    setSavedGreenVertices([...greenVertices]);
    setEditGreen(false);
    showFeedback('success', '🗺️ Zona de cobertura guardada y sincronizada con la vista del Comercio.');
  };

  const handleResetGreen = () => {
    resetPoligonoCobertura();
    const def = stripClosingVertex(LIMA_COVERAGE_MAIN_POLYGON);
    setGreenVertices(def);
    setSavedGreenVertices(def);
    setEditGreen(false);
    showFeedback('success', '🔄 Zona restablecida al mapa predeterminado de Lima.');
  };

  const greenDisplay: [number, number][] = greenVertices.length > 0 ? [...greenVertices, greenVertices[0]] : [];

  // ---- Red restricted zone handlers ----
  const handleAddZona = () => {
    const newZona: IZonaRestringida = {
      id: Date.now(),
      nombre: 'Nueva Zona Restringida',
      descripcion: 'Zona sin cobertura',
      vertices: [],
    };
    const updated = [...zonas, newZona];
    setZonas(updated);
    guardarZonasRestringidas(updated);
    setEditingZonaId(newZona.id);
    setExpandedZonaId(newZona.id);
  };

  const handleDeleteZona = (id: number) => {
    const updated = zonas.filter((z) => z.id !== id);
    setZonas(updated);
    guardarZonasRestringidas(updated);
    if (editingZonaId === id) setEditingZonaId(null);
    showFeedback('success', '🗑️ Zona restringida eliminada.');
  };

  const handleUpdateZonaNombre = (id: number, nombre: string) => {
    const updated = zonas.map((z) => z.id === id ? { ...z, nombre } : z);
    setZonas(updated);
    guardarZonasRestringidas(updated);
  };

  const handleUpdateZonaDesc = (id: number, descripcion: string) => {
    const updated = zonas.map((z) => z.id === id ? { ...z, descripcion } : z);
    setZonas(updated);
    guardarZonasRestringidas(updated);
  };

  const handleAddRedVertex = useCallback((lat: number, lng: number) => {
    if (editingZonaId === null) return;
    const updated = zonas.map((z) =>
      z.id === editingZonaId ? { ...z, vertices: [...z.vertices, [lat, lng] as [number, number]] } : z
    );
    setZonas(updated);
    guardarZonasRestringidas(updated);
  }, [editingZonaId, zonas]);

  const handleDragRedVertex = (zonaId: number, idx: number, lat: number, lng: number) => {
    const updated = zonas.map((z) => {
      if (z.id !== zonaId) return z;
      const v = [...z.vertices];
      v[idx] = [lat, lng];
      return { ...z, vertices: v };
    });
    setZonas(updated);
    guardarZonasRestringidas(updated);
  };

  const handleDeleteRedVertex = (zonaId: number, idx: number) => {
    const updated = zonas.map((z) =>
      z.id === zonaId ? { ...z, vertices: z.vertices.filter((_, i) => i !== idx) } : z
    );
    setZonas(updated);
    guardarZonasRestringidas(updated);
  };

  // editingZona resolved per-card inside render

  const distritosFiltrados = distritosList.filter(
    (d) => d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || d.zonaNombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalActivos = distritosList.filter((d) => d.coberturaActiva).length;
  const totalRestringidos = distritosList.length - totalActivos;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <LeftSidebar contraido={contraido} setContraido={setContraido} movilAbierto={movilAbierto} setMovilAbierto={setMovilAbierto} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${contraido ? 'md:ml-20' : 'md:ml-64'} pb-20 md:pb-8`}>

        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 sm:px-8 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Zonas de Cobertura y Tarifas</h1>
            <p className="text-xs text-slate-400">Configura el mapa de entrega exacto para tus motorizados.</p>
          </div>
        </header>

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">

          {/* Feedback */}
          {feedbackMsg && (
            <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 shadow-lg ${feedbackMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
              {feedbackMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <div className="flex-1">{feedbackMsg.text}</div>
              <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-white cursor-pointer text-lg font-bold">×</button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Distritos', value: distritosList.length, color: 'slate', icon: <MapPin size={22} /> },
              { label: 'En Cobertura', value: totalActivos, color: 'emerald', icon: <ShieldCheck size={22} /> },
              { label: 'Sin Cobertura', value: totalRestringidos, color: 'amber', icon: <AlertCircle size={22} /> },
              { label: 'Zonas Restringidas', value: zonas.length, color: 'red', icon: <ShieldOff size={22} /> },
            ].map((s) => (
              <div key={s.label} className={`bg-${s.color}-950/20 border border-${s.color}-800/30 rounded-3xl p-5 flex items-center justify-between shadow-xl`}>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider text-${s.color}-400`}>{s.label}</span>
                  <div className={`text-3xl font-extrabold text-${s.color}-300 font-mono mt-1`}>{s.value}</div>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500/20 text-${s.color}-300 border border-${s.color}-500/40 flex items-center justify-center`}>{s.icon}</div>
              </div>
            ))}
          </div>

          {/* TABS */}
          <div className="flex gap-2 border-b border-slate-800 pb-0">
            {[
              { key: 'cobertura', label: '🟢 Zona de Cobertura', desc: 'Polígono verde' },
              { key: 'restringidas', label: '🔴 Zonas Restringidas', desc: 'Polígonos rojos' },
              { key: 'distritos', label: '📋 Distritos y Tarifas', desc: 'Tabla de configuración' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? tab.key === 'cobertura' ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300'
                    : tab.key === 'restringidas' ? 'bg-red-500/10 border-red-400 text-red-300'
                    : 'bg-purple-500/10 border-purple-400 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ======= TAB: ZONA DE COBERTURA (GREEN) ======= */}
          {activeTab === 'cobertura' && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    <MapPin size={15} className="text-emerald-400" />
                    Editor de Zona de Cobertura Principal
                    {editGreen && <span className="text-[10px] bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">EDITANDO</span>}
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {editGreen ? '📍 Clic en el mapa para agregar vértice · Arrastra los puntos naranjas · Clic en vértice para eliminar'
                      : 'Define con precisión hasta dónde llegan tus motorizados.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!editGreen ? (
                    <>
                      <button onClick={() => setEditGreen(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-orange-600/30">
                        <Pencil size={13} /> Editar Zona
                      </button>
                      <button onClick={handleResetGreen} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer border border-slate-700">
                        <RotateCcw size={13} /> Restablecer
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleSaveGreen} disabled={greenVertices.length < 3} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-emerald-600/30 disabled:opacity-50">
                        <Save size={13} /> Guardar Zona
                      </button>
                      <button onClick={() => { setGreenVertices([...savedGreenVertices]); setEditGreen(false); }} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs cursor-pointer border border-slate-700">
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

              <div className={`rounded-2xl overflow-hidden border transition-all ${editGreen ? 'border-orange-500/50 h-[520px]' : 'border-slate-800 h-[380px]'}`}>
                <MapContainer center={[-12.085, -77.035]} zoom={11} style={{ width: '100%', height: '100%' }} doubleClickZoom={!editGreen}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapClickAdder active={editGreen} onAdd={handleAddGreenVertex} />

                  {/* Green polygon */}
                  {greenDisplay.length >= 3 && (
                    <Polygon positions={greenDisplay} pathOptions={{ fillColor: '#10b981', color: editGreen ? '#f97316' : '#34d399', fillOpacity: 0.33, weight: editGreen ? 3 : 2.5, dashArray: editGreen ? '6,4' : undefined }} />
                  )}

                  {/* All red restricted zones shown as context */}
                  {zonas.map((z) => z.vertices.length >= 3 && (
                    <Polygon key={`ctx_red_${z.id}`} positions={[...z.vertices, z.vertices[0]]} pathOptions={{ fillColor: '#ef4444', color: '#f87171', fillOpacity: 0.35, weight: 2 }} />
                  ))}

                  {/* Draggable orange vertices */}
                  {editGreen && greenVertices.map((v, idx) => (
                    <Marker key={`gv_${idx}`} position={v} icon={vertexIcon} draggable
                      eventHandlers={{ dragend(e) { const ll = (e.target as L.Marker).getLatLng(); handleDragGreenVertex(idx, ll.lat, ll.lng); } }}>
                      <Popup>
                        <div className="text-slate-900 text-xs space-y-1">
                          <div className="font-bold">Vértice #{idx + 1}</div>
                          <div className="font-mono text-[10px]">{v[0].toFixed(5)}, {v[1].toFixed(5)}</div>
                          <button onClick={() => handleDeleteGreenVertex(idx)} className="flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg cursor-pointer w-full justify-center">
                            <Trash2 size={11} /> Eliminar
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Read-only district pins */}
                  {!editGreen && distritosList.map((d) => (
                    <Marker key={`dp_${d.id}`} position={[d.lat, d.lng]} icon={d.coberturaActiva ? greenPinIcon : redPinIcon}>
                      <Popup><div className="text-slate-900 font-bold text-xs">{d.nombre}<br />{d.coberturaActiva ? '🟢 Activo' : '🔴 Sin Cobertura'}<br />S/ {d.tarifaDespacho.toFixed(2)}</div></Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          )}

          {/* ======= TAB: ZONAS RESTRINGIDAS (RED) ======= */}
          {activeTab === 'restringidas' && (
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
                <button onClick={handleAddZona} className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-red-700/30">
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

              {/* Zone cards */}
              {zonas.map((zona) => {
                const isEditing = editingZonaId === zona.id;
                const isExpanded = expandedZonaId === zona.id;
                const zDisplay: [number, number][] = zona.vertices.length >= 3 ? [...zona.vertices, zona.vertices[0]] : [];

                return (
                  <div key={zona.id} className={`bg-slate-900/40 border rounded-3xl shadow-xl transition-all ${isEditing ? 'border-red-500/50 shadow-red-500/10' : 'border-slate-800'}`}>
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
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${zona.vertices.length >= 3 ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                          {zona.vertices.length} vértices
                        </span>

                        {isEditing ? (
                          <button onClick={() => setEditingZonaId(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs cursor-pointer">
                            <Save size={12} /> Listo
                          </button>
                        ) : (
                          <button onClick={() => { setEditingZonaId(zona.id); setExpandedZonaId(zona.id); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-700/40 hover:bg-red-700/60 text-red-300 rounded-xl font-bold text-xs cursor-pointer border border-red-500/30">
                            <Pencil size={12} /> Editar
                          </button>
                        )}

                        <button onClick={() => setExpandedZonaId(isExpanded ? null : zona.id)} className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        <button onClick={() => handleDeleteZona(zona.id)} className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Expanded: Map + vertex list */}
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

                        {/* Map */}
                        <div className={`rounded-2xl overflow-hidden border ${isEditing ? 'border-red-500/50 h-[460px]' : 'border-slate-800 h-[300px]'}`}>
                          <MapContainer center={[-12.085, -77.035]} zoom={12} style={{ width: '100%', height: '100%' }} doubleClickZoom={!isEditing}>
                            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapClickAdder active={isEditing} onAdd={handleAddRedVertex} />

                            {/* Green main coverage as context */}
                            {greenDisplay.length >= 3 && (
                              <Polygon positions={greenDisplay} pathOptions={{ fillColor: '#10b981', color: '#34d399', fillOpacity: 0.22, weight: 2 }} />
                            )}

                            {/* All other red zones as context */}
                            {zonas.filter((z) => z.id !== zona.id).map((z) => z.vertices.length >= 3 && (
                              <Polygon key={`ctx_${z.id}`} positions={[...z.vertices, z.vertices[0]]} pathOptions={{ fillColor: '#ef4444', color: '#f87171', fillOpacity: 0.28, weight: 1.5 }} />
                            ))}

                            {/* This zone polygon */}
                            {zDisplay.length >= 3 && (
                              <Polygon positions={zDisplay} pathOptions={{ fillColor: '#ef4444', color: isEditing ? '#fca5a5' : '#f87171', fillOpacity: 0.42, weight: isEditing ? 3 : 2, dashArray: isEditing ? '6,4' : undefined }} />
                            )}

                            {/* Draggable red vertices */}
                            {isEditing && zona.vertices.map((v, idx) => (
                              <Marker key={`rv_${idx}`} position={v} icon={redVertexIcon} draggable
                                eventHandlers={{ dragend(e) { const ll = (e.target as L.Marker).getLatLng(); handleDragRedVertex(zona.id, idx, ll.lat, ll.lng); } }}>
                                <Popup>
                                  <div className="text-slate-900 text-xs space-y-1">
                                    <div className="font-bold">Vértice #{idx + 1}</div>
                                    <div className="font-mono text-[10px]">{v[0].toFixed(5)}, {v[1].toFixed(5)}</div>
                                    <button onClick={() => handleDeleteRedVertex(zona.id, idx)} className="flex items-center gap-1 mt-1.5 px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg cursor-pointer w-full justify-center">
                                      <Trash2 size={11} /> Eliminar
                                    </button>
                                  </div>
                                </Popup>
                              </Marker>
                            ))}
                          </MapContainer>
                        </div>

                        {/* Vertex list */}
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
                                    <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-bold text-[10px] flex items-center justify-center">{i + 1}</div>
                                    <span className="font-mono text-slate-400">
                                      <span className="text-white">{v[0].toFixed(5)}</span>, <span className="text-white">{v[1].toFixed(5)}</span>
                                    </span>
                                  </div>
                                  {isEditing && (
                                    <button onClick={() => handleDeleteRedVertex(zona.id, i)} className="p-1 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer">
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
          )}

          {/* ======= TAB: DISTRITOS Y TARIFAS ======= */}
          {activeTab === 'distritos' && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar distrito o zona..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500" />
                </div>
                <span className="text-xs text-slate-400">Mostrando <strong className="text-white font-mono">{distritosFiltrados.length}</strong> distritos</span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-900">
                <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[11px] bg-slate-950/80">
                      <th className="p-3.5">Distrito</th>
                      <th className="p-3.5">Zona / Sector</th>
                      <th className="p-3.5 text-center">Tarifa (S/)</th>
                      <th className="p-3.5 text-center">Estado</th>
                      <th className="p-3.5 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-900">
                    {distritosFiltrados.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-950/50 transition-colors">
                        <td className="p-3.5 font-bold text-white">{d.nombre}</td>
                        <td className="p-3.5 text-slate-400 font-mono">{d.zonaNombre}</td>
                        <td className="p-3.5 text-center">
                          <input type="number" value={d.tarifaDespacho} onChange={(e) => handleUpdateTarifa(d.id, parseFloat(e.target.value) || 0)}
                            className="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center font-mono font-bold text-emerald-400 text-xs focus:outline-none focus:border-purple-500" />
                        </td>
                        <td className="p-3.5 text-center">
                          {d.coberturaActiva
                            ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold"><CheckCircle2 size={13} />En Cobertura</span>
                            : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold"><AlertCircle size={13} />Sin Cobertura</span>}
                        </td>
                        <td className="p-3.5 text-center">
                          <button onClick={() => handleToggleCobertura(d.id)} className={`p-2 rounded-xl transition-all cursor-pointer font-bold text-xs inline-flex items-center gap-2 ${d.coberturaActiva ? 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}>
                            {d.coberturaActiva ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            {d.coberturaActiva ? 'Desactivar' : 'Activar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};
