import React from 'react';
import { Phone, MapPin, ExternalLink } from 'lucide-react';
import type { IMonitoreoRecojo } from '../../domain/models/IMonitoreoRecojo';

interface Props {
  pedidos: IMonitoreoRecojo[];
}

function getEstadoBadgeClass(estado: string): string {
  const e = estado.toLowerCase();
  if (e.includes('recogido') || e.includes('completado')) {
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }
  if (e.includes('camino') || e.includes('transito')) {
    return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  }
  return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
}

export const TablaMonitoreoRecojo: React.FC<Props> = ({ pedidos }) => {
  return (
    <div>
      {/* ── DESKTOP: HTML TABLE ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <th className="pb-3 px-3">Código Envío</th>
              <th className="pb-3 px-3">Destinatario / Celular</th>
              <th className="pb-3 px-3">Distrito &amp; Dirección</th>
              <th className="pb-3 px-3">Notas / Ref.</th>
              <th className="pb-3 px-3">Cobro</th>
              <th className="pb-3 px-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {pedidos.map((p) => (
              <tr key={p.idPedido} className="hover:bg-slate-900/50 transition-colors">

                {/* 1. Código de Seguimiento */}
                <td className="py-3.5 px-3">
                  <span className="font-mono font-bold text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-lg">
                    {p.codigoSeguimiento}
                  </span>
                </td>

                {/* 2. Destinatario */}
                <td className="py-3.5 px-3">
                  <div className="font-semibold text-white">{p.nombreDestinatario}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Phone size={11} className="text-slate-500" />
                    {p.telefonoDestinatario}
                  </div>
                </td>

                {/* 3. Dirección & Distrito */}
                <td className="py-3.5 px-3 max-w-xs">
                  <div className="font-medium text-slate-200 truncate" title={p.direccionDestinatario}>
                    {p.direccionDestinatario}
                  </div>
                  <div className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                    <MapPin size={11} />
                    {p.distritoNombre}
                    {p.googleMapsUrl && (
                      <a
                        href={p.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white ml-1 inline-flex items-center"
                        title="Ver mapa GPS del destino"
                      >
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </td>

                {/* 4. Notas / Ref. */}
                <td className="py-3.5 px-3 max-w-xs text-xs text-slate-400">
                  {p.referenciaDestinatario && (
                    <div className="truncate" title={p.referenciaDestinatario}>
                      <span className="text-slate-500 font-semibold">Ref:</span> {p.referenciaDestinatario}
                    </div>
                  )}
                  {p.observaciones && (
                    <div className="truncate text-slate-400 italic" title={p.observaciones}>
                      <span className="text-slate-500 font-semibold">Obs:</span> {p.observaciones}
                    </div>
                  )}
                  {!p.referenciaDestinatario && !p.observaciones && (
                    <span className="text-slate-600">-</span>
                  )}
                </td>

                {/* 5. Monto a Cobrar */}
                <td className="py-3.5 px-3 font-semibold">
                  <span className={p.montoCobrar > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                    {p.montoCobrar > 0 ? `S/ ${p.montoCobrar.toFixed(2)}` : 'S/ 0.00 (Pagado)'}
                  </span>
                </td>

                {/* 6. Estado Badge */}
                <td className="py-3.5 px-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getEstadoBadgeClass(p.estadoPedido)}`}>
                    {p.estadoPedido}
                  </span>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE: CARDS ── */}
      <div className="block md:hidden space-y-4 p-4">
        {pedidos.map((p) => (
          <div key={p.idPedido} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">

            {/* Header: Código + Estado */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
                {p.codigoSeguimiento}
              </span>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getEstadoBadgeClass(p.estadoPedido)}`}>
                {p.estadoPedido}
              </span>
            </div>

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

              {p.referenciaDestinatario && (
                <p className="text-[11px] text-slate-500 italic pl-5">Ref: {p.referenciaDestinatario}</p>
              )}

              {p.observaciones && (
                <p className="text-[11px] text-amber-300/80 bg-amber-900/10 p-2 rounded-lg border border-amber-800/20">
                  Obs: {p.observaciones}
                </p>
              )}
            </div>

            {/* Footer: Monto */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Cobro Contra Entrega:</span>
                <span className={`font-bold ${p.montoCobrar > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {p.montoCobrar > 0 ? `S/ ${p.montoCobrar.toFixed(2)}` : 'S/ 0.00 (Pagado)'}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
