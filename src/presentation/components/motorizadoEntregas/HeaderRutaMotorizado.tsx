import React from 'react';
import { Bike } from 'lucide-react';
import type { IMonitoreoEntrega } from '../../../domain/models/IMonitoreoEntrega';

interface Props {
  misItems: IMonitoreoEntrega[];
  esRutaIniciada: boolean;
  onIniciarRuta: () => void;
  isPending: boolean;
}

export const HeaderRutaMotorizado: React.FC<Props> = ({
  misItems,
  esRutaIniciada,
  onIniciarRuta,
  isPending,
}) => {
  if (!misItems || misItems.length === 0) return null;

  const firstItem = misItems[0];
  const idAsignacion = firstItem.idAsignacionEntrega || firstItem.idPedido;

  return (
    <div className="bg-slate-900/50 border border-slate-900 p-5 rounded-2xl space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider block">
            Hoja de Ruta de Reparto Asignada
          </span>
          <h2 className="text-lg font-extrabold text-white mt-0.5">
            Ruta #{idAsignacion} — {misItems.length}{' '}
            {misItems.length === 1 ? 'Paquete a entregar' : 'Paquetes a entregar'}
          </h2>
        </div>

        {/* Route Status Button */}
        {!esRutaIniciada ? (
          <button
            type="button"
            onClick={onIniciarRuta}
            disabled={isPending}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Bike size={18} />
            Comenzar Ruta de Reparto (Salir de Almacén)
          </button>
        ) : (
          <span className="px-4 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-extrabold flex items-center gap-2">
            <Bike size={16} className="animate-pulse text-cyan-400" />
            Ruta en Curso (Salida de Almacén Registrada)
          </span>
        )}
      </div>
    </div>
  );
};
