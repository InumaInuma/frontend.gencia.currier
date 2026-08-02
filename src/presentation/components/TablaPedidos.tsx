import React from 'react';
import type { IPedido } from '../../domain/models/IPedido';
import { Copy, Phone, MapPin, ExternalLink, Share2 } from 'lucide-react';

interface Props {
  pedidos: IPedido[];
  onCopyCode: (codigo: string) => void;
  onShareWhatsApp: (codigo: string, destinatario: string, telefono: string) => void;
  copiedCode: string | null;
}

export const TablaPedidos: React.FC<Props> = ({ pedidos, onCopyCode, onShareWhatsApp, copiedCode }) => {
  return (
    <div>
      {/* DESKTOP VIEW: HTML TABLE (hidden on mobile, visible on md+) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <th className="pb-3 px-3">Código Envío</th>
              <th className="pb-3 px-3">Cliente / Celular</th>
              <th className="pb-3 px-3">Distrito & Dirección</th>
              <th className="pb-3 px-3">Notas / Ref.</th>
              <th className="pb-3 px-3">Cobro Delivery</th>
              <th className="pb-3 px-3">Estado</th>
              <th className="pb-3 px-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {pedidos.map((pedido) => (
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

                {/* 2. Cliente Destinatario */}
                <td className="py-3.5 px-3">
                  <div className="font-semibold text-white">{pedido.nombreDestinatario}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Phone size={11} className="text-slate-500" />
                    {pedido.telefonoDestinatario}
                  </div>
                </td>

                {/* 3. Dirección & Distrito */}
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

                {/* 4. Notas / Ref */}
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

                {/* 5. Monto a Cobrar */}
                <td className="py-3.5 px-3 font-semibold">
                  <span className={pedido.montoCobrar > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                    {pedido.montoCobrar > 0 ? `S/ ${pedido.montoCobrar.toFixed(2)}` : 'S/ 0.00 (Pagado)'}
                  </span>
                </td>

                {/* 6. Estado Badge */}
                <td className="py-3.5 px-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    pedido.estadoNombre === 'Registrado' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : pedido.estadoNombre === 'En Camino'
                      ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}>
                    {pedido.estadoNombre}
                  </span>
                </td>

                {/* 7. Acciones */}
                <td className="py-3.5 px-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onShareWhatsApp(pedido.codigoSeguimiento, pedido.nombreDestinatario, pedido.telefonoDestinatario)}
                      className="inline-flex items-center gap-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      title="Compartir por WhatsApp"
                    >
                      <Share2 size={12} />
                      WSp
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW: TOUCH CARDS (visible on mobile, hidden on md+) */}
      <div className="block md:hidden space-y-4">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
            
            {/* Header: Tracking Code & Status */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
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

              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                pedido.estadoNombre === 'Registrado' 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : pedido.estadoNombre === 'En Camino'
                  ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                {pedido.estadoNombre}
              </span>
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
                <span>{pedido.direccionDestinatario} ({pedido.distritoNombre})</span>
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
                <span className="text-slate-500 block text-[11px]">Cobro Contra Entrega:</span>
                <span className={`font-bold ${pedido.montoCobrar > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {pedido.montoCobrar > 0 ? `S/ ${pedido.montoCobrar.toFixed(2)}` : 'S/ 0.00 (Pagado)'}
                </span>
              </div>

              <button
                onClick={() => onShareWhatsApp(pedido.codigoSeguimiento, pedido.nombreDestinatario, pedido.telefonoDestinatario)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-2 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                <Share2 size={13} />
                WhatsApp
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
