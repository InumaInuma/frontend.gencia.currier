export const EstadoPedidoEnum = {
  Registrado: 1,
  RecojoAsignado: 2,
  EnCaminoAlComercio: 3,
  LlegoAlComercio: 4,
  Recogido: 5,
  EnCaminoAlAlmacen: 6,
  EnAlmacen: 7,
  EntregaAsignada: 8,
  EnRuta: 9,
  A5Minutos: 10,
  Entregado: 11,
  NoEntregado: 12,
  Cancelado: 13,
} as const;

export type EstadoPedidoEnum = (typeof EstadoPedidoEnum)[keyof typeof EstadoPedidoEnum];
