import { useState, useCallback } from 'react';
import {
  ObtenerCategoriasPorUsuario,
  CrearCategoria,
  ActualizarCategoria,
  EliminarCategoria,
} from '../api/services/categoriasService';

export const useCategorias = (usuarioID) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener categorías por usuario
  const fetchCategoriasPorUsuario = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ObtenerCategoriasPorUsuario(usuarioID);
      setCategorias(data);
      return data;
    } catch (err) {
      setError(err.message || 'Error al obtener categorías');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [usuarioID]);

  // Crear una categoría
  const crearCategoria = useCallback(async (categoria) => {
    setLoading(true);
    setError(null);
    try {
      const success = await CrearCategoria(categoria);
      if (success) {
        await fetchCategoriasPorUsuario(); // Refrescar la lista
      }
      return success;
    } catch (err) {
      setError(err.message || 'Error al crear categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategoriasPorUsuario]);

  // Actualizar una categoría
  const actualizarCategoria = useCallback(async (categoria) => {
    setLoading(true);
    setError(null);
    try {
      const success = await ActualizarCategoria(categoria);
      if (success) {
        await fetchCategoriasPorUsuario(); // Refrescar la lista
      }
      return success;
    } catch (err) {
      setError(err.message || 'Error al actualizar categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategoriasPorUsuario]);

  // Eliminar una categoría
  const eliminarCategoria = useCallback(async ({ categoriaID, usuarioID }) => {
    setLoading(true);
    setError(null);
    try {
      const success = await EliminarCategoria({ categoriaID, usuarioID });
      if (success) {
        await fetchCategoriasPorUsuario(); // Refrescar la lista
      }
      return success;
    } catch (err) {
      setError(err.message || 'Error al eliminar categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategoriasPorUsuario]);

  return {
    categorias,
    loading,
    error,
    fetchCategoriasPorUsuario,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria,
  };
};