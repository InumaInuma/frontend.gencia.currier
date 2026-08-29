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
  montoPagoMotorizado: number;
  montoGananciaAgencia: number;
  saldoNetoRendir: number;
  estadoLiquidacion: string;
}
