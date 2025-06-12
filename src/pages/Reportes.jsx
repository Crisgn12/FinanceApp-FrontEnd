// src/pages/Reportes.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import apiClient from "../api/index"; // Importa tu instancia de axios configurada

const Reportes = () => {
  const { user, isAuthenticated } = useAuth();
  const token = user?.token;

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tituloReporte, setTituloReporte] = useState(
    "Reporte Financiero Personal"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportsHistory, setReportsHistory] = useState([]);

  useEffect(() => {
    handlePeriodoChange("mensual");
  }, []);

  const handlePeriodoChange = (periodo) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (periodo) {
      case "semanal":
        start.setDate(today.getDate() - 6);
        end = new Date(today);
        break;
      case "mensual":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "anual":
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        break;
    }

    setFechaInicio(start.toISOString().split("T")[0]);
    setFechaFin(end.toISOString().split("T")[0]);
    setTituloReporte(
      `Reporte Financiero ${
        periodo === "personalizado"
          ? "Personal"
          : periodo.charAt(0).toUpperCase() + periodo.slice(1)
      }`
    );
  };

  const handleGenerarReportePdf = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!isAuthenticated()) {
      setError("Usuario no autenticado. Por favor, inicia sesión.");
      setIsLoading(false);
      return;
    }

    if (!fechaInicio || !fechaFin) {
      setError("Por favor, selecciona una fecha de inicio y una fecha de fin.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post(
        "/Reportes/generar-pdf",
        {
          fechaInicio: new Date(fechaInicio).toISOString(),
          fechaFin: new Date(fechaFin).toISOString(),
          tituloReporte: tituloReporte,
        },
        {
          // *** IMPORTANTE: Añadir este header explícitamente ***
          headers: {
            Accept: "application/pdf",
          },
          responseType: "blob",
        }
      );

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
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      alert("Reporte PDF generado y descargado exitosamente!");
    } catch (err) {
      console.error("Error al generar el reporte:", err);
      // El error 'TypeError: Failed to fetch' suele venir de Axios si el servidor no responde
      // o si la configuración de CORS es incorrecta o si la URL no es válida.
      // En este caso, con 406, significa que el servidor respondió pero no pudo generar lo que esperaba el cliente.
      setError(`Error: ${err.message || "Error desconocido"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reportes-page p-4">
      <h1 className="text-2xl font-bold mb-4">Generar y Gestionar Reportes</h1>

      <section className="report-generator-section bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Generar Nuevo Reporte</h2>
        <form onSubmit={handleGenerarReportePdf}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="fechaInicio"
                className="block text-sm font-medium text-gray-700"
              >
                Fecha Inicio:
              </label>
              <input
                type="date"
                id="fechaInicio"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="fechaFin"
                className="block text-sm font-medium text-gray-700"
              >
                Fecha Fin:
              </label>
              <input
                type="date"
                id="fechaFin"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              htmlFor="tituloReporte"
              className="block text-sm font-medium text-gray-700"
            >
              Título del Reporte:
            </label>
            <input
              type="text"
              id="tituloReporte"
              value={tituloReporte}
              onChange={(e) => setTituloReporte(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Ej: Reporte de Enero 2025"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              type="button"
              onClick={() => handlePeriodoChange("semanal")}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Últimos 7 Días
            </button>
            <button
              type="button"
              onClick={() => handlePeriodoChange("mensual")}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Este Mes
            </button>
            <button
              type="button"
              onClick={() => handlePeriodoChange("anual")}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Este Año
            </button>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Generando..." : "Generar Reporte PDF"}
          </button>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>
      </section>

      <section className="report-history-section bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">
          Historial de Reportes Generados
        </h2>
        {reportsHistory.length === 0 ? (
          <p className="text-gray-500">No hay reportes generados aún.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Título
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Periodo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha Generación
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportsHistory.map((report, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(report.generatedAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900 mr-4">
                      Descargar
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Reportes;
