import React from 'react';
import EmptyState from './EmptyState';
import PagoRow from './PagoRow';

const TableView = ({ 
  displayedPagos, 
  emptyStateConfig, 
  onCreateNew, 
  formatCurrency,
  formatDate,
  getStatusColor,
  isPagoVencido,
  handleVerMas,
  handlePagoDeleted,
  onEstadoChange
}) => {
  // Console log para debuggear los datos que llegan al componente
  console.log('📋 TableView - Datos recibidos:', {
    totalPagos: displayedPagos.length,
    pagos: displayedPagos.map(p => ({
      id: p.pagoId,
      titulo: p.titulo,
      monto: p.monto,
      estado: p.estado,
      fechaVencimiento: p.proximoVencimiento || p.fechaVencimiento
    })),
    emptyStateConfig
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {displayedPagos.length === 0 ? (
        <>
          {console.log('📋 TableView - Mostrando estado vacío:', emptyStateConfig)}
          <EmptyState 
            title={emptyStateConfig.title}
            description={emptyStateConfig.description}
            showButton={emptyStateConfig.showButton}
            onCreateNew={onCreateNew}
          />
        </>
      ) : (
        <div className="overflow-x-auto">
          {console.log('📋 TableView - Renderizando tabla con', displayedPagos.length, 'pagos')}
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
              {displayedPagos.map((pago, index) => {
                console.log(`📋 TableView - Renderizando fila ${index + 1}:`, {
                  pagoId: pago.pagoId,
                  titulo: pago.titulo,
                  monto: pago.monto,
                  estadoActual: pago.estado,
                  fechaVencimiento: pago.proximoVencimiento || pago.fechaVencimiento,
                  esVencido: isPagoVencido(pago)
                });
                
                return (
                  <PagoRow 
                    key={pago.pagoId || index} 
                    pago={pago} 
                    index={index}
                    formatCurrency={formatCurrency}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    isPagoVencido={isPagoVencido}
                    onVerMas={handleVerMas}
                    onDelete={handlePagoDeleted}
                    onEstadoChange={onEstadoChange}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TableView;