import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  FileText,
  Download,
  Eye,
  Settings,
  TrendingUp,
  PieChart,
  Target,
  DollarSign,
  Filter,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth"; // Importa tu hook de autenticación
import {
  // Importa las funciones del nuevo servicio de reportes
  getPlantillasDisponibles,
  generarReportePersonalizadoPdf,
  getVistaPreviaReportePersonalizado,
  getQuickSummary,
  getEstadisticasCategorias,
} from "../api/services/reportesService";
import { useCategorias } from "../hooks/useCategorias"; // Necesario para obtener la lista de categorías para filtros

// DEFINICIONES DE TIPOS USANDO JSDOC

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
 * @property {number} montoObjetivoMeta
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
 * @property {number} [montoMinimo]
 * @property {number} [montoMaximo]
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
 * @property {number} [configuracion.filtrosAplicados.rangoMontos.minimo]
 * @property {number} [configuracion.filtrosAplicados.rangoMontos.maximo]
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

const ReportesPage = () => {
  const { isAuthenticated } = useAuth();
  const { categorias: allCategorias, fetchCategoriasPorUsuario } =
    useCategorias();

  // Estados generales
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [activeTab, setActiveTab] = useState("generador");

  // Estados para la sección "Generador"
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tituloReporte, setTituloReporte] = useState(
    "Reporte Financiero Personal"
  );

  // Estados para la sección "Resumen"
  const [quickSummaryData, setQuickSummaryData] = useState(null);

  // Estados para la sección "Plantillas"
  /** @type {PlantillaDisponible[]} */
  const [plantillasDisponibles, setPlantillasDisponibles] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("completo");
  /** @type {PlantillaReporteRequestDTO} */
  const [customReportConfig, setCustomReportConfig] = useState(() => ({
    fechaInicio: "",
    fechaFin: "",
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
  }));
  /** @type {VistaPreviaResponseDTO | null} */
  const [vistaPreviaData, setVistaPreviaData] = useState(null);
  const [isVistaPreviaLoading, setIsVistaPreviaLoading] = useState(false);

  // Efecto inicial para cargar plantillas, resumen y categorías
  useEffect(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setFechaInicio(startOfMonth.toISOString().split("T")[0]);
    setFechaFin(endOfMonth.toISOString().split("T")[0]);

    setCustomReportConfig((prev) => ({
      ...prev,
      fechaInicio: startOfMonth.toISOString(),
      fechaFin: endOfMonth.toISOString(),
    }));

    fetchPlantillas();
    loadQuickSummary();
    fetchCategoriasPorUsuario(); // Cargar categorías para los filtros
  }, [fetchCategoriasPorUsuario]); // Se ejecuta una sola vez al montar el componente

  /**
   * Muestra una notificación temporal en la UI.
   * @param {string} message - El mensaje a mostrar.
   * @param {'success' | 'error'} type - El tipo de notificación (para estilos).
   */
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "" }), 5000); // Duración de la notificación
  };

  /**
   * Maneja el cambio de período predefinido para las fechas.
   * @param {string} periodo - El período seleccionado ("semanal", "mensual", "anual", "personalizado").
   */
  const handlePeriodoChange = (periodo) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (periodo) {
      case "semanal":
        start.setDate(today.getDate() - 6);
        end = new Date(today);
        break;
      case "mensual":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "anual":
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      case "personalizado":
        // No cambia las fechas, se dejan para el input manual
        break;
      default:
        break;
    }

    setFechaInicio(start.toISOString().split("T")[0]);
    setFechaFin(end.toISOString().split("T")[0]);
    setTituloReporte(
      `Reporte Financiero ${
        periodo === "personalizado"
          ? "Personal"
          : periodo.charAt(0).toUpperCase() + periodo.slice(1)
      }`
    );

    // Actualizar configuración personalizada para plantillas
    setCustomReportConfig((prev) => ({
      ...prev,
      fechaInicio: start.toISOString(),
      fechaFin: end.toISOString(),
      tituloReporte: `Reporte ${
        periodo.charAt(0).toUpperCase() + periodo.slice(1)
      }`,
    }));
  };

  const fetchPlantillas = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPlantillasDisponibles();
      setPlantillasDisponibles(data);
      // Establecer la configuración por defecto de la primera plantilla como base para el generador personalizado
      if (data.length > 0) {
        setCustomReportConfig((prev) => ({
          ...prev,
          tipoPlantilla: data[0].id,
          secciones: data[0].configuracionPorDefecto,
          // Mantener fechas y título actuales si ya fueron definidos
          fechaInicio: prev.fechaInicio || new Date().toISOString(),
          fechaFin: prev.fechaFin || new Date().toISOString(),
          tituloReporte: prev.tituloReporte || data[0].nombre,
        }));
      }
    } catch (err) {
      showNotification(`Error al cargar plantillas: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Maneja la generación y descarga del reporte PDF.
   * @param {React.FormEvent} [e] - Evento del formulario (opcional).
   * @param {string} [templateId] - ID de la plantilla a usar (opcional).
   */
  const handleGenerarReportePdf = async (e, templateId) => {
    if (e) e.preventDefault();
    setNotification({ message: "", type: "" });
    setIsLoading(true);

    if (!isAuthenticated()) {
      showNotification(
        "Usuario no autenticado. Por favor, inicia sesión.",
        "error"
      );
      setIsLoading(false);
      return;
    }

    /** @type {PlantillaReporteRequestDTO} */
    const requestData = {
      fechaInicio: customReportConfig.fechaInicio,
      fechaFin: customReportConfig.fechaFin,
      tipoPlantilla: templateId || selectedTemplateId, // Usa el ID de la plantilla si se pasa, sino el seleccionado
      tituloReporte: tituloReporte || customReportConfig.tituloReporte, // Usa el título del generador si está, sino el de la plantilla
      secciones: customReportConfig.secciones,
      detalle: customReportConfig.detalle,
      filtros: customReportConfig.filtros,
    };

    // Si se llama desde el generador principal, usa las fechas y título de ese tab
    if (!templateId) {
      requestData.fechaInicio = new Date(fechaInicio).toISOString();
      requestData.fechaFin = new Date(fechaFin).toISOString();
      requestData.tituloReporte = tituloReporte;
      requestData.tipoPlantilla = "completo"; // El generador básico siempre usa plantilla 'completo' por defecto
    }

    try {
      const response = await generarReportePersonalizadoPdf(requestData);

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      let filename = "reporte_financiero.pdf";
      const contentDisposition = response.headers["content-disposition"];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename\*?=['"]?(?:UTF-8'')?([^"'\s;]+)['"]?/i
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showNotification(
        "¡Reporte PDF generado y descargado exitosamente!",
        "success"
      );
    } catch (err) {
      console.error("Error al generar el reporte:", err);
      showNotification(`Error al generar reporte: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuickSummary = useCallback(async () => {
    setIsLoading(true);
    setNotification({ message: "", type: "" });
    try {
      // Usar las fechas del generador para el resumen rápido por defecto
      const start = fechaInicio;
      const end = fechaFin;

      const summary = await getQuickSummary(start, end);
      setQuickSummaryData(summary.metricas); // El backend devuelve un objeto con la propiedad 'metricas'

      // También cargar estadísticas por categoría para el resumen
      const stats = await getEstadisticasCategorias(start, end);
      setQuickSummaryData((prev) => ({
        ...prev,
        gastosPorCategoria: stats.categorias,
        totalGastos: stats.totalGastos,
        periodoResumen: stats.periodo,
      }));
    } catch (error) {
      showNotification(`Error al cargar resumen: ${error.message}`, "error");
      setQuickSummaryData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fechaInicio, fechaFin]); // Recargar si las fechas del generador cambian

  const handleGenerateVistaPrevia = async () => {
    setNotification({ message: "", type: "" });
    setIsVistaPreviaLoading(true);
    setVistaPreviaData(null);

    if (!isAuthenticated()) {
      showNotification(
        "Usuario no autenticado. Por favor, inicia sesión.",
        "error"
      );
      setIsVistaPreviaLoading(false);
      return;
    }

    try {
      const data = await getVistaPreviaReportePersonalizado(customReportConfig);
      setVistaPreviaData(data);
      showNotification("Vista previa generada.", "success");
    } catch (err) {
      console.error("Error al generar vista previa:", err);
      showNotification(
        `Error al generar vista previa: ${err.message}`,
        "error"
      );
    } finally {
      setIsVistaPreviaLoading(false);
    }
  };

  /**
   * Formatea un monto numérico a moneda local (CRC).
   * @param {number} amount - El monto a formatear.
   * @returns {string} El monto formateado como cadena de moneda.
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(amount);
  };

  /**
   * Devuelve el componente de icono correspondiente al nombre dado.
   * @param {string} iconName - El nombre del icono (ej. "FileText").
   * @returns {React.ElementType} El componente de icono.
   */
  const getIconComponent = (iconName) => {
    const icons = {
      FileText: FileText,
      TrendingUp: TrendingUp,
      PieChart: PieChart,
      Target: Target,
      Settings: Settings,
      Calendar: Calendar,
      Download: Download,
      Eye: Eye,
      Filter: Filter,
      ChevronRight: ChevronRight,
      RefreshCw: RefreshCw,
      AlertCircle: AlertCircle,
      DollarSign: DollarSign,
    };
    const IconComponent = icons[iconName] || FileText;
    return React.createElement(IconComponent, { className: "w-5 h-5" }); // Usar React.createElement para JSX en JSDoc
  };

  /**
   * Convierte una cadena de fecha a un string ISO 8601.
   * @param {string} dateString - La cadena de fecha a convertir.
   * @returns {string} La cadena de fecha en formato ISO 8601.
   */
  const toISOStringDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toISOString();
    } catch (e) {
      console.warn("Fecha inválida proporcionada:", dateString, e);
      return ""; // Manejo de fechas inválidas
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header de la página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Reportes
          </h1>
          <p className="text-gray-600">
            Genera y personaliza tus reportes financieros
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "generador", label: "Generador Simple", icon: FileText },
                {
                  id: "plantillas",
                  label: "Plantillas Personalizadas",
                  icon: Settings,
                },
                { id: "resumen", label: "Resumen Rápido", icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {getIconComponent(tab.icon.displayName || tab.icon.name)}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Notificación global */}
        {notification.message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
        )}

        {/* Contenido del Tab: Generador Simple */}
        {activeTab === "generador" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
              Generar Reporte Básico
            </h2>
            <div className="space-y-6">
              {/* Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fechaInicio"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Fecha Inicio:
                  </label>
                  <input
                    type="date"
                    id="fechaInicio"
                    value={fechaInicio}
                    onChange={(e) => {
                      setFechaInicio(e.target.value);
                      setCustomReportConfig((prev) => ({
                        ...prev,
                        fechaInicio: toISOStringDate(e.target.value),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="fechaFin"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Fecha Fin:
                  </label>
                  <input
                    type="date"
                    id="fechaFin"
                    value={fechaFin}
                    onChange={(e) => {
                      setFechaFin(e.target.value);
                      setCustomReportConfig((prev) => ({
                        ...prev,
                        fechaFin: toISOStringDate(e.target.value),
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Título */}
              <div>
                <label
                  htmlFor="tituloReporte"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Título del Reporte:
                </label>
                <input
                  type="text"
                  id="tituloReporte"
                  value={tituloReporte}
                  onChange={(e) => {
                    setTituloReporte(e.target.value);
                    setCustomReportConfig((prev) => ({
                      ...prev,
                      tituloReporte: e.target.value,
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Reporte de Enero 2025"
                />
              </div>

              {/* Botones de período predefinido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Períodos predefinidos:
                </label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handlePeriodoChange("semanal")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Últimos 7 Días
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodoChange("mensual")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Este Mes
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodoChange("anual")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Este Año
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodoChange("personalizado")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                  >
                    Personalizado
                  </button>
                </div>
              </div>

              {/* Botón de generar PDF */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleGenerarReportePdf()} // Llama sin templateId para el generador simple
                  className="bg-gray-950 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Generar Reporte PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenido del Tab: Plantillas Personalizadas */}
        {activeTab === "plantillas" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
              Plantillas de Reporte Personalizadas
            </h2>

            {plantillasDisponibles.length === 0 && !isLoading ? (
              <div className="text-center py-8 text-gray-600">
                No hay plantillas disponibles.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {plantillasDisponibles.map((plantilla) => (
                  <div
                    key={plantilla.id}
                    className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer border-2 ${
                      selectedTemplateId === plantilla.id
                        ? "border-blue-500 ring-4 ring-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                    } transition-all`}
                    onClick={() => {
                      setSelectedTemplateId(plantilla.id);
                      setCustomReportConfig((prev) => ({
                        ...prev,
                        tipoPlantilla: plantilla.id,
                        secciones: plantilla.configuracionPorDefecto,
                        tituloReporte: plantilla.nombre,
                      }));
                      setVistaPreviaData(null); // Limpiar vista previa al cambiar de plantilla
                    }}
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getIconComponent(plantilla.icono)}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {plantilla.nombre}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {plantilla.descripcion}
                    </p>
                    <div className="mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">
                        Secciones:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {plantilla.seccionesIncluidas.map((seccion, idx) => (
                          <span
                            key={idx}
                            className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                          >
                            {seccion}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedTemplateId && (
              <>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  Configuración Adicional de Plantilla
                </h3>
                <div className="space-y-6">
                  {/* Secciones (Checkboxes) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secciones a Incluir:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.keys(customReportConfig.secciones).map((key) => (
                        <div key={key} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`sec-${key}`}
                            // @ts-ignore
                            checked={customReportConfig.secciones[key]} // Usar ignore si no quieres tipado fuerte sin TS
                            onChange={(e) =>
                              setCustomReportConfig((prev) => ({
                                ...prev,
                                secciones: {
                                  ...prev.secciones,
                                  [key]: e.target.checked,
                                },
                              }))
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`sec-${key}`}
                            className="ml-2 text-sm text-gray-700 capitalize"
                          >
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace("Incluir", "")
                              .trim()}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtros (Categorías, Montos, Tipos de Transacción) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Filtros:
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Categorías Incluidas */}
                      <div>
                        <label
                          htmlFor="categoriasIncluidas"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Categorías Incluidas:
                        </label>
                        <select
                          id="categoriasIncluidas"
                          multiple
                          value={customReportConfig.filtros.categoriasIncluidas}
                          onChange={(e) => {
                            const options = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            setCustomReportConfig((prev) => ({
                              ...prev,
                              filtros: {
                                ...prev.filtros,
                                categoriasIncluidas: options,
                              },
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                        >
                          {allCategorias.map((cat) => (
                            <option key={cat.categoriaID} value={cat.nombre}>
                              {cat.nombre} ({cat.tipo})
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          Mantén Ctrl/Cmd para seleccionar múltiples.
                        </p>
                      </div>

                      {/* Categorías Excluidas */}
                      <div>
                        <label
                          htmlFor="categoriasExcluidas"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Categorías Excluidas:
                        </label>
                        <select
                          id="categoriasExcluidas"
                          multiple
                          value={customReportConfig.filtros.categoriasExcluidas}
                          onChange={(e) => {
                            const options = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            setCustomReportConfig((prev) => ({
                              ...prev,
                              filtros: {
                                ...prev.filtros,
                                categoriasExcluidas: options,
                              },
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                        >
                          {allCategorias.map((cat) => (
                            <option key={cat.categoriaID} value={cat.nombre}>
                              {cat.nombre} ({cat.tipo})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Monto Mínimo y Máximo */}
                      <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="montoMinimo"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Monto Mínimo:
                          </label>
                          <input
                            type="number"
                            id="montoMinimo"
                            value={customReportConfig.filtros.montoMinimo || ""}
                            onChange={(e) =>
                              setCustomReportConfig((prev) => ({
                                ...prev,
                                filtros: {
                                  ...prev.filtros,
                                  montoMinimo: e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="montoMaximo"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Monto Máximo:
                          </label>
                          <input
                            type="number"
                            id="montoMaximo"
                            value={customReportConfig.filtros.montoMaximo || ""}
                            onChange={(e) =>
                              setCustomReportConfig((prev) => ({
                                ...prev,
                                filtros: {
                                  ...prev.filtros,
                                  montoMaximo: e.target.value
                                    ? parseFloat(e.target.value)
                                    : undefined,
                                },
                              }))
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="0.01"
                          />
                        </div>
                      </div>

                      {/* Tipos de Transacción */}
                      <div>
                        <label
                          htmlFor="tiposTransaccion"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Tipos de Transacción:
                        </label>
                        <select
                          id="tiposTransaccion"
                          multiple
                          value={customReportConfig.filtros.tiposTransaccion}
                          onChange={(e) => {
                            const options = Array.from(
                              e.target.selectedOptions,
                              (option) => option.value
                            );
                            setCustomReportConfig((prev) => ({
                              ...prev,
                              filtros: {
                                ...prev.filtros,
                                tiposTransaccion: options,
                              },
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                        >
                          <option value="Ingreso">Ingreso</option>
                          <option value="Gasto">Gasto</option>
                        </select>
                      </div>

                      {/* Nivel de Detalle */}
                      <div>
                        <label
                          htmlFor="nivelDetalle"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Nivel de Detalle:
                        </label>
                        <select
                          id="nivelDetalle"
                          value={customReportConfig.detalle.nivelDetalle}
                          onChange={(e) =>
                            setCustomReportConfig((prev) => ({
                              ...prev,
                              detalle: {
                                ...prev.detalle,
                                nivelDetalle: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="resumen">Resumen</option>
                          <option value="completo">Completo</option>
                          <option value="detallado">Detallado</option>
                        </select>
                      </div>

                      {/* Máximo Transacciones */}
                      <div>
                        <label
                          htmlFor="maximoTransacciones"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Máximo Transacciones (0 = sin límite):
                        </label>
                        <input
                          type="number"
                          id="maximoTransacciones"
                          value={customReportConfig.detalle.maximoTransacciones}
                          onChange={(e) =>
                            setCustomReportConfig((prev) => ({
                              ...prev,
                              detalle: {
                                ...prev.detalle,
                                maximoTransacciones:
                                  parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                        />
                      </div>

                      {/* Orden Transacciones */}
                      <div>
                        <label
                          htmlFor="ordenTransacciones"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Orden de Transacciones:
                        </label>
                        <select
                          id="ordenTransacciones"
                          value={customReportConfig.detalle.ordenTransacciones}
                          onChange={(e) =>
                            setCustomReportConfig((prev) => ({
                              ...prev,
                              detalle: {
                                ...prev.detalle,
                                ordenTransacciones: e.target.value,
                              },
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="fecha">Fecha</option>
                          <option value="monto">Monto</option>
                          <option value="categoria">Categoría</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Acciones: Vista Previa y Descargar */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    <button
                      onClick={handleGenerateVistaPrevia}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                      disabled={isVistaPreviaLoading || isLoading}
                    >
                      {isVistaPreviaLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generando Vista Previa...</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          <span>Vista Previa</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() =>
                        handleGenerarReportePdf(undefined, selectedTemplateId)
                      }
                      className="bg-gray-950 hover:bg-gray-800 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                      disabled={isLoading || isVistaPreviaLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generando PDF...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>Descargar PDF</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Sección de Vista Previa */}
                  {vistaPreviaData && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                      <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center space-x-2">
                        <Eye className="w-5 h-5" />
                        <span>Resumen de Vista Previa</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                        <div>
                          <p>
                            <span className="font-semibold">
                              Título del Reporte:
                            </span>{" "}
                            {vistaPreviaData.estructura.titulo}
                          </p>
                          <p>
                            <span className="font-semibold">Usuario:</span>{" "}
                            {vistaPreviaData.estructura.usuario}
                          </p>
                          <p>
                            <span className="font-semibold">Periodo:</span>{" "}
                            {vistaPreviaData.configuracion.periodo}
                          </p>
                          <p>
                            <span className="font-semibold">Plantilla:</span>{" "}
                            {vistaPreviaData.configuracion.tipoPlantilla}
                          </p>
                          <p>
                            <span className="font-semibold">Generado:</span>{" "}
                            {new Date(
                              vistaPreviaData.estructura.fechaGeneracion
                            ).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p>
                            <span className="font-semibold">
                              Ingresos Totales:
                            </span>{" "}
                            {formatCurrency(vistaPreviaData.resumen.ingresos)}
                          </p>
                          <p>
                            <span className="font-semibold">
                              Gastos Totales:
                            </span>{" "}
                            {formatCurrency(vistaPreviaData.resumen.gastos)}
                          </p>
                          <p>
                            <span className="font-semibold">Balance Neto:</span>{" "}
                            {formatCurrency(vistaPreviaData.resumen.balance)}
                          </p>
                          <p>
                            <span className="font-semibold">Ahorros:</span>{" "}
                            {formatCurrency(vistaPreviaData.resumen.ahorros)}
                          </p>
                          <p>
                            <span className="font-semibold">
                              Total Transacciones:
                            </span>{" "}
                            {vistaPreviaData.resumen.totalTransacciones}
                          </p>
                          <p>
                            <span className="font-semibold">
                              Total Categorías únicas:
                            </span>{" "}
                            {vistaPreviaData.resumen.totalCategorias}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="font-semibold text-blue-800">
                          Secciones Incluidas:
                        </p>
                        <p className="text-blue-700">
                          {vistaPreviaData.configuracion.seccionesIncluidas.join(
                            ", "
                          ) || "Ninguna"}
                        </p>
                      </div>
                      <div className="mt-2">
                        <p className="font-semibold text-blue-800">
                          Filtros Aplicados:
                        </p>
                        <ul className="list-disc list-inside text-blue-700">
                          <li>
                            Categorías Incluidas:{" "}
                            {vistaPreviaData.configuracion.filtrosAplicados
                              .categoriasIncluidas > 0
                              ? `${vistaPreviaData.configuracion.filtrosAplicados.categoriasIncluidas} seleccionadas`
                              : "Todas"}
                          </li>
                          <li>
                            Categorías Excluidas:{" "}
                            {vistaPreviaData.configuracion.filtrosAplicados
                              .categoriasExcluidas > 0
                              ? `${vistaPreviaData.configuracion.filtrosAplicados.categoriasExcluidas} excluidas`
                              : "Ninguna"}
                          </li>
                          <li>
                            Rango de Montos:{" "}
                            {vistaPreviaData.configuracion.filtrosAplicados
                              .rangoMontos.aplicado
                              ? `${formatCurrency(
                                  vistaPreviaData.configuracion.filtrosAplicados
                                    .rangoMontos.minimo || 0
                                )} - ${formatCurrency(
                                  vistaPreviaData.configuracion.filtrosAplicados
                                    .rangoMontos.maximo || 999999999
                                )}`
                              : "Sin filtro"}
                          </li>
                          <li>
                            Tipos de Transacción:{" "}
                            {vistaPreviaData.configuracion.filtrosAplicados
                              .tiposTransaccion > 0
                              ? `${vistaPreviaData.configuracion.filtrosAplicados.tiposTransaccion} seleccionados`
                              : "Todos"}
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Contenido del Tab: Resumen Rápido */}
        {activeTab === "resumen" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Resumen Rápido y Estadísticas
              </h2>
              <p className="text-gray-600 mb-4">
                Métricas clave y desglose de gastos para el periodo actual.
              </p>
              <button
                onClick={loadQuickSummary}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                disabled={isLoading}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar Resumen</span>
              </button>
            </div>

            {quickSummaryData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Ingresos Totales
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(quickSummaryData.ingresosTotales)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <DollarSign className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Gastos Totales
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(quickSummaryData.gastosTotales)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Balance Neto
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            quickSummaryData.balanceNeto >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(quickSummaryData.balanceNeto)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Abonos a Metas
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(quickSummaryData.ahorroTotalAbonado)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gastos por Categoría en Resumen Rápido */}
                {quickSummaryData.gastosPorCategoria &&
                  quickSummaryData.gastosPorCategoria.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Gastos por Categoría ({quickSummaryData.periodoResumen})
                      </h3>
                      <div className="space-y-4">
                        {quickSummaryData.gastosPorCategoria.map(
                          (categoria, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-700">
                                    {categoria.nombreCategoria}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {categoria.porcentaje.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${categoria.porcentaje}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                              <div className="ml-4 text-right">
                                <span className="text-sm font-medium text-gray-900">
                                  {formatCurrency(categoria.montoGastado)}
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </>
            )}
            {!quickSummaryData && !isLoading && (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm text-gray-600">
                No hay datos disponibles para el resumen rápido en el período
                seleccionado.
              </div>
            )}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-xl">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg font-medium text-gray-700">
                Cargando datos...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportesPage;
