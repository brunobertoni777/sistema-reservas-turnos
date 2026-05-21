const asyncHandler = require("../middlewares/asyncHandler");
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
module.exports = bookingController;