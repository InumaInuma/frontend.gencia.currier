import { useMutation } from '@tanstack/react-query';
import { AuthRepository } from '../../infrastructure/repositories/AuthRepository';

const authRepository = new AuthRepository();

interface RegisterParams {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroDocumento: string;
  telefono: string;
  correo: string;
  clave: string;
}

export const useRegister = () => {
  return useMutation({
    mutationFn: async (params: RegisterParams) => {
      await authRepository.register(
        params.nombre,
        params.apellidoPaterno,
        params.apellidoMaterno,
        params.numeroDocumento,
        params.telefono,
        params.correo,
        params.clave
      );
    },
  });
};
