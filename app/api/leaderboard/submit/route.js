import { NextResponse } from "next/server";
import { findUserById, submitScore } from "../../../../lib/server/db.mjs";
import { readAuthToken, verifyToken } from "../../../../lib/server/auth.mjs";
import {
  InputError,
  parseJsonBody,
  validateScore,
  validateGameKey,
} from "../../../../lib/server/validation.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const token = readAuthToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Missing bearer token." }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }

    const body = await parseJsonBody(request);
    const score = validateScore(body.score);
    const gameKey = validateGameKey(body.gameKey);

    const user = await findUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ error: "User no longer exists." }, { status: 401 });
    }

    const personalBest = await submitScore({
      userId: payload.sub,
      username: user.username,
      gameKey,
      score,
    });

    return NextResponse.json(
      {
        submittedScore: score,
        personalBest,
        gameKey,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[leaderboard-submit]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
