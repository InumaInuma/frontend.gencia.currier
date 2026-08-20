import React from 'react';
import { Search, CheckCircle2, AlertCircle, Pencil, Trash2, Plus } from 'lucide-react';
import type { DistritoTarifaDto } from '../../../application/useCases/useCoberturaAdmin';

interface Props {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  distritosFiltrados: DistritoTarifaDto[];
  onOpenAddDistritoModal: () => void;
  onOpenEditDistritoModal: (distrito: DistritoTarifaDto) => void;
  onOpenDeleteDistritoModal: (distrito: DistritoTarifaDto) => void;
}

export const TabDistritosTarifas: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  distritosFiltrados,
  onOpenAddDistritoModal,
  onOpenEditDistritoModal,
  onOpenDeleteDistritoModal,
}) => {
  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar distrito o zona..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-slate-400">
            Mostrando <strong className="text-white font-mono">{distritosFiltrados.length}</strong> distritos
          </span>

          <button
            type="button"
            onClick={onOpenAddDistritoModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-lg shadow-emerald-600/30 transition-all shrink-0"
          >
            <Plus size={15} /> Nuevo Distrito
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-900">
        <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[11px] bg-slate-950/80">
              <th className="p-3.5">Distrito</th>
              <th className="p-3.5">Zona / Sector</th>
              <th className="p-3.5 text-center">Tarifa (S/)</th>
              <th className="p-3.5 text-center">Estado</th>
              <th className="p-3.5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {distritosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 text-xs font-semibold">
                  No se encontraron distritos o zonas registradas.
                </td>
              </tr>
            ) : (
              distritosFiltrados.map((d) => (
                <tr key={d.id} className="hover:bg-slate-950/50 transition-colors">
                  <td className="p-3.5 font-bold text-white">{d.nombre}</td>
                  <td className="p-3.5 text-slate-400 font-mono">{d.zonaNombre}</td>
                  <td className="p-3.5 text-center font-mono font-bold text-emerald-400 text-xs">
                    S/ {d.tarifaDespacho.toFixed(2)}
                  </td>
                  <td className="p-3.5 text-center">
                    {d.coberturaActiva ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                        <CheckCircle2 size={13} /> En Cobertura
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                        <AlertCircle size={13} /> Sin Cobertura
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenEditDistritoModal(d)}
                        title="Editar Distrito, Tarifa y Cobertura"
                        className="p-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5"
                      >
                        <Pencil size={14} />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenDeleteDistritoModal(d)}
                        title="Eliminar Distrito"
                        className="p-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-all cursor-pointer inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5"
                      >
                        <Trash2 size={14} />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
