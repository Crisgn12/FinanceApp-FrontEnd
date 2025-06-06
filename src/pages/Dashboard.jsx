import React, { useEffect } from 'react';
import InfoCard from "../components/InfoCard";
import CardIngresos from "../components/CardIngresos";
import CardGastos from "../components/CardGastos";
import TablaTransacciones from "../components/TablaTransacciones";
import { useTransacciones } from '../hooks/useTransacciones';
import { useCategorias } from '../hooks/useCategorias';

export default function Dashboard() {
  const { transacciones, loading, fetchTransaccionesPorUsuario } = useTransacciones();
  const { categorias, fetchCategoriasPorUsuario } = useCategorias();

  useEffect(() => {
    fetchTransaccionesPorUsuario();
    fetchCategoriasPorUsuario();
  }, [fetchTransaccionesPorUsuario, fetchCategoriasPorUsuario]);

  return (
    <div className="bg-background size-full py-6 px-16">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-1">
          <InfoCard />
        </div>
        <div className="col-span-1">
          <CardIngresos />
        </div>
        <div className="col-span-1">
          <CardGastos />
        </div>
      </div>

      <div className="grid grid-cols-3 grid-rows-5 gap-4">
        <div className="col-span-2 row-span-2 rounded-3xl shadow-md bg-white p-6">
          1
        </div>
        <div className="row-span-2 col-start-3 rounded-3xl shadow-md bg-white p-6">
          2
        </div>
        <div className="col-span-3 row-span-2 row-start-3 rounded-3xl shadow-md bg-white p-6">
          <h2 className='mb-4 font-bold text-xl'>Últimas transacciones</h2>
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando transacciones...</p>
            </div>
          ) : (
            <TablaTransacciones transacciones={transacciones} categorias={categorias} />
          )}
        </div>
      </div>
    </div>
  );
}