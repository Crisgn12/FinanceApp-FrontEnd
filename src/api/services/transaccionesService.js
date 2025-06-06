import apiClient from "..";

export const IngresarTransaccion = async (transaccion) => {
    try {
        const response = await apiClient.post('/Transaccion/IngresarTransaccion', transaccion);
        return response.data;
    } catch (error) {
        console.error('Error al ingresar transacción:', error);
        throw error;
    }
}

export const ObtenerTransaccionesPorUsuario = async (ReqObtenerTransaccionesPorUsuario) => {
    try {
        const response = await apiClient.post('/Transaccion/ObtenerTransaccionesPorUsuario', ReqObtenerTransaccionesPorUsuario);
        return response.data;
    } catch (error) {
        console.error('Error al obtener transacciones por usuario:', error);
        throw error;
    }
}

export const ObtenerDetalleTransaccion = async (ReqObtenerDetalleTransaccion) => {
    try {
        const response = await apiClient.post('/Transaccion/ObtenerDetalleTransaccion', ReqObtenerDetalleTransaccion);
        return response.data;
    } catch (error) {
        console.error('Error al obtener detalle de transacción:', error);
        throw error;
    }
}

export const ActualizarTransaccion = async (ReqActualizarTransaccion) => {
    try {
        const response = await apiClient.put('/Transaccion/ActualizarTransaccion', ReqActualizarTransaccion);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar transacción:', error);
        throw error;
    }
}

export const EliminarTransaccion = async (ReqEliminarTransaccion) => {
    try {
        console.log('Enviando solicitud DELETE con:', ReqEliminarTransaccion); 
        const response = await apiClient.delete('/Transaccion/EliminarTransaccion', {
            data: ReqEliminarTransaccion
        });
        return response.data;
    } catch (error) {
        console.error('Error al eliminar transacción:', error);
        throw error;
    }
}