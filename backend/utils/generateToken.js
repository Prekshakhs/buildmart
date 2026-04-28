const jwt = require("jsonwebtoken");

/**
 * Generate a signed JWT token for a user
 * @param {string} userId - MongoDB user _id
 * @param {string} role - user role
 * @returns {string} signed JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = generateToken;
