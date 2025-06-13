import React from 'react';

const ErrorMessage = ({ message }) => (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
    <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p className="text-red-700">{message}</p>
  </div>
);

export default ErrorMessage;