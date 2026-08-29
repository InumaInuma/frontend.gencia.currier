import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PedidosRepository } from '../../infrastructure/repositories/PedidosRepository';
import type { IRegisterPedidoParams } from '../../domain/models/IPedido';
import type { IAsignarRecojoParams } from '../../domain/models/IConductor';
import type { IConfirmarEntregaParams } from '../../domain/repositories/IPedidosRepository';

const pedidosRepository = new PedidosRepository();

export const useMisPedidos = (params?: { fechaInicio?: string; fechaFin?: string; pageNumber?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ['mis-pedidos', params?.fechaInicio, params?.fechaFin, params?.pageNumber, params?.pageSize],
    queryFn: () => pedidosRepository.getMisPedidos(params),
    refetchOnWindowFocus: false,
  });
};

export const useMisCompras = () => {
  return useQuery({
    queryKey: ['mis-compras'],
    queryFn: () => pedidosRepository.getMisCompras(),
    refetchOnWindowFocus: false,
  });
};

export const useAdminPedidos = (params?: { fechaInicio?: string; fechaFin?: string }) => {
  return useQuery({
    queryKey: ['admin-pedidos-todos', params?.fechaInicio, params?.fechaFin],
    queryFn: () => pedidosRepository.getTodosLosPedidosAdmin(params),
    refetchOnWindowFocus: false,
  });
};

export const useConductoresDisponibles = () => {
  return useQuery({
    queryKey: ['conductores-disponibles'],
    queryFn: () => pedidosRepository.getConductoresDisponibles(),
    refetchOnWindowFocus: false,
  });
};

export const usePedidosPendientesRecojo = (params?: { fechaInicio?: string; fechaFin?: string }) => {
  return useQuery({
    queryKey: ['pedidos-pendientes-recojo', params?.fechaInicio, params?.fechaFin],
    queryFn: () => pedidosRepository.getPedidosPendientesRecojo(params),
    refetchOnWindowFocus: false,
  });
};

export const useMonitoreoRecojosAdmin = (params?: { fechaInicio?: string; fechaFin?: string }) => {
  return useQuery({
    queryKey: ['monitoreo-recojos-admin', params?.fechaInicio, params?.fechaFin],
    queryFn: () => pedidosRepository.getMonitoreoRecojosAdmin(params),
    refetchOnWindowFocus: false,
  });
};

export const useMisRecojosMotorizado = () => {
  return useQuery({
    queryKey: ['mis-recojos-motorizado'],
    queryFn: () => pedidosRepository.getMisRecojosMotorizado(),
    refetchOnWindowFocus: false,
  });
};

export const usePedidosPendientesEntregaPorDistrito = (params?: { fechaInicio?: string; fechaFin?: string }) => {
  return useQuery({
    queryKey: ['pedidos-pendientes-entrega-distritos', params?.fechaInicio, params?.fechaFin],
    queryFn: () => pedidosRepository.getPedidosPendientesEntregaPorDistrito(params),
    refetchOnWindowFocus: false,
  });
};

export const useMisEntregasMotorizado = () => {
  return useQuery({
    queryKey: ['mis-entregas-motorizado'],
    queryFn: () => pedidosRepository.getMisEntregasMotorizado(),
    refetchOnWindowFocus: false,
  });
};

export const useActualizarEstadoComercioRecojo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { idAsignacionRecojo: number; idComercio: number; idEstado: number }) =>
      pedidosRepository.actualizarEstadoComercioRecojo(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-recojos-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['monitoreo-recojos-admin'] });
    },
  });
};

export const useActualizarEstadoAlmacenRecojo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { idAsignacionRecojo: number; idEstado: number }) =>
      pedidosRepository.actualizarEstadoAlmacenRecojo(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-recojos-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['monitoreo-recojos-admin'] });
    },
  });
};

export const useIniciarRutaEntrega = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (idAsignacionEntrega: number) => pedidosRepository.iniciarRutaEntrega(idAsignacionEntrega),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-entregas-motorizado'] });
    },
  });
};

