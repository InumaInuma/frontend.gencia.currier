import { useState, useCallback } from 'react';
import { almacenajeRepository } from '../../infrastructure/repositories/AlmacenajeRepository';
import type {
  ISuscripcionComercio,
  IEstadoSuscripcionComercio,
  IProductoAlmacen,
  IGuardarSuscripcionParams,
  IRegistrarProductoParams,
  IIngresarStockParams,
  IMovimientoInventario
} from '../../domain/models/IAlmacenaje';

export const useAlmacenaje = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuscripciones = useCallback(async (): Promise<ISuscripcionComercio[]> => {
    try {
      setLoading(true);
      setError(null);
      return await almacenajeRepository.getSuscripciones();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMiSuscripcion = useCallback(async (): Promise<IEstadoSuscripcionComercio> => {
    try {
      setLoading(true);
      setError(null);
      return await almacenajeRepository.getMiSuscripcion();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const guardarSuscripcion = useCallback(async (params: IGuardarSuscripcionParams): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      return await almacenajeRepository.guardarSuscripcion(params);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductos = useCallback(async (idComercio?: number): Promise<IProductoAlmacen[]> => {
    try {
      setLoading(true);
      setError(null);
      return await almacenajeRepository.getProductos(idComercio);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarProducto = useCallback(async (params: IRegistrarProductoParams): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      return await almacenajeRepository.registrarProducto(params);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const ingresarStock = useCallback(async (params: IIngresarStockParams): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      return await almacenajeRepository.ingresarStock(params);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getKardex = useCallback(async (params?: { idComercio?: number; idProducto?: number; fechaInicio?: string; fechaFin?: string }): Promise<IMovimientoInventario[]> => {
    try {
      setLoading(true);
      setError(null);
      return await almacenajeRepository.getKardex(params);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getSuscripciones,
    getMiSuscripcion,
    guardarSuscripcion,
    getProductos,
    registrarProducto,
    ingresarStock,
    getKardex
  };
};
