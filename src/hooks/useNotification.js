import { useState, useCallback } from "react";

/**
 * Hook personalizado para manejar el estado y la lógica de las notificaciones.
 * @returns {{notification: object, showNotification: function, clearNotification: function}}
 */
export const useNotification = () => {
  const [notification, setNotification] = useState({ message: "", type: "" });

  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 5000); // La notificación desaparece después de 5 segundos
    return () => clearTimeout(timer); // Limpiar el timer si el componente se desmonta
  }, []);

  const clearNotification = useCallback(() => {
    setNotification({ message: "", type: "" });
  }, []);

  return { notification, showNotification, clearNotification };
};
