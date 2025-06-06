import axios from 'axios';

// URL base para la API de autenticación
const AUTH_API_URL = 'https://localhost:7028/api/Auth';
const API_KEY = '12345';

// Configuración base de axios para autenticación
const authConfig = {
  baseURL: AUTH_API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ApiKey': API_KEY
  }
};

// Instancia de axios para autenticación
const authApi = axios.create(authConfig);

// Interceptor para agregar el token a las peticiones si existe
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Token siendo enviado:', token);
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
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      logout();
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
    } else if (error.response?.status === 500) {
      errorMessage = 'Error interno del servidor';
    } else if (error.message === 'Network Error') {
      errorMessage = 'Error de conexión. Verifique su conexión a internet.';
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

// Función para registrar usuario
export const registerUser = async (userData) => {
  try {
    const response = await authApi.post('/register', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Función para iniciar sesión
export const loginUser = async (credentials) => {
  try {
    const response = await authApi.post('/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Función para cerrar sesión
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRoles');
};

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const tokenExpiration = localStorage.getItem('tokenExpiration');
  
  if (!token || !tokenExpiration) {
    return false;
  }
  
  // Verificar si el token ha expirado
  const expirationDate = new Date(tokenExpiration);
  const currentDate = new Date();
  
  if (currentDate >= expirationDate) {
    logout(); // Limpiar datos si el token ha expirado
    return false;
  }
  
  return true;
};

// Función para obtener el nombre de usuario actual
export const getCurrentUser = () => {
  if (!isAuthenticated()) {
    return null;
  }
  
  return {
    userName: localStorage.getItem('userName'),
    roles: JSON.parse(localStorage.getItem('userRoles') || '[]'),
    token: localStorage.getItem('token'),
    tokenExpiration: localStorage.getItem('tokenExpiration')
  };
};

// Función para verificar si el usuario tiene un rol específico
export const hasRole = (role) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.roles.includes(role);
};

// Función para renovar el token (si tu API lo soporta)
export const renewToken = async () => {
  try {
    const response = await authApi.post('/refresh-token');
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token.token);
      localStorage.setItem('tokenExpiration', response.data.token.expiration);
      return true;
    }
    
    return false;
  } catch (error) {
    logout();
    return false;
  }
};

// Hook personalizado para manejar el estado de autenticación
export const useAuth = () => {
  const checkAuth = () => isAuthenticated();
  const getUser = () => getCurrentUser();
  const signOut = () => {
    logout();
    window.location.href = '/login';
  };
  
  return {
    isAuthenticated: checkAuth,
    user: getUser(),
    logout: signOut,
    hasRole
  };
};

// Exportar la instancia de axios para uso en otros módulos si es necesario
export { authApi };
export default authApi;