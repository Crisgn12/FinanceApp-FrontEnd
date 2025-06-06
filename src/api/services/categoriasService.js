import apiClient from "..";

export const ObtenerCategoriasPorUsuario = async (UsuarioID) => {
    try {
        const response = await apiClient.get(`/Categoria/ObtenerCategoriasPorUsuario/${UsuarioID}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener categorías por usuario:', error);
        throw error;
    }
}

export const CrearCategoria = async (categoria) => {
    try {
        const response = await apiClient.post('/Categoria/CrearCategoria', categoria);
        return response.data;
    } catch (error) {
        console.error('Error al crear categoría:', error);
        throw error;
    }
}

export const ActualizarCategoria = async (categoria) => {
    try {
        const response = await apiClient.put('/Categoria/ActualizarCategoria', categoria);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar categoría:', error);
        throw error;
    }
}

export const EliminarCategoria = async (ReqEliminarCategoria) => {
    try {
        const response = await apiClient.delete('/Categoria/EliminarCategoria', {
            data: ReqEliminarCategoria
        });
        return response.data;
    } catch (error) {
        console.error('Error al eliminar categoría:', error);
        throw error;
    }
};