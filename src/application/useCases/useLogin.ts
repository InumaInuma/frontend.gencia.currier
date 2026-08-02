import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

export const useLogin = () => {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async ({ correo, clave }: { correo: string; clave: string }) => {
      return await login(correo, clave);
    },
  });
};
