import React, { useEffect } from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';

export interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  buttonText?: string;
  autoCloseMs?: number;
  badgeText?: string;
  variant?: 'success' | 'danger' | 'info';
  children?: React.ReactNode;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = '¡Operación Exitosa!',
  message = 'La acción se ha procesado correctamente en el sistema.',
  buttonText = 'Entendido',
  autoCloseMs,
  badgeText,
  variant = 'success',
  children,
}) => {
  useEffect(() => {
    if (isOpen && autoCloseMs && autoCloseMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          topBar: 'from-rose-500 via-red-400 to-rose-500 shadow-rose-500/50',
          badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-rose-500/10',
          iconBg: 'from-rose-500/20 to-red-500/10 border-rose-500/40 text-rose-400 shadow-rose-500/30',
          auraBlur: 'bg-rose-500/20',
          button: 'from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 shadow-rose-600/30 hover:shadow-rose-500/50',
          strokeColor: 'text-rose-400',
          sparkle1: 'text-rose-400/60',
          sparkle2: 'text-red-300/60',
          progressBar: 'bg-rose-500',
        };
      case 'info':
        return {
          topBar: 'from-purple-500 via-indigo-400 to-purple-500 shadow-purple-500/50',
          badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-purple-500/10',
          iconBg: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-400 shadow-purple-500/30',
          auraBlur: 'bg-purple-500/20',
          button: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30 hover:shadow-purple-500/50',
          strokeColor: 'text-purple-400',
          sparkle1: 'text-purple-400/60',
          sparkle2: 'text-indigo-300/60',
          progressBar: 'bg-purple-500',
        };
      case 'success':
      default:
        return {
          topBar: 'from-emerald-500 via-teal-300 to-emerald-500 shadow-emerald-500/50',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10',
          iconBg: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/30',
          auraBlur: 'bg-emerald-500/20',
          button: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/30 hover:shadow-emerald-500/50',
          strokeColor: 'text-emerald-400',
          sparkle1: 'text-emerald-400/60',
          sparkle2: 'text-teal-300/60',
          progressBar: 'bg-emerald-500',
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl space-y-5 text-center relative overflow-hidden animate-spring-pop">
        
        {/* Top Glowing Gradient Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${style.topBar} shadow-md`} />

        {/* Close Button X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Animated Icon Header with Sparkles & Ripple */}
        <div className="pt-3 relative flex items-center justify-center">
          <div className="relative animate-float-aura">
            {/* Outer Glowing Pulsing Ring */}
            <div className={`absolute -inset-2 rounded-3xl ${style.auraBlur} blur-lg animate-pulse`} />
            
            {/* Inner Icon Container */}
            <div className={`relative w-16 h-16 rounded-3xl bg-gradient-to-br ${style.iconBg} flex items-center justify-center shadow-xl`}>
              <svg
                className={`w-9 h-9 ${style.strokeColor}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                  className="animate-check-stroke"
                />
              </svg>
            </div>
          </div>

          {/* Sparkles Decors */}
          <Sparkles className={`absolute top-1 right-12 ${style.sparkle1} animate-bounce`} size={14} />
          <Sparkles className={`absolute bottom-1 left-12 ${style.sparkle2} animate-pulse`} size={12} />
        </div>

        {/* Content Section */}
        <div className="space-y-2 pt-1">
          {badgeText && (
            <span className={`inline-block px-3 py-1 rounded-full border text-[11px] font-bold tracking-wide shadow-sm ${style.badge}`}>
              {badgeText}
            </span>
          )}
          <h3 className="text-lg font-extrabold text-white tracking-tight leading-snug">{title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed px-2">{message}</p>
        </div>

        {/* Optional Custom Details/Children */}
        {children && <div className="pt-1">{children}</div>}

        {/* Primary Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-3 bg-gradient-to-r ${style.button} active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2`}
          >
            <span>{buttonText}</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Auto-Close Progress Bar (Visual Countdown Indicator) */}
        {autoCloseMs && autoCloseMs > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 overflow-hidden">
            <div
              className={`h-full ${style.progressBar} animate-shimmer-progress`}
              style={{ animationDuration: `${autoCloseMs}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
