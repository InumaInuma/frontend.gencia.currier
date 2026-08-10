import React from 'react';
import { Calendar } from 'lucide-react';

interface Props {
  fechaInicio: string;
  fechaFin: string;
  onChangeFechaInicio: (fecha: string) => void;
  onChangeFechaFin: (fecha: string) => void;
  onSetHoy: () => void;
  isToday: boolean;
}

export const FiltroRangoFechasRendicion: React.FC<Props> = ({
  fechaInicio,
  fechaFin,
  onChangeFechaInicio,
  onChangeFechaFin,
  onSetHoy,
  isToday,
}) => {
  return (
    <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-md">
      <div className="flex items-center gap-2 text-xs text-slate-300">
        <Calendar size={16} className="text-emerald-400" />
        <span className="font-bold text-white">Filtrar Liquidaciones por Fecha:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs w-full md:w-auto justify-between md:justify-end">
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
          <span className="text-slate-400 text-[11px] font-semibold">Desde:</span>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => onChangeFechaInicio(e.target.value)}
            className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
          <span className="text-slate-400 text-[11px] font-semibold">Hasta:</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => onChangeFechaFin(e.target.value)}
            className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
          />
        </div>

        <button
          onClick={onSetHoy}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer text-xs ${
            isToday
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Filtrar liquidaciones de hoy"
        >
          Hoy
        </button>
      </div>
    </div>
  );
};
