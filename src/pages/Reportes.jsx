// src/pages/Reportes.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNotification } from "../hooks/useNotification";
import { useReportConfig } from "../hooks/useReportConfig";
import { useCategorias } from "../hooks/useCategorias";
import {
  getPlantillasDisponibles,
  generarReportePersonalizadoPdf,
  getVistaPreviaReportePersonalizado,
  getQuickSummary,
  getEstadisticasCategorias,
} from "../api/services/reportesService";

// Importar componentes comunes
import NotificationBanner from "../components/reportes/common/NotificationBanner";
import LoadingSpinner from "../components/reportes/common/LoadingSpinner";
import TabNavigation from "../components/reportes/common/TabNavigation";

// Importar componentes de los tabs
import GeneratorTab from "../components/reportes/tabs/GeneratorTab";
import TemplatesTab from "../components/reportes/tabs/TemplatesTab";
import SummaryTab from "../components/reportes/tabs/SummaryTab";

// Importar utilidades y constantes
import {
  TABS,
  PERIODOS,
  toISOStringDate,
  getDateRange,
  // Ya no necesitamos importar formatCurrency o getIconComponent aquí
  // porque se usan dentro de los componentes hijos o son locales
} from "../utils/reportUtils";

/**
 * @typedef {import("../utils/reportUtils").PlantillaDisponible} PlantillaDisponible
 * @typedef {import("../utils/reportUtils").PlantillaReporteRequestDTO} PlantillaReporteRequestDTO
 * @typedef {import("../utils/reportUtils").VistaPreviaResponseDTO} VistaPreviaResponseDTO
 * @typedef {import("../utils/reportUtils").GastoPorCategoriaDataDTO} GastoPorCategoriaDataDTO
 * @typedef {import("../utils/reportUtils").ReportConfigState} ReportConfigState
 */

