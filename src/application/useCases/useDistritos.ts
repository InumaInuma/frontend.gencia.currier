import { useQuery } from '@tanstack/react-query';
import { PedidosRepository } from '../../infrastructure/repositories/PedidosRepository';

const pedidosRepository = new PedidosRepository();

export const useDistritos = () => {
  return useQuery({
    queryKey: ['distritos'],
    queryFn: () => pedidosRepository.getDistritos(),
    staleTime: 1000 * 60 * 60, // 1 hora de caché
  });
};
