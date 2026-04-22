const { query } = require("./_lib/db");
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

    await query(
      `INSERT INTO scores (user_id, game_key, score)
       VALUES ($1, $2, $3)`,
      [payload.sub, gameKey, score]
    );

    const bestResult = await query(
      `SELECT MAX(score)::int AS best_score
       FROM scores
       WHERE user_id = $1 AND game_key = $2`,
      [payload.sub, gameKey]
    );

    return created({
      submittedScore: score,
      personalBest: bestResult.rows[0].best_score || score,
      gameKey,
    });
  } catch (error) {
    if (error instanceof InputError) {
      return badRequest(error.message);
    }
    return internalError(error, "leaderboard-submit");
  }
};
