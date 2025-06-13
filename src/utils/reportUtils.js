import React from "react";
import {
  FileText,
  TrendingUp,
  PieChart,
  Target,
  Settings,
  Calendar,
  Download,
  Eye,
  Filter,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  DollarSign,
  CheckCircle,
  X,
} from "lucide-react";

// CONSTANTS (redefinidas aquí para autocontención del archivo de utilidades)
export const TABS = {
  GENERADOR: "generador",
  PLANTILLAS: "plantillas",
  RESUMEN: "resumen",
};

export const PERIODOS = {
  SEMANAL: "semanal",
  MENSUAL: "mensual",
  ANUAL: "anual",
  PERSONALIZADO: "personalizado",
};

export const TIPOS_TRANSACCION = ["Ingreso", "Gasto"];
export const NIVELES_DETALLE = ["resumen", "completo", "detallado"];
export const ORDENAMIENTO_OPCIONES = ["fecha", "monto", "categoria"];

// UTILITY FUNCTIONS
/**
 * Formatea un monto numérico a moneda local (CRC) sin decimales.
 * @param {number} amount - El monto a formatear.
 * @returns {string} El monto formateado como cadena de moneda.
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Convierte una cadena de fecha a un string ISO 8601.
 * @param {string} dateString - La cadena de fecha a convertir.
 * @returns {string} La cadena de fecha en formato ISO 8601.
 */
export const toISOStringDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "" : date.toISOString();
  } catch (e) {
    console.warn("Invalid date provided:", dateString, e);
    return "";
  }
};

/**
 * Calcula un rango de fechas basado en un período predefinido.
 * @param {string} periodo - El período deseado (ej. "semanal", "mensual").
 * @returns {{start: Date, end: Date}} Objeto con las fechas de inicio y fin.
 */
