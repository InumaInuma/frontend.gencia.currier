import type { IUser } from '../models/IUser';
import type { ICrearCuentaBancariaParams } from '../models/IComercioCuentaBancaria';

export interface IAuthRepository {
  login(correo: string, clave: string): Promise<IUser>;
  logout(): Promise<void>;
  register(
    nombre: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    numeroDocumento: string,
    telefono: string,
    correo: string,
    clave: string
  ): Promise<void>;
  upgradeToComercio(
    ruc: string,
    razonSocial: string,
    nombreComercial: string,
    direccionFiscal: string,
    referenciaRecojo?: string,
    googleMapsUrl?: string,
    telefono?: string,
    cuentasBancarias?: ICrearCuentaBancariaParams[]
  ): Promise<IUser>;
}
