import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { useDistritos } from '../../../application/useCases/useDistritos';
import { useRegistrarPedido } from '../../../application/useCases/useMisPedidos';
import { useCoberturaAdmin } from '../../../application/useCases/useCoberturaAdmin';
import type { DistritoTarifaDto, ZonaRestringidaDto } from '../../../application/useCases/useCoberturaAdmin';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import {
  obtenerDistritosCobertura,
  detectarDistritoCercano,
  obtenerZonasRestringidas,
} from '../../../infrastructure/utils/coberturaData';
import type { IZonaCoberturaInfo } from '../../../infrastructure/utils/coberturaData';
import { isAfterCutoffTimePeru, getPeruTimeString } from '../../../infrastructure/utils/peruTime';
import {
  Package,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  MapPin,
  ChevronRight,
} from 'lucide-react';

import { isPointInPolygon } from '../../components/agendarEnvio/agendarEnvioUtils';
import { ModalExitoEnvio } from '../../components/agendarEnvio/ModalExitoEnvio';
import { Paso1DatosEnvio } from '../../components/agendarEnvio/Paso1DatosEnvio';
import { Paso2UbicacionGPS } from '../../components/agendarEnvio/Paso2UbicacionGPS';

export const AgendarEnvioPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);

  // Wizard step: 1 = "Datos de Envío", 2 = "Ubicación GPS"
  const [step, setStep] = useState<1 | 2>(1);

  // ---- Step 1: Form fields ----
  const [nombreRemitente, setNombreRemitente] = useState(user?.nombreComercial || user?.nombreCompleto || '');
  const [nombreDestinatario, setNombreDestinatario] = useState('');
  const [telefonoDestinatario, setTelefonoDestinatario] = useState('');
  const [direccionDestinatario, setDireccionDestinatario] = useState('');
  const [idDistritoDestinatario, setIdDistritoDestinatario] = useState<number | ''>('');
  const [referenciaDestinatario, setReferenciaDestinatario] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [esContraEntrega, setEsContraEntrega] = useState(false);
  const [montoCobrar, setMontoCobrar] = useState<number | ''>('');
  const [destinatarioPagaEnvio, setDestinatarioPagaEnvio] = useState(false);

  // ---- Step 2: Map / GPS fields ----
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
  const { getDistritosTarifas, getPoligonoVerde, getZonasRestringidas } = useCoberturaAdmin();

  // Backend real coverage state
  const [realDistritos, setRealDistritos] = useState<DistritoTarifaDto[]>([]);
  const [greenPolygon, setGreenPolygon] = useState<[number, number][]>([]);
  const [redZones, setRedZones] = useState<ZonaRestringidaDto[]>([]);

  const distritosList =
    realDistritos.length > 0
      ? realDistritos
      : obtenerDistritosCobertura().map((d) => ({
          id: d.id,
          nombre: d.nombre,
          zonaNombre: d.zonaNombre,
          latitud: d.lat,
          longitud: d.lng,
          tarifaDespacho: d.tarifaDespacho,
          coberturaActiva: d.coberturaActiva,
        }));

  useEffect(() => {
    const fetchBackendCobertura = async () => {
      try {
        const [dists, pol, zrs] = await Promise.all([
          getDistritosTarifas(),
          getPoligonoVerde(),
          getZonasRestringidas(),
        ]);
        if (dists.length > 0) setRealDistritos(dists);
        if (pol.length > 0) {
          const mapped: [number, number][] = pol.sort((a, b) => a.orden - b.orden).map((p) => [p.latitud, p.longitud]);
          setGreenPolygon(mapped);
        }
        if (zrs.length > 0) setRedZones(zrs);
      } catch (e) {
        console.error('Error al cargar datos de cobertura en AgendarEnvio:', e);
      }
    };
    fetchBackendCobertura();
  }, [getDistritosTarifas, getPoligonoVerde, getZonasRestringidas]);

  // Compute active restricted zone if pin falls inside any red zone
  const activeRestrictedZone = (() => {
    const list =
      redZones.length > 0
        ? redZones.map((z) => ({
            id: z.id,
            nombre: z.nombre,
            descripcion: z.descripcion,
            vertices: z.vertices.map((v) => ({ latitud: v.latitud, longitud: v.longitud })),
          }))
        : obtenerZonasRestringidas().map((z) => ({
            id: z.id,
            nombre: z.nombre,
            descripcion: z.descripcion,
            vertices: z.vertices.map((v) => ({ latitud: v[0], longitud: v[1] })),
          }));

    return list.find((z) => isPointInPolygon(selectedCoords, z.vertices)) || null;
  })();

  useEffect(() => {
    if (user?.nombreComercial || user?.nombreCompleto) {
      setNombreRemitente(user.nombreComercial || user.nombreCompleto);
    }
  }, [user]);

  useEffect(() => {
    const info = detectarDistritoCercano(selectedCoords.lat, selectedCoords.lng);
    setDistritoInfo(info);
    setGoogleMapsUrl(`https://www.google.com/maps?q=${selectedCoords.lat.toFixed(6)},${selectedCoords.lng.toFixed(6)}`);
  }, [selectedCoords]);

  if (!user) return null;

  // ---- Step 1 validation & next ----
  const handleNext = () => {
    setStep1Error('');
    if (!nombreDestinatario.trim() || !telefonoDestinatario.trim()) {
      setStep1Error('Por favor completa el nombre y celular del cliente (*)');
      return;
    }
    setStep(2);
  };

  // ---- Final submit ----
  const handleSubmit = async () => {
    setErrorMsg('');
    if (!idDistritoDestinatario) {
      setErrorMsg('Por favor selecciona el distrito de entrega (*)');
      return;
    }

    const currentSelectedDistrict = distritosList.find((d) => {
      const apMatch = distritos?.find((ap) => ap.id === idDistritoDestinatario);
      return (apMatch && d.nombre.toLowerCase() === apMatch.nombre.toLowerCase()) || d.id === idDistritoDestinatario;
    });

    if (currentSelectedDistrict && !currentSelectedDistrict.coberturaActiva) {
      setErrorMsg(
        `🚫 El distrito "${currentSelectedDistrict.nombre}" no cuenta con cobertura activa actualmente. Por favor selecciona un distrito que sí tenga cobertura habilitada (🟢).`
      );
      return;
    }

    if (activeRestrictedZone) {
      setErrorMsg(
        `🔴 La ubicación seleccionada está dentro de la Zona Restringida "${activeRestrictedZone.nombre}" (${activeRestrictedZone.descripcion}). No es posible agendar envíos a este punto por seguridad.`
      );
      return;
    }

    if (!direccionDestinatario.trim()) {
      setErrorMsg('Por favor ingresa la dirección exacta de entrega (*)');
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
        tarifaEnvio: (() => {
          const matchedDist = distritosList.find((d) => {
            const apMatch = distritos?.find((ap) => ap.id === idDistritoDestinatario);
            return (apMatch && d.nombre.toLowerCase() === apMatch.nombre.toLowerCase()) || d.id === idDistritoDestinatario;
          });
          return matchedDist ? matchedDist.tarifaDespacho : distritoInfo.coberturaActiva ? distritoInfo.tarifaDespacho : 10;
        })(),
        destinatarioPagaEnvio: destinatarioPagaEnvio,
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
              type="button"
              onClick={() => (step === 2 && !createdTrackingCode ? setStep(1) : navigate('/comercio/dashboard'))}
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
                {createdTrackingCode
                  ? '¡Envío registrado exitosamente!'
                  : step === 1
                  ? 'Paso 1 de 2 — Datos del destinatario'
                  : 'Paso 2 de 2 — Ubicación de entrega en el mapa'}
              </p>
            </div>

            {/* Step Indicator */}
            {!createdTrackingCode && (
              <div className="hidden sm:flex items-center gap-2 text-xs">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                    step === 1
                      ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {step > 1 ? <CheckCircle2 size={13} /> : <span>1</span>}
                  <span>Datos</span>
                </div>
                <ChevronRight size={14} className="text-slate-600" />
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all ${
                    step === 2
                      ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                      : 'bg-slate-800/60 text-slate-500 border border-slate-700'
                  }`}
                >
                  <span>2</span>
                  <span>Ubicación GPS</span>
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6">
          {/* SUCCESS MODAL */}
          <ModalExitoEnvio
            createdTrackingCode={createdTrackingCode}
            copied={copied}
            handleCopyCode={handleCopyCode}
            handleShareWhatsApp={handleShareWhatsApp}
            handleNuevoEnvio={handleNuevoEnvio}
            onGoToDashboard={() => {
              setCreatedTrackingCode(null);
              navigate('/comercio/dashboard');
            }}
          />

          {/* WIZARD CONTAINER */}
          <div className="space-y-5">
            {/* After-cutoff banner */}
            {isAfterCutoffTimePeru() && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-amber-200">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>Aviso de Horario — Hora Perú: {getPeruTimeString()}</span>
                </div>
                <p className="text-amber-200/80 pl-5 text-[11px]">
                  Envíos agendados después de las <strong>09:30 AM</strong> se programan para el siguiente día hábil.
                </p>
              </div>
            )}

            {/* STEP TABS */}
            <div className="flex gap-0 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/30">
              <button
                type="button"
                onClick={() => setStep(1)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                  step === 1
                    ? 'bg-violet-600/30 text-violet-300 border-b-2 border-violet-500'
                    : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                    step === 1 ? 'bg-violet-600 text-white' : step > 1 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  {step > 1 ? <CheckCircle2 size={14} /> : '1'}
                </div>
                Datos de Envío
              </button>
              <div className="w-px bg-slate-800" />
              <button
                type="button"
                onClick={() => {
                  if (step === 1) handleNext();
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold transition-all cursor-pointer ${
                  step === 2
                    ? 'bg-violet-600/30 text-violet-300 border-b-2 border-violet-500'
                    : 'text-slate-400 hover:text-white border-b-2 border-transparent'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold ${
                    step === 2 ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-400'
                  }`}
                >
                  2
                </div>
                <MapPin size={15} />
                Ubicación GPS
              </button>
            </div>

            {/* STEP 1: DATOS DE ENVÍO */}
            {step === 1 && (
              <Paso1DatosEnvio
                nombreRemitente={nombreRemitente}
                setNombreRemitente={setNombreRemitente}
                nombreDestinatario={nombreDestinatario}
                setNombreDestinatario={setNombreDestinatario}
                telefonoDestinatario={telefonoDestinatario}
                setTelefonoDestinatario={setTelefonoDestinatario}
                esContraEntrega={esContraEntrega}
                setEsContraEntrega={setEsContraEntrega}
                montoCobrar={montoCobrar}
                setMontoCobrar={setMontoCobrar}
                destinatarioPagaEnvio={destinatarioPagaEnvio}
                setDestinatarioPagaEnvio={setDestinatarioPagaEnvio}
                observaciones={observaciones}
                setObservaciones={setObservaciones}
                step1Error={step1Error}
                handleNext={handleNext}
              />
            )}

            {/* STEP 2: UBICACIÓN GPS / MAPA */}
            {step === 2 && (
              <Paso2UbicacionGPS
                errorMsg={errorMsg}
                activeRestrictedZone={activeRestrictedZone}
                idDistritoDestinatario={idDistritoDestinatario}
                setIdDistritoDestinatario={setIdDistritoDestinatario}
                direccionDestinatario={direccionDestinatario}
                setDireccionDestinatario={setDireccionDestinatario}
                referenciaDestinatario={referenciaDestinatario}
                setReferenciaDestinatario={setReferenciaDestinatario}
                googleMapsUrl={googleMapsUrl}
                setGoogleMapsUrl={setGoogleMapsUrl}
                selectedCoords={selectedCoords}
                setSelectedCoords={setSelectedCoords}
                distritoInfo={distritoInfo}
                distritos={distritos}
                loadingDistritos={loadingDistritos}
                distritosList={distritosList}
                greenPolygon={greenPolygon}
                redZones={redZones}
                isPending={registrarMutation.isPending}
                handleSubmit={handleSubmit}
                onBackToStep1={() => setStep(1)}
              />
            )}
          </div>
        </main>

        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>
    </div>
  );
};

export default AgendarEnvioPage;
