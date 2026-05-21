function authorize(...allowedRoles) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ success: false, error: "No autenticado.", code: "NOT_AUTHENTICATED" });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "No tenés permisos para realizar esta acción.", code: "FORBIDDEN" });
    }
    next();
  };
}
module.exports = authorize;