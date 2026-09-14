import React from 'react';
import { X, Wallet, CheckCircle2, AlertTriangle, Bike, Coins, Percent, DollarSign, Loader2 } from 'lucide-react';
import type { ILiquidacionResumen } from '../../../domain/models/ILiquidacionResumen';

interface Props {
  conductor: ILiquidacionResumen | null;
  onClose: () => void;
  onConfirmar: () => void;
  isPending: boolean;
}

export const ModalConfirmarLiquidacion: React.FC<Props> = ({
  conductor,
  onClose,
  onConfirmar,
  isPending,
}) => {
  if (!conductor) return null;

  const pagoMotorizado = conductor.montoPagoMotorizado ?? 0;
  const gananciaAgencia = conductor.montoGananciaAgencia ?? 0;
  const saldoNeto = conductor.saldoNetoRendir ?? (conductor.montoEfectivoPendiente - pagoMotorizado);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50 cursor-pointer transition-colors disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Wallet size={22} />
          </div>
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
              Arqueo de Caja & Liquidación
            </span>
            <h3 className="text-base font-extrabold text-white mt-0.5">
              Recepción Física de Efectivo
            </h3>
          </div>
        </div>

        {/* Motorizado Details Card */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bike size={16} className="text-purple-400" />
              <span className="font-bold text-white text-sm">{conductor.nombreConductor}</span>
            </div>
            {conductor.telefonoConductor && (
              <span className="text-[11px] font-mono text-slate-400 font-semibold">
                {conductor.telefonoConductor}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
            <span>
              Vehículo:{' '}
              <strong className="text-slate-300">
                {conductor.tipoVehiculo || 'Moto'} • {conductor.placaVehiculo || 'S/P'}
              </strong>
            </span>
            <span>
              Entregas:{' '}
              <strong className="text-emerald-400 font-mono">
                {conductor.totalPedidosEntregados} paquetes
              </strong>
            </span>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Desglose Financiero a Liquidar
          </span>

          {/* Efectivo Recaudado */}
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <Coins size={14} className="text-amber-400" />
              Efectivo cobrado en campo:
            </span>
            <span className="font-mono font-bold text-amber-300 text-sm">
              S/ {conductor.montoEfectivoPendiente.toFixed(2)}
            </span>
          </div>

          {/* Pago al Chofer 70% */}
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-400" />
              Pago Motorizado (70%):
            </span>
            <span className="font-mono font-bold text-emerald-400">
              - S/ {pagoMotorizado.toFixed(2)}
            </span>
          </div>

          {/* Ganancia Agencia 30% */}
          <div className="flex justify-between items-center text-slate-300">
            <span className="flex items-center gap-1.5">
              <Percent size={14} className="text-cyan-400" />
              Comisión Agencia (30%):
            </span>
            <span className="font-mono font-bold text-cyan-300">
              S/ {gananciaAgencia.toFixed(2)}
            </span>
          </div>

          {/* Saldo Neto a Rendir */}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <div>
              <span className="text-xs font-extrabold text-white block">
                Saldo Neto a Rendir en Caja:
              </span>
              <span className="text-[10px] text-slate-400">
                (Efectivo en campo - Tarifa chofer)
              </span>
            </div>
            <span className="font-mono text-base font-extrabold text-yellow-300 bg-yellow-500/10 px-2.5 py-1 rounded-xl border border-yellow-500/30">
              S/ {saldoNeto.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Confirmation Question / Warning */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-200">
          <AlertTriangle size={17} className="text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            ¿Confirmas que el motorizado ha entregado físicamente todo el efectivo recaudado en almacén? Los cobros quedarán registrados como <strong>Rendidos</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="w-full py-3 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={isPending}
            className="w-full py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Liquidando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>Confirmar Liquidación</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
