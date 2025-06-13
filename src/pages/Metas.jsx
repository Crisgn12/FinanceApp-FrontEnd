import React, { useState, useRef, useEffect  } from 'react';
import TablaAhorros from '../components/TablaAhorros';
import CrearAhorroModal from '../components/CrearAhorroModal';
import Confetti from 'react-confetti';

export default function Metas() {
  const [modalOpen, setModalOpen] = useState(false);
  const tablaRef = useRef();
  const [tab, setTab] = useState('activos');
  const [showConfetti, setShowConfetti] = useState(false);

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
    setModalOpen(false);
    console.log('Nuevo ahorro creado y tabla refrescada');
  };

  const handleAporteFlag = (reached100) => {
   // refrescar la lista de ahorros
   if (tablaRef.current) tablaRef.current.refreshAhorros();
   if (reached100) {
     setTab('historial');          // redirige a Historial
     setShowConfetti(true);        // enciende confeti
   }
 };

  // Apaga el confeti tras 5s
  useEffect(() => {
   if (showConfetti) {
     const id = setTimeout(() => setShowConfetti(false), 5000);
     return () => clearTimeout(id);
   }
 }, [showConfetti]);

  return (
    <div className="bg-background size-full py-2 px-4">
      <main className="rounded-3xl p-6 max-w-full h-full">
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
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Ahorro
          </button>
        </div>

        {/* ─────────── Nav de pestañas ─────────── */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setTab('activos')}
            className={`py-3 px-6 font-medium text-sm ${
              tab === 'activos'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Ahorros
          </button>
          <button
            onClick={() => setTab('historial')}
            className={`py-3 px-6 font-medium text-sm ${
              tab === 'historial'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Historial
          </button>
        </div>

        {/* ─────────── Tab Content ─────────── */}
        {tab === 'activos' && (
          <TablaAhorros
            ref={tablaRef}
            onCreateNew={handleCreateNew}
            filter={a => a.porcentajeAvance < 100}
            readOnly={false}
            onSave={handleAporteFlag}
          />
        )}
        {tab === 'historial' && (
          <TablaAhorros
            filter={a => a.porcentajeAvance >= 100}
            readOnly={true}
            onSave={handleAporteFlag}
          />
        )}

        {showConfetti && <Confetti />}

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