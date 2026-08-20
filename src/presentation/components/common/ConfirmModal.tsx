import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  badgeText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Confirmar eliminación?',
  message = 'Esta acción eliminará el registro seleccionado del sistema. ¿Deseas continuar?',
  confirmText = 'Sí, Eliminar',
  cancelText = 'Cancelar',
  badgeText = '🗑️ Acción Irreversible',
  variant = 'danger',
  isLoading = false,
  children,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          topBar: 'from-amber-500 via-orange-400 to-amber-500 shadow-amber-500/50',
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/10',
          iconBg: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-400 shadow-amber-500/30',
          auraBlur: 'bg-amber-500/20',
          confirmBtn: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30 hover:shadow-amber-500/50',
          icon: <AlertTriangle size={32} className="text-amber-400 animate-pulse" />,
        };
      case 'info':
        return {
          topBar: 'from-purple-500 via-indigo-400 to-purple-500 shadow-purple-500/50',
          badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-purple-500/10',
          iconBg: 'from-purple-500/20 to-indigo-500/10 border-purple-500/40 text-purple-400 shadow-purple-500/30',
          auraBlur: 'bg-purple-500/20',
          confirmBtn: 'from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-600/30 hover:shadow-purple-500/50',
          icon: <AlertTriangle size={32} className="text-purple-400 animate-pulse" />,
        };
      case 'danger':
      default:
        return {
          topBar: 'from-red-500 via-rose-400 to-red-500 shadow-red-500/50',
          badge: 'bg-red-500/15 text-red-300 border-red-500/30 shadow-red-500/10',
          iconBg: 'from-red-500/20 to-rose-500/10 border-red-500/40 text-red-400 shadow-red-500/30',
          auraBlur: 'bg-red-500/20',
          confirmBtn: 'from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-600/30 hover:shadow-red-500/50',
          icon: <Trash2 size={32} className="text-red-400 animate-pulse" />,
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
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X size={18} />
        </button>

        {/* Animated Warning Icon Header */}
        <div className="pt-3 flex items-center justify-center">
          <div className="relative animate-float-aura">
            {/* Outer Glowing Pulsing Ring */}
            <div className={`absolute -inset-2 rounded-3xl ${style.auraBlur} blur-lg animate-pulse`} />
            
            {/* Inner Icon Container */}
            <div className={`relative w-16 h-16 rounded-3xl bg-gradient-to-br ${style.iconBg} flex items-center justify-center shadow-xl`}>
              {style.icon}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-2 pt-1">
          {badgeText && (
            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide border shadow-sm ${style.badge}`}>
              {badgeText}
            </span>
          )}
          <h3 className="text-lg font-extrabold text-white tracking-tight leading-snug">{title}</h3>
          <p className="text-xs text-slate-300 leading-relaxed px-2">{message}</p>
        </div>

        {/* Optional Custom Card Details / Children */}
        {children && <div className="pt-1">{children}</div>}

        {/* Action Buttons (Cancel & Confirm) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-3 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`py-3 bg-gradient-to-r ${style.confirmBtn} active:scale-95 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Procesando...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
