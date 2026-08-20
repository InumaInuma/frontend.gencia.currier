import React from 'react';
import { Bike } from 'lucide-react';
import type { IConductor } from '../../../domain/models/IConductor';

interface Props {
  selectedPedidoIds: number[];
  selectedDriver: IConductor | undefined;
  selectedDriverId: number | null;
  isPending: boolean;
  onAsignarRuta: () => void;
}

export const BarraAsignarRecojoFlotante: React.FC<Props> = ({
  selectedPedidoIds,
  selectedDriver,
  selectedDriverId,
  isPending,
  onAsignarRuta,
}) => {
  if (selectedPedidoIds.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 p-4 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-300 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="font-bold text-white text-sm">
              {selectedPedidoIds.length}{' '}
              {selectedPedidoIds.length === 1 ? 'Paquete Seleccionado' : 'Paquetes Seleccionados'}
            </span>
            <p className="text-cyan-400 font-semibold">
              {selectedDriver
                ? `Asignando ruta de recojo a: ${selectedDriver.nombreCompleto}`
                : 'Por favor, selecciona un motorizado arriba para asignar.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAsignarRuta}
          disabled={!selectedDriverId || selectedPedidoIds.length === 0 || isPending}
          className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-violet-500/25 active:scale-95"
        >
          <Bike size={18} />
          Asignar Ruta de Recojo ({selectedPedidoIds.length})
        </button>
      </div>
    </div>
  );
};
