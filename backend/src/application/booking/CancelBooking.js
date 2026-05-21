const BookingRepository = require("../../infrastructure/database/repositories/BookingRepository");
const BookingRules = require("../../domain/booking/BookingRules");

async function cancelBooking({ bookingId, requestingUserId, requestingRole }) {
  const booking = await BookingRepository.findById(bookingId);
  if (!booking) throw new Error("Reserva no existe.");
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(requestingRole);
  if (booking.userId !== requestingUserId && !isAdmin) throw new Error("No autorizado.");
  
  if (!isAdmin && !BookingRules.canBeCancelled(booking.date, booking.startTime).allowed) throw new Error("Fuera de término.");
  return BookingRepository.updateStatus(bookingId, "CANCELLED", requestingUserId);
}
module.exports = { cancelBooking };