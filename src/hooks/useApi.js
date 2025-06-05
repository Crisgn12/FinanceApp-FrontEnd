import axios from 'axios';

// URL base para la API
const API_URL = 'https://localhost:7028';
const API_KEY = '12345';

// Configuración base de axios
const baseConfig = {
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ApiKey': API_KEY
  }
};

// Instancia de axios
const api = axios.create(baseConfig);

// Interceptor para agregar el token a las peticiones si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas de error (token expirado, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido - redirigir al login
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRoles');
      window.location.href = '/login';
    }
    
    // Manejar diferentes tipos de error
    let errorMessage = 'Ha ocurrido un error';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors) {
      // Manejar errores de validación de ASP.NET Core
      const errors = error.response.data.errors;
      const errorMessages = [];
      
      Object.keys(errors).forEach(key => {
        if (Array.isArray(errors[key])) {
          errorMessages.push(...errors[key]);
        } else {
          errorMessages.push(errors[key]);
        }
      });
      
      errorMessage = errorMessages.join(', ');
    } else if (error.response?.status === 400) {
      errorMessage = 'Datos inválidos';
    } else if (error.response?.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error.response?.status === 404) {
      errorMessage = 'Recurso no encontrado';
    } else if (error.response?.status === 500) {
      errorMessage = 'Error interno del servidor';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Error de conexión. Verifique su conexión a internet.';
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Función helper para verificar si el usuario está autenticado antes de hacer peticiones
export const isUserAuthenticated = () => {
  const token = localStorage.getItem('token');
  const tokenExpiration = localStorage.getItem('tokenExpiration');
  
  if (!token || !tokenExpiration) {
    return false;
  }
  
  // Verificar si el token ha expirado
  const expirationDate = new Date(tokenExpiration);
  const currentDate = new Date();
  
  if (currentDate >= expirationDate) {
    // Limpiar datos si el token ha expirado
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRoles');
    return false;
  }
  
  return true;
};
// Exportar la instancia para su uso en otros módulos
export { api };
export default api;