// src/features/auth/components/AuthForms.jsx
//
// Formularios de login y registro.
// La lógica de autenticación está en useAuth (contexto) y en authService (API).
// Estos componentes solo se encargan de la UI y de llamar a esas funciones.

import { useState } from "react";
import { useAuth } from "../../../context/AuthContext.jsx";
import { authService } from "../../../services/api.js";       // <-- Corregido
import { useForm } from "../../../utils/useForm.js";
import { Button, Input, Alert } from "../../../components/ui/index.jsx";
// ─── Login Form ───────────────────────────────────────────────────────────────

export function LoginForm({ onSwitchToRegister }) {
  const { login } = useAuth();

  const { values, errors, isLoading, serverError, handleChange, handleSubmit } =
    useForm(
      { email: "", password: "" },
      async (values) => {
        const response = await authService.login(values);
        login(response.data.user, response.data.token);
      },
      validate
    );

  function validate(values) {
    const errors = {};
    if (!values.email) errors.email = "El email es requerido.";
    if (!values.password) errors.password = "La contraseña es requerida.";
    return errors;
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">⚽</div>
        <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
        <p className="text-gray-500 text-sm mt-1">Ingresá a tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert type="error" message={serverError} />

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <Button type="submit" isLoading={isLoading} size="lg" className="mt-2">
          Ingresar
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        ¿No tenés cuenta?{" "}
        <button
          onClick={onSwitchToRegister}
          className="text-green-600 font-medium hover:underline"
        >
          Registrate
        </button>
      </p>
    </div>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────

export function RegisterForm({ onSwitchToLogin }) {
  const { login } = useAuth();

  const { values, errors, isLoading, serverError, handleChange, handleSubmit } =
    useForm(
      { name: "", email: "", password: "" },
      async (values) => {
        const response = await authService.register(values);
        login(response.data.user, response.data.token);
      },
      validate
    );

  function validate(values) {
    const errors = {};
    if (!values.name || values.name.length < 2)
      errors.name = "El nombre debe tener al menos 2 caracteres.";
    if (!values.email) errors.email = "El email es requerido.";
    if (!values.password || values.password.length < 8)
      errors.password = "La contraseña debe tener al menos 8 caracteres.";
    return errors;
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3">🎾</div>
        <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
        <p className="text-gray-500 text-sm mt-1">Registrate para reservar turnos</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Alert type="error" message={serverError} />

        <Input
          id="name"
          name="name"
          type="text"
          label="Nombre completo"
          placeholder="Juan Pérez"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
        />

        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          placeholder="tu@email.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          placeholder="Mínimo 8 caracteres"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="new-password"
        />

        <Button type="submit" isLoading={isLoading} size="lg" className="mt-2">
          Crear cuenta
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        ¿Ya tenés cuenta?{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-green-600 font-medium hover:underline"
        >
          Iniciá sesión
        </button>
      </p>
    </div>
  );
}
