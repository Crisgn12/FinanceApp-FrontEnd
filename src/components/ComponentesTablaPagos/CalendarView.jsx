import React, { useEffect, useRef, useCallback, useState } from 'react';
import EmptyState from './EmptyState';
import api from '../../hooks/useApi';

const CalendarView = ({ 
  displayedPagos, 
  emptyStateConfig, 
  onCreateNew, 
  calendarEvents, 
  handleVerMas, 
  formatCurrency,
  handleStatusChange
}) => {
  const calendarRef = useRef(null);
  const calendarInstanceRef = useRef(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Función para cambiar estado del pago
  const togglePagoStatus = async (pagoId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.patch(`/api/PagoProgramado/${pagoId}/estado`, newStatus, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Notificar al componente padre
      if (handleStatusChange) {
        handleStatusChange(pagoId, newStatus);
      }

      // Cerrar menú contextual
      setShowContextMenu(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error al cambiar estado del pago:', error);
    }
  };

  // Función para cargar FullCalendar
  const loadFullCalendar = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.FullCalendar) {
        resolve();
        return;
      }

      // Cargar CSS primero
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.8/index.min.css';
      document.head.appendChild(cssLink);

      // Cargar JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.8/index.global.min.js';
      script.onload = () => {
        // Cargar localización en español
        const localeScript = document.createElement('script');
        localeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/6.1.8/locales/es.global.min.js';
        localeScript.onload = () => resolve();
        localeScript.onerror = () => {
          console.warn('No se pudo cargar la localización en español, usando inglés');
          resolve();
        };
        document.head.appendChild(localeScript);
      };
      script.onerror = () => reject(new Error('Error al cargar FullCalendar'));
      document.head.appendChild(script);
    });
  }, []);

  // Función para inicializar el calendario
  const initializeCalendar = useCallback(async () => {
    if (!calendarRef.current) return;

    try {
      await loadFullCalendar();
      
      // Destruir instancia anterior si existe
      if (calendarInstanceRef.current) {
        calendarInstanceRef.current.destroy();
      }

      const calendar = new window.FullCalendar.Calendar(calendarRef.current, {
        initialView: 'dayGridMonth',
        locale: 'es',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        buttonText: {
          today: 'Hoy',
          month: 'Mes',
          week: 'Semana',
          list: 'Lista'
        },
        events: calendarEvents,
        eventClick: function(info) {
          const pago = info.event.extendedProps.pago;
          if (handleVerMas && pago) {
            handleVerMas(pago);
          }
        },
        // Agregar menú contextual con clic derecho
        eventMouseDown: function(info) {
          if (info.jsEvent.button === 2) { // Clic derecho
            info.jsEvent.preventDefault();
            const pago = info.event.extendedProps.pago;
            setSelectedEvent({ event: info.event, pago });
            setContextMenuPosition({
              x: info.jsEvent.pageX,
              y: info.jsEvent.pageY
            });
            setShowContextMenu(true);
          }
        },
        eventDidMount: function(info) {
          const { pago, monto, isVencido } = info.event.extendedProps;
          const statusText = pago.activo ? 'ACTIVO' : 'INACTIVO';
          const title = `${pago.titulo} - ${formatCurrency(monto)} (${statusText})${isVencido ? ' - VENCIDO' : ''}`;
          info.el.setAttribute('title', title);
          
          // Agregar clases CSS para estados
          if (isVencido) {
            info.el.classList.add('pago-vencido');
          }
          if (!pago.activo) {
            info.el.classList.add('pago-inactivo');
          }

          // Agregar listener para menú contextual
          info.el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
          });
        },
        height: 'auto',
        dayMaxEvents: 3,
        moreLinkClick: 'popover',
        eventMouseEnter: function(info) {
          const { pago, monto, descripcion, isVencido } = info.event.extendedProps;
          // Aquí podrías agregar un tooltip personalizado si lo deseas
        },
        firstDay: 1, // Comenzar semana en lunes
        weekends: true,
        eventDisplay: 'block',
        displayEventTime: false
      });

      calendar.render();
      calendarInstanceRef.current = calendar;

    } catch (error) {
      console.error('Error inicializando el calendario:', error);
    }
  }, [calendarEvents, handleVerMas, formatCurrency, loadFullCalendar]);

  // Cerrar menú contextual al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      setShowContextMenu(false);
      setSelectedEvent(null);
    };

    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);

  // Efecto para inicializar el calendario
  useEffect(() => {
    if (displayedPagos.length > 0) {
      initializeCalendar();
    }

    // Cleanup
    return () => {
      if (calendarInstanceRef.current) {
        calendarInstanceRef.current.destroy();
        calendarInstanceRef.current = null;
      }
    };
  }, [initializeCalendar, displayedPagos.length]);

  // Efecto para actualizar eventos cuando cambien
  useEffect(() => {
    if (calendarInstanceRef.current && calendarEvents) {
      calendarInstanceRef.current.removeAllEvents();
      calendarInstanceRef.current.addEventSource(calendarEvents);
    }
  }, [calendarEvents]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
      {displayedPagos.length === 0 ? (
        <EmptyState 
          title={emptyStateConfig.title}
          description={emptyStateConfig.description}
          showButton={emptyStateConfig.showButton}
          onCreateNew={onCreateNew}
        />
      ) : (
        <div className="p-6">
          <style jsx>{`
            .pago-vencido {
              animation: pulse 2s infinite;
              border-left: 4px solid #ef4444 !important;
            }
            .pago-inactivo {
              opacity: 0.6;
              filter: grayscale(50%);
            }
            .pago-inactivo .fc-event-title {
              text-decoration: line-through;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}</style>
          <div ref={calendarRef} className="w-full"></div>
          
          {/* Menú Contextual */}
          {showContextMenu && selectedEvent && (
            <div
              className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
              style={{
                left: contextMenuPosition.x,
                top: contextMenuPosition.y,
                minWidth: '200px'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                onClick={() => handleVerMas(selectedEvent.pago)}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Detalles
              </button>
              
              <hr className="my-1" />
              
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                onClick={() => togglePagoStatus(selectedEvent.pago.pagoId, selectedEvent.pago.activo)}
              >
                {selectedEvent.pago.activo ? (
                  <>
                    <svg className="w-4 h-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636" />
                    </svg>
                    Desactivar Pago
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Activar Pago
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;