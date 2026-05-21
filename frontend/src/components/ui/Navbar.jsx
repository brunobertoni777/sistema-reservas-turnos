// src/components/ui/Navbar.jsx

import { useAuth } from "../../context/AuthContext.jsx";

export function Navbar({ currentPage, onNavigate }) {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { key: "courts", label: "Canchas" },
    { key: "my-bookings", label: "Mis reservas" },
    ...(isAdmin ? [{ key: "admin", label: "Administración" }] : []),
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => onNavigate("courts")}
          className="flex items-center gap-2 font-bold text-gray-900 text-lg"
        >
          <span>⚽</span>
          <span>TurnosApp</span>
        </button>

        {/* Nav items — desktop */}
        <div className="hidden sm:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === item.key
                  ? "bg-green-50 text-green-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Usuario y logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">
            {user?.name}
          </span>
          <button
            onClick={logout}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Nav items — mobile */}
      <div className="sm:hidden flex border-t border-gray-100">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              currentPage === item.key
                ? "text-green-700 border-b-2 border-green-600"
                : "text-gray-500"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
