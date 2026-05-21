const prisma = require("../prismaClient");
const BookingRepository = {
  async findById(id) { return prisma.booking.findUnique({ where: { id }, include: { user: true, court: true } }); },
  async findByUserId(userId) { return prisma.booking.findMany({ where: { userId }, orderBy: { date: "desc" } }); },
  async findByCourtAndDate(courtId, date) { return prisma.booking.findMany({ where: { courtId, date } }); },
  async createWithConflictCheck({ userId, courtId, date, startTime, endTime, notes }) {
    return prisma.$transaction(async (tx) => {
      const exist = await tx.booking.findFirst({ where: { courtId, date, startTime, status: { in: ["PENDING", "CONFIRMED"] } } });
      if (exist) { const err = new Error("Slot ocupado."); err.statusCode = 409; throw err; }
      return tx.booking.create({ data: { userId, courtId, date, startTime, endTime, notes } });
    });
  },
  async updateStatus(id, status, cancelledBy = null) {
    const data = { status };
    if (status === "CANCELLED") { data.cancelledAt = new Date(); data.cancelledBy = cancelledBy; }
    return prisma.booking.update({ where: { id }, data });
  },
  async findAll() { return prisma.booking.findMany(); }
};
module.exports = BookingRepository;