import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Lock, 
  Mail,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'react-feather';
import { registerUser } from '../../Hooks/useAuth.js';

// Move InputField outside of SignUp to prevent re-creation on render
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
        type={isPassword ? (showToggle ? 'text' : 'password') : type}
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

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
  });
  const [formValid, setFormValid] = useState({
    userName: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateField = (name, value) => {
    let error = '';
    let isValid = false;

    switch (name) {
      case 'userName':
        if (!value.trim()) {
          error = 'El nombre de usuario es requerido';
        } else if (value.length < 3) {
          error = 'Mínimo 3 caracteres';
        } else if (/^\d+$/.test(value)) {
          error = 'No puede ser solo números';
        } else {
          isValid = true;
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          error = 'El correo es requerido';
        } else if (!emailRegex.test(value)) {
          error = 'Correo inválido';
        } else {
          isValid = true;
        }
        break;

      case 'password':
        const passwordRegex = /^(?=.*\d).{6,}$/;
        if (!value.trim()) {
          error = 'La contraseña es requerida';
        } else if (!passwordRegex.test(value)) {
          error = 'Mínimo 6 caracteres y un número';
        } else {
          isValid = true;
        }
        break;

      case 'confirmPassword':
        if (!value.trim()) {
          error = 'Confirma la contraseña';
        } else if (value !== formData.password) {
          error = 'Las contraseñas no coinciden';
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
  };

  useEffect(() => {
    // Re-validate confirmPassword when password changes
    if (formData.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
    }
  }, [formData.password]);

  const validateForm = () => {
    return Object.values(formValid).every(isValid => isValid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setFormErrors({
        userName: !formValid.userName ? formErrors.userName || 'Corregir este campo' : '',
        email: !formValid.email ? formErrors.email || 'Corregir este campo' : '',
        password: !formValid.password ? formErrors.password || 'Corregir este campo' : '',
        confirmPassword: !formValid.confirmPassword ? formErrors.confirmPassword || 'Corregir este campo' : '',
        general: ''
      });
      return;
    }

    try {
      setLoading(true);
      setFormErrors(prev => ({ ...prev, general: '' }));
      
      const registerData = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password
      };
      
      await registerUser(registerData);
      
      setSuccess('¡Cuenta creada exitosamente! Serás redirigido al login...');
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setFormErrors(prev => ({ ...prev, general: err.message || 'Error al crear la cuenta' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
          <p className="text-gray-600">Únete a FinanceApp</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* General Error Alert */}
          {formErrors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{formErrors.general}</span>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Nombre de Usuario"
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
              label="Correo Electrónico"
              name="email"
              type="email"
              icon={Mail}
              placeholder="Ingrese su correo electrónico"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              error={formErrors.email}
              isValid={formValid.email}
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
            <InputField
              label="Confirmar Contraseña"
              name="confirmPassword"
              type="password"
              icon={Lock}
              placeholder="Confirme su contraseña"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              error={formErrors.confirmPassword}
              isValid={formValid.confirmPassword}
              showToggle={showConfirmPassword}
              toggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
              isPassword={false}
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
                  <span>Creando cuenta...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <UserPlus className="w-5 h-5" />
                  <span>Crear Cuenta</span>
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-2 flex items-center">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-4 text-sm text-gray-500">o</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              ¿Ya tienes una cuenta?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-black hover:text-blue-700 transition-colors duration-200 underline decoration-2 underline-offset-4"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-5">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} FinanceApp. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;