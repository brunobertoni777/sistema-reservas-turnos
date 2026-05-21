// src/features/courts/components/AvailabilityPicker.jsx
//
// Componente que muestra los turnos disponibles para una cancha y fecha.
// El usuario elige la fecha y ve qué turnos están libres.

import { courtService } from "../../../../services/api.js";
import { Spinner, Alert } from "../../../../components/ui/index.jsx";

// Formatea "2025-06-15" como "15/06/2025"
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

// Retorna la fecha de hoy en formato "YYYY-MM-DD"
function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

export function AvailabilityPicker({ court, onSelectSlot, onBack }) {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [availability, setAvailability] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Cada vez que cambia la fecha, buscamos disponibilidad
  useEffect(() => {
    if (!selectedDate) return;

    setIsLoading(true);
    setError("");

    courtService
      .availability(court.id, selectedDate)
      .then((res) => setAvailability(res.data))
      .catch(() => setError("No se pudo cargar la disponibilidad."))
      .finally(() => setIsLoading(false));
  }, [court.id, selectedDate]);

  const availableSlots = availability?.slots.filter((s) => s.isAvailable) || [];
  const occupiedSlots = availability?.slots.filter((s) => !s.isAvailable) || [];

  return (
    <div>
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Volver"
        >
          ← Volver
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{court.name}</h2>
          <p className="text-sm text-gray-500">Turnos de {court.slotDurationMinutes} min</p>
        </div>
      </div>

      {/* Selector de fecha */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccioná una fecha
        </label>
        <input
          type="date"
          value={selectedDate}
          min={getTodayString()} // No permite seleccionar fechas pasadas
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {isLoading && <Spinner className="py-10" />}
      {error && <Alert type="error" message={error} />}

      {!isLoading && availability && (
        <div>
          <p className="text-sm text-gray-500 mb-4">
            {formatDate(selectedDate)} —{" "}
            <span className="font-medium text-green-600">
              {availableSlots.length} turnos disponibles
            </span>
          </p>

          {availableSlots.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-3">📅</div>
              <p className="font-medium">No hay turnos disponibles para esta fecha.</p>
              <p className="text-sm mt-1">Probá con otro día.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {/* Turnos disponibles */}
              {availableSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => onSelectSlot({ court, date: selectedDate, slot })}
                  className="
                    p-3 rounded-lg border-2 border-green-200 bg-green-50
                    hover:border-green-500 hover:bg-green-100
                    text-center transition-colors group
                  "
                >
                  <p className="font-semibold text-green-800 text-sm">
                    {slot.startTime}
                  </p>
                  <p className="text-xs text-green-600">→ {slot.endTime}</p>
                  <p className="text-xs text-green-500 mt-1 opacity-0 group-hover:opacity-100">
                    Reservar
                  </p>
                </button>
              ))}

              {/* Turnos ocupados (mostrados pero no clickeables) */}
              {occupiedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3 rounded-lg border-2 border-gray-100 bg-gray-50 text-center opacity-50 cursor-not-allowed"
                >
                  <p className="font-semibold text-gray-500 text-sm">{slot.startTime}</p>
                  <p className="text-xs text-gray-400">Ocupado</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
