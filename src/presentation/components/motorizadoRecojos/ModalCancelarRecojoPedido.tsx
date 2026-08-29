import React, { useState } from 'react';
import { AlertOctagon, X, PackageX, CheckCircle2, MessageSquare } from 'lucide-react';
import type { IMonitoreoRecojo } from '../../../domain/models/IMonitoreoRecojo';

interface Props {
  pedido: IMonitoreoRecojo | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: (idPedido: number, motivo: string, observaciones: string) => Promise<void>;
  isPending: boolean;
}

const MOTIVOS_CANCELACION = [
  'Exceso de Volumen / Supera tamaño permitido (> 1 caja de zapatillas)',
  'Empaque no preparado / Comercio no entregó producto',
  'Comercio o Cliente solicitó cancelar este pedido',
  'Dirección o referencia del recojo incorrecta',
  'Otro motivo de fuerza mayor'
];

export const ModalCancelarRecojoPedido: React.FC<Props> = ({
  pedido,
  isOpen,
  onClose,
  onConfirmCancel,
  isPending
}) => {
  const [motivo, setMotivo] = useState<string>(MOTIVOS_CANCELACION[0]);
  const [observaciones, setObservaciones] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen || !pedido) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo) {
      setErrorMsg('Debe seleccionar un motivo de cancelación.');
      return;
    }

    try {
      setErrorMsg('');
      await onConfirmCancel(pedido.idPedido, motivo, observaciones);
      setObservaciones('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la cancelación del pedido.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl -z-10" />

        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/10">
              <PackageX size={26} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                Cancelar Recojo de Paquete
              </h3>
              <p className="text-xs text-slate-400">
                Aviso de no recojo de envío individual en el comercio
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X size={18} />
          </button>
        </div>

        {/* Package Summary Badge */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-lg">
              {pedido.codigoSeguimiento}
            </span>
            <span className="text-slate-400">Destino: <strong className="text-white">{pedido.distritoNombre}</strong></span>
          </div>
          <p className="text-slate-300 font-semibold pt-1">
            Cliente: {pedido.nombreDestinatario} ({pedido.telefonoDestinatario})
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertOctagon size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1.5 uppercase text-[11px] tracking-wider">
              Motivo Principal de Cancelación *
            </label>
            <select
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs outline-none focus:border-red-500 transition-all font-medium cursor-pointer"
            >
              {MOTIVOS_CANCELACION.map((m, idx) => (
                <option key={idx} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1.5 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
              <MessageSquare size={13} className="text-slate-400" />
              <span>Observaciones / Detalle Adicional (Opcional)</span>
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Paquete contiene 3 cajas de zapatos grandes y no cabe en la moto..."
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 text-xs outline-none focus:border-red-500 transition-all placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 font-bold transition-all cursor-pointer text-xs"
            >
              Volver Atrás
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <PackageX size={16} />
                  <span>Confirmar Cancelación de Envió</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
