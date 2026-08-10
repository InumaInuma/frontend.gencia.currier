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
    try {
      const response = await apiClient.get<BaseResponse<IDistrito[]>>('/api/pedidos/distritos');
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener los distritos de cobertura.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener los distritos de cobertura.';
      throw new Error(errMsg);
    }
  }

  async registrarPedido(params: IRegisterPedidoParams): Promise<IPedidoResultado> {
    try {
      const response = await apiClient.post<BaseResponse<IPedidoResultado>>('/api/pedidos', params);
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al agendar el envío.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al agendar el envío.';
      throw new Error(errMsg);
    }
  }

  async getMisPedidos(params?: { fechaInicio?: string; fechaFin?: string; pageNumber?: number; pageSize?: number }): Promise<IPedido[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
      if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
      if (params?.pageNumber) queryParams.append('pageNumber', params.pageNumber.toString());
      if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

      const url = `/api/pedidos/mis-pedidos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<BaseResponse<IPedido[]>>(url);
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener el historial de pedidos.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener el historial de pedidos.';
      throw new Error(errMsg);
    }
  }

  async getMisCompras(): Promise<IPedido[]> {
    try {
      const response = await apiClient.get<BaseResponse<IPedido[]>>('/api/pedidos/mis-compras');
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener el historial de compras.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener el historial de compras.';
      throw new Error(errMsg);
    }
  }

  async getTodosLosPedidosAdmin(params?: { fechaInicio?: string; fechaFin?: string }): Promise<IPedido[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
      if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

      const url = `/api/pedidos/admin-todos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<BaseResponse<IPedido[]>>(url);
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener los pedidos para el panel admin.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener los pedidos para el panel admin.';
      throw new Error(errMsg);
    }
  }

  async getConductoresDisponibles(): Promise<IConductor[]> {
    try {
      const response = await apiClient.get<BaseResponse<IConductor[]>>('/api/pedidos/conductores-disponibles');
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener los motorizados disponibles.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener los motorizados disponibles.';
      throw new Error(errMsg);
    }
  }

  async getPedidosPendientesRecojo(): Promise<IPedido[]> {
    try {
      const response = await apiClient.get<BaseResponse<IPedido[]>>('/api/pedidos/pendientes-recojo');
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener los pedidos pendientes de recojo.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener los pedidos pendientes de recojo.';
      throw new Error(errMsg);
    }
  }

  async asignarRecojo(params: IAsignarRecojoParams): Promise<boolean> {
    try {
      const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/asignar-recojo', params);
      const body = response.data;
      if (!body.isSuccess) {
        throw new Error(body.message || 'Error al asignar la ruta de recojo al motorizado.');
      }
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al asignar la ruta de recojo al motorizado.';
      throw new Error(errMsg);
    }
  }

  async getMonitoreoRecojosAdmin(params?: { fechaInicio?: string; fechaFin?: string }): Promise<IMonitoreoRecojo[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
      if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

      const url = `/api/pedidos/monitoreo-recojos${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<BaseResponse<IMonitoreoRecojo[]>>(url);
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener el monitoreo de recojos.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener el monitoreo de recojos.';
      throw new Error(errMsg);
    }
  }

  async getMisRecojosMotorizado(): Promise<IMonitoreoRecojo[]> {
    try {
      const response = await apiClient.get<BaseResponse<IMonitoreoRecojo[]>>('/api/pedidos/motorizado/mis-recojos');
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener los recojos del motorizado.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener los recojos del motorizado.';
      throw new Error(errMsg);
    }
  }

  async actualizarEstadoComercioRecojo(params: { idAsignacionRecojo: number; idComercio: number; idEstado: number }): Promise<boolean> {
    try {
      const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/motorizado/actualizar-estado-comercio', params);
      const body = response.data;
      if (!body.isSuccess) {
        throw new Error(body.message || 'Error al actualizar estado del comercio.');
      }
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al actualizar estado del comercio.';
      throw new Error(errMsg);
    }
  }

  async actualizarEstadoAlmacenRecojo(params: { idAsignacionRecojo: number; idEstado: number }): Promise<boolean> {
    try {
      const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/motorizado/actualizar-estado-almacen', params);
      const body = response.data;
      if (!body.isSuccess) {
        throw new Error(body.message || 'Error al actualizar estado del almacén.');
      }
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al actualizar estado del almacén.';
      throw new Error(errMsg);
    }
  }

  async getPedidosPendientesEntregaPorDistrito(): Promise<IMonitoreoRecojo[]> {
    try {
      const response = await apiClient.get<BaseResponse<IMonitoreoRecojo[]>>('/api/pedidos/pendientes-entrega-distritos');
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener los envíos en almacén para entrega.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener los envíos en almacén para entrega.';
      throw new Error(errMsg);
    }
  }

  async asignarEntrega(params: { idConductor: number; pedidoIds: number[] }): Promise<boolean> {
    try {
      const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/asignar-entrega', params);
      const body = response.data;
      if (!body.isSuccess) {
        throw new Error(body.message || 'Error al asignar la entrega al motorizado.');
      }
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al asignar la entrega al motorizado.';
      throw new Error(errMsg);
    }
  }

  async getMisEntregasMotorizado(): Promise<IMonitoreoEntrega[]> {
    try {
      const response = await apiClient.get<BaseResponse<IMonitoreoEntrega[]>>('/api/pedidos/motorizado/mis-entregas');
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener las entregas del motorizado.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener las entregas del motorizado.';
      throw new Error(errMsg);
    }
  }

  async iniciarRutaEntrega(idAsignacionEntrega: number): Promise<boolean> {
    try {
      const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/motorizado/iniciar-ruta-entrega', idAsignacionEntrega);
      const body = response.data;
      if (!body.isSuccess) {
        throw new Error(body.message || 'Error al iniciar la ruta de entrega.');
      }
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al iniciar la ruta de entrega.';
      throw new Error(errMsg);
    }
  }

  async actualizarEstadoEntregaPedido(params: IConfirmarEntregaParams): Promise<boolean> {
    try {
      const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/motorizado/actualizar-estado-entrega', params);
      const body = response.data;
      if (!body.isSuccess) {
        throw new Error(body.message || 'Error al actualizar el estado de entrega del paquete.');
      }
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al actualizar el estado de entrega del paquete.';
      throw new Error(errMsg);
    }
  }

  async getLiquidacionesResumenAdmin(params?: { fechaInicio?: string; fechaFin?: string }): Promise<import('../../domain/models/ILiquidacionResumen').ILiquidacionResumen[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
      if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

      const url = `/api/pedidos/admin/liquidaciones${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<BaseResponse<import('../../domain/models/ILiquidacionResumen').ILiquidacionResumen[]>>(url);
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener resumen de liquidaciones.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener resumen de liquidaciones.';
      throw new Error(errMsg);
    }
  }

  async getLiquidacionDetalleMotorizado(idConductor: number, params?: { fechaInicio?: string; fechaFin?: string }): Promise<import('../../domain/models/ILiquidacionDetalle').ILiquidacionDetalle[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
      if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

      const url = `/api/pedidos/admin/liquidaciones/${idConductor}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await apiClient.get<BaseResponse<import('../../domain/models/ILiquidacionDetalle').ILiquidacionDetalle[]>>(url);
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener detalle de liquidación del motorizado.');
      }
      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener detalle de liquidación del motorizado.';
      throw new Error(errMsg);
    }
  }

  async confirmarRendicionDinero(idConductor: number): Promise<boolean> {
    try {
      const response = await apiClient.post<BaseResponse<boolean>>('/api/pedidos/admin/confirmar-rendicion', idConductor);
      const body = response.data;
      if (!body.isSuccess) {
        throw new Error(body.message || 'Error al confirmar la recepción de dinero.');
      }
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al confirmar la recepción de dinero.';
      throw new Error(errMsg);
    }
  }

  async rastrearPedidoPorCodigo(codigo: string): Promise<import('../../domain/models/IRastreoPedido').IRastreoPedido | null> {
    if (!codigo || !codigo.trim()) return null;
    try {
      const response = await apiClient.get<BaseResponse<import('../../domain/models/IRastreoPedido').IRastreoPedido>>(`/api/pedidos/rastreo/${encodeURIComponent(codigo.trim())}`);
      const body = response.data;
      if (!body.isSuccess || !body.data) {
        return null;
      }
      return body.data;
    } catch (err) {
      return null; // Si no existe el código o hay error 404, retorna null de forma segura para la interfaz de rastreo
    }
  }
}
