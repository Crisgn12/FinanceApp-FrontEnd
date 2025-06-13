import React, { useRef, useState, useCallback } from 'react';
import TablaPagosProgramados from '../components/TablaPagosProgramados';
import PagoFormModal from '../components/PagoModal';

const Calendario = () => {
  // Estados
  const [modalOpen, setModalOpen] = useState(false);
  
  // Refs
  const tablaPagosRef = useRef();

  // Handlers memoizados
  const handleCreateNew = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  const handlePagoCreated = useCallback(() => {
    // Refrescar la tabla y cerrar modal
    tablaPagosRef.current?.refreshPagos();
    setModalOpen(false);
  }, []);

  return (
    <div className="size-full py-6 px-12">
      <main className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Calendario de Pagos
          </h1>
          <button
            onClick={handleCreateNew}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium flex items-center space-x-2"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nuevo Pago Programado</span>
          </button>
        </header>

        {/* Contenido principal */}
        <section>
          <TablaPagosProgramados
            ref={tablaPagosRef}
            onCreateNew={handleCreateNew}
          />
        </section>

        {/* Modal */}
        {modalOpen && (
          <PagoFormModal
            onClose={handleCloseModal}
            onSuccess={handlePagoCreated}
          />
        )}
      </main>
    </div>
  );
};

export default Calendario;