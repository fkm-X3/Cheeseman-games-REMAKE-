const PRODUCTION_ALLOWED_ORIGIN = "https://cheeseman-games-remake.vercel.app";
const DEVELOPMENT_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

export class OriginNotAllowedError extends Error {
  constructor(message = "Request origin is not allowed.") {
    super(message);
    this.name = "OriginNotAllowedError";
  }
}

function normalizeOrigin(value) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function parseConfiguredOrigins(configuredOrigins) {
  if (typeof configuredOrigins !== "string" || !configuredOrigins.trim()) {
    return [];
  }

  return configuredOrigins
    .split(",")
    .map((entry) => normalizeOrigin(entry.trim()))
    .filter(Boolean);
}

export function getAllowedWriteOrigins(options = {}) {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV;
  const configuredOrigins = options.configuredOrigins ?? process.env.ALLOWED_WRITE_ORIGINS;

  const customOrigins = parseConfiguredOrigins(configuredOrigins);
  if (customOrigins.length) {
    return [...new Set(customOrigins)];
  }

  const defaults = [PRODUCTION_ALLOWED_ORIGIN];
  if (nodeEnv !== "production") {
    defaults.push(...DEVELOPMENT_ALLOWED_ORIGINS);
  }

  return defaults;
}

export function assertWriteOriginAllowed(request, options = {}) {
  const origin = normalizeOrigin(request.headers.get("origin"));
  if (!origin) {
    throw new OriginNotAllowedError();
  }

  const allowedOrigins = getAllowedWriteOrigins(options);
  if (!allowedOrigins.includes(origin)) {
    throw new OriginNotAllowedError();
  }

  return origin;
}
