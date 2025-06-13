// src/components/reportes/tabs/TemplatesTab.jsx

import React from "react";
import { Download, RefreshCw, Eye } from "lucide-react";
import {
  getIconComponent,
  formatCurrency, // <-- Importar formatCurrency
  toISOStringDate,
  TIPOS_TRANSACCION, // <-- Importar desde utils
  NIVELES_DETALLE, // <-- Importar desde utils
  ORDENAMIENTO_OPCIONES, // <-- Importar desde utils
} from "../../../utils/reportUtils";

/**
 * @typedef {import("../../../utils/reportUtils").ConfiguracionSeccionesDTO} ConfiguracionSecciones
 * @typedef {import("../../../utils/reportUtils").ConfiguracionDetalleDTO} ConfiguracionDetalle
 * @typedef {import("../../../utils/reportUtils").ConfiguracionFiltrosDTO} ConfiguracionFiltros
 * @typedef {import("../../../utils/reportUtils").ReportConfigState} ReportConfigState
 * @typedef {import("../../../utils/reportUtils").PlantillaDisponible} PlantillaDisponible
 * @typedef {import("../../../utils/reportUtils").VistaPreviaResponseDTO} VistaPreviaResponseDTO
 */

/**
 * @typedef {object} TemplatesTabProps
 * @property {boolean} isLoading
 * @property {boolean} isVistaPreviaLoading
 * @property {function(React.FormEvent | undefined, string | undefined): Promise<void>} handleGenerarReportePdf
 * @property {function(): Promise<void>} handleGenerateVistaPrevia
 * @property {PlantillaDisponible[]} plantillasDisponibles
 * @property {string} selectedTemplateId
 * @property {function(PlantillaDisponible): void} handleTemplateSelect
 * @property {ReportConfigState} config
 * @property {function(object): void} updateConfig
 * @property {function(object): void} updateSecciones
 * @property {function(object): void} updateDetalle
 * @property {function(object): void} updateFiltros
 * @property {object[]} categoriasOptions
 * @property {VistaPreviaResponseDTO | null} vistaPreviaData
 */

/**
 * Componente para el tab "Plantillas Personalizadas" de reportes.
 * Permite seleccionar una plantilla, configurar secciones y filtros, y generar vista previa o PDF.
 * @param {TemplatesTabProps} props
 * @returns {JSX.Element}
 */
const TemplatesTab = ({
  isLoading,
  isVistaPreviaLoading,
  handleGenerarReportePdf,
  handleGenerateVistaPrevia,
  plantillasDisponibles,
  selectedTemplateId,
  handleTemplateSelect,
  config,
  updateConfig,
  updateSecciones,
  updateDetalle,
  updateFiltros,
  categoriasOptions,
  vistaPreviaData,
}) => {
  return (
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
              className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer border-2 transition-all ${
                selectedTemplateId === plantilla.id
                  ? "border-blue-500 ring-4 ring-blue-100"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => handleTemplateSelect(plantilla)}
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
        <div className="space-y-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            Configuración Adicional de Plantilla
          </h3>
          {/* Section: Report Title */}
          <div>
            <label
              htmlFor="reportTitle"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Título del Reporte Personalizado:
            </label>
            <input
              type="text"
              id="reportTitle"
              value={config.tituloReporte}
              onChange={(e) => updateConfig({ tituloReporte: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Análisis Mensual Detallado"
            />
          </div>

          {/* Section: Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="templateFechaInicio"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fecha Inicio:
              </label>
              <input
                type="date"
                id="templateFechaInicio"
                value={
                  config.fechaInicio
                    ? new Date(config.fechaInicio).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  updateConfig({ fechaInicio: toISOStringDate(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label
                htmlFor="templateFechaFin"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Fecha Fin:
              </label>
              <input
                type="date"
                id="templateFechaFin"
                value={
                  config.fechaFin
                    ? new Date(config.fechaFin).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  updateConfig({ fechaFin: toISOStringDate(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Section: Secciones a Incluir (Checkboxes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secciones a Incluir:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.keys(config.secciones).map((key) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`sec-${key}`}
                    checked={config.secciones[key]}
                    onChange={(e) =>
                      updateSecciones({ [key]: e.target.checked })
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

          {/* Section: Filters (Categories, Amounts, Transaction Types) */}
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
                  value={config.filtros.categoriasIncluidas}
                  onChange={(e) => {
                    const options = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    updateFiltros({ categoriasIncluidas: options });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                >
                  {categoriasOptions.map((cat) => (
                    <option key={cat.id} value={cat.value}>
                      {cat.label}
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
                  value={config.filtros.categoriasExcluidas}
                  onChange={(e) => {
                    const options = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    updateFiltros({ categoriasExcluidas: options });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
                >
                  {categoriasOptions.map((cat) => (
                    <option key={cat.id} value={cat.value}>
                      {cat.label}
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
                    value={config.filtros.montoMinimo || ""}
                    onChange={(e) =>
                      updateFiltros({
                        montoMinimo: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
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
                    value={config.filtros.montoMaximo || ""}
                    onChange={(e) =>
                      updateFiltros({
                        montoMaximo: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
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
                  value={config.filtros.tiposTransaccion}
                  onChange={(e) => {
                    const options = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    updateFiltros({ tiposTransaccion: options });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                >
                  {TIPOS_TRANSACCION.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
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
                  value={config.detalle.nivelDetalle}
                  onChange={(e) =>
                    updateDetalle({ nivelDetalle: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {NIVELES_DETALLE.map((level) => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
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
                  value={config.detalle.maximoTransacciones}
                  onChange={(e) =>
                    updateDetalle({
                      maximoTransacciones: parseInt(e.target.value) || 0,
                    })
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
                  value={config.detalle.ordenTransacciones}
                  onChange={(e) =>
                    updateDetalle({ ordenTransacciones: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {ORDENAMIENTO_OPCIONES.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions: Preview and Download */}
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
              onClick={(e) => handleGenerarReportePdf(e, selectedTemplateId)}
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

          {/* Preview Section */}
          {vistaPreviaData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Resumen de Vista Previa</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p>
                    <span className="font-semibold">Título del Reporte:</span>{" "}
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
                    ).toLocaleString("es-CR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold">Ingresos Totales:</span>{" "}
                    {formatCurrency(vistaPreviaData.resumen.ingresos)}
                  </p>
                  <p>
                    <span className="font-semibold">Gastos Totales:</span>{" "}
                    {formatCurrency(vistaPreviaData.resumen.gastos)}
                  </p>
                  <p
                    className={`font-bold ${
                      vistaPreviaData.resumen.balance >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <span className="font-semibold text-blue-800">
                      Balance Neto:
                    </span>{" "}
                    {formatCurrency(vistaPreviaData.resumen.balance)}
                  </p>
                  <p>
                    <span className="font-semibold">Ahorros:</span>{" "}
                    {formatCurrency(vistaPreviaData.resumen.ahorros)}
                  </p>
                  <p>
                    <span className="font-semibold">Total Transacciones:</span>{" "}
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
                    {vistaPreviaData.configuracion.filtrosAplicados.rangoMontos
                      .aplicado
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
      )}
    </div>
  );
};

export default TemplatesTab;
