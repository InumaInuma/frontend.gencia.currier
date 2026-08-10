import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Share, PlusSquare } from 'lucide-react';

interface InstallPwaButtonProps {
  className?: string;
  variant?: 'full' | 'compact' | 'pill';
}

export const InstallPwaButton: React.FC<InstallPwaButtonProps> = ({
  className = '',
  variant = 'full',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Detectar si la app ya corre en modo Standalone (instalada)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      // Standalone app mode
    }

    // Detectar si el usuario está en iOS (Safari/Chrome en iPhone o iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIpadOrIphone = /iphone|ipad|ipod/.test(userAgent);
    if (isIpadOrIphone && !isStandalone) {
      setIsIOS(true);
    }

    // Escuchar el evento nativo del navegador 'beforeinstallprompt'
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevenir el prompt automático por defecto
      setDeferredPrompt(e); // Guardar el evento en estado
    };

    // Escuchar cuando el usuario completa la instalación
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Disparar el diálogo nativo de instalación del navegador
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Mostrar modal instructivo para usuarios de iPhone/iPad
      setShowIOSModal(true);
    } else {
      // Fallback para navegadores que soportan PWA de forma directa en su menú
      alert(
        '📱 Para instalar ALMAIN CURRIER:\nEn el menú de tu navegador (⋮), selecciona "Instalar Aplicación" o "Agregar a Pantalla de Inicio".'
      );
    }
  };

  // Render button across all devices / browsers
  return (
    <>
      {variant === 'compact' ? (
        <button
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-violet-500/20 transition-all duration-200 cursor-pointer active:scale-95 ${className}`}
          title="Descargar App ALMAIN CURRIER"
        >
          <Download className="w-4 h-4 text-violet-200 animate-bounce shrink-0" />
        </button>
      ) : variant === 'pill' ? (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-full bg-violet-600/90 hover:bg-violet-500 text-white text-xs font-semibold border border-violet-400/30 shadow-md shadow-violet-900/30 transition-all duration-200 cursor-pointer active:scale-95 ${className}`}
        >
          <Smartphone className="w-4 h-4 text-violet-200 shrink-0" />
          <span>Instalar App</span>
        </button>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-violet-600/20 border border-violet-400/30 transition-all duration-200 cursor-pointer active:scale-[0.98] ${className}`}
          title="Descargar e Instalar App ALMAIN CURRIER"
        >
          <Download className="w-4 h-4 text-violet-200 animate-bounce shrink-0" />
          <span className="truncate">Descargar App</span>
        </button>
      )}

      {/* Modal Instructivo exclusivo para iOS (Safari iPhone/iPad) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20">
                <Smartphone className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Instalar ALMAIN CURRIER</h3>
                <p className="text-xs text-slate-400">Instrucciones para iPhone & iPad</p>
              </div>
            </div>

            <div className="space-y-3 my-5 text-sm text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 text-white font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <p className="flex-1 text-xs">
                  Toca el botón <span className="font-semibold text-violet-300">Compartir</span> <Share className="inline w-3.5 h-3.5 mx-1 text-violet-400" /> en la barra inferior de Safari.
                </p>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-600 text-white font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <p className="flex-1 text-xs">
                  Desplázate hacia abajo y presiona <span className="font-semibold text-violet-300">Agregar a inicio</span> <PlusSquare className="inline w-3.5 h-3.5 mx-1 text-violet-400" />.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
