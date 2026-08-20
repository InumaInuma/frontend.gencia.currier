import React, { useState, useMemo } from 'react';
import type { ILiquidacionResumen } from '../../../domain/models/ILiquidacionResumen';
import type { ILiquidacionDetalle } from '../../../domain/models/ILiquidacionDetalle';
import { LayoutList, Building2 } from 'lucide-react';

import { calcularResumenComercios } from './rendicionUtils';
import { DriverHeaderCard } from './DriverHeaderCard';
import { DriverMetricsGrid } from './DriverMetricsGrid';
import { TabListadoPaquetes } from './TabListadoPaquetes';
import { TabLiquidacionComercio } from './TabLiquidacionComercio';

interface Props {
  selectedConductor: ILiquidacionResumen;
  detalleList: ILiquidacionDetalle[] | undefined;
  isLoadingDetalle: boolean;
  resumenDetalle: {
    totalAsignados: number;
    entregados: number;
    noEntregados: number;
    efectivo: number;
    yape: number;
    transferencia: number;
    total: number;
  };
  onVolver: () => void;
  onConfirmarRendicion: (idConductor: number, nombreConductor: string) => void;
  isPendingConfirmacion: boolean;
}

export const VistaDetalleRendicionMotorizado: React.FC<Props> = ({
  selectedConductor,
  detalleList,
  isLoadingDetalle,
  resumenDetalle,
  onVolver,
  onConfirmarRendicion,
  isPendingConfirmacion,
}) => {
  // Tab state: 1 = "Listado Detallado de Paquetes", 2 = "Liquidación por Comercio"
  const [activeTab, setActiveTab] = useState<1 | 2>(1);

  // Calculate summary aggregated per Commerce
  const resumenComercios = useMemo(
    () => calcularResumenComercios(detalleList),
    [detalleList]
  );

  return (
    <div className="space-y-6">
      {/* Driver Header Card */}
      <DriverHeaderCard
        selectedConductor={selectedConductor}
        onVolver={onVolver}
        onConfirmarRendicion={onConfirmarRendicion}
        isPendingConfirmacion={isPendingConfirmacion}
      />

      {/* Metrics Grid of the Selected Driver */}
      <DriverMetricsGrid resumenDetalle={resumenDetalle} />

      {/* TABS CONTAINER: Pestaña 1 (Listado de Paquetes) y Pestaña 2 (Liquidación por Comercio) */}
      <div className="flex gap-0 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/40">
        <button
          type="button"
          onClick={() => setActiveTab(1)}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 1
              ? 'bg-violet-600/30 text-violet-300 border-b-2 border-violet-500'
              : 'text-slate-400 hover:text-white border-b-2 border-transparent'
          }`}
        >
          <LayoutList size={16} />
          <span>Pestaña 1: Listado Detallado de Paquetes Asignados</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-mono border border-slate-800 text-slate-300">
            {detalleList?.length || 0}
          </span>
        </button>

        <div className="w-px bg-slate-800" />

        <button
          type="button"
          onClick={() => setActiveTab(2)}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === 2
              ? 'bg-amber-500/20 text-amber-300 border-b-2 border-amber-500'
              : 'text-slate-400 hover:text-white border-b-2 border-transparent'
          }`}
        >
          <Building2 size={16} />
          <span>Pestaña 2: Liquidación Financiera por Comercio (Balance Neto)</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-950 text-[10px] font-mono border border-slate-800 text-slate-300">
            {resumenComercios.length}
          </span>
        </button>
      </div>

      {/* PESTAÑA 1: LISTADO DETALLADO DE PAQUETES ASIGNADOS */}
      {activeTab === 1 && (
        <TabListadoPaquetes detalleList={detalleList} isLoadingDetalle={isLoadingDetalle} />
      )}

      {/* PESTAÑA 2: LIQUIDACIÓN FINANCIERA POR COMERCIO (TABLA Y CARDS MÓVILES) */}
      {activeTab === 2 && (
        <TabLiquidacionComercio resumenComercios={resumenComercios} />
      )}
    </div>
  );
};
