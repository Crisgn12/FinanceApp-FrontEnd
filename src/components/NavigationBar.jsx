import { AlignLeft, CircleUserRound } from "lucide-react";
import { useAuth, getCurrentUser } from '../Hooks/useAuth.js';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


export default function NavigationBar({ toggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const updateUserData = () => {
      try {
        if (isAuthenticated()) {
          const userData = getCurrentUser();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        setUser(null);
      }
    };

    updateUserData();
  }, []); // Sin dependencias para evitar el bucle infinito

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Obtener iniciales del usuario
  // const getUserInitials = (userName) => {
  //   if (!userName) return 'U';
  //   const names = userName.split(' ');
  //   if (names.length >= 2) {
  //     return (names[0][0] + names[1][0]).toUpperCase();
  //   }
  //   return userName.substring(0, 2).toUpperCase();
  // };

  // Si no está autenticado, no mostrar el navbar
  /*if (!isAuthenticated()) {
    return null;
  }*/

  return (
    <section className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
      <div>
        <button className="cursor-pointer" onClick={toggleSidebar}>
          <AlignLeft
            size={30}
            strokeWidth={2.75}
            className={`transition-transform duration-300 ${
              isSidebarOpen ? "" : "rotate-180"
            }`}
          />
        </button>
      </div>

      <div ref={dropdownRef} className="relative">
        <div 
          onClick={() => setUserDropdownOpen(!userDropdownOpen)}
          className="cursor-pointer"
        >
          <div className="flex items-center">
            <div>
              <CircleUserRound size={30} strokeWidth={2} />
            </div>
          </div>
        </div>

        {userDropdownOpen && (
          <div 
            className="absolute bg-white rounded shadow mt-2"
            style={{
              right: 0,
              minWidth: '280px',
              zIndex: 50,
              padding: '0.5rem 0',
            }}
          >
            <div className="px-4 py-3 border-b">
              <div className="flex items-center">
                <div className="rounded-full bg-gray-100 text-black flex justify-center items-center mr-3"
                    style={{ width: '48px', height: '48px' }}>
                  <CircleUserRound size={30} strokeWidth={2} />
                </div>
                <div>
                  <div className="font-bold">{user ? user.userName : 'Usuario'}</div>
                </div>
              </div>
            </div>

            <div className="border-t">
              <button
                className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                onClick={() => {
                  setUserDropdownOpen(false);
                  handleLogout();
                }}
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>

    </section>
  );
}