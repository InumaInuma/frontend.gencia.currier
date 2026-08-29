import React from 'react';
import { EstadoPedidoEnum } from '../../../domain/enums/EstadoPedidoEnum';
import type { IMonitoreoRecojo } from '../../../domain/models/IMonitoreoRecojo';
import { TablaMonitoreoRecojo } from '../TablaMonitoreoRecojo';
import {
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Navigation,
  Bike,
  CheckCircle2
} from 'lucide-react';

export interface GroupedByComercio {
  idComercio: number;
  nombreComercial: string;
  ruc: string;
  direccionRecojo: string;
  referenciaRecojo?: string;
  telefonoComercio?: string;
  googleMapsUrlComercio?: string;
  pedidos: IMonitoreoRecojo[];
  estadoComercio: string; // 'Asignado' | 'En Camino al Comercio' | 'Llegó al Comercio' | 'Recogido'
}

interface Props {
  comercio: GroupedByComercio;
  index: number;
  isOpen: boolean;
  onToggleAccordion: (idComercio: number) => void;
  onActualizarEstadoComercio: (idComercio: number, idEstado: EstadoPedidoEnum) => void;
  onCancelarPedido?: (pedido: IMonitoreoRecojo) => void;
  isPending: boolean;
}

export const AcordeonComercioMotorizado: React.FC<Props> = ({
  comercio,
  index,
  isOpen,
  onToggleAccordion,
  onActualizarEstadoComercio,
  onCancelarPedido,
  isPending,
}) => {
  const isRecogido = comercio.estadoComercio === 'Recogido';
  const isLlego = comercio.estadoComercio === 'Llegó al Comercio';
  const isEnCamino = comercio.estadoComercio === 'En Camino al Comercio';

  return (
    <div
      className={`bg-slate-900/40 border rounded-2xl overflow-hidden shadow-xl transition-all ${
        isRecogido
          ? 'border-emerald-500/30 bg-emerald-950/10'
          : isLlego
          ? 'border-cyan-500/40 bg-cyan-950/10'
          : isEnCamino
          ? 'border-amber-500/40 bg-amber-950/10'
          : 'border-slate-900'
      }`}
    >
      {/* Comercio Header */}
      <div
        onClick={() => onToggleAccordion(comercio.idComercio)}
        className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-violet-950/20 border-b border-slate-900 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-extrabold text-sm shrink-0">
            {index + 1}
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                {comercio.nombreComercial}
              </h3>
              <span className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                RUC: {comercio.ruc}
              </span>
            </div>

            <p className="text-xs text-violet-300 flex items-center gap-1.5 mt-1">
              <MapPin size={14} className="text-violet-400 shrink-0" />
              {comercio.direccionRecojo}
              {comercio.referenciaRecojo && (
                <span className="text-slate-400 font-medium">({comercio.referenciaRecojo})</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">
          {/* Commerce Status Badge */}
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              isRecogido
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : isLlego
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                : isEnCamino
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isRecogido
              ? '✅ Recogido'
              : isLlego
              ? '📍 En Comercio'
              : isEnCamino
              ? '🏍️ En Camino'
              : '🕒 Pendiente'}
          </span>

          {comercio.googleMapsUrlComercio && (
            <a
              href={comercio.googleMapsUrlComercio}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              <ExternalLink size={13} />
              GPS Mapa
            </a>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAccordion(comercio.idComercio);
            }}
            className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
          >
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Comercio Details & Interactive Driver Actions */}
      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4">
          {/* Driver Status Progression Buttons */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 space-y-1 w-full sm:w-auto">
              <div className="flex items-center gap-2 font-bold text-white">
                <Navigation size={14} className="text-violet-400" />
                <span>Acción del Repartidor para este Comercio:</span>
              </div>
              <p className="text-slate-400">
                {comercio.referenciaRecojo ? `Ref: ${comercio.referenciaRecojo}` : 'Sin referencia'}
                {comercio.telefonoComercio && ` — 📞 Teléfono: ${comercio.telefonoComercio}`}
              </p>
            </div>

            {/* Action State Buttons using EstadoPedidoEnum IDs */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!isRecogido && !isLlego && !isEnCamino && (
                <button
                  type="button"
                  onClick={() => onActualizarEstadoComercio(comercio.idComercio, EstadoPedidoEnum.EnCaminoAlComercio)}
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-600/20 active:scale-95"
                >
                  <Bike size={16} />
                  Voy en Camino al Comercio
                </button>
              )}

              {isEnCamino && (
                <button
                  type="button"
                  onClick={() => onActualizarEstadoComercio(comercio.idComercio, EstadoPedidoEnum.LlegoAlComercio)}
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-600/20 active:scale-95"
                >
                  <MapPin size={16} />
                  Llegué al Comercio
                </button>
              )}

              {isLlego && (
                <button
                  type="button"
                  onClick={() => onActualizarEstadoComercio(comercio.idComercio, EstadoPedidoEnum.Recogido)}
                  disabled={isPending}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-95"
                >
                  <CheckCircle2 size={16} />
                  Paquetes Recogidos del Comercio
                </button>
              )}

              {isRecogido && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Recojo de Comercio Completado
                </span>
              )}
            </div>
          </div>

          {/* Package Table Component */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl overflow-hidden p-3">
            <TablaMonitoreoRecojo pedidos={comercio.pedidos} onCancelarPedido={onCancelarPedido} />
          </div>
        </div>
      )}
    </div>
  );
};
