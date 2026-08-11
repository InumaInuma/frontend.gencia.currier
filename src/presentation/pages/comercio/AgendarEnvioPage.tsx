import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { useDistritos } from '../../../application/useCases/useDistritos';
import { useRegistrarPedido } from '../../../application/useCases/useMisPedidos';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { MapaLocationPickerModal } from '../../components/MapaLocationPickerModal';
import { isAfterCutoffTimePeru, getPeruTimeString } from '../../../infrastructure/utils/peruTime';
import {
  Package, User, Phone, MapPin, Navigation, FileText,
  CheckCircle2, Copy, Share2, Loader2, AlertTriangle,
  Clock, ArrowLeft, Plus,
} from 'lucide-react';

export const AgendarEnvioPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  // Form state
  const [nombreRemitente, setNombreRemitente] = useState(user?.nombreComercial || user?.nombreCompleto || '');
  const [nombreDestinatario, setNombreDestinatario] = useState('');
  const [telefonoDestinatario, setTelefonoDestinatario] = useState('');
  const [direccionDestinatario, setDireccionDestinatario] = useState('');
  const [idDistritoDestinatario, setIdDistritoDestinatario] = useState<number | ''>('');
  const [referenciaDestinatario, setReferenciaDestinatario] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [esContraEntrega, setEsContraEntrega] = useState(false);
  const [montoCobrar, setMontoCobrar] = useState<number | ''>('');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  const [createdTrackingCode, setCreatedTrackingCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: distritos, isLoading: loadingDistritos } = useDistritos();
  const registrarMutation = useRegistrarPedido();

  // Sync sender name when user loads
  useEffect(() => {
    if (user?.nombreComercial || user?.nombreCompleto) {
      setNombreRemitente(user.nombreComercial || user.nombreCompleto);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombreDestinatario.trim() || !telefonoDestinatario.trim() || !direccionDestinatario.trim() || !idDistritoDestinatario) {
      setErrorMsg('Por favor completa todos los campos obligatorios (*)');
      return;
    }

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
          <div className="max-w-4xl mx-auto px-4 sm:px-8 h-16 flex items-center gap-3 pl-14 md:pl-8">
            <button
              onClick={() => navigate('/comercio/dashboard')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <Package size={18} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-tight">Agendar Nuevo Envío</h1>
              <p className="text-[11px] text-slate-400">Ingresa los datos del destinatario para programar el despacho.</p>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-8">

          {/* ===== SUCCESS STATE ===== */}
          {createdTrackingCode ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 size={42} />
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">¡Envío Agendado con Éxito!</h2>
                <p className="text-sm text-slate-400 mt-2">
                  Se generó automáticamente el código de seguimiento para tu cliente.
                </p>
              </div>

              {/* Tracking Code */}
              <div className="bg-slate-950 border border-violet-500/30 rounded-2xl p-6 max-w-sm mx-auto">
                <span className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Código de Seguimiento</span>
                <div className="text-3xl sm:text-4xl font-mono font-extrabold text-violet-400 tracking-wider">
                  {createdTrackingCode}
                </div>
              </div>

              {/* After cutoff warning */}
              {isAfterCutoffTimePeru() && (
                <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 text-left space-y-2 max-w-md mx-auto shadow-lg">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Clock size={16} className="shrink-0" />
                    <span>Tu pedido fue agendado después de las 09:30 AM Hora Perú</span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1.5 pl-2.5 border-l-2 border-amber-500/40">
                    <p>• <strong>Si el motorizado aún no recoge hoy:</strong> El administrador podrá incluirlo en la ruta del día.</p>
                    <p>• <strong>Si el motorizado ya recogió hoy:</strong> Tu pedido será recogido mañana y entregado el mismo día.</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                <button
                  onClick={handleCopyCode}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl py-3 px-4 text-sm transition-colors cursor-pointer"
                >
                  <Copy size={16} />
                  {copied ? '¡Copiado!' : 'Copiar Código'}
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl py-3 px-4 text-sm transition-colors cursor-pointer"
                >
                  <Share2 size={16} />
                  Enviar por WhatsApp
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleNuevoEnvio}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl py-2.5 px-5 text-sm transition-all cursor-pointer shadow-lg shadow-violet-500/20"
                >
                  <Plus size={16} />
                  Agendar Otro Envío
                </button>
                <button
                  onClick={() => navigate('/comercio/dashboard')}
                  className="text-sm text-slate-400 hover:text-white underline cursor-pointer transition-colors"
                >
                  Ver historial de envíos →
                </button>
              </div>
            </div>
          ) : (

            /* ===== FORM STATE ===== */
            <div className="space-y-6">

              {/* After-cutoff warning banner */}
              {isAfterCutoffTimePeru() && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2 shadow-inner">
                  <div className="flex items-center gap-2 font-bold text-amber-200">
                    <AlertTriangle size={17} className="text-amber-400 shrink-0" />
                    <span>Aviso de Horario de Despacho — Hora Perú: {getPeruTimeString()}</span>
                  </div>
                  <p className="text-amber-200/90 leading-relaxed pl-6 text-[12px]">
                    Estás agendando un envío después de las <strong>09:30 AM</strong>.
                  </p>
                  <ul className="list-disc list-inside text-[11px] text-amber-300/80 pl-6 space-y-1">
                    <li><strong>Si el motorizado aún no recoge hoy:</strong> El admin podrá incluirlo en la ruta de hoy.</li>
                    <li><strong>Si el motorizado ya recogió hoy:</strong> Tu pedido se recogerá y entregará mañana.</li>
                  </ul>
                </div>
              )}

              {/* Error */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                  {errorMsg}
                </div>
              )}

              {/* Form Card */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* 1. Remitente */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                      1. De Quién Envía (Tienda / Persona)
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={nombreRemitente}
                        onChange={(e) => setNombreRemitente(e.target.value)}
                        placeholder="Ej: Tienda Don Pepe"
                        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>
                  </div>

                  {/* 2 & 3. Distrito y Dirección */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                        2. Distrito de Entrega *
                      </label>
                      <select
                        value={idDistritoDestinatario}
                        onChange={(e) => setIdDistritoDestinatario(e.target.value ? Number(e.target.value) : '')}
                        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 outline-none focus:border-violet-500 transition-colors"
                        required
                      >
                        <option value="">Seleccionar Distrito</option>
                        {loadingDistritos ? (
                          <option disabled>Cargando distritos...</option>
                        ) : (
                          distritos?.map((d) => (
                            <option key={d.id} value={d.id}>{d.nombre}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                        3. Dirección Exacta *
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          value={direccionDestinatario}
                          onChange={(e) => setDireccionDestinatario(e.target.value)}
                          placeholder="Av. Brasil 1234 Int 402"
                          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:border-violet-500 transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* 4. Referencia */}
                  <div>
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
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

                  {/* 5 & 6. Cliente y Celular */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                        5. Nombre del Cliente *
                      </label>
                      <input
                        type="text"
                        value={nombreDestinatario}
                        onChange={(e) => setNombreDestinatario(e.target.value)}
                        placeholder="María García"
                        className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 outline-none focus:border-violet-500 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                        6. Celular del Cliente *
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="tel"
                          value={telefonoDestinatario}
                          onChange={(e) => setTelefonoDestinatario(e.target.value)}
                          placeholder="987654321"
                          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:border-violet-500 transition-colors"
                          required
                        />
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
                      <button
                        type="button"
                        onClick={() => setEsContraEntrega(!esContraEntrega)}
                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${esContraEntrega ? 'bg-violet-600 justify-end' : 'bg-slate-700 justify-start'}`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                      </button>
                    </div>
                    {esContraEntrega && (
                      <div className="pt-2 border-t border-slate-800">
                        <label className="text-xs font-semibold text-slate-300 block mb-1.5">Monto a Cobrar (S/.) *</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-400 font-bold">S/</span>
                          <input
                            type="number"
                            step="0.10"
                            min="0"
                            value={montoCobrar}
                            onChange={(e) => setMontoCobrar(e.target.value ? Number(e.target.value) : '')}
                            placeholder="45.00"
                            className="w-full bg-slate-900 border border-emerald-500/30 text-white text-sm rounded-xl pl-10 pr-3 py-3 outline-none focus:border-emerald-500 transition-colors"
                            required={esContraEntrega}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 8 & 9. Notas y GPS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                        8. Notas u Observación
                      </label>
                      <div className="relative">
                        <FileText size={15} className="absolute top-3 left-3 text-slate-500" />
                        <textarea
                          rows={3}
                          value={observaciones}
                          onChange={(e) => setObservaciones(e.target.value)}
                          placeholder="Ej: Timbrar 2 veces, frágil"
                          className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-violet-500 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                          9. Link / GPS Mapa de Entrega
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsMapPickerOpen(true)}
                          className="text-[11px] font-bold text-purple-300 hover:text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                        >
                          <MapPin size={12} className="text-purple-400" />
                          🗺️ Marcar en Mapa
                        </button>
                      </div>
                      <div className="relative">
                        <Navigation size={15} className="absolute top-3 left-3 text-slate-500" />
                        <textarea
                          rows={3}
                          value={googleMapsUrl}
                          onChange={(e) => setGoogleMapsUrl(e.target.value)}
                          placeholder="https://maps.google.com/..."
                          className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-violet-500 transition-colors resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Map Picker Modal */}
                  <MapaLocationPickerModal
                    isOpen={isMapPickerOpen}
                    onClose={() => setIsMapPickerOpen(false)}
                    onSelectLocation={(data) => {
                      setGoogleMapsUrl(data.googleMapsUrl);
                      if (distritos && data.distrito) {
                        const match = distritos.find(
                          (d) => d.nombre.toLowerCase() === data.distrito.nombre.toLowerCase()
                        );
                        if (match) setIdDistritoDestinatario(match.id);
                      }
                    }}
                  />

                  {/* Submit */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={registrarMutation.isPending}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl py-4 px-4 shadow-lg shadow-violet-500/25 cursor-pointer transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {registrarMutation.isPending ? (
                        <><Loader2 className="animate-spin" size={18} /> Agendando...</>
                      ) : (
                        'Agendar Envío y Generar Código'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>

        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default AgendarEnvioPage;
