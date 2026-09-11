import { apiClient } from '../api/apiClient';

export interface IColaborador {
  idUsuario: number;
  tenantId?: number;
  idRol: number;
  rolNombre: string;
  idPersona: number;
  personaNombre: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  tipoDocumentoNombre?: string;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  esActivo: boolean;
  debeCambiarClave: boolean;
  ultimoAcceso?: string;
  idConductor?: number;
  placaVehiculo?: string;
  tipoVehiculo?: string;
  licenciaConducir?: string;
  estadoConductorNombre?: string;
}

export interface IRegistrarColaboradorParams {
  idRol: number; // 1 = Admin, 3 = Motorizado
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  idTiposDocumento?: number;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  placaVehiculo?: string;
  tipoVehiculo?: string;
  licenciaConducir?: string;
}

interface BaseResponse<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
}

export class ColaboradoresRepository {
  async listar(): Promise<IColaborador[]> {
    try {
      const response = await apiClient.get<BaseResponse<IColaborador[]>>('/api/colaboradores');
      const body = response.data;

      if (!body.isSuccess || !body.data) {
        throw new Error(body.message || 'Error al obtener la lista de colaboradores.');
      }

      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al consultar colaboradores.';
      throw new Error(errMsg);
    }
  }

  async registrar(params: IRegistrarColaboradorParams): Promise<number> {
    try {
      const response = await apiClient.post<BaseResponse<number>>('/api/colaboradores', params);
      const body = response.data;

      if (!body.isSuccess || body.data === undefined) {
        throw new Error(body.message || 'Error al registrar el colaborador.');
      }

      return body.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al registrar el colaborador.';
      throw new Error(errMsg);
    }
  }
}

export const colaboradoresRepository = new ColaboradoresRepository();
