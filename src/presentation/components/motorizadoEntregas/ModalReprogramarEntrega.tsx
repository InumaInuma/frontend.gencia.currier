import React from 'react';
import { X, CalendarClock } from 'lucide-react';
import type { IMonitoreoEntrega } from '../../../domain/models/IMonitoreoEntrega';

interface Props {
  rescheduleModalItem: IMonitoreoEntrega | null;
  onClose: () => void;
  motivoReprogramacion: string;
  setMotivoReprogramacion: (val: string) => void;
  onConfirmarReprogramacion: () => void;
  isPending: boolean;
}

export const ModalReprogramarEntrega: React.FC<Props> = ({
  rescheduleModalItem,
  onClose,
  motivoReprogramacion,
  setMotivoReprogramacion,
  onConfirmarReprogramacion,
  isPending,
}) => {
  if (!rescheduleModalItem) return null;

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
          <span className="text-xs text-purple-400 font-bold uppercase tracking-wider block flex items-center gap-1">
            <CalendarClock size={15} />
            Reprogramación de Entrega
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            Cliente: {rescheduleModalItem.nombreDestinatario}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Código: <span className="font-mono text-purple-300">{rescheduleModalItem.codigoSeguimiento}</span>
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block">
            Observación / Solicitud del Cliente:
          </label>
          <textarea
            value={motivoReprogramacion}
            onChange={(e) => setMotivoReprogramacion(e.target.value)}
            rows={3}
            placeholder="Ej: Cliente solicitó entregar el día de mañana por estar ausente hoy..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-purple-500 outline-none resize-none"
          />
        </div>

        <button
          type="button"
          onClick={onConfirmarReprogramacion}
          disabled={isPending}
          className="w-full py-3 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/20 active:scale-95 transition-all"
        >
          <CalendarClock size={16} />
          Guardar Reprogramación
        </button>
      </div>
    </div>
  );
};
