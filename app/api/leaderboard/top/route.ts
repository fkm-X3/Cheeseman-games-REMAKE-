import { NextResponse, NextRequest } from "next/server";
import { getLeaderboard } from "../../../../lib/server/db.mjs";
import {
  InputError,
  validateGameKey,
  parseLimit,
} from "../../../../lib/server/validation.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

interface TopResponse {
  gameKey: string;
  leaderboard: LeaderboardEntry[];
}

interface DatabaseRow {
  username: string;
  score: number;
}

export async function GET(request: NextRequest) {
  try {
    const gameKey = validateGameKey(request.nextUrl.searchParams.get("gameKey"));
    const limit = parseLimit(request.nextUrl.searchParams.get("limit"), 10);

    const topEntries = await getLeaderboard({ gameKey, limit });
    const leaderboard: LeaderboardEntry[] = topEntries.map((row: DatabaseRow, index: number) => ({
      rank: index + 1,
      username: row.username,
      score: row.score,
    }));

    return NextResponse.json<TopResponse>({
      gameKey,
      leaderboard,
    });
  } catch (error: unknown) {
    if (error instanceof InputError) {
      return NextResponse.json({ error: (error as InputError).message }, { status: 400 });
    }
    console.error("[leaderboard-top]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
