import jwt from "jsonwebtoken";

const authorize = (allowedRoles = []) => (req, res, next) => {
  let token = req.cookies?.auth_token || req.cookies?.token;

  // Also check Authorization header
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token)
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.SECRET_KEY);
    req.user = decoded;

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }

    next(); // Move to the next middleware or controller
  } catch (err) {
    console.error("Token verification error:", err.message);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(400).json({ message: "Invalid token" });
  }
};

export default authorize;