import { useState, useCallback } from 'react';
import {
  ObtenerTransaccionesPorUsuario,
  ObtenerDetalleTransaccion,
  IngresarTransaccion,
  ActualizarTransaccion,
  EliminarTransaccion,
  ObtenerGastosUltimos6Dias,
  ObtenerGastosPorCategoria
} from '../api/services/transaccionesService';

export const useTransacciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gastosUltimos6Dias, setGastosUltimos6Dias] = useState([]);
  const [gastosPorCategoria, setGastosPorCategoria] = useState([]);

  // Obtener transacciones por usuario
  const fetchTransaccionesPorUsuario = useCallback(async (filtros = {}) => {
    setLoading(true);
    setError(null);
    try {
      const req = { 
        fechaInicio: filtros.fechaInicio || null,
        fechaFin: filtros.fechaFin || null,
        nombreCategoria: filtros.nombreCategoria || null,
      };
      const data = await ObtenerTransaccionesPorUsuario(req);
      setTransacciones(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al obtener transacciones');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener detalles de una transacción
  const fetchDetalleTransaccion = useCallback(async (transaccionId) => {
    setLoading(true);
    setError(null);
    try {
      const req = { transaccionId };
      const data = await ObtenerDetalleTransaccion(req);
      return data;
    } catch (err) {
      setError(err.message || 'Error al obtener detalle de transacción');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Ingresar una transacción
  const ingresarTransaccion = useCallback(async (transaccion) => {
    setLoading(true);
    setError(null);
    try {
      const req = {
        categoriaId: transaccion.categoriaId,
        titulo: transaccion.titulo,
        descripcion: transaccion.descripcion,
        monto: transaccion.monto,
        fecha: transaccion.fecha,
        tipo: transaccion.tipo,
      };
      const success = await IngresarTransaccion(req);
      if (success) {
        await fetchTransaccionesPorUsuario(); // Refrescar la lista
      }
      return success;
    } catch (err) {
      setError(err.message || 'Error al ingresar transacción');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTransaccionesPorUsuario]);

  // Actualizar una transacción
  const actualizarTransaccion = useCallback(async (transaccion) => {
    setLoading(true);
    setError(null);
    try {
      const req = {
        transaccionId: transaccion.transaccionId,
        categoriaId: transaccion.categoriaId,
        titulo: transaccion.titulo,
        descripcion: transaccion.descripcion,
        monto: transaccion.monto,
        fecha: transaccion.fecha,
        tipo: transaccion.tipo,
      };
      const success = await ActualizarTransaccion(req);
      if (success) {
        await fetchTransaccionesPorUsuario(); // Refrescar la lista
      }
      return success;
    } catch (err) {
      setError(err.message || 'Error al actualizar transacción');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTransaccionesPorUsuario]);

  // Eliminar una transacción
  const eliminarTransaccion = useCallback(async ({ transaccionId }) => {
    setLoading(true);
    setError(null);
    try {
      const req = { transaccionID: transaccionId };
      const success = await EliminarTransaccion(req);
      if (success) {
        await fetchTransaccionesPorUsuario(); // Refrescar la lista
      }
      return success;
    } catch (err) {
      setError(err.message || 'Error al eliminar transacción');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTransaccionesPorUsuario]);

  // Obtener gastos de los últimos 6 días
  const fetchGastosUltimos6Dias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ObtenerGastosUltimos6Dias();
      setGastosUltimos6Dias(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al obtener gastos de los últimos 6 días');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener gastos por categoría
  const fetchGastosPorCategoria = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ObtenerGastosPorCategoria();
      setGastosPorCategoria(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al obtener gastos por categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transacciones,
    loading,
    error,
    gastosUltimos6Dias,
    gastosPorCategoria,
    fetchGastosPorCategoria,
    fetchTransaccionesPorUsuario,
    fetchDetalleTransaccion,
    ingresarTransaccion,
    actualizarTransaccion,
    eliminarTransaccion,
    fetchGastosUltimos6Dias
  };
};