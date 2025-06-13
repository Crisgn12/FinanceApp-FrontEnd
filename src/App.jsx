import React, { useState, useEffect } from "react";
import { Outlet, Navigate, BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/sidebar"
import NavigationBar from "./components/NavigationBar"
import Dashboard from "./pages/Dashboard"
import Transacciones from "./pages/Transacciones"
import Calendario from "./pages/Calendario"
import Metas from "./pages/Metas"
import Categorias from "./pages/Categorias"
import Reportes from "./pages/Reportes"
import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';
import { isAuthenticated } from './hooks/useAuth';
import Layout from "./components/templates/Layout"
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  const [authenticated, setAuthenticated] = useState(null);

  // Verificar autenticación solo al montar el componente
  useEffect(() => {
    const checkAuth = () => {
      try {
        const authStatus = isAuthenticated();
        setAuthenticated(authStatus);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthenticated(false);
      }
    };

    // Solo verificar autenticación una vez al cargar la app
    if (authenticated === null) {
      checkAuth();
    }
  }, []);

    // Componente para rutas públicas (login, signup)
    // eslint-disable-next-line no-unused-vars
  const PublicRoute = ({ children }) => {
    if (authenticated === null) {
      return <LoadingScreen />;
    }

    if (authenticated) {
      return <Navigate to="/" replace />;
    }

    return <Outlet /> ;
  };

   // Componente de loading mejorado
  const LoadingScreen = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div>Verificando autenticación...</div>
      </div>
    </div>
  );

   // Componente wrapper para rutas protegidas que incluye el layout
  const ProtectedRouteWithLayout = () => (
    <ProtectedRoute>
      <Layout>
        <Outlet />
      </Layout>
    </ProtectedRoute>
  );

  // Mostrar loading mientras se verifica la autenticación
  if (authenticated === null) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas (login, signup) */}
         <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
         </Route>
        
        {/* Rutas protegidas con layout */}
        <Route element={<ProtectedRouteWithLayout />}> 
          <Route path="/" element={<Dashboard />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Transacciones" element={<Transacciones />} />
          <Route path="/Calendario" element={<Calendario />} />
          <Route path="/Metas" element={<Metas />} />
          <Route path="/Categorias" element={<Categorias />} />
          <Route path="/Reportes" element={<Reportes />} />
        </Route>

        {/* Ruta por defecto */}
      <Route
        path="*"
        element={
          authenticated ?
            <Navigate to="/" replace /> :
            <Navigate to="/login" replace />
        }
      />
      </Routes>
    </BrowserRouter>
  )
}

export default App
