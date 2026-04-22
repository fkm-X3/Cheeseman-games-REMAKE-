const { createUser, DuplicateUserError } = require("./_lib/db");
const { hashPassword, signToken } = require("./_lib/auth");
const {
  InputError,
  parseJsonBody,
  validateEmail,
  validateUsername,
  validatePassword,
} = require("./_lib/validation");
const {
  created,
  badRequest,
  conflict,
  methodNotAllowed,
  internalError,
} = require("./_lib/response");

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return methodNotAllowed(["POST"]);
  }

  try {
    const body = parseJsonBody(event);
    const username = validateUsername(body.username);
    const email = validateEmail(body.email);
    const password = validatePassword(body.password);
    const passwordHash = await hashPassword(password);

    const user = await createUser({
      username,
      email,
      passwordHash,
    });
    const token = signToken(user);

    return created({
      token,
      user,
    });
  } catch (error) {
    if (error instanceof InputError) {
      return badRequest(error.message);
    }
    if (error instanceof DuplicateUserError) {
      return conflict("Username or email already exists.");
    }
    return internalError(error, "auth-register");
  }
};
