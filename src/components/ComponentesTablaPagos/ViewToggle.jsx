import React from 'react';

const ViewToggle = ({ currentView, onViewChange, views }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          currentView === views.TABLE
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => onViewChange(views.TABLE)}
      >
        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Tabla
      </button>
      <button
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
          currentView === views.CALENDAR
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => onViewChange(views.CALENDAR)}
      >
        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Calendario
      </button>
    </div>
  );
};

export default ViewToggle;