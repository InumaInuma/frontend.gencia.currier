import React, { useState } from 'react';
import type { IPedido } from '../../domain/models/IPedido';
import {
  Copy,
  Phone,
  MapPin,
  Share2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit3,
  PackageX,
  Camera,
  MessageCircle,
  Package,
  Navigation,
  Check,
  LayoutGrid,
  List
} from 'lucide-react';
import { getEstadoBadgeConfig } from '../../infrastructure/utils/estadoStyles';
import { ModalVerEvidencias } from './common/ModalVerEvidencias';

interface Props {
  pedidos: IPedido[];
  onCopyCode: (codigo: string) => void;
  onShareWhatsApp: (pedido: IPedido) => void;
  copiedCode: string | null;
  onEditarPedido?: (pedido: IPedido) => void;
  onCancelarPedido?: (pedido: IPedido) => void;
}

export const TablaPedidos: React.FC<Props> = ({
  pedidos,
  onCopyCode,
  onShareWhatsApp,
  copiedCode,
  onEditarPedido,
  onCancelarPedido
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvidenciasPedido, setSelectedEvidenciasPedido] = useState<IPedido | null>(null);
  const [vistaModo, setVistaModo] = useState<'tarjetas' | 'tabla'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 ? 'tabla' : 'tarjetas';
    }
    return 'tabla';
  });
  const pageSize = 10;

  // Reset page when pedidos change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [pedidos]);

  const totalPages = Math.ceil(pedidos.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentPedidos = pedidos.slice(startIndex, startIndex + pageSize);

  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const handleCopyPhone = (phone: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const dateFormatted = d.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timeFormatted = d.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return { dateFormatted, timeFormatted };
    } catch {
      return { dateFormatted: dateStr, timeFormatted: '' };
    }
  };

  const handleOpenDirectWhatsApp = (telefono: string, cliente: string) => {
    const num = telefono.replace(/\D/g, '');
    const cleanNum = num.startsWith('51') ? num : `51${num}`;
    const msg = `¡Hola ${cliente}! Le saludamos de la tienda para coordinar la entrega de su pedido.`;
    window.open(`https://wa.me/${cleanNum}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleOpenCall = (telefono: string) => {
    const num = telefono.replace(/\D/g, '');
    window.open(`tel:${num}`);
  };

  return (
    <div className="space-y-4">
      {/* ── HEADER DE VISTA & SELECTOR (Tarjetas / Tabla) ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400 font-medium">
          Mostrando <strong className="text-white font-bold">{currentPedidos.length}</strong> de{' '}
          <strong className="text-white font-bold">{pedidos.length}</strong> envíos
        </div>

        <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => setVistaModo('tarjetas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              vistaModo === 'tarjetas'
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40 shadow-sm'
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
                ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <List size={13} />
            <span>Tabla</span>
          </button>
        </div>
      </div>

      {/* ── MODO 1: CUADRÍCULA RESPONSIVA DE TARJETAS (1 col Móvil, 2 col Tablet, 3 col PC) ── */}
      {(vistaModo === 'tarjetas' || window.innerWidth < 640) && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentPedidos.map((pedido, index) => {
            const dateObj = formatDate(pedido.fechaRegistro);
            const isCancelled = pedido.idEstadosPedido === 13 || (pedido.estadoNombre && pedido.estadoNombre.toLowerCase().includes('cancel'));
            const isEntregado = pedido.idEstadosPedido === 11 || (pedido.estadoNombre && pedido.estadoNombre.toLowerCase().includes('entregado'));
            const totalCobrarItem = pedido.montoCobrar + (pedido.destinatarioPagaEnvio ? (pedido.tarifaEnvio || 0) : 0);
            const badge = getEstadoBadgeConfig(pedido.idEstadosPedido || pedido.estadoNombre, pedido.estadoNombre);

            return (
              <div
                key={`comercio_card_${pedido.id}`}
                className="bg-slate-900/50 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between space-y-3.5 shadow-xl transition-all"
              >
                {/* 1. Header: #, Código con Copia, Fecha y Estado */}
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3 gap-2">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-slate-800 text-violet-300 font-black text-xs flex items-center justify-center shrink-0">
                        #{startIndex + index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => onCopyCode(pedido.codigoSeguimiento)}
                        className="flex items-center gap-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 px-2 py-0.5 rounded-lg shrink-0 cursor-pointer transition-all active:scale-95"
                        title="Presione para copiar código de seguimiento"
                      >
                        <span className="font-mono font-bold text-violet-300 text-xs whitespace-nowrap">
                          {pedido.codigoSeguimiento}
                        </span>
                        {copiedCode === pedido.codigoSeguimiento ? (
                          <Check size={12} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Copy size={12} className="text-violet-400/70 hover:text-white shrink-0" />
                        )}
                      </button>
                    </div>

                    {typeof dateObj === 'object' && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono pl-0.5">
                        <Calendar size={11} className="text-slate-500 shrink-0" />
                        <span>{dateObj.dateFormatted} • {dateObj.timeFormatted}</span>
                      </div>
                    )}
                  </div>

                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-extrabold whitespace-nowrap shrink-0 border ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>

                {/* 2. Cliente Destinatario */}
                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-3">
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Cliente / Destinatario
                    </span>
                    <h4 className="font-extrabold text-white text-base truncate leading-tight mt-0.5">
                      {pedido.nombreDestinatario}
                    </h4>
                    {pedido.telefonoDestinatario && (
                      <button
                        type="button"
                        onClick={(e) => handleCopyPhone(pedido.telefonoDestinatario, e)}
                        className="text-xs text-slate-400 font-mono flex items-center gap-1.5 mt-1 hover:text-white transition-colors cursor-pointer bg-slate-900/90 hover:bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg active:scale-95"
                        title="Presione para copiar teléfono"
                      >
                        <Phone size={11} className="text-slate-500 shrink-0" />
                        <span>{pedido.telefonoDestinatario}</span>
                        {copiedPhone === pedido.telefonoDestinatario ? (
                          <Check size={11} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Copy size={10} className="text-slate-500 hover:text-white shrink-0" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Dirección y Referencia */}
                  <div className="p-2.5 bg-slate-900/70 rounded-xl border border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-300 text-xs flex items-center gap-1">
                      <MapPin size={12} className="shrink-0 text-indigo-400" />
                      {pedido.distritoNombre}
                    </span>
                    <p className="text-slate-200 font-medium text-xs pl-4 leading-snug">
                      {pedido.direccionDestinatario}
                    </p>

                    {pedido.referenciaDestinatario && (
                      <p className="text-[11px] text-slate-400 pl-4 italic">
                        <span className="font-semibold text-slate-300">Ref:</span> {pedido.referenciaDestinatario}
                      </p>
                    )}
                  </div>

                  {/* Producto & Observación */}
                  {(pedido.descripcionProducto || pedido.observaciones) && (
                    <div className="space-y-1 pt-1 text-xs">
                      {pedido.descripcionProducto && (
                        <div className="bg-violet-950/30 p-2 rounded-xl border border-violet-800/30 flex items-center gap-1.5 text-[11px] text-violet-300 font-medium">
                          <Package size={13} className="text-violet-400 shrink-0" />
                          <span className="truncate">{pedido.descripcionProducto}</span>
                        </div>
                      )}

                      {pedido.observaciones && (
                        <p className="text-[11px] text-amber-300/90 font-medium bg-amber-500/5 p-1.5 rounded-lg border border-amber-500/10">
                          <strong className="text-amber-400">Obs Comercio:</strong> {pedido.observaciones}
                        </p>
                      )}
                    </div>
                  )}

                  {isCancelled && (pedido.motivoCancelacion || pedido.observacionCancelacion) && (
                    <div className="text-[11px] text-red-300 bg-red-950/40 p-2 rounded-xl border border-red-500/30">
                      <strong className="text-red-400 block uppercase text-[10px]">Motivo Cancelación:</strong>
                      <span>{pedido.motivoCancelacion}</span>
                    </div>
                  )}
                </div>

                {/* 3. Bloque Financiero y Barra Unificada de Acciones */}
                <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">
                        Prod: S/ {pedido.montoCobrar.toFixed(2)} | Envío: S/ {(pedido.tarifaEnvio || 0).toFixed(2)}
                      </div>
                      <div className="text-[10px] font-bold mt-0.5">
                        {pedido.destinatarioPagaEnvio ? (
                          <span className="text-emerald-400">🟢 Cliente paga envío</span>
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

                  {/* 4. Barra Unificada de Botones de Accion */}
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-800/80 flex-wrap">
                    {/* Compartir WhatsApp */}
                    <button
                      type="button"
                      onClick={() => onShareWhatsApp(pedido)}
                      className="w-8 h-8 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                      title="Compartir enlace de seguimiento por WhatsApp"
                    >
                      <Share2 size={14} />
                    </button>

                    {/* Chat WhatsApp */}
                    <button
                      type="button"
                      onClick={() => handleOpenDirectWhatsApp(pedido.telefonoDestinatario, pedido.nombreDestinatario)}
                      className="w-8 h-8 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                      title="Chatear por WhatsApp con el cliente"
                    >
                      <MessageCircle size={14} />
                    </button>

                    {/* Llamar */}
                    <button
                      type="button"
                      onClick={() => handleOpenCall(pedido.telefonoDestinatario)}
                      className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                      title={`Llamar al cliente (${pedido.telefonoDestinatario})`}
                    >
                      <Phone size={14} />
                    </button>

                    {/* GPS */}
                    {pedido.googleMapsUrl && (
                      <a
                        href={pedido.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-8 h-8 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                        title="Ver en Google Maps"
                      >
                        <Navigation size={13} />
                      </a>
                    )}

                    {/* Evidencias */}
                    {(isEntregado || pedido.fotoEntregaUrl || pedido.captureUrl) && (
                      <button
                        type="button"
                        onClick={() => setSelectedEvidenciasPedido(pedido)}
                        className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/40 border border-cyan-500/30 flex items-center justify-center transition-all active:scale-95 shadow-sm cursor-pointer"
                        title="Ver fotos y evidencias de entrega"
                      >
                        <Camera size={13} />
                      </button>
                    )}

                    {/* Editar */}
                    {onEditarPedido && !isCancelled && !isEntregado && (
                      <button
                        type="button"
                        onClick={() => onEditarPedido(pedido)}
                        className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 border border-violet-500/30 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Editar pedido"
                      >
                        <Edit3 size={14} />
                      </button>
                    )}

                    {/* Cancelar / Eliminar */}
                    {onCancelarPedido && !isCancelled && !isEntregado && (
                      <button
                        type="button"
                        onClick={() => onCancelarPedido(pedido)}
                        className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                        title="Cancelar envío"
                      >
                        <PackageX size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODO 2: TABLA FLUIDA PARA PC (AJUSTE PERFECTO 100% SIN DESBORDES NI HUECOS) ── */}
      {vistaModo === 'tabla' && (
        <div className="hidden sm:block bg-slate-900/40 border border-slate-900 rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300 border-collapse table-fixed">
            <colgroup>
              <col className="w-[3%]" />
              <col className="w-[17%]" />
              <col className="w-[15%]" />
              <col className="w-[16%]" />
              <col className="w-[9%]" />
              <col className="w-[14%]" />
              <col className="w-[26%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[10px] bg-slate-950/80">
                <th className="py-2.5 px-2 text-center">#</th>
                <th className="py-2.5 px-2.5 whitespace-nowrap">Código &amp; Fecha</th>
                <th className="py-2.5 px-3 truncate">Cliente / Contacto</th>
                <th className="py-2.5 px-2.5 truncate">Dirección &amp; Distrito</th>
                <th className="py-2.5 px-2 text-left whitespace-nowrap">Cobro</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Estado</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {currentPedidos.map((pedido, index) => {
                const dateObj = formatDate(pedido.fechaRegistro);
                const isCancelled = pedido.idEstadosPedido === 13 || (pedido.estadoNombre && pedido.estadoNombre.toLowerCase().includes('cancel'));
                const isEntregado = pedido.idEstadosPedido === 11 || (pedido.estadoNombre && pedido.estadoNombre.toLowerCase().includes('entregado'));
                const totalCobrarItem = pedido.montoCobrar + (pedido.destinatarioPagaEnvio ? (pedido.tarifaEnvio || 0) : 0);
                const badge = getEstadoBadgeConfig(pedido.idEstadosPedido || pedido.estadoNombre, pedido.estadoNombre);

                return (
                  <tr key={pedido.id} className="hover:bg-slate-900/60 transition-colors">
                    {/* Index */}
                    <td className="py-2.5 px-2 text-center font-bold text-slate-400">{startIndex + index + 1}</td>

                    {/* Código & Fecha Combinados */}
                    <td className="py-2.5 px-2.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onCopyCode(pedido.codigoSeguimiento)}
                          className="font-mono font-bold text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Presione para copiar código de seguimiento"
                        >
                          <span>{pedido.codigoSeguimiento}</span>
                          {copiedCode === pedido.codigoSeguimiento ? (
                            <Check size={11} className="text-emerald-400 shrink-0" />
                          ) : (
                            <Copy size={11} className="text-slate-400 hover:text-white shrink-0" />
                          )}
                        </button>
                      </div>
                      {typeof dateObj === 'object' && (
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Calendar size={9} className="text-slate-500 shrink-0" />
                          <span className="truncate">{dateObj.dateFormatted} {dateObj.timeFormatted}</span>
                        </div>
                      )}
                    </td>

                    {/* Cliente */}
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-white block text-xs truncate">{pedido.nombreDestinatario}</span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5 truncate">
                        <Phone size={10} className="text-slate-500 shrink-0" />
                        {pedido.telefonoDestinatario}
                      </span>
                    </td>

                    {/* Dirección & Distrito */}
                    <td className="py-2.5 px-2">
                      <span className="font-bold text-cyan-300 block truncate text-xs">📍 {pedido.distritoNombre}</span>
                      <span className="text-slate-200 truncate block text-[11px] font-medium">{pedido.direccionDestinatario}</span>
                      {pedido.descripcionProducto && (
                        <span className="text-[10px] text-violet-300 font-medium truncate block mt-0.5">📦 {pedido.descripcionProducto}</span>
                      )}
                    </td>

                    {/* Cobro (Pegado inmediatamente a dirección) */}
                    <td className="py-2.5 px-2 text-left font-mono whitespace-nowrap">
                      <span className="font-black text-emerald-400 text-xs block">S/ {totalCobrarItem.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {pedido.destinatarioPagaEnvio ? 'Cliente paga' : 'Comercio asume'}
                      </span>
                    </td>

                    {/* Estado Badge */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold inline-block whitespace-nowrap border ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>

                    {/* ACCIONES COMPLETAS (AMPLIAS Y CÓMODAS) */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Compartir WhatsApp Tracking */}
                        <button
                          type="button"
                          onClick={() => onShareWhatsApp(pedido)}
                          className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                          title="Compartir enlace de seguimiento por WhatsApp"
                        >
                          <Share2 size={13} />
                        </button>

                        {/* WhatsApp Direct Chat */}
                        <button
                          type="button"
                          onClick={() => handleOpenDirectWhatsApp(pedido.telefonoDestinatario, pedido.nombreDestinatario)}
                          className="w-7 h-7 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                          title="Chatear por WhatsApp con el cliente"
                        >
                          <MessageCircle size={13} />
                        </button>

                        {/* Llamar */}
                        <button
                          type="button"
                          onClick={() => handleOpenCall(pedido.telefonoDestinatario)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                          title={`Llamar al cliente (${pedido.telefonoDestinatario})`}
                        >
                          <Phone size={13} />
                        </button>

                        {/* GPS */}
                        {pedido.googleMapsUrl && (
                          <a
                            href={pedido.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-7 h-7 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                            title="Ver en Google Maps"
                          >
                            <Navigation size={12} />
                          </a>
                        )}

                        {/* Evidencias */}
                        {(isEntregado || pedido.fotoEntregaUrl || pedido.captureUrl) && (
                          <button
                            type="button"
                            onClick={() => setSelectedEvidenciasPedido(pedido)}
                            className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/40 border border-cyan-500/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                            title="Ver evidencias fotográficas"
                          >
                            <Camera size={13} />
                          </button>
                        )}

                        {/* Editar */}
                        {onEditarPedido && !isCancelled && !isEntregado && (
                          <button
                            type="button"
                            onClick={() => onEditarPedido(pedido)}
                            className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 border border-violet-500/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                            title="Editar pedido"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}

                        {/* Cancelar */}
                        {onCancelarPedido && !isCancelled && !isEntregado && (
                          <button
                            type="button"
                            onClick={() => onCancelarPedido(pedido)}
                            className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
                            title="Cancelar envío"
                          >
                            <PackageX size={13} />
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

      {/* ── PAGINACIÓN COMPACTA ── */}
      {pedidos.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-900 text-xs text-slate-400 px-1">
          <div>
            Mostrando <span className="font-semibold text-white">{startIndex + 1}</span> a{' '}
            <span className="font-semibold text-white">
              {Math.min(startIndex + pageSize, pedidos.length)}
            </span>{' '}
            de <span className="font-semibold text-white">{pedidos.length}</span> envíos
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <span>Siguiente</span>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Ver Evidencias */}
      <ModalVerEvidencias
        isOpen={Boolean(selectedEvidenciasPedido)}
        onClose={() => setSelectedEvidenciasPedido(null)}
        codigoSeguimiento={selectedEvidenciasPedido?.codigoSeguimiento}
        nombreDestinatario={selectedEvidenciasPedido?.nombreDestinatario}
        fotoEntregaUrl={selectedEvidenciasPedido?.fotoEntregaUrl}
        captureUrl={selectedEvidenciasPedido?.captureUrl}
      />
    </div>
  );
};
