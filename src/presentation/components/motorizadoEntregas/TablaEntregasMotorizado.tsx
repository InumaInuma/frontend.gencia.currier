import React from 'react';
import { EstadoPedidoEnum } from '../../../domain/enums/EstadoPedidoEnum';
import type { IMonitoreoEntrega } from '../../../domain/models/IMonitoreoEntrega';
import {
  MessageCircle,
  Phone,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Bike,
  CalendarClock
} from 'lucide-react';

interface Props {
  filteredItems: IMonitoreoEntrega[];
  esRutaIniciada: boolean;
  isPending: boolean;
  onSetEnCaminoCliente: (item: IMonitoreoEntrega) => void;
  onSetA20MinutosCliente: (item: IMonitoreoEntrega) => void;
  onOpenConfirmModal: (item: IMonitoreoEntrega) => void;
  onOpenRescheduleModal: (item: IMonitoreoEntrega) => void;
  onOpenFailedModal: (item: IMonitoreoEntrega) => void;
  onOpenWhatsApp: (telefono: string, cliente: string, codigoSeguimiento: string) => void;
  onOpenCall: (telefono: string) => void;
}

export const TablaEntregasMotorizado: React.FC<Props> = ({
  filteredItems,
  esRutaIniciada,
  isPending,
  onSetEnCaminoCliente,
  onSetA20MinutosCliente,
  onOpenConfirmModal,
  onOpenRescheduleModal,
  onOpenFailedModal,
  onOpenWhatsApp,
  onOpenCall,
}) => {
  return (
    <>
      {/* DESKTOP VIEW TABLE (visible on md+) */}
      <div className="hidden md:block bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[950px]">
          <thead>
            <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/80">
              <th className="p-3.5 w-10 text-center">#</th>
              <th className="p-3.5">Código Envío</th>
              <th className="p-3.5">Comercio Remitente</th>
              <th className="p-3.5">Cliente / Contacto Directo</th>
              <th className="p-3.5">Dirección & Distrito</th>
              <th className="p-3.5 text-right">Cobro</th>
              <th className="p-3.5 text-center">Estado del Paquete</th>
              <th className="p-3.5 text-center">Acciones Fila (1 a 1)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {filteredItems.map((item, index) => {
              const isEntregado = item.idEstadosPedido === EstadoPedidoEnum.Entregado; // 11
              const isNoEntregado = item.idEstadosPedido === EstadoPedidoEnum.NoEntregado; // 12
              const isEnRuta = item.idEstadosPedido === EstadoPedidoEnum.EnRuta; // 9
              const isA5Min = item.idEstadosPedido === EstadoPedidoEnum.A5Minutos; // 10
              const isAsignado = item.idEstadosPedido === EstadoPedidoEnum.EntregaAsignada; // 8

              return (
                <tr
                  key={`delivery_table_row_${item.idPedido}`}
                  className={`transition-colors hover:bg-slate-900/80 ${
                    isEntregado
                      ? 'bg-emerald-950/10'
                      : isNoEntregado
                      ? 'bg-red-950/10'
                      : isA5Min
                      ? 'bg-amber-950/20'
                      : isEnRuta
                      ? 'bg-cyan-950/20'
                      : ''
                  }`}
                >
                  {/* Row Index */}
                  <td className="p-3.5 text-center font-bold text-slate-400">
                    {index + 1}
                  </td>

                  {/* Tracking Code */}
                  <td className="p-3.5 font-mono font-bold text-violet-300">
                    {item.codigoSeguimiento}
                  </td>

                  {/* Commerce */}
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{item.nombreComercial}</span>
                    <span className="text-[11px] text-slate-400 font-mono">RUC: {item.ruc}</span>
                  </td>

                  {/* Customer Contact */}
                  <td className="p-3.5">
                    <span className="font-bold text-white block text-sm">{item.nombreDestinatario}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp(item.telefonoDestinatario, item.nombreDestinatario, item.codigoSeguimiento)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                        title="Enviar WhatsApp"
                      >
                        <MessageCircle size={12} />
                        WA
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenCall(item.telefonoDestinatario)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                        title="Llamar al cliente"
                      >
                        <Phone size={12} />
                        {item.telefonoDestinatario}
                      </button>
                    </div>
                  </td>

                  {/* Address & District */}
                  <td className="p-3.5 max-w-xs">
                    <span className="font-bold text-cyan-300 block">📍 {item.distritoNombre}</span>
                    <span className="text-slate-200 font-medium truncate block">{item.direccionDestinatario}</span>
                    {item.referenciaDestinatario && (
                      <span className="text-[11px] text-slate-400 truncate block">Ref: {item.referenciaDestinatario}</span>
                    )}
                    {item.googleMapsUrl && (
                      <a
                        href={item.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 mt-0.5 hover:underline"
                      >
                        <ExternalLink size={10} /> Abrir GPS
                      </a>
                    )}
                  </td>

                  {/* Price Collect */}
                  <td className="p-3.5 text-right font-mono">
                    <div className="font-extrabold text-sm text-emerald-400">
                      Total: S/ {(item.montoCobrar + (item.destinatarioPagaEnvio ? (item.tarifaEnvio || 0) : 0)).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      Prod: S/ {item.montoCobrar.toFixed(2)} | Envío: S/ {(item.tarifaEnvio || 0).toFixed(2)}
                    </div>
                    <div className="text-[10px] font-bold mt-0.5 font-sans">
                      {item.destinatarioPagaEnvio ? (
                        <span className="text-emerald-400">🟢 Cliente paga envío</span>
                      ) : (
                        <span className="text-cyan-400">🔵 Comercio asume envío</span>
                      )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="p-3.5 text-center">
                    {isEntregado && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold inline-flex items-center gap-1">
                        <CheckCircle2 size={13} /> Entregado
                      </span>
                    )}
                    {isNoEntregado && (
                      <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-extrabold inline-flex items-center gap-1">
                        <XCircle size={13} /> No Entregado
                      </span>
                    )}
                    {isA5Min && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold inline-flex items-center gap-1 animate-pulse">
                        <Clock size={13} /> A 20 Minutos
                      </span>
                    )}
                    {isEnRuta && (
                      <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-extrabold inline-flex items-center gap-1 animate-pulse">
                        <Bike size={13} /> En Ruta a Cliente
                      </span>
                    )}
                    {isAsignado && (
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold">
                        Entrega Asignada
                      </span>
                    )}
                  </td>

                  {/* Per-Row Action Buttons */}
                  <td className="p-3.5 text-center">
                    {isEntregado || isNoEntregado ? (
                      <span className="text-[11px] text-slate-500 font-semibold italic">Finalizado</span>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Paso 1: En Camino */}
                        {isAsignado && (
                          <button
                            type="button"
                            onClick={() => onSetEnCaminoCliente(item)}
                            disabled={!esRutaIniciada || isPending}
                            title="Avisar a este cliente que vas en camino"
                            className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-all cursor-pointer shadow-md shadow-cyan-500/20 flex items-center gap-1 text-[11px]"
                          >
                            <Bike size={14} />
                            <span className="hidden xl:inline">En Camino</span>
                          </button>
                        )}

                        {/* Paso 2: A 20 Minutos */}
                        {isEnRuta && (
                          <button
                            type="button"
                            onClick={() => onSetA20MinutosCliente(item)}
                            disabled={!esRutaIniciada || isPending}
                            title="Notificar cliente a 20 minutos"
                            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition-all cursor-pointer shadow-md shadow-amber-500/20 flex items-center gap-1 text-[11px]"
                          >
                            <Clock size={14} />
                            <span className="hidden xl:inline">A 20 Min</span>
                          </button>
                        )}

                        {/* Paso 3: Entregar y Cobrar (Solo disponible tras notificar A 20 Min) */}
                        {isA5Min && (
                          <button
                            type="button"
                            onClick={() => onOpenConfirmModal(item)}
                            disabled={!esRutaIniciada}
                            title="Confirmar entrega realizada y cobrar"
                            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20 flex items-center gap-1 text-[11px] animate-pulse"
                          >
                            <CheckCircle2 size={14} />
                            <span className="hidden xl:inline">Entregar</span>
                          </button>
                        )}

                        {/* Reprogramar siempre disponible si no está finalizado */}
                        <button
                          type="button"
                          onClick={() => onOpenRescheduleModal(item)}
                          disabled={!esRutaIniciada}
                          title="Reprogramar entrega por solicitud del cliente"
                          className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-purple-300 border border-purple-500/40 font-bold transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                        >
                          <CalendarClock size={14} />
                          <span className="hidden xl:inline">Reprogramar</span>
                        </button>

                        {/* Intento Fallido siempre disponible si no está finalizado */}
                        <button
                          type="button"
                          onClick={() => onOpenFailedModal(item)}
                          disabled={!esRutaIniciada}
                          title="Marcar intento fallido / no entregado"
                          className="p-2 rounded-xl bg-slate-950 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed text-red-400 border border-slate-800 transition-all cursor-pointer flex items-center gap-1 text-[11px]"
                        >
                          <XCircle size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW: TOUCH CARDS FOR MOTORIZADO (visible on mobile, hidden on md+) */}
      <div className="block md:hidden space-y-4">
        {filteredItems.map((item, index) => {
          const isEntregado = item.idEstadosPedido === EstadoPedidoEnum.Entregado;
          const isNoEntregado = item.idEstadosPedido === EstadoPedidoEnum.NoEntregado;
          const isEnRuta = item.idEstadosPedido === EstadoPedidoEnum.EnRuta;
          const isA5Min = item.idEstadosPedido === EstadoPedidoEnum.A5Minutos;
          const isAsignado = item.idEstadosPedido === EstadoPedidoEnum.EntregaAsignada;
          const totalCobrarItem = item.montoCobrar + (item.destinatarioPagaEnvio ? (item.tarifaEnvio || 0) : 0);

          return (
            <div
              key={`delivery_card_mobile_${item.idPedido}`}
              className={`bg-slate-950 border rounded-2xl p-4 space-y-3 shadow-lg ${
                isEntregado
                  ? 'border-emerald-500/30 bg-emerald-950/10'
                  : isNoEntregado
                  ? 'border-red-500/30 bg-red-950/10'
                  : isA5Min
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : isEnRuta
                  ? 'border-cyan-500/40 bg-cyan-950/20'
                  : 'border-slate-800'
              }`}
            >
              {/* Card Header: Index, Code & Status */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-cyan-300 font-extrabold text-xs flex items-center justify-center">
                    #{index + 1}
                  </span>
                  <span className="font-mono font-extrabold text-violet-300 text-xs">
                    {item.codigoSeguimiento}
                  </span>
                </div>

                <div>
                  {isEntregado && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold">
                      ✓ Entregado
                    </span>
                  )}
                  {isNoEntregado && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-extrabold">
                      ✕ No Entregado
                    </span>
                  )}
                  {isA5Min && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold animate-pulse">
                      ⏱️ A 20 Minutos
                    </span>
                  )}
                  {isEnRuta && (
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-extrabold animate-pulse">
                      🏍️ En Ruta
                    </span>
                  )}
                  {isAsignado && (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold">
                      Asignado
                    </span>
                  )}
                </div>
              </div>

              {/* Commerce Info */}
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Remitente: <strong className="text-white">{item.nombreComercial}</strong></span>
                <span className="font-mono text-[10px]">RUC: {item.ruc}</span>
              </div>

              {/* Customer Info & Contact Buttons */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-900 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-white text-sm">{item.nombreDestinatario}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenWhatsApp(item.telefonoDestinatario, item.nombreDestinatario, item.codigoSeguimiento)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle size={12} /> WA
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenCall(item.telefonoDestinatario)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <Phone size={12} /> Llamar
                    </button>
                  </div>
                </div>

                <div>
                  <span className="font-bold text-cyan-300 block">📍 {item.distritoNombre}</span>
                  <span className="text-slate-300 block">{item.direccionDestinatario}</span>
                  {item.referenciaDestinatario && (
                    <span className="text-[11px] text-slate-400 block italic">Ref: {item.referenciaDestinatario}</span>
                  )}
                  {item.googleMapsUrl && (
                    <a
                      href={item.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 font-bold flex items-center gap-1 mt-1 hover:underline"
                    >
                      <ExternalLink size={12} /> Abrir GPS (Google Maps / Waze)
                    </a>
                  )}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-xl border border-slate-800 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">
                    Prod: S/ {item.montoCobrar.toFixed(2)} | Envío: S/ {(item.tarifaEnvio || 0).toFixed(2)}
                  </div>
                  <div className="text-[10px] font-bold">
                    {item.destinatarioPagaEnvio ? (
                      <span className="text-emerald-400">🟢 Cliente paga envío</span>
                    ) : (
                      <span className="text-cyan-400">🔵 Comercio asume envío</span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total a Cobrar</span>
                  <strong className="font-mono text-sm font-extrabold text-emerald-400">
                    S/ {totalCobrarItem.toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Card Action Buttons for Mobile */}
              {!isEntregado && !isNoEntregado && (
                <div className="pt-2 border-t border-slate-900 space-y-2">
                  <div className="grid grid-cols-1 gap-2">
                    {/* Paso 1: En Camino */}
                    {isAsignado && (
                      <button
                        type="button"
                        onClick={() => onSetEnCaminoCliente(item)}
                        disabled={!esRutaIniciada || isPending}
                        className="py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md w-full cursor-pointer"
                      >
                        <Bike size={14} /> En Camino
                      </button>
                    )}

                    {/* Paso 2: A 20 Min */}
                    {isEnRuta && (
                      <button
                        type="button"
                        onClick={() => onSetA20MinutosCliente(item)}
                        disabled={!esRutaIniciada || isPending}
                        className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md w-full cursor-pointer"
                      >
                        <Clock size={14} /> A 20 Min
                      </button>
                    )}

                    {/* Paso 3: Entregar y Cobrar (Solo disponible tras notificar A 20 Min) */}
                    {isA5Min && (
                      <button
                        type="button"
                        onClick={() => onOpenConfirmModal(item)}
                        disabled={!esRutaIniciada}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md w-full cursor-pointer animate-pulse"
                      >
                        <CheckCircle2 size={14} /> Entregar y Cobrar
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenRescheduleModal(item)}
                      disabled={!esRutaIniciada}
                      className="py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-40 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CalendarClock size={14} /> Reprogramar
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenFailedModal(item)}
                      disabled={!esRutaIniciada}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-red-500/20 disabled:opacity-40 text-red-400 border border-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle size={14} /> Intento Fallido
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
};
