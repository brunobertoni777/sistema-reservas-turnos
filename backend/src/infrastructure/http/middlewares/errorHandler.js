function errorHandler(error, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}`, { message: error.message, code: error.code });
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === "production" ? "Error interno del servidor." : error.message;
  return res.status(statusCode).json({ success: false, error: message, code: error.code || "INTERNAL_ERROR" });
}
module.exports = errorHandler;