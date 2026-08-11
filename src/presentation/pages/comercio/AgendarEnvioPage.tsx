import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { useDistritos } from '../../../application/useCases/useDistritos';
import { useRegistrarPedido } from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  obtenerDistritosCobertura,
  detectarDistritoCercano,
  obtenerPoligonoCobertura,
  obtenerZonasRestringidas,
} from '../../../infrastructure/utils/coberturaData';
import type { IZonaCoberturaInfo } from '../../../infrastructure/utils/coberturaData';
import { isAfterCutoffTimePeru, getPeruTimeString } from '../../../infrastructure/utils/peruTime';
import {
  Package, User, Phone, MapPin, Navigation, FileText,
  CheckCircle2, Copy, Share2, Loader2, AlertTriangle,
  Clock, ArrowLeft, Plus, ChevronRight, Check, AlertCircle,
} from 'lucide-react';

// ---- Leaflet icon fixes ----
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const selectedPinIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Map click listener sub-component
const MapClickListener: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
};

// Map recenter controller on district change
const MapController: React.FC<{ center: { lat: number; lng: number } }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], 14, { duration: 1 });
  }, [center, map]);
  return null;
};

// ============================================================
//  MAIN COMPONENT
// ============================================================
export const AgendarEnvioPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  // Wizard step: 1 = "Datos de Envío", 2 = "Ubicación GPS"
  const [step, setStep] = useState<1 | 2>(1);

  // ---- Step 1: form fields ----
  const [nombreRemitente, setNombreRemitente] = useState(user?.nombreComercial || user?.nombreCompleto || '');
  const [nombreDestinatario, setNombreDestinatario] = useState('');
  const [telefonoDestinatario, setTelefonoDestinatario] = useState('');
  const [direccionDestinatario, setDireccionDestinatario] = useState('');
  const [idDistritoDestinatario, setIdDistritoDestinatario] = useState<number | ''>('');
  const [referenciaDestinatario, setReferenciaDestinatario] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [esContraEntrega, setEsContraEntrega] = useState(false);
  const [montoCobrar, setMontoCobrar] = useState<number | ''>('');

  // ---- Step 2: map / GPS fields ----
  const [selectedCoords, setSelectedCoords] = useState({ lat: -12.1221, lng: -77.0312 });
  const [distritoInfo, setDistritoInfo] = useState<IZonaCoberturaInfo>(() =>
    detectarDistritoCercano(-12.1221, -77.0312)
  );
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');

  // ---- Submit state ----
  const [createdTrackingCode, setCreatedTrackingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [step1Error, setStep1Error] = useState('');

  const { data: distritos, isLoading: loadingDistritos } = useDistritos();
  const registrarMutation = useRegistrarPedido();

  const distritosList = obtenerDistritosCobertura();

  useEffect(() => {
    if (user?.nombreComercial || user?.nombreCompleto) {
      setNombreRemitente(user.nombreComercial || user.nombreCompleto);
    }
  }, [user]);

  useEffect(() => {
    const info = detectarDistritoCercano(selectedCoords.lat, selectedCoords.lng);
    setDistritoInfo(info);
    // Auto-update googleMapsUrl when coords change
    setGoogleMapsUrl(`https://www.google.com/maps?q=${selectedCoords.lat.toFixed(6)},${selectedCoords.lng.toFixed(6)}`);
  }, [selectedCoords]);

  if (!user) return null;

  // ---- Step 1 validation & next ----
  const handleNext = () => {
    setStep1Error('');
    if (!nombreDestinatario.trim() || !telefonoDestinatario.trim() || !direccionDestinatario.trim() || !idDistritoDestinatario) {
      setStep1Error('Por favor completa todos los campos obligatorios (*)');
      return;
    }
    // Center map on the selected district if available
    if (idDistritoDestinatario) {
      const match = distritosList.find((d) => {
        const distritosApiMatch = distritos?.find((ap) => ap.id === idDistritoDestinatario);
        return distritosApiMatch && d.nombre.toLowerCase() === distritosApiMatch.nombre.toLowerCase();
      });
      if (match) setSelectedCoords({ lat: match.lat, lng: match.lng });
    }
    setStep(2);
  };

  // ---- Map handlers ----
  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
  };

  const handleSelectDistrictPreset = (d: IZonaCoberturaInfo) => {
    setSelectedCoords({ lat: d.lat, lng: d.lng });
    // Sync district dropdown if match found in API list
    const apiMatch = distritos?.find((ap) => ap.nombre.toLowerCase() === d.nombre.toLowerCase());
    if (apiMatch) setIdDistritoDestinatario(apiMatch.id);
  };

  // ---- Final submit ----
  const handleSubmit = async () => {
    setErrorMsg('');
    try {
      const res = await registrarMutation.mutateAsync({
        nombreRemitente: nombreRemitente.trim() || user.nombreComercial || 'Mi Comercio',
        nombreDestinatario: nombreDestinatario.trim(),
        telefonoDestinatario: telefonoDestinatario.trim(),
        direccionDestinatario: direccionDestinatario.trim(),
        idDistritoDestinatario: Number(idDistritoDestinatario),
        referenciaDestinatario: referenciaDestinatario.trim(),
        observaciones: observaciones.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        montoCobrar: esContraEntrega ? Number(montoCobrar) || 0 : 0,
      });
      setCreatedTrackingCode(res.codigoSeguimiento);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || 'Error al agendar el pedido.');
    }
  };

  const handleCopyCode = () => {
    if (createdTrackingCode) {
      navigator.clipboard.writeText(createdTrackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    if (createdTrackingCode) {
      const text = `¡Hola ${nombreDestinatario}! Tu pedido ha sido agendado con ALMAIN CURRIER. Código de seguimiento: ${createdTrackingCode}`;
      window.open(`https://wa.me/51${telefonoDestinatario.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleNuevoEnvio = () => {
    setCreatedTrackingCode(null);
    setStep(1);
    setNombreDestinatario('');
    setTelefonoDestinatario('');
    setDireccionDestinatario('');
    setIdDistritoDestinatario('');
    setReferenciaDestinatario('');
    setObservaciones('');
    setGoogleMapsUrl('');
    setEsContraEntrega(false);
    setMontoCobrar('');
    setErrorMsg('');
    setStep1Error('');
    setSelectedCoords({ lat: -12.1221, lng: -77.0312 });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex pb-20 md:pb-0">
      <LeftSidebar
        contraido={contraido}
        setContraido={setContraido}
        movilAbierto={movilAbierto}
        setMovilAbierto={setMovilAbierto}
      />

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${contraido ? 'md:ml-20' : 'md:ml-64'}`}>

        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-3 pl-14 md:pl-8">
            <button
              onClick={() => step === 2 && !createdTrackingCode ? setStep(1) : navigate('/comercio/dashboard')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <Package size={18} />
            </div>
            <div className="flex-1">
              <h1 className="text-base font-bold text-white leading-tight">Agendar Nuevo Envío</h1>
              <p className="text-[11px] text-slate-400">
                {createdTrackingCode ? '¡Envío registrado exitosamente!' : step === 1 ? 'Paso 1 de 2 — Datos del destinatario' : 'Paso 2 de 2 — Ubicación de entrega en el mapa'}
              </p>
            </div>

            {/* Step indicator */}
            {!createdTrackingCode && (
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${step === 1 ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                  {step > 1 ? <CheckCircle2 size={13} /> : <span>1</span>}
                  <span>Datos</span>
                </div>
                <ChevronRight size={14} className="text-slate-600" />
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${step === 2 ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40' : 'bg-slate-800/60 text-slate-500 border border-slate-700'}`}>
                  <span>2</span>
                  <span>Ubicación GPS</span>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6">

          {/* ===== SUCCESS STATE ===== */}
          {createdTrackingCode ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 size={42} />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">¡Envío Agendado con Éxito!</h2>
                <p className="text-sm text-slate-400 mt-2">Se generó automáticamente el código de seguimiento para tu cliente.</p>
              </div>

              <div className="bg-slate-950 border border-violet-500/30 rounded-2xl p-6 max-w-sm mx-auto">
                <span className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Código de Seguimiento</span>
                <div className="text-3xl sm:text-4xl font-mono font-extrabold text-violet-400 tracking-wider">{createdTrackingCode}</div>
              </div>

              {isAfterCutoffTimePeru() && (
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 text-left space-y-2 max-w-md mx-auto">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Clock size={15} className="shrink-0" />
                    <span>Tu pedido fue agendado después de las 09:30 AM Hora Perú</span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1 pl-2.5 border-l-2 border-amber-500/40">
                    <p>• <strong>Si el motorizado aún no recoge hoy:</strong> El admin podrá incluirlo en la ruta del día.</p>
                    <p>• <strong>Si el motorizado ya recogió hoy:</strong> Se recogerá y entregará mañana.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                <button onClick={handleCopyCode} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl py-3 px-4 text-sm transition-colors cursor-pointer">
                  <Copy size={16} />{copied ? '¡Copiado!' : 'Copiar Código'}
                </button>
                <button onClick={handleShareWhatsApp} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-3 px-4 text-sm transition-colors cursor-pointer">
                  <Share2 size={16} />Enviar por WhatsApp
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button onClick={handleNuevoEnvio} className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-2.5 px-5 text-sm cursor-pointer shadow-lg shadow-violet-500/20">
                  <Plus size={16} />Agendar Otro Envío
                </button>
                <button onClick={() => navigate('/comercio/dashboard')} className="text-sm text-slate-400 hover:text-white underline cursor-pointer">
                  Ver historial de envíos →
                </button>
              </div>
            </div>

          ) : (

            /* ===== WIZARD CONTAINER ===== */
            <div className="space-y-5">

              {/* After-cutoff banner */}
              {isAfterCutoffTimePeru() && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-amber-200">
                    <AlertTriangle size={15} className="shrink-0" />
                    <span>Aviso de Horario — Hora Perú: {getPeruTimeString()}</span>
                  </div>
                  <p className="text-amber-200/80 pl-5 text-[11px]">Envíos agendados después de las <strong>09:30 AM</strong> se programan para el siguiente día hábil.</p>
                </div>
              )}

              {/* ===== STEP TABS ===== */}
              <div className="flex gap-0 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/30">
                <button
                  onClick={() => setStep(1)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all cursor-pointer ${step === 1 ? 'bg-violet-600/30 text-violet-300 border-b-2 border-violet-500' : 'text-slate-400 hover:text-white border-b-2 border-transparent'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${step === 1 ? 'bg-violet-600 text-white' : step > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    {step > 1 ? <CheckCircle2 size={14} /> : '1'}
                  </div>
                  Datos de Envío
                </button>
                <div className="w-px bg-slate-800" />
                <button
                  onClick={() => { if (step === 1) handleNext(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all cursor-pointer ${step === 2 ? 'bg-violet-600/30 text-violet-300 border-b-2 border-violet-500' : 'text-slate-400 hover:text-white border-b-2 border-transparent'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${step === 2 ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                    2
                  </div>
                  <MapPin size={15} />
                  Ubicación GPS
                </button>
              </div>

              {/* ===========================
                  STEP 1: DATOS DE ENVÍO
                  =========================== */}
              {step === 1 && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">

                  {step1Error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle size={15} className="shrink-0" />
                      {step1Error}
                    </div>
                  )}

                  {/* 1. Remitente */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">1. De Quién Envía (Tienda / Persona)</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input type="text" value={nombreRemitente} onChange={(e) => setNombreRemitente(e.target.value)} placeholder="Ej: Tienda Don Pepe"
                        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:border-violet-500 transition-colors" />
                    </div>
                  </div>

                  {/* 2 & 3. Distrito y Dirección */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">2. Distrito de Entrega *</label>
                      <select value={idDistritoDestinatario} onChange={(e) => setIdDistritoDestinatario(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 outline-none focus:border-violet-500 transition-colors">
                        <option value="">Seleccionar Distrito</option>
                        {loadingDistritos ? <option disabled>Cargando...</option> : distritos?.map((d) => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">3. Dirección Exacta *</label>
                      <div className="relative">
                        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="text" value={direccionDestinatario} onChange={(e) => setDireccionDestinatario(e.target.value)} placeholder="Av. Brasil 1234 Int 402"
                          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:border-violet-500 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* 4. Referencia */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">4. Referencia de Entrega</label>
                    <input type="text" value={referenciaDestinatario} onChange={(e) => setReferenciaDestinatario(e.target.value)} placeholder="Ej: Frente al parque central, puerta negra"
                      className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 outline-none focus:border-violet-500 transition-colors" />
                  </div>

                  {/* 5 & 6. Cliente y Celular */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">5. Nombre del Cliente *</label>
                      <input type="text" value={nombreDestinatario} onChange={(e) => setNombreDestinatario(e.target.value)} placeholder="María García"
                        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 outline-none focus:border-violet-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">6. Celular del Cliente *</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input type="tel" value={telefonoDestinatario} onChange={(e) => setTelefonoDestinatario(e.target.value)} placeholder="987654321"
                          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:border-violet-500 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {/* 7. Contra Entrega */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white block">7. ¿Cobrar al Entregar el Pedido?</span>
                        <span className="text-[11px] text-slate-400">Activa si el repartidor debe cobrar en efectivo/Yape</span>
                      </div>
                      <button type="button" onClick={() => setEsContraEntrega(!esContraEntrega)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${esContraEntrega ? 'bg-violet-600 justify-end' : 'bg-slate-700 justify-start'}`}>
                        <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                    {esContraEntrega && (
                      <div className="pt-2 border-t border-slate-800">
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Monto a Cobrar (S/.) *</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-400 font-bold text-sm">S/</span>
                          <input type="number" step="0.10" min="0" value={montoCobrar} onChange={(e) => setMontoCobrar(e.target.value ? Number(e.target.value) : '')} placeholder="45.00"
                            className="w-full bg-slate-900 border border-emerald-500/30 text-white text-sm rounded-xl pl-10 pr-3 py-3 outline-none focus:border-emerald-500 transition-colors" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 8. Observaciones */}
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">8. Notas u Observación</label>
                    <div className="relative">
                      <FileText size={15} className="absolute top-3 left-3 text-slate-500" />
                      <textarea rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Ej: Timbrar 2 veces, frágil"
                        className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-violet-500 transition-colors resize-none" />
                    </div>
                  </div>

                  {/* NEXT button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl py-4 shadow-lg shadow-violet-500/25 cursor-pointer transition-all duration-200"
                    >
                      Siguiente — Marcar Ubicación en Mapa
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* ===========================
                  STEP 2: UBICACIÓN GPS / MAPA
                  =========================== */}
              {step === 2 && (
                <div className="space-y-4">

                  {errorMsg && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle size={15} className="shrink-0" />
                      {errorMsg}
                    </div>
                  )}

                  {/* Map section header */}
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">

                    {/* Header with District Select Combo */}
                    <div className="px-5 py-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <h2 className="text-sm font-bold text-white leading-tight">9. Ubicación de Entrega en Mapa</h2>
                          <p className="text-[11px] text-slate-400">Haz clic en el mapa sobre la ubicación exacta o selecciona el distrito para enfocar.</p>
                        </div>
                      </div>

                      {/* District Select Combo */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-400 font-medium shrink-0">Distrito:</label>
                        <select
                          value={distritoInfo.nombre}
                          onChange={(e) => {
                            const target = distritosList.find((d) => d.nombre === e.target.value);
                            if (target) {
                              handleSelectDistrictPreset(target);
                            }
                          }}
                          className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-purple-500 transition-colors cursor-pointer"
                        >
                          {distritosList.map((d) => (
                            <option key={d.id} value={d.nombre}>
                              {d.nombre} ({d.zonaNombre}) {d.coberturaActiva ? '🟢' : '🔴'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Map Full Width */}
                    <div className="relative min-h-[480px]">
                      <MapContainer center={[selectedCoords.lat, selectedCoords.lng]} zoom={14} style={{ width: '100%', height: '100%', minHeight: '480px' }} className="z-10">
                        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapClickListener onMapClick={handleMapClick} />
                        <MapController center={selectedCoords} />

                        {/* Green coverage polygon */}
                        <Polygon positions={obtenerPoligonoCobertura()} pathOptions={{ fillColor: '#10b981', color: '#34d399', fillOpacity: 0.33, weight: 2.5 }}
                          eventHandlers={{ click: (e) => handleMapClick(e.latlng.lat, e.latlng.lng) }} />

                        {/* Red restricted zones */}
                        {obtenerZonasRestringidas().map((zona) =>
                          zona.vertices.length >= 3 ? (
                            <Polygon key={`rz_${zona.id}`} positions={[...zona.vertices, zona.vertices[0]]}
                              pathOptions={{ fillColor: '#ef4444', color: '#f87171', fillOpacity: 0.45, weight: 2.5, dashArray: '5,4' }}
                              eventHandlers={{ click: (e) => handleMapClick(e.latlng.lat, e.latlng.lng) }}>
                              <Popup><div className="text-slate-900 font-bold text-xs">🔴 {zona.nombre}<br /><span className="text-red-600 font-normal">{zona.descripcion}</span></div></Popup>
                            </Polygon>
                          ) : null
                        )}

                        {/* Selected location marker */}
                        <Marker position={[selectedCoords.lat, selectedCoords.lng]} icon={selectedPinIcon}>
                          <Popup>
                            <div className="text-slate-900 font-bold text-xs">
                              📍 Ubicación de Entrega<br />
                              Distrito: {distritoInfo.nombre}<br />
                              {distritoInfo.coberturaActiva ? '🟢 En Cobertura' : '🔴 Sin Cobertura'}
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>

                      {/* Floating bottom info badge */}
                      <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border font-bold ${distritoInfo.coberturaActiva ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'}`}>
                            {distritoInfo.coberturaActiva ? <Navigation size={16} /> : <AlertTriangle size={16} />}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                              <span>Distrito:</span>
                              <span className="text-purple-300 font-mono">{distritoInfo.nombre}</span>
                              {distritoInfo.coberturaActiva
                                ? <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">🟢 En Cobertura</span>
                                : <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">⚠️ Sin Cobertura</span>}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">GPS: {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* GPS URL preview + submit */}
                    <div className="p-5 border-t border-slate-800 space-y-4 bg-slate-950/40">
                      <div>
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                          9. Link GPS generado automáticamente
                        </label>
                        <div className="relative">
                          <Navigation size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input type="url" value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)}
                            placeholder="Haz clic en el mapa para generar el link..."
                            className="w-full bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-violet-500 transition-colors" />
                        </div>
                        {googleMapsUrl && (
                          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-violet-400 hover:text-violet-300 mt-1 inline-flex items-center gap-1">
                            <MapPin size={11} /> Abrir en Google Maps
                          </a>
                        )}
                      </div>

                      {/* SUBMIT button */}
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={registrarMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl py-4 shadow-lg shadow-violet-500/25 cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {registrarMutation.isPending ? (
                          <><Loader2 className="animate-spin" size={18} /> Agendando...</>
                        ) : (
                          <><Check size={18} /> Agendar Envío y Generar Código</>
                        )}
                      </button>

                      <button onClick={() => setStep(1)} className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer py-1">
                        ← Volver a editar datos del envío
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default AgendarEnvioPage;
