const { query } = require("./_lib/db");
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

    const result = await query(
      `SELECT id, username, email, password_hash
       FROM users
       WHERE lower(email) = $1 OR lower(username) = $1
       LIMIT 1`,
      [identifier]
    );

    if (!result.rows[0]) {
      return unauthorized("Invalid credentials.");
    }

    const userRow = result.rows[0];
    const passwordMatches = await verifyPassword(password, userRow.password_hash);
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
