import React, { useState, useRef } from 'react';
import TablaAhorros from '../components/TablaAhorros';
import CrearAhorroModal from '../components/CrearAhorroModal';

export default function Metas() {
  const [modalOpen, setModalOpen] = useState(false);
  const tablaRef = useRef();

  const handleCreateNew = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleAhorroCreated = () => {
    if (tablaRef.current) {
      tablaRef.current.refreshAhorros();
    }
    console.log('Nuevo ahorro creado y tabla refrescada');
  };

  return (
    <div className="bg-background size-full py-6 px-16">
      <main className="rounded-3xl shadow-md bg-white p-6 max-w-full h-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mis Ahorros
            </h1>
            <p className="text-gray-600">
              Gestiona y monitorea tus metas de ahorro
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Ahorro
          </button>
        </div>

        {/* Tabla de Ahorros Component */}
        <TablaAhorros onCreateNew={handleCreateNew} />

        {/* Modal para crear ahorro */}
        <CrearAhorroModal
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onAhorroCreated={handleAhorroCreated}
        />
      </main>
    </div>
  );
}