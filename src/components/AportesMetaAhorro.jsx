import React, { useState, useEffect } from 'react';
import api from '../hooks/useApi';
import AporteModal from './AporteModal';

const AportesMetaAhorro = ({ ahorroId, ahorroNombre, ahorroMeta, onClose, onSave, readOnly = false  }) => {
  const [aportes, setAportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAporte, setSelectedAporte] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [aporteToDelete, setAporteToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAportes();
  }, [ahorroId]);

  console.log("ID enviado al backend:", ahorroId);

  const fetchAportes = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/AporteMetaAhorro/porMeta', {
        metaAhorroId: ahorroId
      });
      setAportes(response.data);
    } catch (err) {
      setError('Error al cargar los aportes');
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
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const handleCreate = () => {
    setSelectedAporte(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleView = (aporte) => {
    setSelectedAporte(aporte);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleEdit = (aporte) => {
    setSelectedAporte(aporte);
    setModalMode('edit');
    setModalOpen(true);
  };

  const promptDelete = (aporte) => {
    setAporteToDelete(aporte);
    setError('');
  };

  const handleConfirmDelete = async () => {
    if (!aporteToDelete) return;
    setDeleting(true);
    setError('');

    try {
      // El backend espera { AporteId: <número> } en el body
      await api.post('/api/AporteMetaAhorro/eliminar', {
        AporteId: aporteToDelete.aporteId
      });

      // Después de borrar, recargamos la lista y cerramos el modal de confirmación
      await fetchAportes();
      setAporteToDelete(null);
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('Error al eliminar el aporte');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setAporteToDelete(null);
    setError('');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedAporte(null);
  };

  const handleAporteUpdated = () => {
    fetchAportes();
    handleCloseModal();
  };

  const getTotalAportes = () => {
    return aportes.reduce((total, aporte) => total + aporte.monto, 0);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando aportes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (aporteToDelete) {
      return (
        <div className="fixed inset-0 !bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    ¿Eliminar aporte?
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Esta acción no se puede deshacer. Se eliminará permanentemente el aporte del{' '}
                    <span className="font-semibold text-gray-900">
                      {formatDate(aporteToDelete.fecha)}
                    </span>{' '}
                    por{' '}
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(aporteToDelete.monto)}
                    </span>
                    .
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelDelete}
                    disabled={deleting}
                    className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={deleting}
                    className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                  >
                    {deleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

  return (
    <div className="fixed inset-0 !bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Aportes de Ahorro</h2>
              <h3 className="text-white-100 mt-2">{ahorroNombre}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-500 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-400 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-green-600 text-sm font-medium">Total Aportado</p>
                  <p className="text-2xl font-bold text-green-800">{formatCurrency(getTotalAportes())}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-400 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-blue-600 text-sm font-medium">Total Aportes</p>
                  <p className="text-2xl font-bold text-blue-800">{aportes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="flex items-center">
                <div className="p-3 bg-purple-400 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-purple-600 text-sm font-medium">Promedio por Aporte</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {aportes.length > 0 ? formatCurrency(getTotalAportes() / aportes.length) : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/*

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-gray-200 to-gray-300 p-6 rounded-xl border border-gray-400">
              <div className="flex items-center">
                <div className="p-3 bg-gray-500 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-600 text-sm font-medium">Total Aportado</p>
                  <p className="text-2xl font-bold text-gray-600">{formatCurrency(getTotalAportes())}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6 rounded-xl border border-gray-600">
              <div className="flex items-center">
                <div className="p-3 bg-gray-800 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-gray-800 text-sm font-medium">Total Aportes</p>
                  <p className="text-2xl font-bold text-gray-800">{aportes.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-6 rounded-xl border border-black">
              <div className="flex items-center">
                <div className="p-3 bg-black rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-black text-sm font-medium">Promedio por Aporte</p>
                  <p className="text-2xl font-bold text-black">
                    {aportes.length > 0 ? formatCurrency(getTotalAportes() / aportes.length) : formatCurrency(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          */}

          {/* Action Button */}
          {/* Nuevo Aporte solo si no es readOnly */}
          {!readOnly && (
            <div className="mb-6">
              <button
                onClick={handleCreate}
                className="bg-black text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Aporte
              </button>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {aportes.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hay aportes registrados
                </h3>
                <p className="text-gray-600 mb-6">
                  Comienza agregando tu primer aporte a esta meta de ahorro
                </p>
                <button
                  onClick={handleCreate}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
                >
                  Crear Primer Aporte
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Fecha</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Monto</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Observaciones</th>
                      {!readOnly && (
                        <th className="text-center py-4 px-6 font-semibold text-gray-900">Acciones</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {aportes.map((aporte, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div className="text-gray-900 font-medium">
                            {formatDate(aporte.fecha)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-green-600 text-lg">
                            {formatCurrency(aporte.monto)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">
                            {aporte.observaciones || 'Sin observaciones'}
                          </span>
                        </td>
                        {!readOnly && (
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">                       
                              <button
                                onClick={() => handleEdit(aporte)}
                                className="bg-yellow-50 text-yellow-600 p-2 rounded-lg hover:bg-yellow-100 transition-colors duration-200"
                                title="Editar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => promptDelete(aporte)}
                                className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors duration-200"
                                title="Eliminar"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <AporteModal
          aporte={selectedAporte}
          ahorroId={ahorroId}
          mode={readOnly ? 'view' : modalMode}
          onClose={handleCloseModal}
          onSave={(reached100) => {
            // 1) Refresca los aportes/cierra el modal
            handleAporteUpdated();
            // 2) Si vino del padre (Metas.jsx), propaga el flag
            if (onSave) onSave(reached100);
          }}
          meta={ahorroMeta}
          totalAportado={getTotalAportes()}
          readOnly={readOnly}
        />
      )}
    </div>
  );
};

export default AportesMetaAhorro;