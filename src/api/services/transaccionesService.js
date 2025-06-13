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

export const ObtenerGastosUltimos6Dias = async () => {
    try {
        const response = await apiClient.get('/Transaccion/GastosUltimos6Dias');
        return response.data;
    } catch (error) {
        console.error('Error al obtener gastos de los últimos 6 días:', error);
        throw error;
    }
}

export const ObtenerGastosPorCategoria = async () => {
    try {
        const response = await apiClient.get('/Transaccion/GastosPorCategoria');
        return response.data;
    } catch (error) {
        console.error('Error al obtener gastos por categoría:', error);
        throw error;
    }
}

export const TotalGastosxMes = async () => {
    try {
        const response = await apiClient.get('/Transaccion/TotalGastosxMes');
        return response.data;
    }
    catch (error) {
        console.error('Error al obtener total de gastos por mes:', error);
        throw error;
    }
}

export const TotalIngresosxMes = async () => {
    try {
        const response = await apiClient.get('/Transaccion/TotalIngresosxMes');
        return response.data;
    }
    catch (error) {
        console.error('Error al obtener total de ingresos por mes:', error);
        throw error;
    }
}

export const BalanceMesActual = async () => {
    try {
        const response = await apiClient.get('/Transaccion/BalanceMesActual');
        return response.data;
    } catch (error) {
        console.error('Error al obtener balance del mes actual:', error);
        throw error;
    }
}