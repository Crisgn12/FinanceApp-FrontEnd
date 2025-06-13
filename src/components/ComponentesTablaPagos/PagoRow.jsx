import React, { useState, useEffect } from 'react';
import ActionButton from './ActionButton';
import EditarPagoModal from './PagoEditModal';
import api from '../../hooks/useApi';

const PagoRow = ({
  pago,
  index,
  formatCurrency,
  formatDate,
  getStatusColor,
  isPagoVencido,
  onVerMas,
  onDelete,
  onEstadoChange
}) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ESTADOS = {
    VENCIDO: 'Vencido',
    PAGADO: 'Pagado',
    PENDIENTE: 'Pendiente'
  };

  const getEstadoInicial = (pago) => {
    if (typeof pago.estado === 'string') {
      const estadoNormalizado = pago.estado.toLowerCase();
      if (estadoNormalizado === 'vencido') return ESTADOS.VENCIDO;
      if (estadoNormalizado === 'pagado' || estadoNormalizado === 'completado' || estadoNormalizado === 'activo') return ESTADOS.PAGADO;
      if (estadoNormalizado === 'pendiente' || estadoNormalizado === 'inactivo') return ESTADOS.PENDIENTE;
      return pago.estado;
    }
    if (pago.estado === true || pago.Estado === 'Activo' || pago.Activo === 1) return ESTADOS.PAGADO;
    if (pago.estado === false || pago.Estado === 'Inactivo' || pago.Activo === 0) return ESTADOS.PENDIENTE;
    return ESTADOS.PENDIENTE;
  };

  const [currentEstado, setCurrentEstado] = useState(() => getEstadoInicial(pago));

  const isVencido = isPagoVencido(pago);

  useEffect(() => {
    const nuevoEstado = getEstadoInicial(pago);
    console.log(`🔄 PagoRow ${pago.pagoId} - Sincronizando estado:`, {
      estadoAnterior: currentEstado,
      nuevoEstado,
      pagoTitulo: pago.titulo,
      pagoCompleto: pago
    });
    setCurrentEstado(nuevoEstado);
  }, [pago, currentEstado]);

  const handleEstadoChange = async (nuevoEstado) => {
    console.log(`🔄 PagoRow ${pago.pagoId} - Iniciando cambio de estado:`, {
      pagoTitulo: pago.titulo,
      estadoActual: currentEstado,
      nuevoEstado,
      timestamp: new Date().toISOString()
    });
    setIsChangingStatus(true);
    try {
      await onEstadoChange(pago.pagoId, nuevoEstado);
      console.log(`✅ PagoRow ${pago.pagoId} - Estado cambiado exitosamente:`, {
        pagoTitulo: pago.titulo,
        estadoFinal: nuevoEstado,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`❌ PagoRow ${pago.pagoId} - Error al cambiar estado:`, {
        pagoTitulo: pago.titulo,
        estadoIntentado: nuevoEstado,
        error: error.message,
        errorCompleto: error,
        timestamp: new Date().toISOString()
      });
      setCurrentEstado(pago.estado);
    } finally {
      setIsChangingStatus(false);
      console.log(`🏁 PagoRow ${pago.pagoId} - Finalizando cambio de estado`, {
        pagoTitulo: pago.titulo,
        estadoFinal: currentEstado,
        timestamp: new Date().toISOString()
      });
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case ESTADOS.PAGADO:
        return 'text-green-600 bg-green-50 border-green-200';
      case ESTADOS.PENDIENTE:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case ESTADOS.VENCIDO:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getEstadoText = (estado) => {
    switch (estado) {
      case ESTADOS.PAGADO:
        return 'Pagado';
      case ESTADOS.PENDIENTE:
        return 'Pendiente';
      case ESTADOS.VENCIDO:
        return 'Vencido';
      default:
        return estado || 'Desconocido';
    }
  };

  const handleOpenModal = () => {
    console.log(`✏️ PagoRow ${pago.pagoId} - Abriendo modal de edición:`, {
      pagoTitulo: pago.titulo,
      timestamp: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log(`🔳 PagoRow ${pago.pagoId} - Cerrando modal de edición:`, {
      pagoTitulo: pago.titulo,
      timestamp: new Date().toISOString()
    });
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    console.log(`✅ PagoRow ${pago.pagoId} - Pago editado exitosamente:`, {
      pagoTitulo: pago.titulo,
      timestamp: new Date().toISOString()
    });
    setIsModalOpen(false);
    onEstadoChange(pago.pagoId, currentEstado);
  };

  const handleDelete = async () => {
  console.log(`🗑️ PagoRow ${pago.pagoId} - Iniciando eliminación:`, {
    pagoTitulo: pago.titulo,
    timestamp: new Date().toISOString()
  });

  const confirmed = window.confirm(`¿Estás seguro de que deseas eliminar el pago "${pago.titulo}"? Esta acción no se puede deshacer.`);
  if (!confirmed) {
    console.log(`🚫 PagoRow ${pago.pagoId} - Eliminación cancelada por el usuario:`, {
      pagoTitulo: pago.titulo,
      timestamp: new Date().toISOString()
    });
    return;
  }

  try {
    const usuarioId = pago.usuarioId || localStorage.getItem('usuarioId');
    if (!usuarioId) {
      throw new Error('No se encontró el usuarioId');
    }
    await api.delete(`/api/PagoProgramado/${pago.pagoId}/usuario`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        PagoId: pago.pagoId,
        UsuarioId: usuarioId
      }
    });
    console.log(`✅ PagoRow ${pago.pagoId} - Pago eliminado exitosamente:`, {
      pagoTitulo: pago.titulo,
      timestamp: new Date().toISOString()
    });
    onDelete(pago.pagoId);
  } catch (error) {
    console.error(`❌ PagoRow ${pago.pagoId} - Error al eliminar pago:`, {
      pagoTitulo: pago.titulo,
      error: error.message,
      status: error.response?.status,
      responseData: error.response?.data,
      timestamp: new Date().toISOString()
    });
    alert(`Error al eliminar el pago: ${error.response?.data?.message || 'No se pudo eliminar el pago. Inténtalo de nuevo.'}`);
  }
};

  console.log(`🎨 PagoRow ${pago.pagoId} - Renderizando:`, {
    titulo: pago.titulo,
    monto: pago.monto,
    estado: currentEstado,
    esVencido: isVencido,
    esCambiandoEstado: isChangingStatus,
    fechaVencimiento: pago.proximoVencimiento || pago.fechaVencimiento
  });

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors duration-150">
        <td className="py-4 px-6 max-w-[150px]">
          <div className={`font-medium break-words ${isVencido ? 'text-red-900' : 'text-gray-900'}`}>
            {pago.titulo}
            {isVencido && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                Vencido
              </span>
            )}
          </div>
        </td>
        <td className="py-4 px-6 max-w-[200px]">
          <div className="text-gray-600 break-words">{pago.descripcion || '-'}</div>
        </td>
        <td className="text-center py-4 px-6">
          <span className={`font-medium ${isVencido ? 'text-red-900' : 'text-gray-900'}`}>
            {formatCurrency(pago.monto)}
          </span>
        </td>
        <td className="text-center py-4 px-6">
          <span className={`${isVencido ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            {formatDate(pago.proximoVencimiento || pago.fechaVencimiento)}
          </span>
        </td>
        <td className="text-center py-4 px-6">
          <span className="text-gray-600 capitalize">
            {pago.frecuencia?.toLowerCase() || '-'}
          </span>
        </td>
        <td className="text-center py-4 px-6">
          <div className="relative">
            <select
              value={currentEstado}
              onChange={(e) => {
                const nuevoValor = e.target.value;
                console.log(`🎯 PagoRow ${pago.pagoId} - Select onChange:`, {
                  valorSeleccionado: nuevoValor,
                  estadoAnterior: currentEstado
                });
                handleEstadoChange(nuevoValor);
              }}
              disabled={isChangingStatus}
              className={`
                appearance-none bg-white border rounded-md px-3 py-1 pr-8 text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
                ${getEstadoColor(currentEstado)}
                ${isChangingStatus ? 'cursor-wait' : 'cursor-pointer'}
              `}
            >
              <option value={ESTADOS.PENDIENTE} className="text-yellow-600">
                {getEstadoText(ESTADOS.PENDIENTE)}
              </option>
              <option value={ESTADOS.PAGADO} className="text-green-600">
                {getEstadoText(ESTADOS.PAGADO)}
              </option>
              <option value={ESTADOS.VENCIDO} className="text-red-600">
                {getEstadoText(ESTADOS.VENCIDO)}
              </option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              {isChangingStatus ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                  {console.log(`⏳ PagoRow ${pago.pagoId} - Mostrando spinner de carga`)}
                </>
              ) : (
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </div>
          </div>
        </td>
        <td className="py-4 px-6 text-center">
          <div className="flex items-center justify-center space-x-2">
            <ActionButton
              onClick={handleOpenModal}
              title="Editar"
              colorClass="text-yellow-600 hover:text-yellow-800"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            />
            <ActionButton
              onClick={handleDelete}
              title="Eliminar"
              colorClass="text-red-600 hover:text-red-800"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              }
            />
          </div>
        </td>
      </tr>
      {isModalOpen && (
        <EditarPagoModal
          pago={pago}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};

export default PagoRow;