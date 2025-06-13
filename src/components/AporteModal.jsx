import React, { useState, useEffect } from 'react';
import api from '../hooks/useApi';

const AporteModal = ({ aporte, ahorroId, mode, onClose, onSave, meta, totalAportado, readOnly = false }) => {
  const [formData, setFormData] = useState({
    monto: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modeState, setModeState] = useState(mode);
  const modeActual = readOnly ? 'view' : modeState;
  

  useEffect(() => {
    if (aporte && (modeActual  === 'edit' || modeActual  === 'view')) {
        console.log('Objeto aporte al cargar modal:', aporte);
      setFormData({
        monto: aporte.monto || '',
        observaciones: aporte.observaciones || ''
      });
    } else {
      setFormData({
        monto: '',
        observaciones: ''
      });
    }
  }, [aporte, modeActual ]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
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
  setError('');

  const nuevoMonto = parseFloat(formData.monto);
    if (isNaN(nuevoMonto) || nuevoMonto <= 0) {
    setError('El monto debe ser un número mayor que cero.');
    return;
  }

  const montoActual = aporte?.monto || 0;
  const totalProyectado = totalAportado - montoActual + nuevoMonto;
  const reached100 = totalProyectado >= meta;

  if (totalProyectado > meta) {
    setError(
      `No puedes aportar más de ${formatCurrency(meta)}. ` +
      `Con esto serían ${formatCurrency(totalProyectado)}.`
    );
    return;
  }

  setLoading(true);
  try {
    const submitData = {
      monto: parseFloat(formData.monto),
      observaciones: formData.observaciones,
      metaAhorroId: ahorroId,
      aporteId: aporte?.aporteId || 0
    };

    console.log('Datos a enviar:', submitData);

    if (mode === 'create') {
      const response = await api.post('/api/AporteMetaAhorro/agregar', submitData);
      console.log('Respuesta creación:', response.data);
    } else if (mode === 'edit') {
      const response = await api.post(`/api/AporteMetaAhorro/editar`, submitData);
      console.log('Respuesta edición:', response.data);
    }

    onSave(reached100);
  } catch (err) {
    console.error('Error completo (objeto err):', err);
    if (err.response) {
      console.error('Error respuesta del servidor:', err.response.data);
    }
    setError(mode === 'create' ? 'Error al crear el aporte' : 'Error al actualizar el aporte');
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
    <div className="fixed inset-0 !bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{getModalTitle()}</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-400 transition-colors duration-200"
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

          {modeActual === 'view' ? (
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
            modeActual !== 'view' && !readOnly && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monto (₡) *</label>
                  <input
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    placeholder="Ingrese el monto del aporte"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                  {formData.monto && (
                    <p className="mt-2 text-sm text-green-600 font-medium">{formatCurrency(parseFloat(formData.monto))}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Agregue cualquier comentario sobre este aporte (opcional)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    {getSubmitButtonText()}
                  </button>
                </div>
              </form>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AporteModal;