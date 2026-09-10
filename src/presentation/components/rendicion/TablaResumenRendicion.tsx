import React, { useState } from 'react';
import type { ILiquidacionResumen } from '../../../domain/models/ILiquidacionResumen';
import {
  DollarSign,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Search,
  Bike,
  Eye,
  Wallet,
  Building2,
  Percent,
  Coins,
  Phone,
  Copy,
  Check
} from 'lucide-react';

interface Props {
  resumenList: ILiquidacionResumen[] | undefined;
  isLoading: boolean;
  filteredResumen: ILiquidacionResumen[];
  searchTerm: string;
  onChangeSearchTerm: (term: string) => void;
  totalesGlobales: {
    efectivoPendiente: number;
    efectivoRendido: number;
    yapeDigital: number;
    transferencia: number;
    totalGeneral: number;
  };
  onSelectConductor: (item: ILiquidacionResumen) => void;
  onConfirmarRendicion: (idConductor: number, nombreConductor: string) => void;
  isPendingConfirmacion: boolean;
}

export const TablaResumenRendicion: React.FC<Props> = ({
  resumenList,
  isLoading,
  filteredResumen,
  searchTerm,
  onChangeSearchTerm,
  totalesGlobales,
  onSelectConductor,
  onConfirmarRendicion,
  isPendingConfirmacion,
}) => {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  // Calculamos la suma global de 70% pago a motorizados y 30% comisión agencia
  const totalPagoMotorizados70 = (filteredResumen || []).reduce((acc, item) => acc + (item.montoPagoMotorizado || 0), 0);
  const totalGananciaAgencia30 = (filteredResumen || []).reduce((acc, item) => acc + (item.montoGananciaAgencia || 0), 0);

  return (
    <div className="space-y-6">
      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Efectivo Pendiente */}
        <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold shrink-0">
            <DollarSign size={22} />
          </div>
          <div>
            <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
              Efectivo en Campo
            </span>
            <h3 className="text-lg font-mono font-extrabold text-amber-400">
              S/ {totalesGlobales.efectivoPendiente.toFixed(2)}
            </h3>
            <span className="text-[10px] text-slate-400 block">Cobrado por repartidores</span>
          </div>
        </div>

        {/* Pago a Motorizados (70%) */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold shrink-0">
            <Coins size={22} />
          </div>
          <div>
            <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">
              Pago Motorizados (70%)
            </span>
            <h3 className="text-lg font-mono font-extrabold text-emerald-400">
              S/ {totalPagoMotorizados70.toFixed(2)}
            </h3>
            <span className="text-[10px] text-slate-400 block">Suma de 70% por entregas</span>
          </div>
        </div>

        {/* Ganancia Agencia (30%) */}
        <div className="bg-cyan-950/20 border border-cyan-500/30 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-bold shrink-0">
            <Percent size={22} />
          </div>
          <div>
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">
              Comisión Agencia (30%)
            </span>
            <h3 className="text-lg font-mono font-extrabold text-cyan-400">
              S/ {totalGananciaAgencia30.toFixed(2)}
            </h3>
            <span className="text-[10px] text-slate-400 block">Suma de 30% por entregas</span>
          </div>
        </div>

        {/* Total Yape Digital */}
        <div className="bg-purple-950/20 border border-purple-500/30 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/40 flex items-center justify-center font-bold shrink-0">
            <QrCode size={22} />
          </div>
          <div>
            <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">
              Cobrado Yape / Plin
            </span>
            <h3 className="text-lg font-mono font-extrabold text-purple-400">
              S/ {totalesGlobales.yapeDigital.toFixed(2)}
            </h3>
            <span className="text-[10px] text-slate-400 block">Transferencias digitales</span>
          </div>
        </div>

        {/* Total General */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-slate-800 text-white border border-slate-700 flex items-center justify-center font-bold shrink-0">
            <Building2 size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider block">
              Total Recaudación
            </span>
            <h3 className="text-lg font-mono font-extrabold text-white">
              S/ {totalesGlobales.totalGeneral.toFixed(2)}
            </h3>
            <span className="text-[10px] text-slate-400 block">Efectivo + Yape recaudados</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onChangeSearchTerm(e.target.value)}
            placeholder="Buscar por motorizado..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-medium transition-all"
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="py-20 text-center text-slate-400 text-xs">Cargando arqueo de liquidaciones...</div>
      )}

      {/* Empty State */}
      {!isLoading && filteredResumen.length === 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs space-y-2">
          <Bike className="mx-auto text-slate-600 opacity-60" size={40} />
          <p className="font-semibold text-white">No se encontraron liquidaciones de motorizados para este filtro.</p>
        </div>
      )}

      {/* Table */}
      {!isLoading && filteredResumen.length > 0 && (
        <div className="overflow-x-auto bg-slate-900/40 border border-slate-900 rounded-3xl shadow-xl">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/80">
                <th className="py-2.5 px-3">Motorizado</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Entregas</th>
                <th className="py-2.5 px-2 text-right text-amber-400 whitespace-nowrap">Efectivo</th>
                <th className="py-2.5 px-2 text-right text-emerald-400 whitespace-nowrap">Pago Chofer (70%)</th>
                <th className="py-2.5 px-2 text-right text-cyan-400 whitespace-nowrap">Agencia (30%)</th>
                <th className="py-2.5 px-2 text-right text-purple-400 whitespace-nowrap">Yape / Plin</th>
                <th className="py-2.5 px-2 text-right text-yellow-300 font-extrabold whitespace-nowrap">Saldo Neto</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Estado</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredResumen.map((item) => {
                const tienePendiente = item.montoEfectivoPendiente > 0;
                const pagoMotorizado = item.montoPagoMotorizado || 0;
                const gananciaAgencia = item.montoGananciaAgencia || 0;
                const saldoNeto = item.saldoNetoRendir ?? (item.montoEfectivoPendiente - pagoMotorizado);

                return (
                  <tr
                    key={`liquidation_row_${item.idConductor}`}
                    className={`transition-colors hover:bg-slate-900/80 ${
                      tienePendiente ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    {/* Driver details */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 shrink-0">
                          <Bike size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-white block text-xs leading-snug">
                            {item.nombreConductor}
                          </span>
                          {item.telefonoConductor && (
                            <button
                              type="button"
                              onClick={(e) => handleCopyPhone(item.telefonoConductor!, e)}
                              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer group mt-0.5"
                              title="Clic para copiar celular"
                            >
                              <Phone size={10} className="text-emerald-400 shrink-0" />
                              <span className="font-medium group-hover:underline">{item.telefonoConductor}</span>
                              {copiedPhone === item.telefonoConductor ? (
                                <Check size={11} className="text-emerald-400 shrink-0" />
                              ) : (
                                <Copy size={10} className="opacity-0 group-hover:opacity-100 text-cyan-400 shrink-0 transition-opacity" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Deliveries Count & Breakdown */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <span className="text-emerald-400 font-bold text-xs block">{item.totalPedidosEntregados} entregados</span>
                      <span className="text-[10px] text-slate-500 block">
                        Total: {item.totalPedidosAsignados || (item.totalPedidosEntregados + item.totalPedidosNoEntregados)} paq.
                      </span>
                    </td>

                    {/* Cash Pending */}
                    <td className="py-2.5 px-2 text-right font-mono font-extrabold text-xs text-amber-400 whitespace-nowrap">
                      S/ {item.montoEfectivoPendiente.toFixed(2)}
                    </td>

                    {/* Pago al Motorizado (70%) */}
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-xs text-emerald-400 whitespace-nowrap">
                      S/ {pagoMotorizado.toFixed(2)}
                    </td>

                    {/* Ganancia Agencia (30%) */}
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-xs text-cyan-400 whitespace-nowrap">
                      S/ {gananciaAgencia.toFixed(2)}
                    </td>

                    {/* Yape Digital */}
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-xs text-purple-400 whitespace-nowrap">
                      S/ {item.montoYapeDigital.toFixed(2)}
                    </td>

                    {/* Saldo Neto a Rendir */}
                    <td className="py-2.5 px-2 text-right font-mono font-extrabold text-xs text-yellow-300 bg-yellow-500/5 whitespace-nowrap">
                      S/ {saldoNeto.toFixed(2)}
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      {tienePendiente ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold inline-flex items-center gap-1">
                          <AlertCircle size={11} /> Pendiente
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold inline-flex items-center gap-1">
                          <CheckCircle2 size={11} /> Liquidado
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Full Page Detail View Button */}
                        <button
                          onClick={() => onSelectConductor(item)}
                          className="px-2.5 py-1 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Ver desglose completo"
                        >
                          <Eye size={13} />
                          <span>Desglose</span>
                        </button>

                        {/* Confirm Cash Received Button */}
                        {tienePendiente && (
                          <button
                            onClick={() => onConfirmarRendicion(item.idConductor, item.nombreConductor)}
                            disabled={isPendingConfirmacion}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-sm shadow-emerald-600/30 active:scale-95"
                            title="Confirmar recepción física de dinero"
                          >
                            <Wallet size={13} />
                            <span>Liquidar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
