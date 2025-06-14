import React, { useState } from 'react';
import api from '../hooks/useApi';

const AhorroModal = ({ ahorro, onClose, onUpdate, onDelete, readOnly = false }) => {
  const [mode, setMode] = useState('view'); // 'view', 'edit', 'delete'
  const modeActual = readOnly ? 'view' : mode;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    nombre: ahorro.nombre,
    monto_Objetivo: ahorro.monto_Objetivo,
    fecha_Meta: ahorro.fecha_Meta.split('T')[0] 
  });

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError('');

    // 1) Nombre obligatorio
    if (!formData.nombre.trim()) {
      setError('El nombre del ahorro es obligatorio.');
      setLoading(false);
      return;
    }

    // 2) Fecha mínima: hoy
    const selectedDate = new Date(formData.fecha_Meta);
    const today = new Date(); today.setHours(0,0,0,0);
    if (selectedDate < today) {
      setError('La fecha meta debe ser igual o posterior a hoy.');
      setLoading(false);
      return;
    }

    // 3) Monto objetivo > 0 y >= ahorrado
   const nuevoObjetivo = parseFloat(formData.monto_Objetivo);
   const ahorrado = ahorro.monto_Actual;

     if (isNaN(nuevoObjetivo) || nuevoObjetivo <= 0) {
      setError('El monto objetivo debe ser un número mayor que cero.');
      setLoading(false);
      return;
    }
   if (nuevoObjetivo < ahorrado) {
     setError(
       `El monto objetivo no puede ser menor que lo ya ahorrado (${formatCurrency(ahorrado)}).`
     );
     setLoading(false);
     return;
   }

    try {
      const dataToSend = {
        ahorroID: ahorro?.ahorroID,        
        ...formData,
        monto_Objetivo: parseFloat(formData.monto_Objetivo),
        fecha_Meta: new Date(formData.fecha_Meta).toISOString()
      };
      console.log('Datos enviados:', dataToSend);

      const response = await api.post(`/api/Ahorro/actualizar`, dataToSend);
      onUpdate(response.data);
    } catch (err) {
      setError('Error al actualizar el ahorro');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
      ahorroID: ahorro?.ahorroID
    };

    await api.post('/api/Ahorro/eliminar', dataToSend);
    onDelete();
    } catch (err) {
      setError('Error al eliminar el ahorro');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderViewMode = () => (
    <div className="space-y-6">
      <div className="text-center border-b border-gray-100 pb-6 max-w-[800px]">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 break-words">{ahorro.nombre}</h2>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
          <span>Meta: {formatDate(ahorro.fecha_Meta)}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <div className="text-center mb-4">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {ahorro.porcentajeAvance.toFixed(0)}%
          </div>
          <p className="text-gray-600">Progreso actual</p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(ahorro.porcentajeAvance)}`}
            style={{ width: `${Math.min(ahorro.porcentajeAvance, 100)}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {formatCurrency(ahorro.monto_Actual)}
            </div>
            <div className="text-gray-600">Ahorrado</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {formatCurrency(ahorro.monto_Objetivo - ahorro.monto_Actual)}
            </div>
            <div className="text-gray-600">Restante</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {formatCurrency(ahorro.monto_Objetivo)}
            </div>
            <div className="text-gray-600">Meta</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {/* Solo mostrar botones si no es readOnly */}
        {!readOnly && (
          <>
            <button
              onClick={() => setMode('edit')}
              className="flex-1 bg-blue-400 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Editar
            </button>
            <button
              onClick={() => setMode('delete')}
              className="flex-1 bg-red-400 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              Eliminar
            </button>
          </>
        )}
      </div>
    </div>
  );

  const renderEditMode = () => (
    <div className="space-y-6">
      {/* Si es solo lectura, nunca entrar en modo edit */}
      {readOnly && <p className="text-center text-gray-500">Solo lectura</p>}

      <div className="text-center border-b border-gray-100 pb-4">
        <h2 className="text-xl font-bold text-gray-900">Editar Ahorro</h2>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del ahorro
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto objetivo
          </label>
                        <div className="relative">
                <label className="absolute left-4 top-1/3 transform -translate-y-1/2 text-gray-500">
                   ₡
                </label>
                <input
                  type="number"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha meta
          </label>
          <input
            type="date"
            name="fecha_Meta"
            value={formData.fecha_Meta}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
          />
        </div>
      </form>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setMode('view')}
          className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="flex-1 py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </div>
  );

  const renderDeleteMode = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          ¿Eliminar ahorro?
        </h2>
        <p className="text-gray-600 mb-6 max-w-[600px]">
          Esta acción no se puede deshacer. Se eliminará permanentemente el ahorro 
          <span className="font-semibold text-gray-900 break-words"> "{ahorro.nombre}"</span> y toda su información.

        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setMode('view')}
          className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          {loading ? 'Eliminando...' : 'Eliminar'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 !bg-black/40  flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"> 
        <div className="p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {modeActual === 'view' && renderViewMode()}
          {modeActual === 'edit' && renderEditMode()}
          {modeActual === 'delete' && renderDeleteMode()}
        </div>
      </div>
    </div>
  );
};

export default AhorroModal;