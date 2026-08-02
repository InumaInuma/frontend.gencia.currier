import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect if already running standalone (installed as app)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIpadOrIphone = /iphone|ipad|ipod/.test(userAgent);
    if (isIpadOrIphone && !isStandalone) {
      setIsIOS(true);
    }

    // Capture native beforeinstallprompt event (Android / Windows / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('🎉 PWA Dream Drivers instalada exitosamente');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Respuesta de instalación PWA: ${outcome}`);
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert(
        '📱 Para instalar Dream Drivers en tu iPhone/iPad:\n1. Toca el botón "Compartir" en Safari (cuadro con flecha arriba).\n2. Selecciona "Agregar a pantalla de inicio".'
      );
    } else {
      // Direct user fallback instructions
      alert(
        '📱 Para instalar Dream Drivers como App:\nEn tu navegador Chrome/Edge/Samsung, presiona el menú de 3 puntos (⋮) y elige "Instalar Aplicación" o "Agregar a Pantalla Principal".'
      );
    }
  };

  return {
    isInstallable,
    isInstalled,
    isIOS,
    promptInstall,
  };
};
