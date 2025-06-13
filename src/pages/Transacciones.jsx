import React, { useState, useEffect } from 'react';
import { useTransacciones } from '../hooks/useTransacciones';
import { useCategorias } from '../hooks/useCategorias';
import { Edit, Trash2, Eye } from 'lucide-react';

export default function Transacciones() {
  // Estados para manejar transacciones, categorías, modales, formularios y notificaciones
  const { 
    transacciones, 
    loading, 
    error, 
    fetchTransaccionesPorUsuario, 
    ingresarTransaccion, 
    actualizarTransaccion, 
    eliminarTransaccion 
  } = useTransacciones();
  const { categorias, fetchCategoriasPorUsuario } = useCategorias();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedTransaccion, setSelectedTransaccion] = useState(null);
  const [transaccionToDelete, setTransaccionToDelete] = useState(null);
  const [transaccionToView, setTransaccionToView] = useState(null);
  const [formData, setFormData] = useState({
    categoriaId: '',
    titulo: '',
    descripcion: '',
    monto: '',
    fecha: '',
    tipo: 'Gasto',
  });
  const [formErrors, setFormErrors] = useState({
    titulo: '',
    monto: '',
    fecha: '',
  });
  const [filterData, setFilterData] = useState({
    fechaInicio: '',
    fechaFin: '',
    nombreCategoria: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Cargar transacciones y categorías al montar el componente
  useEffect(() => {
    fetchTransaccionesPorUsuario();
    fetchCategoriasPorUsuario();
  }, [fetchTransaccionesPorUsuario, fetchCategoriasPorUsuario]);

  // Obtener el tipo de transacción (Ingreso/Gasto) según la categoría seleccionada
  const getCategoriaTipo = (categoriaId) => {
    const categoria = categorias.find(cat => cat.categoriaID === parseInt(categoriaId));
    return categoria?.tipo || 'Gasto';
  };

  // Validar los campos del formulario
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validar título no vacío
    if (!formData.titulo.trim()) {
      errors.titulo = 'El título es obligatorio';
      isValid = false;
    }

    // Validar monto mayor a 0
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      errors.monto = 'El monto debe ser mayor a 0';
      isValid = false;
    }

    // Validar que la fecha no sea futura
    if (formData.fecha) {
      const selectedDate = new Date(formData.fecha);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        errors.fecha = 'No se pueden seleccionar fechas futuras';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  // Abrir el modal de creación/edición
  const handleOpenModal = (transaccion = null) => {
    setSelectedTransaccion(transaccion);
    const defaultCategoriaId = categorias.length > 0 ? categorias[0].categoriaID : '';
    const newFormData = transaccion 
      ? { 
          categoriaId: transaccion.categoriaId, 
          titulo: transaccion.titulo, 
          descripcion: transaccion.descripcion || '',
          monto: transaccion.monto,
          fecha: transaccion.fecha.split('T')[0],
          tipo: transaccion.tipo 
        }
      : { 
          categoriaId: defaultCategoriaId, 
          titulo: '', 
          descripcion: '', 
          monto: '', 
          fecha: '', 
          tipo: getCategoriaTipo(defaultCategoriaId)
        };
    setFormData(newFormData);
    setFormErrors({ titulo: '', monto: '', fecha: '' });
    setModalOpen(true);
    setIsCreateModalVisible(true);
  };

  // Cerrar el modal de creación/edición
  const handleCloseModal = () => {
    setIsCreateModalVisible(false);
    setTimeout(() => {
      setModalOpen(false);
      setSelectedTransaccion(null);
      setFormData({
        categoriaId: categorias.length > 0 ? categorias[0].categoriaID : '',
        titulo: '',
        descripcion: '',
        monto: '',
        fecha: '',
        tipo: 'Gasto',
      });
      setFormErrors({ titulo: '', monto: '', fecha: '' });
    }, 300);
  };

  // Abrir el modal de visualización
  const handleOpenViewModal = (transaccion) => {
    setTransaccionToView(transaccion);
    setViewModalOpen(true);
    setIsViewModalVisible(true);
  };

  // Cerrar el modal de visualización
  const handleCloseViewModal = () => {
    setIsViewModalVisible(false);
    setTimeout(() => {
      setViewModalOpen(false);
      setTransaccionToView(null);
    }, 300);
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const transaccionData = {
        categoriaId: parseInt(formData.categoriaId),
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        monto: parseFloat(formData.monto),
        fecha: formData.fecha,
        tipo: formData.tipo,
      };
      if (selectedTransaccion) {
        // Actualizar transacción existente
        const success = await actualizarTransaccion({ 
          ...transaccionData, 
          transaccionId: selectedTransaccion.transaccionId 
        });
        if (success) {
          setNotification({ message: 'Transacción actualizada correctamente', type: 'success' });
        }
      } else {
        // Crear nueva transacción
        const success = await ingresarTransaccion(transaccionData);
        if (success) {
          setNotification({ message: 'Transacción creada correctamente', type: 'success' });
        }
      }
      handleCloseModal();
    } catch (err) {
      setNotification({ message: 'Error al guardar la transacción', type: 'error' });
      console.error('Error al guardar transacción:', err);
    }
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // Abrir el modal de confirmación para eliminación
  const handleOpenConfirmModal = (transaccionId) => {
    setTransaccionToDelete(transaccionId);
    setConfirmModalOpen(true);
    setIsConfirmModalVisible(true);
  };

  // Formatear monto a moneda local
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  // Cerrar el modal de confirmación
  const handleCloseConfirmModal = () => {
    setIsConfirmModalVisible(false);
    setTimeout(() => {
      setConfirmModalOpen(false);
      setTransaccionToDelete(null);
    }, 300);
  };

  // Eliminar transacción
  const handleEliminarTransaccion = async () => {
    try {
      const success = await eliminarTransaccion({ transaccionId: transaccionToDelete });
      if (success) {
        setNotification({ message: 'Transacción eliminada correctamente', type: 'success' });
      }
      handleCloseConfirmModal();
    } catch (err) {
      setNotification({ message: 'Error al eliminar la transacción', type: 'error' });
      console.error('Error al eliminar transacción:', err);
    }
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // Aplicar filtros a las transacciones
  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchTransaccionesPorUsuario(filterData);
    } catch (err) {
      setNotification({ message: 'Error al aplicar filtros', type: 'error' });
      console.error('Error al aplicar filtros:', err);
    }
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilterData({ fechaInicio: '', fechaFin: '', nombreCategoria: '' });
    fetchTransaccionesPorUsuario();
  };

  // Obtener nombre de categoría por ID
  const getCategoriaNombre = (categoriaId) => {
    const categoria = categorias.find((cat) => cat.categoriaID === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  // Mostrar pantalla de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Estilos para animaciones de modales */}
      <style>{`
        .modal-enter {
          opacity: 0;
        }
        .modal-enter-active {
          opacity: 1;
          transition: opacity 300ms ease-in-out;
        }
        .modal-exit {
          opacity: 1;
        }
        .modal-exit-active {
          opacity: 0;
          transition: opacity 300ms ease-in-out;
        }
        .modal-content-enter {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
        }
        .modal-content-enter-active {
          opacity: 1;
          transform: scale(1) translateY(0);
          transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
        }
        .modal-content-exit {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
        .modal-content-exit-active {
          opacity: 0;
          transform: scale(0.95) translateY(-10px);
          transition: opacity 300ms ease-in-out, transform 300ms ease-in-out;
        }
      `}</style>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Notificación */}
          {notification.message && (
            <div className={`mb-6 p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              <p>{notification.message}</p>
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Mis Transacciones
              </h1>
              <p className="text-gray-600">
                Gestiona tus transacciones de ingresos y gastos
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-800 transition-colors duration-200 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Transacción
            </button>
          </div>

          {/* Filtros */}
          <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrar Transacciones</h3>
            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="fechaInicio" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  id="fechaInicio"
                  value={filterData.fechaInicio}
                  onChange={(e) => setFilterData({ ...filterData, fechaInicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label htmlFor="fechaFin" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  id="fechaFin"
                  value={filterData.fechaFin}
                  onChange={(e) => setFilterData({ ...filterData, fechaFin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label htmlFor="nombreCategoria" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  id="nombreCategoria"
                  value={filterData.nombreCategoria}
                  onChange={(e) => setFilterData({ ...filterData, nombreCategoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Todas</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.categoriaID} value={categoria.nombre}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Limpiar Filtros
                </button>
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors duration-200"
                >
                  Aplicar
                </button>
              </div>
            </form>
          </div>

          {/* Mensaje de error general */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Tabla de transacciones */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {transacciones.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tienes transacciones registradas
                </h3>
                <p className="text-gray-600 mb-6">
                  Comienza creando tu primera transacción
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-800 transition-colors duration-200 font-medium"
                >
                  Crear Primera Transacción
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Título</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Monto</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Fecha</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Tipo</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Categoría</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transacciones.map((transaccion) => (
                      <tr key={transaccion.transaccionId} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{transaccion.titulo}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">{formatCurrency(transaccion.monto.toFixed(2))}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">{transaccion.fecha.split('T')[0]}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaccion.tipo === 'Gasto'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {transaccion.tipo}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">{getCategoriaNombre(transaccion.categoriaId)}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleOpenViewModal(transaccion)}
                              className="text-green-600 hover:text-green-800 transition-colors duration-200"
                              title="Ver"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleOpenModal(transaccion)}
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleOpenConfirmModal(transaccion.transaccionId)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                              title="Eliminar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal de creación/edición */}
          {modalOpen && (
            <div 
              className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isCreateModalVisible ? 'modal-enter-active' : 'modal-exit-active'}`}
              onClick={handleCloseModal}
            >
              <div 
                className={`bg-white rounded-lg p-6 max-w-md w-full ${isCreateModalVisible ? 'modal-content-enter-active' : 'modal-content-exit-active'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {selectedTransaccion ? 'Editar Transacción' : 'Nueva Transacción'}
                </h2>
                <form onSubmit={handleSubmit}>
                  {/* Selección de categoría */}
                  <div className="mb-4">
                    <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      id="categoriaId"
                      value={formData.categoriaId}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        categoriaId: e.target.value,
                        tipo: getCategoriaTipo(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.categoriaID} value={categoria.categoriaID}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Campo Tipo (readonly) */}
                  <div className="mb-4">
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <input
                      type="text"
                      id="tipo"
                      value={formData.tipo}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                  {/* Campo Título con validación */}
                  <div className="mb-4">
                    <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      type="text"
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {formErrors.titulo && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.titulo}</p>
                    )}
                  </div>
                  {/* Campo Descripción */}
                  <div className="mb-4">
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      rows={3}
                    />
                  </div>
                  {/* Campo Monto con validación */}
                  <div className="mb-4">
                    <label htmlFor="monto" className="block text-sm font-medium text-gray-700 mb-1">
                      Monto
                    </label>
                    <input
                      type="number"
                      id="monto"
                      value={formData.monto}
                      onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      step="0.01"
                      min="0"
                    />
                    {formErrors.monto && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.monto}</p>
                    )}
                  </div>
                  {/* Campo Fecha con validación */}
                  <div className="mb-4">
                    <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      id="fecha"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    {formErrors.fecha && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.fecha}</p>
                    )}
                  </div>
                  {/* Botones del formulario */}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors duration-200"
                    >
                      {selectedTransaccion ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de visualización */}
          {viewModalOpen && transaccionToView && (
            <div 
              className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isViewModalVisible ? 'modal-enter-active' : 'modal-exit-active'}`}
              onClick={handleCloseViewModal}
            >
              <div 
                className={`bg-white rounded-lg p-6 max-w-md w-full ${isViewModalVisible ? 'modal-content-enter-active' : 'modal-content-exit-active'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Detalles de la Transacción
                </h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <p className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                    {getCategoriaNombre(transaccionToView.categoriaId)}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <p className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                    {transaccionToView.tipo}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título
                  </label>
                  <p className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                    {transaccionToView.titulo}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <p className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 min-h-[80px]">
                    {transaccionToView.descripcion || 'Sin descripción'}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto
                  </label>
                  <p className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                    {formatCurrency(transaccionToView.monto.toFixed(2))}
                  </p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <p className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                    {transaccionToView.fecha.split('T')[0]}
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleCloseViewModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal de confirmación para eliminar */}
          {confirmModalOpen && (
            <div 
              className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${isConfirmModalVisible ? 'modal-enter-active' : 'modal-exit-active'}`}
              onClick={handleCloseConfirmModal}
            >
              <div 
                className={`bg-white rounded-lg p-6 max-w-md w-full ${isConfirmModalVisible ? 'modal-content-enter-active' : 'modal-content-exit-active'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Confirmar Eliminación
                </h2>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que quieres eliminar esta transacción?
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={handleCloseConfirmModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEliminarTransaccion}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}