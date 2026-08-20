import React from 'react';
import { Store, MapPin, ExternalLink, ChevronUp, ChevronDown, Phone } from 'lucide-react';
import type { IPedido } from '../../../domain/models/IPedido';

export interface ComercioPendingGroup {
  idComercio: number;
  nombreComercial: string;
  razonSocial: string;
  ruc: string;
  direccionRecojo: string;
  referenciaRecojo?: string;
  telefonoComercio?: string;
  googleMapsUrl?: string;
  pedidos: IPedido[];
  totalMontoCobrar: number;
}

interface Props {
  group: ComercioPendingGroup;
  isOpen: boolean;
  onToggleAccordion: (id: number) => void;
  selectedPedidoIds: number[];
  onTogglePedido: (pedidoId: number) => void;
  onToggleComercioAll: (group: ComercioPendingGroup) => void;
}

export const AcordeonComercioRecojo: React.FC<Props> = ({
  group,
  isOpen,
  onToggleAccordion,
  selectedPedidoIds,
  onTogglePedido,
  onToggleComercioAll,
}) => {
  const groupPedidoIds = group.pedidos.map((p) => p.id);
  const isComercioFullySelected =
    groupPedidoIds.length > 0 && groupPedidoIds.every((id) => selectedPedidoIds.includes(id));
  const isComercioPartiallySelected =
    groupPedidoIds.some((id) => selectedPedidoIds.includes(id)) && !isComercioFullySelected;

  return (
    <div
      className={`bg-slate-900/40 border rounded-2xl overflow-hidden shadow-xl transition-all ${
        isComercioFullySelected
          ? 'border-emerald-500/40 bg-emerald-950/10'
          : 'border-slate-900'
      }`}
    >
      {/* Commerce Group Header Bar */}
      <div
        onClick={() => onToggleAccordion(group.idComercio)}
        className="p-5 bg-gradient-to-r from-slate-900 via-slate-900/90 to-violet-950/20 border-b border-slate-900 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Select All Checkbox for Commerce */}
          <input
            type="checkbox"
            checked={isComercioFullySelected}
            ref={(el) => {
              if (el) el.indeterminate = isComercioPartiallySelected;
            }}
            onChange={() => onToggleComercioAll(group)}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
          />

          <div className="w-10 h-10 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-extrabold text-sm shrink-0">
            <Store size={20} />
          </div>

          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                {group.nombreComercial}
              </h3>
              <span className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                RUC: {group.ruc}
              </span>
            </div>

            <p className="text-xs text-violet-300 flex items-center gap-1.5 mt-1">
              <MapPin size={14} className="text-violet-400 shrink-0" />
              {group.direccionRecojo}
              {group.referenciaRecojo && (
                <span className="text-slate-400 font-medium">({group.referenciaRecojo})</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {group.googleMapsUrl && (
            <a
              href={group.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              <ExternalLink size={13} />
              GPS Mapa
            </a>
          )}

          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
            {group.pedidos.length} {group.pedidos.length === 1 ? 'Paquete' : 'Paquetes'}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAccordion(group.idComercio);
            }}
            className="p-2 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
          >
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Commerce Details & Package Table */}
      {isOpen && (
        <div className="p-4 sm:p-6 space-y-4">
          {group.telefonoComercio && (
            <div className="text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-2">
              <Phone size={14} className="text-violet-400" />
              <span>
                Teléfono de contacto comercio: <strong className="text-white">{group.telefonoComercio}</strong>
              </span>
            </div>
          )}

          {/* Package Table Component */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-900 text-slate-400 uppercase font-semibold text-[11px] bg-slate-950/40">
                  <th className="p-3 w-10 text-center">Sel.</th>
                  <th className="p-3">Código Envío</th>
                  <th className="p-3">Destinatario / Celular</th>
                  <th className="p-3">Distrito & Dirección</th>
                  <th className="p-3">Notas / Ref.</th>
                  <th className="p-3 text-right">Cobro Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {group.pedidos.map((pedido) => {
                  const isChecked = selectedPedidoIds.includes(pedido.id);

                  return (
                    <tr
                      key={`pedido_recojo_${pedido.id}`}
                      onClick={() => onTogglePedido(pedido.id)}
                      className={`cursor-pointer transition-colors hover:bg-slate-900/80 ${
                        isChecked ? 'bg-emerald-500/10' : ''
                      }`}
                    >
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onTogglePedido(pedido.id)}
                          className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                        />
                      </td>

                      <td className="p-3 font-mono font-bold text-violet-300">
                        {pedido.codigoSeguimiento}
                      </td>

                      <td className="p-3">
                        <span className="font-semibold text-white">{pedido.nombreDestinatario}</span>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Phone size={11} /> {pedido.telefonoDestinatario}
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="font-bold text-slate-200">{pedido.distritoNombre}</span>
                        <div className="text-[11px] text-slate-400 truncate">{pedido.direccionDestinatario}</div>
                      </td>

                      <td className="p-3 max-w-xs">
                        {pedido.referenciaDestinatario && (
                          <div className="text-[11px] text-slate-300 truncate">
                            Ref: {pedido.referenciaDestinatario}
                          </div>
                        )}
                        {pedido.observaciones && (
                          <div className="text-[11px] text-slate-400 truncate">
                            Obs: {pedido.observaciones}
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-right font-mono font-extrabold text-emerald-400">
                        S/ {pedido.montoCobrar.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
