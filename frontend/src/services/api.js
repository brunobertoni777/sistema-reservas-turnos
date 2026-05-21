// src/services/api.js
//
// Este archivo es el único punto de contacto con la API del backend.
// Ningún componente hace fetch() directamente.
//
// ¿Por qué centralizar las llamadas?
// Si mañana cambia la URL base, el formato de respuesta o el manejo de tokens,
// solo cambia este archivo. El resto de la app no sabe cómo funciona HTTP.

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

/**
 * Función base para todos los requests.
 * Adjunta el token JWT automáticamente si existe.
 * Maneja errores de forma consistente.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      // Si hay token, lo adjuntamos en cada request automáticamente
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  // Si el servidor respondió con error, lo lanzamos como excepción
  // para que el componente pueda mostrarlo
  if (!response.ok) {
    const error = new Error(data.error || "Error del servidor.");
    error.code = data.code;
    error.statusCode = response.status;
    throw error;
  }

  return data;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authService = {
  register: (data) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  me: () => request("/auth/me"),
};

// ─── Courts ──────────────────────────────────────────────────────────────────

export const courtService = {
  list: (sport) =>
    request(`/courts${sport ? `?sport=${sport}` : ""}`),

  availability: (courtId, date) =>
    request(`/courts/${courtId}/availability?date=${date}`),

  // Admin
  create: (data) =>
    request("/admin/courts", { method: "POST", body: JSON.stringify(data) }),

  update: (courtId, data) =>
    request(`/admin/courts/${courtId}`, { method: "PATCH", body: JSON.stringify(data) }),

  deactivate: (courtId) =>
    request(`/admin/courts/${courtId}`, { method: "DELETE" }),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookingService = {
  create: (data) =>
    request("/bookings", { method: "POST", body: JSON.stringify(data) }),

  myBookings: () =>
    request("/bookings/my"),

  cancel: (bookingId) =>
    request(`/bookings/${bookingId}/cancel`, { method: "PATCH" }),

  // Admin
  adminList: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return request(`/admin/bookings${params ? `?${params}` : ""}`);
  },
};
