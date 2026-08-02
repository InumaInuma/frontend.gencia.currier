export interface IRastreoPedido {
  id: number;
  codigoSeguimiento: string;
  idEstadosPedido: number;
  estadoNombre: string;
  nombreRemitente: string;
  nombreDestinatario: string;
  telefonoDestinatario: string;
  direccionDestinatario: string;
  distritoNombre: string;
  referenciaDestinatario?: string;
  observaciones?: string;
  montoCobrar: number;
  fechaRegistro: string;
  nombreConductor?: string;
  telefonoConductor?: string;
  placaVehiculo?: string;
  tipoVehiculo?: string;
}
