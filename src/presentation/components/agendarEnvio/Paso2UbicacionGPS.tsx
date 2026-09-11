import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, AlertTriangle, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import type { IDistrito } from '../../../domain/models/IDistrito';
import type { DistritoTarifaDto, ZonaAlejadaDto, ZonaRestringidaDto } from '../../../application/useCases/useCoberturaAdmin';
import type { IZonaCoberturaInfo } from '../../../infrastructure/utils/coberturaData';
import { detectarDistritoCercano } from '../../../infrastructure/utils/coberturaData';
import { extraerCoordenadasDeTexto } from './agendarEnvioUtils';
import { useResolverLinkMaps } from '../../../application/useCases/useMisPedidos';
import { SmartLinkParserCard } from './subcomponents/SmartLinkParserCard';
import { DireccionFormFields, type NominatimResult } from './subcomponents/DireccionFormFields';
import { LocationMapPicker } from './subcomponents/LocationMapPicker';

interface Props {
  errorMsg: string;
  activeRestrictedZone: { id: number; nombre: string; descripcion?: string } | null;
  activeYellowZone?: ZonaAlejadaDto | null;
  idDistritoDestinatario: number | '';
  setIdDistritoDestinatario: (val: number | '') => void;
  direccionDestinatario: string;
  setDireccionDestinatario: (val: string) => void;
  referenciaDestinatario: string;
  setReferenciaDestinatario: (val: string) => void;
  googleMapsUrl: string;
  setGoogleMapsUrl: (val: string) => void;
  selectedCoords: { lat: number; lng: number };
  setSelectedCoords: (coords: { lat: number; lng: number }) => void;
  distritoInfo: IZonaCoberturaInfo;
  distritos: IDistrito[] | undefined;
  loadingDistritos: boolean;
  distritosList: DistritoTarifaDto[];
  greenPolygon: [number, number][];
  redZones: ZonaRestringidaDto[];
  yellowZones?: ZonaAlejadaDto[];
  isPending: boolean;
  handleSubmit: () => void;
  onBackToStep1: () => void;
}

