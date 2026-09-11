import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle2 } from 'lucide-react';

interface IOSInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5 animate-scale-up">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        {/* Header with App Identity */}
        <div className="flex items-center gap-3.5 pr-6">
          <img
            src="/icons/icon-192.png"
            alt="Fragata Courier"
            className="w-12 h-12 rounded-2xl object-contain bg-white p-1 shadow-lg shadow-red-500/20 border border-slate-700 shrink-0"
          />
          <div>
            <h3 className="font-extrabold text-base text-white leading-tight">
              Instalar en iPhone & iPad
            </h3>
            <p className="text-[11px] text-red-400 font-bold mt-0.5">
              FRAGATA COURIER iOS App
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Sigue estos 2 sencillos pasos en Safari para tener la aplicación en tu pantalla de inicio sin usar App Store:
        </p>

        {/* Step-by-step visual instructions */}
        <div className="space-y-3">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs shrink-0 mt-0.5">
              1
            </span>
            <div className="text-xs space-y-1">
              <p className="text-slate-200">
                Toca el botón <strong className="text-white">Compartir</strong> en la barra inferior de Safari.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">
                <Share size={13} className="text-blue-400" />
                <span>Ícono con flecha hacia arriba</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs shrink-0 mt-0.5">
              2
            </span>
            <div className="text-xs space-y-1">
              <p className="text-slate-200">
                Desliza hacia abajo y presiona <strong className="text-white">"Agregar a inicio"</strong>.
              </p>
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-[11px]">
                <PlusSquare size={13} className="text-emerald-400" />
                <span>Añadir a pantalla de inicio</span>
              </div>
            </div>
          </div>
        </div>

        {/* Benefit hint */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
          <CheckCircle2 size={15} className="shrink-0" />
          <span>¡Listo! Se abrirá en pantalla completa sin barra de navegación.</span>
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all cursor-pointer"
        >
          ¡Entendido, agregar a mi iPhone!
        </button>
      </div>
    </div>
  );
};

export default IOSInstallModal;
