const { z } = require("zod");
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
module.exports = { validate, schemas };