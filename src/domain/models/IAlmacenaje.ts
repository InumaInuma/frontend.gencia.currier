export interface ISuscripcionComercio {
  idComercio: number;
  razonSocial: string;
  nombreComercial: string;
  ruc: string;
  telefono?: string;
  correoContacto: string;
  contactoNombre: string;
  idSuscripcion: number;
  tieneServicioAlmacenaje: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  costoMensual: number;
  suscripcionActiva: boolean;
  totalProductos: number;
  totalStockDisponible: number;
  totalStockDespachado: number;
}

export interface IEstadoSuscripcionComercio {
  idComercio: number;
  nombreComercial: string;
  idSuscripcion: number;
  tieneServicioAlmacenaje: boolean;
  fechaInicio?: string;
  fechaFin?: string;
  costoMensual: number;
  esActivo: boolean;
  totalProductos: number;
  totalStockDisponible: number;
  totalStockDespachado: number;
}

export interface IProductoAlmacen {
  id: number;
  tenantId: number;
  idComercio: number;
  comercioNombre: string;
  codigoSKU: string;
  nombreProducto: string;
  descripcion?: string;
  stockInicial: number;
  stockDisponible: number;
  stockDespachado: number;
  stockMinimoAlerta: number;
  precioReferencial: number;
  esAlertaStock: boolean;
  fechaModificacion: string;
}

export interface IGuardarSuscripcionParams {
  idComercio: number;
  tieneServicioAlmacenaje: boolean;
  fechaInicio: string;
  fechaFin: string;
  costoMensual: number;
}

export interface IRegistrarProductoParams {
  id?: number;
  idComercio: number;
  codigoSKU: string;
  nombreProducto: string;
  descripcion?: string;
  stockInicial?: number;
  stockMinimoAlerta?: number;
  precioReferencial?: number;
}

export interface IIngresarStockParams {
  idProducto: number;
  cantidad: number;
  observaciones?: string;
}

export interface IMovimientoInventario {
  id: number;
  tenantId: number;
  idProducto: number;
  nombreProducto: string;
  codigoSKU: string;
  idComercio: number;
  comercioNombre: string;
  idPedido?: number;
  pedidoCodigoSeguimiento?: string;
  pedidoTarifaEnvio?: number;
  tipoMovimiento: string;
  fechaMovimiento: string;
  cantidad: number;
  stockPrevio: number;
  stockPosterior: number;
  observaciones?: string;
  usuarioModificacion: string;
}
