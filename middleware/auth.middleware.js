const jwt = require("jsonwebtoken");
const { secret_key } = require("../configs/jwt.config");
const { refreshToken } = require("../utils/jwt.utils");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.Authorization || req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    const [bearer, token] = authHeader.split(" ");

    if (!token) {
      return res.status(401).json({ message: "Unathorized : Missing Token!" });
    }

    try {
      const decoded = jwt.verify(token, secret_key);
      req.user = decoded;

      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - currentTime;

      if (timeUntilExpiry < 15 * 60) {
        const newToken = refreshToken(token);
        res.set("X-Refreshed-Token", newToken);
      }

      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "Token expired",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(403).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
};

module.exports = { authenticateToken };
