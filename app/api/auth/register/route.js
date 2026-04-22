import { NextResponse } from "next/server";
import { createUser, DuplicateUserError } from "../../../../lib/server/db.mjs";
import { hashPassword, signToken } from "../../../../lib/server/auth.mjs";
import {
  InputError,
  parseJsonBody,
  validateEmail,
  validateUsername,
  validatePassword,
} from "../../../../lib/server/validation.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const body = await parseJsonBody(request);
    const username = validateUsername(body.username);
    const email = validateEmail(body.email);
    const password = validatePassword(body.password);
    const passwordHash = await hashPassword(password);

    const user = await createUser({
      username,
      email,
      passwordHash,
    });
    const token = signToken(user);

    return NextResponse.json(
      {
        token,
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof InputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof DuplicateUserError) {
      return NextResponse.json({ error: "Username or email already exists." }, { status: 409 });
    }
    console.error("[auth-register]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
