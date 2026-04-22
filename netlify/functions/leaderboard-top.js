const { query } = require("./_lib/db");
const {
  InputError,
  validateGameKey,
  parseLimit,
} = require("./_lib/validation");
const { ok, badRequest, methodNotAllowed, internalError } = require("./_lib/response");

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") {
    return methodNotAllowed(["GET"]);
  }

  try {
    const gameKey = validateGameKey(event.queryStringParameters?.gameKey);
    const limit = parseLimit(event.queryStringParameters?.limit, 10);

    const result = await query(
      `SELECT u.username, MAX(s.score)::int AS score
       FROM scores s
       JOIN users u ON u.id = s.user_id
       WHERE s.game_key = $1
       GROUP BY u.username
       ORDER BY score DESC, u.username ASC
       LIMIT $2`,
      [gameKey, limit]
    );

    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      username: row.username,
      score: row.score,
    }));

    return ok({
      gameKey,
      leaderboard,
    });
  } catch (error) {
    if (error instanceof InputError) {
      return badRequest(error.message);
    }
    return internalError(error, "leaderboard-top");
  }
};
