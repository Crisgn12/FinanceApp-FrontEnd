import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CrearAhorro = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    monto_Objetivo: '',
    fecha_Meta: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      const dataToSend = {
        ...formData,
        monto_Objetivo: parseFloat(formData.monto_Objetivo),
        fecha_Meta: new Date(formData.fecha_Meta).toISOString()
      };

      console.log("Datos: ", dataToSend)
      await axios.post('https://localhost:7028/api/Ahorro/crear', dataToSend);
      
      // Redirigir a la tabla de ahorros después de crear
      navigate('/ahorros');
    } catch (err) {
      setError('Error al crear el ahorro. Por favor intenta nuevamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Nuevo Ahorro
            </h1>
            <p className="text-gray-600 text-sm">
              Define tu meta de ahorro y comienza a construir tu futuro
            </p>
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
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="monto_Objetivo"
                  name="monto_Objetivo"
                  value={formData.monto_Objetivo}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                />
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
                onClick={() => navigate('/ahorros')}
                className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
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

export default CrearAhorro;