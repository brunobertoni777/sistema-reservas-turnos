// src/utils/useForm.js
//
// Hook reutilizable para manejar formularios.
// Evita repetir la misma lógica en LoginForm, RegisterForm, etc.
//
// Maneja: valores, errores de validación, estado de carga, y envío.

import { useState } from "react";

/**
 * @param {object} initialValues  - Valores iniciales del formulario
 * @param {function} onSubmit     - Función async que se llama al enviar
 * @param {function} validate     - Función de validación (opcional)
 */
export function useForm(initialValues, onSubmit, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Limpiamos el error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");

    // Validación del lado del cliente si se pasó una función validate
    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    setIsLoading(true);

    try {
      await onSubmit(values);
    } catch (error) {
      setServerError(error.message || "Ocurrió un error. Intentá de nuevo.");
    } finally {
      setIsLoading(false);
    }
  }

  return {
    values,
    errors,
    isLoading,
    serverError,
    handleChange,
    handleSubmit,
  };
}
