import React, { useState, useEffect } from 'react';
import { useDistritos } from '../../application/useCases/useDistritos';
import { useRegistrarPedido } from '../../application/useCases/useMisPedidos';
import { isAfterCutoffTimePeru, getPeruTimeString } from '../../infrastructure/utils/peruTime';
import { MapaLocationPickerModal } from './MapaLocationPickerModal';
import { X, Package, User, Phone, MapPin, Navigation, FileText, CheckCircle2, Copy, Share2, Loader2, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultSenderName?: string;
}

export const CrearPedidoModal: React.FC<Props> = ({ isOpen, onClose, defaultSenderName }) => {
  const [nombreRemitente, setNombreRemitente] = useState(defaultSenderName || '');

  useEffect(() => {
    if (defaultSenderName) {
      setNombreRemitente(defaultSenderName);
    }
  }, [defaultSenderName, isOpen]);
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nombreDestinatario.trim() || !telefonoDestinatario.trim() || !direccionDestinatario.trim() || !idDistritoDestinatario) {
      setErrorMsg('Por favor complete todos los campos obligatorios (*)');
      return;
    }

    try {
      const res = await registrarMutation.mutateAsync({
        nombreRemitente: nombreRemitente.trim() || defaultSenderName || 'Mi Comercio',
        nombreDestinatario: nombreDestinatario.trim(),
        telefonoDestinatario: telefonoDestinatario.trim(),
        direccionDestinatario: direccionDestinatario.trim(),
        idDistritoDestinatario: Number(idDistritoDestinatario),
        referenciaDestinatario: referenciaDestinatario.trim(),
        observaciones: observaciones.trim(),
        googleMapsUrl: googleMapsUrl.trim(),
        montoCobrar: esContraEntrega ? Number(montoCobrar) || 0 : 0,
        tarifaEnvio: 0,
        destinatarioPagaEnvio: false,
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

  const handleResetAndClose = () => {
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl my-8">

        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50 hover:bg-slate-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Successful Created Screen */}
        {createdTrackingCode ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">¡Envío Agendado con Éxito!</h2>
              <p className="text-sm text-slate-400 mt-1">
                Se ha generado automáticamente el código de seguimiento único para tu cliente.
              </p>
            </div>

            {/* Tracking Code Box */}
            <div className="bg-slate-950 border border-violet-500/30 rounded-2xl p-5 max-w-md mx-auto">
              <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">Código de Seguimiento</span>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-violet-400 tracking-wider">
                {createdTrackingCode}
              </div>
            </div>

            {/* Banner de Horario Límite (> 9:30 AM Hora Perú) en Confirmación Exitosa */}
            {isAfterCutoffTimePeru() && (
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4 text-left space-y-2 max-w-md mx-auto shadow-lg">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Clock size={16} className="shrink-0" />
                  <span>Programación de Entrega (Tu pedido fue agendado mas de las 09:30 AM Hora Perú)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Tu pedido fue agendado después del horario límite de las <strong>09:30 AM</strong>.
                </p>
                <div className="text-[11px] text-slate-400 space-y-1.5 pl-2.5 border-l-2 border-amber-500/40">
                  <p>• <strong>Si el motorizado aún no recoge en tu comercio hoy:</strong> El administrador podrá incluirlo en el recojo de la ruta de hoy.</p>
                  <p>• <strong>Si el motorizado ya recogió hoy en tu comercio:</strong> Tu pedido será <strong>recogido el día de mañana y entregado ese mismo día</strong>.</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
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

            <button
              onClick={handleResetAndClose}
              className="mt-4 text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Cerrar y volver al panel
            </button>
          </div>
        ) : (
          /* Form Content */
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center">
                <Package size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Agendar Nuevo Envío</h2>
                <p className="text-xs text-slate-400">Ingresa los 9 datos operativos para programar el despacho.</p>
              </div>
            </div>

            {/* Banner de Advertencia de Horario Límite (> 09:30 AM Hora Perú) en el Formulario */}
            {isAfterCutoffTimePeru() && (
              <div className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-2 shadow-inner">
                <div className="flex items-center gap-2 font-bold text-amber-200 text-xs">
                  <AlertTriangle size={17} className="text-amber-400 shrink-0" />
                  <span>Aviso de Horario de Despacho (Hora Perú: {getPeruTimeString()})</span>
                </div>
                <p className="text-amber-200/90 leading-relaxed pl-6 text-[12px]">
                  Estás agendando un envío después de las <strong>09:30 AM</strong>.
                </p>
                <ul className="list-disc list-inside text-[11px] text-amber-300/80 pl-6 space-y-1">
                  <li><strong>Si el motorizado aún no recoge hoy en tu comercio:</strong> El administrador podrá asignar este pedido para que sea recogido hoy.</li>
                  <li><strong>Si el motorizado ya recogió hoy en tu comercio:</strong> Tu pedido será recogido el día de mañana y entregado ese mismo día.</li>
                </ul>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* 1. Remitente / Tienda */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  1. De quien envía (Tienda / Persona)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    value={nombreRemitente}
                    onChange={(e) => setNombreRemitente(e.target.value)}
                    placeholder="Ej: Tienda Don Pepe"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              {/* 2 & 3. Distrito y Dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 2. Distrito */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                    2. Distrito de Entrega *
                  </label>
                  <select
                    value={idDistritoDestinatario}
                    onChange={(e) => setIdDistritoDestinatario(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-violet-500 transition-colors"
                    required
                  >
                    <option value="">Seleccionar Distrito</option>
                    {loadingDistritos ? (
                      <option disabled>Cargando distritos...</option>
                    ) : (
                      distritos?.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* 3. Dirección Exacta */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                    3. Dirección Exacta *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <MapPin size={16} />
                    </span>
                    <input
                      type="text"
                      value={direccionDestinatario}
                      onChange={(e) => setDireccionDestinatario(e.target.value)}
                      placeholder="Av. Brasil 1234 Int 402"
                      className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-violet-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 4. Referencia */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  4. Referencia de Entrega
                </label>
                <input
                  type="text"
                  value={referenciaDestinatario}
                  onChange={(e) => setReferenciaDestinatario(e.target.value)}
                  placeholder="Ej: Frente al parque central, puerta negra"
                  className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              {/* 5 & 6. Cliente y Celular */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 5. Nombre Cliente */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                    5. Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={nombreDestinatario}
                    onChange={(e) => setNombreDestinatario(e.target.value)}
                    placeholder="María García"
                    className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-2.5 outline-none focus:border-violet-500 transition-colors"
                    required
                  />
                </div>

                {/* 6. Celular Cliente */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                    6. Celular del Cliente *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Phone size={16} />
                    </span>
                    <input
                      type="tel"
                      value={telefonoDestinatario}
                      onChange={(e) => setTelefonoDestinatario(e.target.value)}
                      placeholder="987654321"
                      className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-violet-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* 7. Cobro Contra Entrega (Toggle + Monto) */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">7. ¿Cobrar al Entregar el Pedido?</span>
                    <span className="text-[11px] text-slate-400">Activa si el repartidor debe cobrar en efectivo/Yape</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEsContraEntrega(!esContraEntrega)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${esContraEntrega ? 'bg-violet-600 justify-end' : 'bg-slate-800 justify-start'
                      }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                {esContraEntrega && (
                  <div className="pt-2 border-t border-slate-800">
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Monto a Cobrar (S/.) *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-400 font-bold">S/</span>
                      <input
                        type="number"
                        step="0.10"
                        min="0"
                        value={montoCobrar}
                        onChange={(e) => setMontoCobrar(e.target.value ? Number(e.target.value) : '')}
                        placeholder="45.00"
                        className="w-full bg-slate-900 border border-emerald-500/30 text-white text-sm rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-emerald-500 transition-colors"
                        required={esContraEntrega}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 8 & 9. Notas y GPS Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 8. Observaciones */}
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                    8. Notas u Observación
                  </label>
                  <div className="relative">
                    <span className="absolute top-3 left-3 text-slate-500">
                      <FileText size={16} />
                    </span>
                    <textarea
                      rows={2}
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Ej: Timbrar 2 veces, frágil"
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>

                {/* 9. GPS Link */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      9. Link / GPS Mapa de Entrega
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="text-[11px] font-bold text-purple-300 hover:text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <MapPin size={12} className="text-purple-400" />
                      <span>🗺️ Marcar Ubicación en Mapa</span>
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <Navigation size={16} />
                    </span>
                    <input
                      type="url"
                      value={googleMapsUrl}
                      onChange={(e) => setGoogleMapsUrl(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Map Picker Component */}
              <MapaLocationPickerModal
                isOpen={isMapPickerOpen}
                onClose={() => setIsMapPickerOpen(false)}
                onSelectLocation={(data) => {
                  setGoogleMapsUrl(data.googleMapsUrl);
                  if (distritos && data.distrito) {
                    const match = distritos.find(
                      (d) => d.nombre.toLowerCase() === data.distrito.nombre.toLowerCase()
                    );
                    if (match) {
                      setIdDistritoDestinatario(match.id);
                    }
                  }
                }}
              />

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={registrarMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl py-3.5 px-4 shadow-lg cursor-pointer transition-all duration-200"
                >
                  {registrarMutation.isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    'Agendar Envío y Generar Código'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
