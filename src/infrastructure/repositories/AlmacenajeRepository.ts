import { apiClient } from '../api/apiClient';
import type {
  ISuscripcionComercio,
  IEstadoSuscripcionComercio,
  IProductoAlmacen,
  IGuardarSuscripcionParams,
  IRegistrarProductoParams,
  IIngresarStockParams,
  IMovimientoInventario
} from '../../domain/models/IAlmacenaje';

interface BaseResponse<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
}

export class AlmacenajeRepository {
  async getSuscripciones(): Promise<ISuscripcionComercio[]> {
    try {
      const response = await apiClient.get<BaseResponse<ISuscripcionComercio[]>>('/api/almacenaje/suscripciones');
      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener las suscripciones.');
      }
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener las suscripciones.');
    }
  }

  async getMiSuscripcion(): Promise<IEstadoSuscripcionComercio> {
    try {
      const response = await apiClient.get<BaseResponse<IEstadoSuscripcionComercio>>('/api/almacenaje/mi-suscripcion');
      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Error al obtener su estado de suscripción.');
      }
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener su estado de suscripción.');
    }
  }

  async guardarSuscripcion(params: IGuardarSuscripcionParams): Promise<any> {
    try {
      const response = await apiClient.post<BaseResponse<any>>('/api/almacenaje/suscripciones', params);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Error al guardar la suscripción.');
      }
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al guardar la suscripción.');
    }
  }

  async getProductos(idComercio?: number): Promise<IProductoAlmacen[]> {
    try {
      const url = idComercio ? `/api/almacenaje/productos?idComercio=${idComercio}` : '/api/almacenaje/productos';
      const response = await apiClient.get<BaseResponse<IProductoAlmacen[]>>(url);
      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Error al listar los productos.');
      }
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al listar los productos.');
    }
  }

  async registrarProducto(params: IRegistrarProductoParams): Promise<any> {
    try {
      const response = await apiClient.post<BaseResponse<any>>('/api/almacenaje/productos', params);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Error al registrar el producto.');
      }
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al registrar el producto.');
    }
  }

  async ingresarStock(params: IIngresarStockParams): Promise<any> {
    try {
      const response = await apiClient.post<BaseResponse<any>>('/api/almacenaje/ingresar-stock', params);
      if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Error al ingresar stock.');
      }
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al ingresar stock.');
    }
  }

  async getKardex(params?: { idComercio?: number; idProducto?: number; fechaInicio?: string; fechaFin?: string }): Promise<IMovimientoInventario[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.idComercio) queryParams.append('idComercio', params.idComercio.toString());
      if (params?.idProducto) queryParams.append('idProducto', params.idProducto.toString());
      if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
      if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);

      const qs = queryParams.toString();
      const url = qs ? `/api/almacenaje/kardex?${qs}` : '/api/almacenaje/kardex';

      const response = await apiClient.get<BaseResponse<IMovimientoInventario[]>>(url);
      if (!response.data.isSuccess || !response.data.data) {
        throw new Error(response.data.message || 'Error al consultar el Kardex.');
      }
      return response.data.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al consultar el Kardex.');
    }
  }
}

export const almacenajeRepository = new AlmacenajeRepository();
