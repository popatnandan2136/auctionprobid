export default (roles) => (req, res, next) => {
  const userRoles = Array.isArray(roles) ? roles : [roles];
  if (!userRoles.includes(req.user.role)) {
    return res.status(403).json({ msg: "Access denied: insufficient permissions" });
  }
  next();
};