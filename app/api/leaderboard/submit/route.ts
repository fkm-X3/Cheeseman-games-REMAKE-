import { NextResponse, NextRequest } from "next/server";
import { findUserById, submitScore } from "../../../../lib/server/db.mjs";
import { readAuthToken, verifyToken } from "../../../../lib/server/auth.mjs";
import {
  assertWriteOriginAllowed,
  OriginNotAllowedError,
} from "../../../../lib/server/security.mjs";
import {
  InputError,
  parseJsonBody,
  validateScore,
  validateGameKey,
} from "../../../../lib/server/validation.mjs";

export const runtime = "nodejs";

interface SubmitRequestBody {
  score: number;
  gameKey: string;
}

interface SubmitResponse {
  submittedScore: number;
  personalBest: number;
  gameKey: string;
}

interface TokenPayload {
  sub: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    assertWriteOriginAllowed(request);

    const token = readAuthToken(request.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Missing bearer token." }, { status: 401 });
    }

    let payload: TokenPayload;
    try {
      const decoded = verifyToken(token);
      if (typeof decoded === "string") {
        return NextResponse.json({ error: "Invalid token." }, { status: 401 });
      }
      payload = decoded as TokenPayload;
    } catch {
      return NextResponse.json({ error: "Invalid token." }, { status: 401 });
    }

    const body = (await parseJsonBody(request)) as SubmitRequestBody;
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

    return NextResponse.json<SubmitResponse>(
      {
        submittedScore: score,
        personalBest,
        gameKey,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof OriginNotAllowedError) {
      return NextResponse.json({ error: (error as OriginNotAllowedError).message }, { status: 403 });
    }
    if (error instanceof InputError) {
      return NextResponse.json({ error: (error as InputError).message }, { status: 400 });
    }
    console.error("[leaderboard-submit]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
