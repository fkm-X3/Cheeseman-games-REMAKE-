import { NextResponse, NextRequest } from "next/server";
import { findUserById } from "../../../../lib/server/db.mjs";
import { readAuthToken, verifyToken } from "../../../../lib/server/auth.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface UserPayload {
  id: string;
  username: string;
  email: string;
}

interface MeResponse {
  user: UserPayload;
}

interface TokenPayload {
  sub: string;
  [key: string]: unknown;
}

export async function GET(request: NextRequest) {
  try {
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

    const user = await findUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ error: "User no longer exists." }, { status: 401 });
    }

    return NextResponse.json<MeResponse>({ user });
  } catch (error: unknown) {
    console.error("[auth-me]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
