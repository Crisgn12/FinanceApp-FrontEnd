import React, { useState, useCallback, useMemo, useEffect } from 'react';
import api from '../../hooks/useApi';

// Constantes
const FRECUENCIAS = [
  { value: 'UnaVez', label: 'Una vez' },
  { value: 'Diario', label: 'Diario' },
  { value: 'Semanal', label: 'Semanal' },
  { value: 'Mensual', label: 'Mensual' },
  { value: 'Anual', label: 'Anual' }
];

// Componente FormField
const FormField = ({ label, name, type = 'text', required = false, error, children, value, onChange, disabled, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children || (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors duration-200 ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-300'
        }`}
        disabled={disabled}
        {...props}
      />
    )}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Componente ErrorAlert
const ErrorAlert = ({ message }) => (
  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-center">
      <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <p className="text-red-700">{message}</p>
    </div>
  </div>
);

// Componente SuccessAlert
const SuccessAlert = ({ message }) => (
  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
    <div className="flex items-center">
      <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <p className="text-green-700">{message}</p>
    </div>
  </div>
);

// Componente LoadingButton
const LoadingButton = ({ children, loading, disabled, ...props }) => (
  <button
    type="submit"
    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[120px]"
    disabled={loading || disabled}
    {...props}
  >
    {loading ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Guardando...
      </>
    ) : (
      children
    )}
  </button>
);

const PagoEditModal = ({ pago, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    titulo: pago.titulo || '',
    descripcion: pago.descripcion || '',
    monto: pago.monto || '',
    fechaInicio: pago.fechaInicio.split('T')[0] || new Date().toISOString().split('T')[0],
    frecuencia: pago.frecuencia || 'Mensual',
    fechaFin: pago.fechaFin?.split('T')[0] || ''
  });
  const [editAll, setEditAll] = useState(false);
  const [relatedPagos, setRelatedPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (pago.frecuencia !== 'UnaVez') {
      const fetchRelatedPagos = async () => {
        try {
          const response = await api.get(`/api/PagoProgramado/recurring/${pago.pagoId}`);
          setRelatedPagos(response.data);
        } catch (err) {
          console.error('Error al cargar pagos relacionados:', err);
        }
      };
      fetchRelatedPagos();
    }
  }, [pago.pagoId, pago.frecuencia]);

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
    } else if (!editAll) {
      const fechaInicio = new Date(data.fechaInicio);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fechaInicio < hoy) {
        errors.fechaInicio = 'La fecha de inicio no puede ser anterior a hoy';
      }
    }

    if (data.fechaFin) {
      const fechaInicio = new Date(data.fechaInicio);
      const fechaFin = new Date(data.fechaFin);
      if (fechaFin <= fechaInicio) {
        errors.fechaFin = 'La fecha fin debe ser posterior a la fecha de inicio';
      }
    }

    if (data.descripcion.length > 500) {
      errors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    return errors;
  }, [editAll]);

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

    const basePayload = {
      titulo: formData.titulo.trim(),
      descripcion: formData.descripcion.trim() || null,
      monto: parseFloat(formData.monto),
      frecuencia: formData.frecuencia,
      fechaInicio: formData.fechaInicio,
      fechaFin: formData.fechaFin || null,
      estado: pago.estado || 'Pendiente',
      activo: true,
    };

    try {
      if (editAll && pago.frecuencia !== 'UnaVez' && relatedPagos.length > 0) {
        const updatedPagos = relatedPagos.map(relatedPago => ({
          ...basePayload,
          pagoId: relatedPago.pagoId,
          usuarioId: relatedPago.usuarioId || 'default-user-id',
          createdAt: relatedPago.createdAt,
          proximoVencimiento: relatedPago.fechaInicio,
        }));

        await Promise.all(
          updatedPagos.map(payload => api.put(`/api/PagoProgramado/${payload.pagoId}`, payload))
        );
        setSuccess('Pagos recurrentes actualizados correctamente');
      } else {
        const payload = {
          ...basePayload,
          pagoId: pago.pagoId,
          usuarioId: pago.usuarioId || 'default-user-id',
          createdAt: pago.createdAt || new Date().toISOString(),
          proximoVencimiento: formData.fechaInicio,
        };

        await api.put(`/api/PagoProgramado/${pago.pagoId}`, payload);
        setSuccess('Pago actualizado correctamente');
      }

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error al actualizar pagos:', err);
      if (err.response?.status === 400) {
        const serverErrors = err.response.data?.errors || {};
        if (Object.keys(serverErrors).length > 0) {
          setFieldErrors(serverErrors);
        } else {
          setError(err.response.data?.message || 'Datos inválidos');
        }
      } else {
        setError('Error al actualizar los pagos programados. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, pago, relatedPagos, editAll, onSuccess, onClose]);

  const handleClose = useCallback(() => {
    if (!loading) onClose();
  }, [loading, onClose]);

  const handleModalClick = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const isFormValid = useMemo(() => {
    return formData.titulo.trim() &&
           formData.monto &&
           parseFloat(formData.monto) > 0 &&
           formData.fechaInicio &&
           Object.keys(fieldErrors).length === 0;
  }, [formData, fieldErrors]);

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-[9999]"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={handleModalClick}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Editar Pago Programado</h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && <ErrorAlert message={error} />}
          {success && <SuccessAlert message={success} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            {pago.frecuencia !== 'UnaVez' && (
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editAll}
                    onChange={() => setEditAll(prev => !prev)}
                    disabled={loading}
                    className="mr-2 h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Editar todos los pagos de la serie recurrente
                  </span>
                </label>
              </div>
            )}
            <FormField
              label="Título"
              name="titulo"
              required
              error={fieldErrors.titulo}
              value={formData.titulo}
              onChange={handleChange}
              disabled={loading}
              maxLength={100}
            />

            <FormField
              label="Monto"
              name="monto"
              type="number"
              required
              error={fieldErrors.monto}
              value={formData.monto}
              onChange={handleChange}
              disabled={loading}
              step="0.01"
              min="0"
              max="999999999"
            />

            <FormField
              label="Descripción"
              name="descripcion"
              error={fieldErrors.descripcion}
              value={formData.descripcion}
              onChange={handleChange}
              disabled={loading}
            >
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows="3"
                maxLength={500}
                className={`w-full px-3 py-2 border rounded-lg resize-none ${
                  fieldErrors.descripcion ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
                placeholder="Descripción opcional del pago..."
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {formData.descripcion.length}/500
              </div>
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Fecha Inicio"
                name="fechaInicio"
                type="date"
                required
                error={fieldErrors.fechaInicio}
                value={formData.fechaInicio}
                onChange={handleChange}
                disabled={loading || editAll}
                min={new Date().toISOString().split('T')[0]}
              />

              <FormField
                label="Frecuencia"
                name="frecuencia"
                required
                error={fieldErrors.frecuencia}
                value={formData.frecuencia}
                onChange={handleChange}
                disabled={loading || editAll}
              >
                <select
                  name="frecuencia"
                  value={formData.frecuencia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-colors duration-200"
                  disabled={loading || editAll}
                >
                  {FRECUENCIAS.map(frecuencia => (
                    <option key={frecuencia.value} value={frecuencia.value}>
                      {frecuencia.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <FormField
              label="Fecha Fin (opcional)"
              name="fechaFin"
              type="date"
              error={fieldErrors.fechaFin}
              value={formData.fechaFin}
              onChange={handleChange}
              disabled={loading}
              min={formData.fechaInicio || new Date().toISOString().split('T')[0]}
            />

            <div className="flex justify-end pt-4 space-x-3 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <LoadingButton loading={loading} disabled={!isFormValid}>
                Guardar Cambios
              </LoadingButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PagoEditModal);