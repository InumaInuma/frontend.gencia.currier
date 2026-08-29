import React, { useState, useEffect } from 'react';
import { X, Edit3, DollarSign, Package, User, MapPin, AlertCircle } from 'lucide-react';
import type { IPedido } from '../../../domain/models/IPedido';

interface Props {
  pedido: IPedido | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSave: (data: {
    idPedido: number;
    nombreDestinatario: string;
    telefonoDestinatario: string;
    direccionDestinatario: string;
    referenciaDestinatario?: string;
    observaciones?: string;
    montoCobrar: number;
    tarifaEnvio: number;
    destinatarioPagaEnvio: boolean;
    idEstadosPedido?: number;
  }) => Promise<void>;
  isPending: boolean;
}

const ESTADOS_PEDIDO_OPTIONS = [
  { id: 1, label: 'Registrado / Agendado' },
  { id: 2, label: 'Recojo Asignado' },
  { id: 3, label: 'En Camino al Comercio' },
  { id: 4, label: 'Llegó al Comercio' },
  { id: 5, label: 'Recogido' },
  { id: 6, label: 'En Camino al Almacén' },
  { id: 7, label: 'En Almacén' },
  { id: 9, label: 'En Ruta de Entrega' },
  { id: 11, label: 'Entregado' },
  { id: 12, label: 'No Entregado' },
  { id: 13, label: 'Cancelado' },
];

export const ModalEditarPedidoAdmin: React.FC<Props> = ({
  pedido,
  isOpen,
  onClose,
  onConfirmSave,
  isPending
}) => {
  const [nombreDestinatario, setNombreDestinatario] = useState('');
  const [telefonoDestinatario, setTelefonoDestinatario] = useState('');
  const [direccionDestinatario, setDireccionDestinatario] = useState('');
  const [referenciaDestinatario, setReferenciaDestinatario] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [montoCobrar, setMontoCobrar] = useState<number>(0);
  const [tarifaEnvio, setTarifaEnvio] = useState<number>(0);
  const [destinatarioPagaEnvio, setDestinatarioPagaEnvio] = useState<boolean>(false);
  const [idEstadosPedido, setIdEstadosPedido] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (pedido) {
      setNombreDestinatario(pedido.nombreDestinatario || '');
      setTelefonoDestinatario(pedido.telefonoDestinatario || '');
      setDireccionDestinatario(pedido.direccionDestinatario || '');
      setReferenciaDestinatario(pedido.referenciaDestinatario || '');
      setObservaciones(pedido.observaciones || '');
      setMontoCobrar(pedido.montoCobrar || 0);
      setTarifaEnvio(pedido.tarifaEnvio || 0);
      setDestinatarioPagaEnvio(pedido.destinatarioPagaEnvio || false);
      setIdEstadosPedido(pedido.idEstadosPedido || 1);
      setErrorMsg('');
    }
  }, [pedido]);

  if (!isOpen || !pedido) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreDestinatario.trim()) {
      setErrorMsg('El nombre del destinatario es obligatorio.');
      return;
    }
    if (!telefonoDestinatario.trim()) {
      setErrorMsg('El teléfono del destinatario es obligatorio.');
      return;
    }
    if (!direccionDestinatario.trim()) {
      setErrorMsg('La dirección es obligatoria.');
      return;
    }

    try {
      setErrorMsg('');
      await onConfirmSave({
        idPedido: pedido.id,
        nombreDestinatario,
        telefonoDestinatario,
        direccionDestinatario,
        referenciaDestinatario,
        observaciones,
        montoCobrar,
        tarifaEnvio,
        destinatarioPagaEnvio,
        idEstadosPedido
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar los cambios del pedido.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-5 relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-3xl -z-10" />

        {/* Header Modal */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-violet-600/10">
              <Edit3 size={24} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                Editar Pedido & Ajustar Tarifa
              </h3>
              <p className="text-xs text-slate-400">
                Comercio: <strong className="text-white">{pedido.nombreComercial || 'Comercio'}</strong> — Código: <span className="font-mono text-violet-400 font-bold">{pedido.codigoSeguimiento}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Tarifas y Cobros */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-400 text-xs border-b border-slate-900 pb-2">
              <DollarSign size={15} />
              <span>Ajuste de Costos & Tarifa de Envío</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Tarifa de Envío (S/) *
                </label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  value={tarifaEnvio}
                  onChange={(e) => setTarifaEnvio(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-extrabold rounded-xl p-2.5 outline-none focus:border-violet-500 transition-all text-sm"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Ajusta si negociaste recargo por volumen extra.</span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Cobro de Productos S/ (Contra Entrega)
                </label>
                <input
                  type="number"
                  step="0.10"
                  min="0"
                  value={montoCobrar}
                  onChange={(e) => setMontoCobrar(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 text-white font-bold rounded-xl p-2.5 outline-none focus:border-violet-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Quién asume el costo de envío */}
            <div>
              <label className="block text-slate-300 font-bold mb-1.5">¿Quién paga la Tarifa de Envío?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDestinatarioPagaEnvio(false)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                    !destinatarioPagaEnvio
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <span>🔵 Comercio Asume Envío</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDestinatarioPagaEnvio(true)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                    destinatarioPagaEnvio
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <span>🟢 Cliente Final Paga Envío</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Estado del Pedido */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
            <label className="block text-slate-300 font-bold mb-1 flex items-center gap-1.5">
              <Package size={14} className="text-violet-400" />
              <span>Estado Operativo del Pedido</span>
            </label>
            <select
              value={idEstadosPedido}
              onChange={(e) => setIdEstadosPedido(parseInt(e.target.value, 10))}
              className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 text-xs outline-none focus:border-violet-500 font-semibold cursor-pointer"
            >
              {ESTADOS_PEDIDO_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Section 3: Datos Destinatario */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 font-bold text-violet-400 text-xs border-b border-slate-900 pb-2">
              <User size={15} />
              <span>Datos del Destinatario & Entrega</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre Destinatario *</label>
                <input
                  type="text"
                  value={nombreDestinatario}
                  onChange={(e) => setNombreDestinatario(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Teléfono Destinatario *</label>
                <input
                  type="text"
                  value={telefonoDestinatario}
                  onChange={(e) => setTelefonoDestinatario(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Dirección de Entrega *</label>
              <input
                type="text"
                value={direccionDestinatario}
                onChange={(e) => setDireccionDestinatario(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Referencia</label>
              <input
                type="text"
                value={referenciaDestinatario}
                onChange={(e) => setReferenciaDestinatario(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Notas / Observaciones del Comercio</label>
              <textarea
                rows={2}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-2.5 outline-none focus:border-violet-500 resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 font-bold transition-all cursor-pointer text-xs"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-violet-600/30 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Edit3 size={16} />
                  <span>Guardar Cambios y Ajustar Tarifa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
