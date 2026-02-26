const jwt = require("jsonwebtoken");
const { secret_key } = require("../configs/jwt.config");

const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, secret_key, { expiresIn: "1hr" });
};

const refreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, secret_key, { ignoreExpiration: true });
    const { iat, exp, ...userData } = decoded;
    return jwt.sign(userData, secret_key, { expiresIn: "1h" });
  } catch (error) {
    throw new Error("Invalid token");
  }
};

module.exports = {
  generateToken,
  refreshToken,
};
