import sgMail from "@sendgrid/mail";
import { requireEnv } from "./env";

let initialized = false;
let EMAIL_FROM: string;
let SITE_URL: string;

function ensureInitialized() {
  if (initialized) return;
  const SENDGRID_API_KEY = requireEnv("SENDGRID_API_KEY");
  EMAIL_FROM = requireEnv("EMAIL_FROM");
  SITE_URL = requireEnv("SITE_URL").replace(/\/$/, "");
  sgMail.setApiKey(SENDGRID_API_KEY);
  initialized = true;
}

export async function sendResetEmail(toEmail: string, token: string) {
  const resetUrl = `${SITE_URL}/account/reset-password?token=${encodeURIComponent(token)}`;
  const subject = "Cheeseman Games — Password reset";
  const text = [
    `You requested a password reset for your Cheeseman Games account.`,
    "",
    `Reset link: ${resetUrl}`,
    "",
    `If you did not request this, you can ignore this email.`,
  ].join("\n");

  const html = `<p>You requested a password reset for your Cheeseman Games account.</p><p><a href="${resetUrl}">Reset your password</a></p><p>If you did not request this, you can ignore this email.</p>`;

  try {
    await sgMail.send({
      to: toEmail,
      from: EMAIL_FROM,
      subject,
      text,
      html,
    });
  } catch (err) {
    console.error("[sendResetEmail]", err);
    throw err;
  }
}
