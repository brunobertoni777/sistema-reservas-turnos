const CourtRepository = require("../../infrastructure/database/repositories/CourtRepository");
const BookingRepository = require("../../infrastructure/database/repositories/BookingRepository");
const MAP = { 0: "SUNDAY", 1: "MONDAY", 2: "TUESDAY", 3: "WEDNESDAY", 4: "THURSDAY", 5: "FRIDAY", 6: "SATURDAY" };

async function getCourtAvailability(courtId, date) {
  const court = await CourtRepository.findById(courtId);
  if (!court) throw new Error("Cancha no existe.");
  const day = MAP[new Date(date + "T00:00:00").getDay()];
  const slots = await CourtRepository.findSlotsByDayOfWeek(courtId, day);
  const bookings = await BookingRepository.findByCourtAndDate(courtId, date);
  const booked = new Set(bookings.map(b => b.startTime));

  return slots.map(s => ({ id: s.id, startTime: s.startTime, endTime: s.endTime, isAvailable: !booked.has(s.startTime) }));
}
module.exports = { getCourtAvailability };