import React from 'react';

const TabButton = ({ tab, label, isActive, onClick, count }) => (
  <button
    className={`py-3 px-6 font-medium text-sm transition-colors duration-200 relative ${
      isActive 
        ? 'text-black border-b-2 border-black' 
        : 'text-gray-500 hover:text-gray-700'
    }`}
    onClick={() => onClick(tab)}
  >
    {label}
    {count > 0 && (
      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
        tab === 'pasados' 
          ? 'bg-red-100 text-red-700' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {count}
      </span>
    )}
  </button>
);

const TabNavigation = ({ activeTab, onTabChange, tabs, counts }) => {
  return (
    <div className="flex border-b border-gray-200">
      <TabButton
        tab={tabs.TODOS}
        label="Todos los Pagos"
        isActive={activeTab === tabs.TODOS}
        onClick={onTabChange}
        count={counts.todos}
      />
      <TabButton
        tab={tabs.PROXIMOS}
        label="Próximos Pagos"
        isActive={activeTab === tabs.PROXIMOS}
        onClick={onTabChange}
        count={counts.proximos}
      />
      <TabButton
        tab={tabs.PASADOS}
        label="Pagos Vencidos"
        isActive={activeTab === tabs.PASADOS}
        onClick={onTabChange}
        count={counts.pasados}
      />
    </div>
  );
};

export default TabNavigation;