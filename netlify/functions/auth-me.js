const { findUserById } = require("./_lib/db");
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

    const user = await findUserById(payload.sub);
    if (!user) {
      return unauthorized("User no longer exists.");
    }

    return ok({
      user,
    });
  } catch (error) {
    return internalError(error, "auth-me");
  }
};
