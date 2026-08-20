import React from 'react';
import { EstadoPedidoEnum } from '../../../domain/enums/EstadoPedidoEnum';
import { Truck, Building2, CheckCircle2 } from 'lucide-react';

interface Props {
  todosComerciosRecogidos: boolean;
  estaEnCaminoAlmacen: boolean;
  estaEntregadoAlmacen: boolean;
  onActualizarEstadoAlmacen: (idEstado: EstadoPedidoEnum) => void;
  isPending: boolean;
}

export const TarjetaAlmacenRetorno: React.FC<Props> = ({
  todosComerciosRecogidos,
  estaEnCaminoAlmacen,
  estaEntregadoAlmacen,
  onActualizarEstadoAlmacen,
  isPending,
}) => {
  return (
    <>
      {/* Warehouse Return Action Card (When all Comercios are collected or currently returning) */}
      {todosComerciosRecogidos && !estaEntregadoAlmacen && (
        <div className="bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-500/40 p-6 rounded-3xl shadow-2xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center shrink-0">
                <Truck size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-white text-base sm:text-lg">
                  ¡Todos los recojos de comercios han sido completados!
                </h3>
                <p className="text-xs text-slate-300">
                  {estaEnCaminoAlmacen
                    ? '📍 Te encuentras en camino hacia el Almacén General (La Victoria).'
                    : 'Avisa a la central cuando inicies tu retorno al Almacén General.'}
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              {!estaEnCaminoAlmacen ? (
                <button
                  type="button"
                  onClick={() => onActualizarEstadoAlmacen(EstadoPedidoEnum.EnCaminoAlAlmacen)}
                  disabled={isPending}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl shadow-violet-500/30 active:scale-95"
                >
                  <Truck size={20} />
                  Voy en Camino al Almacén
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onActualizarEstadoAlmacen(EstadoPedidoEnum.EnAlmacen)}
                  disabled={isPending}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-extrabold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xl shadow-emerald-500/30 active:scale-95"
                >
                  <Building2 size={20} />
                  Llegué y Entregué Paquetes en Almacén
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Route Finished Card */}
      {estaEntregadoAlmacen && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl text-center space-y-2 animate-fade-in">
          <CheckCircle2 size={36} className="mx-auto text-emerald-400" />
          <h3 className="text-base font-extrabold text-white">¡Ruta de Recojo Completada Exitosamente!</h3>
          <p className="text-xs text-emerald-300 font-semibold max-w-lg mx-auto">
            Todos los paquetes han sido recogidos de los comercios e ingresados formalmente en el Almacén General.
          </p>
        </div>
      )}
    </>
  );
};
