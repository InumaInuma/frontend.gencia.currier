import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../application/context/AuthContext';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { useAlmacenaje } from '../../../application/useCases/useAlmacenaje';
import type {
  ISuscripcionComercio,
  IProductoAlmacen,
  IMovimientoInventario
} from '../../../domain/models/IAlmacenaje';
import {
  Warehouse,
  Search,
  Package,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Layers,
  Check,
  X,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

const getTodayFormatted = (offsetDays = 0): string => {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const AlmacenajeAdminPage: React.FC = () => {
  const { user } = useAuth();
  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [activeTab, setActiveTab] = useState<'suscripciones' | 'inventario' | 'kardex'>('suscripciones');

  const {
    loading,
    getSuscripciones,
    guardarSuscripcion,
    getProductos,
    registrarProducto,
    ingresarStock,
    getKardex
  } = useAlmacenaje();

  // Data states
  const [suscripciones, setSuscripciones] = useState<ISuscripcionComercio[]>([]);
  const [productos, setProductos] = useState<IProductoAlmacen[]>([]);
  const [kardex, setKardex] = useState<IMovimientoInventario[]>([]);

  // Search & Filters
  const [searchComercio, setSearchComercio] = useState('');
  const [selectedComercioFiltro, setSelectedComercioFiltro] = useState<number | ''>('');
  const [searchProducto, setSearchProducto] = useState('');

  // Modals state
  const [modalSuscripcionOpen, setModalSuscripcionOpen] = useState(false);
  const [comercioSeleccionado, setComercioSeleccionado] = useState<ISuscripcionComercio | null>(null);
  const [formSuscripcion, setFormSuscripcion] = useState({
    tieneServicioAlmacenaje: true,
    fechaInicio: getTodayFormatted(),
    fechaFin: getTodayFormatted(30),
    costoMensual: 150.00
  });

  const [modalNuevoProductoOpen, setModalNuevoProductoOpen] = useState(false);
  const [formProducto, setFormProducto] = useState({
    id: 0,
    idComercio: 0,
    codigoSKU: '',
    nombreProducto: '',
    descripcion: '',
    stockInicial: 0,
    stockMinimoAlerta: 5,
    precioReferencial: 0.00
  });

  const [modalStockOpen, setModalStockOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<IProductoAlmacen | null>(null);
  const [formStock, setFormStock] = useState({
    cantidad: 10,
    observaciones: 'Reabastecimiento regular'
  });

  const [feedback, setFeedback] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  const mostrarMensaje = (tipo: 'success' | 'error', texto: string) => {
    setFeedback({ tipo, texto });
    setTimeout(() => setFeedback(null), 4000);
  };

  const cargarDatos = useCallback(async () => {
    try {
      const subs = await getSuscripciones();
      setSuscripciones(subs);

      const prods = await getProductos();
      setProductos(prods);

      const movs = await getKardex();
      setKardex(movs);
    } catch (err: any) {
      mostrarMensaje('error', err.message || 'Error al cargar los datos de almacenaje.');
    }
  }, [getSuscripciones, getProductos, getKardex]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Real-time listener para actualizaciones de inventario y fulfillment por SignalR
  useEffect(() => {
    const handleInventarioUpdate = () => {
      cargarDatos();
    };
    window.addEventListener('inventario-almacen-actualizado', handleInventarioUpdate);
    return () => window.removeEventListener('inventario-almacen-actualizado', handleInventarioUpdate);
  }, [cargarDatos]);

  // Handlers
  const handleOpenSuscripcion = (c: ISuscripcionComercio) => {
    setComercioSeleccionado(c);
    setFormSuscripcion({
      tieneServicioAlmacenaje: c.tieneServicioAlmacenaje || true,
      fechaInicio: c.fechaInicio ? c.fechaInicio.split('T')[0] : getTodayFormatted(),
      fechaFin: c.fechaFin ? c.fechaFin.split('T')[0] : getTodayFormatted(30),
      costoMensual: c.costoMensual || 150.00
    });
    setModalSuscripcionOpen(true);
  };

  const handleToggleSuscripcionDirecta = async (c: ISuscripcionComercio) => {
    const nuevoEstado = !c.tieneServicioAlmacenaje;
    try {
      await guardarSuscripcion({
        idComercio: c.idComercio,
        tieneServicioAlmacenaje: nuevoEstado,
        fechaInicio: c.fechaInicio ? c.fechaInicio.split('T')[0] : getTodayFormatted(),
        fechaFin: c.fechaFin ? c.fechaFin.split('T')[0] : getTodayFormatted(30),
        costoMensual: Number(c.costoMensual) || 150.00
      });
      mostrarMensaje('success', `Almacenaje ${nuevoEstado ? 'HABILITADO' : 'DESHABILITADO'} para "${c.nombreComercial}".`);
      cargarDatos();
    } catch (err: any) {
      mostrarMensaje('error', err.message || 'Error al cambiar estado de suscripción.');
    }
  };

  const handleGuardarSuscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comercioSeleccionado) return;

    try {
      await guardarSuscripcion({
        idComercio: comercioSeleccionado.idComercio,
        tieneServicioAlmacenaje: formSuscripcion.tieneServicioAlmacenaje,
        fechaInicio: formSuscripcion.fechaInicio,
        fechaFin: formSuscripcion.fechaFin,
        costoMensual: Number(formSuscripcion.costoMensual)
      });
      mostrarMensaje('success', `Suscripción para "${comercioSeleccionado.nombreComercial}" guardada con éxito.`);
      setModalSuscripcionOpen(false);
      cargarDatos();
    } catch (err: any) {
      mostrarMensaje('error', err.message || 'Error al guardar la suscripción.');
    }
  };

  const handleGuardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formProducto.idComercio <= 0) {
      mostrarMensaje('error', 'Seleccione un comercio para este producto.');
      return;
    }
    if (!formProducto.nombreProducto.trim()) {
      mostrarMensaje('error', 'El nombre del producto es obligatorio.');
      return;
    }

    try {
      await registrarProducto({
        id: formProducto.id,
        idComercio: Number(formProducto.idComercio),
        codigoSKU: formProducto.codigoSKU.trim() || `SKU-${Date.now().toString().slice(-6)}`,
        nombreProducto: formProducto.nombreProducto.trim(),
        descripcion: formProducto.descripcion.trim(),
        stockInicial: Number(formProducto.stockInicial),
        stockMinimoAlerta: Number(formProducto.stockMinimoAlerta),
        precioReferencial: Number(formProducto.precioReferencial)
      });
      mostrarMensaje('success', 'Producto registrado correctamente en el almacén.');
      setModalNuevoProductoOpen(false);
      cargarDatos();
    } catch (err: any) {
      mostrarMensaje('error', err.message || 'Error al registrar el producto.');
    }
  };

  const handleGuardarStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productoSeleccionado) return;
    if (formStock.cantidad <= 0) {
      mostrarMensaje('error', 'La cantidad debe ser mayor a cero.');
      return;
    }

    try {
      await ingresarStock({
        idProducto: productoSeleccionado.id,
        cantidad: Number(formStock.cantidad),
        observaciones: formStock.observaciones.trim()
      });
      mostrarMensaje('success', `Se ingresaron ${formStock.cantidad} unidades a "${productoSeleccionado.nombreProducto}".`);
      setModalStockOpen(false);
      cargarDatos();
    } catch (err: any) {
      mostrarMensaje('error', err.message || 'Error al ingresar stock.');
    }
  };

  // Filtered lists
  const suscripcionesFiltradas = suscripciones.filter(s =>
    s.nombreComercial.toLowerCase().includes(searchComercio.toLowerCase()) ||
    s.razonSocial.toLowerCase().includes(searchComercio.toLowerCase()) ||
    s.ruc.includes(searchComercio)
  );

  const productosFiltrados = productos.filter(p => {
    const matchComercio = selectedComercioFiltro === '' || p.idComercio === selectedComercioFiltro;
    const matchSearch = p.nombreProducto.toLowerCase().includes(searchProducto.toLowerCase()) ||
                        p.codigoSKU.toLowerCase().includes(searchProducto.toLowerCase()) ||
                        p.comercioNombre.toLowerCase().includes(searchProducto.toLowerCase());
    return matchComercio && matchSearch;
  });

  // Totales
  const totalComerciosSuscritos = suscripciones.filter(s => s.tieneServicioAlmacenaje).length;
  const totalStockDisponibleGlobal = productos.reduce((acc, p) => acc + p.stockDisponible, 0);
  const totalStockDespachadoGlobal = productos.reduce((acc, p) => acc + p.stockDespachado, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-x-hidden w-full pb-20 md:pb-0 font-sans">
      <LeftSidebar
        contraido={contraido}
        setContraido={setContraido}
        movilAbierto={movilAbierto}
        setMovilAbierto={setMovilAbierto}
      />

      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${contraido ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Header Superior */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Warehouse size={20} />
            </div>
            <div>
              <h1 className="font-bold text-white text-base sm:text-lg leading-tight flex items-center gap-2">
                Almacén & Fulfillment
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  Fragata Courier
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Control de inventario, stock físico y suscripciones mensuales de comercios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={cargarDatos}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold"
              title="Actualizar datos"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-amber-400' : ''} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </header>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mx-4 sm:mx-6 mt-4 p-3.5 rounded-xl border flex items-center gap-3 text-sm font-medium ${
            feedback.tipo === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {feedback.tipo === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
            <span>{feedback.texto}</span>
          </div>
        )}

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto pb-24">
          {/* Métricas Rápidas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-400">Comercios Suscritos</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-amber-400">{totalComerciosSuscritos}</span>
                <span className="text-xs text-slate-500">de {suscripciones.length} totales</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-400">Productos en Almacén</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-blue-400">{productos.length}</span>
                <span className="text-xs text-slate-500">SKUs activos</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-400">Stock Disponible en Sede</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-emerald-400">{totalStockDisponibleGlobal}</span>
                <span className="text-xs text-slate-500">unidades listas</span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-400">Total Despachados (Ventas)</span>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-2xl font-black text-purple-400">{totalStockDespachadoGlobal}</span>
                <span className="text-xs text-slate-500">unidades enviadas</span>
              </div>
            </div>
          </div>

          {/* Selector de Pestañas */}
          <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('suscripciones')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === 'suscripciones'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Warehouse size={16} />
              Suscripciones de Comercios ({suscripciones.length})
            </button>

            <button
              onClick={() => setActiveTab('inventario')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === 'inventario'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package size={16} />
              Inventario & Stock Físico ({productos.length})
            </button>

            <button
              onClick={() => setActiveTab('kardex')}
              className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === 'kardex'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers size={16} />
              Kardex de Movimientos ({kardex.length})
            </button>
          </div>

          {/* TAB 1: SUSCRIPCIONES */}
          {activeTab === 'suscripciones' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Buscar comercio o RUC..."
                    value={searchComercio}
                    onChange={(e) => setSearchComercio(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Habilita el servicio de almacenaje para que el comercio pueda despachar sus productos sin requerir recojo.
                </div>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Comercio</th>
                        <th className="py-3 px-4">RUC / Contacto</th>
                        <th className="py-3 px-4">Estado Almacenaje</th>
                        <th className="py-3 px-4">Costo Mensual</th>
                        <th className="py-3 px-4">Stock en Almacén</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {suscripcionesFiltradas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500">
                            No se encontraron comercios.
                          </td>
                        </tr>
                      ) : (
                        suscripcionesFiltradas.map((c) => (
                          <tr key={c.idComercio} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4 font-medium text-white">
                              <div>{c.nombreComercial}</div>
                              <div className="text-xs text-slate-500 truncate max-w-xs">{c.razonSocial}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-xs text-slate-300">RUC: {c.ruc}</div>
                              <div className="text-xs text-slate-500">{c.telefono || c.correoContacto}</div>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => handleToggleSuscripcionDirecta(c)}
                                title={`Clic para ${c.tieneServicioAlmacenaje ? 'deshabilitar' : 'habilitar'} servicio inmediatamente`}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
                                  c.tieneServicioAlmacenaje
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40'
                                }`}
                              >
                                {c.tieneServicioAlmacenaje ? (
                                  <>
                                    <Check size={13} className="text-emerald-400 shrink-0" />
                                    <span>Habilitado</span>
                                  </>
                                ) : (
                                  <>
                                    <X size={13} className="text-rose-400 shrink-0" />
                                    <span>Deshabilitado</span>
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-200">
                              S/ {Number(c.costoMensual).toFixed(2)} / mes
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-xs font-medium text-amber-400">{c.totalStockDisponible} disponibles</div>
                              <div className="text-xs text-slate-500">{c.totalProductos} productos / {c.totalStockDespachado} despachados</div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleOpenSuscripcion(c)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition"
                              >
                                Configurar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INVENTARIO */}
          {activeTab === 'inventario' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar producto o SKU..."
                      value={searchProducto}
                      onChange={(e) => setSearchProducto(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <select
                    value={selectedComercioFiltro}
                    onChange={(e) => setSelectedComercioFiltro(e.target.value === '' ? '' : Number(e.target.value))}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Todos los comercios</option>
                    {suscripciones.map((s) => (
                      <option key={s.idComercio} value={s.idComercio}>
                        {s.nombreComercial}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setFormProducto({
                      id: 0,
                      idComercio: suscripciones.length > 0 ? suscripciones[0].idComercio : 0,
                      codigoSKU: `SKU-${Date.now().toString().slice(-6)}`,
                      nombreProducto: '',
                      descripcion: '',
                      stockInicial: 50,
                      stockMinimoAlerta: 5,
                      precioReferencial: 0.00
                    });
                    setModalNuevoProductoOpen(true);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-orange-500/20 transition"
                >
                  <Plus size={16} />
                  Nuevo Producto en Almacén
                </button>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">SKU / Producto</th>
                        <th className="py-3 px-4">Comercio</th>
                        <th className="py-3 px-4 text-center">Disponible</th>
                        <th className="py-3 px-4 text-center">Despachado</th>
                        <th className="py-3 px-4 text-center">Stock Inicial</th>
                        <th className="py-3 px-4">Estado Stock</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {productosFiltrados.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-500">
                            No hay productos registrados en el almacén.
                          </td>
                        </tr>
                      ) : (
                        productosFiltrados.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-white">{p.nombreProducto}</div>
                              <div className="text-xs font-mono text-amber-400/80">{p.codigoSKU}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {p.comercioNombre}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="text-base font-black text-emerald-400">{p.stockDisponible}</span>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-400">
                              {p.stockDespachado}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-500">
                              {p.stockInicial}
                            </td>
                            <td className="py-3 px-4">
                              {p.esAlertaStock ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse">
                                  <AlertTriangle size={12} />
                                  Stock Bajo (≤{p.stockMinimoAlerta})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 size={12} />
                                  Suficiente
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => {
                                  setProductoSeleccionado(p);
                                  setFormStock({ cantidad: 20, observaciones: 'Reabastecimiento de mercadería' });
                                  setModalStockOpen(true);
                                }}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition inline-flex items-center gap-1"
                              >
                                <Plus size={12} />
                                Ingresar Stock
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KARDEX */}
          {activeTab === 'kardex' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                <h3 className="text-sm font-semibold text-slate-300">
                  Auditoría completa de movimientos de inventario en almacén
                </h3>
                <span className="text-xs text-slate-500">
                  Total de movimientos: {kardex.length}
                </span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Fecha & Hora</th>
                        <th className="py-3 px-4">Tipo Movimiento</th>
                        <th className="py-3 px-4">Producto / SKU</th>
                        <th className="py-3 px-4">Comercio</th>
                        <th className="py-3 px-4 text-center">Cantidad</th>
                        <th className="py-3 px-4 text-center">Previo → Final</th>
                        <th className="py-3 px-4">Pedido / Detalle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {kardex.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-500">
                            No hay movimientos registrados en el Kardex.
                          </td>
                        </tr>
                      ) : (
                        kardex.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                              {new Date(m.fechaMovimiento).toLocaleString('es-PE')}
                            </td>
                            <td className="py-3 px-4">
                              {m.tipoMovimiento === 'DESPACHO_PEDIDO' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  <ArrowDownRight size={12} />
                                  Despacho Venta
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <ArrowUpRight size={12} />
                                  {m.tipoMovimiento === 'INGRESO_INICIAL' ? 'Apertura Stock' : 'Reabastecimiento'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-white">{m.nombreProducto}</div>
                              <div className="text-xs font-mono text-slate-500">{m.codigoSKU}</div>
                            </td>
                            <td className="py-3 px-4 text-slate-300 text-xs">
                              {m.comercioNombre}
                            </td>
                            <td className="py-3 px-4 text-center font-bold">
                              <span className={m.tipoMovimiento === 'DESPACHO_PEDIDO' ? 'text-rose-400' : 'text-emerald-400'}>
                                {m.tipoMovimiento === 'DESPACHO_PEDIDO' ? `-${m.cantidad}` : `+${m.cantidad}`}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center text-xs font-mono">
                              <span className="text-slate-400">{m.stockPrevio}</span>
                              <span className="text-slate-600 mx-1">→</span>
                              <span className="text-white font-bold">{m.stockPosterior}</span>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-400">
                              {m.pedidoCodigoSeguimiento ? (
                                <span className="font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                  {m.pedidoCodigoSeguimiento}
                                </span>
                              ) : (
                                <span>{m.observaciones || '—'}</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL CONFIGURAR SUSCRIPCIÓN */}
      {modalSuscripcionOpen && comercioSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Warehouse size={18} className="text-amber-400" />
                Suscripción de Almacenaje
              </h3>
              <button
                onClick={() => setModalSuscripcionOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <span className="text-slate-500">Comercio:</span> <strong className="text-white">{comercioSeleccionado.nombreComercial}</strong>
              <div className="text-slate-400 text-[11px] mt-0.5">RUC: {comercioSeleccionado.ruc}</div>
            </div>

            <form onSubmit={handleGuardarSuscripcion} className="space-y-4 text-sm">
              {/* Switch de Activación de Servicio */}
              <div
                onClick={() => setFormSuscripcion({ ...formSuscripcion, tieneServicioAlmacenaje: !formSuscripcion.tieneServicioAlmacenaje })}
                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formSuscripcion.tieneServicioAlmacenaje
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    {formSuscripcion.tieneServicioAlmacenaje ? (
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 size={16} /> Servicio HABILITADO
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1.5">
                        <X size={16} /> Servicio DESHABILITADO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {formSuscripcion.tieneServicioAlmacenaje
                      ? 'El comercio tiene acceso completo a Mi Almacén y despacho de stock.'
                      : 'El comercio verá la pantalla informativa para solicitar activación.'}
                  </p>
                </div>
                {/* Switch visual animado */}
                <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 shrink-0 ${
                  formSuscripcion.tieneServicioAlmacenaje ? 'bg-emerald-500' : 'bg-slate-700'
                }`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    formSuscripcion.tieneServicioAlmacenaje ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Costo Mensual de Almacenaje (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formSuscripcion.costoMensual}
                  onChange={(e) => setFormSuscripcion({ ...formSuscripcion, costoMensual: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    required
                    value={formSuscripcion.fechaInicio}
                    onChange={(e) => setFormSuscripcion({ ...formSuscripcion, fechaInicio: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Fecha Fin (Renovación)
                  </label>
                  <input
                    type="date"
                    required
                    value={formSuscripcion.fechaFin}
                    onChange={(e) => setFormSuscripcion({ ...formSuscripcion, fechaFin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSuscripcionOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white shadow-lg shadow-orange-500/20 transition"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NUEVO PRODUCTO EN ALMACÉN */}
      {modalNuevoProductoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Package size={18} className="text-amber-400" />
                Registrar Producto en Almacén
              </h3>
              <button
                onClick={() => setModalNuevoProductoOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarProducto} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Comercio Propietario *
                </label>
                <select
                  required
                  value={formProducto.idComercio}
                  onChange={(e) => setFormProducto({ ...formProducto, idComercio: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                >
                  <option value={0}>Seleccione un comercio</option>
                  {suscripciones.map((s) => (
                    <option key={s.idComercio} value={s.idComercio}>
                      {s.nombreComercial} {s.tieneServicioAlmacenaje ? '(Almacenaje Activo)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Código SKU / Identificador
                  </label>
                  <input
                    type="text"
                    required
                    value={formProducto.codigoSKU}
                    onChange={(e) => setFormProducto({ ...formProducto, codigoSKU: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Stock Inicial Ingresado
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formProducto.stockInicial}
                    onChange={(e) => setFormProducto({ ...formProducto, stockInicial: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Nombre del Producto (ej. Potes de Miel 500g) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Miel de Abeja Pote 500g"
                  value={formProducto.nombreProducto}
                  onChange={(e) => setFormProducto({ ...formProducto, nombreProducto: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Stock Mínimo para Alerta
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formProducto.stockMinimoAlerta}
                    onChange={(e) => setFormProducto({ ...formProducto, stockMinimoAlerta: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Precio Ref. Unitario (S/)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formProducto.precioReferencial}
                    onChange={(e) => setFormProducto({ ...formProducto, precioReferencial: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNuevoProductoOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white shadow-lg shadow-orange-500/20 transition"
                >
                  {loading ? 'Guardando...' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INGRESAR STOCK / REABASTECER */}
      {modalStockOpen && productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus size={18} className="text-emerald-400" />
                Ingresar Stock Físico
              </h3>
              <button
                onClick={() => setModalStockOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
              <div className="font-semibold text-white">{productoSeleccionado.nombreProducto}</div>
              <div className="text-slate-400 font-mono mt-0.5">SKU: {productoSeleccionado.codigoSKU}</div>
              <div className="text-emerald-400 font-bold mt-1">
                Stock actual: {productoSeleccionado.stockDisponible} unidades
              </div>
            </div>

            <form onSubmit={handleGuardarStock} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Cantidad de Unidades a Ingresar *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={formStock.cantidad}
                  onChange={(e) => setFormStock({ ...formStock, cantidad: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold text-lg focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Observaciones / Motivo de Ingreso
                </label>
                <input
                  type="text"
                  value={formStock.observaciones}
                  onChange={(e) => setFormStock({ ...formStock, observaciones: e.target.value })}
                  placeholder="Ej: Reabastecimiento de 50 potes"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalStockOpen(false)}
                  className="w-1/2 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 transition"
                >
                  {loading ? 'Registrando...' : 'Confirmar Ingreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
    </div>
  );
};

export default AlmacenajeAdminPage;
