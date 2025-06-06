import React, { useState, useEffect } from 'react';
import { useCategorias } from '../hooks/useCategorias';
import { Edit, Trash2 } from 'lucide-react';

export default function Categorias() {
  const usuarioID = 1; // TODO: Reemplazar por JWT
  const { 
    categorias, 
    loading, 
    error, 
    fetchCategoriasPorUsuario, 
    crearCategoria, 
    actualizarCategoria, 
    eliminarCategoria 
  } = useCategorias(usuarioID);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [categoriaToDelete, setCategoriaToDelete] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', tipo: 'Ingreso', esPredeterminada: false });
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    fetchCategoriasPorUsuario();
  }, [fetchCategoriasPorUsuario]);

  const handleOpenModal = (categoria = null) => {
    setSelectedCategoria(categoria);
    setFormData(categoria 
      ? { nombre: categoria.nombre, tipo: categoria.tipo, esPredeterminada: categoria.esPredeterminada }
      : { nombre: '', tipo: 'Ingreso', esPredeterminada: false });
    setModalOpen(true);
    setIsCreateModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalVisible(false);
    setTimeout(() => {
      setModalOpen(false);
      setSelectedCategoria(null);
      setFormData({ nombre: '', tipo: 'Ingreso', esPredeterminada: false });
    }, 300); // Coincide con la duración de la animación
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const categoriaData = { ...formData, usuarioID };
      if (selectedCategoria) {
        // Actualizar categoría
        const success = await actualizarCategoria({ ...categoriaData, categoriaID: selectedCategoria.categoriaID });
        if (success) {
          setNotification({ message: 'Categoría actualizada correctamente', type: 'success' });
        }
      } else {
        // Crear categoría
        const success = await crearCategoria(categoriaData);
        if (success) {
          setNotification({ message: 'Categoría creada correctamente', type: 'success' });
        }
      }
      handleCloseModal();
      // La lista se refresca en useCategorias.js
    } catch (err) {
      setNotification({ message: 'Error al guardar la categoría', type: 'error' });
      console.error('Error al guardar categoría:', err);
    }
    // Limpiar notificación después de 3 segundos
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const handleOpenConfirmModal = (categoriaID) => {
    setCategoriaToDelete(categoriaID);
    setConfirmModalOpen(true);
    setIsConfirmModalVisible(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalVisible(false);
    setTimeout(() => {
      setConfirmModalOpen(false);
      setCategoriaToDelete(null);
    }, 300); // Coincide con la duración de la animación
  };

  const handleEliminarCategoria = async () => {
    try {
      const success = await eliminarCategoria({ categoriaID: categoriaToDelete, usuarioID });
      if (success) {
        setNotification({ message: 'Categoría eliminada correctamente', type: 'success' });
      }
      handleCloseConfirmModal();
    } catch (err) {
      setNotification({ message: 'Error al eliminar la categoría', type: 'error' });
      console.error('Error al eliminar categoría:', err);
    }
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando categorías...</p>
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
                Mis Categorías
              </h1>
              <p className="text-gray-600">
                Gestiona tus categorías de ingresos y gastos
              </p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-800 transition-colors duration-200 font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Categoría
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Tabla */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {categorias.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tienes categorías registradas
                </h3>
                <p className="text-gray-600 mb-6">
                  Comienza creando tu primera categoría
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="bg-black text-white px-6 py-3 rounded-2xl hover:bg-gray-800 transition-colors duration-200 font-medium"
                >
                  Crear Primera Categoría
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Nombre</th>
                      <th className="text-left py-4 px-6 font-semibold text-gray-900">Tipo</th>
                      <th className="text-center py-4 px-6 font-semibold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categorias.map((categoria) => (
                      <tr key={categoria.categoriaID} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{categoria.nombre}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-gray-600">{categoria.tipo}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleOpenModal(categoria)}
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            {!categoria.esPredeterminada && (
                              <button
                                onClick={() => handleOpenConfirmModal(categoria.categoriaID)}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                                title="Eliminar"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
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
                  {selectedCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
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
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      {selectedCategoria ? 'Actualizar' : 'Crear'}
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
                  ¿Estás seguro de que quieres eliminar esta categoría?
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
                    onClick={handleEliminarCategoria}
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