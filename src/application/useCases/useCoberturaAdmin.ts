import { useState, useCallback } from 'react';
import { apiClient } from '../../infrastructure/api/apiClient';
import type { ApiResponse as BaseResponse } from '../../infrastructure/api/apiClient';

// DTOs para match con Backend
export interface DistritoTarifaDto {
  id: number;
  nombre: string;
  zonaNombre: string;
  latitud: number;
  longitud: number;
  tarifaDespacho: number;
  coberturaActiva: boolean;
}

export interface PoligonoVerticeDto {
  orden: number;
  latitud: number;
  longitud: number;
}

export interface ZonaRestringidaDto {
  id: number;
  nombre: string;
  descripcion?: string;
  vertices: PoligonoVerticeDto[];
}

export const useCoberturaAdmin = () => {
  const [loading, setLoading] = useState(false);

  // 1. Obtener Distritos y Tarifas
  const getDistritosTarifas = useCallback(async (): Promise<DistritoTarifaDto[]> => {
    try {
      setLoading(true);
      const response = await apiClient.get<BaseResponse<DistritoTarifaDto[]>>('/api/cobertura/tarifas');
      return response.data?.data || [];
    } catch (err: any) {
      console.error('Error getDistritosTarifas:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener tarifas');
    } finally {
      setLoading(false);
    }
  }, []);

  // 2a. Insertar Distrito Completo
  const insertarDistritoTarifa = useCallback(async (distrito: DistritoTarifaDto): Promise<number> => {
    try {
      const response = await apiClient.post<BaseResponse<number>>('/api/cobertura/distritos', distrito);
      return response.data?.data || 0;
    } catch (err: any) {
      console.error('Error insertarDistritoTarifa:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al insertar distrito');
    }
  }, []);

  // 2b. Actualizar Distrito Completo
  const actualizarDistritoTarifa = useCallback(async (distrito: DistritoTarifaDto): Promise<boolean> => {
    try {
      const response = await apiClient.put<BaseResponse<boolean>>(`/api/cobertura/distritos/${distrito.id}`, distrito);
      return response.data?.data || false;
    } catch (err: any) {
      console.error('Error actualizarDistritoTarifa:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al actualizar distrito');
    }
  }, []);

  // 2c. Eliminar Distrito
  const eliminarDistritoTarifa = useCallback(async (idDistrito: number): Promise<boolean> => {
    try {
      const response = await apiClient.delete<BaseResponse<boolean>>(`/api/cobertura/distritos/${idDistrito}`);
      return response.data?.data || false;
    } catch (err: any) {
      console.error('Error eliminarDistritoTarifa:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al eliminar distrito');
    }
  }, []);

  // 3. Obtener Polígono Verde
  const getPoligonoVerde = useCallback(async (): Promise<PoligonoVerticeDto[]> => {
    try {
      const response = await apiClient.get<BaseResponse<PoligonoVerticeDto[]>>('/api/cobertura/poligono-verde');
      return response.data?.data || [];
    } catch (err: any) {
      console.error('Error getPoligonoVerde:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener polígono verde');
    }
  }, []);

  // 4. Guardar Polígono Verde
  const savePoligonoVerde = useCallback(async (vertices: PoligonoVerticeDto[]): Promise<boolean> => {
    try {
      const response = await apiClient.post<BaseResponse<boolean>>('/api/cobertura/poligono-verde', vertices);
      return response.data?.data || false;
    } catch (err: any) {
      console.error('Error savePoligonoVerde:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al guardar polígono verde');
    }
  }, []);

  // 5. Obtener Zonas Restringidas
  const getZonasRestringidas = useCallback(async (): Promise<ZonaRestringidaDto[]> => {
    try {
      const response = await apiClient.get<BaseResponse<ZonaRestringidaDto[]>>('/api/cobertura/zonas-restringidas');
      return response.data?.data || [];
    } catch (err: any) {
      console.error('Error getZonasRestringidas:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener zonas restringidas');
    }
  }, []);

  // 6. Guardar Zona Restringida
  const saveZonaRestringida = useCallback(async (zona: ZonaRestringidaDto): Promise<number> => {
    try {
      const response = await apiClient.post<BaseResponse<number>>('/api/cobertura/zonas-restringidas', zona);
      return response.data?.data || 0;
    } catch (err: any) {
      console.error('Error saveZonaRestringida:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al guardar zona restringida');
    }
  }, []);

  // 7. Eliminar Zona Restringida
  const deleteZonaRestringida = useCallback(async (idZona: number): Promise<boolean> => {
    try {
      const response = await apiClient.delete<BaseResponse<boolean>>(`/api/cobertura/zonas-restringidas/${idZona}`);
      return response.data?.data || false;
    } catch (err: any) {
      console.error('Error deleteZonaRestringida:', err);
      throw new Error(err.response?.data?.message || err.message || 'Error al eliminar zona restringida');
    }
  }, []);

  return {
    loading,
    getDistritosTarifas,
    insertarDistritoTarifa,
    actualizarDistritoTarifa,
    eliminarDistritoTarifa,
    getPoligonoVerde,
    savePoligonoVerde,
    getZonasRestringidas,
    saveZonaRestringida,
    deleteZonaRestringida
  };
};
