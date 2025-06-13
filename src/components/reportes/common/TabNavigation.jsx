import React from "react";
import { FileText, Settings, TrendingUp } from "lucide-react";

// Mapeo de iconos para usar con React.createElement
const iconMap = {
  FileText,
  Settings,
  TrendingUp,
};

/**
 * Componente para la navegación entre tabs de reportes.
 * @param {object} props
 * @param {string} props.activeTab - El ID del tab activo.
 * @param {function} props.setActiveTab - Función para cambiar el tab activo.
 * @returns {JSX.Element}
 */
const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "generador", label: "Generador PDF Simple", icon: "FileText" },
    // { id: "plantillas", label: "Plantillas Personalizadas", icon: "Settings" },
    { id: "resumen", label: "Resumen Rápido", icon: "TrendingUp" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {React.createElement(iconMap[tab.icon], { className: "w-5 h-5" })}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;
