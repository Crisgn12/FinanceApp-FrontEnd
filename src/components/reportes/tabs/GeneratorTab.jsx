import React, { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import PeriodButtons from "../common/PeriodButtons"; // Importar el componente de botones
import { toISOStringDate } from "../../../utils/reportUtils"; // Importar la utilidad

/**
 * @typedef {object} GeneratorTabProps
 * @property {string} fechaInicioSimple
 * @property {function(string): void} setFechaInicioSimple
 * @property {string} fechaFinSimple
 * @property {function(string): void} setFechaFinSimple
 * @property {string} tituloReporteSimple
 * @property {function(string): void} setTituloReporteSimple
 * @property {function(string): void} handlePeriodoChange
 * @property {function(React.FormEvent | undefined, string | undefined): Promise<void>} handleGenerarReportePdf
 * @property {boolean} isLoading
 * @property {function(object): void} updateConfig // Necesario para actualizar la config global
 */

/**
 * Componente para el tab "Generador Simple" de reportes.
 * Permite seleccionar un rango de fechas y un título para generar un PDF básico.
 * @param {GeneratorTabProps} props
 * @returns {JSX.Element}
 */
const GeneratorTab = ({
  fechaInicioSimple,
  setFechaInicioSimple,
  fechaFinSimple,
  setFechaFinSimple,
  tituloReporteSimple,
  setTituloReporteSimple,
  handlePeriodoChange,
  handleGenerarReportePdf,
  isLoading,
  updateConfig,
}) => {
  // Estado para trackear el período seleccionado
  const [selectedPeriod, setSelectedPeriod] = useState("");

  // Función modificada para manejar el cambio de período
  const handlePeriodoChangeWithState = (period) => {
    setSelectedPeriod(period);
    handlePeriodoChange(period);
  };
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6 text-gray-900">
        Generar Reporte Básico
      </h2>
      <div className="space-y-6">
        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="fechaInicioSimple"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Fecha Inicio:
            </label>
            <input
              type="date"
              id="fechaInicioSimple"
              value={fechaInicioSimple}
              onChange={(e) => setFechaInicioSimple(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label
              htmlFor="fechaFinSimple"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Fecha Fin:
            </label>
            <input
              type="date"
              id="fechaFinSimple"
              value={fechaFinSimple}
              onChange={(e) => setFechaFinSimple(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Título */}
        <div>
          <label
            htmlFor="tituloReporteSimple"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Título del Reporte:
          </label>
          <input
            type="text"
            id="tituloReporteSimple"
            value={tituloReporteSimple}
            onChange={(e) => setTituloReporteSimple(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Reporte de Enero 2025"
          />
        </div>

        {/* Botones de período predefinido y botón de generar PDF en la misma fila */}
        <div className="flex items-end justify-between">
          <div>
            <PeriodButtons
              onPeriodChange={handlePeriodoChangeWithState}
              selectedPeriod={selectedPeriod}
            />
          </div>

          <button
            onClick={handleGenerarReportePdf}
            className="bg-gray-950 hover:bg-gray-800 disabled:bg-gray-400 text-white px-5 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
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
  );
};

export default GeneratorTab;
