export interface ILiquidacionDetalle {
  idPedido: number;
  codigoSeguimiento: string;
  idComercio: number;
  nombreComercial: string;
  nombreDestinatario: string;
  telefonoDestinatario: string;
  distritoNombre: string;
  direccionDestinatario: string;
  idEstadosPedido: number;
  estadoPedido: string;
  montoCobrar: number;
  montoEfectivo: number;
  montoYape: number;
  montoTransferencia: number;
  referenciaYape?: string;
  montoTotalPedido: number;
  esRendido: number;
  fechaRendicion?: string;
}
