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
  LogIn,
  Eye,
  EyeOff
} from 'react-feather';
import { loginUser } from '../../Hooks/useAuth.js';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Color verde musgo para consistencia
  const mossGreen = '#3A5F41';
  const lighterMossGreen = '#E8F0EA';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.userName.trim() || !formData.password.trim()) {
      setError('Por favor, complete todos los campos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await loginUser(formData);
      
      // Guardar datos en localStorage
      localStorage.setItem('token', response.token.token);
      localStorage.setItem('tokenExpiration', response.token.expiration);
      localStorage.setItem('userName', response.userName);
      localStorage.setItem('userRoles', JSON.stringify(response.roles));
      
      // Redireccionar al dashboard/home
      navigate('/');
      
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center"
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
                  <LogIn size={35} />
                </div>
                <h3 className="mb-1 fw-bold">Bienvenido</h3>
                <p className="mb-0 opacity-75">Inicia sesión en tu cuenta</p>
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

                <Form onSubmit={handleSubmit}>
                  <FormGroup className="mb-3">
                    <Label for="userName" className="fw-semibold text-dark">
                      Usuario
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

                  <FormGroup className="mb-4">
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
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <LogIn size={20} className="me-2" />
                        Iniciar Sesión
                      </>
                    )}
                  </Button>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="text-muted mb-0">
                    ¿No tienes una cuenta?{' '}
                    <Link 
                      to="/signup" 
                      className="fw-bold text-decoration-none"
                      style={{ color: mossGreen }}
                    >
                      Regístrate aquí
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

export default Login;