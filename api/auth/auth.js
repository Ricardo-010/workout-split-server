const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/**
 * Hashes a password, to store passwords securely.
 * @param {string} password- The user's password.
 * @return {string} A hashed password.
 */
async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 8);

    return hashedPassword;
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ error: "Failed to hash password." });
  }
}

/**
 * Validates a password with it's hashed counterpart.
 * @param {string} password- The user's password.
 * @param {string} passwordToMatch- The hashed password to match.
 * @return {Boolean} True - Passwords match. False - Passwords don't match.
 */
async function validPassword(password, passwordToMatch) {
  try {
    const isPasswordMatch = await bcrypt.compare(password, passwordToMatch);
    return isPasswordMatch;
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ error: "Failed to compare hased password." });
  }
}

/**
 * Generates a JSON web token to authenticate user's.
 * @param {Object} userDetails- The user's details.
 * @return {Object} JSON web token.
 */
function generateJWT(userDetails) {
    return jwt.sign(
        { userId: userDetails.recid, email: userDetails.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
}

module.exports = { hashPassword, validPassword, generateJWT };
