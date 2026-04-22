class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = "InputError";
  }
}

function parseJsonBody(event) {
  if (!event.body) {
    return {};
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throw new InputError("Request body must be valid JSON.");
  }
}

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new InputError(`${fieldName} is required.`);
  }
  return value.trim();
}

function validateEmail(email) {
  const normalized = requireNonEmptyString(email, "Email").toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(normalized)) {
    throw new InputError("Email format is invalid.");
  }
  return normalized;
}

function validateUsername(username) {
  const normalized = requireNonEmptyString(username, "Username");
  const usernamePattern = /^[A-Za-z0-9_]{3,24}$/;
  if (!usernamePattern.test(normalized)) {
    throw new InputError("Username must be 3-24 chars and only letters, numbers, or underscore.");
  }
  return normalized;
}

function validatePassword(password) {
  const normalized = requireNonEmptyString(password, "Password");
  if (normalized.length < 8) {
    throw new InputError("Password must be at least 8 characters.");
  }
  return normalized;
}

function validateIdentifier(identifier) {
  return requireNonEmptyString(identifier, "Identifier");
}

function validateScore(score) {
  if (!Number.isInteger(score)) {
    throw new InputError("Score must be an integer.");
  }
  if (score < 0 || score > 1000000) {
    throw new InputError("Score must be between 0 and 1,000,000.");
  }
  return score;
}

function validateGameKey(gameKey) {
  const value = gameKey ? gameKey.trim() : "cheese-clicker";
  const gameKeyPattern = /^[a-z0-9-]{3,40}$/;
  if (!gameKeyPattern.test(value)) {
    throw new InputError("gameKey must be 3-40 chars using lowercase letters, numbers, and hyphen.");
  }
  return value;
}

function parseLimit(limitRaw, defaultValue = 10) {
  if (limitRaw === undefined || limitRaw === null || limitRaw === "") {
    return defaultValue;
  }

  const limit = Number.parseInt(limitRaw, 10);
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new InputError("limit must be an integer between 1 and 50.");
  }

  return limit;
}

module.exports = {
  InputError,
  parseJsonBody,
  validateEmail,
  validateUsername,
  validatePassword,
  validateIdentifier,
  validateScore,
  validateGameKey,
  parseLimit,
};
