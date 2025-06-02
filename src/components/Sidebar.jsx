import {
  House,
  ArrowLeftRight,
  Calendar1,
  Files,
  Target,
  List,
  Table2Icon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import TablaAhorros from "../pages/TablaAhorros";

export default function Sidebar({ isOpen }) {
  const navItems = [
    { path: "/Dashboard", label: "Dashboard", icon: House },
    { path: "/Transacciones", label: "Transacciones", icon: ArrowLeftRight },
    { path: "/Calendario", label: "Calendario", icon: Calendar1 },
    { path: "/Metas", label: "Metas", icon: Target },
    { path: "/Categorias", label: "Categorias", icon: List },
    { path: "/Reportes", label: "Reportes", icon: Files },
    { path: "/CrearAhorro", label: "Crear Ahorro", icon: Table2Icon},
    { path: "/TablaAhorros", label: "Tabla Ahorros", icon: Table2Icon},
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
      </aside>
    </div>
  );
}