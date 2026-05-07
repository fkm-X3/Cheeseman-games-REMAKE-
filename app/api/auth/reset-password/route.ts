import { NextResponse, NextRequest } from "next/server";
import { assertWriteOriginAllowed, OriginNotAllowedError } from "../../../../lib/server/security";
import { InputError, parseJsonBody, validatePassword } from "../../../../lib/server/validation";
import { hashPassword } from "../../../../lib/server/auth";
import crypto from "crypto";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertWriteOriginAllowed(request);

    const body = (await parseJsonBody(request)) as { token?: string; password?: string };
    const token = String(body.token || "");
    const password = validatePassword(body.password);

    if (!token) {
      throw new InputError("Token is required.");
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const firestore = getFirestore();
    const tokenDoc = await firestore.collection("password_reset_tokens").doc(tokenHash).get();

    if (!tokenDoc.exists) {
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
    }

    const tokenData = tokenDoc.data();
    const expiresAtRaw = tokenData?.expiresAt;
    const expiresAt = expiresAtRaw && typeof (expiresAtRaw as any).toDate === "function" ? (expiresAtRaw as any).toDate() : new Date(expiresAtRaw);
    if (expiresAt && expiresAt.getTime() < Date.now()) {
      await firestore.collection("password_reset_tokens").doc(tokenHash).delete().catch(() => {});
      return NextResponse.json({ error: "Invalid or expired token." }, { status: 400 });
    }

    const userId = tokenData.userId;
    if (!userId) {
      return NextResponse.json({ error: "Invalid token data." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const userRef = firestore.collection("users").doc(userId);
    await userRef.update({ passwordHash });

    await firestore.collection("password_reset_tokens").doc(tokenHash).delete();
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof OriginNotAllowedError) {
      return NextResponse.json({ error: (error as OriginNotAllowedError).message }, { status: 403 });
    }
    if (error instanceof InputError) {
      return NextResponse.json({ error: (error as InputError).message }, { status: 400 });
    }
    console.error("[auth-reset-password]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
