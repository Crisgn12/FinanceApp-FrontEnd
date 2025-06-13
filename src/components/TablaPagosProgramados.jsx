import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import api from '../hooks/useApi';
import PagoModal from './PagoModal';
import TabNavigation from './ComponentesTablaPagos/TabNavigation';
import ViewToggle from './ComponentesTablaPagos/ViewToggle';
import TableView from './ComponentesTablaPagos/TableView';
import CalendarView from './ComponentesTablaPagos/CalendarView';
import LoadingSpinner from './ComponentesTablaPagos/LoadingSpinner';
import ErrorMessage from './ComponentesTablaPagos/ErrorMessage';

// Constantes
const TABS = {
  TODOS: 'todos',
  PROXIMOS: 'proximos',
  PASADOS: 'pasados',
  PENDIENTES: 'pendientes'
};

const VIEWS = {
  TABLE: 'table',
  CALENDAR: 'calendar'
};

const ESTADOS = {
  PENDIENTE: 'Pendiente',
  PAGADO: 'Pagado',
  VENCIDO: 'Vencido'
};

const TablaPagosProgramados = forwardRef(({ onCreateNew }, ref) => {
  console.log('🔥 Iniciando componente TablaPagosProgramados');

  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPago, setSelectedPago] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS.TODOS);
  const [currentView, setCurrentView] = useState(VIEWS.TABLE);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('es-CR');
  }, []);

  const getStatusColor = useCallback((estado) => {
    switch (estado) {
      case ESTADOS.PAGADO:
        return 'text-green-500';
      case ESTADOS.PENDIENTE:
        return 'text-yellow-500';
      case ESTADOS.VENCIDO:
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  }, []);

  const isPagoVencido = useCallback((pago) => {
    if (pago.estado === ESTADOS.VENCIDO) return true;
    if (pago.estado === ESTADOS.PAGADO) return false;
    const fechaVencimiento = new Date(pago.proximoVencimiento || pago.fechaVencimiento);
    const hoy = new Date();
    fechaVencimiento.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    return fechaVencimiento < hoy;
  }, []);

  const isPagoProximo = useCallback((pago) => {
    if (pago.estado !== ESTADOS.PENDIENTE) return false;
    const fechaVencimiento = new Date(pago.proximoVencimiento || pago.fechaVencimiento);
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);
    fechaVencimiento.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    en30Dias.setHours(0, 0, 0, 0);
    return fechaVencimiento >= hoy && fechaVencimiento <= en30Dias;
  }, []);

  const pagosPasados = useMemo(() => {
    return pagos.filter(pago => pago.estado === ESTADOS.VENCIDO || isPagoVencido(pago));
  }, [pagos, isPagoVencido]);

  const proximosPagos = useMemo(() => {
    return pagos.filter(pago => isPagoProximo(pago));
  }, [pagos, isPagoProximo]);

  const pagosPendientes = useMemo(() => {
    return pagos.filter(pago => pago.estado === ESTADOS.PENDIENTE);
  }, [pagos]);

  const displayedPagos = useMemo(() => {
    switch (activeTab) {
      case TABS.TODOS:
        return pagos;
      case TABS.PROXIMOS:
        return proximosPagos;
      case TABS.PASADOS:
        return pagosPasados;
      case TABS.PENDIENTES:
        return pagosPendientes;
      default:
        return pagos;
    }
  }, [activeTab, pagos, proximosPagos, pagosPasados, pagosPendientes]);

  const transformPagosToEvents = useCallback((pagosList) => {
    return pagosList.map(pago => {
      const fechaVencimiento = new Date(pago.proximoVencimiento || pago.fechaVencimiento);
      let backgroundColor, borderColor;
      switch (pago.estado) {
        case ESTADOS.PAGADO:
          backgroundColor = '#10b981';
          borderColor = '#059669';
          break;
        case ESTADOS.PENDIENTE:
          backgroundColor = '#f59e0b';
          borderColor = '#d97706';
          break;
        case ESTADOS.VENCIDO:
          backgroundColor = '#ef4444';
          borderColor = '#dc2626';
          break;
        default:
          if (isPagoVencido(pago)) {
            backgroundColor = '#ef4444';
            borderColor = '#dc2626';
          } else {
            backgroundColor = '#6b7280';
            borderColor = '#4b5563';
          }
      }
      return {
        id: pago.pagoId?.toString() || Math.random().toString(),
        title: pago.titulo,
        date: fechaVencimiento.toISOString().split('T')[0],
        backgroundColor,
        borderColor,
        textColor: '#ffffff',
        extendedProps: { pago, monto: pago.monto, descripcion: pago.descripcion, frecuencia: pago.frecuencia, estado: pago.estado, isVencido: isPagoVencido(pago) }
      };
    });
  }, [isPagoVencido]);

  const calendarEvents = useMemo(() => transformPagosToEvents(displayedPagos), [displayedPagos, transformPagosToEvents]);

  const fetchPagos = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('📡 Obteniendo todos los pagos programados...');
      const response = await api.get('/api/PagoProgramado/usuario');
      const pagosNormalizados = (response.data || []).map(pago => {
        let estadoNormalizado = ESTADOS.PENDIENTE;
        if (pago.estado) {
          switch (pago.estado.toLowerCase()) {
            case 'pagado':
            case 'completado':
            case 'activo':
              estadoNormalizado = ESTADOS.PAGADO;
              break;
            case 'vencido':
            case 'cancelado':
              estadoNormalizado = ESTADOS.VENCIDO;
              break;
            default:
              estadoNormalizado = ESTADOS.PENDIENTE;
              break;
          }
        } else if (pago.activo !== undefined) {
          estadoNormalizado = pago.activo ? ESTADOS.PAGADO : ESTADOS.PENDIENTE;
        }
        return {
          ...pago,
          estado: estadoNormalizado,
          activo: estadoNormalizado === ESTADOS.PAGADO,
          fechaVencimiento: pago.fechaVencimiento || pago.Fecha_Vencimiento,
          proximoVencimiento: pago.proximoVencimiento || pago.ProximoVencimiento,
          pagoId: pago.pagoId || pago.PagoId,
          titulo: pago.titulo || pago.Titulo,
          descripcion: pago.descripcion || pago.Descripcion,
          monto: pago.monto || pago.Monto,
          frecuencia: pago.frecuencia || pago.Frecuencia
        };
      });
      console.log('✅ Pagos normalizados:', pagosNormalizados.length);
      setPagos(pagosNormalizados);
    } catch (err) {
      console.error('❌ Error al cargar pagos:', err);
      setError(err.response?.data?.message || 'Error al cargar los pagos programados');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVerMas = useCallback((pago) => {
    setSelectedPago(pago);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedPago(null);
  }, []);

  const handlePagoUpdated = useCallback(() => {
    fetchPagos(); // Recarga todos los datos desde el servidor
    handleCloseModal();
  }, [fetchPagos, handleCloseModal]);

  const handlePagoDeleted = useCallback((pagoId) => {
    setPagos(prevPagos => prevPagos.filter(pago => pago.pagoId !== pagoId));
    handleCloseModal();
  }, [handleCloseModal]);

  const handleEstadoChange = useCallback(async (pagoId, nuevoEstado) => {
    const timestamp = new Date().toISOString();
    const pagoActual = pagos.find(p => p.pagoId === pagoId);
    const usuarioId = pagoActual?.usuarioId || localStorage.getItem('usuarioId');

    if (!usuarioId) {
      console.error("❌ No se pudo determinar el usuarioId para la petición.");
      return;
    }

    try {
      console.log(`📡 Enviando petición put:`, { url: `/api/PagoProgramado/${pagoId}/estado`, method: 'put', body: { pagoId, usuarioId, estado: nuevoEstado }, timestamp });
      await api.put(`/api/PagoProgramado/${pagoId}/estado`, { pagoId, usuarioId, estado: nuevoEstado }, { headers: { 'Content-Type': 'application/json' } });
      console.log(`✅ Estado cambiado exitosamente:`, { pagoId, pagoTitulo: pagoActual?.titulo, estadoFinal: nuevoEstado, timestamp });
      fetchPagos(); // Recarga datos tras cambio de estado
    } catch (err) {
      console.error(`❌ Error al cambiar estado:`, { pagoId, pagoTitulo: pagoActual?.titulo, estadoIntentado: nuevoEstado, error: err.response?.data || err.message, timestamp });
      throw err;
    }
  }, [pagos, fetchPagos]);

  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);
  const handleViewChange = useCallback((view) => setCurrentView(view), []);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  useEffect(() => {
    console.log('📊 Estadísticas de pagos:', {
      total: pagos.length,
      pendientes: pagosPendientes.length,
      proximos: proximosPagos.length,
      pasados: pagosPasados.length
    });
  }, [pagos, proximosPagos, pagosPasados, pagosPendientes]);

  useImperativeHandle(ref, () => ({ refreshPagos: fetchPagos }), [fetchPagos]);

  const emptyStateConfig = useMemo(() => {
    switch (activeTab) {
      case TABS.TODOS:
        return { title: 'No tienes pagos programados', description: 'Comienza creando tu primer pago programado', showButton: true };
      case TABS.PROXIMOS:
        return { title: 'No hay pagos próximos', description: 'No tienes pagos programados para los próximos 30 días', showButton: false };
      case TABS.PASADOS:
        return { title: 'No hay pagos vencidos', description: 'Todos tus pagos están al día', showButton: false };
      case TABS.PENDIENTES:
        return { title: 'No hay pagos pendientes', description: 'No tienes pagos con estado pendiente', showButton: false };
      default:
        return { title: 'No tienes pagos programados', description: 'Comienza creando tu primer pago programado', showButton: true };
    }
  }, [activeTab]);

  const commonProps = {
    displayedPagos,
    emptyStateConfig,
    onCreateNew,
    formatCurrency,
    formatDate,
    getStatusColor,
    isPagoVencido,
    handleVerMas,
    handlePagoDeleted,
    onEstadoChange: handleEstadoChange
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} />}
      <div className="flex justify-between items-center">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
          tabs={TABS}
          counts={{ todos: pagos.length, proximos: proximosPagos.length, pasados: pagosPasados.length, pendientes: pagosPendientes.length }}
        />
        <ViewToggle currentView={currentView} onViewChange={handleViewChange} views={VIEWS} />
      </div>
      {currentView === VIEWS.TABLE ? (
        <TableView {...commonProps} />
      ) : (
        <CalendarView {...commonProps} calendarEvents={calendarEvents} />
      )}
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

TablaPagosProgramados.displayName = 'TablaPagosProgramados';

export default TablaPagosProgramados;