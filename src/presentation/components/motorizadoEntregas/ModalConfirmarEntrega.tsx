import React, { useState } from 'react';
import { X, DollarSign, QrCode, CheckCircle2, Camera, Trash2, Building2, Upload, Receipt } from 'lucide-react';
import type { IMonitoreoEntrega } from '../../../domain/models/IMonitoreoEntrega';

interface Props {
  deliveryModalItem: IMonitoreoEntrega | null;
  onClose: () => void;
  tipoPago: 'efectivo' | 'yape' | 'dividido' | 'comercio';
  setTipoPago: (val: 'efectivo' | 'yape' | 'dividido' | 'comercio') => void;
  montoEfectivo: string;
  setMontoEfectivo: (val: string) => void;
  montoYape: string;
  setMontoYape: (val: string) => void;
  referenciaYape: string;
  setReferenciaYape: (val: string) => void;
  onConfirmarEntrega: () => void;
  isPending: boolean;
}

export const ModalConfirmarEntrega: React.FC<Props> = ({
  deliveryModalItem,
  onClose,
  tipoPago,
  setTipoPago,
  montoEfectivo,
  setMontoEfectivo,
  montoYape,
  setMontoYape,
  referenciaYape,
  setReferenciaYape,
  onConfirmarEntrega,
  isPending,
}) => {
  const [fotoClientePreview, setFotoClientePreview] = useState<string | null>(null);
  const [fotoPagoPreview, setFotoPagoPreview] = useState<string | null>(null);

  if (!deliveryModalItem) return null;

  const totalMonto =
    deliveryModalItem.montoCobrar +
    (deliveryModalItem.destinatarioPagaEnvio ? deliveryModalItem.tarifaEnvio || 0 : 0);

  const isSinCobro = totalMonto === 0;

  // Sync state when payment mode changes
  const handleSelectTipoPago = (mode: 'efectivo' | 'yape' | 'dividido' | 'comercio') => {
    setTipoPago(mode);
    if (mode === 'efectivo') {
      setMontoEfectivo(totalMonto.toString());
      setMontoYape('0');
    } else if (mode === 'yape') {
      setMontoYape(totalMonto.toString());
      setMontoEfectivo('0');
    } else if (mode === 'comercio') {
      setMontoEfectivo('0');
      setMontoYape('0');
    } else if (mode === 'dividido') {
      const mitad = (totalMonto / 2).toFixed(2);
      setMontoEfectivo(mitad);
      setMontoYape((totalMonto - Number(mitad)).toFixed(2));
    }
  };

  // Auto-complete logic for split payment (Efectivo change)
  const handleEfectivoChange = (val: string) => {
    setMontoEfectivo(val);
    const numEf = Number(val) || 0;
    const restYape = Math.max(0, totalMonto - numEf);
    setMontoYape(restYape.toFixed(2));
  };

  // Auto-complete logic for split payment (Yape change)
  const handleYapeChange = (val: string) => {
    setMontoYape(val);
    const numYap = Number(val) || 0;
    const restEf = Math.max(0, totalMonto - numYap);
    setMontoEfectivo(restEf.toFixed(2));
  };

  // Helper for reading selected image files
  const handleFileSelected = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl my-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-full bg-slate-800/50 cursor-pointer transition-colors"
        >
          <X size={18} />
        </button>

        <div>
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider block">
            {isSinCobro ? 'Confirmar Entrega de Pedido' : 'Confirmación de Entrega y Cobro'}
          </span>
          <h3 className="text-lg font-extrabold text-white mt-0.5">
            Cliente: {deliveryModalItem.nombreDestinatario}
          </h3>
        </div>

        {/* Delivery Tariff & Collection Breakdown Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>📦 Producto / Contraentrega:</span>
            <span className="font-mono font-bold text-white">S/ {deliveryModalItem.montoCobrar.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>🚚 Tarifa de Envío:</span>
            <span className="font-mono font-bold text-violet-300">
              S/ {(deliveryModalItem.tarifaEnvio || 0).toFixed(2)}
            </span>
          </div>
          <div className="text-[11px] font-medium pt-1">
            {deliveryModalItem.destinatarioPagaEnvio ? (
              <span className="text-emerald-400 font-bold">🟢 Cliente final paga el envío en destino.</span>
            ) : (
              <span className="text-cyan-400 font-bold">🔵 Comercio asume costo del envío (No cobrar envío al cliente).</span>
            )}
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold text-sm">
            <span className="text-emerald-400">TOTAL A COBRAR EN DESTINO:</span>
            <span className="font-mono text-emerald-400 text-lg font-extrabold">
              S/ {totalMonto.toFixed(2)}
            </span>
          </div>
        </div>

        {/* SMART MODAL BRANCHING: Pre-paid order vs Order requiring payment */}
        {isSinCobro ? (
          /* PRE-PAID ORDER BANNER (S/ 0.00) */
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-1.5 shadow-lg">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-sm">
              <CheckCircle2 size={18} />
              <span>Pedido Pagado Previamente en Tienda</span>
            </div>
            <p className="text-xs text-slate-300">
              El cliente ya canceló el producto al comercio y la tienda asume el envío. <br />
              <strong className="text-emerald-300">No se requiere cobro en efectivo ni Yape al cliente.</strong>
            </p>
          </div>
        ) : (
          /* ORDERS REQUIRING PAYMENT SELECTION */
          <>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">¿Cómo realizó el pago el cliente?</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleSelectTipoPago('efectivo')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    tipoPago === 'efectivo'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <DollarSign size={16} /> Efectivo
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTipoPago('yape')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    tipoPago === 'yape'
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <QrCode size={16} /> Yape / Plin
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTipoPago('dividido')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    tipoPago === 'dividido'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  ⚖️ Pago Dividido
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTipoPago('comercio')}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    tipoPago === 'comercio'
                      ? 'bg-slate-800 border-slate-700 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <Building2 size={16} /> Ya pagó al Comercio
                </button>
              </div>
            </div>

            {/* Display for EFECTIVO: Big prominent total amount */}
            {tipoPago === 'efectivo' && (
              <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-1 shadow-inner">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Monto a cobrar en Efectivo
                </span>
                <div className="text-3xl font-extrabold font-mono text-emerald-400">
                  S/ {totalMonto.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500 block">
                  El motorizado recibirá este dinero físicamente en billetes/monedas.
                </span>
              </div>
            )}

            {/* Display for YAPE: Big prominent total amount + optional reference */}
            {tipoPago === 'yape' && (
              <div className="space-y-3">
                <div className="bg-slate-950/90 border border-purple-500/30 rounded-2xl p-4 text-center space-y-1 shadow-inner">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Monto a cobrar por Yape / Plin
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-purple-400">
                    S/ {totalMonto.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    El cliente transfiere esta cantidad escaneando el código QR.
                  </span>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">
                    N° Operación / Referencia Yape (Opcional):
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 489201"
                    value={referenciaYape}
                    onChange={(e) => setReferenciaYape(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-purple-500 outline-none font-mono"
                  />
                </div>
              </div>
            )}

            {/* Display for PAGO DIVIDIDO: Auto-calculating input fields */}
            {tipoPago === 'dividido' && (
              <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-cyan-300 block">
                  Autocompletado de Pago Dividido (Total S/ {totalMonto.toFixed(2)})
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-emerald-300 font-bold block mb-1">Efectivo S/:</label>
                    <input
                      type="number"
                      step="0.10"
                      value={montoEfectivo}
                      onChange={(e) => handleEfectivoChange(e.target.value)}
                      placeholder="50.00"
                      className="w-full bg-slate-900 border border-emerald-500/40 rounded-xl p-2.5 text-xs font-mono font-extrabold text-emerald-400 focus:border-emerald-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-purple-300 font-bold block mb-1">Yape / Plin S/:</label>
                    <input
                      type="number"
                      step="0.10"
                      value={montoYape}
                      onChange={(e) => handleYapeChange(e.target.value)}
                      placeholder="209.00"
                      className="w-full bg-slate-900 border border-purple-500/40 rounded-xl p-2.5 text-xs font-mono font-extrabold text-purple-400 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>
                {referenciaYape !== undefined && (
                  <div className="pt-1">
                    <input
                      type="text"
                      placeholder="N° Operación / Referencia Yape (Opcional)"
                      value={referenciaYape}
                      onChange={(e) => setReferenciaYape(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-purple-500 outline-none font-mono"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Display for COMERCIO: Friendly Notice */}
            {tipoPago === 'comercio' && (
              <div className="bg-slate-950/80 border border-blue-500/30 rounded-2xl p-4 text-center space-y-1">
                <span className="text-xs font-bold text-blue-300 block">🏢 Pagado previamente al Comercio</span>
                <p className="text-[11px] text-slate-400">
                  El cliente final ya realizó el pago completo directamente a la tienda. No requiere cobro en destino.
                </p>
              </div>
            )}
          </>
        )}

        {/* FOTO 1: Prueba de Entrega (Cliente con producto) */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <label className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
            <Camera size={15} className="text-violet-400" />
            1. Foto de Prueba de Entrega (Cliente con producto):
          </label>

          {fotoClientePreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950 p-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={fotoClientePreview} alt="Foto de entrega" className="w-14 h-14 object-cover rounded-xl border border-slate-800" />
                <div>
                  <span className="text-xs font-bold text-emerald-400 block">✓ Foto de entrega adjuntada</span>
                  <span className="text-[10px] text-slate-400 block">Cliente con paquete en mano</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFotoClientePreview(null)}
                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 cursor-pointer transition-colors"
                title="Eliminar foto"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-950 border border-dashed border-slate-700 hover:border-violet-500 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all">
                <Camera size={16} className="text-violet-400" />
                <span>📸 Tomar Foto</span>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileSelected(e, setFotoClientePreview)} className="hidden" />
              </label>

              <label className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-950 border border-dashed border-slate-700 hover:border-violet-500 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all">
                <Upload size={16} className="text-cyan-400" />
                <span>📁 Subir Imagen</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileSelected(e, setFotoClientePreview)} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* FOTO 2: Captura del Pago / Comprobante de Transacción */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 block flex items-center gap-1.5">
            <Receipt size={15} className="text-purple-400" />
            2. Captura del Pago / Comprobante (Yape / Plin / Voucher):
          </label>

          {fotoPagoPreview ? (
            <div className="relative rounded-2xl overflow-hidden border border-purple-500/40 bg-slate-950 p-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={fotoPagoPreview} alt="Captura del pago" className="w-14 h-14 object-cover rounded-xl border border-slate-800" />
                <div>
                  <span className="text-xs font-bold text-purple-400 block">✓ Captura de pago adjuntada</span>
                  <span className="text-[10px] text-slate-400 block">Comprobante o captura de pantalla</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFotoPagoPreview(null)}
                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 cursor-pointer transition-colors"
                title="Eliminar captura"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-950 border border-dashed border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all">
                <Camera size={16} className="text-purple-400" />
                <span>📸 Tomar Foto</span>
                <input type="file" accept="image/*" capture="environment" onChange={(e) => handleFileSelected(e, setFotoPagoPreview)} className="hidden" />
              </label>

              <label className="flex items-center justify-center gap-1.5 p-3 rounded-2xl bg-slate-950 border border-dashed border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-all">
                <Upload size={16} className="text-cyan-400" />
                <span>📁 Subir Captura</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileSelected(e, setFotoPagoPreview)} className="hidden" />
              </label>
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <button
          type="button"
          onClick={onConfirmarEntrega}
          disabled={isPending}
          className="w-full py-3.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <CheckCircle2 size={18} />
          {isSinCobro ? 'Confirmar Entrega Realizada' : 'Confirmar Entrega y Registrar Cobro'}
        </button>
      </div>
    </div>
  );
};
