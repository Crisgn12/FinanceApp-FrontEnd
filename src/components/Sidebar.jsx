import {
  House,
  ArrowLeftRight,
  Calendar1,
  Files,
  Target,
  List,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const navItems = [
    { path: "/Dashboard", label: "Dashboard", icon: House },
    { path: "/Transacciones", label: "Transacciones", icon: ArrowLeftRight },
    { path: "/Calendario", label: "Calendario", icon: Calendar1 },
    { path: "/Metas", label: "Metas", icon: Target },
    { path: "/Categorias", label: "Categorias", icon: List },
    { path: "/Reportes", label: "Reportes", icon: Files },
  ];

  return (
    <div className="fixed w-[292px] h-screen">
      <aside className="bg-white border-r border-gray-200 px-6 py-4 h-screen overflow-y-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold">FinanceApp</h1>
        </header>

        <h2 className="font-bold text-gray-600 mb-4">MENÚ</h2>

        <nav className="mb-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-2">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `h-12 flex items-center gap-2 p-2 font-bold text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-800 group ${
                      isActive ? "border-l-4 border-black bg-gray-100 text-gray-800" : ""
                    }`
                  }
                >
                  <item.icon size={20} strokeWidth={2.75} />
                  <span className="mt-0.5">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
