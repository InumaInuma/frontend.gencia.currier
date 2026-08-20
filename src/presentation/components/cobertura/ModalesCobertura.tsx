import React, { useState, useEffect } from 'react';
import { ShieldCheck, Save, ShieldOff, Coins, Pencil, Trash2, MapPin, X } from 'lucide-react';
import type { DistritoTarifaDto, ZonaRestringidaDto } from '../../../application/useCases/useCoberturaAdmin';
import { ConfirmModal } from '../common/ConfirmModal';

interface Props {
  showSaveConfirmModal: boolean;
  setShowSaveConfirmModal: (val: boolean) => void;
  greenVertices: [number, number][];
  handleSaveGreen: () => void;
  pendingZonaToSave: ZonaRestringidaDto | null;
  setPendingZonaToSave: (zona: ZonaRestringidaDto | null) => void;
  handleSaveZona: (zona: ZonaRestringidaDto) => void;
  distritosList: DistritoTarifaDto[];
  // District Edit/Create & Delete Modals
  distritoToEdit: DistritoTarifaDto | null;
  setDistritoToEdit: (dist: DistritoTarifaDto | null) => void;
  handleSaveDistritoSubmit: (distrito: DistritoTarifaDto) => void;
  distritoToDelete: DistritoTarifaDto | null;
  setDistritoToDelete: (dist: DistritoTarifaDto | null) => void;
  handleConfirmDeleteDistrito: (idDistrito: number) => void;
}

export const ModalesCobertura: React.FC<Props> = ({
  showSaveConfirmModal,
  setShowSaveConfirmModal,
  greenVertices,
  handleSaveGreen,
  pendingZonaToSave,
  setPendingZonaToSave,
  handleSaveZona,
  distritosList,
  distritoToEdit,
  setDistritoToEdit,
  handleSaveDistritoSubmit,
  distritoToDelete,
  setDistritoToDelete,
  handleConfirmDeleteDistrito,
}) => {
  // Local form state for district edit / create
  const [formNombre, setFormNombre] = useState('');
  const [formZona, setFormZona] = useState('');
  const [formTarifa, setFormTarifa] = useState<number>(0);
  const [formCobertura, setFormCobertura] = useState<boolean>(true);

  useEffect(() => {
    if (distritoToEdit) {
      setFormNombre(distritoToEdit.nombre);
      setFormZona(distritoToEdit.zonaNombre);
      setFormTarifa(distritoToEdit.tarifaDespacho);
      setFormCobertura(distritoToEdit.coberturaActiva);
    }
  }, [distritoToEdit]);

  const handleSubmitDistrito = (e: React.FormEvent) => {
    e.preventDefault();
    if (!distritoToEdit) return;
    if (!formNombre.trim()) return;

    handleSaveDistritoSubmit({
      ...distritoToEdit,
      nombre: formNombre.trim(),
      zonaNombre: formZona.trim() || 'Lima Centro',
      tarifaDespacho: formTarifa,
      coberturaActiva: formCobertura,
    });
    setDistritoToEdit(null);
  };

  return (
    <>
      {/* Modal de Confirmación para Guardar Polígono Verde */}
      {showSaveConfirmModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Guardar Zona de Cobertura?</h3>
                <p className="text-xs text-slate-400">Confirmación de mapa principal</p>
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                Estás a punto de actualizar el polígono con <span className="font-mono text-emerald-400 font-bold">{greenVertices.length} vértices</span>.
              </p>
              <p className="text-slate-400 text-[11px]">
                Esta nueva zona de cobertura se aplicará inmediatamente para el cálculo de envíos en la plataforma del Comercio.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSaveConfirmModal(false);
                  handleSaveGreen();
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <Save size={14} />
                Sí, Guardar Zona
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Guardar Zona Restringida (Roja) */}
      {pendingZonaToSave && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30 shrink-0">
                <ShieldOff size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">¿Guardar Zona Restringida?</h3>
                <p className="text-xs text-slate-400">Confirmación de perímetro restringido</p>
              </div>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p>
                Estás a punto de guardar la zona <strong className="text-white">"{pendingZonaToSave.nombre || 'Sin nombre'}"</strong> con <span className="font-mono text-red-400 font-bold">{pendingZonaToSave.vertices.length} vértices</span>.
              </p>
              <p className="text-slate-400 text-[11px]">
                Esta área quedará bloqueada en el sistema para restringir entregas o alertar al repartidor.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingZonaToSave(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = pendingZonaToSave;
                  setPendingZonaToSave(null);
                  handleSaveZona(target);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2"
              >
                <Save size={14} />
                Sí, Guardar Zona Restringida
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Modal CREAR / EDITAR DISTRITO Y TARIFA */}
      {distritoToEdit && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30 shrink-0">
                  <Pencil size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {distritoToEdit.id > 0 ? 'Editar Distrito y Tarifa' : 'Nuevo Distrito y Tarifa'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {distritoToEdit.id > 0 ? `ID: ${distritoToEdit.id}` : 'Registra una nueva zona de despacho'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDistritoToEdit(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitDistrito} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Nombre del Distrito</label>
                <input
                  type="text"
                  required
                  value={formNombre}
                  onChange={(e) => setFormNombre(e.target.value)}
                  placeholder="Ej. Miraflores, San Isidro, Surco..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Zona / Sector</label>
                <select
                  value={formZona}
                  onChange={(e) => setFormZona(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="Lima Centro">Lima Centro</option>
                  <option value="Lima Moderna">Lima Moderna</option>
                  <option value="Lima Norte">Lima Norte</option>
                  <option value="Lima Este">Lima Este</option>
                  <option value="Lima Sur">Lima Sur</option>
                  <option value="Callao">Callao</option>
                  <option value="Periferia / Provincias">Periferia / Provincias</option>
                  {!['Lima Centro', 'Lima Moderna', 'Lima Norte', 'Lima Este', 'Lima Sur', 'Callao', 'Periferia / Provincias'].includes(formZona) && formZona !== '' && (
                    <option value={formZona}>{formZona}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tarifa Despacho (S/)</label>
                <input
                  type="number"
                  step="0.50"
                  min="0"
                  required
                  value={formTarifa}
                  onChange={(e) => setFormTarifa(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-1">
                <label className="block text-slate-300 font-bold mb-2">Estado de Cobertura</label>
                <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="coberturaRadio"
                      checked={formCobertura === true}
                      onChange={() => setFormCobertura(true)}
                      className="accent-emerald-500"
                    />
                    <span className="text-emerald-400 font-bold">🟢 En Cobertura</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="coberturaRadio"
                      checked={formCobertura === false}
                      onChange={() => setFormCobertura(false)}
                      className="accent-amber-500"
                    />
                    <span className="text-amber-400 font-bold">🔴 Sin Cobertura</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setDistritoToEdit(null)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Save size={14} />
                  Guardar Distrito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ELIMINAR DISTRITO */}
      {distritoToDelete && (
        <ConfirmModal
          isOpen={!!distritoToDelete}
          onClose={() => setDistritoToDelete(null)}
          onConfirm={() => {
            const id = distritoToDelete.id;
            setDistritoToDelete(null);
            handleConfirmDeleteDistrito(id);
          }}
          title={`¿Eliminar "${distritoToDelete.nombre}"?`}
          message={`Esta acción removerá las tarifas de despacho configuradas para ${distritoToDelete.nombre} (${distritoToDelete.zonaNombre}).`}
          badgeText="🗑️ Eliminar Cobertura"
          confirmText="Sí, Eliminar"
          cancelText="Cancelar"
          variant="danger"
        />
      )}
    </>
  );
};
