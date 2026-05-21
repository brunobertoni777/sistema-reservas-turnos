const asyncHandler = require("../middlewares/asyncHandler");
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
module.exports = courtController;