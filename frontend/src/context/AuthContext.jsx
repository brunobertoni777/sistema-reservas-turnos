// src/context/AuthContext.jsx
//
// Context es el mecanismo de React para compartir estado sin pasar props
// por todos los niveles del árbol de componentes.
//
// ¿Qué vive acá?
// - El usuario autenticado (o null si no hay sesión)
// - Las funciones login/logout que actualizan ese estado
// - El estado de carga inicial (mientras verificamos si hay sesión guardada)
//
// ¿Qué NO vive acá?
// Todo lo demás. El estado de canchas, reservas, filtros, etc.
// pertenece a sus propios componentes o hooks.

import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

// Creamos el contexto con valor null por defecto
const AuthContext = createContext(null);

/**
 * AuthProvider envuelve toda la app y provee el estado de autenticación.
 * Se usa una sola vez en main.jsx.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Cargando mientras verificamos sesión

  // Al montar la app, verificamos si hay una sesión guardada en localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoading(false);
      return;
    }

    // Si hay token, verificamos que siga siendo válido
    authService
      .me()
      .then((data) => setUser(data.data.user))
      .catch(() => {
        // Token inválido o expirado — limpiamos
        localStorage.removeItem("token");
      })
      .finally(() => setIsLoading(false));
  }, []);

  function login(userData, token) {
    localStorage.setItem("token", token);
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  // Helpers de rol para usar en componentes
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAdmin, isSuperAdmin, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook personalizado para consumir el contexto.
 * Usamos esto en lugar de useContext(AuthContext) directamente
 * porque nos da un error claro si alguien lo usa fuera del Provider.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}