export const useActualizarEstadoEntregaPedido = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: IConfirmarEntregaParams) => pedidosRepository.actualizarEstadoEntregaPedido(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-entregas-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos-todos'] });
      queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
    },
  });
};

export const useAsignarRecojo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IAsignarRecojoParams) => pedidosRepository.asignarRecojo(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos-todos'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos-pendientes-recojo'] });
      queryClient.invalidateQueries({ queryKey: ['monitoreo-recojos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['mis-recojos-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
    },
  });
};

export const useAsignarEntrega = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { idConductor: number; pedidoIds: number[] }) => pedidosRepository.asignarEntrega(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-pendientes-entrega-distritos'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos-todos'] });
      queryClient.invalidateQueries({ queryKey: ['monitoreo-recojos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['mis-entregas-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
    },
  });
};

export const useRegistrarPedido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: IRegisterPedidoParams) => pedidosRepository.registrarPedido(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-pedidos'] });
      queryClient.invalidateQueries({ queryKey: ['mis-compras'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos-todos'] });
      queryClient.invalidateQueries({ queryKey: ['pedidos-pendientes-recojo'] });
      queryClient.invalidateQueries({ queryKey: ['monitoreo-recojos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['mis-recojos-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['mis-entregas-motorizado'] });
    },
  });
};

export const useLiquidacionesResumenAdmin = (params?: { fechaInicio?: string; fechaFin?: string }) => {
  return useQuery({
    queryKey: ['liquidaciones-resumen-admin', params?.fechaInicio, params?.fechaFin],
    queryFn: () => pedidosRepository.getLiquidacionesResumenAdmin(params),
    refetchOnWindowFocus: false,
  });
};

export const useLiquidacionDetalleMotorizado = (idConductor: number | null, params?: { fechaInicio?: string; fechaFin?: string }) => {
  return useQuery({
    queryKey: ['liquidacion-detalle-motorizado', idConductor, params?.fechaInicio, params?.fechaFin],
    queryFn: () => (idConductor ? pedidosRepository.getLiquidacionDetalleMotorizado(idConductor, params) : Promise.resolve([])),
    enabled: !!idConductor,
    refetchOnWindowFocus: false,
  });
};

export const useConfirmarRendicionDinero = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idConductor: number) => pedidosRepository.confirmarRendicionDinero(idConductor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liquidaciones-resumen-admin'] });
      queryClient.invalidateQueries({ queryKey: ['liquidacion-detalle-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos-todos'] });
    },
  });
};

export const useRastrearPedidoPorCodigo = (codigo: string) => {
  return useQuery({
    queryKey: ['rastreo-pedido', codigo],
    queryFn: () => (codigo.trim() ? pedidosRepository.rastrearPedidoPorCodigo(codigo) : Promise.resolve(null)),
    enabled: !!codigo && codigo.trim().length >= 3,
    refetchOnWindowFocus: true,
  });
};

export const useCancelarRecojoPedidoIndividual = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { idPedido: number; motivo: string; observaciones?: string }) =>
      pedidosRepository.cancelarRecojoPedidoIndividual(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-recojos-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['monitoreo-recojos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos-todos'] });
    },
  });
};

export const useEditarPedidoAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      idPedido: number;
      nombreDestinatario: string;
      telefonoDestinatario: string;
      direccionDestinatario: string;
      referenciaDestinatario?: string;
      observaciones?: string;
      montoCobrar: number;
      tarifaEnvio: number;
      destinatarioPagaEnvio: boolean;
      idEstadosPedido?: number;
    }) => pedidosRepository.editarPedidoAdmin(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mis-recojos-motorizado'] });
      queryClient.invalidateQueries({ queryKey: ['monitoreo-recojos-admin'] });
      queryClient.invalidateQueries({ queryKey: ['admin-pedidos-todos'] });
    },
  });
};
