import React from 'react';

const ActionButton = ({ onClick, title, icon, colorClass }) => (
  <button
    onClick={onClick}
    className={`p-2 ${colorClass} transition-colors duration-200 hover:bg-gray-100 rounded-md`}
    title={title}
  >
    {icon}
  </button>
);

export default ActionButton;