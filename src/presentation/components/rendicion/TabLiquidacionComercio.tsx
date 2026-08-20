import React from 'react';
import type { ComercioLiquidacionSummary } from './rendicionUtils';
import { Store, DollarSign, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  resumenComercios: ComercioLiquidacionSummary[];
}

export const TabLiquidacionComercio: React.FC<Props> = ({ resumenComercios }) => {
  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-fade-in">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-900">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Store size={18} className="text-amber-400" />
            Reporte de Liquidación Financiera con Comercios (Cierre de Cuentas)
          </h3>
          <p className="text-xs text-slate-400">
            Fórmula: <strong>[Recaudado por Productos para Tienda]</strong> − <strong>[Envíos que el Comercio debe a la Agencia]</strong> = <strong>[Monto Neto a Transferir al Comercio]</strong>.
          </p>
        </div>

        <span className="text-xs text-slate-400 font-semibold bg-slate-950 px-3 py-1 rounded-xl border border-slate-900">
          <strong className="text-white">{resumenComercios.length}</strong> comercio(s)
        </span>
      </div>

      {resumenComercios.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-xs space-y-2">
          <Store className="mx-auto text-slate-500" size={36} />
          <p className="font-semibold">No se registraron comercios para las asignaciones en este rango de fechas.</p>
        </div>
      ) : (
        <>
          {/* DESKTOP FINANCIAL REPORT TABLE VIEW (visible on md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[1050px]">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/80">
                  <th className="p-3.5">Comercio Remitente</th>
                  <th className="p-3.5 text-center">Pedidos Entregados</th>
                  <th className="p-3.5 text-right text-slate-200">Total Costo Envíos</th>
                  <th className="p-3.5 text-right text-cyan-300">Envíos Pagados por Cliente</th>
                  <th className="p-3.5 text-right text-amber-300">Envíos a Pagar por Comercio</th>
                  <th className="p-3.5 text-right text-emerald-400">Dinero Productos Tienda</th>
                  <th className="p-3.5 text-right text-emerald-300">Monto Neto a Transferir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {resumenComercios.map((com) => {
                  return (
                    <tr key={`com_tab_row_${com.idComercio}`} className="hover:bg-slate-950/60 transition-colors">
                      {/* 1. Comercio */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <Store size={16} className="text-violet-400 shrink-0" />
                          <span className="font-extrabold text-white text-sm">{com.nombreComercial}</span>
                        </div>
                      </td>

                      {/* 2. Pedidos Entregados */}
                      <td className="p-3.5 text-center">
                        <span className="font-mono font-extrabold text-emerald-400 text-sm block">
                          {com.entregados} / {com.totalPedidos}
                        </span>
                        {com.reprogramados + com.cancelados > 0 && (
                          <span className="text-[10px] text-amber-400 font-bold block">
                            ({com.reprogramados + com.cancelados} no entregados)
                          </span>
                        )}
                      </td>

                      {/* 3. Total Costo Envíos (ej: 5 envíos de S/ 9 = S/ 45) */}
                      <td className="p-3.5 text-right font-mono font-bold text-slate-200 text-sm">
                        S/ {com.totalCostoEnvios.toFixed(2)}
                      </td>

                      {/* 4. Envíos Pagados por Cliente (ej: 3 envíos = S/ 27) */}
                      <td className="p-3.5 text-right font-mono">
                        <strong className="text-cyan-300 font-extrabold text-sm block">
                          S/ {com.enviosPagadosPorCliente.toFixed(2)}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-sans block">
                          (Cobrados en destino)
                        </span>
                      </td>

                      {/* 5. Envíos a Pagar por Comercio (ej: 2 envíos = S/ 18) */}
                      <td className="p-3.5 text-right font-mono">
                        <strong className="text-amber-300 font-extrabold text-sm block">
                          S/ {com.enviosACobrarComercio.toFixed(2)}
                        </strong>
                        <span className="text-[10px] text-amber-400/80 font-sans block">
                          (Descuento por delivery)
                        </span>
                      </td>

                      {/* 6. Dinero Recaudado por Productos para la Tienda (ej. S/ 150.00) */}
                      <td className="p-3.5 text-right font-mono">
                        <strong className="text-emerald-400 font-extrabold text-sm block">
                          S/ {com.cobradoProductos.toFixed(2)}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-sans block">
                          (Cobrado por productos)
                        </span>
                      </td>

                      {/* 7. Monto Neto a Transferir al Comercio (ej: 150 - 18 = S/ 132.00) */}
                      <td className="p-3.5 text-right font-mono">
                        <span
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-sm inline-block border shadow-md ${
                            com.balanceNetoComercio >= 0
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-red-500/20 text-red-300 border-red-500/40'
                          }`}
                        >
                          S/ {com.balanceNetoComercio.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW FINANCIAL REPORT CARDS (visible on mobile, hidden on md+) */}
          <div className="block md:hidden space-y-4">
            {resumenComercios.map((com) => (
              <div
                key={`com_tab_card_${com.idComercio}`}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
              >
                {/* Mobile Card Header */}
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-2">
                    <Store size={16} className="text-violet-400" />
                    <span className="font-extrabold text-white text-sm">{com.nombreComercial}</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/30 font-bold">
                    {com.entregados} de {com.totalPedidos} entregados
                  </span>
                </div>

                {/* Mobile Financial Breakdown Rows */}
                <div className="space-y-2 text-xs">
                  {/* Row 1: Total Costo Envíos */}
                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-900">
                    <span className="text-slate-300 font-medium">Total Costo de Envíos:</span>
                    <strong className="font-mono text-slate-100 text-sm">
                      S/ {com.totalCostoEnvios.toFixed(2)}
                    </strong>
                  </div>

                  {/* Row 2: Envíos Pagados por Cliente */}
                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-900">
                    <span className="text-cyan-300 font-medium flex items-center gap-1">
                      <CheckCircle2 size={13} /> Envíos Pagados por Cliente:
                    </span>
                    <strong className="font-mono text-cyan-300 text-sm">
                      S/ {com.enviosPagadosPorCliente.toFixed(2)}
                    </strong>
                  </div>

                  {/* Row 3: Envíos a Pagar por Comercio */}
                  <div className="flex justify-between items-center bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
                    <span className="text-amber-300 font-bold flex items-center gap-1">
                      <AlertCircle size={13} /> Envíos a Pagar por Comercio:
                    </span>
                    <strong className="font-mono text-amber-400 text-sm">
                      S/ {com.enviosACobrarComercio.toFixed(2)}
                    </strong>
                  </div>

                  {/* Row 4: Dinero Productos Tienda */}
                  <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-900">
                    <span className="text-slate-300 font-medium">Dinero Productos Tienda:</span>
                    <strong className="font-mono text-emerald-400 text-sm">
                      S/ {com.cobradoProductos.toFixed(2)}
                    </strong>
                  </div>

                  {/* Row 5: Monto Neto a Transferir */}
                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between mt-2">
                    <span className="text-xs font-extrabold text-slate-200">Monto Neto a Transferir:</span>
                    <span
                      className={`font-mono font-extrabold text-base ${
                        com.balanceNetoComercio >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      S/ {com.balanceNetoComercio.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
