import React from 'react';
import type { ILiquidacionResumen } from '../../../domain/models/ILiquidacionResumen';
import { Bike, Phone, DollarSign } from 'lucide-react';

interface Props {
  selectedConductor: ILiquidacionResumen;
  onVolver: () => void;
  onConfirmarRendicion: (idConductor: number, nombreConductor: string) => void;
  isPendingConfirmacion: boolean;
}

export const DriverHeaderCard: React.FC<Props> = ({
  selectedConductor,
  onVolver,
  onConfirmarRendicion,
  isPendingConfirmacion,
}) => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-violet-500/20">
          <Bike size={28} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-white">{selectedConductor.nombreConductor}</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
              {selectedConductor.placaVehiculo}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
            {selectedConductor.telefonoConductor && (
              <span className="flex items-center gap-1 text-slate-300">
                <Phone size={13} className="text-emerald-400" />
                {selectedConductor.telefonoConductor}
              </span>
            )}
            <span>Vehículo: <strong className="text-white">{selectedConductor.tipoVehiculo || 'Motorizado'}</strong></span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {selectedConductor.montoEfectivoPendiente > 0 && (
          <button
            type="button"
            onClick={() => onConfirmarRendicion(selectedConductor.idConductor, selectedConductor.nombreConductor)}
            disabled={isPendingConfirmacion}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <DollarSign size={16} />
            Liquidar Efectivo (S/ {selectedConductor.montoEfectivoPendiente.toFixed(2)})
          </button>
        )}
        <button
          type="button"
          onClick={onVolver}
          className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
        >
          ← Volver a Resumen
        </button>
      </div>
    </div>
  );
};
