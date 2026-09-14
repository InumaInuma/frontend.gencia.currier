import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/context/AuthContext';
import { LeftSidebar } from '../../components/LeftSidebar';
import { MobileBottomNav } from '../../components/MobileBottomNav';
import { useAlmacenaje } from '../../../application/useCases/useAlmacenaje';
import type {
  IEstadoSuscripcionComercio,
  IProductoAlmacen,
  IMovimientoInventario
} from '../../../domain/models/IAlmacenaje';
import {
  Warehouse,
  Package,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ShoppingBag,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';

export const MiAlmacenComercioPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contraido, setContraido] = useState(false);
  const [movilAbierto, setMovilAbierto] = useState(false);
  const [activeTab, setActiveTab] = useState<'productos' | 'kardex'>('productos');

  const {
    loading,
    getMiSuscripcion,
    getProductos,
    getKardex
  } = useAlmacenaje();

  const [suscripcion, setSuscripcion] = useState<IEstadoSuscripcionComercio | null>(null);
  const [productos, setProductos] = useState<IProductoAlmacen[]>([]);
  const [kardex, setKardex] = useState<IMovimientoInventario[]>([]);

  const cargarDatos = useCallback(async () => {
    try {
      const sub = await getMiSuscripcion();
      setSuscripcion(sub);

      if (sub && sub.tieneServicioAlmacenaje) {
        const prods = await getProductos();
        setProductos(prods);

        const movs = await getKardex();
        setKardex(movs);
      }
    } catch (err: any) {
      console.error('Error cargando almacén del comercio:', err);
    }
  }, [getMiSuscripcion, getProductos, getKardex]);

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

  const productosEnAlerta = productos.filter(p => p.esAlertaStock);
  const totalDisponible = productos.reduce((acc, p) => acc + p.stockDisponible, 0);
  const totalDespachado = productos.reduce((acc, p) => acc + p.stockDespachado, 0);

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
                Mi Almacén & Stock
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                  Fulfillment
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Inventario físico en sede de Fragata Courier y despachos automáticos
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

        <main className="p-4 sm:p-6 space-y-6 max-w-7xl w-full mx-auto pb-24">
          {/* SI NO TIENE SUSCRIPCIÓN ACTIVA */}
          {suscripcion && !suscripcion.tieneServicioAlmacenaje && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/20 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-2.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={16} />
                Nuevo Servicio de Almacenaje para Comercios
              </div>

              <div className="max-w-2xl space-y-3">
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  Guarda tus productos en nuestro almacén y despacha al instante
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  ¿No tienes espacio para guardar tus productos o pierdes tiempo esperando los recojos de cada pedido?
                  Con el servicio de <strong>Almacenaje & Fulfillment de Fragata Courier</strong>, dejas tu mercadería
                  en nuestra sede central y, cuando vendas, nosotros alistamos y entregamos tu paquete el mismo día.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    <Zap size={18} />
                  </div>
                  <h4 className="font-bold text-white text-sm">Sin Espera de Recojos</h4>
                  <p className="text-xs text-slate-400">Tus pedidos salen directo a ruta de entrega desde nuestro almacén.</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                    <CheckCircle2 size={18} />
                  </div>
                  <h4 className="font-bold text-white text-sm">Control de Stock en Tiempo Real</h4>
                  <p className="text-xs text-slate-400">Kardex digital que descuenta automáticamente cada pote o producto vendido.</p>
                </div>

                <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                    <ShieldCheck size={18} />
                  </div>
                  <h4 className="font-bold text-white text-sm">Custodia Segura</h4>
                  <p className="text-xs text-slate-400">Espacio vigilado las 24 horas y asegurado para tu mercadería.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 border-t border-slate-800">
                <a
                  href="https://wa.me/51999999999?text=Hola,%20deseo%20activar%20el%20servicio%20de%20Almacenaje%20Fulfillment%20en%20Fragata%20Courier"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold rounded-xl text-sm shadow-xl shadow-orange-500/20 transition flex items-center justify-center gap-2"
                >
                  Solicitar Activación de Almacenaje
                  <ArrowRight size={16} />
                </a>
                <span className="text-xs text-slate-400">
                  Planes accesibles con tarifa plana mensual + tarifa estándar por envío entregado.
                </span>
              </div>
            </div>
          )}

          {/* SI TIENE SUSCRIPCIÓN ACTIVA */}
          {suscripcion && suscripcion.tieneServicioAlmacenaje && (
            <>
              {/* Banner de Suscripción Activa */}
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Warehouse size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">Servicio de Almacenaje Activo</h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Vigente
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Costo mensual: <strong>S/ {Number(suscripcion.costoMensual).toFixed(2)}</strong> | Renovación:{' '}
                      {suscripcion.fechaFin ? new Date(suscripcion.fechaFin).toLocaleDateString('es-PE') : 'Activo'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/comercio/agendar-envio?fulfillment=true')}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2"
                >
                  <ShoppingBag size={16} />
                  Despachar Pedido desde Almacén
                </button>
              </div>

              {/* Alertas de Stock Mínimo */}
              {productosEnAlerta.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <AlertTriangle size={16} />
                    ¡Atención! Tienes productos con bajo inventario en almacén
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    {productosEnAlerta.map((p) => (
                      <div key={p.id} className="bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/20 flex items-center justify-between">
                        <span className="font-semibold text-white truncate mr-2">{p.nombreProducto}</span>
                        <span className="text-amber-400 font-black whitespace-nowrap">
                          {p.stockDisponible} restantes (Mínimo: {p.stockMinimoAlerta})
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    Coordina con Fragata Courier para ingresar más unidades a nuestro almacén y no quedarte sin stock.
                  </p>
                </div>
              )}

              {/* Métricas de Stock */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                  <span className="text-xs font-medium text-slate-400">Stock Disponible para Vender</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
                    {totalDisponible}
                  </div>
                  <span className="text-[11px] text-slate-500">unidades en almacén</span>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                  <span className="text-xs font-medium text-slate-400">Unidades Despachadas</span>
                  <div className="text-2xl sm:text-3xl font-black text-purple-400 mt-2">
                    {totalDespachado}
                  </div>
                  <span className="text-[11px] text-slate-500">ventas entregadas</span>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
                  <span className="text-xs font-medium text-slate-400">Productos Registrados</span>
                  <div className="text-2xl sm:text-3xl font-black text-blue-400 mt-2">
                    {productos.length}
                  </div>
                  <span className="text-[11px] text-slate-500">SKUs bajo custodia</span>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-800 gap-2">
                <button
                  onClick={() => setActiveTab('productos')}
                  className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition ${
                    activeTab === 'productos'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Package size={16} />
                  Mis Productos Guardados ({productos.length})
                </button>

                <button
                  onClick={() => setActiveTab('kardex')}
                  className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 transition ${
                    activeTab === 'kardex'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers size={16} />
                  Movimientos & Ventas ({kardex.length})
                </button>
              </div>

              {/* TAB 1: PRODUCTOS */}
              {activeTab === 'productos' && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Producto</th>
                          <th className="py-3 px-4">SKU</th>
                          <th className="py-3 px-4 text-center">Disponible</th>
                          <th className="py-3 px-4 text-center">Vendido</th>
                          <th className="py-3 px-4 text-center">Total Ingresado</th>
                          <th className="py-3 px-4">Estado</th>
                          <th className="py-3 px-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {productos.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8 text-slate-500">
                              Aún no tienes productos registrados en el almacén.
                            </td>
                          </tr>
                        ) : (
                          productos.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-800/30 transition">
                              <td className="py-3 px-4 font-semibold text-white">
                                <div>{p.nombreProducto}</div>
                                {p.descripcion && (
                                  <div className="text-xs text-slate-400 font-normal">{p.descripcion}</div>
                                )}
                              </td>
                              <td className="py-3 px-4 font-mono text-xs text-amber-400/80">
                                {p.codigoSKU}
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
                                    Disponible
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  onClick={() => navigate(`/comercio/agendar-envio?fulfillment=true&productoId=${p.id}`)}
                                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition inline-flex items-center gap-1"
                                >
                                  Despachar
                                  <ArrowRight size={12} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: KARDEX */}
              {activeTab === 'kardex' && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                      <thead className="bg-slate-900/90 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Fecha & Hora</th>
                          <th className="py-3 px-4">Tipo</th>
                          <th className="py-3 px-4">Producto</th>
                          <th className="py-3 px-4 text-center">Cantidad</th>
                          <th className="py-3 px-4 text-center">Saldo</th>
                          <th className="py-3 px-4">Código Pedido / Detalle</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {kardex.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="text-center py-8 text-slate-500">
                              No hay movimientos registrados.
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
                                    Venta Despachada
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <ArrowUpRight size={12} />
                                    Ingreso Físico
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 font-medium text-white">
                                {m.nombreProducto}
                              </td>
                              <td className="py-3 px-4 text-center font-bold">
                                <span className={m.tipoMovimiento === 'DESPACHO_PEDIDO' ? 'text-rose-400' : 'text-emerald-400'}>
                                  {m.tipoMovimiento === 'DESPACHO_PEDIDO' ? `-${m.cantidad}` : `+${m.cantidad}`}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center text-xs font-mono">
                                <span className="text-white font-bold">{m.stockPosterior}</span>
                              </td>
                              <td className="py-3 px-4 text-xs text-slate-400">
                                {m.pedidoCodigoSeguimiento ? (
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                      {m.pedidoCodigoSeguimiento}
                                    </span>
                                    {m.pedidoTarifaEnvio && (
                                      <span className="text-slate-500">Envío: S/ {Number(m.pedidoTarifaEnvio).toFixed(2)}</span>
                                    )}
                                  </div>
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
              )}
            </>
          )}
        </main>
      </div>

      <MobileBottomNav onOpenMenu={() => setMovilAbierto(true)} />
    </div>
  );
};

export default MiAlmacenComercioPage;
