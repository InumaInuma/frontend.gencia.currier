import React from 'react';
import { Package, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  resumenDetalle: {
    totalAsignados: number;
    entregados: number;
    noEntregados: number;
    efectivo: number;
    yape: number;
    transferencia: number;
    total: number;
  };
}

export const DriverMetricsGrid: React.FC<Props> = ({ resumenDetalle }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Total Paquetes Asignados */}
      <div className="bg-slate-900/40 border border-slate-800 p-3.5 rounded-2xl text-center">
        <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">Paquetes Asignados</span>
        <div className="text-xl font-bold text-white flex items-center justify-center gap-1">
          <Package size={18} className="text-slate-400" />
          {resumenDetalle.totalAsignados}
        </div>
      </div>

      {/* Entregados */}
      <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-2xl text-center">
        <span className="text-[10px] text-emerald-300 uppercase font-semibold block mb-1">Entregados</span>
        <div className="text-xl font-bold text-emerald-400 flex items-center justify-center gap-1">
          <CheckCircle2 size={18} />
          {resumenDetalle.entregados}
        </div>
      </div>

      {/* No Entregados */}
      <div className="bg-red-950/20 border border-red-500/30 p-3.5 rounded-2xl text-center">
        <span className="text-[10px] text-red-300 uppercase font-semibold block mb-1">No Entregados</span>
        <div className="text-xl font-bold text-red-400 flex items-center justify-center gap-1">
          <XCircle size={18} />
          {resumenDetalle.noEntregados}
        </div>
      </div>

      {/* Efectivo Recaudado */}
      <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-2xl text-center">
        <span className="text-[10px] text-amber-300 uppercase font-semibold block mb-1">Efectivo Recaudado</span>
        <div className="text-lg font-mono font-extrabold text-amber-400">
          S/ {resumenDetalle.efectivo.toFixed(2)}
        </div>
      </div>

      {/* Yape / Plin */}
      <div className="bg-purple-950/20 border border-purple-500/30 p-3.5 rounded-2xl text-center">
        <span className="text-[10px] text-purple-300 uppercase font-semibold block mb-1">Yape / Plin</span>
        <div className="text-lg font-mono font-extrabold text-purple-400">
          S/ {resumenDetalle.yape.toFixed(2)}
        </div>
      </div>

      {/* Total Cobrado */}
      <div className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-2xl text-center">
        <span className="text-[10px] text-cyan-300 uppercase font-semibold block mb-1">Total Cobrado</span>
        <div className="text-lg font-mono font-extrabold text-white">
          S/ {resumenDetalle.total.toFixed(2)}
        </div>
      </div>
    </div>
  );
};
