import { NextResponse, NextRequest } from "next/server";
import { findUserByIdentifier } from "../../../../lib/server/db";
import { sendResetEmail } from "../../../../lib/server/email";
import {
  assertWriteOriginAllowed,
  OriginNotAllowedError,
} from "../../../../lib/server/security";
import { InputError, parseJsonBody, validateEmail } from "../../../../lib/server/validation";
import crypto from "crypto";
import { getFirestore } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertWriteOriginAllowed(request);

    const body = (await parseJsonBody(request)) as { email?: string };
    const email = validateEmail(body.email);
    // Ensure Firestore is initialized (findUserByIdentifier does this) and perform rate-limiting.
    const userRow = await findUserByIdentifier(email);
    const firestore = getFirestore();

    // Rate limiting: max 5 attempts per email per hour
    const attemptsRef = firestore.collection("password_reset_attempts").doc(email);
    const now = new Date();
    const windowMs = 60 * 60 * 1000; // 1 hour
    const maxAttempts = 5;

    const allowed = await firestore.runTransaction(async (tx) => {
      const doc = await tx.get(attemptsRef);
      if (!doc.exists) {
        tx.set(attemptsRef, { count: 1, windowStart: now });
        return true;
      }
      const data = doc.data() || {};
      const wsRaw = data.windowStart;
      const windowStart =
        wsRaw && typeof (wsRaw as any).toDate === "function" ? (wsRaw as any).toDate() : new Date(wsRaw);

      if (now.getTime() - windowStart.getTime() > windowMs) {
        tx.set(attemptsRef, { count: 1, windowStart: now }, { merge: true });
        return true;
      }

      const count = Number(data.count || 0);
      if (count >= maxAttempts) {
        return false;
      }

      tx.update(attemptsRef, { count: count + 1 });
      return true;
    });

    if (!allowed) {
      // Rate-limited — respond generically to avoid user enumeration
      return NextResponse.json({ success: true });
    }

    if (userRow) {
      const token = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await firestore.collection("password_reset_tokens").doc(tokenHash).set({
        userId: userRow.id,
        tokenHash,
        expiresAt,
        createdAt: new Date(),
      });

      try {
        await sendResetEmail(userRow.email, token);
      } catch (err) {
        console.error("[forgot-password] sendResetEmail failed", err);
      }
    }

    // Always return success to avoid user enumeration
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof OriginNotAllowedError) {
      return NextResponse.json({ error: (error as OriginNotAllowedError).message }, { status: 403 });
    }
    if (error instanceof InputError) {
      return NextResponse.json({ error: (error as InputError).message }, { status: 400 });
    }
    console.error("[auth-forgot-password]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
