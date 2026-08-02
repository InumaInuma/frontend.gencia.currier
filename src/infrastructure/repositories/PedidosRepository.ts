import { apiClient } from '../api/apiClient';
import type { IPedidosRepository, IConfirmarEntregaParams } from '../../domain/repositories/IPedidosRepository';
import type { IDistrito } from '../../domain/models/IDistrito';
import type { IPedido, IRegisterPedidoParams, IPedidoResultado } from '../../domain/models/IPedido';
import type { IConductor, IAsignarRecojoParams } from '../../domain/models/IConductor';
import type { IMonitoreoRecojo } from '../../domain/models/IMonitoreoRecojo';
import type { IMonitoreoEntrega } from '../../domain/models/IMonitoreoEntrega';

interface BaseResponse<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
}

export class PedidosRepository implements IPedidosRepository {
  async getDistritos(): Promise<IDistrito[]> {
    const response = await apiClient.get<BaseResponse<IDistrito[]>>('/api/pedidos/distritos');
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener los distritos de cobertura.');
    }
    return body.data;
  }

  async registrarPedido(params: IRegisterPedidoParams): Promise<IPedidoResultado> {
    const response = await apiClient.post<BaseResponse<IPedidoResultado>>('/api/pedidos', params);
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al agendar el envío.');
    }
    return body.data;
  }

  async getMisPedidos(): Promise<IPedido[]> {
    const response = await apiClient.get<BaseResponse<IPedido[]>>('/api/pedidos/mis-pedidos');
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener el historial de pedidos.');
    }
    return body.data;
  }

  async getMisCompras(): Promise<IPedido[]> {
    const response = await apiClient.get<BaseResponse<IPedido[]>>('/api/pedidos/mis-compras');
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener el historial de compras.');
    }
    return body.data;
  }

  async getTodosLosPedidosAdmin(): Promise<IPedido[]> {
    const response = await apiClient.get<BaseResponse<IPedido[]>>('/api/pedidos/admin-todos');
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener los pedidos para el panel admin.');
    }
    return body.data;
  }

  async getConductoresDisponibles(): Promise<IConductor[]> {
    const response = await apiClient.get<BaseResponse<IConductor[]>>('/api/pedidos/conductores-disponibles');
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener los motorizados disponibles.');
    }
    return body.data;
  }

  async getPedidosPendientesRecojo(): Promise<IPedido[]> {
    const response = await apiClient.get<BaseResponse<IPedido[]>>('/api/pedidos/pendientes-recojo');
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener los pedidos pendientes de recojo.');
    }
    return body.data;
  }

  async asignarRecojo(params: IAsignarRecojoParams): Promise<boolean> {
    const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/asignar-recojo', params);
    const body = response.data;
    if (!body.isSuccess) {
      throw new Error(body.message || 'Error al asignar la ruta de recojo al motorizado.');
    }
    return true;
  }

  async getMonitoreoRecojosAdmin(): Promise<IMonitoreoRecojo[]> {
    const response = await apiClient.get<BaseResponse<IMonitoreoRecojo[]>>('/api/pedidos/monitoreo-recojos');
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener el monitoreo de recojos.');
    }
    return body.data;
  }

  async getMisRecojosMotorizado(): Promise<IMonitoreoRecojo[]> {
    const response = await apiClient.get<BaseResponse<IMonitoreoRecojo[]>>('/api/pedidos/motorizado/mis-recojos');
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener los recojos del motorizado.');
    }
    return body.data;
  }

  async actualizarEstadoComercioRecojo(params: { idAsignacionRecojo: number; idComercio: number; idEstado: number }): Promise<boolean> {
    const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/motorizado/actualizar-estado-comercio', params);
    const body = response.data;
    if (!body.isSuccess) {
      throw new Error(body.message || 'Error al actualizar estado del comercio.');
    }
    return true;
  }

  async actualizarEstadoAlmacenRecojo(params: { idAsignacionRecojo: number; idEstado: number }): Promise<boolean> {
    const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/motorizado/actualizar-estado-almacen', params);
    const body = response.data;
    if (!body.isSuccess) {
      throw new Error(body.message || 'Error al actualizar estado del almacén.');
    }
    return true;
  }

  async getPedidosPendientesEntregaPorDistrito(): Promise<IMonitoreoRecojo[]> {
    const response = await apiClient.get<BaseResponse<IMonitoreoRecojo[]>>('/api/pedidos/pendientes-entrega-distritos');
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener los envíos en almacén para entrega.');
    }
    return body.data;
  }

  async asignarEntrega(params: { idConductor: number; pedidoIds: number[] }): Promise<boolean> {
    const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/asignar-entrega', params);
    const body = response.data;
    if (!body.isSuccess) {
      throw new Error(body.message || 'Error al asignar la entrega al motorizado.');
    }
    return true;
  }

  async getMisEntregasMotorizado(): Promise<IMonitoreoEntrega[]> {
    const response = await apiClient.get<BaseResponse<IMonitoreoEntrega[]>>('/api/pedidos/motorizado/mis-entregas');
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener las entregas del motorizado.');
    }
    return body.data;
  }

  async iniciarRutaEntrega(idAsignacionEntrega: number): Promise<boolean> {
    const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/motorizado/iniciar-ruta-entrega', idAsignacionEntrega);
    const body = response.data;
    if (!body.isSuccess) {
      throw new Error(body.message || 'Error al iniciar la ruta de entrega.');
    }
    return true;
  }

  async actualizarEstadoEntregaPedido(params: IConfirmarEntregaParams): Promise<boolean> {
    const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/motorizado/actualizar-estado-entrega', params);
    const body = response.data;
    if (!body.isSuccess) {
      throw new Error(body.message || 'Error al actualizar el estado de entrega del paquete.');
    }
    return true;
  }

  async getLiquidacionesResumenAdmin(): Promise<import('../../domain/models/ILiquidacionResumen').ILiquidacionResumen[]> {
    const response = await apiClient.get<BaseResponse<import('../../domain/models/ILiquidacionResumen').ILiquidacionResumen[]>>('/api/pedidos/admin/liquidaciones');
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener resumen de liquidaciones.');
    }
    return body.data;
  }

  async getLiquidacionDetalleMotorizado(idConductor: number): Promise<import('../../domain/models/ILiquidacionDetalle').ILiquidacionDetalle[]> {
    const response = await apiClient.get<BaseResponse<import('../../domain/models/ILiquidacionDetalle').ILiquidacionDetalle[]>>(`/api/pedidos/admin/liquidaciones/${idConductor}`);
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al obtener detalle de liquidación del motorizado.');
    }
    return body.data;
  }

  async confirmarRendicionDinero(idConductor: number): Promise<boolean> {
    const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/admin/confirmar-rendicion', idConductor);
    const body = response.data;
    if (!body.isSuccess) {
      throw new Error(body.message || 'Error al confirmar la recepción de dinero.');
    }
    return true;
  }

  async rastrearPedidoPorCodigo(codigo: string): Promise<import('../../domain/models/IRastreoPedido').IRastreoPedido | null> {
    if (!codigo || !codigo.trim()) return null;
    const response = await apiClient.get<BaseResponse<import('../../domain/models/IRastreoPedido').IRastreoPedido>>(`/api/pedidos/rastreo/${encodeURIComponent(codigo.trim())}`);
    const body = response.data;
    if (!body.isSuccess || !body.data) {
      return null;
    }
    return body.data;
  }
}
