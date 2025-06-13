import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Lock, 
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'react-feather';
import { loginUser } from '../../Hooks/useAuth.js';

// InputField component defined outside to prevent focus loss
const InputField = ({ label, name, type, icon: Icon, placeholder, showToggle, toggleShow, isPassword, value, onChange, disabled, error, isValid }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type={isPassword && showToggle ? 'text' : type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full pl-12 pr-${showToggle ? '12' : '4'} py-4 border-2 rounded-2xl focus:outline-none transition-colors duration-200 text-gray-900 placeholder-gray-400 disabled:bg-gray-50
          ${error ? 'border-red-500 focus:border-red-500' : isValid ? 'border-green-500 focus:border-green-500' : 'border-gray-200 focus:border-blue-500'}`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={toggleShow}
          className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-2xl transition-colors duration-200"
        >
          {showToggle ? (
            <EyeOff className="w-5 h-5 text-gray-400" />
          ) : (
            <Eye className="w-5 h-5 text-gray-400" />
          )}
        </button>
      )}
    </div>
    {error && (
      <div className="mt-1 flex items-center gap-1 text-red-600 text-xs">
        <AlertCircle className="w-4 h-4" />
        <span>{error}</span>
      </div>
    )}
    {isValid && !error && (
      <div className="mt-1 flex items-center gap-1 text-green-600 text-xs">
        <CheckCircle className="w-4 h-4" />
        <span>¡Válido!</span>
      </div>
    )}
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    userName: '',
    password: '',
    server: ''
  });
  const [formValid, setFormValid] = useState({
    userName: false,
    password: false
  });
  const [showPassword, setShowPassword] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    let isValid = false;

    switch (name) {
      case 'userName':
        if (!value.trim()) {
          error = 'El nombre de usuario es requerido';
        } else {
          isValid = true;
        }
        break;

      case 'password':
        if (!value.trim()) {
          error = 'La contraseña es requerida';
        } else {
          isValid = true;
        }
        break;

      default:
        break;
    }

    setFormErrors(prev => ({ ...prev, [name]: error }));
    setFormValid(prev => ({ ...prev, [name]: isValid }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    validateField(name, value);
    // Clear server error when typing
    setFormErrors(prev => ({ ...prev, server: '' }));
  };

  const validateForm = () => {
    return Object.values(formValid).every(isValid => isValid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setFormErrors({
        userName: !formValid.userName ? formErrors.userName || 'El nombre de usuario es requerido' : '',
        password: !formValid.password ? formErrors.password || 'La contraseña es requerida' : '',
        server: ''
      });
      return;
    }

    try {
      setLoading(true);
      setFormErrors({ userName: '', password: '', server: '' });
      
      const response = await loginUser(formData);
      
      localStorage.setItem('token', response.token.token);
      localStorage.setItem('tokenExpiration', response.token.expiration);
      localStorage.setItem('userName', response.userName);
      localStorage.setItem('userRoles', JSON.stringify(response.roles));
      
      navigate('/');
      
    } catch (err) {
      let errorMessage = 'Error al iniciar sesión';
      
      if (err.response?.status === 401) {
        errorMessage = 'Usuario o contraseña incorrectos';
      } else if (err.response?.status === 404) {
        errorMessage = 'Usuario no encontrado';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setFormErrors(prev => ({
        ...prev,
        server: errorMessage
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">FinanceApp</h1>
          <p className="text-gray-600">Todas tus finanzas en un mismo lugar</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Server Error Alert */}
          {formErrors.server && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{formErrors.server}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Usuario"
              name="userName"
              type="text"
              icon={User}
              placeholder="Ingrese su nombre de usuario"
              value={formData.userName}
              onChange={handleChange}
              disabled={loading}
              error={formErrors.userName}
              isValid={formValid.userName}
            />
            <InputField
              label="Contraseña"
              name="password"
              type="password"
              icon={Lock}
              placeholder="Ingrese su contraseña"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              error={formErrors.password}
              isValid={formValid.password}
              showToggle={showPassword}
              toggleShow={() => setShowPassword(!showPassword)}
              isPassword={true}
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !validateForm()}
              className="
                w-full py-4
                bg-black hover:bg-gray-800
                text-white font-semibold
                rounded-2xl
                transition-all duration-200 transform hover:scale-[1.02]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                shadow-lg hover:shadow-xl
              "
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <LogIn className="w-5 h-5" />
                  <span>Iniciar Sesión</span>
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">o</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              ¿No tienes una cuenta?{' '}
              <Link 
                to="/signup" 
                className="font-semibold text-black hover:text-blue-700 transition-colors duration-200 underline decoration-2 underline-offset-4"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} FinanceApp. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;