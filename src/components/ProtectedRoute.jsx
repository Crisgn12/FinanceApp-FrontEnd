// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../Hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Verificar autenticación
  const authenticated = isAuthenticated();
  
  if (!authenticated) {
    // Guardar la ubicación actual para redirigir después del login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

export default ProtectedRoute;