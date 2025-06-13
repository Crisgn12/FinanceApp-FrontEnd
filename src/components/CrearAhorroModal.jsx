import React, { useState } from 'react';
import api from '../hooks/useApi';

const validateAhorro = ({ nombre, monto_Objetivo, fecha_Meta }) => {
  if (!nombre.trim()) {
    return 'El nombre del ahorro es obligatorio.';
  }
  const montoNum = parseFloat(monto_Objetivo);
  if (isNaN(montoNum) || montoNum <= 0) {
    return 'El monto objetivo debe ser un número mayor que cero.';
  }
  const selectedDate = new Date(fecha_Meta);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return 'La fecha meta debe ser igual o posterior a hoy.';
  }
  return null;
};

const CrearAhorroModal = ({ isOpen, onClose, onAhorroCreated }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    monto_Objetivo: '',
    fecha_Meta: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({
      nombre: '',
      monto_Objetivo: '',
      fecha_Meta: ''
    });
    setError('');
  };

    const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

    const validationError = validateAhorro(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        monto_Objetivo: parseFloat(formData.monto_Objetivo),
        fecha_Meta: new Date(formData.fecha_Meta).toISOString()
      };
      
      console.log("Datos: ", dataToSend);
      await api.post('api/Ahorro/crear', dataToSend);
      
      // Notificar al componente padre que se creó el ahorro
      if (onAhorroCreated) {
        onAhorroCreated();
      }
      
      handleClose();
    } catch (err) {
      setError('Error al crear el ahorro. Por favor intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header con botón de cerrar */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Nuevo Ahorro
              </h1>
              <p className="text-gray-600 text-sm">
                Define tu meta de ahorro y comienza a construir tu futuro
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors mt-[-3.5rem]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del ahorro
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Vacaciones, Auto nuevo, Casa..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>

            <div>
              <label htmlFor="monto_Objetivo" className="block text-sm font-medium text-gray-700 mb-2">
                Monto objetivo
              </label>
              <div className="relative">
                <label className="absolute left-4 top-1/5 transform -translate-y-1/9 text-gray-500">
                   ₡
                </label>
                <input
                  type="text"
                  id="monto_Objetivo"
                  name="monto_Objetivo"
                  value={formData.monto_Objetivo}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {formData.monto_Objetivo && (
                  <p className="mt-2 text-sm text-green-600 font-medium">
                    {formatCurrency(parseFloat(formData.monto_Objetivo) || 0)}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="fecha_Meta" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha meta
              </label>
              <input
                type="date"
                id="fecha_Meta"
                name="fecha_Meta"
                value={formData.fecha_Meta}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
              >
                {loading ? 'Creando...' : 'Crear Ahorro'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CrearAhorroModal;