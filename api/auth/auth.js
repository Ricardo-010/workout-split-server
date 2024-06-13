const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

async function hashPassword(password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 8);

    return hashedPassword;
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ error: "Failed to hash password." });
  }
}

async function validPassword(password, passwordToMatch) {
  try {
    const isPasswordMatch = await bcrypt.compare(password, passwordToMatch);
    return isPasswordMatch;
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ error: "Failed to compare hased password." });
  }
}

function generateJWT(userDetails) {
    return jwt.sign(
        { userId: userDetails.recid, email: userDetails.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
}

module.exports = { hashPassword, validPassword, generateJWT };
