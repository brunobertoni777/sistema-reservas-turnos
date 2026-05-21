// src/features/courts/components/CourtList.jsx

import { useCourts } from "../hooks/useCourts.js";  // <-- Corregido
import { Badge, Card, Spinner, EmptyState } from "../../../../components/ui/index.jsx";
const SPORT_ICONS = {
  FOOTBALL: "⚽",
  PADEL: "🏓",
  TENNIS: "🎾",
};

const SPORT_FILTERS = [
  { value: "", label: "Todos" },
  { value: "FOOTBALL", label: "Fútbol" },
  { value: "PADEL", label: "Pádel" },
  { value: "TENNIS", label: "Tenis" },
];

export function CourtList({ onSelectCourt }) {
  const { courts, isLoading, error, sportFilter, setSportFilter } = useCourts();

  if (isLoading) {
    return <Spinner className="py-20" />;
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filtros por deporte */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {SPORT_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSportFilter(filter.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              sportFilter === filter.value
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {courts.length === 0 ? (
        <EmptyState
          icon="🏟️"
          title="No hay canchas disponibles"
          description="No se encontraron canchas para el deporte seleccionado."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              onSelect={() => onSelectCourt(court)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CourtCard({ court, onSelect }) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{SPORT_ICONS[court.sport]}</div>
        <Badge value={court.sport} />
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">{court.name}</h3>

      {court.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{court.description}</p>
      )}

      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-gray-400">
          Turnos de {court.slotDurationMinutes} min
        </span>
        <button
          onClick={onSelect}
          className="text-sm font-medium text-green-600 hover:text-green-700 group-hover:underline"
        >
          Ver disponibilidad →
        </button>
      </div>
    </Card>
  );
}
