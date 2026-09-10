export interface IComercioCuentaBancaria {
  id?: number;
  tenantId?: number;
  idComercio?: number;
  tipoMetodo: 'YAPE' | 'PLIN' | 'TRANSFERENCIA';
  banco?: string;
  tipoCuenta?: string;
  numeroCuenta: string;
  numeroCci?: string;
  titular: string;
  esPrincipal: boolean;
}

export interface ICrearCuentaBancariaParams {
  tipoMetodo: string;
  banco?: string;
  tipoCuenta?: string;
  numeroCuenta: string;
  numeroCci?: string;
  titular: string;
  esPrincipal: boolean;
}
