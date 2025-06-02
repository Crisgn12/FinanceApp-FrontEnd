import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AhorroModal from '../components/AhorroModal';

const TablaAhorros = () => {
  const navigate = useNavigate();
  const [ahorros, setAhorros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAhorro, setSelectedAhorro] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchAhorros();
  }, []);

  const fetchAhorros = async () => {
    try {
      setLoading(true);
      const response = await axios.post('https://localhost:7028/api/Ahorro/obtenerAhorros', {usuarioID: 1 });
      setAhorros(response.data);
    } catch (err) {
      setError('Error al cargar los ahorros');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CR');
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const handleVerMas = (ahorro) => {
    setSelectedAhorro(ahorro);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAhorro(null);
  };

  const handleAhorroUpdated = () => {
    fetchAhorros();
    handleCloseModal();
  };

  const handleAhorroDeleted = () => {
    fetchAhorros();
    handleCloseModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando ahorros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mis Ahorros
            </h1>
            <p className="text-gray-600">
              Gestiona y monitorea tus metas de ahorro
            </p>
          </div>
          <button
            onClick={() => navigate('/crear-ahorro')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Ahorro
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Tabla */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {ahorros.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tienes ahorros registrados
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza creando tu primera meta de ahorro
              </p>
              <button
                onClick={() => navigate('/crear-ahorro')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Crear Primer Ahorro
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Nombre</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Progreso</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Monto Actual</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Meta</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Fecha Meta</th>
                    <th className="text-center py-4 px-6 font-semibold text-gray-900">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ahorros.map((ahorro, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{ahorro.nombre}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(ahorro.porcentajeAvance)}`}
                              style={{ width: `${Math.min(ahorro.porcentajeAvance, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                            {ahorro.porcentajeAvance}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(ahorro.monto_Actual)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">
                          {formatCurrency(ahorro.monto_Objetivo)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">
                          {formatDate(ahorro.fecha_Meta)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleVerMas(ahorro)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        >
                          Ver más
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedAhorro && (
        <AhorroModal
          ahorro={selectedAhorro}
          onClose={handleCloseModal}
          onUpdate={handleAhorroUpdated}
          onDelete={handleAhorroDeleted}
        />
      )}
    </div>
  );
};

export default TablaAhorros;