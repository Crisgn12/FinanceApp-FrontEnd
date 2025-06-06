import {
  House,
  ArrowLeftRight,
  Calendar1,
  Files,
  Target,
  List,
  LogOut 
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Nav, NavItem } from 'reactstrap'; // ← importación correcta desde reactstrap

import { logout } from '../Hooks/useAuth.js';

export default function Sidebar({ isOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { path: "/Dashboard", label: "Dashboard", icon: House },
    { path: "/Transacciones", label: "Transacciones", icon: ArrowLeftRight },
    { path: "/Calendario", label: "Calendario", icon: Calendar1 },
    { path: "/Metas", label: "Metas", icon: Target },
    { path: "/Categorias", label: "Categorias", icon: List },
    { path: "/Reportes", label: "Reportes", icon: Files }
  ];

  return (
    <div
      className={`fixed h-screen transition-all duration-300 ${
        isOpen ? "w-[292px]" : "w-[80px]"
      }`}
    >
      <aside
        className="bg-white border-r border-gray-200 px-6 py-4 h-screen overflow-y-auto"
      >
        <header className="mb-6">
          <h1
            className={`text-3xl font-extrabold transition-all duration-300 ${
              isOpen ? "block" : "hidden"
            }`}
          >
            FinanceApp
          </h1>
        </header>

        <h2
          className={`font-bold text-gray-600 mb-4 transition-all duration-300 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          MENÚ
        </h2>

        <nav className="mb-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-2 relative group">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `h-12 flex items-center gap-2 font-bold text-gray-600 rounded-lg group ${
                      isOpen ? "p-2" : "p-1 justify-center"} ${
                      isActive && isOpen
                        ? `border-l-4 border-black bg-gray-100 text-gray-800`
                        : "hover:bg-gray-50 hover:text-gray-700"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={isOpen ? 20 : isActive ? 26 : 24}
                        strokeWidth={2.75}
                      />
                      <span
                        className={`mt-0.5 transition-all duration-300 ${
                          isOpen ? "block" : "hidden"
                        }`}
                      >
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
      <div className="position-absolute" style={{ bottom: isOpen ? '60px' : '20px', left: '0', right: '0' }}>
        <Nav vertical>
          <NavItem>
            <div
              className="nav-link text-white"
              style={{ 
                paddingLeft: '16px',
                paddingRight: isOpen ? '24px' : '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isOpen ? 'flex-start' : 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                paddingTop: '12px',
                paddingBottom: '12px'
              }}
              onClick={handleLogout}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className={`d-flex align-items-center ${!isOpen ? 'justify-content-center w-100' : ''}`}>
                <span className={isOpen ? 'me-3' : ''}><LogOut size={18} /></span>
                {isOpen && <span>Cerrar Sesión</span>}
              </div>
            </div>
          </NavItem>
        </Nav>
      </div>
      </aside>
    </div>
  );
}