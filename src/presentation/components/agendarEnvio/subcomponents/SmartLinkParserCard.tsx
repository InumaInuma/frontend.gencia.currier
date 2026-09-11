import React from 'react';
import { Sparkles, Clipboard, Loader2, Target, MapPin } from 'lucide-react';

interface Props {
  linkInput: string;
  setLinkInput: (val: string) => void;
  isProcessingLink: boolean;
  handleProcessLink: (textToProcess?: string) => void;
  handlePasteFromClipboard: () => void;
  googleMapsUrl?: string;
  setGoogleMapsUrl?: (val: string) => void;
}

export const SmartLinkParserCard: React.FC<Props> = ({
  linkInput,
  setLinkInput,
  isProcessingLink,
  handleProcessLink,
  handlePasteFromClipboard,
  googleMapsUrl,
  setGoogleMapsUrl,
}) => {
  const currentUrl = linkInput || googleMapsUrl || '';

  return (
    <div className="bg-gradient-to-r from-violet-950/70 via-slate-900/90 to-slate-900/90 border border-violet-500/30 rounded-3xl p-5 sm:p-6 shadow-xl space-y-3 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600/30 text-violet-300 border border-violet-500/40 flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">
              4. Pegar Ubicación o Link enviado por el cliente (WhatsApp / Google Maps)
            </h2>
            <p className="text-[11px] text-slate-400">
              Pega aquí el enlace de WhatsApp (ej: <span className="text-violet-300 font-mono">https://maps.app.goo.gl/...</span>) o las coordenadas y el mapa se ubicará de inmediato.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
        <div className="relative flex-1 w-full">
          <Clipboard size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={linkInput}
            onChange={(e) => {
              const val = e.target.value;
              setLinkInput(val);
              if (setGoogleMapsUrl) setGoogleMapsUrl(val);
              if (val.trim().length > 10) {
                handleProcessLink(val);
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pastedText = e.clipboardData.getData('text');
              if (pastedText) {
                const cleanText = pastedText.trim();
                setLinkInput(cleanText);
                if (setGoogleMapsUrl) setGoogleMapsUrl(cleanText);
                handleProcessLink(cleanText);
              }
            }}
            placeholder="Pega aquí el link corto o coordenadas enviadas por el cliente..."
            className="w-full bg-slate-950/90 border border-violet-500/30 text-white text-xs sm:text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:border-violet-400 transition-colors shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="flex-1 sm:flex-none px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Pegar desde el portapapeles"
          >
            <Clipboard size={14} />
            <span>Pegar</span>
          </button>

          <button
            type="button"
            onClick={() => handleProcessLink()}
            disabled={isProcessingLink || !linkInput.trim()}
            className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-violet-600/30 cursor-pointer"
          >
            {isProcessingLink ? <Loader2 size={14} className="animate-spin" /> : <Target size={14} />}
            <span>{isProcessingLink ? 'Procesando...' : 'Ubicar en Mapa'}</span>
          </button>
        </div>
      </div>

      {/* Google Maps link preview & shortcut button */}
      {currentUrl && (
        <div className="pt-1 flex items-center justify-between">
          <a
            href={currentUrl.startsWith('http') ? currentUrl : `https://${currentUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-violet-400 hover:text-violet-300 font-medium inline-flex items-center gap-1.5 hover:underline transition-all"
          >
            <MapPin size={13} className="text-violet-400" />
            <span>Abrir en Google Maps</span>
          </a>
        </div>
      )}
    </div>
  );
};
