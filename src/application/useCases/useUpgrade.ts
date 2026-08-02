import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

interface UpgradeParams {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccionFiscal: string;
  referenciaRecojo?: string;
  googleMapsUrl?: string;
  telefono?: string;
}

export const useUpgrade = () => {
  const { upgrade } = useAuth();

  return useMutation({
    mutationFn: async (params: UpgradeParams) => {
      return await upgrade(
        params.ruc,
        params.razonSocial,
        params.nombreComercial,
        params.direccionFiscal,
        params.referenciaRecojo,
        params.googleMapsUrl,
        params.telefono
      );
    },
  });
};
