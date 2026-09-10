import React, { useState } from 'react';
import { X, Camera, Receipt, ExternalLink, ImageOff } from 'lucide-react';
import { getApiBaseUrl } from '../../../infrastructure/api/apiClient';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  codigoSeguimiento?: string;
  nombreDestinatario?: string;
  fotoEntregaUrl?: string | null;
  captureUrl?: string | null;
}

export const resolveImageUrl = (url?: string | null): string => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  const baseUrl = getApiBaseUrl();
  if (baseUrl) {
    return `${baseUrl}${cleanPath}`;
  }
  return `http://18.219.36.15${cleanPath}`;
};

export const ModalVerEvidencias: React.FC<Props> = ({
  isOpen,
  onClose,
  codigoSeguimiento,
  nombreDestinatario,
  fotoEntregaUrl,
  captureUrl,
}) => {
  const [errorFoto, setErrorFoto] = useState(false);
  const [errorCapture, setErrorCapture] = useState(false);

  if (!isOpen) return null;

  const resolvedFotoUrl = resolveImageUrl(fotoEntregaUrl);
  const resolvedCaptureUrl = resolveImageUrl(captureUrl);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
              Evidencias Fotográficas de Entrega
            </span>
            <h3 className="text-lg font-extrabold text-white mt-0.5 flex items-center gap-2">
              Pedido {codigoSeguimiento || ''}
              {nombreDestinatario && (
                <span className="text-xs text-slate-400 font-normal">({nombreDestinatario})</span>
              )}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content: 2 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Foto de Entrega */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Camera size={16} /> Foto de Entrega
              </span>
              {resolvedFotoUrl && (
                <a
                  href={resolvedFotoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Abrir original <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-800/60 flex items-center justify-center">
              {resolvedFotoUrl && !errorFoto ? (
                <img
                  src={resolvedFotoUrl}
                  alt="Foto de entrega"
                  onError={() => setErrorFoto(true)}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500 p-4 text-center">
                  <ImageOff size={32} className="text-slate-600" />
                  <span className="text-xs">
                    {resolvedFotoUrl ? 'No se pudo cargar la imagen' : 'Sin foto de entrega registrada'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Captura del Pago / Comprobante */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Receipt size={16} /> Captura del Pago
              </span>
              {resolvedCaptureUrl && (
                <a
                  href={resolvedCaptureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Abrir original <ExternalLink size={12} />
                </a>
              )}
            </div>

            <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden border border-slate-800/60 flex items-center justify-center">
              {resolvedCaptureUrl && !errorCapture ? (
                <img
                  src={resolvedCaptureUrl}
                  alt="Captura del pago"
                  onError={() => setErrorCapture(true)}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500 p-4 text-center">
                  <ImageOff size={32} className="text-slate-600" />
                  <span className="text-xs">
                    {resolvedCaptureUrl ? 'No se pudo cargar el comprobante' : 'Sin comprobante de pago adjuntado'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
