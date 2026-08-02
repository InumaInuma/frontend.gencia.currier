export interface IUser {
  correo: string;
  nombreCompleto: string;
  nombreComercial?: string;
  ruc?: string;
  rolNombre: string;
  idPersona: number;
  idTenant?: number | null;
  token: string;
}
