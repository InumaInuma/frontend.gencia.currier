export interface ILiquidacionDetalle {
  idPedido: number;
  codigoSeguimiento: string;
  idComercio: number;
  nombreComercial: string;
  nombreDestinatario: string;
  telefonoDestinatario: string;
  distritoNombre: string;
  direccionDestinatario: string;
  montoEfectivo: number;
  montoYape: number;
  referenciaYape?: string;
  montoTotalPedido: number;
  esRendido: number;
  fechaRendicion?: string;
}
