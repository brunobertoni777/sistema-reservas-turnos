const asyncHandler = require("../middlewares/asyncHandler");
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
module.exports = authController;