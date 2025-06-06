import React, { useRef, useState } from 'react';
import TablaPagosProgramados from '../components/TablaPagosProgramados';
import PagoFormModal from '../components/PagoModal';

export default function Calendario() {
  const tablaPagosRef = useRef();
  const [modalOpen, setModalOpen] = useState(false);

  const handleCreateNew = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handlePagoCreated = () => {
    tablaPagosRef.current?.refreshPagos();
    setModalOpen(false);
  };

  return (
    <div className="size-full py-6 px-12">
      <main>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendario de Pagos</h1>
          <button
            onClick={handleCreateNew}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium"
          >
            + Nuevo Pago Programado
          </button>
        </div>

        <TablaPagosProgramados 
          ref={tablaPagosRef}
          onCreateNew={handleCreateNew}
        />

        {modalOpen && (
          <PagoFormModal
            onClose={handleCloseModal}
            onSuccess={handlePagoCreated}
          />
        )}
      </main>
    </div>
  );
}