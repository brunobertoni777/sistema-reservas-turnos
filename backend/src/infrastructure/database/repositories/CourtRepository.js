const prisma = require("../prismaClient");
const CourtRepository = {
  async findById(id) { return prisma.court.findUnique({ where: { id }, include: { complex: true } }); },
  async findAll(filters = {}) { return prisma.court.findMany({ where: filters.sport ? { sport: filters.sport } : {} }); },
  async findSlotsByDayOfWeek(courtId, dayOfWeek) { return prisma.slot.findMany({ where: { courtId, dayOfWeek }, orderBy: { startTime: "asc" } }); },
  async create(data) { return prisma.court.create({ data }); },
  async update(id, data) { return prisma.court.update({ where: { id }, data }); },
  async deactivate(id) { return prisma.court.delete({ where: { id } }); }
};
module.exports = CourtRepository;