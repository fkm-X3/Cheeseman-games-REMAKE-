import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { requireEnv } from "./env.mjs";

const TOKEN_LIFETIME = "7d";

export function parseBearerToken(authorizationHeader) {
  if (!authorizationHeader || typeof authorizationHeader !== "string") {
    return null;
  }

  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token || null;
}

export function readAuthToken(authorizationHeader) {
  return parseBearerToken(authorizationHeader);
}

export function signToken(user) {
  const secret = requireEnv("JWT_SECRET");
  return jwt.sign({ sub: user.id, username: user.username }, secret, {
    expiresIn: TOKEN_LIFETIME,
  });
}

export function verifyToken(token) {
  const secret = requireEnv("JWT_SECRET");
  return jwt.verify(token, secret);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}
