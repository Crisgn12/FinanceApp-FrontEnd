import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import api from '../hooks/useApi';
import PagoModal from './PagoModal';

const TablaPagosProgramados = forwardRef(({ onCreateNew }, ref) => {
  const [pagos, setPagos] = useState([]);
  const [proximosPagos, setProximosPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPago, setSelectedPago] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('todos');

  useEffect(() => {
    fetchPagos();
  }, []);

  const fetchPagos = async () => {
    try {
      setLoading(true);
      const [responseTodos, responseProximos] = await Promise.all([
        api.get('/api/PagoProgramado/usuario'),
        api.get('/api/PagoProgramado/proximos/usuario')
      ]);
      setPagos(responseTodos.data);
      setProximosPagos(responseProximos.data);
    } catch (err) {
      setError('Error al cargar los pagos programados');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useImperativeHandle(ref, () => ({
    refreshPagos: fetchPagos
  }));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CR');
  };

  const getStatusColor = (activo) => {
    return activo
      ? 'text-green-500'   
      : 'text-gray-400';
  };

  const handleVerMas = (pago) => {
    setSelectedPago(pago);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPago(null);
  };

  const handlePagoUpdated = (pagoActualizado) => {
    setPagos(prev =>
      prev.map(p =>
        p.pagoId === pagoActualizado.pagoId
          ? pagoActualizado
          : p
      )
    );
    handleCloseModal();
  };

  const handlePagoDeleted = (pagoId) => {
    setPagos(prev => prev.filter(p => p.pagoId !== pagoId));
    setProximosPagos(prev => prev.filter(p => p.pagoId !== pagoId));
    handleCloseModal();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pagos programados...</p>
        </div>
      </div>
    );
  }

  const displayedPagos = activeTab === 'todos' ? pagos : proximosPagos;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex border-b border-gray-200">
        <button
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'todos' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('todos')}
        >
          Todos los Pagos
        </button>
        <button
          className={`py-3 px-6 font-medium text-sm ${activeTab === 'proximos' ? 'text-black border-b-2 border-black' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('proximos')}
        >
          Próximos Pagos
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {displayedPagos.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'todos' ? 'No tienes pagos programados' : 'No hay pagos próximos'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'todos' 
                ? 'Comienza creando tu primer pago programado' 
                : 'Todos tus pagos están al día o no tienes programados'}
            </p>
            {activeTab === 'todos' && (
              <button
                onClick={onCreateNew}
                className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
              >
                Crear Pago Programado
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Título</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Descripción</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Monto</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Fecha de Pago</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Frecuencia</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Estado</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayedPagos.map((pago, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6 max-w-[150px]">
                      <div className="font-medium text-gray-900 break-words">{pago.titulo}</div>
                    </td>
                    <td className="py-4 px-6 max-w-[200px]">
                      <div className="text-gray-600 break-words">{pago.descripcion}</div>
                    </td>
                    <td className="text-center py-4 px-6">
                      <span className="font-medium text-gray-900">
                        {formatCurrency(pago.monto)}
                      </span>
                    </td>
                    <td className="text-center py-4 px-6">
                      <span className="text-gray-600">
                        {formatDate(pago.proximoVencimiento || pago.fechaVencimiento)}
                      </span>
                    </td>
                    <td className="text-center py-4 px-6">
                      <span className="text-gray-600 capitalize">
                        {pago.frecuencia.toLowerCase()}
                      </span>
                    </td>
                    <td className="text-center py-4 px-6">
                      <span className={`text-xl ${getStatusColor(pago.activo)}`}>
                        ●
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleVerMas(pago)}
                          className="p-2 text-blue-600 hover:text-blue-800 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handlePagoDeleted(pago.pagoId)}
                          className="p-2 text-red-600 hover:text-red-800 transition-colors"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
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

      {modalOpen && selectedPago && (
        <PagoModal
          pago={selectedPago}
          onClose={handleCloseModal}
          onUpdate={handlePagoUpdated}
          onDelete={handlePagoDeleted}
        />
      )}
    </div>
  );
});

export default TablaPagosProgramados;