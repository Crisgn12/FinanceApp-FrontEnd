import React from "react";
import {
  DollarSign,
  TrendingUp,
  Target,
  RefreshCw,
  PieChart,
} from "lucide-react";
import QuickSummaryCard from "../common/QuickSummaryCard"; // Importar el componente de tarjeta
import { formatCurrency } from "../../../utils/reportUtils"; // Importar la utilidad

/**
 * @typedef {object} GastoPorCategoriaDataDTO
 * @property {string} nombreCategoria
 * @property {number} montoGastado
 * @property {number} porcentaje
 */

/**
 * @typedef {object} QuickSummaryData
 * @property {number} ingresosTotales
 * @property {number} gastosTotales
 * @property {number} balanceNeto
 * @property {number} ahorroTotalAbonado
 * @property {GastoPorCategoriaDataDTO[]} gastosPorCategoria
 * @property {number} totalGastos
 * @property {string} periodoResumen
 */

/**
 * @typedef {object} SummaryTabProps
 * @property {boolean} isLoading
 * @property {QuickSummaryData | null} quickSummaryData
 * @property {function(): Promise<void>} loadQuickSummary
 */

/**
 * Componente para el tab "Resumen Rápido" de reportes.
 * Muestra métricas clave y desglose de gastos por categoría.
 * @param {SummaryTabProps} props
 * @returns {JSX.Element}
 */
const SummaryTab = ({ isLoading, quickSummaryData, loadQuickSummary }) => {
  console.log(
    "Gastos por Categoría en SummaryTab:",
    quickSummaryData?.gastosPorCategoria
  );

  return (
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
            <QuickSummaryCard
              title="Ingresos Totales"
              value={quickSummaryData.ingresosTotales}
              icon={DollarSign}
              color="green"
            />
            <QuickSummaryCard
              title="Gastos Totales"
              value={quickSummaryData.gastosTotales}
              icon={DollarSign}
              color="red"
            />
            <QuickSummaryCard
              title="Balance Neto"
              value={quickSummaryData.balanceNeto}
              icon={TrendingUp}
              color={quickSummaryData.balanceNeto >= 0 ? "green" : "red"}
            />
            <QuickSummaryCard
              title="Abonos a Metas"
              value={quickSummaryData.ahorroTotalAbonado}
              icon={Target}
              color="purple"
            />
          </div>

          {quickSummaryData.gastosPorCategoria?.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Gastos por Categoría ({quickSummaryData.periodoResumen})
              </h3>
              <div className="space-y-4">
                {quickSummaryData.gastosPorCategoria.map((categoria, index) => (
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
                ))}
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
  );
};

export default SummaryTab;
