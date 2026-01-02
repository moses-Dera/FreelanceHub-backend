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

  console.log('Authorization Debug:', {
    hasAuthHeader: !!req.headers.authorization,
    authHeader: req.headers.authorization,
    token: token ? 'Present' : 'Missing',
    cookies: req.cookies
  });

  if (!token)
    return res
      .status(403)
      .json({ message: "Access denied. No token provided." });

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) console.warn("WARNING: JWT_SECRET is missing!");

    console.log(`Verifying token... Secret length: ${secret?.length}`);
    const decoded = jwt.verify(token, secret);
    req.user = decoded;

    if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }

    next();
  } catch (err) {
    console.error("Token verification error:", err.message);

    // DEBUG: Write token to file to inspect it
    import('fs').then(fs => {
      fs.promises.writeFile('debug_token.txt', `Time: ${new Date().toISOString()}\nError: ${err.message}\nToken: "${token}"\n`).catch(e => console.error("File write error:", e));
    });

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(400).json({ message: "Invalid token", error: err.message });
  }
};

export default authorize;