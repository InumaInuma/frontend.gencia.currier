export interface IConductor {
  idConductor: number;
  nombreCompleto: string;
  telefono?: string;
  placaVehiculo: string;
  tipoVehiculo: string;
  estadoNombre: string;
}

export interface IAsignarRecojoParams {
  idConductor: number;
  idPedidos: number[];
}
