import React from 'react';
import { X, XCircle } from 'lucide-react';
import type { IMonitoreoEntrega } from '../../../domain/models/IMonitoreoEntrega';

interface Props {
  failedModalItem: IMonitoreoEntrega | null;
  onClose: () => void;
  motivoFallo: string;
  setMotivoFallo: (val: string) => void;
  onConfirmarNoEntregado: () => void;
  isPending: boolean;
}

export const ModalIntentoFallido: React.FC<Props> = ({
  failedModalItem,
  onClose,
  motivoFallo,
  setMotivoFallo,
  onConfirmarNoEntregado,
  isPending,
}) => {
  if (!failedModalItem) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50 cursor-pointer"
        >
          <X size={18} />
        </button>

        <div>
          <span className="text-xs text-red-400 font-bold uppercase tracking-wider block flex items-center gap-1">
            <XCircle size={15} />
            Registro de Intento Fallido (No Entregado)
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            Cliente: {failedModalItem.nombreDestinatario}
          </h3>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">Motivo de no entrega:</label>
          <select
            value={motivoFallo}
            onChange={(e) => setMotivoFallo(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-red-500 outline-none"
          >
            <option value="Cliente ausente / No responde llamadas">Cliente ausente / No responde llamadas</option>
            <option value="Dirección incorrecta o no encontrada">Dirección incorrecta o no encontrada</option>
            <option value="Cliente rechaza pedido / No tiene efectivo">Cliente rechaza pedido / No tiene efectivo</option>
            <option value="Zona inaccesible / Problema de seguridad">Zona inaccesible / Problema de seguridad</option>
          </select>
        </div>

        <button
          type="button"
          onClick={onConfirmarNoEntregado}
          disabled={isPending}
          className="w-full py-3.5 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/20 active:scale-95 transition-all"
        >
          <XCircle size={18} />
          Confirmar Intento Fallido
        </button>
      </div>
    </div>
  );
};
