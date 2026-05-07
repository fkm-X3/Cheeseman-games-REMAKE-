"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload.error as string) || "Request failed");
      }
      setStatus("sent");
      setMessage("If an account exists with that email, a reset link has been sent.");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage((err as Error).message || "Failed to send reset email.");
    }
  }

  return (
    <main className="layout" style={{ padding: "2rem 1.25rem 3rem" }}>
      <div style={{ animation: "slideInDown 0.6s ease-out" }}>
        <h1>Forgot Password</h1>
        <p style={{ color: "#b8bfff" }}>
          Enter your account email and a reset link will be emailed to you.
        </p>
      </div>

      <section className="card" style={{ marginTop: "1rem" }}>
        <form onSubmit={handleSubmit}>
          <label htmlFor="forgot-email" style={{ display: "block", marginBottom: "0.5rem" }}>
            Email
          </label>
          <input
            id="forgot-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#0f1430",
              color: "#f3f5ff",
              border: "1px solid #3e4b86",
              borderRadius: "8px",
              fontSize: "1rem",
              marginBottom: "1rem",
            }}
          />

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.75rem",
              backgroundColor: "#5372ff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            Send Reset Link
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "1rem", color: status === "error" ? "#ff8a80" : "#b8ffb8" }}>{message}</p>
        )}
      </section>
    </main>
  );
}
