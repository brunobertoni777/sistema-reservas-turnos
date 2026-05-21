const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");
  await prisma.booking.deleteMany();
  await prisma.slot.deleteMany();
  await prisma.court.deleteMany();
  await prisma.complex.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.create({ data: { email: "superadmin@turnos.com", passwordHash, name: "Super Admin", role: "SUPER_ADMIN" } });
  await prisma.user.create({ data: { email: "admin@turnos.com", passwordHash, name: "Admin Complejo", role: "ADMIN" } });
  const client = await prisma.user.create({ data: { email: "cliente@turnos.com", passwordHash, name: "Juan Cliente", role: "CLIENT" } });

  const complex = await prisma.complex.create({ data: { name: "Complejo Central", address: "Av. Siempre Viva 123", phone: "12345678" } });
  const court = await prisma.court.create({ data: { name: "Cancha F5 1", sport: "FOOTBALL", slotDurationMinutes: 60, complexId: complex.id } });

  await prisma.slot.create({ data: { courtId: court.id, dayOfWeek: "MONDAY", startTime: "18:00", endTime: "19:00" } });
  await prisma.slot.create({ data: { courtId: court.id, dayOfWeek: "MONDAY", startTime: "19:00", endTime: "20:00" } });

  console.log("🎉 Seed completado con éxito!");
}
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });