import React from "react";
import { RefreshCw } from "lucide-react";

/**
 * Componente para mostrar un spinner de carga.
 * @param {object} props
 * @param {string} [props.message="Cargando datos..."] - Mensaje a mostrar junto al spinner.
 * @returns {JSX.Element}
 */
const LoadingSpinner = ({ message = "Cargando datos..." }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-xl">
      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
      <span className="text-lg font-medium text-gray-700">{message}</span>
    </div>
  </div>
);

export default LoadingSpinner;
