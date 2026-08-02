export interface IPedido {
  id: number;
  idComercio?: number;
  nombreComercial?: string;
  razonSocial?: string;
  ruc?: string;
  direccionRecojo?: string;
  referenciaRecojo?: string;
  telefonoComercio?: string;
  googleMapsUrlComercio?: string;
  codigoSeguimiento: string;
  nombreRemitente?: string;
  nombreDestinatario: string;
  telefonoDestinatario: string;
  direccionDestinatario: string;
  distritoNombre: string;
  referenciaDestinatario?: string;
  observaciones?: string;
  googleMapsUrl?: string;
  montoCobrar: number;
  estadoNombre: string;
  fechaRegistro: string;
}

export interface IRegisterPedidoParams {
  nombreRemitente?: string;
  nombreDestinatario: string;
  telefonoDestinatario: string;
  direccionDestinatario: string;
  idDistritoDestinatario: number;
  referenciaDestinatario?: string;
  observaciones?: string;
  googleMapsUrl?: string;
  montoCobrar: number;
}

export interface IPedidoResultado {
  id: number;
  codigoSeguimiento: string;
  fechaRegistro: string;
}
