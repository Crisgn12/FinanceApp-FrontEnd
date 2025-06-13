import apiClient from ".."; // Asegúrate que la ruta sea correcta a tu instancia de axios

/**
 * Obtiene la lista de plantillas de reportes disponibles.
 * GET /api/Reportes/plantillas
 * @returns {Promise<Array>} Lista de plantillas disponibles.
 */
export const getPlantillasDisponibles = async () => {
  try {
    const response = await apiClient.get("/Reportes/plantillas");
    return response.data.plantillas; // El backend devuelve un objeto con la propiedad 'Plantillas'
  } catch (error) {
    console.error("Error al obtener plantillas disponibles:", error);
    throw error;
  }
};

/**
 * Genera un reporte personalizado en formato PDF.
 * POST /api/Reportes/personalizado/pdf
 * @param {object} requestData - El DTO PlantillaReporteRequestDTO.
 * @returns {Promise<Blob>} El blob del archivo PDF.
 */
export const generarReportePersonalizadoPdf = async (requestData) => {
  try {
    const response = await apiClient.post(
      "/Reportes/personalizado/pdf",
      requestData,
      {
        responseType: "blob", // Importante para recibir el archivo binario
        headers: {
          Accept: "application/pdf",
        },
      }
    );
    return response; // Devolvemos la respuesta completa para acceder a los headers (nombre del archivo)
  } catch (error) {
    console.error("Error al generar reporte personalizado PDF:", error);
    throw error;
  }
};

/**
 * Obtiene los datos para la vista previa de un reporte personalizado.
 * POST /api/Reportes/personalizado/vista-previa
 * @param {object} requestData - El DTO PlantillaReporteRequestDTO.
 * @returns {Promise<object>} Los datos de la vista previa del reporte.
 */
export const getVistaPreviaReportePersonalizado = async (requestData) => {
  try {
    const response = await apiClient.post(
      "/Reportes/personalizado/vista-previa",
      requestData
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener vista previa del reporte:", error);
    throw error;
  }
};

/**
 * Obtiene un resumen rápido de datos financieros.
 * GET /api/Reportes/resumen?fechaInicio={}&fechaFin={}
 * @param {string} fechaInicio - Fecha de inicio en formato ISO (YYYY-MM-DD).
 * @param {string} fechaFin - Fecha de fin en formato ISO (YYYY-MM-DD).
 * @returns {Promise<object>} Los datos del resumen rápido.
 */
export const getQuickSummary = async (fechaInicio, fechaFin) => {
  try {
    const response = await apiClient.get("/Reportes/resumen", {
      params: {
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener resumen rápido:", error);
    throw error;
  }
};

/**
 * Obtiene estadísticas de gastos por categoría.
 * GET /api/Reportes/estadisticas-categorias?fechaInicio={}&fechaFin={}
 * @param {string} fechaInicio - Fecha de inicio en formato ISO (YYYY-MM-DD).
 * @param {string} fechaFin - Fecha de fin en formato ISO (YYYY-MM-DD).
 * @returns {Promise<object>} Las estadísticas por categoría.
 */
export const getEstadisticasCategorias = async (fechaInicio, fechaFin) => {
  try {
    const response = await apiClient.get("/Reportes/estadisticas-categorias", {
      params: {
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener estadísticas por categorías:", error);
    throw error;
  }
};
