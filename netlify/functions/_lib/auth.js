const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { requireEnv } = require("./env");

const TOKEN_LIFETIME = "7d";

function parseBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return null;
  }

  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token || null;
}

function readAuthToken(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  return parseBearerToken(authHeader);
}

function signToken(user) {
  const secret = requireEnv("JWT_SECRET");
  return jwt.sign({ sub: user.id, username: user.username }, secret, {
    expiresIn: TOKEN_LIFETIME,
  });
}

function verifyToken(token) {
  const secret = requireEnv("JWT_SECRET");
  return jwt.verify(token, secret);
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

module.exports = {
  parseBearerToken,
  readAuthToken,
  signToken,
  verifyToken,
  hashPassword,
  verifyPassword,
};
