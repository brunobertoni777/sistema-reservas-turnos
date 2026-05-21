// src/features/bookings/components/BookingConfirmModal.jsx

import { bookingService } from "../../../services/api.js";
import { Button, Alert } from "../../../components/ui/index.jsx";

const SPORT_ICONS = { FOOTBALL: "⚽", PADEL: "🏓", TENNIS: "🎾" };

/**
 * Modal de confirmación de reserva.
 * Muestra el resumen y permite confirmar o cancelar.
 */
export function BookingConfirmModal({ selection, onSuccess, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { court, date, slot } = selection;

  // Formatea "2025-06-15" → "domingo 15 de junio de 2025"
  function formatFullDate(dateStr) {
    const dateObj = new Date(`${dateStr}T00:00:00`);
    return dateObj.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  async function handleConfirm() {
    setIsLoading(true);
    setError("");

    try {
      await bookingService.create({
        courtId: court.id,
        date,
        startTime: slot.startTime,
      });

      onSuccess();
    } catch (err) {
      // Caso especial: alguien más reservó el turno mientras confirmábamos
      if (err.code === "SLOT_UNAVAILABLE") {
        setError("Este turno acaba de ser reservado por otra persona. Por favor elegí otro horario.");
      } else {
        setError(err.message || "No se pudo crear la reserva.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    // Overlay oscuro
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Modal — stopPropagation evita cerrar al clickear adentro */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">{SPORT_ICONS[court.sport]}</div>
          <h2 className="text-xl font-bold text-gray-900">Confirmar reserva</h2>
        </div>

        {/* Resumen de la reserva */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
          <DetailRow label="Cancha" value={court.name} />
          <DetailRow label="Fecha" value={formatFullDate(date)} />
          <DetailRow
            label="Horario"
            value={`${slot.startTime} – ${slot.endTime}`}
          />
          <DetailRow label="Duración" value={`${court.slotDurationMinutes} min`} />
        </div>

        <Alert type="error" message={error} className="mb-4" />

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            isLoading={isLoading}
            className="flex-1"
          >
            Confirmar reserva
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}
