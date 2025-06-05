import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  CardBody, 
  Form, 
  FormGroup, 
  Label, 
  Input, 
  Button,
  Alert,
  Spinner
} from 'reactstrap';
import { 
  User, 
  Lock, 
  Mail,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle
} from 'react-feather';
import { registerUser } from '../../Hooks/useAuth.js';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Color verde musgo para consistencia
  const mossGreen = '#3A5F41';
  const lighterMossGreen = '#E8F0EA';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar mensajes cuando el usuario empiece a escribir
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    // Validar campos vacíos
    if (!formData.userName.trim() || !formData.email.trim() || 
        !formData.password.trim() || !formData.confirmPassword.trim()) {
      setError('Por favor, complete todos los campos');
      return false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, ingrese un email válido');
      return false;
    }

    // Validar longitud de contraseña
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    // Validar nombre de usuario
    if (formData.userName.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Preparar datos para el registro (sin confirmPassword)
      const registerData = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password
      };
      
      await registerUser(registerData);
      
      setSuccess('¡Cuenta creada exitosamente! Serás redirigido al login...');
      
      // Redireccionar al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center py-4"
      style={{
        background: `linear-gradient(135deg, ${mossGreen} 0%,rgb(255, 255, 255) 100%)`,
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <Card 
              className="shadow-lg border-0"
              style={{
                borderRadius: '20px',
                overflow: 'hidden'
              }}
            >
              {/* Header de la tarjeta */}
              <div 
                className="text-center py-4"
                style={{
                  background: `linear-gradient(45deg, ${mossGreen}, #2C4A32)`,
                  color: 'white'
                }}
              >
                <div 
                  className="mx-auto mb-3"
                  style={{
                    width: '70px',
                    height: '70px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UserPlus size={35} />
                </div>
                <h3 className="mb-1 fw-bold">Crear Cuenta</h3>
                <p className="mb-0 opacity-75">Únete a nuestra plataforma</p>
              </div>

              <CardBody className="p-4">
                {error && (
                  <Alert color="danger" className="mb-4">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                    </div>
                  </Alert>
                )}

                {success && (
                  <Alert color="success" className="mb-4">
                    <div className="d-flex align-items-center">
                      <CheckCircle size={16} className="me-2" />
                      {success}
                    </div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <FormGroup className="mb-3">
                    <Label for="userName" className="fw-semibold text-dark">
                      Nombre de Usuario
                    </Label>
                    <div className="position-relative">
                      <Input
                        type="text"
                        name="userName"
                        id="userName"
                        placeholder="Ingrese su nombre de usuario"
                        value={formData.userName}
                        onChange={handleChange}
                        className="ps-5"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #E8F0EA',
                          height: '50px',
                          fontSize: '1rem'
                        }}
                        disabled={loading}
                      />
                      <User
                        size={20}
                        className="position-absolute"
                        style={{
                          left: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: mossGreen
                        }}
                      />
                    </div>
                  </FormGroup>

                  <FormGroup className="mb-3">
                    <Label for="email" className="fw-semibold text-dark">
                      Correo Electrónico
                    </Label>
                    <div className="position-relative">
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Ingrese su correo electrónico"
                        value={formData.email}
                        onChange={handleChange}
                        className="ps-5"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #E8F0EA',
                          height: '50px',
                          fontSize: '1rem'
                        }}
                        disabled={loading}
                      />
                      <Mail
                        size={20}
                        className="position-absolute"
                        style={{
                          left: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: mossGreen
                        }}
                      />
                    </div>
                  </FormGroup>

                  <FormGroup className="mb-3">
                    <Label for="password" className="fw-semibold text-dark">
                      Contraseña
                    </Label>
                    <div className="position-relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        placeholder="Ingrese su contraseña"
                        value={formData.password}
                        onChange={handleChange}
                        className="ps-5 pe-5"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #E8F0EA',
                          height: '50px',
                          fontSize: '1rem'
                        }}
                        disabled={loading}
                      />
                      <Lock
                        size={20}
                        className="position-absolute"
                        style={{
                          left: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: mossGreen
                        }}
                      />
                      <button
                        type="button"
                        className="btn p-0 position-absolute"
                        style={{
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: mossGreen
                        }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormGroup>

                  <FormGroup className="mb-4">
                    <Label for="confirmPassword" className="fw-semibold text-dark">
                      Confirmar Contraseña
                    </Label>
                    <div className="position-relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        placeholder="Confirme su contraseña"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="ps-5 pe-5"
                        style={{
                          borderRadius: '12px',
                          border: '2px solid #E8F0EA',
                          height: '50px',
                          fontSize: '1rem'
                        }}
                        disabled={loading}
                      />
                      <Lock
                        size={20}
                        className="position-absolute"
                        style={{
                          left: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: mossGreen
                        }}
                      />
                      <button
                        type="button"
                        className="btn p-0 position-absolute"
                        style={{
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: mossGreen
                        }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormGroup>

                  <Button
                    type="submit"
                    className="w-100 fw-bold"
                    disabled={loading}
                    style={{
                      backgroundColor: mossGreen,
                      borderColor: mossGreen,
                      borderRadius: '12px',
                      height: '50px',
                      fontSize: '1.1rem',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Creando cuenta...
                      </>
                    ) : (
                      <>
                        <UserPlus size={20} className="me-2" />
                        Crear Cuenta
                      </>
                    )}
                  </Button>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-0">
                    ¿Ya tienes una cuenta?{' '}
                    <Link 
                      to="/login" 
                      className="fw-bold text-decoration-none"
                      style={{ color: mossGreen }}
                    >
                      Inicia sesión aquí
                    </Link>
                  </p>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SignUp;