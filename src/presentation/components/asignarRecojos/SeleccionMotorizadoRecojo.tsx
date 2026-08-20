import React from 'react';
import { Bike } from 'lucide-react';
import type { IConductor } from '../../../domain/models/IConductor';

interface Props {
  conductores: IConductor[] | undefined;
  loadingConductores: boolean;
  selectedDriverId: number | null;
  handleToggleDriver: (driverId: number) => void;
  selectedDriverName?: string;
}

export const SeleccionMotorizadoRecojo: React.FC<Props> = ({
  conductores,
  loadingConductores,
  selectedDriverId,
  handleToggleDriver,
  selectedDriverName,
}) => {
  return (
    <div className="bg-slate-900/40 border border-slate-900 p-5 rounded-2xl space-y-3 shadow-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Bike className="text-cyan-400" size={18} />
          Paso 1: Selecciona el Motorizado para la Ruta de Recojo
        </h3>
        {selectedDriverName && (
          <span className="text-xs text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full">
            Seleccionado: {selectedDriverName}
          </span>
        )}
      </div>

      {loadingConductores && (
        <div className="text-xs text-slate-400 py-4 text-center">Cargando motorizados disponibles...</div>
      )}

      {!loadingConductores && (!conductores || conductores.length === 0) && (
        <div className="text-xs text-slate-400 py-4 text-center bg-slate-950 rounded-xl">
          No hay motorizados registrados o disponibles en este momento.
        </div>
      )}

      {!loadingConductores && conductores && conductores.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {conductores.map((driver) => {
            const isSelected = selectedDriverId === driver.idConductor;
            return (
              <div
                key={`driver_recojo_select_${driver.idConductor}`}
                onClick={() => handleToggleDriver(driver.idConductor)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-cyan-400 border border-slate-800'
                    }`}
                  >
                    <Bike size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">{driver.nombreCompleto}</h4>
                    <span className="text-[11px] text-slate-400">
                      {driver.placaVehiculo} ({driver.tipoVehiculo})
                    </span>
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
