import React, { useState, useCallback, useMemo } from 'react';
import api from '../../hooks/useApi';

// Constantes
const FRECUENCIAS = [
  { value: 'Diario', label: 'Diario' },
  { value: 'Semanal', label: 'Semanal' },
  { value: 'Mensual', label: 'Mensual' },
  { value: 'Anual', label: 'Anual' }
];

const EditarPagoModal = ({ pago, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titulo: pago.titulo || '',
    descripcion: pago.descripcion || '',
    monto: pago.monto || '',
    fechaInicio: pago.fechaInicio || new Date().toISOString().split('T')[0],
    frecuencia: pago.frecuencia || 'Mensual',
    fechaFin: pago.fechaFin || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // Nuevo estado para mensaje de éxito
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = useCallback((data) => {
    const errors = {};

    if (!data.titulo.trim()) {
      errors.titulo = 'El título es requerido';
    } else if (data.titulo.length > 100) {
      errors.titulo = 'El título no puede exceder 100 caracteres';
    }

    if (!data.monto || parseFloat(data.monto) <= 0) {
      errors.monto = 'El monto debe ser mayor a 0';
    } else if (parseFloat(data.monto) > 999999999) {
      errors.monto = 'El monto es demasiado grande';
    }

    if (!data.fechaInicio) {
      errors.fechaInicio = 'La fecha de inicio es requerida';
    }

    if (data.fechaFin) {
      const inicio = new Date(data.fechaInicio);
      const fin = new Date(data.fechaFin);
      if (fin <= inicio) {
        errors.fechaFin = 'La fecha fin debe ser posterior a la fecha de inicio';
      }
    }

    if (data.descripcion.length > 500) {
      errors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    return errors;
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [fieldErrors]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    const payload = {
      pagoId: pago.pagoId,
      usuarioId: pago.usuarioId || 'default-user-id',
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim() || null,
      monto: parseFloat(formData.monto),
      fechaVencimiento: null,
      estado: pago.estado || 'Pendiente',
      createdAt: pago.createdAt || new Date().toISOString(),
      esProgramado: true,
      frecuencia: formData.frecuencia,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin || null,
      proximoVencimiento: formData.fechaInicio,
      activo: true
    };

    console.log('Payload enviado:', payload);

    try {
      await api.put(`/api/PagoProgramado/${pago.pagoId}`, payload);
      setSuccess('Pago actualizado correctamente'); // Mostrar mensaje de éxito
      setTimeout(() => {
        onSuccess(); // Llama a onSuccess para refrescar datos
        onClose(); // Cierra el modal tras 2 segundos
      }, 2000);
    } catch (err) {
      console.error('Error al actualizar pago:', err.response?.data || err);
      if (err.response?.status === 400) {
        const serverErrors = err.response.data?.errors || {};
        if (Object.keys(serverErrors).length > 0) {
          setFieldErrors(serverErrors);
        } else {
          setError(err.response.data?.message || 'Datos inválidos');
        }
      } else {
        setError('Error al actualizar el pago programado. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, pago, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);

  const isFormValid = useMemo(() => {
    return formData.titulo.trim() &&
           formData.monto &&
           parseFloat(formData.monto) > 0 &&
           formData.fechaInicio &&
           Object.keys(fieldErrors).length === 0;
  }, [formData, fieldErrors]);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-[9999]" onClick={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Editar Pago Programado</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100" disabled={loading}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
          {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                maxLength={100}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg ${fieldErrors.titulo ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              />
              {fieldErrors.titulo && <p className="mt-1 text-sm text-red-600">{fieldErrors.titulo}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Monto <span className="text-red-500">*</span>
              </label>
              <input
                name="monto"
                type="number"
                value={formData.monto}
                onChange={handleChange}
                step="0.01"
                min="0"
                max="999999999"
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg ${fieldErrors.monto ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              />
              {fieldErrors.monto && <p className="mt-1 text-sm text-red-600">{fieldErrors.monto}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
                maxLength={500}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg ${fieldErrors.descripcion ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              />
              {fieldErrors.descripcion && <p className="mt-1 text-sm text-red-600">{fieldErrors.descripcion}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fecha Inicio <span className="text-red-500">*</span>
                </label>
                <input
                  name="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg ${fieldErrors.fechaInicio ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                />
                {fieldErrors.fechaInicio && <p className="mt-1 text-sm text-red-600">{fieldErrors.fechaInicio}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Frecuencia</label>
                <select
                  name="frecuencia"
                  value={formData.frecuencia}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {FRECUENCIAS.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha Fin (opcional)</label>
              <input
                name="fechaFin"
                type="date"
                value={formData.fechaFin}
                onChange={handleChange}
                disabled={loading}
                min={formData.fechaInicio}
                className={`w-full px-3 py-2 border rounded-lg ${fieldErrors.fechaFin ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
              />
              {fieldErrors.fechaFin && <p className="mt-1 text-sm text-red-600">{fieldErrors.fechaFin}</p>}
            </div>

            <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center justify-center disabled:opacity-50"
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-b-2 border-white mr-2 rounded-full"></div>
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditarPagoModal;