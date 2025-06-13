import React from "react";

// Constantes de periodos (redefinidas aquí para que el componente sea autocontenido)
const PERIODOS = {
  SEMANAL: "semanal",
  MENSUAL: "mensual",
  ANUAL: "anual",
  PERSONALIZADO: "personalizado",
};

/**
 * Componente para botones de selección de período predefinido.
 * @param {object} props
 * @param {function(string): void} props.onPeriodChange - Callback al cambiar el período.
 * @returns {JSX.Element}
 */
const PeriodButtons = ({ onPeriodChange }) => {
  const periods = [
    { key: PERIODOS.SEMANAL, label: "Últimos 7 Días" },
    { key: PERIODOS.MENSUAL, label: "Este Mes" },
    { key: PERIODOS.ANUAL, label: "Este Año" },
    { key: PERIODOS.PERSONALIZADO, label: "Personalizado" },
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Períodos predefinidos:
      </label>
      <div className="flex flex-wrap gap-3">
        {periods.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => onPeriodChange(key)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodButtons;
