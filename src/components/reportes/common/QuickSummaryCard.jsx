import React from "react";
import { DollarSign, TrendingUp, Target } from "lucide-react"; // Importar íconos usados

// Función de utilidad para formatear moneda (redefinida aquí para autocontención)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Componente para mostrar una tarjeta de resumen rápido.
 * @param {object} props
 * @param {string} props.title - Título de la tarjeta.
 * @param {number} props.value - Valor numérico a mostrar.
 * @param {React.ElementType} props.icon - Componente de ícono de Lucide React.
 * @param {"blue" | "green" | "red" | "purple"} [props.color="blue"] - Color de la tarjeta.
 * @returns {JSX.Element}
 */
const QuickSummaryCard = ({ title, value, icon: Icon, color = "blue" }) => {
  const colorStyles = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(value)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuickSummaryCard;
