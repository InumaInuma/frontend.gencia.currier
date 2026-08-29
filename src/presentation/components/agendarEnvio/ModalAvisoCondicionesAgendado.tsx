import React, { useState, useEffect } from 'react';
import { Clock, Package, CheckCircle2, X, ShieldAlert } from 'lucide-react';
import { getPeruTimeString } from '../../../infrastructure/utils/peruTime';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalAvisoCondicionesAgendado: React.FC<Props> = ({ isOpen, onClose }) => {
  const [horaPeru, setHoraPeru] = useState<string>(getPeruTimeString());

  useEffect(() => {
    if (!isOpen) return;

    // Actualiza la hora de Perú en tiempo real cada 10 segundos
    const interval = setInterval(() => {
      setHoraPeru(getPeruTimeString());
    }, 10000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl space-y-4 relative overflow-hidden transform transition-all animate-scale-up max-h-[85vh] sm:max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        {/* Header Modal (Fixed Top) */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/10">
              <ShieldAlert size={24} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                Aviso de Agendado & Políticas
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Información importante para la programación de tus envíos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            title="Cerrar aviso"
          >
            <X size={18} />
          </button>
        </div>

        {/* Time Pill Badge (Fixed Top) */}
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-amber-400 animate-spin-slow shrink-0" />
            <span>Aviso de Horario — <strong>Hora Oficial Perú:</strong></span>
          </div>
          <span className="font-mono font-extrabold text-white text-xs sm:text-sm bg-slate-950 px-2.5 py-1 rounded-xl border border-amber-500/40 shrink-0">
            {horaPeru}
          </span>
        </div>

        {/* Scrollable Notice Body */}
        <div className="overflow-y-auto pr-1 space-y-4 text-xs flex-1 custom-scrollbar">
          {/* Item 1: Horario de Corte 09:30 AM */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-500/20 flex items-center justify-center font-mono text-amber-300 border border-amber-500/30 text-xs shrink-0">
                1
              </span>
              <span>HORARIO DE CORTE Y PROGRAMACIÓN DE CORREOS (09:30 AM)</span>
            </div>

            <p className="text-slate-300 leading-relaxed sm:pl-8 text-[11px] sm:text-xs">
              Envíos agendados después de las <strong className="text-amber-300 font-mono">09:30 AM</strong> se programan para el <strong className="text-white">siguiente día hábil</strong>.
            </p>

            <div className="sm:ml-8 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-300 text-[11px] leading-relaxed">
              <strong className="text-amber-300 block mb-0.5">⚠️ OJO:</strong>
              Si el motorizado aún no ha llegado a recoger los pedidos que registraste antes de las 09:30 AM, podrá recoger y entregar el mismo día tu nuevo envío. De lo contrario, será recogido y entregado al día siguiente.
            </div>
          </div>

          {/* Item 2: Recargo por Volumen */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5 hover:border-slate-700 transition-colors">
            <div className="flex items-center gap-2 text-purple-400 font-extrabold text-xs">
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-purple-500/20 flex items-center justify-center font-mono text-purple-300 border border-purple-500/30 text-xs shrink-0">
                2
              </span>
              <span>VOLUMEN Y TAMAÑO DE PAQUETE</span>
            </div>

            <p className="text-slate-300 leading-relaxed sm:pl-8 text-[11px] sm:text-xs">
              Si el volumen del paquete es <strong className="text-purple-300">mayor o igual a una caja de zapatillas estándar</strong>, se le cobrará un adicional en <strong className="text-white">plena coordinación directa con el equipo administrativo</strong>.
            </p>

            <div className="sm:ml-8 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-slate-300 text-[11px] space-y-1">
              <div className="font-semibold text-purple-300 flex items-center gap-1.5">
                <Package size={13} />
                <span>Medidas de Referencia (Caja Estándar):</span>
              </div>
              <p className="font-mono text-white font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg border border-purple-500/30 inline-block text-xs">
                34 cm (Largo) × 23 cm (Ancho) × 12 cm (Alto)
              </p>
              <p className="text-[10px] text-slate-400">
                (Varía ligeramente según calzado: Mujer 33×20×13 cm | Hombre 35×22×14 cm)
              </p>
            </div>
          </div>
        </div>

        {/* Action CTA (Fixed Bottom) */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium text-center sm:text-left">
            Al continuar acepto las condiciones de agendado y entrega.
          </span>

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-xl shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
          >
            <CheckCircle2 size={16} />
            <span>Comprendido, Continuar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
