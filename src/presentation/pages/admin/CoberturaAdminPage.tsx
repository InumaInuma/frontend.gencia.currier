import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../application/context/AuthContext';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { useCoberturaAdmin } from '../../../application/useCases/useCoberturaAdmin';
import type { DistritoTarifaDto, ZonaAlejadaDto, ZonaRestringidaDto } from '../../../application/useCases/useCoberturaAdmin';
import { LIMA_COVERAGE_MAIN_POLYGON } from '../../../infrastructure/utils/coberturaData';
import { MapPin, CheckCircle2, AlertCircle, ShieldCheck, ShieldOff } from 'lucide-react';

import { stripClosingVertex } from '../../components/cobertura/coberturaIcons';
import { TabPoligonoVerde } from '../../components/cobertura/TabPoligonoVerde';
import { TabZonasAlejadas } from '../../components/cobertura/TabZonasAlejadas';
import { TabZonasRestringidas } from '../../components/cobertura/TabZonasRestringidas';
import { TabDistritosTarifas } from '../../components/cobertura/TabDistritosTarifas';
import { SuccessModal } from '../../components/common/SuccessModal';
import { ModalesCobertura } from '../../components/cobertura/ModalesCobertura';

export const CoberturaAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [activeTab, setActiveTab] = useState<'cobertura' | 'alejadas' | 'restringidas' | 'distritos'>('cobertura');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    getDistritosTarifas,
    insertarDistritoTarifa,
    actualizarDistritoTarifa,
    eliminarDistritoTarifa,
    getPoligonoVerde,
    savePoligonoVerde,
    getZonasRestringidas,
    saveZonaRestringida,
    deleteZonaRestringida,
    getZonasAlejadas,
    saveZonaAlejada,
    deleteZonaAlejada,
  } = useCoberturaAdmin();

  // ---- Districts ----
  const [distritosList, setDistritosList] = useState<DistritoTarifaDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [distritoToEdit, setDistritoToEdit] = useState<DistritoTarifaDto | null>(null);
  const [distritoToDelete, setDistritoToDelete] = useState<DistritoTarifaDto | null>(null);

  // ---- Green coverage polygon editor ----
  const [editGreen, setEditGreen] = useState(false);
  const [greenVertices, setGreenVertices] = useState<[number, number][]>([]);
  const [savedGreenVertices, setSavedGreenVertices] = useState<[number, number][]>([]);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

  // ---- Red restricted zones editor ----
  const [zonas, setZonas] = useState<ZonaRestringidaDto[]>([]);
  const [editingZonaId, setEditingZonaId] = useState<number | null>(null);
  const [expandedZonaId, setExpandedZonaId] = useState<number | null>(null);
  const [pendingZonaToSave, setPendingZonaToSave] = useState<ZonaRestringidaDto | null>(null);

  // ---- Yellow remote sub-zones editor ----
  const [zonasAlejadas, setZonasAlejadas] = useState<ZonaAlejadaDto[]>([]);
  const [editingZonaAlejadaId, setEditingZonaAlejadaId] = useState<number | null>(null);
  const [expandedZonaAlejadaId, setExpandedZonaAlejadaId] = useState<number | null>(null);
  const [pendingZonaAlejadaToSave, setPendingZonaAlejadaToSave] = useState<ZonaAlejadaDto | null>(null);

  // ---- Map focus center override ----
  const [mapFocusCenter, setMapFocusCenter] = useState<[number, number] | null>(null);

  const [successModalData, setSuccessModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    badgeText?: string;
    variant?: 'success' | 'danger' | 'info';
    buttonText?: string;
  } | null>(null);

  const showFeedback = (type: 'success' | 'error', text: string) => setFeedbackMsg({ type, text });

  // Initial load
  const loadData = useCallback(async () => {
    try {
      const dists = await getDistritosTarifas();
      setDistritosList(dists);

      const pol = await getPoligonoVerde();
      if (pol.length > 0) {
        const mappedPol: [number, number][] = stripClosingVertex(
          pol.sort((a, b) => a.orden - b.orden).map((p) => [p.latitud, p.longitud])
        );
        setGreenVertices(mappedPol);
        setSavedGreenVertices(mappedPol);
      } else {
        const def = stripClosingVertex(LIMA_COVERAGE_MAIN_POLYGON);
        setGreenVertices(def);
        setSavedGreenVertices(def);
      }

      const zrs = await getZonasRestringidas();
      setZonas(zrs);

      const zas = await getZonasAlejadas();
      setZonasAlejadas(zas);
    } catch (error) {
      showFeedback('error', 'Error al cargar los datos de cobertura.');
    }
  }, [getDistritosTarifas, getPoligonoVerde, getZonasRestringidas, getZonasAlejadas]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!user) return null;

  // ---- District Handlers ----

  const handleOpenAddDistritoModal = () => {
    setDistritoToEdit({
      id: 0,
      nombre: '',
      zonaNombre: 'Lima Centro',
      latitud: -12.046374,
      longitud: -77.042793,
      tarifaDespacho: 9.00,
      coberturaActiva: true,
    });
  };

  const handleSaveDistritoSubmit = async (distrito: DistritoTarifaDto) => {
    try {
      let savedId = distrito.id;
      if (distrito.id > 0) {
        // Actualizar distrito existente
        await actualizarDistritoTarifa(distrito);
      } else {
        // Insertar nuevo distrito
        savedId = await insertarDistritoTarifa(distrito);
      }

      const updatedDist = { ...distrito, id: savedId > 0 ? savedId : (distrito.id > 0 ? distrito.id : Date.now()) };

      setDistritosList((prev) => {
        const exists = prev.some((d) => d.id === updatedDist.id);
        if (exists) {
          return prev.map((d) => (d.id === updatedDist.id ? updatedDist : d));
        } else {
          return [updatedDist, ...prev];
        }
      });

      setSuccessModalData({
        isOpen: true,
        title: `¡Distrito ${distrito.id > 0 ? 'Actualizado' : 'Registrado'}!`,
        message: `La información de tarifa (S/ ${updatedDist.tarifaDespacho.toFixed(2)}) y cobertura para "${updatedDist.nombre}" fue guardada correctamente en el sistema.`,
        badgeText: updatedDist.coberturaActiva ? '🟢 En Cobertura' : '🔴 Sin Cobertura',
        variant: 'success',
      });
    } catch (e) {
      showFeedback('error', 'Error al guardar el distrito.');
    }
  };

  const handleConfirmDeleteDistrito = async (idDistrito: number) => {
    const distToDelete = distritosList.find((d) => d.id === idDistrito);
    try {
      await eliminarDistritoTarifa(idDistrito);
      setDistritosList((prev) => prev.filter((d) => d.id !== idDistrito));
      setSuccessModalData({
        isOpen: true,
        title: '¡Distrito Eliminado!',
        message: `El distrito "${distToDelete?.nombre || ''}" ha sido removido exitosamente de la lista de cobertura.`,
        badgeText: '🗑️ Eliminación Completada',
        variant: 'danger',
        buttonText: 'Entendido',
      });
    } catch (e) {
      showFeedback('error', 'Error al eliminar el distrito.');
    }
  };

  // ---- Green Polygon Handlers ----
  const handleAddGreenVertex = (lat: number, lng: number) => {
    setGreenVertices((prev) => [...prev, [lat, lng]]);
  };

  const handleDragGreenVertex = (idx: number, lat: number, lng: number) => {
    setGreenVertices((prev) => {
      const u = [...prev];
      u[idx] = [lat, lng];
      return u;
    });
  };

  const handleDeleteGreenVertex = (idx: number) => {
    setGreenVertices((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveGreen = async () => {
    const dto = greenVertices.map((v, i) => ({ orden: i + 1, latitud: v[0], longitud: v[1] }));
    try {
      await savePoligonoVerde(dto);
      setSavedGreenVertices([...greenVertices]);
      setEditGreen(false);
      setSuccessModalData({
        isOpen: true,
        title: 'Zona de Cobertura Guardada',
        message: 'El polígono principal de cobertura ha sido guardado y sincronizado con la vista de todos los comercios.',
        badgeText: 'COBERTURA PRINCIPAL ACTUALIZADA',
        variant: 'success',
      });
    } catch (e) {
      showFeedback('error', 'Error al guardar el polígono');
    }
  };

  const greenDisplay: [number, number][] =
    greenVertices.length > 0 ? [...greenVertices, greenVertices[0]] : [];

  // ---- Red Restricted Zone Handlers ----
  const handleAddZona = () => {
    const newZona: ZonaRestringidaDto = {
      id: 0,
      nombre: 'Nueva Zona Restringida',
      descripcion: 'Zona sin cobertura',
      vertices: [],
    };
    setZonas((prev) => [...prev, newZona]);
    setEditingZonaId(0);
    setExpandedZonaId(0);
  };

  const handleDeleteZona = async (id: number) => {
    if (id > 0) {
      try {
        await deleteZonaRestringida(id);
      } catch (e) {
        showFeedback('error', 'Error al eliminar');
        return;
      }
    }
    setZonas((prev) => prev.filter((z) => z.id !== id));
    if (editingZonaId === id) setEditingZonaId(null);
    setSuccessModalData({
      isOpen: true,
      title: 'Zona Restringida Eliminada',
      message: 'La zona restringida seleccionada ha sido eliminada del mapa de entregas.',
      badgeText: 'ELIMINACIÓN COMPLETADA',
      variant: 'danger',
    });
  };

  const handleUpdateZonaNombre = (id: number, nombre: string) => {
    setZonas((prev) => prev.map((z) => (z.id === id ? { ...z, nombre } : z)));
  };

  const handleUpdateZonaDesc = (id: number, descripcion: string) => {
    setZonas((prev) => prev.map((z) => (z.id === id ? { ...z, descripcion } : z)));
  };

  const handleAddRedVertex = (lat: number, lng: number) => {
    if (editingZonaId === null) return;
    setZonas((prev) =>
      prev.map((z) =>
        z.id === editingZonaId
          ? { ...z, vertices: [...z.vertices, { orden: z.vertices.length + 1, latitud: lat, longitud: lng }] }
          : z
      )
    );
  };

  const handleDragRedVertex = (zonaId: number, idx: number, lat: number, lng: number) => {
    setZonas((prev) =>
      prev.map((z) => {
        if (z.id !== zonaId) return z;
        const v = [...z.vertices];
        v[idx] = { ...v[idx], latitud: lat, longitud: lng };
        return { ...z, vertices: v };
      })
    );
  };

  const handleDeleteRedVertex = (zonaId: number, idx: number) => {
    setZonas((prev) =>
      prev.map((z) =>
        z.id === zonaId
          ? {
              ...z,
              vertices: z.vertices.filter((_, i) => i !== idx).map((v, i) => ({ ...v, orden: i + 1 })),
            }
          : z
      )
    );
  };

  const handleSaveZona = async (zona: ZonaRestringidaDto) => {
    try {
      const newId = await saveZonaRestringida(zona);
      setZonas((prev) => prev.map((z) => (z.id === zona.id ? { ...z, id: newId } : z)));
      setEditingZonaId(null);
      setSuccessModalData({
        isOpen: true,
        title: 'Zona Restringida Guardada',
        message: `Se configuró la zona restringida "${zona.nombre}" para restringir entregas en este perímetro.`,
        badgeText: 'ZONA RESTRINGIDA REGISTRADA',
        variant: 'success',
      });
    } catch (e) {
      showFeedback('error', 'Error al guardar la zona.');
    }
  };

  // ---- Zonas Alejadas Handlers ----

  const handleAddZonaAlejada = () => {
    const newZona: ZonaAlejadaDto = {
      id: 0,
      nombre: 'Nueva Zona Alejada',
      descripcion: 'Zona distante con recargo +60%',
      porcentajeRecargo: 60.00,
      montoFijoRecargo: 0.00,
      usarPorcentaje: true,
      vertices: [],
    };
    setZonasAlejadas((prev) => [...prev, newZona]);
    setEditingZonaAlejadaId(0);
    setExpandedZonaAlejadaId(0);
  };

  const handleDeleteZonaAlejada = async (id: number) => {
    if (id > 0) {
      try {
        await deleteZonaAlejada(id);
      } catch (e) {
        showFeedback('error', 'Error al eliminar zona alejada');
        return;
      }
    }
    setZonasAlejadas((prev) => prev.filter((z) => z.id !== id));
    if (editingZonaAlejadaId === id) setEditingZonaAlejadaId(null);
    setSuccessModalData({
      isOpen: true,
      title: 'Zona Alejada Eliminada',
      message: 'La sub-zona con recargo especial ha sido eliminada correctamente.',
      badgeText: 'ELIMINACIÓN COMPLETADA',
      variant: 'danger',
    });
  };

  const handleUpdateZonaAlejadaNombre = (id: number, nombre: string) => {
    setZonasAlejadas((prev) => prev.map((z) => (z.id === id ? { ...z, nombre } : z)));
  };

  const handleUpdateZonaAlejadaDesc = (id: number, descripcion: string) => {
    setZonasAlejadas((prev) => prev.map((z) => (z.id === id ? { ...z, descripcion } : z)));
  };

  const handleUpdateZonaAlejadaRecargo = (id: number, porcentajeRecargo: number) => {
    setZonasAlejadas((prev) => prev.map((z) => (z.id === id ? { ...z, porcentajeRecargo } : z)));
  };

  const handleAddYellowVertex = (lat: number, lng: number) => {
    if (editingZonaAlejadaId === null) return;
    setZonasAlejadas((prev) =>
      prev.map((z) =>
        z.id === editingZonaAlejadaId
          ? { ...z, vertices: [...z.vertices, { orden: z.vertices.length + 1, latitud: lat, longitud: lng }] }
          : z
      )
    );
  };

  const handleDragYellowVertex = (zonaId: number, idx: number, lat: number, lng: number) => {
    setZonasAlejadas((prev) =>
      prev.map((z) => {
        if (z.id !== zonaId) return z;
        const v = [...z.vertices];
        v[idx] = { ...v[idx], latitud: lat, longitud: lng };
        return { ...z, vertices: v };
      })
    );
  };

  const handleDeleteYellowVertex = (zonaId: number, idx: number) => {
    setZonasAlejadas((prev) =>
      prev.map((z) =>
        z.id === zonaId
          ? {
              ...z,
              vertices: z.vertices.filter((_, i) => i !== idx).map((v, i) => ({ ...v, orden: i + 1 })),
            }
          : z
      )
    );
  };

  const handleSaveZonaAlejada = async (zona: ZonaAlejadaDto) => {
    try {
      const newId = await saveZonaAlejada(zona);
      setZonasAlejadas((prev) => prev.map((z) => (z.id === zona.id ? { ...z, id: newId } : z)));
      setEditingZonaAlejadaId(null);
      setSuccessModalData({
        isOpen: true,
        title: 'Zona Alejada Guardada',
        message: `Se configuró la zona "${zona.nombre}" con recargo especial de +${zona.porcentajeRecargo}%.`,
        badgeText: 'ZONA ALEJADA REGISTRADA',
        variant: 'success',
      });
    } catch (e) {
      showFeedback('error', 'Error al guardar la zona alejada.');
    }
  };

  const distritosFiltrados = distritosList.filter(
    (d) => d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || d.zonaNombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalActivos = distritosList.filter((d) => d.coberturaActiva).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <LeftSidebar contraido={contraido} setContraido={setContraido} movilAbierto={movilAbierto} setMovilAbierto={setMovilAbierto} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${contraido ? 'md:ml-20' : 'md:ml-64'} pb-20 md:pb-8`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 sm:px-8 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
            <MapPin size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Zonas de Cobertura y Tarifas</h1>
            <p className="text-xs text-slate-400">Configura el mapa de entrega exacto para tus motorizados.</p>
          </div>
        </header>

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Feedback */}
          {feedbackMsg && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 shadow-lg ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              {feedbackMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <div className="flex-1">{feedbackMsg.text}</div>
              <button
                type="button"
                onClick={() => setFeedbackMsg(null)}
                className="text-slate-400 hover:text-white cursor-pointer text-lg font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Distritos', value: distritosList.length, color: 'slate', icon: <MapPin size={22} /> },
              { label: 'En Cobertura', value: totalActivos, color: 'emerald', icon: <ShieldCheck size={22} /> },
              { label: 'Zonas Alejadas (+60%)', value: zonasAlejadas.length, color: 'amber', icon: <MapPin size={22} /> },
              { label: 'Zonas Restringidas', value: zonas.length, color: 'red', icon: <ShieldOff size={22} /> },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-${s.color}-950/20 border border-${s.color}-800/30 rounded-3xl p-5 flex items-center justify-between shadow-xl`}
              >
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider text-${s.color}-400`}>{s.label}</span>
                  <div className={`text-3xl font-extrabold text-${s.color}-300 font-mono mt-1`}>{s.value}</div>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-${s.color}-500/20 text-${s.color}-300 border border-${s.color}-500/40 flex items-center justify-center`}
                >
                  {s.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Tabs Navigation */}
          <div className="flex gap-2 border-b border-slate-800 pb-0 overflow-x-auto">
            {[
              { key: 'cobertura', label: '🟢 Zona de Cobertura', desc: 'Polígono verde' },
              { key: 'alejadas', label: '🟡 Zonas Alejadas (+60%)', desc: 'Polígonos amarillos' },
              { key: 'restringidas', label: '🔴 Zonas Restringidas', desc: 'Polígonos rojos' },
              { key: 'distritos', label: '📋 Distritos y Tarifas', desc: 'Tabla de configuración' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-b-2 -mb-px shrink-0 ${
                  activeTab === tab.key
                    ? tab.key === 'cobertura'
                      ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300'
                      : tab.key === 'alejadas'
                      ? 'bg-yellow-500/10 border-yellow-400 text-yellow-300'
                      : tab.key === 'restringidas'
                      ? 'bg-red-500/10 border-red-400 text-red-300'
                      : 'bg-purple-500/10 border-purple-400 text-purple-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: POLÍGONO VERDE */}
          {activeTab === 'cobertura' && (
            <TabPoligonoVerde
              editGreen={editGreen}
              setEditGreen={setEditGreen}
              greenVertices={greenVertices}
              savedGreenVertices={savedGreenVertices}
              setGreenVertices={setGreenVertices}
              handleAddGreenVertex={handleAddGreenVertex}
              handleDragGreenVertex={handleDragGreenVertex}
              handleDeleteGreenVertex={handleDeleteGreenVertex}
              onRequestSaveConfirm={() => setShowSaveConfirmModal(true)}
              distritosList={distritosList}
              zonas={zonas}
              zonasAlejadas={zonasAlejadas}
              mapFocusCenter={mapFocusCenter}
              setMapFocusCenter={setMapFocusCenter}
            />
          )}

          {/* TAB 2: ZONAS ALEJADAS (POLÍGONOS AMARILLOS) */}
          {activeTab === 'alejadas' && (
            <TabZonasAlejadas
              zonasAlejadas={zonasAlejadas}
              editingZonaId={editingZonaAlejadaId}
              setEditingZonaId={setEditingZonaAlejadaId}
              expandedZonaId={expandedZonaAlejadaId}
              setExpandedZonaId={setExpandedZonaAlejadaId}
              handleAddZonaAlejada={handleAddZonaAlejada}
              handleDeleteZonaAlejada={handleDeleteZonaAlejada}
              handleUpdateZonaNombre={handleUpdateZonaAlejadaNombre}
              handleUpdateZonaDesc={handleUpdateZonaAlejadaDesc}
              handleUpdateZonaRecargo={handleUpdateZonaAlejadaRecargo}
              handleAddYellowVertex={handleAddYellowVertex}
              handleDragYellowVertex={handleDragYellowVertex}
              handleDeleteYellowVertex={handleDeleteYellowVertex}
              setPendingZonaAlejadaToSave={setPendingZonaAlejadaToSave}
              greenDisplay={greenDisplay}
              zonasRestringidas={zonas}
              mapFocusCenter={mapFocusCenter}
            />
          )}

          {/* TAB 3: ZONAS RESTRINGIDAS */}
          {activeTab === 'restringidas' && (
            <TabZonasRestringidas
              zonas={zonas}
              editingZonaId={editingZonaId}
              setEditingZonaId={setEditingZonaId}
              expandedZonaId={expandedZonaId}
              setExpandedZonaId={setExpandedZonaId}
              handleAddZona={handleAddZona}
              handleDeleteZona={handleDeleteZona}
              handleUpdateZonaNombre={handleUpdateZonaNombre}
              handleUpdateZonaDesc={handleUpdateZonaDesc}
              handleAddRedVertex={handleAddRedVertex}
              handleDragRedVertex={handleDragRedVertex}
              handleDeleteRedVertex={handleDeleteRedVertex}
              setPendingZonaToSave={setPendingZonaToSave}
              greenDisplay={greenDisplay}
              zonasAlejadas={zonasAlejadas}
              distritosList={distritosList}
              mapFocusCenter={mapFocusCenter}
              setMapFocusCenter={setMapFocusCenter}
            />
          )}

          {/* TAB 4: DISTRITOS Y TARIFAS */}
          {activeTab === 'distritos' && (
            <TabDistritosTarifas
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              distritosFiltrados={distritosFiltrados}
              onOpenAddDistritoModal={handleOpenAddDistritoModal}
              onOpenEditDistritoModal={(dist) => setDistritoToEdit(dist)}
              onOpenDeleteDistritoModal={(dist) => setDistritoToDelete(dist)}
            />
          )}
        </main>

        <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
      </div>

      {/* Confirmation Modals */}
      <ModalesCobertura
        showSaveConfirmModal={showSaveConfirmModal}
        setShowSaveConfirmModal={setShowSaveConfirmModal}
        greenVertices={greenVertices}
        handleSaveGreen={handleSaveGreen}
        pendingZonaToSave={pendingZonaToSave}
        setPendingZonaToSave={setPendingZonaToSave}
        handleSaveZona={handleSaveZona}
        pendingZonaAlejadaToSave={pendingZonaAlejadaToSave}
        setPendingZonaAlejadaToSave={setPendingZonaAlejadaToSave}
        handleSaveZonaAlejada={handleSaveZonaAlejada}
        distritosList={distritosList}
        distritoToEdit={distritoToEdit}
        setDistritoToEdit={setDistritoToEdit}
        handleSaveDistritoSubmit={handleSaveDistritoSubmit}
        distritoToDelete={distritoToDelete}
        setDistritoToDelete={setDistritoToDelete}
        handleConfirmDeleteDistrito={handleConfirmDeleteDistrito}
      />

      {/* Reusable Success Modal */}
      {successModalData && (
        <SuccessModal
          isOpen={successModalData.isOpen}
          onClose={() => setSuccessModalData(null)}
          title={successModalData.title}
          message={successModalData.message}
          badgeText={successModalData.badgeText}
          variant={successModalData.variant || 'success'}
          buttonText={successModalData.buttonText || 'Aceptar y Continuar'}
        />
      )}
    </div>
  );
};
