const { findUserById, submitScore } = require("./_lib/db");
const { readAuthToken, verifyToken } = require("./_lib/auth");
const {
  InputError,
  parseJsonBody,
  validateScore,
  validateGameKey,
} = require("./_lib/validation");
const {
  created,
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

    const body = parseJsonBody(event);
    const score = validateScore(body.score);
    const gameKey = validateGameKey(body.gameKey);

    const user = await findUserById(payload.sub);
    if (!user) {
      return unauthorized("User no longer exists.");
    }

    const personalBest = await submitScore({
      userId: payload.sub,
      username: user.username,
      gameKey,
      score,
    });

    return created({
      submittedScore: score,
      personalBest,
      gameKey,
    });
  } catch (error) {
    if (error instanceof InputError) {
      return badRequest(error.message);
    }
    return internalError(error, "leaderboard-submit");
  }
};
