const BookingRepository = require("../../infrastructure/database/repositories/BookingRepository");
const CourtRepository = require("../../infrastructure/database/repositories/CourtRepository");
const BookingRules = require("../../domain/booking/BookingRules");

async function createBooking({ userId, courtId, date, startTime, notes }) {
  const court = await CourtRepository.findById(courtId);
  if (!court) throw new Error("Cancha no existe.");
  if (!BookingRules.isDateInFuture(date, startTime).valid) throw new Error("Fecha inválida.");
  
  const [h, m] = startTime.split(":").map(Number);
  const total = h * 60 + m + court.slotDurationMinutes;
  const endTime = `${String(Math.floor(total/60)%24).padStart(2,"0")}:${String(total%60).padStart(2,"0")}`;

  return BookingRepository.createWithConflictCheck({ userId, courtId, date, startTime, endTime, notes });
}
module.exports = { createBooking };