// src/features/courts/hooks/useCourts.js
//
// Hook que encapsula toda la lógica de canchas.
// El componente solo renderiza. Este hook se encarga de buscar los datos.

import { useState, useEffect } from "react";
import { courtService } from "../../../../services/api.js";

export function useCourts() {
  const [courts, setCourts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [sportFilter, setSportFilter] = useState("");

  useEffect(() => {
    async function fetchCourts() {
      setIsLoading(true);
      setError("");
      try {
        const response = await courtService.list(sportFilter);
        setCourts(response.data.courts);
      } catch (err) {
        setError("No se pudieron cargar las canchas.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourts();
  }, [sportFilter]); // Se re-ejecuta cuando cambia el filtro

  return { courts, isLoading, error, sportFilter, setSportFilter };
}
