# instalar.py
import os

# Definición de la estructura de carpetas y archivos con su respectivo contenido
project_structure = {
    # RAÍZ DEL PROYECTO
    "package.json": '''{
  "name": "turnos-backend",
  "version": "1.0.0",
  "description": "API REST para gestión de turnos deportivos",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate",
    "db:seed": "node prisma/seed.js"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "express-rate-limit": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0",
    "prisma": "^5.0.0"
  }
}''',

    ".env.example": '''# .env.example
DATABASE_URL="postgresql://postgres:123456789@localhost:5432/turnos_db?sslmode=prefer"
JWT_SECRET="cambia_esto_por_un_secreto_seguro_y_largo"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:5173"''',

    # CAPA DE PRISMA
    "prisma/schema.prisma": '''generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  CLIENT
  ADMIN
  SUPER_ADMIN
}

enum Sport {
  FOOTBALL
  PADEL
  TENNIS
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  EXPIRED
  COMPLETED
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  name         String
  role         Role      @default(CLIENT)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  bookings     Booking[]
}

model Complex {
  id        String   @id @default(cuid())
  name      String
  address   String
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  courts    Court[]
}

model Court {
  id                  String    @id @default(cuid())
  name                String
  sport               Sport
  slotDurationMinutes Int       @default(60)
  description         String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
  complexId           String
  complex             Complex   @relation(fields: [complexId], references: [id])
  slots               Slot[]
  bookings            Booking[]
}

model Slot {
  id        String    @id @default(cuid())
  dayOfWeek DayOfWeek
  startTime String
  endTime   String
  courtId   String
  court     Court     @relation(fields: [courtId], references: [id])

  @@unique([courtId, dayOfWeek, startTime])
}

model Booking {
  id          String        @id @default(cuid())
  date        String
  startTime   String
  endTime     String
  status      BookingStatus @default(CONFIRMED)
  notes       String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  cancelledAt DateTime?
  cancelledBy String?
  userId      String
  user        User          @relation(fields: [userId], references: [id])
  courtId     String
  court       Court         @relation(fields: [courtId], references: [id])

  @@unique([courtId, date, startTime])
}''',

    "prisma/seed.js": '''const { PrismaClient } = require("@prisma/client");
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
main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });''',

    # SERVIDORES PRINCIPALES
    "src/server.js": '''require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  print(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
process.on("unhandledRejection", (reason) => { server.close(() => process.exit(1)); });
process.on("uncaughtException", (error) => { server.close(() => process.exit(1)); });''',

    "src/app.js": '''const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const routes = require("./infrastructure/http/routes/index");
const errorHandler = require("./infrastructure/http/middlewares/errorHandler");

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10kb" }));

const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use(generalLimiter);

app.get("/health", (req, res) => { res.status(200).json({ status: "ok", timestamp: new Date().toISOString() }); });
app.use("/api/v1", routes);
app.use((req, res) => { res.status(404).json({ success: false, error: `Ruta ${req.method} ${req.path} no encontrada.`, code: "NOT_FOUND" }); });
app.use(errorHandler);

module.exports = app;''',

    # MIDDLEWARES
    "src/infrastructure/http/middlewares/asyncHandler.js": '''function asyncHandler(fn) {
  return function (req, res, next) { Promise.resolve(fn(req, res, next)).catch(next); };
}
module.exports = asyncHandler;''',

    "src/infrastructure/http/middlewares/authenticate.js": '''const jwt = require("jsonwebtoken");
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Token no proporcionado.", code: "NO_TOKEN" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Token inválido o expirado.", code: "INVALID_TOKEN" });
  }
}
module.exports = authenticate;''',

    "src/infrastructure/http/middlewares/authorize.js": '''function authorize(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ success: false, error: "No autenticado.", code: "NOT_AUTHENTICATED" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "No tenés permisos para realizar esta acción.", code: "FORBIDDEN" });
    }
    next();
  };
}
module.exports = authorize;''',

    "src/infrastructure/http/middlewares/errorHandler.js": '''function errorHandler(error, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}`, { message: error.message, code: error.code });
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === "production" ? "Error interno del servidor." : error.message;
  return res.status(statusCode).json({ success: false, error: message, code: error.code || "INTERNAL_ERROR" });
}
module.exports = errorHandler;''',

    "src/infrastructure/http/middlewares/validate.js": '''const { z } = require("zod");
const registerSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(8, "Mínimo 8 caracteres."),
  name: z.string().min(2)
});
const loginSchema = z.object({ email: z.string().email(), password: z.string() });
const createBookingSchema = z.object({ courtId: z.string(), date: z.string(), startTime: z.string(), notes: z.string().optional() });
const createCourtSchema = z.object({ name: z.string(), sport: z.enum(["FOOTBALL", "PADEL", "TENNIS"]), slotDurationMinutes: z.number().int(), complexId: z.string(), description: z.string().optional() });

const schemas = { register: registerSchema, login: loginSchema, createBooking: createBookingSchema, createCourt: createCourtSchema };

function validate(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ success: false, error: "Datos inválidos.", code: "VALIDATION_ERROR", details: result.error.errors });
    }
    req.body = result.data;
    next();
  };
}
module.exports = { validate, schemas };''',

    # RUTAS
    "src/infrastructure/http/routes/index.js": '''const { Router } = require("express");
const authenticate = require("../middlewares/authenticate");
const authorize = require("../middlewares/authorize");
const { validate, schemas } = require("../middlewares/validate");
const authController = require("../controllers/authController");
const bookingController = require("../controllers/bookingController");
const courtController = require("../controllers/courtController");

const router = Router();
router.post("/auth/register", validate(schemas.register), authController.register);
router.post("/auth/login", validate(schemas.login), authController.login);
router.get("/auth/me", authenticate, authController.me);

router.get("/courts", courtController.list);
router.get("/courts/:id/availability", courtController.availability);

router.post("/bookings", authenticate, validate(schemas.createBooking), bookingController.create);
router.get("/bookings/my", authenticate, bookingController.myBookings);
router.patch("/bookings/:id/cancel", authenticate, bookingController.cancel);

router.get("/admin/bookings", authenticate, authorize("ADMIN", "SUPER_ADMIN"), bookingController.adminList);
router.post("/admin/courts", authenticate, authorize("ADMIN", "SUPER_ADMIN"), validate(schemas.createCourt), courtController.create);
router.patch("/admin/courts/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), courtController.update);
router.delete("/admin/courts/:id", authenticate, authorize("ADMIN", "SUPER_ADMIN"), courtController.deactivate);

module.exports = router;''',

    # CONTROLADORES
    "src/infrastructure/http/controllers/authController.js": '''const asyncHandler = require("../middlewares/asyncHandler");
const { registerUser, loginUser } = require("../../../application/auth/AuthUseCases");
const authController = {
  register: asyncHandler(async (req, res) => {
    const { user, token } = await registerUser(req.body);
    return res.status(201).json({ success: true, data: { user, token } });
  }),
  login: asyncHandler(async (req, res) => {
    const { user, token } = await loginUser(req.body);
    return res.status(200).json({ success: true, data: { user, token } });
  }),
  me: asyncHandler(async (req, res) => {
    return res.status(200).json({ success: true, data: { user: req.user } });
  })
};
module.exports = authController;''',

    "src/infrastructure/http/controllers/courtController.js": '''const asyncHandler = require("../middlewares/asyncHandler");
const CourtRepository = require("../../database/repositories/CourtRepository");
const { getCourtAvailability } = require("../../../application/court/GetCourtAvailability");
const courtController = {
  list: asyncHandler(async (req, res) => {
    const courts = await CourtRepository.findAll({ sport: req.query.sport });
    return res.status(200).json({ success: true, data: { courts } });
  }),
  availability: asyncHandler(async (req, res) => {
    const data = await getCourtAvailability(req.params.id, req.query.date);
    return res.status(200).json({ success: true, data });
  }),
  create: asyncHandler(async (req, res) => {
    const court = await CourtRepository.create(req.body);
    return res.status(201).json({ success: true, data: { court } });
  }),
  update: asyncHandler(async (req, res) => {
    const court = await CourtRepository.update(req.params.id, req.body);
    return res.status(200).json({ success: true, data: { court } });
  }),
  deactivate: asyncHandler(async (req, res) => {
    await CourtRepository.deactivate(req.params.id);
    return res.status(200).json({ success: true, message: "Cancha eliminada." });
  })
};
module.exports = courtController;''',

    "src/infrastructure/http/controllers/bookingController.js": '''const asyncHandler = require("../middlewares/asyncHandler");
const { createBooking } = require("../../../application/booking/CreateBooking");
const { cancelBooking } = require("../../../application/booking/CancelBooking");
const BookingRepository = require("../../database/repositories/BookingRepository");
const bookingController = {
  create: asyncHandler(async (req, res) => {
    const booking = await createBooking({ userId: req.user.id, ...req.body });
    return res.status(201).json({ success: true, data: { booking } });
  }),
  myBookings: asyncHandler(async (req, res) => {
    const bookings = await BookingRepository.findByUserId(req.user.id);
    return res.status(200).json({ success: true, data: { bookings } });
  }),
  cancel: asyncHandler(async (req, res) => {
    const booking = await cancelBooking({ bookingId: req.params.id, requestingUserId: req.user.id, requestingRole: req.user.role });
    return res.status(200).json({ success: true, data: { booking } });
  }),
  adminList: asyncHandler(async (req, res) => {
    const bookings = await BookingRepository.findAll(req.query);
    return res.status(200).json({ success: true, data: { bookings } });
  })
};
module.exports = bookingController;''',

    # PERSISTENCIA Y REPOSITORIOS (INCLUYE LOS FALTANTES)
    "src/infrastructure/database/prismaClient.js": '''const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
module.exports = prisma;''',

    "src/infrastructure/database/repositories/UserRepository.js": '''const prisma = require("../prismaClient");
const UserRepository = {
  async findByEmail(email) { return prisma.user.findUnique({ where: { email } }); },
  async create({ email, passwordHash, name }) { return prisma.user.create({ data: { email, passwordHash, name, role: "CLIENT" } }); },
  async findById(id) { return prisma.user.findUnique({ where: { id } }); }
};
module.exports = UserRepository;''',

    "src/infrastructure/database/repositories/CourtRepository.js": '''const prisma = require("../prismaClient");
const CourtRepository = {
  async findById(id) { return prisma.court.findUnique({ where: { id }, include: { complex: true } }); },
  async findAll(filters = {}) { return prisma.court.findMany({ where: filters.sport ? { sport: filters.sport } : {} }); },
  async findSlotsByDayOfWeek(courtId, dayOfWeek) { return prisma.slot.findMany({ where: { courtId, dayOfWeek }, orderBy: { startTime: "asc" } }); },
  async create(data) { return prisma.court.create({ data }); },
  async update(id, data) { return prisma.court.update({ where: { id }, data }); },
  async deactivate(id) { return prisma.court.delete({ where: { id } }); }
};
module.exports = CourtRepository;''',

    "src/infrastructure/database/repositories/BookingRepository.js": '''const prisma = require("../prismaClient");
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
module.exports = BookingRepository;''',

    # REGLAS DE DOMINIO Y CASOS DE USO
    "src/domain/booking/BookingRules.js": '''const BookingRules = {
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
module.exports = BookingRules;''',

    "src/application/auth/AuthUseCases.js": '''const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserRepository = require("../../infrastructure/database/repositories/UserRepository");

function generateToken(user) { return jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" }); }

async function registerUser({ email, password, name }) {
  if (await UserRepository.findByEmail(email)) throw new Error("Email ya registrado.");
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserRepository.create({ email, passwordHash, name });
  return { user, token: generateToken(user) };
}
async function loginUser({ email, password }) {
  const user = await UserRepository.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new Error("Credenciales inválidas.");
  return { user, token: generateToken(user) };
}
module.exports = { registerUser, loginUser };''',

    "src/application/booking/CreateBooking.js": '''const BookingRepository = require("../../infrastructure/database/repositories/BookingRepository");
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
module.exports = { createBooking };''',

    "src/application/booking/CancelBooking.js": '''const BookingRepository = require("../../infrastructure/database/repositories/BookingRepository");
const BookingRules = require("../../domain/booking/BookingRules");

async function cancelBooking({ bookingId, requestingUserId, requestingRole }) {
  const booking = await BookingRepository.findById(bookingId);
  if (!booking) throw new Error("Reserva no existe.");
  const isAdmin = ["ADMIN", "SUPER_ADMIN"].includes(requestingRole);
  if (booking.userId !== requestingUserId && !isAdmin) throw new Error("No autorizado.");
  
  if (!isAdmin && !BookingRules.canBeCancelled(booking.date, booking.startTime).allowed) throw new Error("Fuera de término.");
  return BookingRepository.updateStatus(bookingId, "CANCELLED", requestingUserId);
}
module.exports = { cancelBooking };''',

    "src/application/court/GetCourtAvailability.js": '''const CourtRepository = require("../../infrastructure/database/repositories/CourtRepository");
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
module.exports = { getCourtAvailability };'''
}

print("⚙️ Generando la arquitectura limpia del proyecto...")

for filepath, content in project_structure.items():
    dirname = os.path.dirname(filepath)
    if dirname and not os.path.exists(dirname):
        os.makedirs(dirname, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"  └─ Creando: {filepath}")

print("\\n✅ ESTRUCTURA COMPLETA CREADA CON ÉXITO.")
print("Ahora ejecutá en tu terminal:")
print("  1. npm install")
print("  2. cp .env.example .env  (Y configurá tu base de datos ahí)")
print("  3. npm run db:migrate")
print("  4. npm run db:seed")
print("  5. npm run dev")