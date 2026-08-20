import React from 'react';
import { User, Phone, FileText, ChevronRight, AlertCircle } from 'lucide-react';

interface Props {
  nombreRemitente: string;
  setNombreRemitente: (val: string) => void;
  nombreDestinatario: string;
  setNombreDestinatario: (val: string) => void;
  telefonoDestinatario: string;
  setTelefonoDestinatario: (val: string) => void;
  esContraEntrega: boolean;
  setEsContraEntrega: (val: boolean) => void;
  montoCobrar: number | '';
  setMontoCobrar: (val: number | '') => void;
  destinatarioPagaEnvio: boolean;
  setDestinatarioPagaEnvio: (val: boolean) => void;
  observaciones: string;
  setObservaciones: (val: string) => void;
  step1Error: string;
  handleNext: () => void;
}

export const Paso1DatosEnvio: React.FC<Props> = ({
  nombreRemitente,
  setNombreRemitente,
  nombreDestinatario,
  setNombreDestinatario,
  telefonoDestinatario,
  setTelefonoDestinatario,
  esContraEntrega,
  setEsContraEntrega,
  montoCobrar,
  setMontoCobrar,
  destinatarioPagaEnvio,
  setDestinatarioPagaEnvio,
  observaciones,
  setObservaciones,
  step1Error,
  handleNext,
}) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
      {step1Error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle size={15} className="shrink-0" />
          {step1Error}
        </div>
      )}

      {/* 1. Remitente */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          1. De Quién Envía (Tienda / Persona)
        </label>
        <div className="relative">
          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={nombreRemitente}
            onChange={(e) => setNombreRemitente(e.target.value)}
            placeholder="Ej: Tienda Don Pepe"
            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* 2 & 3. Cliente y Celular */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            2. Nombre del Cliente *
          </label>
          <input
            type="text"
            value={nombreDestinatario}
            onChange={(e) => setNombreDestinatario(e.target.value)}
            placeholder="María García"
            className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl px-3 py-3 outline-none focus:border-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            3. Celular del Cliente *
          </label>
          <div className="relative">
            <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="tel"
              value={telefonoDestinatario}
              onChange={(e) => setTelefonoDestinatario(e.target.value)}
              placeholder="987654321"
              className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl pl-9 pr-3 py-3 outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 4. Contra Entrega */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">4. ¿Cobrar al Entregar el Pedido?</span>
            <span className="text-[11px] text-slate-400">Activa si el repartidor debe cobrar en efectivo/Yape</span>
          </div>
          <button
            type="button"
            onClick={() => setEsContraEntrega(!esContraEntrega)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              esContraEntrega ? 'bg-violet-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {esContraEntrega && (
          <div className="pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Monto a Cobrar (S/.) *</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-400 font-bold text-sm">S/</span>
              <input
                type="number"
                step="0.10"
                min="0"
                value={montoCobrar}
                onChange={(e) => setMontoCobrar(e.target.value ? Number(e.target.value) : '')}
                placeholder="45.00"
                className="w-full bg-slate-900 border border-emerald-500/30 text-white text-sm rounded-xl pl-10 pr-3 py-3 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5. Quién Paga el Envío */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">5. ¿Quién asume el costo de envío?</span>
            <span className="text-[11px] text-slate-400">
              {destinatarioPagaEnvio
                ? 'El motorizado le cobrará el envío al cliente final.'
                : 'El comercio (tú) asume el costo del envío.'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDestinatarioPagaEnvio(!destinatarioPagaEnvio)}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
              destinatarioPagaEnvio ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>
      </div>

      {/* 6. Observaciones */}
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
          6. Notas u Observación
        </label>
        <div className="relative">
          <FileText size={15} className="absolute top-3 left-3 text-slate-500" />
          <textarea
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ej: Timbrar 2 veces, frágil"
            className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none focus:border-violet-500 transition-colors resize-none"
          />
        </div>
      </div>

      {/* NEXT button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-xl py-4 shadow-lg shadow-violet-500/25 cursor-pointer transition-all duration-200"
        >
          Siguiente — Dirección y Ubicación GPS
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
