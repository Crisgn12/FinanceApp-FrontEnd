import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AporteModal = ({ aporte, ahorroId, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fecha: '',
    monto: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (aporte && (mode === 'edit' || mode === 'view')) {
      setFormData({
        fecha: aporte.fecha ? new Date(aporte.fecha).toISOString().slice(0, 16) : '',
        monto: aporte.monto || '',
        observaciones: aporte.observaciones || ''
      });
    } else {
      // Para nuevo aporte, establecer fecha actual
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setFormData({
        fecha: now.toISOString().slice(0, 16),
        monto: '',
        observaciones: ''
      });
    }
  }, [aporte, mode]);

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        fecha: new Date(formData.fecha).toISOString(),
        monto: parseFloat(formData.monto),
        observaciones: formData.observaciones,
        metaAhorroId: ahorroId
      };

      if (mode === 'create') {
        await axios.post('https://localhost:7028/api/AporteMetaAhorro/agregar', submitData);
      } else if (mode === 'edit') {
        await axios.put(`https://localhost:7028/api/AporteMetaAhorro/${aporte.id}`, submitData);
      }

      onSave();
    } catch (err) {
      setError(mode === 'create' ? 'Error al crear el aporte' : 'Error al actualizar el aporte');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'create': return 'Nuevo Aporte';
      case 'edit': return 'Editar Aporte';
      case 'view': return 'Detalles del Aporte';
      default: return 'Aporte';
    }
  };

  const getSubmitButtonText = () => {
    if (loading) return mode === 'create' ? 'Creando...' : 'Actualizando...';
    return mode === 'create' ? 'Crear Aporte' : 'Actualizar Aporte';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{getModalTitle()}</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {mode === 'view' ? (
            // Vista de solo lectura
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Aporte
                </label>
                <p className="text-gray-900 font-medium">
                  {aporte ? formatDate(aporte.fecha) : 'N/A'}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto
                </label>
                <p className="text-2xl font-bold text-green-600">
                  {aporte ? formatCurrency(aporte.monto) : 'N/A'}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <p className="text-gray-900">
                  {aporte?.observaciones || 'Sin observaciones'}
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            // Formulario para crear/editar
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha del Aporte *
                </label>
                <input
                  type="datetime-local"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto (₡) *
                </label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                  placeholder="Ingrese el monto del aporte"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {formData.monto && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    {formatCurrency(parseFloat(formData.monto) || 0)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Agregue cualquier comentario sobre este aporte (opcional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {getSubmitButtonText()}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AporteModal;