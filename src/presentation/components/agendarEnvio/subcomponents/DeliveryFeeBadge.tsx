import React from 'react';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';
import type { IDistrito } from '../../../../domain/models/IDistrito';
import type { DistritoTarifaDto, ZonaAlejadaDto } from '../../../../application/useCases/useCoberturaAdmin';
import type { IZonaCoberturaInfo } from '../../../../infrastructure/utils/coberturaData';

interface Props {
  distritosList: DistritoTarifaDto[];
  distritos: IDistrito[] | undefined;
  idDistritoDestinatario: number | '';
  distritoInfo: IZonaCoberturaInfo;
  activeYellowZone?: ZonaAlejadaDto | null;
  selectedCoords: { lat: number; lng: number };
}

export const DeliveryFeeBadge: React.FC<Props> = ({
  distritosList,
  distritos,
  idDistritoDestinatario,
  distritoInfo,
  activeYellowZone,
  selectedCoords,
}) => {
  const matched = distritosList.find((d) => {
    const apMatch = distritos?.find((ap) => ap.id === idDistritoDestinatario);
    return (apMatch && d.nombre.toLowerCase() === apMatch.nombre.toLowerCase()) || d.id === idDistritoDestinatario;
  });
  const name = matched ? matched.nombre : distritoInfo.nombre;
  const active = matched ? matched.coberturaActiva : distritoInfo.coberturaActiva;
  const baseFee = matched ? matched.tarifaDespacho : distritoInfo.tarifaDespacho;

  const finalFee = activeYellowZone
    ? activeYellowZone.usarPorcentaje
      ? Math.round(baseFee * (1 + activeYellowZone.porcentajeRecargo / 100) * 100) / 100
      : baseFee + activeYellowZone.montoFijoRecargo
    : baseFee;

  if (activeYellowZone && active) {
    return (
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-gradient-to-r from-yellow-950/95 via-slate-900/95 to-slate-900/95 backdrop-blur-md border-2 border-yellow-500/60 rounded-2xl p-3.5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-yellow-500/20">
            <MapPin size={22} className="animate-bounce" />
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-white flex items-center gap-2 flex-wrap">
              <span>Distrito:</span>
              <span className="text-yellow-300 font-mono text-sm">{name}</span>
              <span className="text-[10px] bg-yellow-500/25 text-yellow-300 border border-yellow-500/40 px-2.5 py-0.5 rounded-full font-bold">
                🟡 Zona Alejada ({activeYellowZone.nombre})
              </span>
            </div>
            <div className="text-[11px] text-yellow-200/90 font-medium">
              Recargo especial del <strong>+{activeYellowZone.porcentajeRecargo}%</strong> por sub-zona distante
            </div>
          </div>
        </div>

        {/* Big Animated Yellow Delivery Fee Badge */}
        <div className="flex flex-col items-end bg-yellow-500/20 border-2 border-yellow-500/60 px-4 py-2 rounded-2xl self-end sm:self-auto shadow-xl shadow-yellow-500/20">
          <span className="text-yellow-400 text-[10px] uppercase font-bold tracking-widest">COSTO TOTAL DE ENVÍO</span>
          <span className="font-extrabold text-yellow-300 font-mono text-xl sm:text-2xl tracking-tight drop-shadow-md animate-bounce">
            S/ {finalFee.toFixed(2)}
          </span>
          <span className="text-[10px] text-yellow-200/70 font-mono">
            (Base S/ {baseFee.toFixed(2)} + {activeYellowZone.porcentajeRecargo}%)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3.5 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border font-bold ${active ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'}`}>
          {active ? <Navigation size={18} /> : <AlertTriangle size={18} />}
        </div>
        <div>
          <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
            <span>Distrito:</span>
            <span className="text-purple-300 font-mono">{name}</span>
            {active ? (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">🟢 En Cobertura</span>
            ) : (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">⚠️ Sin Cobertura</span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            GPS: {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
          </div>
        </div>
      </div>

      {/* Delivery fee display */}
      <div className="flex items-center gap-2.5 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800 self-end sm:self-auto shadow-inner">
        <span className="text-slate-400 text-xs font-medium">Costo de Envío:</span>
        <span className="font-extrabold text-emerald-400 font-mono text-base sm:text-lg">
          {active ? `S/ ${baseFee.toFixed(2)}` : 'Sin Cobertura'}
        </span>
      </div>
    </div>
  );
};