const Reportes = () => {
  // Renombrado a Reportes para que coincida con tu preferencia
  const { isAuthenticated } = useAuth();
  const { categorias: allCategorias, fetchCategoriasPorUsuario } =
    useCategorias();
  const { notification, showNotification, clearNotification } =
    useNotification();
  const {
    config,
    updateConfig,
    updateSecciones,
    updateDetalle,
    updateFiltros,
  } = useReportConfig();

  // Estados
  const [isLoading, setIsLoading] = useState(false); // Carga global para operaciones principales
  const [activeTab, setActiveTab] = useState(TABS.GENERADOR);

  // Estados específicos para el tab "Generador Simple" (inputs)
  const [fechaInicioSimple, setFechaInicioSimple] = useState("");
  const [fechaFinSimple, setFechaFinSimple] = useState("");
  const [tituloReporteSimple, setTituloReporteSimple] = useState(
    "Reporte Financiero Personal"
  );

  /** @type {PlantillaDisponible[]} */
  const [plantillasDisponibles, setPlantillasDisponibles] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("completo"); // ID de la plantilla seleccionada en el tab "Plantillas"

  /** @type {VistaPreviaResponseDTO | null} */
  const [vistaPreviaData, setVistaPreviaData] = useState(null);
  const [isVistaPreviaLoading, setIsVistaPreviaLoading] = useState(false); // Carga específica para la vista previa

  /** @type {object | null} */ // JSDoc for quick summary data structure
  const [quickSummaryData, setQuickSummaryData] = useState(null);

  // Memoized categories for select inputs in TemplatesTab
  const categoriasOptions = useMemo(() => {
    return allCategorias.map((cat) => ({
      value: cat.nombre,
      label: `${cat.nombre} (${cat.tipo})`,
      id: cat.categoriaID,
    }));
  }, [allCategorias]);

  // Initial setup: set default dates for simple generator and report config
  useEffect(() => {
    const { start, end } = getDateRange(PERIODOS.MENSUAL);
    const startDate = start.toISOString().split("T")[0];
    const endDate = end.toISOString().split("T")[0];

    setFechaInicioSimple(startDate);
    setFechaFinSimple(endDate);

    updateConfig({
      fechaInicio: start.toISOString(),
      fechaFin: end.toISOString(),
      tituloReporte: `Reporte Financiero ${start.getFullYear()}-${
        start.getMonth() + 1
      }`,
    });

    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchPlantillas(), // Load available templates
          fetchCategoriasPorUsuario(), // Load categories for filters
        ]);
      } catch (error) {
        showNotification("Error al cargar datos iniciales", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [updateConfig, fetchCategoriasPorUsuario, showNotification]);

  // Load quick summary when dates or active tab (to RESUMEN) change
  useEffect(() => {
    if (activeTab === TABS.RESUMEN && fechaInicioSimple && fechaFinSimple) {
      loadQuickSummary();
    }
  }, [activeTab, fechaInicioSimple, fechaFinSimple]); // Depend on simple generator dates

  const fetchPlantillas = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPlantillasDisponibles();
      setPlantillasDisponibles(data);

      if (data.length > 0) {
        const firstTemplate = data[0];
        setSelectedTemplateId(firstTemplate.id);
        updateConfig({
          tipoPlantilla: firstTemplate.id,
          secciones: firstTemplate.configuracionPorDefecto,
          // Do NOT override current fechaInicio/fechaFin/tituloReporte here
          // as they are already set by the initial useEffect or handlePeriodoChange.
        });
      }
    } catch (err) {
      showNotification(`Error al cargar plantillas: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }, [updateConfig, showNotification]);

  const handlePeriodoChange = useCallback(
    (periodo) => {
      const { start, end } = getDateRange(periodo);
      const startDateStr = start.toISOString().split("T")[0];
      const endDateStr = end.toISOString().split("T")[0];

      setFechaInicioSimple(startDateStr);
      setFechaFinSimple(endDateStr);

      const titulo = `Reporte Financiero ${
        periodo === PERIODOS.PERSONALIZADO
          ? "Personalizado"
          : periodo.charAt(0).toUpperCase() + periodo.slice(1)
      }`;

      setTituloReporteSimple(titulo);

      // Update the global config for templates as well
      updateConfig({
        fechaInicio: start.toISOString(),
        fechaFin: end.toISOString(),
        tituloReporte: titulo,
      });
    },
    [updateConfig]
  );

  const handleGenerarReportePdf = useCallback(
    async (e, sourceTemplateId) => {
      if (e) e.preventDefault();

      if (!isAuthenticated()) {
        showNotification(
          "Usuario no autenticado. Por favor, inicia sesión.",
          "error"
        );
        return;
      }

      setIsLoading(true);
      clearNotification();

      /** @type {PlantillaReporteRequestDTO} */
      let requestData = { ...config }; // Start with current global config

      if (sourceTemplateId) {
        // If triggered from TemplatesTab, config is already updated by handleTemplateSelect
        requestData.tipoPlantilla = sourceTemplateId;
      } else {
        // If triggered from GeneratorTab, override config with simple generator states
        requestData.fechaInicio = toISOStringDate(fechaInicioSimple);
        requestData.fechaFin = toISOStringDate(fechaFinSimple);
        requestData.tituloReporte = tituloReporteSimple;
        requestData.tipoPlantilla = "completo"; // Default for simple generator
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
          if (filenameMatch?.[1]) {
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
        console.error("Error generating report:", err);
        showNotification(`Error al generar reporte: ${err.message}`, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [
      config,
      fechaInicioSimple,
      fechaFinSimple,
      tituloReporteSimple,
      isAuthenticated,
      showNotification,
      clearNotification,
    ]
  );

  const loadQuickSummary = useCallback(async () => {
    if (!fechaInicioSimple || !fechaFinSimple) {
      showNotification(
        "Por favor, selecciona un rango de fechas para el resumen.",
        "info"
      );
      return;
    }

    setIsLoading(true);
    clearNotification();
    try {
      const [summary, stats] = await Promise.all([
        getQuickSummary(fechaInicioSimple, fechaFinSimple),
        getEstadisticasCategorias(fechaInicioSimple, fechaFinSimple),
      ]);

      setQuickSummaryData({
        ...summary.metricas,
        gastosPorCategoria: stats.categorias,
        totalGastos: stats.totalGastos,
        periodoResumen: stats.periodo,
      });
      showNotification("Resumen rápido actualizado.", "success");
    } catch (error) {
      showNotification(`Error al cargar resumen: ${error.message}`, "error");
      setQuickSummaryData(null);
    } finally {
      setIsLoading(false);
    }
  }, [fechaInicioSimple, fechaFinSimple, showNotification, clearNotification]);

  const handleGenerateVistaPrevia = useCallback(async () => {
    if (!isAuthenticated()) {
      showNotification(
        "Usuario no autenticado. Por favor, inicia sesión.",
        "error"
      );
      return;
    }

    setIsVistaPreviaLoading(true);
    setVistaPreviaData(null);
    clearNotification();

    try {
      const data = await getVistaPreviaReportePersonalizado(config);
      setVistaPreviaData(data);
      showNotification("Vista previa generada.", "success");
    } catch (err) {
      console.error("Error generating preview:", err);
      showNotification(
        `Error al generar vista previa: ${err.message}`,
        "error"
      );
    } finally {
      setIsVistaPreviaLoading(false);
    }
  }, [config, isAuthenticated, showNotification, clearNotification]);

  const handleTemplateSelect = useCallback(
    (/** @type {PlantillaDisponible} */ plantilla) => {
      setSelectedTemplateId(plantilla.id);
      updateConfig({
        tipoPlantilla: plantilla.id,
        secciones: plantilla.configuracionPorDefecto,
        // Dates (fechaInicio, fechaFin) from 'config' are kept as is,
        // allowing them to persist from previous period selections.
      });
      setVistaPreviaData(null); // Clear preview when switching templates
    },
    [updateConfig]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistema de Reportes
          </h1>
          <p className="text-gray-600">
            Genera y personaliza tus reportes financieros
          </p>
        </div>

        {/* Navigation Tabs */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Global Notification */}
        <NotificationBanner
          notification={notification}
          onClose={clearNotification}
        />

        {/* Content based on active tab */}
        {activeTab === TABS.GENERADOR && (
          <GeneratorTab
            fechaInicioSimple={fechaInicioSimple}
            setFechaInicioSimple={setFechaInicioSimple}
            fechaFinSimple={fechaFinSimple}
            setFechaFinSimple={setFechaFinSimple}
            tituloReporteSimple={tituloReporteSimple}
            setTituloReporteSimple={setTituloReporteSimple}
            handlePeriodoChange={handlePeriodoChange}
            handleGenerarReportePdf={handleGenerarReportePdf}
            isLoading={isLoading}
            updateConfig={updateConfig} // Passed down to update global config for simple generator dates
          />
        )}
        {activeTab === TABS.PLANTILLAS && (
          <TemplatesTab
            isLoading={isLoading}
            isVistaPreviaLoading={isVistaPreviaLoading}
            handleGenerarReportePdf={handleGenerarReportePdf}
            handleGenerateVistaPrevia={handleGenerateVistaPrevia}
            plantillasDisponibles={plantillasDisponibles}
            selectedTemplateId={selectedTemplateId}
            handleTemplateSelect={handleTemplateSelect}
            config={config} // The global report config state
            updateConfig={updateConfig}
            updateSecciones={updateSecciones}
            updateDetalle={updateDetalle}
            updateFiltros={updateFiltros}
            categoriasOptions={categoriasOptions}
            vistaPreviaData={vistaPreviaData}
          />
        )}
        {activeTab === TABS.RESUMEN && (
          <SummaryTab
            isLoading={isLoading}
            quickSummaryData={quickSummaryData}
            loadQuickSummary={loadQuickSummary}
          />
        )}

        {/* Loading Overlay */}
        {(isLoading || isVistaPreviaLoading) && (
          <LoadingSpinner
            message={
              isLoading ? "Cargando datos..." : "Generando vista previa..."
            }
          />
        )}
      </div>
    </div>
  );
};

export default Reportes;
