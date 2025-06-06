import React, { useState, useEffect } from 'react';
import { useTransacciones } from '../hooks/useTransacciones';
import { useCategorias } from '../hooks/useCategorias';
import { Edit, Trash2 } from 'lucide-react';

export default function Transacciones() {
  const usuarioId = 1; // TODO: Reemplazar por JWT
  const { 
    transacciones, 
    loading, 
    error, 
    fetchTransaccionesPorUsuario, 
    ingresarTransaccion, 
    actualizarTransaccion, 
    eliminarTransaccion 
  } = useTransacciones(usuarioId);
  const { categorias, fetchCategoriasPorUsuario } = useCategorias(usuarioId);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [selectedTransaccion, setSelectedTransaccion] = useState(null);
  const [transaccionToDelete, setTransaccionToDelete] = useState(null);
  const [formData, setFormData] = useState({
    categoriaId: '',
    titulo: '',
    descripcion: '',
    monto: '',
    fecha: '',
    tipo: 'Gasto',
  });
  const [filterData, setFilterData] = useState({
    fechaInicio: '',
    fechaFin: '',
    nombreCategoria: '',
  });
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchTransaccionesPorUsuario();
    fetchCategoriasPorUsuario();
  }, [fetchTransaccionesPorUsuario, fetchCategoriasPorUsuario]);

  const handleOpenModal = (transaccion = null) => {
    setSelectedTransaccion(transaccion);
    setFormData(transaccion 
      ? { 
          categoriaId: transaccion.categoriaId, 
          titulo: transaccion.titulo, 
          descripcion: transaccion.descripcion || '',
          monto: transaccion.monto,
          fecha: transaccion.fecha.split('T')[0], // Formato YYYY-MM-DD
          tipo: transaccion.tipo 
        }
      : { 
          categoriaId: categorias.length > 0 ? categorias[0].categoriaID : '', 
          titulo: '', 
          descripcion: '', 
          monto: '', 
          fecha: '', 
          tipo: 'Gasto' 
        });
    setModalOpen(true);
    setIsCreateModalVisible(true);
  };

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
    }, 300); // Coincide con la duración de la animación
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const transaccionData = {
        usuarioId,
        categoriaId: parseInt(formData.categoriaId),
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        monto: parseFloat(formData.monto),
        fecha: formData.fecha,
        tipo: formData.tipo,
      };
      if (selectedTransaccion) {
        // Actualizar transacción
        const success = await actualizarTransaccion({ 
          ...transaccionData, 
          transaccionId: selectedTransaccion.transaccionId 
        });
        if (success) {
          setNotification({ message: 'Transacción actualizada correctamente', type: 'success' });
        }
      } else {
        // Crear transacción
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

  const handleOpenConfirmModal = (transaccionId) => {
    setTransaccionToDelete(transaccionId);
    setConfirmModalOpen(true);
    setIsConfirmModalVisible(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalVisible(false);
    setTimeout(() => {
      setConfirmModalOpen(false);
      setTransaccionToDelete(null);
    }, 300); // Coincide con la duración de la animación
  };

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

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetchTransaccionesPorUsuario(filterData);
    } catch (err) {
      setNotification({ message: 'Error al aplicar filtros', type: 'error' });
      console.error('Error al aplicar filtros:', err);
    }
  };

  const handleClearFilters = () => {
    setFilterData({ fechaInicio: '', fechaFin: '', nombreCategoria: '' });
    fetchTransaccionesPorUsuario();
  };

  const getCategoriaNombre = (categoriaId) => {
    const categoria = categorias.find((cat) => cat.categoriaID === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  return (
    <>
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
      <div className="min-h-screen bg-gray-50 py-8 px-4">
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

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Tabla */}
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
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-gray-800 transition-colors duration-200 font-medium"
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
                          <span className="text-gray-600">${transaccion.monto.toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">{transaccion.fecha.split('T')[0]}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">{transaccion.tipo}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">{getCategoriaNombre(transaccion.categoriaId)}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-2">
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
                  <div className="mb-4">
                    <label htmlFor="categoriaId" className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      id="categoriaId"
                      value={formData.categoriaId}
                      onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
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
                      required
                    />
                  </div>
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
                      required
                    />
                  </div>
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
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      id="tipo"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="Ingreso">Ingreso</option>
                      <option value="Gasto">Gasto</option>
                    </select>
                  </div>
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