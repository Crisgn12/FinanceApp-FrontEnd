import React from 'react';

const TablaTransacciones = ({ transacciones, categorias }) => {
  const getCategoriaNombre = (categoriaId) => {
    const categoria = categorias.find((cat) => cat.categoriaID === categoriaId);
    return categoria ? categoria.nombre : 'Sin categoría';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {transacciones.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes transacciones registradas
          </h3>
          <p className="text-gray-600">
            No hay transacciones para mostrar
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Título</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Monto</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Fecha</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Tipo</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-900">Categoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transacciones.slice(0, 10).map((transaccion) => (
                <tr key={transaccion.transaccionId} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{transaccion.titulo}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-600">{formatCurrency(transaccion.monto.toFixed(2))}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-600">{transaccion.fecha.split('T')[0]}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-600">{transaccion.tipo}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-600">{getCategoriaNombre(transaccion.categoriaId)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablaTransacciones;