const BookingRules = {
  canBeCancelled(date, startTime, now = new Date()) {
    const diff = new Date(`${date}T${startTime}:00`).getTime() - now.getTime();
    return diff >= 2 * 60 * 60 * 1000 ? { allowed: true } : { allowed: false, reason: "Mínimo 2 horas de anticipación." };
  },
  isDateInFuture(date, startTime, now = new Date()) {
    return new Date(`${date}T${startTime}:00`) > now ? { valid: true } : { valid: false, reason: "Fecha pasada." };
  },
  isValidStatusTransition(current, nextStatus) {
    const t = { PENDING: ["CONFIRMED", "CANCELLED"], CONFIRMED: ["CANCELLED", "COMPLETED"], CANCELLED: [], COMPLETED: [] };
    return (t[current] || []).includes(nextStatus) ? { valid: true } : { valid: false, reason: "Transición inválida." };
  }
};
module.exports = BookingRules;