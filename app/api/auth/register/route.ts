import { NextResponse, NextRequest } from "next/server";
import { createUser, DuplicateUserError } from "../../../../lib/server/db.mjs";
import { hashPassword, signToken } from "../../../../lib/server/auth.mjs";
import {
  assertWriteOriginAllowed,
  OriginNotAllowedError,
} from "../../../../lib/server/security.mjs";
import {
  InputError,
  parseJsonBody,
  validateEmail,
  validateUsername,
  validatePassword,
} from "../../../../lib/server/validation.mjs";

export const runtime = "nodejs";

interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
}

interface UserPayload {
  id: string;
  username: string;
  email: string;
}

interface RegisterResponse {
  token: string;
  user: UserPayload;
}

export async function POST(request: NextRequest) {
  try {
    assertWriteOriginAllowed(request);

    const body = (await parseJsonBody(request)) as RegisterRequestBody;
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

    return NextResponse.json<RegisterResponse>(
      {
        token,
        user,
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
    if (error instanceof DuplicateUserError) {
      return NextResponse.json({ error: "Username or email already exists." }, { status: 409 });
    }
    console.error("[auth-register]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
