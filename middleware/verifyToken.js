import jwt from "jsonwebtoken";

// JWT secret key (same as in the login route)
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret";

// Middleware to verify the token
export function verifyToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Access denied, token missing" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    // Attach user info to the request object for later use
    req.user = decoded;
    next();
  });
}
