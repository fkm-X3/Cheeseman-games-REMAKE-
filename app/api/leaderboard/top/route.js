import { NextResponse } from "next/server";
import { getLeaderboard } from "../../../../lib/server/db.mjs";
import {
  InputError,
  validateGameKey,
  parseLimit,
} from "../../../../lib/server/validation.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const gameKey = validateGameKey(request.nextUrl.searchParams.get("gameKey"));
    const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 10);

    const topEntries = await getLeaderboard({ gameKey, limit });
    const leaderboard = topEntries.map((row, index) => ({
      rank: index + 1,
      username: row.username,
      score: row.score,
    }));

    return NextResponse.json({
      gameKey,
      leaderboard,
    });
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[leaderboard-top]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
