import type { IDistrito } from '../models/IDistrito';
import type { IPedido, IRegisterPedidoParams, IPedidoResultado } from '../models/IPedido';
import type { IConductor, IAsignarRecojoParams } from '../models/IConductor';
import type { IMonitoreoRecojo } from '../models/IMonitoreoRecojo';
import type { IMonitoreoEntrega } from '../models/IMonitoreoEntrega';

import type { ILiquidacionResumen } from '../models/ILiquidacionResumen';
import type { ILiquidacionDetalle } from '../models/ILiquidacionDetalle';
import type { IRastreoPedido } from '../models/IRastreoPedido';

export interface IConfirmarEntregaParams {
  idAsignacionEntrega: number;
  idPedido: number;
  idEstado: number;
  montoEfectivo?: number;
  montoYape?: number;
  referenciaYape?: string;
  observacion?: string;
}

export interface IPedidosRepository {
  getDistritos(): Promise<IDistrito[]>;
  registrarPedido(params: IRegisterPedidoParams): Promise<IPedidoResultado>;
  getMisPedidos(params?: { fechaInicio?: string; fechaFin?: string; pageNumber?: number; pageSize?: number }): Promise<IPedido[]>;
  getMisCompras(): Promise<IPedido[]>;
  getTodosLosPedidosAdmin(params?: { fechaInicio?: string; fechaFin?: string }): Promise<IPedido[]>;
  getConductoresDisponibles(): Promise<IConductor[]>;
  getPedidosPendientesRecojo(): Promise<IPedido[]>;
  asignarRecojo(params: IAsignarRecojoParams): Promise<boolean>;
  getMonitoreoRecojosAdmin(params?: { fechaInicio?: string; fechaFin?: string }): Promise<IMonitoreoRecojo[]>;
  getMisRecojosMotorizado(): Promise<IMonitoreoRecojo[]>;
  actualizarEstadoComercioRecojo(params: { idAsignacionRecojo: number; idComercio: number; idEstado: number }): Promise<boolean>;
  actualizarEstadoAlmacenRecojo(params: { idAsignacionRecojo: number; idEstado: number }): Promise<boolean>;
  getPedidosPendientesEntregaPorDistrito(): Promise<IMonitoreoRecojo[]>;
  asignarEntrega(params: { idConductor: number; pedidoIds: number[] }): Promise<boolean>;
  getMisEntregasMotorizado(): Promise<IMonitoreoEntrega[]>;
  iniciarRutaEntrega(idAsignacionEntrega: number): Promise<boolean>;
  actualizarEstadoEntregaPedido(params: IConfirmarEntregaParams): Promise<boolean>;
  getLiquidacionesResumenAdmin(): Promise<ILiquidacionResumen[]>;
  getLiquidacionDetalleMotorizado(idConductor: number): Promise<ILiquidacionDetalle[]>;
  confirmarRendicionDinero(idConductor: number): Promise<boolean>;
  rastrearPedidoPorCodigo(codigo: string): Promise<IRastreoPedido | null>;
}
