import React, { useState } from 'react';
import type { IPedido } from '../../domain/models/IPedido';
import { Copy, Phone, MapPin, ExternalLink, Share2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { getEstadoBadgeConfig } from '../../infrastructure/utils/estadoStyles';

interface Props {
  pedidos: IPedido[];
  onCopyCode: (codigo: string) => void;
  onShareWhatsApp: (codigo: string, destinatario: string, telefono: string) => void;
  copiedCode: string | null;
}

export const TablaPedidos: React.FC<Props> = ({ pedidos, onCopyCode, onShareWhatsApp, copiedCode }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const totalPages = Math.ceil(pedidos.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const currentPedidos = pedidos.slice(startIndex, startIndex + pageSize);

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

  return (
    <div className="space-y-4">
      {/* DESKTOP VIEW: HTML TABLE (hidden on mobile, visible on md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-900 text-slate-400 font-semibold text-xs uppercase tracking-wider bg-slate-950/80">
              <th className="pb-3 px-3">Código Envío</th>
              <th className="pb-3 px-3">Fecha Registro</th>
              <th className="pb-3 px-3">Cliente / Celular</th>
              <th className="pb-3 px-3">Distrito & Dirección</th>
              <th className="pb-3 px-3">Notas / Ref.</th>
              <th className="pb-3 px-3">Cobro Delivery</th>
              <th className="pb-3 px-3">Estado</th>
              <th className="pb-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900 text-slate-300">
            {currentPedidos.map((pedido) => {
              const dateObj = formatDate(pedido.fechaRegistro);
              return (
                <tr key={pedido.id} className="hover:bg-slate-900/50 transition-colors">
                  {/* 1. Código de Seguimiento */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-lg">
                        {pedido.codigoSeguimiento}
                      </span>
                      <button
                        onClick={() => onCopyCode(pedido.codigoSeguimiento)}
                        className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Copiar código"
                      >
                        <Copy size={13} />
                      </button>
                      {copiedCode === pedido.codigoSeguimiento && (
                        <span className="text-[10px] text-emerald-400 font-bold">¡Copiado!</span>
                      )}
                    </div>
                  </td>

                  {/* 2. Fecha de Registro */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {typeof dateObj === 'object' ? (
                      <div>
                        <div className="font-medium text-slate-200 text-xs flex items-center gap-1">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <span>{dateObj.dateFormatted}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono pl-4">
                          {dateObj.timeFormatted}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">{dateObj}</span>
                    )}
                  </td>

                  {/* 3. Cliente Destinatario */}
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-white">{pedido.nombreDestinatario}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <Phone size={11} className="text-slate-500" />
                      {pedido.telefonoDestinatario}
                    </div>
                  </td>

                  {/* 4. Dirección & Distrito */}
                  <td className="py-3.5 px-3 max-w-xs">
                    <div className="font-medium text-slate-200 truncate" title={pedido.direccionDestinatario}>
                      {pedido.direccionDestinatario}
                    </div>
                    <div className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                      <MapPin size={11} />
                      {pedido.distritoNombre}
                      {pedido.googleMapsUrl && (
                        <a
                          href={pedido.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white ml-1 inline-flex items-center"
                          title="Ver mapa GPS"
                        >
                          <ExternalLink size={11} />
                        </a>
                      )}
                    </div>
                  </td>

                  {/* 5. Notas / Ref */}
                  <td className="py-3.5 px-3 max-w-xs text-xs text-slate-400">
                    {pedido.referenciaDestinatario && (
                      <div className="truncate" title={pedido.referenciaDestinatario}>
                        <span className="text-slate-500 font-semibold">Ref:</span> {pedido.referenciaDestinatario}
                      </div>
                    )}
                    {pedido.observaciones && (
                      <div className="truncate text-slate-400 italic" title={pedido.observaciones}>
                        <span className="text-slate-500 font-semibold">Obs:</span> {pedido.observaciones}
                      </div>
                    )}
                    {!pedido.referenciaDestinatario && !pedido.observaciones && (
                      <span className="text-slate-600">-</span>
                    )}
                  </td>

                  {/* 6. Monto & Tarifa Envío */}
                  <td className="py-3.5 px-3 font-semibold text-xs">
                    <div className={pedido.montoCobrar > 0 ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                      Prod: {pedido.montoCobrar > 0 ? `S/ ${pedido.montoCobrar.toFixed(2)}` : 'S/ 0.00'}
                    </div>
                    <div className="text-violet-300 font-medium">
                      Envío: S/ {(pedido.tarifaEnvio || 0).toFixed(2)}
                    </div>
                    <div className="text-[10px] font-bold mt-0.5">
                      {pedido.destinatarioPagaEnvio ? (
                        <span className="text-emerald-400">🟢 Cliente paga envío</span>
                      ) : (
                        <span className="text-cyan-400">🔵 Comercio asume envío</span>
                      )}
                    </div>
                  </td>

                  {/* 7. Estado Badge */}
                  <td className="py-3.5 px-3">
                    {(() => {
                      const badge = getEstadoBadgeConfig(pedido.idEstadosPedido || pedido.estadoNombre, pedido.estadoNombre);
                      return (
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full inline-block ${badge.className}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </td>

                  {/* 8. Acciones */}
                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() =>
                          onShareWhatsApp(
                            pedido.codigoSeguimiento,
                            pedido.nombreDestinatario,
                            pedido.telefonoDestinatario
                          )
                        }
                        className="inline-flex items-center gap-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        title="Compartir por WhatsApp"
                      >
                        <Share2 size={12} />
                        WSp
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW: TOUCH CARDS (visible on mobile, hidden on md+) */}
      <div className="block md:hidden space-y-4">
        {currentPedidos.map((pedido) => {
          const dateObj = formatDate(pedido.fechaRegistro);
          return (
            <div key={pedido.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
              {/* Header: Tracking Code, Date & Status */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                      {pedido.codigoSeguimiento}
                    </span>
                    <button
                      onClick={() => onCopyCode(pedido.codigoSeguimiento)}
                      className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900 transition-colors cursor-pointer"
                      title="Copiar código"
                    >
                      <Copy size={14} />
                    </button>
                    {copiedCode === pedido.codigoSeguimiento && (
                      <span className="text-[10px] text-emerald-400 font-bold">¡Copiado!</span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar size={11} className="text-slate-500" />
                    <span>
                      {typeof dateObj === 'object'
                        ? `${dateObj.dateFormatted} ${dateObj.timeFormatted}`
                        : dateObj}
                    </span>
                  </div>
                </div>

                {(() => {
                  const badge = getEstadoBadgeConfig(pedido.idEstadosPedido || pedido.estadoNombre, pedido.estadoNombre);
                  return (
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full inline-block ${badge.className}`}>
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              {/* Content Details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-white font-semibold">
                  <span>Cliente: {pedido.nombreDestinatario}</span>
                  <span className="flex items-center gap-1 text-slate-400 font-normal">
                    <Phone size={12} />
                    {pedido.telefonoDestinatario}
                  </span>
                </div>

                <div className="flex items-start gap-1 text-slate-400">
                  <MapPin size={14} className="shrink-0 text-slate-500 mt-0.5" />
                  <span>
                    {pedido.direccionDestinatario} ({pedido.distritoNombre})
                  </span>
                </div>

                {pedido.referenciaDestinatario && (
                  <p className="text-[11px] text-slate-500 italic pl-5">
                    Ref: {pedido.referenciaDestinatario}
                  </p>
                )}

                {pedido.observaciones && (
                  <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-900">
                    Notas: {pedido.observaciones}
                  </p>
                )}
              </div>

              {/* Footer: Amount & Share Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                <div>
                  <div className="text-[11px] font-bold text-emerald-400">
                    Producto: {pedido.montoCobrar > 0 ? `S/ ${pedido.montoCobrar.toFixed(2)}` : 'S/ 0.00'}
                  </div>
                  <div className="text-[10px] text-violet-300">
                    Envío: S/ {(pedido.tarifaEnvio || 0).toFixed(2)} ({pedido.destinatarioPagaEnvio ? '🟢 Cliente paga' : '🔵 Comercio asume'})
                  </div>
                </div>

                <button
                  onClick={() =>
                    onShareWhatsApp(
                      pedido.codigoSeguimiento,
                      pedido.nombreDestinatario,
                      pedido.telefonoDestinatario
                    )
                  }
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-md"
                >
                  <Share2 size={13} />
                  WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION CONTROLS BAR (10 items per page) */}
      {pedidos.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-900 text-xs text-slate-400">
          <div>
            Mostrando <span className="font-semibold text-white">{startIndex + 1}</span> a{' '}
            <span className="font-semibold text-white">
              {Math.min(startIndex + pageSize, pedidos.length)}
            </span>{' '}
            de <span className="font-semibold text-white">{pedidos.length}</span> envíos agendados
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

              <div className="flex items-center gap-1 px-2">
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
    </div>
  );
};

