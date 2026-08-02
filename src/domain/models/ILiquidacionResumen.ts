export interface ILiquidacionResumen {
  idConductor: number;
  nombreConductor: string;
  telefonoConductor?: string;
  placaVehiculo: string;
  tipoVehiculo: string;
  totalPedidosEntregados: number;
  montoEfectivoPendiente: number;
  montoEfectivoRendido: number;
  montoYapeDigital: number;
  montoTotalCobrado: number;
  estadoLiquidacion: string;
}
