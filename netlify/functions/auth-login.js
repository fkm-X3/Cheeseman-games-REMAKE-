const { findUserByIdentifier } = require("./_lib/db");
const { signToken, verifyPassword } = require("./_lib/auth");
const {
  InputError,
  parseJsonBody,
  validateIdentifier,
  validatePassword,
} = require("./_lib/validation");
const {
  ok,
  badRequest,
  unauthorized,
  methodNotAllowed,
  internalError,
} = require("./_lib/response");

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  try {
    const body = parseJsonBody(event);
    const identifier = validateIdentifier(body.identifier).toLowerCase();
    const password = validatePassword(body.password);

    const userRow = await findUserByIdentifier(identifier);
    if (!userRow) {
      return unauthorized("Invalid credentials.");
    }

    const passwordMatches = await verifyPassword(password, userRow.passwordHash);
    if (!passwordMatches) {
      return unauthorized("Invalid credentials.");
    }

    const user = {
      id: userRow.id,
      username: userRow.username,
      email: userRow.email,
    };
    const token = signToken(user);

    return ok({
      token,
      user,
    });
  } catch (error) {
    if (error instanceof InputError) {
      return badRequest(error.message);
    }
    return internalError(error, "auth-login");
  }
};
