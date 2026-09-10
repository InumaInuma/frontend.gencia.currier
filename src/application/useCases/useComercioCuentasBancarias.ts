import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../infrastructure/api/apiClient';
import type { IComercioCuentaBancaria, ICrearCuentaBancariaParams } from '../../domain/models/IComercioCuentaBancaria';

interface BaseResponse<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

export const useComercioCuentasBancarias = (idComercio?: number) => {
  return useQuery({
    queryKey: ['comercioCuentasBancarias', idComercio],
    queryFn: async (): Promise<IComercioCuentaBancaria[]> => {
      const response = await apiClient.get<BaseResponse<IComercioCuentaBancaria[]>>('/api/comercios/cuentas-bancarias', {
        params: { idComercio }
      });
      return response.data.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
};

export const useCuentasBancariasPorPedido = (codigoSeguimiento?: string) => {
  return useQuery({
    queryKey: ['cuentasBancariasPedido', codigoSeguimiento],
    queryFn: async (): Promise<IComercioCuentaBancaria[]> => {
      if (!codigoSeguimiento) return [];
      const response = await apiClient.get<BaseResponse<IComercioCuentaBancaria[]>>(`/api/comercios/cuentas-bancarias/pedido/${encodeURIComponent(codigoSeguimiento)}`);
      return response.data.data || [];
    },
    enabled: Boolean(codigoSeguimiento),
    staleTime: 1000 * 60 * 10,
  });
};

export const useGuardarComercioCuentasBancarias = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cuentas: ICrearCuentaBancariaParams[]) => {
      const response = await apiClient.post<BaseResponse<IComercioCuentaBancaria[]>>('/api/comercios/cuentas-bancarias', cuentas);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comercioCuentasBancarias'] });
    },
  });
};
