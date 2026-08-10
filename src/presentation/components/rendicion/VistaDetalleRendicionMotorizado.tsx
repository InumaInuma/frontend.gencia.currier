import React from 'react';
import type { ILiquidacionResumen } from '../../../domain/models/ILiquidacionResumen';
import type { ILiquidacionDetalle } from '../../../domain/models/ILiquidacionDetalle';
import {
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Bike,
  Receipt,
  XCircle,
  Clock,
  Package,
  Phone,
  MapPin
} from 'lucide-react';

interface Props {
  selectedConductor: ILiquidacionResumen;
  detalleList: ILiquidacionDetalle[] | undefined;
  isLoadingDetalle: boolean;
  resumenDetalle: {
    totalAsignados: number;
    entregados: number;
    noEntregados: number;
    efectivo: number;
    yape: number;
    transferencia: number;
    total: number;
  };
  onVolver: () => void;
  onConfirmarRendicion: (idConductor: number, nombreConductor: string) => void;
  isPendingConfirmacion: boolean;
}

export const VistaDetalleRendicionMotorizado: React.FC<Props> = ({
  selectedConductor,
  detalleList,
  isLoadingDetalle,
  resumenDetalle,
  onVolver,
  onConfirmarRendicion,
  isPendingConfirmacion,
}) => {
  return (
    <div className="space-y-6">
      {/* Driver Header Card */}
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
              onClick={() => onConfirmarRendicion(selectedConductor.idConductor, selectedConductor.nombreConductor)}
              disabled={isPendingConfirmacion}
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <DollarSign size={16} />
              Liquidar Efectivo (S/ {selectedConductor.montoEfectivoPendiente.toFixed(2)})
            </button>
          )}
          <button
            onClick={onVolver}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
          >
            ← Volver a Resumen
          </button>
        </div>
      </div>

      {/* Metrics Grid of the Selected Driver */}
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

      {/* Granular Table of All Packages Assigned in Selected Date Range */}
      <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt size={18} className="text-violet-400" />
              Listado Detallado de Paquetes Asignados
            </h3>
            <p className="text-xs text-slate-400">
              Muestra todos los paquetes que el repartidor tuvo que entregar y el método de cobro registrado.
            </p>
          </div>

          <span className="text-xs text-slate-400 font-semibold bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
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

        {/* Full Package Table */}
        {!isLoadingDetalle && detalleList && detalleList.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/80">
                  <th className="p-3">Código Tracking</th>
                  <th className="p-3">Comercio Remitente</th>
                  <th className="p-3">Cliente Destinatario</th>
                  <th className="p-3 text-center">Estado del Pedido</th>
                  <th className="p-3 text-right">Monto Pedido</th>
                  <th className="p-3 text-right text-amber-400">Cobro Efectivo</th>
                  <th className="p-3 text-right text-purple-400">Cobro Yape/Plin</th>
                  <th className="p-3">Ref. Pago Yape</th>
                  <th className="p-3 text-center">Rendición Efectivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {detalleList.map((det) => {
                  const esEntregado = det.idEstadosPedido === 11;

                  return (
                    <tr key={`det_full_row_${det.idPedido}`} className="hover:bg-slate-950/60 transition-colors">
                      {/* Tracking Code */}
                      <td className="p-3">
                        <span className="font-mono font-extrabold text-violet-300 block text-xs">
                          {det.codigoSeguimiento}
                        </span>
                      </td>

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
                        {esEntregado ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold inline-flex items-center gap-1">
                            <CheckCircle2 size={12} /> Entregado
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold inline-flex items-center gap-1">
                            <AlertCircle size={12} /> {det.estadoPedido || 'No Entregado'}
                          </span>
                        )}
                      </td>

                      {/* Total Amount to Collect */}
                      <td className="p-3 text-right font-mono font-extrabold text-white">
                        S/ {(det.montoCobrar || det.montoTotalPedido || 0).toFixed(2)}
                      </td>

                      {/* Cash collected */}
                      <td className="p-3 text-right font-mono font-bold text-amber-400">
                        {det.montoEfectivo > 0 ? `S/ ${det.montoEfectivo.toFixed(2)}` : '-'}
                      </td>

                      {/* Yape/Plin collected */}
                      <td className="p-3 text-right font-mono font-bold text-purple-400">
                        {det.montoYape > 0 ? `S/ ${det.montoYape.toFixed(2)}` : '-'}
                      </td>

                      {/* Yape Reference */}
                      <td className="p-3 font-mono text-[11px] text-slate-300">
                        {det.referenciaYape || '-'}
                      </td>

                      {/* Cash Liquidation Status */}
                      <td className="p-3 text-center">
                        {det.montoEfectivo > 0 ? (
                          det.esRendido === 1 ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                              Liquidado
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                              Pendiente S/
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500 text-[11px]">N/A (Sin efectivo)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
