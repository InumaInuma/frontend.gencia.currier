import React from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';
import type { IDistrito } from '../../../../domain/models/IDistrito';
import type { DistritoTarifaDto } from '../../../../application/useCases/useCoberturaAdmin';

export interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city_district?: string;
    district?: string;
    city?: string;
    town?: string;
  };
}

interface Props {
  idDistritoDestinatario: number | '';
  setIdDistritoDestinatario: (val: number | '') => void;
  distritos: IDistrito[] | undefined;
  loadingDistritos: boolean;
  distritosList: DistritoTarifaDto[];
  setSelectedCoords: (coords: { lat: number; lng: number }) => void;
  direccionDestinatario: string;
  setDireccionDestinatario: (val: string) => void;
  isSearchingAddress: boolean;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  suggestions: NominatimResult[];
  handleSelectSuggestion: (s: NominatimResult) => void;
  referenciaDestinatario: string;
  setReferenciaDestinatario: (val: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const DireccionFormFields: React.FC<Props> = ({
  idDistritoDestinatario,
  setIdDistritoDestinatario,
  distritos,
  loadingDistritos,
  distritosList,
  setSelectedCoords,
  direccionDestinatario,
  setDireccionDestinatario,
  isSearchingAddress,
  showSuggestions,
  setShowSuggestions,
  suggestions,
  handleSelectSuggestion,
  referenciaDestinatario,
  setReferenciaDestinatario,
  containerRef,
}) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
      <h2 className="text-sm font-bold text-white flex items-center gap-2">
        <MapPin size={16} className="text-violet-400" />
        <span>Dirección de Entrega y Destino</span>
      </h2>

      {/* Distrito y Dirección */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            1. Distrito de Entrega *
          </label>
          <select
            value={idDistritoDestinatario}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : '';
              setIdDistritoDestinatario(val);
              if (val) {
                const match = distritosList.find((d) => {
                  const distritosApiMatch = distritos?.find((ap) => ap.id === val);
                  return (
                    (distritosApiMatch && d.nombre.toLowerCase() === distritosApiMatch.nombre.toLowerCase()) ||
                    d.id === val
                  );
                });
                if (match && match.latitud !== 0 && match.longitud !== 0) {
                  setSelectedCoords({ lat: match.latitud, lng: match.longitud });
                }
              }
            }}
            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 outline-none focus:border-violet-500 transition-colors"
          >
            <option value="">Seleccionar Distrito</option>
            {loadingDistritos ? (
              <option disabled>Cargando...</option>
            ) : (
              distritos?.map((d) => {
                const info = distritosList.find((c) => c.nombre.toLowerCase() === d.nombre.toLowerCase());
                const tarifa = info ? info.tarifaDespacho : d.tarifaDespacho || 10;
                const zona = info?.zonaNombre ? `(${info.zonaNombre}) ` : '';
                const activa = info ? info.coberturaActiva : true;
                return (
                  <option key={d.id} value={d.id}>
                    {d.nombre} {zona}— S/ {tarifa.toFixed(2)} {activa ? '🟢' : '🔴'}
                  </option>
                );
              })
            )}
          </select>
        </div>

        <div ref={containerRef} className="relative">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center justify-between">
            <span>2. Dirección Exacta *</span>
            {isSearchingAddress && (
              <span className="text-[10px] text-violet-400 font-normal flex items-center gap-1">
                <Loader2 size={11} className="animate-spin" /> Buscando ubicación...
              </span>
            )}
          </label>
          <div className="relative">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={direccionDestinatario}
              onChange={(e) => setDireccionDestinatario(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              placeholder="Ej: Av. Miraflores 45, San Isidro"
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Dropdown sugerencias de dirección */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[150] max-h-64 overflow-y-auto no-scrollbar p-1.5 space-y-1">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-800/80 mb-1">
                <span className="flex items-center gap-1">
                  <Search size={11} className="text-violet-400" /> Sugerencias de Ubicación
                </span>
                <span className="text-[9px] text-slate-500 font-normal">Haz clic para sobreponer en mapa</span>
              </div>
              {suggestions.map((s, idx) => (
                <button
                  key={`${s.place_id}_${idx}`}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 group cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-violet-600 group-hover:text-white transition-all">
                    <MapPin size={13} />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate leading-tight">
                      {s.address?.road
                        ? `${s.address.road} ${s.address.house_number || ''}`.trim()
                        : s.display_name.split(',')[0]}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {s.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Referencia */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          3. Referencia de Entrega
        </label>
        <input
          type="text"
          value={referenciaDestinatario}
          onChange={(e) => setReferenciaDestinatario(e.target.value)}
          placeholder="Ej: Frente al parque central, puerta negra"
          className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 outline-none focus:border-violet-500 transition-colors"
        />
      </div>
    </div>
  );
};
