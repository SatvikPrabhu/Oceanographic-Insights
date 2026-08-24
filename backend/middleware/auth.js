const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "posaidon_super_secure_jwt_secret_key_2026";

/**
 * Protect routes - Verifies JWT Bearer token
 */
async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      error: "Not authorized, no authentication token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "Not authorized, user account no longer exists",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    return res.status(401).json({
      error: "Not authorized, invalid or expired token",
    });
  }
}

/**
 * Role-Based Access Control (RBAC) - Restrict by user role
 * @param  {...string} roles - e.g. "researcher", "admin"
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required to access this resource",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized for this action. Required: ${roles.join(", ")}`,
      });
    }

    next();
  };
}

module.exports = {
  protect,
  authorize,
  JWT_SECRET,
};
