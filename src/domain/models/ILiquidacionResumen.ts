export interface ILiquidacionResumen {
  idConductor: number;
  nombreConductor: string;
  telefonoConductor?: string;
  placaVehiculo: string;
  tipoVehiculo: string;
  totalPedidosAsignados: number;
  totalPedidosEntregados: number;
  totalPedidosNoEntregados: number;
  montoEfectivoPendiente: number;
  montoEfectivoRendido: number;
  montoYapeDigital: number;
  montoTransferencia: number;
  montoTotalCobrado: number;
  estadoLiquidacion: string;
}
