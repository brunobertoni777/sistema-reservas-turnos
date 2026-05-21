// src/features/admin/components/AdminPanel.jsx

import { bookingService } from "../../../services/api.js";
import { Badge, Button, Spinner, Card, Alert } from "../../../components/ui/index.jsx";

export function AdminPanel() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", date: "" });
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  async function fetchBookings() {
    setIsLoading(true);
    setError("");
    try {
      // Eliminamos filtros vacíos antes de enviar
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== "")
      );
      const response = await bookingService.adminList(activeFilters);
      setData(response.data);
    } catch {
      setError("No se pudieron cargar las reservas.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancel(bookingId) {
    if (!confirm("¿Cancelar esta reserva?")) return;
    setCancellingId(bookingId);
    try {
      await bookingService.cancel(bookingId);
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  // Métricas básicas calculadas del lado del cliente
  const metrics = data
    ? {
        total: data.total,
        confirmed: data.bookings.filter((b) => b.status === "CONFIRMED").length,
        cancelled: data.bookings.filter((b) => b.status === "CANCELLED").length,
      }
    : null;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Panel de administración</h2>

      {/* Métricas */}
      {metrics && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <MetricCard label="Total" value={metrics.total} color="blue" />
          <MetricCard label="Confirmadas" value={metrics.confirmed} color="green" />
          <MetricCard label="Canceladas" value={metrics.cancelled} color="red" />
        </div>
      )}

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos</option>
              <option value="CONFIRMED">Confirmadas</option>
              <option value="CANCELLED">Canceladas</option>
              <option value="COMPLETED">Completadas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {(filters.status || filters.date) && (
            <div className="flex items-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ status: "", date: "" })}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Lista */}
      {isLoading && <Spinner className="py-16" />}
      {error && <Alert type="error" message={error} />}

      {!isLoading && data && (
        <div className="flex flex-col gap-2">
          {data.bookings.length === 0 ? (
            <p className="text-center text-gray-400 py-12">No hay reservas para mostrar.</p>
          ) : (
            data.bookings.map((booking) => (
              <Card key={booking.id} className="p-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">
                        {booking.user.name}
                      </span>
                      <span className="text-gray-400 text-sm">{booking.user.email}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-0.5">
                      {booking.court.name} · {booking.date} · {booking.startTime}–{booking.endTime}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge value={booking.status} />
                    {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                        isLoading={cancellingId === booking.id}
                        className="text-red-500 hover:bg-red-50"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div className={`rounded-xl border p-4 text-center ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs font-medium mt-1">{label}</div>
    </div>
  );
}
