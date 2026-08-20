import React from 'react';
import { CheckCircle2, Clock, Copy, Share2, Plus } from 'lucide-react';
import { isAfterCutoffTimePeru } from '../../../infrastructure/utils/peruTime';

interface Props {
  createdTrackingCode: string | null;
  copied: boolean;
  handleCopyCode: () => void;
  handleShareWhatsApp: () => void;
  handleNuevoEnvio: () => void;
  onGoToDashboard: () => void;
}

export const ModalExitoEnvio: React.FC<Props> = ({
  createdTrackingCode,
  copied,
  handleCopyCode,
  handleShareWhatsApp,
  handleNuevoEnvio,
  onGoToDashboard,
}) => {
  if (!createdTrackingCode) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 text-center text-white relative">
        {/* Emerald checkmark badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 size={36} />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">¡Envío Agendado con Éxito! 🎉</h2>
          <p className="text-xs text-slate-400 mt-1">
            Se generó automáticamente el código de seguimiento para tu cliente.
          </p>
        </div>

        {/* Tracking code container */}
        <div className="bg-slate-950 border border-violet-500/40 rounded-2xl p-4 shadow-inner">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            CÓDIGO DE SEGUIMIENTO
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-300 tracking-wider">
            {createdTrackingCode}
          </div>
        </div>

        {/* Peru Cutoff Time Warning */}
        {isAfterCutoffTimePeru() && (
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
              <Clock size={15} className="shrink-0 text-amber-400" />
              <span>Tu pedido fue agendado después de las 09:30 AM (Hora Perú)</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 pl-2.5 border-l-2 border-amber-500/40">
              <p>• <strong>Si el motorizado aún no recoge hoy:</strong> El admin podrá incluirlo en la ruta del día.</p>
              <p>• <strong>Si el motorizado ya recogió hoy:</strong> Se recogerá y entregará mañana.</p>
            </div>
          </div>
        )}

        {/* Buttons: Copy & Share WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 px-3.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
          >
            <Copy size={15} />
            {copied ? '¡Copiado!' : 'Copiar Código'}
          </button>
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer"
          >
            <Share2 size={15} />
            Enviar por WhatsApp
          </button>
        </div>

        {/* Action buttons: Reset form / Dashboard */}
        <div className="pt-2 space-y-3">
          <button
            type="button"
            onClick={handleNuevoEnvio}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm py-3.5 px-4 rounded-xl shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
          >
            <Plus size={18} />
            Agendar Otro Envío
          </button>
          <div>
            <button
              type="button"
              onClick={onGoToDashboard}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer transition-colors"
            >
              Ver historial de envíos →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
