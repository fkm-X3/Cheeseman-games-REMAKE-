import { NextResponse } from "next/server";
import { findUserByIdentifier } from "../../../../lib/server/db.mjs";
import { signToken, verifyPassword } from "../../../../lib/server/auth.mjs";
import {
  InputError,
  parseJsonBody,
  validateIdentifier,
  validatePassword,
} from "../../../../lib/server/validation.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await parseJsonBody(request);
    const identifier = validateIdentifier(body.identifier).toLowerCase();
    const password = validatePassword(body.password);

    const userRow = await findUserByIdentifier(identifier);
    if (!userRow) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const passwordMatches = await verifyPassword(password, userRow.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const user = {
      id: userRow.id,
      username: userRow.username,
      email: userRow.email,
    };
    const token = signToken(user);

    return NextResponse.json({
      token,
      user,
    });
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("[auth-login]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
