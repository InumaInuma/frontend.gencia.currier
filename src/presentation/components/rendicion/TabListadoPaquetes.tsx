import React from 'react';
import type { ILiquidacionDetalle } from '../../../domain/models/ILiquidacionDetalle';
import { getEstadoBadgeConfig } from '../../../infrastructure/utils/estadoStyles';
import { Receipt, Clock, MapPin } from 'lucide-react';

interface Props {
  detalleList: ILiquidacionDetalle[] | undefined;
  isLoadingDetalle: boolean;
}

export const TabListadoPaquetes: React.FC<Props> = ({ detalleList, isLoadingDetalle }) => {
  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-900">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt size={18} className="text-violet-400" />
            Listado Detallado de Paquetes Asignados
          </h3>
          <p className="text-xs text-slate-400">
            Muestra todos los paquetes que el repartidor tuvo que entregar, dividiendo la tarifa de envío (70% Chofer / 30% Agencia).
          </p>
        </div>

        <span className="text-xs text-slate-400 font-semibold bg-slate-950 px-3 py-1 rounded-xl border border-slate-900">
          Mostrando <strong className="text-white">{detalleList?.length || 0}</strong> pedidos
        </span>
      </div>

      {/* Loading state */}
      {isLoadingDetalle && (
        <div className="py-16 text-center text-slate-400 text-xs">Cargando desglose de paquetes...</div>
      )}

      {/* Empty State */}
      {!isLoadingDetalle && (!detalleList || detalleList.length === 0) && (
        <div className="py-16 text-center text-slate-400 text-xs space-y-2">
          <Clock className="mx-auto text-slate-500" size={36} />
          <p className="font-semibold">No se registraron asignaciones para este motorizado en las fechas seleccionadas.</p>
        </div>
      )}

      {/* Full Package Table & Mobile Cards */}
      {!isLoadingDetalle && detalleList && detalleList.length > 0 && (
        <>
          {/* DESKTOP VIEW TABLE (visible on md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/80">
                  <th className="p-3">Comercio</th>
                  <th className="p-3">Cliente Destinatario</th>
                  <th className="p-3 text-center">Estado Pedido</th>
                  <th className="p-3 text-center">Pago Delivery</th>
                  <th className="p-3 text-right">Tarifa Delivery</th>
                  <th className="p-3 text-right text-emerald-400">70% Chofer</th>
                  <th className="p-3 text-right text-cyan-400">30% Agencia</th>
                  <th className="p-3 text-right">Cobrado Cliente</th>
                  <th className="p-3 text-right text-amber-400">Efectivo</th>
                  <th className="p-3 text-right text-purple-400">Yape/Plin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {detalleList.map((det) => {
                  const tarifa = det.tarifaEnvio || 0;
                  const isEntregado = det.idEstadosPedido === 11;
                  const pagoChofer = det.pagoMotorizado ?? (isEntregado ? tarifa * 0.70 : 0);
                  const gananciaAgencia = det.gananciaAgencia ?? (isEntregado ? tarifa * 0.30 : 0);

                  return (
                    <tr key={`det_full_row_${det.idPedido}`} className="hover:bg-slate-950/60 transition-colors">
                      {/* Commerce */}
                      <td className="p-3 font-bold text-white">
                        {det.nombreComercial}
                      </td>

                      {/* Customer */}
                      <td className="p-3">
                        <span className="font-bold text-slate-200 block">{det.nombreDestinatario}</span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin size={11} className="text-slate-500 shrink-0" />
                          <span>{det.distritoNombre} — {det.direccionDestinatario}</span>
                        </div>
                      </td>

                      {/* Final Status */}
                      <td className="p-3 text-center">
                        {(() => {
                          const badge = getEstadoBadgeConfig(det.idEstadosPedido, det.estadoPedido);
                          return (
                            <span className={`px-2.5 py-1 rounded-full text-[11px] inline-flex items-center gap-1 ${badge.className}`}>
                              {badge.label}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Responsabilidad del Envío */}
                      <td className="p-3 text-center">
                        {det.destinatarioPagaEnvio === false ? (
                          <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                            🔵 Comercio Asume
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                            🟢 Cliente Paga
                          </span>
                        )}
                      </td>

                      {/* Tarifa Delivery */}
                      <td className="p-3 text-right font-mono text-slate-300 font-semibold">
                        S/ {tarifa.toFixed(2)}
                      </td>

                      {/* 70% Chofer */}
                      <td className="p-3 text-right font-mono font-bold text-emerald-400">
                        S/ {pagoChofer.toFixed(2)}
                      </td>

                      {/* 30% Agencia */}
                      <td className="p-3 text-right font-mono font-bold text-cyan-400">
                        S/ {gananciaAgencia.toFixed(2)}
                      </td>

                      {/* Total Amount Collected from Customer */}
                      <td className="p-3 text-right font-mono font-extrabold text-white">
                        S/ {(det.montoTotalPedido || det.montoCobrar || 0).toFixed(2)}
                      </td>

                      {/* Cash collected */}
                      <td className="p-3 text-right font-mono font-bold text-amber-400">
                        {det.montoEfectivo > 0 ? `S/ ${det.montoEfectivo.toFixed(2)}` : '-'}
                      </td>

                      {/* Yape/Plin collected */}
                      <td className="p-3 text-right font-mono font-bold text-purple-400">
                        {det.montoYape > 0 ? `S/ ${det.montoYape.toFixed(2)}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW: TOUCH CARDS FOR SETTLEMENT DETAIL (visible on mobile, hidden on md+) */}
          <div className="block md:hidden space-y-4">
            {detalleList.map((det) => {
              const tarifa = det.tarifaEnvio || 0;
              const isEntregado = det.idEstadosPedido === 11;
              const pagoChofer = det.pagoMotorizado ?? (isEntregado ? tarifa * 0.70 : 0);
              const gananciaAgencia = det.gananciaAgencia ?? (isEntregado ? tarifa * 0.30 : 0);

              return (
                <div
                  key={`det_card_mobile_${det.idPedido}`}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md"
                >
                  {/* Card Header: Tracking & Status */}
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                    <span className="font-mono font-extrabold text-violet-300 text-xs">
                      {det.codigoSeguimiento}
                    </span>
                    {(() => {
                      const badge = getEstadoBadgeConfig(det.idEstadosPedido, det.estadoPedido);
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.className}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>

                  {/* Body Info */}
                  <div className="space-y-1.5 text-xs">
                    <div className="font-bold text-white text-sm">{det.nombreComercial}</div>
                    <div className="text-slate-300 font-semibold">{det.nombreDestinatario} ({det.distritoNombre})</div>
                    <p className="text-slate-500 text-[11px]">{det.direccionDestinatario}</p>

                    <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Tarifa Delivery</span>
                        <span className="font-bold text-white">S/ {tarifa.toFixed(2)}</span>
                      </div>
                      <div className="bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/30">
                        <span className="text-emerald-300 block text-[10px]">70% Motorizado</span>
                        <span className="font-bold text-emerald-400">S/ {pagoChofer.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs font-mono">
                    <div className="text-amber-400 font-bold">
                      Efectivo: S/ {det.montoEfectivo.toFixed(2)}
                    </div>
                    <div className="text-purple-400 font-bold">
                      Yape: S/ {det.montoYape.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
