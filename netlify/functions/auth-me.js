const { query } = require("./_lib/db");
const { readAuthToken, verifyToken } = require("./_lib/auth");
const { ok, unauthorized, methodNotAllowed, internalError } = require("./_lib/response");

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  try {
    const token = readAuthToken(event);
    if (!token) {
      return unauthorized("Missing bearer token.");
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return unauthorized("Invalid token.");
    }

    const result = await query(
      `SELECT id, username, email
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [payload.sub]
    );

    if (!result.rows[0]) {
      return unauthorized("User no longer exists.");
    }

    return ok({
      user: result.rows[0],
    });
  } catch (error) {
    return internalError(error, "auth-me");
  }
};
