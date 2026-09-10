import React, { useState } from 'react';
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
  CalendarClock,
  Copy,
  Check,
  MapPin,
  Package,
  Store,
  Navigation,
  LayoutGrid,
  List
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
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [vistaModo, setVistaModo] = useState<'tarjetas' | 'tabla'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 ? 'tabla' : 'tarjetas';
    }
    return 'tabla';
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Switcher de Vistas (Visible en pantallas medianas / PC) */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400 font-medium">
          Total de paquetes en ruta:{' '}
          <strong className="text-white font-bold">{filteredItems.length}</strong>
        </div>

        <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => setVistaModo('tarjetas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              vistaModo === 'tarjetas'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={13} />
            <span>Tarjetas</span>
          </button>
          <button
            type="button"
            onClick={() => setVistaModo('tabla')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              vistaModo === 'tabla'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List size={13} />
            <span>Tabla</span>
          </button>
        </div>
      </div>

      {/* ── MODO 1: TARJETAS RESPONSIVAS CON UX OPTIMIZADA PARA MOTORIZADOS ── */}
      {(vistaModo === 'tarjetas' || window.innerWidth < 640) && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item, index) => {
            const isEntregado = item.idEstadosPedido === EstadoPedidoEnum.Entregado;
            const isNoEntregado = item.idEstadosPedido === EstadoPedidoEnum.NoEntregado;
            const isEnRuta = item.idEstadosPedido === EstadoPedidoEnum.EnRuta;
            const isA5Min = item.idEstadosPedido === EstadoPedidoEnum.A5Minutos;
            const isAsignado = item.idEstadosPedido === EstadoPedidoEnum.EntregaAsignada;
            const totalCobrarItem = item.montoCobrar + (item.destinatarioPagaEnvio ? (item.tarifaEnvio || 0) : 0);

            return (
              <div
                key={`delivery_card_${item.idPedido}`}
                className={`bg-slate-900/50 border rounded-2xl p-4 flex flex-col justify-between space-y-3.5 shadow-xl transition-all hover:border-slate-700 ${
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
                {/* 1. Encabezado de la Tarjeta: #, Código y Estado */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-300 font-black text-xs flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div className="flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg shrink-0">
                      <span className="font-mono font-bold text-violet-300 text-xs">
                        {item.codigoSeguimiento}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(item.codigoSeguimiento)}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer p-0.5 ml-1"
                        title="Copiar código de seguimiento"
                      >
                        {copiedCode === item.codigoSeguimiento ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isEntregado && (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-extrabold flex items-center gap-1 whitespace-nowrap">
                        <CheckCircle2 size={11} /> Entregado
                      </span>
                    )}
                    {isNoEntregado && (
                      <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-extrabold flex items-center gap-1 whitespace-nowrap">
                        <XCircle size={11} /> No Entregado
                      </span>
                    )}
                    {isA5Min && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-extrabold animate-pulse flex items-center gap-1 whitespace-nowrap">
                        <Clock size={11} /> A 20 Min
                      </span>
                    )}
                    {isEnRuta && (
                      <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-extrabold animate-pulse flex items-center gap-1 whitespace-nowrap">
                        <Bike size={11} /> En Ruta
                      </span>
                    )}
                    {isAsignado && (
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-bold whitespace-nowrap">
                        Asignado
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Destinatario & Botones Directos de Contacto */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Cliente / Destinatario
                      </span>
                      <h4 className="font-extrabold text-white text-base truncate leading-tight mt-0.5">
                        {item.nombreDestinatario}
                      </h4>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                        <Phone size={11} className="text-slate-500 shrink-0" />
                        {item.telefonoDestinatario}
                      </span>
                    </div>

                    {/* Acciones Rápidas Táctiles (WhatsApp + Llamar + GPS) */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp(item.telefonoDestinatario, item.nombreDestinatario, item.codigoSeguimiento)}
                        className="w-10 h-10 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                        title="Enviar WhatsApp con mensaje prediseñado"
                      >
                        <MessageCircle size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenCall(item.telefonoDestinatario)}
                        className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                        title={`Llamar al ${item.telefonoDestinatario}`}
                      >
                        <Phone size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Dirección de Destino & GPS */}
                  <div className="p-2.5 bg-slate-900/70 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-cyan-300 text-xs flex items-center gap-1">
                          <MapPin size={13} className="shrink-0 text-cyan-400" />
                          {item.distritoNombre}
                        </span>
                        <p className="text-slate-200 font-medium text-xs pl-4 leading-snug mt-0.5">
                          {item.direccionDestinatario}
                        </p>
                      </div>

                      {item.googleMapsUrl && (
                        <a
                          href={item.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-[10px] flex items-center gap-1 shrink-0 active:scale-95 transition-all shadow-sm"
                          title="Abrir GPS en Google Maps o Waze"
                        >
                          <Navigation size={11} />
                          <span>GPS</span>
                        </a>
                      )}
                    </div>

                    {item.referenciaDestinatario && (
                      <p className="text-[11px] text-amber-300/90 font-medium pl-4 bg-amber-500/5 p-1 rounded border border-amber-500/10">
                        <span className="font-bold text-amber-400">Ref:</span> {item.referenciaDestinatario}
                      </p>
                    )}
                  </div>

                  {/* Producto y Comercio Remitente */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {item.descripcionProducto && (
                      <div className="bg-violet-950/30 p-2 rounded-xl border border-violet-800/30 flex items-center gap-1.5 text-[11px] text-violet-300 font-medium">
                        <Package size={13} className="text-violet-400 shrink-0" />
                        <span className="truncate">{item.descripcionProducto}</span>
                      </div>
                    )}

                    <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-300">
                      <Store size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate font-semibold">{item.nombreComercial}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Bloque Financiero: Monto a Cobrar */}
                <div className="flex items-center justify-between p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Cobro Contra Entrega
                    </span>
                    <div className="text-[10px] font-bold mt-0.5">
                      {item.destinatarioPagaEnvio ? (
                        <span className="text-emerald-400">🟢 Cliente paga envío (S/ {(item.tarifaEnvio || 0).toFixed(2)})</span>
                      ) : (
                        <span className="text-cyan-400">🔵 Comercio asume envío</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-400 uppercase font-semibold block">Total a Cobrar</span>
                    <strong className="font-mono text-base font-black text-emerald-400">
                      S/ {totalCobrarItem.toFixed(2)}
                    </strong>
                  </div>
                </div>

                {/* 4. Botones de Acción y Progresión de Ruta */}
                {!isEntregado && !isNoEntregado ? (
                  <div className="space-y-2 pt-1">
                    {/* Botón Principal de Estado */}
                    <div>
                      {isAsignado && (
                        <button
                          type="button"
                          onClick={() => onSetEnCaminoCliente(item)}
                          disabled={!esRutaIniciada || isPending}
                          className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 cursor-pointer transition-all"
                        >
                          <Bike size={16} /> Voy en Camino al Cliente
                        </button>
                      )}

                      {isEnRuta && (
                        <button
                          type="button"
                          onClick={() => onSetA20MinutosCliente(item)}
                          disabled={!esRutaIniciada || isPending}
                          className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 disabled:opacity-40 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all animate-pulse"
                        >
                          <Clock size={16} /> Notificar: Estoy a 20 Minutos
                        </button>
                      )}

                      {isA5Min && (
                        <button
                          type="button"
                          onClick={() => onOpenConfirmModal(item)}
                          disabled={!esRutaIniciada}
                          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-40 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer transition-all animate-pulse"
                        >
                          <CheckCircle2 size={16} /> Entregar y Registrar Cobro
                        </button>
                      )}
                    </div>

                    {/* Botones Secundarios: Reprogramar y No Entregado */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenRescheduleModal(item)}
                        disabled={!esRutaIniciada}
                        className="py-2.5 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 active:scale-95 disabled:opacity-40 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <CalendarClock size={14} /> Reprogramar
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenFailedModal(item)}
                        disabled={!esRutaIniciada}
                        className="py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-red-500/20 active:scale-95 disabled:opacity-40 text-red-400 border border-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <XCircle size={14} /> No Entregado
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2.5 text-xs font-bold text-slate-500 italic bg-slate-950/40 rounded-xl border border-slate-900">
                    ✓ Entrega Finalizada
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODO 2: TABLA FLUIDA PARA PC (CON ACCIONES COMPLETAS: WSP, LLAMAR, GPS Y ESTADO) ── */}
      {vistaModo === 'tabla' && (
        <div className="hidden sm:block bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/80">
                <th className="p-3.5 w-8 text-center">#</th>
                <th className="p-3.5 whitespace-nowrap">Código Envío</th>
                <th className="p-3.5">Cliente / Destinatario</th>
                <th className="p-3.5">Dirección / Distrito</th>
                <th className="p-3.5 text-right whitespace-nowrap">Cobro</th>
                <th className="p-3.5 text-center whitespace-nowrap">Estado</th>
                <th className="p-3.5 text-center whitespace-nowrap">Acciones (Contacto &amp; Ruta)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredItems.map((item, index) => {
                const isEntregado = item.idEstadosPedido === EstadoPedidoEnum.Entregado;
                const isNoEntregado = item.idEstadosPedido === EstadoPedidoEnum.NoEntregado;
                const isEnRuta = item.idEstadosPedido === EstadoPedidoEnum.EnRuta;
                const isA5Min = item.idEstadosPedido === EstadoPedidoEnum.A5Minutos;
                const isAsignado = item.idEstadosPedido === EstadoPedidoEnum.EntregaAsignada;
                const totalCobrarItem = item.montoCobrar + (item.destinatarioPagaEnvio ? (item.tarifaEnvio || 0) : 0);

                return (
                  <tr
                    key={`deliv_tbl_row_${item.idPedido}`}
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
                    {/* Index */}
                    <td className="p-3.5 text-center font-bold text-slate-400">{index + 1}</td>

                    {/* Tracking Code */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-lg text-xs">
                          {item.codigoSeguimiento}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(item.codigoSeguimiento)}
                          className="p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Copiar código"
                        >
                          {copiedCode === item.codigoSeguimiento ? (
                            <Check size={12} className="text-emerald-400" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="p-3.5">
                      <span className="font-bold text-white block text-sm">{item.nombreDestinatario}</span>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{item.telefonoDestinatario}</span>
                    </td>

                    {/* Address */}
                    <td className="p-3.5 max-w-xs">
                      <span className="font-bold text-cyan-300 block truncate">📍 {item.distritoNombre}</span>
                      <span className="text-slate-200 truncate block text-[11px] font-medium">{item.direccionDestinatario}</span>
                      {item.descripcionProducto && (
                        <span className="text-[10px] text-violet-300 font-medium truncate block mt-0.5">📦 {item.descripcionProducto}</span>
                      )}
                    </td>

                    {/* Cobro */}
                    <td className="p-3.5 text-right font-mono whitespace-nowrap">
                      <span className="font-black text-emerald-400 text-sm block">S/ {totalCobrarItem.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {item.destinatarioPagaEnvio ? 'Cliente paga' : 'Comercio asume'}
                      </span>
                    </td>

                    {/* Estado */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      {isEntregado && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-extrabold inline-flex items-center gap-1">
                          <CheckCircle2 size={12} /> Entregado
                        </span>
                      )}
                      {isNoEntregado && (
                        <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 text-[11px] font-extrabold inline-flex items-center gap-1">
                          <XCircle size={12} /> No Entregado
                        </span>
                      )}
                      {isA5Min && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold animate-pulse inline-flex items-center gap-1">
                          <Clock size={12} /> A 20 Min
                        </span>
                      )}
                      {isEnRuta && (
                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-extrabold animate-pulse inline-flex items-center gap-1">
                          <Bike size={12} /> En Ruta
                        </span>
                      )}
                      {isAsignado && (
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold">
                          Asignado
                        </span>
                      )}
                    </td>

                    {/* ACCIONES ORGANIZADAS: CONTACTO (WSP, LLAMAR, GPS) + RUTA (ESTADOS) */}
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* 1. Acciones de Contacto Rápido */}
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(item.telefonoDestinatario, item.nombreDestinatario, item.codigoSeguimiento)}
                          className="w-8 h-8 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                          title="Enviar WhatsApp al cliente"
                        >
                          <MessageCircle size={14} />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenCall(item.telefonoDestinatario)}
                          className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                          title={`Llamar al cliente (${item.telefonoDestinatario})`}
                        >
                          <Phone size={14} />
                        </button>

                        {item.googleMapsUrl && (
                          <a
                            href={item.googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center cursor-pointer transition-all hover:scale-105"
                            title="Abrir GPS Waze / Google Maps"
                          >
                            <Navigation size={13} />
                          </a>
                        )}

                        {/* Separador visual */}
                        <div className="h-5 w-px bg-slate-800 mx-0.5" />

                        {/* 2. Acciones de Progresión de Estado de Ruta */}
                        {isEntregado || isNoEntregado ? (
                          <span className="text-[10px] text-slate-500 italic px-2">Finalizado</span>
                        ) : (
                          <>
                            {/* Paso 1: En Camino */}
                            {isAsignado && (
                              <button
                                type="button"
                                onClick={() => onSetEnCaminoCliente(item)}
                                disabled={!esRutaIniciada || isPending}
                                title="Voy en camino al cliente"
                                className="w-8 h-8 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold flex items-center justify-center cursor-pointer shadow-sm hover:scale-105"
                              >
                                <Bike size={15} />
                              </button>
                            )}

                            {/* Paso 2: A 20 Minutos */}
                            {isEnRuta && (
                              <button
                                type="button"
                                onClick={() => onSetA20MinutosCliente(item)}
                                disabled={!esRutaIniciada || isPending}
                                title="Notificar: A 20 Minutos de llegar"
                                className="w-8 h-8 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold flex items-center justify-center cursor-pointer shadow-sm animate-pulse hover:scale-105"
                              >
                                <Clock size={15} />
                              </button>
                            )}

                            {/* Paso 3: Entregar y Cobrar */}
                            {isA5Min && (
                              <button
                                type="button"
                                onClick={() => onOpenConfirmModal(item)}
                                disabled={!esRutaIniciada}
                                title="Confirmar Entrega y Registrar Cobro"
                                className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold flex items-center justify-center cursor-pointer shadow-sm animate-pulse hover:scale-105"
                              >
                                <CheckCircle2 size={15} />
                              </button>
                            )}

                            {/* Reprogramar */}
                            <button
                              type="button"
                              onClick={() => onOpenRescheduleModal(item)}
                              disabled={!esRutaIniciada}
                              title="Reprogramar entrega por solicitud del cliente"
                              className="w-8 h-8 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 disabled:opacity-40 text-purple-300 border border-purple-500/40 flex items-center justify-center cursor-pointer hover:scale-105"
                            >
                              <CalendarClock size={14} />
                            </button>

                            {/* Intento Fallido */}
                            <button
                              type="button"
                              onClick={() => onOpenFailedModal(item)}
                              disabled={!esRutaIniciada}
                              title="Marcar Intento Fallido / No Entregado"
                              className="w-8 h-8 rounded-xl bg-slate-950 hover:bg-red-500/20 disabled:opacity-40 text-red-400 border border-slate-800 flex items-center justify-center cursor-pointer hover:scale-105"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
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