export const getDateRange = (periodo) => {
  const today = new Date();
  let start = new Date();
  let end = new Date();

  switch (periodo) {
    case PERIODOS.SEMANAL:
      start.setDate(today.getDate() - 6);
      end = new Date(today);
      break;
    case PERIODOS.MENSUAL:
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
    case PERIODOS.ANUAL:
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
      break;
    case PERIODOS.PERSONALIZADO:
      // No se modifican las fechas, se espera que el usuario las ingrese manualmente
      break;
    default:
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      break;
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// ICON MAPPING
const iconMap = {
  FileText,
  TrendingUp,
  PieChart,
  Target,
  Settings,
  Calendar,
  Download,
  Eye,
  Filter,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  DollarSign,
  CheckCircle,
  X,
};

/**
 * Devuelve el componente de icono correspondiente al nombre dado.
 * @param {string} iconName - El nombre del icono (ej. "FileText").
 * @returns {React.ElementType} El componente de icono.
 */
export const getIconComponent = (iconName) => {
  const IconComponent = iconMap[iconName] || FileText;
  return React.createElement(IconComponent, { className: "w-5 h-5" });
};

// JSDoc Type Definitions (repeated here for self-containment, but ideally in a separate types.js if used extensively)
/**
 * @typedef {object} PlantillaDisponible
 * @property {string} id
 * @property {string} nombre
 * @property {string} descripcion
 * @property {string} icono
 * @property {string[]} seccionesIncluidas
 * @property {object} configuracionPorDefecto
 * @property {boolean} configuracionPorDefecto.incluirResumenFinanciero
 * @property {boolean} configuracionPorDefecto.incluirGastosPorCategoria
 * @property {boolean} configuracionPorDefecto.incluirAbonosAMetas
 * @property {boolean} configuracionPorDefecto.incluirTransaccionesDetalladas
 * @property {boolean} configuracionPorDefecto.incluirIngresos
 * @property {boolean} configuracionPorDefecto.incluirGraficos
 */

/**
 * @typedef {object} GastoPorCategoriaDataDTO
 * @property {string} nombreCategoria
 * @property {number} montoGastado
 * @property {number} porcentaje
 */

/**
 * @typedef {object} AbonoMetaAhorroDataDTO
 * @property {string} nombreMeta
 * @property {number} montoAbonadoPeriodo
 * @property {number} montoActualMeta
 * @property {number} number
 * @property {number} progresoPorcentaje
 */

/**
 * @typedef {object} TransaccionDataDTO
 * @property {string} fecha
 * @property {string} titulo
 * @property {string} descripcion
 * @property {string} categoriaNombre
 * @property {string} tipo
 * @property {number} monto
 */

/**
 * @typedef {object} ReporteFinancieroDataDTO
 * @property {string} nombreCompletoUsuario
 * @property {string} fechaInicio
 * @property {string} fechaFin
 * @property {string} fechaGeneracion
 * @property {string} tituloReporte
 * @property {number} ingresosTotales
 * @property {number} gastosTotales
 * @property {number} balanceNeto
 * @property {number} ahorroTotalAbonado
 * @property {GastoPorCategoriaDataDTO[]} gastosPorCategoria
 * @property {AbonoMetaAhorroDataDTO[]} abonosAMetas
 * @property {TransaccionDataDTO[]} transacciones
 */

/**
 * @typedef {object} ConfiguracionSeccionesDTO
 * @property {boolean} incluirResumenFinanciero
 * @property {boolean} incluirGastosPorCategoria
 * @property {boolean} incluirAbonosAMetas
 * @property {boolean} incluirTransaccionesDetalladas
 * @property {boolean} incluirIngresos
 * @property {boolean} incluirGraficos
 */

/**
 * @typedef {object} ConfiguracionDetalleDTO
 * @property {string} nivelDetalle
 * @property {number} maximoTransacciones
 * @property {boolean} mostrarDescripciones
 * @property {boolean} mostrarPorcentajes
 * @property {string} ordenTransacciones
 */

/**
 * @typedef {object} ConfiguracionFiltrosDTO
 * @property {string[]} categoriasIncluidas
 * @property {string[]} categoriasExcluidas
 * @property {number | undefined} montoMinimo
 * @property {number | undefined} montoMaximo
 * @property {string[]} tiposTransaccion
 */

/**
 * @typedef {object} PlantillaReporteRequestDTO
 * @property {string} fechaInicio
 * @property {string} fechaFin
 * @property {string} tipoPlantilla
 * @property {string} [tituloReporte]
 * @property {ConfiguracionSeccionesDTO} secciones
 * @property {ConfiguracionDetalleDTO} detalle
 * @property {ConfiguracionFiltrosDTO} filtros
 */

/**
 * @typedef {object} VistaPreviaResponseDTO
 * @property {object} configuracion
 * @property {string} configuracion.tipoPlantilla
 * @property {string} configuracion.periodo
 * @property {string[]} configuracion.seccionesIncluidas
 * @property {object} configuracion.filtrosAplicados
 * @property {number} configuracion.filtrosAplicados.categoriasIncluidas
 * @property {number} configuracion.filtrosAplicados.categoriasExcluidas
 * @property {object} configuracion.filtrosAplicados.rangoMontos
 * @property {number | undefined} configuracion.filtrosAplicados.rangoMontos.minimo
 * @property {number | undefined} configuracion.filtrosAplicados.rangoMontos.maximo
 * @property {boolean} configuracion.filtrosAplicados.rangoMontos.aplicado
 * @property {number} configuracion.filtrosAplicados.tiposTransaccion
 * @property {object} resumen
 * @property {number} resumen.ingresos
 * @property {number} resumen.gastos
 * @property {number} resumen.balance
 * @property {number} resumen.ahorros
 * @property {number} resumen.totalTransacciones
 * @property {number} resumen.totalCategorias
 * @property {object} estructura
 * @property {string} estructura.titulo
 * @property {string} estructura.fechaGeneracion
 * @property {string} estructura.usuario
 */
