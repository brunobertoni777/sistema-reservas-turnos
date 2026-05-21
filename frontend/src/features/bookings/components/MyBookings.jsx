// src/features/bookings/components/MyBookings.jsx

import { useState, useEffect, useCallback } from "react";
import { bookingService } from "../../../services/api.js"; // <-- Corregido con 3 saltos
import { Badge, Button, Spinner, Card, EmptyState, Alert } from "../../../components/ui/index.jsx";
export function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null); // ID de la reserva siendo cancelada
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState("");

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await bookingService.myBookings();
      setBookings(response.data.bookings);
    } catch {
      setError("No se pudieron cargar tus reservas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function handleCancel(bookingId) {
    if (!confirm("¿Estás seguro de que querés cancelar esta reserva?")) return;

    setCancellingId(bookingId);
    setCancelError("");
    setCancelSuccess("");

    try {
      await bookingService.cancel(bookingId);
      setCancelSuccess("Reserva cancelada correctamente.");
      // Actualizamos la lista localmente para no recargar todo
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: "CANCELLED" } : b
        )
      );
    } catch (err) {
      setCancelError(err.message || "No se pudo cancelar la reserva.");
    } finally {
      setCancellingId(null);
    }
  }

  if (isLoading) return <Spinner className="py-20" />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Mis reservas</h2>

      <Alert type="success" message={cancelSuccess} className="mb-4" />
      <Alert type="error" message={cancelError} className="mb-4" />

      {bookings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Sin reservas"
          description="Aún no hiciste ninguna reserva. ¡Buscá una cancha y reservá tu turno!"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
              isCancelling={cancellingId === booking.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, onCancel, isCancelling }) {
  const canCancel = booking.status === "CONFIRMED" || booking.status === "PENDING";

  function formatDate(dateStr) {
    const dateObj = new Date(`${dateStr}T00:00:00`);
    return dateObj.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 truncate">
              {booking.court.name}
            </span>
            <Badge value={booking.court.sport} />
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>📅 {formatDate(booking.date)}</span>
            <span>🕐 {booking.startTime} – {booking.endTime}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Badge value={booking.status} />

          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(booking.id)}
              isLoading={isCancelling}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}