import type { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import type { IUser } from '../../domain/models/IUser';
import { apiClient } from '../api/apiClient';

interface BaseResponse<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
}

interface LoginResponseDto {
  token: string;
  correo: string;
  nombreCompleto: string;
  nombreComercial?: string;
  ruc?: string;
  rolNombre: string;
  idPersona: number;
  idTenant?: number | null;
}

export class AuthRepository implements IAuthRepository {
  async login(correo: string, clave: string): Promise<IUser> {
    const response = await apiClient.post<BaseResponse<LoginResponseDto>>('/api/auth/login', {
      correo,
      clave,
    });

    const body = response.data;

    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error en el inicio de sesión.');
    }

    return {
      correo: body.data.correo,
      nombreCompleto: body.data.nombreCompleto,
      nombreComercial: body.data.nombreComercial,
      ruc: body.data.ruc,
      rolNombre: body.data.rolNombre,
      idPersona: body.data.idPersona,
      idTenant: body.data.idTenant,
      token: body.data.token,
    };
  }

  async logout(): Promise<void> {
    const response = await apiClient.post<BaseResponse<string>>('/api/auth/logout');
    const body = response.data;

    if (!body.isSuccess) {
      throw new Error(body.message || 'Error al cerrar sesión.');
    }
  }

  async register(
    nombre: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    numeroDocumento: string,
    telefono: string,
    correo: string,
    clave: string
  ): Promise<void> {
    const response = await apiClient.post<BaseResponse<string>>('/api/auth/register', {
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      numeroDocumento,
      telefono,
      correo,
      clave,
    });

    const body = response.data;

    if (!body.isSuccess) {
      throw new Error(body.message || 'Error en el registro de la cuenta.');
    }
  }

  async upgradeToComercio(
    ruc: string,
    razonSocial: string,
    nombreComercial: string,
    direccionFiscal: string,
    referenciaRecojo?: string,
    googleMapsUrl?: string,
    telefono?: string
  ): Promise<IUser> {
    const response = await apiClient.post<BaseResponse<LoginResponseDto>>('/api/auth/upgrade-to-comercio', {
      ruc,
      razonSocial,
      nombreComercial,
      direccionFiscal,
      referenciaRecojo,
      googleMapsUrl,
      telefono,
    });

    const body = response.data;

    if (!body.isSuccess || !body.data) {
      throw new Error(body.message || 'Error al ascender la cuenta a Comercio.');
    }

    return {
      correo: body.data.correo,
      nombreCompleto: body.data.nombreCompleto,
      nombreComercial: body.data.nombreComercial,
      ruc: body.data.ruc,
      rolNombre: body.data.rolNombre,
      idPersona: body.data.idPersona,
      idTenant: body.data.idTenant,
      token: body.data.token,
    };
  }
}
