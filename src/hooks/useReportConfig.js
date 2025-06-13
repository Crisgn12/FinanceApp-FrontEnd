import { useState, useCallback } from "react";

/**
 * @typedef {object} ConfiguracionSecciones
 * @property {boolean} incluirResumenFinanciero
 * @property {boolean} incluirGastosPorCategoria
 * @property {boolean} incluirAbonosAMetas
 * @property {boolean} incluirTransaccionesDetalladas
 * @property {boolean} incluirIngresos
 * @property {boolean} incluirGraficos
 */

/**
 * @typedef {object} ConfiguracionDetalle
 * @property {string} nivelDetalle
 * @property {number} maximoTransacciones
 * @property {boolean} mostrarDescripciones
 * @property {boolean} mostrarPorcentajes
 * @property {string} ordenTransacciones
 */

/**
 * @typedef {object} ConfiguracionFiltros
 * @property {string[]} categoriasIncluidas
 * @property {string[]} categoriasExcluidas
 * @property {number | undefined} montoMinimo
 * @property {number | undefined} montoMaximo
 * @property {string[]} tiposTransaccion
 */

/**
 * @typedef {object} ReportConfigState
 * @property {string} fechaInicio
 * @property {string} fechaFin
 * @property {string} tipoPlantilla
 * @property {string} tituloReporte
 * @property {ConfiguracionSecciones} secciones
 * @property {ConfiguracionDetalle} detalle
 * @property {ConfiguracionFiltros} filtros
 */

/**
 * Hook personalizado para manejar la configuración de los reportes.
 * @returns {{config: ReportConfigState, updateConfig: function, updateSecciones: function, updateDetalle: function, updateFiltros: function}}
 */
export const useReportConfig = () => {
  /** @type {ReportConfigState} */
  const [config, setConfig] = useState(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return {
      fechaInicio: startOfMonth.toISOString(),
      fechaFin: endOfMonth.toISOString(),
      tipoPlantilla: "completo",
      tituloReporte: "Reporte Personalizado",
      secciones: {
        incluirResumenFinanciero: true,
        incluirGastosPorCategoria: true,
        incluirAbonosAMetas: true,
        incluirTransaccionesDetalladas: true,
        incluirIngresos: true,
        incluirGraficos: false,
      },
      detalle: {
        nivelDetalle: "completo",
        maximoTransacciones: 0,
        mostrarDescripciones: true,
        mostrarPorcentajes: true,
        ordenTransacciones: "fecha",
      },
      filtros: {
        categoriasIncluidas: [],
        categoriasExcluidas: [],
        montoMinimo: undefined,
        montoMaximo: undefined,
        tiposTransaccion: [],
      },
    };
  });

  /**
   * Actualiza propiedades generales de la configuración del reporte.
   * @param {object} updates - Objeto con las propiedades a actualizar.
   */
  const updateConfig = useCallback((updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Actualiza las propiedades de la sección 'secciones'.
   * @param {ConfiguracionSecciones} secciones - Objeto con las secciones a actualizar.
   */
  const updateSecciones = useCallback((secciones) => {
    setConfig((prev) => ({
      ...prev,
      secciones: { ...prev.secciones, ...secciones },
    }));
  }, []);

  /**
   * Actualiza las propiedades de la sección 'detalle'.
   * @param {ConfiguracionDetalle} detalle - Objeto con el detalle a actualizar.
   */
  const updateDetalle = useCallback((detalle) => {
    setConfig((prev) => ({
      ...prev,
      detalle: { ...prev.detalle, ...detalle },
    }));
  }, []);

  /**
   * Actualiza las propiedades de la sección 'filtros'.
   * @param {ConfiguracionFiltros} filtros - Objeto con los filtros a actualizar.
   */
  const updateFiltros = useCallback((filtros) => {
    setConfig((prev) => ({
      ...prev,
      filtros: { ...prev.filtros, ...filtros },
    }));
  }, []);

  return {
    config,
    updateConfig,
    updateSecciones,
    updateDetalle,
    updateFiltros,
  };
};