export const Paso2UbicacionGPS: React.FC<Props> = ({
  errorMsg,
  activeRestrictedZone,
  activeYellowZone,
  idDistritoDestinatario,
  setIdDistritoDestinatario,
  direccionDestinatario,
  setDireccionDestinatario,
  referenciaDestinatario,
  setReferenciaDestinatario,
  googleMapsUrl,
  setGoogleMapsUrl,
  selectedCoords,
  setSelectedCoords,
  distritoInfo,
  distritos,
  loadingDistritos,
  distritosList,
  greenPolygon,
  redZones,
  yellowZones,
  isPending,
  handleSubmit,
  onBackToStep1,
}) => {
  // Nominatim Autocomplete State
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isSelectedFromDropdown = useRef(false);

  // Link Parser State
  const [linkInput, setLinkInput] = useState('');
  const [isProcessingLink, setIsProcessingLink] = useState(false);
  const [parseSuccessMsg, setParseSuccessMsg] = useState('');
  const resolverLinkMutation = useResolverLinkMaps();

  // Debounced address search (Nominatim)
  useEffect(() => {
    if (isSelectedFromDropdown.current) {
      isSelectedFromDropdown.current = false;
      return;
    }

    if (!direccionDestinatario || direccionDestinatario.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearchingAddress(true);
        const query = `${direccionDestinatario.trim()}, Lima, Peru`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5&countrycodes=pe`,
          {
            headers: {
              'Accept-Language': 'es-PE,es;q=0.9',
            },
          }
        );
        if (res.ok) {
          const data: NominatimResult[] = await res.json();
          setSuggestions(data);
          setShowSuggestions(data.length > 0);
        }
      } catch (e) {
        console.error('Error buscando sugerencias de dirección:', e);
      } finally {
        setIsSearchingAddress(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [direccionDestinatario]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const processCoordinatesAndAddress = async (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setGoogleMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);

    // Auto detect district
    const closestInfo = detectarDistritoCercano(lat, lng);
    if (closestInfo && distritos) {
      const match = distritos.find(
        (d) => d.nombre.toLowerCase().trim() === closestInfo.nombre.toLowerCase().trim() || d.id === closestInfo.id
      );
      if (match) {
        setIdDistritoDestinatario(match.id);
      }
    }

    // Reverse geocode street address
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: { 'Accept-Language': 'es-PE,es;q=0.9' },
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          let cleanAddress = data.display_name;
          if (data.address?.road) {
            cleanAddress = `${data.address.road}${data.address.house_number ? ' ' + data.address.house_number : ''}`;
            if (data.address.suburb) cleanAddress += `, ${data.address.suburb}`;
          }
          setDireccionDestinatario(cleanAddress);
        }
      }
    } catch (e) {
      console.error('Error reverse geocoding:', e);
    }

    setParseSuccessMsg('🟢 ¡Ubicación detectada exitosamente! El pin del mapa se ha posicionado.');
    setTimeout(() => setParseSuccessMsg(''), 5000);
  };

  const handleProcessLink = async (textToProcess?: string) => {
    const targetText = textToProcess !== undefined ? textToProcess : linkInput;
    if (!targetText || !targetText.trim()) return;

    setIsProcessingLink(true);
    try {
      // 1. Local parsing (DMS, @lat,lng, !3d!4d, decimal)
      const localCoords = extraerCoordenadasDeTexto(targetText);
      if (localCoords) {
        await processCoordinatesAndAddress(localCoords.lat, localCoords.lng);
        setIsProcessingLink(false);
        return;
      }

      // 2. Backend URL unshortener / resolver
      if (
        targetText.includes('http://') ||
        targetText.includes('https://') ||
        targetText.includes('maps') ||
        targetText.includes('goo.gl')
      ) {
        const res = await resolverLinkMutation.mutateAsync(targetText.trim());
        if (res && res.lat && res.lng) {
          await processCoordinatesAndAddress(res.lat, res.lng);
          setIsProcessingLink(false);
          return;
        }
        if (res && res.finalUrl) {
          const coordsFromFinal = extraerCoordenadasDeTexto(res.finalUrl);
          if (coordsFromFinal) {
            await processCoordinatesAndAddress(coordsFromFinal.lat, coordsFromFinal.lng);
            setIsProcessingLink(false);
            return;
          }
        }
      }

      alert('No se pudieron extraer las coordenadas GPS del enlace o texto ingresado. Por favor verifica el link o haz clic en el mapa.');
    } catch (err) {
      console.error('Error procesando link de ubicación:', err);
    } finally {
      setIsProcessingLink(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setLinkInput(text);
          await handleProcessLink(text);
        }
      }
    } catch (err) {
      console.error('No se pudo leer del portapapeles:', err);
    }
  };

  const handleSelectSuggestion = (s: NominatimResult) => {
    isSelectedFromDropdown.current = true;
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);

    let cleanAddress = s.display_name;
    if (s.address?.road) {
      cleanAddress = `${s.address.road}${s.address.house_number ? ' ' + s.address.house_number : ''}`;
      if (s.address.suburb) {
        cleanAddress += `, ${s.address.suburb}`;
      }
    }

    setDireccionDestinatario(cleanAddress);
    setSelectedCoords({ lat, lng });
    setGoogleMapsUrl(`https://www.google.com/maps?q=${lat},${lng}`);
    setShowSuggestions(false);

    // Auto match district by text or distance
    const districtNameFromApi =
      s.address?.suburb || s.address?.city_district || s.address?.district || s.address?.town || '';

    let matchedDistritoId: number | null = null;

    if (districtNameFromApi && distritos) {
      const directMatch = distritos.find(
        (d) => d.nombre.toLowerCase().trim() === districtNameFromApi.toLowerCase().trim()
      );
      if (directMatch) {
        matchedDistritoId = directMatch.id;
      }
    }

    if (!matchedDistritoId) {
      const closestInfo = detectarDistritoCercano(lat, lng);
      if (closestInfo && distritos) {
        const match = distritos.find(
          (d) => d.nombre.toLowerCase().trim() === closestInfo.nombre.toLowerCase().trim() || d.id === closestInfo.id
        );
        if (match) {
          matchedDistritoId = match.id;
        }
      }
    }

    if (matchedDistritoId) {
      setIdDistritoDestinatario(matchedDistritoId);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
  };

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle size={15} className="shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Warning banner for restricted zone */}
      {activeRestrictedZone && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs font-bold shadow-lg animate-pulse">
          <AlertTriangle size={18} className="text-red-400 shrink-0" />
          <span>
            🔴 <strong>Ubicación Restringida:</strong> La ubicación marcada en el mapa se encuentra dentro de la "
            <strong>{activeRestrictedZone.nombre}</strong>" ({activeRestrictedZone.descripcion}). Por seguridad, no se aceptan entregas en este punto.
          </span>
        </div>
      )}

      {/* Notice banner for Yellow Remote Zone Surcharge */}
      {activeYellowZone && !activeRestrictedZone && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-yellow-500/15 border border-yellow-500/40 text-yellow-300 text-xs font-bold shadow-lg">
          <MapPin size={18} className="text-yellow-400 shrink-0" />
          <span>
            🟡 <strong>Zona Alejada Detectada ({activeYellowZone.nombre}):</strong> Esta ubicación se encuentra en una sub-zona distante. Se aplicará un recargo especial de <strong>+{activeYellowZone.porcentajeRecargo}%</strong> sobre la tarifa base de envío.
          </span>
        </div>
      )}

      {/* Success Banner for Link Parse */}
      {parseSuccessMsg && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-lg animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{parseSuccessMsg}</span>
        </div>
      )}

      {/* 2, 3 & 4. DIRECCIÓN, DISTRITO Y REFERENCIA FORM FIELDS */}
      <DireccionFormFields
        idDistritoDestinatario={idDistritoDestinatario}
        setIdDistritoDestinatario={setIdDistritoDestinatario}
        distritos={distritos}
        loadingDistritos={loadingDistritos}
        distritosList={distritosList}
        setSelectedCoords={setSelectedCoords}
        direccionDestinatario={direccionDestinatario}
        setDireccionDestinatario={setDireccionDestinatario}
        isSearchingAddress={isSearchingAddress}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        suggestions={suggestions}
        handleSelectSuggestion={handleSelectSuggestion}
        referenciaDestinatario={referenciaDestinatario}
        setReferenciaDestinatario={setReferenciaDestinatario}
        containerRef={containerRef}
      />

      {/* 5. SMART LINK & WHATSAPP PARSER CARD WITH GOOGLE MAPS LINK */}
      <SmartLinkParserCard
        linkInput={linkInput}
        setLinkInput={setLinkInput}
        isProcessingLink={isProcessingLink}
        handleProcessLink={handleProcessLink}
        handlePasteFromClipboard={handlePasteFromClipboard}
        googleMapsUrl={googleMapsUrl}
        setGoogleMapsUrl={setGoogleMapsUrl}
      />

      {/* 6. LOCATION MAP PICKER (LEAFLET + POLYGONS + FEE BADGE) */}
      <LocationMapPicker
        selectedCoords={selectedCoords}
        handleMapClick={handleMapClick}
        greenPolygon={greenPolygon}
        yellowZones={yellowZones}
        redZones={redZones}
        idDistritoDestinatario={idDistritoDestinatario}
        distritosList={distritosList}
        distritos={distritos}
        distritoInfo={distritoInfo}
        activeYellowZone={activeYellowZone}
      />

      {/* SUBMIT ACTION CARD */}
      <div className="p-5 border border-slate-800 rounded-3xl space-y-4 bg-slate-900/50 shadow-xl">
        {/* Submit button */}
        <div>
          {(() => {
            const matched = distritosList.find((d) => {
              const apMatch = distritos?.find((ap) => ap.id === idDistritoDestinatario);
              return (apMatch && d.nombre.toLowerCase() === apMatch.nombre.toLowerCase()) || d.id === idDistritoDestinatario;
            });
            const isInactive = matched ? !matched.coberturaActiva : false;
            const isBlocked = isPending || isInactive || !!activeRestrictedZone;

            let label = 'Agendar Envío y Generar Código';
            if (isPending) {
              label = 'Agendando...';
            } else if (activeRestrictedZone) {
              label = `🔴 Zona Restringida: ${activeRestrictedZone.nombre} (Bloqueado)`;
            } else if (isInactive) {
              label = '🚫 Sin Cobertura — Selecciona un distrito habilitado (🟢)';
            }

            return (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isBlocked}
                className={`w-full flex items-center justify-center gap-2 text-white text-sm font-semibold rounded-xl py-3.5 px-4 shadow-lg transition-all duration-200 ${
                  isBlocked
                    ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/25 cursor-pointer'
                }`}
              >
                {isPending ? <Loader2 className="animate-spin" size={18} /> : label}
              </button>
            );
          })()}
        </div>

        <button
          type="button"
          onClick={onBackToStep1}
          className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer py-1"
        >
          ← Volver a editar datos del envío
        </button>
      </div>
    </div>
  );
};
