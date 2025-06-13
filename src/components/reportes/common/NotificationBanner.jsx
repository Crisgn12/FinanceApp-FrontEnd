import React from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";

/**
 * Componente para mostrar mensajes de notificación (éxito, error, info).
 * @param {object} props
 * @param {object} props.notification - Objeto de notificación con `message` y `type`.
 * @param {function} props.onClose - Función para cerrar la notificación.
 * @returns {JSX.Element | null}
 */
const NotificationBanner = ({ notification, onClose }) => {
  if (!notification.message) return null;

  const styles = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle,
  };

  const Icon = icons[notification.type] || AlertCircle;

  return (
    <div
      className={`mb-6 p-4 rounded-lg border flex items-center justify-between ${
        styles[notification.type]
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <p className="text-sm font-medium">{notification.message}</p>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationBanner;
