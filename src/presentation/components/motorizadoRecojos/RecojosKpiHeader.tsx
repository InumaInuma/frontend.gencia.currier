import React from 'react';
import { Store, Package, Bike } from 'lucide-react';

interface Props {
  totalComercios: number;
  totalPaquetes: number;
  estadoRutaGlobal: string;
}

export const RecojosKpiHeader: React.FC<Props> = ({
  totalComercios,
  totalPaquetes,
  estadoRutaGlobal,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-bold">
          <Store size={24} />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium">Comercios a Recoger</span>
          <h3 className="text-xl font-extrabold text-white">{totalComercios}</h3>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
          <Package size={24} />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium">Total Paquetes Asignados</span>
          <h3 className="text-xl font-extrabold text-white">{totalPaquetes}</h3>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-900 p-4 rounded-2xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center font-bold">
          <Bike size={24} />
        </div>
        <div>
          <span className="text-xs text-slate-400 font-medium">Estado Asignación Ruta</span>
          <h3 className="text-sm font-extrabold text-amber-400">
            {estadoRutaGlobal || 'Asignado'}
          </h3>
        </div>
      </div>
    </div>
  );
};
