// src/App.jsx
import { useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";

// Componentes del sistema base
import { Navbar } from "./components/ui/Navbar.jsx"; 
import { Spinner } from "./components/ui/index.jsx"; 

// Componentes de las funcionalidades (Rutas reales de tu disco)
import { LoginForm, RegisterForm } from "./features/auth/components/AuthForms.jsx";
import { CourtList } from "./features/auth/courts/components/CourtList.jsx"; // <-- Corregido
import { AvailabilityPicker } from "./features/auth/courts/components/AvailabilityPicker.jsx"; // <-- Corregido
import { BookingConfirmModal } from "./features/bookings/components/BookingConfirmModal.jsx";
import { MyBookings } from "./features/bookings/components/MyBookings.jsx";
import { AdminPanel } from "./features/admin/components/AdminPanel.jsx";
export default function App() {
  const { user, isLoading } = useAuth();

  // Estados de navegación
  const [currentPage, setCurrentPage] = useState("courts");
  const [authMode, setAuthMode] = useState("login"); // "login" | "register"

  // Estado del flujo de reserva
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [bookingSelection, setBookingSelection] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  // Si no hay usuario autenticado, mostramos login o registro
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
        {authMode === "login" ? (
          <LoginForm onSwitchToRegister={() => setAuthMode("register")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthMode("login")} />
        )}
      </div>
    );
  }

  function handleNavigate(page) {
    setCurrentPage(page);
    setSelectedCourt(null);
    setBookingSuccess(false);
  }

  function handleSelectCourt(court) {
    setSelectedCourt(court);
    setBookingSuccess(false);
  }

  function handleSelectSlot({ court, date, slot }) {
    setBookingSelection({ court, date, slot });
  }

  function handleBookingSuccess() {
    setBookingSelection(null);
    setSelectedCourt(null);
    setBookingSuccess(true);
    setCurrentPage("my-bookings");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Alerta global de éxito */}
        {bookingSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-fade-in">
            <span className="text-xl">🎉</span>
            <div>
              <h3 className="font-semibold text-green-800">¡Reserva confirmada!</h3>
              <p className="text-sm text-green-600">
                Podés ver tu reserva en{" "}
                <button
                  onClick={() => handleNavigate("my-bookings")}
                  className="underline font-medium"
                >
                  Mis reservas
                </button>
                .
              </p>
            </div>
          </div>
        )}

        {/* Páginas */}
        {currentPage === "courts" && (
          <>
            {!selectedCourt ? (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Canchas disponibles</h1>
                <p className="text-gray-500 text-sm mb-6">
                  Elegí una cancha para ver los horarios disponibles.
                </p>
                <CourtList onSelectCourt={handleSelectCourt} />
              </>
            ) : (
              <AvailabilityPicker
                court={selectedCourt}
                onSelectSlot={handleSelectSlot}
                onBack={() => setSelectedCourt(null)}
              />
            )}
          </>
        )}

        {currentPage === "my-bookings" && <MyBookings />}
        {currentPage === "admin" && <AdminPanel />}
      </main>

      {/* Modal de confirmación de reserva */}
      {bookingSelection && (
        <BookingConfirmModal
          selection={bookingSelection}
          onSuccess={handleBookingSuccess}
          onClose={() => setBookingSelection(null)}
        />
      )}
    </div>
  );
}