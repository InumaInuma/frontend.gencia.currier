import React, { useState } from 'react';
import { Phone, MapPin, ExternalLink, PackageX, Bike, Store, Copy, Check, Clock, MessageCircle, Navigation, Edit3, Camera } from 'lucide-react';
import type { IMonitoreoRecojo } from '../../domain/models/IMonitoreoRecojo';
import { getEstadoBadgeConfig } from '../../infrastructure/utils/estadoStyles';
import { ModalVerEvidencias } from './common/ModalVerEvidencias';

interface Props {
  pedidos: IMonitoreoRecojo[];
  onEditarPedido?: (pedido: IMonitoreoRecojo) => void;
  onCancelarPedido?: (pedido: IMonitoreoRecojo) => void;
  mostrarMotorizado?: boolean;
  mostrarComercio?: boolean;
  onCopyCode?: (codigo: string) => void;
  copiedCode?: string | null;
}

function getEstadoBadgeClass(estado: string): string {
  return getEstadoBadgeConfig(estado).className;
}

export const TablaMonitoreoRecojo: React.FC<Props> = ({
  pedidos,
  onEditarPedido,
  onCancelarPedido,
  mostrarMotorizado = false,
  mostrarComercio = false,
  onCopyCode,
  copiedCode
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset page when pedidos change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [pedidos]);

  const totalPages = Math.ceil(pedidos.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, pedidos.length);
  const currentPedidos = pedidos.slice(startIndex, endIndex);

  const [vistaModo, setVistaModo] = React.useState<'tarjetas' | 'tabla'>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768 ? 'tabla' : 'tarjetas';
    }
    return 'tabla';
  });

  const [copiedPhone, setCopiedPhone] = React.useState<string | null>(null);
  const [localCopiedCode, setLocalCopiedCode] = React.useState<string | null>(null);
  const [selectedEvidenciasItem, setSelectedEvidenciasItem] = useState<IMonitoreoRecojo | null>(null);

  const handleCopyPhone = (phone: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleCopyCode = (codigo: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onCopyCode) {
      onCopyCode(codigo);
    } else {
      navigator.clipboard.writeText(codigo);
      setLocalCopiedCode(codigo);
      setTimeout(() => setLocalCopiedCode(null), 2000);
    }
  };

  const isCodeCopied = (codigo: string) => {
    return copiedCode === codigo || localCopiedCode === codigo;
  };

  const handleOpenDirectWhatsApp = (telefono: string, nombre: string) => {
    if (!telefono) return;
    const cleanPhone = telefono.replace(/\D/g, '');
    const finalPhone = cleanPhone.startsWith('51') ? cleanPhone : `51${cleanPhone}`;
    const text = encodeURIComponent(`Hola ${nombre}, te saludamos de Almain Courier.`);
    window.open(`https://wa.me/${finalPhone}?text=${text}`, '_blank');
  };

  const handleOpenCall = (telefono: string) => {
    if (!telefono) return;
    window.location.href = `tel:${telefono}`;
  };

  return (
    <div className="space-y-4">
      {/* Switcher de Vistas */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-slate-400 font-medium">
          Mostrando <strong className="text-white font-bold">{currentPedidos.length}</strong> de <strong className="text-white font-bold">{pedidos.length}</strong> envíos
        </div>

        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => setVistaModo('tarjetas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              vistaModo === 'tarjetas'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Tarjetas</span>
          </button>
          <button
            type="button"
            onClick={() => setVistaModo('tabla')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              vistaModo === 'tabla'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Tabla</span>
          </button>
        </div>
      </div>

      {/* ── DESKTOP: TABLA 100% FLUIDA Y RESPONSIVA ── */}
      {vistaModo === 'tabla' && (
        <div className="hidden sm:block bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300 border-collapse table-fixed">
            <colgroup>
              <col className="w-[3%]" />
              <col className={mostrarComercio ? "w-[13%]" : "w-[15%]"} />
              {mostrarComercio && <col className="w-[13%]" />}
              <col className={mostrarComercio ? "w-[15%]" : "w-[18%]"} />
              <col className={mostrarComercio ? "w-[15%]" : "w-[18%]"} />
              <col className={mostrarComercio ? "w-[7%]" : "w-[8%]"} />
              <col className={mostrarComercio ? "w-[14%]" : "w-[16%]"} />
              <col className={mostrarComercio ? "w-[20%]" : "w-[22%]"} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-900 text-slate-400 font-semibold text-[10px] uppercase tracking-wider bg-slate-950/80">
                <th className="py-2.5 px-2 text-center">#</th>
                <th className="py-2.5 px-2.5">{mostrarMotorizado ? 'Motorizado & Envío' : 'Código Envío'}</th>
                {mostrarComercio && <th className="py-2.5 px-2.5">Comercio (Recojo)</th>}
                <th className="py-2.5 px-2.5">Destinatario &amp; Dirección</th>
                <th className="py-2.5 px-2">Notas / Obs Comercio</th>
                <th className="py-2.5 px-1.5 text-left whitespace-nowrap">Cobro</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Estado</th>
                <th className="py-2.5 px-2 text-center whitespace-nowrap">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900 text-slate-300">
              {currentPedidos.map((p, index) => {
                const isCancelled = p.idEstadosPedido === 13 || (p.estadoPedido && p.estadoPedido.toLowerCase().includes('cancel'));
                const isEntregado = p.idEstadosPedido === 11 || (p.estadoPedido && p.estadoPedido.toLowerCase().includes('entregad'));
                return (
                  <tr key={p.idPedido} className="hover:bg-slate-900/50 transition-colors">
                    {/* 0. Número Correlativo */}
                    <td className="py-3 px-2 text-center font-bold text-slate-400">
                      {startIndex + index + 1}
                    </td>

                    {/* 1. Motorizado & Código de Seguimiento Unificados */}
                    <td className="py-3 px-2.5">
                      {mostrarMotorizado && (
                        <div className="mb-2 space-y-1">
                          <div className="font-bold text-white text-xs flex items-center gap-1.5 truncate" title={p.nombreConductor || 'Sin Asignar'}>
                            <Bike size={13} className="text-yellow-400 shrink-0" />
                            <span className="truncate">{p.nombreConductor || 'Sin Asignar'}</span>
                          </div>
                          {p.telefonoConductor && (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleCopyPhone(p.telefonoConductor!, e)}
                                className="text-[11px] font-mono text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                                title="Presione para copiar teléfono del motorizado"
                              >
                                <Phone size={9} className="text-yellow-400/80 shrink-0" />
                                <span>{p.telefonoConductor}</span>
                                {copiedPhone === p.telefonoConductor ? (
                                  <Check size={10} className="text-emerald-400 shrink-0" />
                                ) : (
                                  <Copy size={10} className="text-yellow-400/60 hover:text-white shrink-0" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Código de Seguimiento */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(p.codigoSeguimiento, e)}
                          className="font-mono font-bold text-[11px] text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 px-1.5 py-0.5 rounded-lg whitespace-nowrap flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Presione para copiar código de seguimiento"
                        >
                          <span>{p.codigoSeguimiento}</span>
                          {isCodeCopied(p.codigoSeguimiento) ? (
                            <Check size={11} className="text-emerald-400 shrink-0" />
                          ) : (
                            <Copy size={11} className="text-slate-400 hover:text-white shrink-0" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* 1.2 Comercio / Punto Recojo (Opcional) */}
                    {mostrarComercio && (
                      <td className="py-3 px-2.5">
                        <div className="font-semibold text-white text-xs truncate flex items-center gap-1.5" title={p.nombreComercial}>
                          <Store size={13} className="text-purple-400 shrink-0" />
                          <span className="truncate">{p.nombreComercial}</span>
                        </div>
                        <div className="text-[11px] text-purple-300 flex items-center gap-1 mt-0.5 truncate" title={p.direccionRecojo}>
                          <MapPin size={10} className="text-purple-400 shrink-0" />
                          <span className="truncate">{p.direccionRecojo}</span>
                          {p.googleMapsUrlComercio && (
                            <a
                              href={p.googleMapsUrlComercio}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-400 hover:text-white shrink-0 ml-0.5 inline-flex items-center"
                              title="Ver mapa GPS del recojo"
                            >
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                        {p.ruc && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                            RUC: {p.ruc}
                          </div>
                        )}
                      </td>
                    )}

                    {/* 2 & 3. Destinatario & Dirección Combinados */}
                    <td className="py-3 px-2.5">
                      <div className="font-bold text-white text-xs truncate">
                        {p.nombreDestinatario}
                      </div>
                      <div className="text-xs text-indigo-400 font-bold flex items-center gap-1 truncate mt-0.5">
                        <MapPin size={11} className="shrink-0 text-indigo-400" />
                        <span className="truncate">{p.distritoNombre}</span>
                        {p.googleMapsUrl && (
                          <a
                            href={p.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-white ml-0.5 inline-flex items-center shrink-0"
                            title="Ver mapa GPS del destino"
                          >
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                      <div className="font-medium text-slate-300 text-[11px] truncate mt-0.5" title={p.direccionDestinatario}>
                        {p.direccionDestinatario}
                      </div>
                      {p.telefonoDestinatario && (
                        <div className="mt-1">
                          <button
                            type="button"
                            onClick={(e) => handleCopyPhone(p.telefonoDestinatario, e)}
                            className="text-[10px] font-mono text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 px-1.5 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                            title="Presione para copiar teléfono del destinatario"
                          >
                            <Phone size={9} className="text-slate-500 shrink-0" />
                            <span>{p.telefonoDestinatario}</span>
                            {copiedPhone === p.telefonoDestinatario ? (
                              <Check size={10} className="text-emerald-400 shrink-0" />
                            ) : (
                              <Copy size={9} className="text-slate-500 hover:text-white shrink-0" />
                            )}
                          </button>
                        </div>
                      )}
                    </td>

                    {/* 4. Notas / Ref. (Acomodo multilínea con break-words) */}
                    <td className="py-3 px-2.5 text-xs text-slate-400">
                      <div className="space-y-0.5 text-[11px] leading-snug">
                        {p.descripcionProducto && (
                          <div className="text-violet-300 font-medium break-words">
                            <span className="text-violet-400 font-bold">📦 Prod:</span> {p.descripcionProducto}
                          </div>
                        )}
                        {p.referenciaDestinatario && (
                          <div className="text-slate-400 break-words">
                            <span className="text-slate-500 font-semibold">Ref:</span> {p.referenciaDestinatario}
                          </div>
                        )}
                        {p.observaciones && (
                          <div className="text-amber-300/90 font-medium break-words">
                            <span className="text-amber-400/80 font-bold">Obs Comercio:</span> {p.observaciones}
                          </div>
                        )}
                        {isCancelled && (p.motivoCancelacion || p.observacionCancelacion) && (
                          <div className="text-red-400 font-medium bg-red-500/10 p-1 rounded-lg border border-red-500/20 break-words text-[10px]" title={`${p.motivoCancelacion || ''} ${p.observacionCancelacion || ''}`}>
                            <span className="font-bold block text-[10px] text-red-300 uppercase">Motivo Cancelación:</span>
                            <span>{p.motivoCancelacion}</span>
                            {p.observacionCancelacion && <span className="text-slate-400 block text-[9px]">({p.observacionCancelacion})</span>}
                          </div>
                        )}
                        {!p.descripcionProducto && !p.referenciaDestinatario && !p.observaciones && (!isCancelled || (!p.motivoCancelacion && !p.observacionCancelacion)) && (
                          <span className="text-slate-600">-</span>
                        )}
                      </div>
                    </td>

                    {/* 5. Monto a Cobrar (Pegado inmediatamente a notas/ref) */}
                    <td className="py-3 px-1.5 font-mono whitespace-nowrap text-left">
                      <span className={`text-xs font-black block ${p.montoCobrar > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {p.montoCobrar > 0 ? `S/ ${p.montoCobrar.toFixed(2)}` : 'S/ 0.00'}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-sans">
                        {p.montoCobrar > 0 ? 'Por cobrar' : 'Pagado'}
                      </span>
                    </td>

                    {/* 6. Estado */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border whitespace-nowrap ${getEstadoBadgeClass(p.estadoPedido)}`}>
                        {p.estadoPedido}
                      </span>
                    </td>

                    {/* 7. Acciones con Iconos (WhatsApp, Llamar, GPS, Editar, Cancelar) */}
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                        {/* WhatsApp Direct Chat */}
                        <button
                          type="button"
                          onClick={() => handleOpenDirectWhatsApp(p.telefonoDestinatario, p.nombreDestinatario)}
                          className="w-7 h-7 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 flex items-center justify-center cursor-pointer transition-all hover:scale-110 shrink-0"
                          title="Chatear por WhatsApp con el cliente"
                        >
                          <MessageCircle size={13} />
                        </button>

                        {/* Llamar */}
                        <button
                          type="button"
                          onClick={() => handleOpenCall(p.telefonoDestinatario)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer transition-all hover:scale-110 shrink-0"
                          title={`Llamar al cliente (${p.telefonoDestinatario})`}
                        >
                          <Phone size={13} />
                        </button>

                        {/* GPS Destino */}
                        {p.googleMapsUrl && (
                          <a
                            href={p.googleMapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="w-7 h-7 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center justify-center cursor-pointer transition-all hover:scale-110 shrink-0"
                            title="Ver en Google Maps"
                          >
                            <Navigation size={12} />
                          </a>
                        )}

                        {/* Evidencias */}
                        {(isEntregado || p.fotoEntregaUrl || p.captureUrl) && (
                          <button
                            type="button"
                            onClick={() => setSelectedEvidenciasItem(p)}
                            className="w-7 h-7 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center cursor-pointer transition-all hover:scale-110 shrink-0"
                            title="Ver fotos de evidencias de entrega y captura del pago"
                          >
                            <Camera size={13} />
                          </button>
                        )}

                        {/* Editar */}
                        {onEditarPedido && !isCancelled && !isEntregado && (
                          <button
                            type="button"
                            onClick={() => onEditarPedido(p)}
                            className="w-7 h-7 rounded-lg bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 border border-violet-500/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer shrink-0"
                            title="Editar pedido"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}

                        {/* Cancelar / Eliminar */}
                        {onCancelarPedido && !isCancelled && !isEntregado && (
                          <button
                            type="button"
                            onClick={() => onCancelarPedido(p)}
                            className="w-7 h-7 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30 flex items-center justify-center transition-all hover:scale-110 cursor-pointer shrink-0"
                            title="Cancelar / Eliminar envío"
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

      {/* ── MODO TARJETAS (MÓVIL Y GRID EN PC) ── */}
      {vistaModo === 'tarjetas' && (
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-4 p-1 sm:p-0">
        {currentPedidos.map((p) => {
          const isCancelled = p.idEstadosPedido === 13 || (p.estadoPedido && p.estadoPedido.toLowerCase().includes('cancel'));
          const isEntregado = p.idEstadosPedido === 11 || (p.estadoPedido && p.estadoPedido.toLowerCase().includes('entregad'));
          return (
            <div key={p.idPedido} className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-3 shadow-md">
              {/* Header: Código + Estado */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => handleCopyCode(p.codigoSeguimiento, e)}
                    className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 px-2.5 py-1 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                    title="Presione para copiar código"
                  >
                    <span>{p.codigoSeguimiento}</span>
                    {isCodeCopied(p.codigoSeguimiento) ? (
                      <Check size={13} className="text-emerald-400" />
                    ) : (
                      <Copy size={13} className="text-violet-400/70" />
                    )}
                  </button>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getEstadoBadgeClass(p.estadoPedido)}`}>
                  {p.estadoPedido}
                </span>
              </div>

              {/* Badges for Driver & Store on Mobile */}
              {(mostrarMotorizado || mostrarComercio) && (
                <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                  {mostrarMotorizado && (
                    <div className="flex items-center justify-between text-yellow-300">
                      <div className="flex items-center gap-1.5 font-semibold truncate">
                        <Bike size={13} className="text-yellow-400 shrink-0" />
                        <span className="truncate">{p.nombreConductor || 'Sin Asignar'}</span>
                      </div>
                      {p.telefonoConductor && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyPhone(p.telefonoConductor!, e)}
                          className="text-[10px] font-mono bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-1.5 py-0.5 rounded text-yellow-300 flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Copiar teléfono del motorizado"
                        >
                          <Phone size={9} />
                          <span>{p.telefonoConductor}</span>
                          {copiedPhone === p.telefonoConductor ? (
                            <Check size={10} className="text-emerald-400" />
                          ) : (
                            <Copy size={10} className="text-yellow-400/70" />
                          )}
                        </button>
                      )}
                    </div>
                  )}

                  {mostrarComercio && (
                    <div className="flex items-center justify-between text-purple-300 pt-1 border-t border-slate-800/50">
                      <div className="flex items-center gap-1.5 font-semibold truncate">
                        <Store size={13} className="text-purple-400 shrink-0" />
                        <span className="truncate">{p.nombreComercial}</span>
                      </div>
                      {p.googleMapsUrlComercio && (
                        <a
                          href={p.googleMapsUrlComercio}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-400 hover:text-white shrink-0 text-[10px] inline-flex items-center gap-0.5"
                        >
                          <span>GPS</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-white font-semibold">
                  <span>Cliente: {p.nombreDestinatario}</span>
                  <span className="flex items-center gap-1 text-slate-400 font-normal">
                    <Phone size={12} />
                    {p.telefonoDestinatario}
                  </span>
                </div>

                <div className="flex items-start gap-1 text-slate-400">
                  <MapPin size={14} className="shrink-0 text-slate-500 mt-0.5" />
                  <span>{p.direccionDestinatario} ({p.distritoNombre})</span>
                </div>

                {p.descripcionProducto && (
                  <p className="text-[11px] text-violet-300 font-medium bg-violet-950/30 p-2 rounded-lg border border-violet-800/30">
                    <strong className="text-violet-400">📦 Producto:</strong> {p.descripcionProducto}
                  </p>
                )}

                {p.referenciaDestinatario && (
                  <p className="text-[11px] text-slate-500 italic pl-5">Ref: {p.referenciaDestinatario}</p>
                )}

                {p.observaciones && (
                  <p className="text-[11px] text-amber-300/80 bg-amber-900/10 p-2 rounded-lg border border-amber-800/20">
                    <strong className="text-amber-400">Obs Comercio:</strong> {p.observaciones}
                  </p>
                )}

                {isCancelled && (p.motivoCancelacion || p.observacionCancelacion) && (
                  <div className="text-[11px] text-red-300 bg-red-950/40 p-2.5 rounded-lg border border-red-500/30 space-y-0.5">
                    <span className="font-bold text-red-400 block uppercase text-[10px]">Motivo Cancelación:</span>
                    <p className="font-semibold">{p.motivoCancelacion}</p>
                    {p.observacionCancelacion && <p className="text-slate-400 text-[10px]">Detalle: {p.observacionCancelacion}</p>}
                  </div>
                )}
              </div>

              {/* Footer: Monto & Botones de Accion */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-900 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Cobro Contra Entrega:</span>
                  <span className={`font-bold ${p.montoCobrar > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {p.montoCobrar > 0 ? `S/ ${p.montoCobrar.toFixed(2)}` : 'S/ 0.00 (Pagado)'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  {/* WhatsApp Direct Chat */}
                  <button
                    type="button"
                    onClick={() => handleOpenDirectWhatsApp(p.telefonoDestinatario, p.nombreDestinatario)}
                    className="w-8 h-8 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                    title="Chatear por WhatsApp"
                  >
                    <MessageCircle size={14} />
                  </button>

                  {/* Llamar */}
                  <button
                    type="button"
                    onClick={() => handleOpenCall(p.telefonoDestinatario)}
                    className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 shadow-sm"
                    title="Llamar"
                  >
                    <Phone size={14} />
                  </button>

                  {/* GPS */}
                  {p.googleMapsUrl && (
                    <a
                      href={p.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-8 h-8 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center transition-all active:scale-95 shadow-sm"
                      title="Ver en GPS"
                    >
                      <Navigation size={13} />
                    </a>
                  )}

                  {/* Evidencias */}
                  {(isEntregado || p.fotoEntregaUrl || p.captureUrl) && (
                    <button
                      type="button"
                      onClick={() => setSelectedEvidenciasItem(p)}
                      className="w-8 h-8 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                      title="Ver fotos de evidencias de entrega y captura del pago"
                    >
                      <Camera size={14} />
                    </button>
                  )}

                  {/* Editar */}
                  {onEditarPedido && !isCancelled && !isEntregado && (
                    <button
                      type="button"
                      onClick={() => onEditarPedido(p)}
                      className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 border border-violet-500/30 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title="Editar pedido"
                    >
                      <Edit3 size={14} />
                    </button>
                  )}

                  {/* Cancelar */}
                  {onCancelarPedido && !isCancelled && !isEntregado && (
                    <button
                      type="button"
                      onClick={() => onCancelarPedido(p)}
                      className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 hover:bg-red-600/40 border border-red-500/30 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title="Cancelar / Eliminar envío"
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

      {/* ── PAGINACIÓN ── */}
      {pedidos.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-900 px-3 text-xs">
          <div className="text-slate-400">
            Mostrando <span className="font-semibold text-white">{startIndex + 1}</span> a{' '}
            <span className="font-semibold text-white">{endIndex}</span> de{' '}
            <span className="font-semibold text-white">{pedidos.length}</span> envíos
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
              >
                &lt; Anterior
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
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer"
              >
                Siguiente &gt;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Ver Evidencias */}
      <ModalVerEvidencias
        isOpen={Boolean(selectedEvidenciasItem)}
        onClose={() => setSelectedEvidenciasItem(null)}
        codigoSeguimiento={selectedEvidenciasItem?.codigoSeguimiento}
        nombreDestinatario={selectedEvidenciasItem?.nombreDestinatario}
        fotoEntregaUrl={selectedEvidenciasItem?.fotoEntregaUrl}
        captureUrl={selectedEvidenciasItem?.captureUrl}
      />
    </div>
  );
};
