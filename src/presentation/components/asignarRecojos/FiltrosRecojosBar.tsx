import React from 'react';
import { Search, Calendar } from 'lucide-react';

interface Props {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  fechaInicio: string;
  setFechaInicio: (fecha: string) => void;
  fechaFin: string;
  setFechaFin: (fecha: string) => void;
  todayFormatted: string;
  onResetPage: () => void;
  selectedCount: number;
}

export const FiltrosRecojosBar: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  fechaInicio,
  setFechaInicio,
  fechaFin,
  setFechaFin,
  todayFormatted,
  onResetPage,
  selectedCount,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-900 shadow-lg">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onResetPage();
          }}
          placeholder="Buscar por comercio, dirección o código..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
        />
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
          <Calendar size={13} className="text-violet-400" />
          <span className="text-slate-400 text-[11px] font-semibold">Desde:</span>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => {
              setFechaInicio(e.target.value);
              onResetPage();
            }}
            className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 shadow-inner">
          <Calendar size={13} className="text-violet-400" />
          <span className="text-slate-400 text-[11px] font-semibold">Hasta:</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => {
              setFechaFin(e.target.value);
              onResetPage();
            }}
            className="bg-transparent text-white text-xs outline-none cursor-pointer font-medium"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setFechaInicio(todayFormatted);
            setFechaFin(todayFormatted);
            onResetPage();
          }}
          className={`px-2.5 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer text-xs ${
            fechaInicio === todayFormatted && fechaFin === todayFormatted
              ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
          title="Filtrar recojos del día de hoy"
        >
          Hoy
        </button>

        {(fechaInicio || fechaFin) && (
          <button
            type="button"
            onClick={() => {
              setFechaInicio('');
              setFechaFin('');
              onResetPage();
            }}
            className="px-2.5 py-1.5 rounded-xl font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs cursor-pointer"
          >
            Ver Todos
          </button>
        )}

        {selectedCount > 0 && (
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl ml-auto md:ml-0">
            {selectedCount} seleccionados
          </span>
        )}
      </div>
    </div>
  );
};
