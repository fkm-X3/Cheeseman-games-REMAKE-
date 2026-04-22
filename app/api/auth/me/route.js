import { NextResponse } from "next/server";
import { findUserById } from "../../../../lib/server/db.mjs";
import { readAuthToken, verifyToken } from "../../../../lib/server/auth.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
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

    const user = await findUserById(payload.sub);
    if (!user) {
      return NextResponse.json({ error: "User no longer exists." }, { status: 401 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("[auth-me]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
