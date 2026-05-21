const { Router } = require("express");
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

module.exports = router;