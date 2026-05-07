"use client";

import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setMessage("Missing token.");
      return;
    }
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error((payload.error as string) || "Request failed");
      }
      setStatus("success");
      setMessage("Password reset. You can now sign in with your new password.");
      setPassword("");
    } catch (err) {
      setStatus("error");
      setMessage((err as Error).message || "Failed to reset password.");
    }
  }

  return (
    <main className="layout" style={{ padding: "2rem 1.25rem 3rem" }}>
      <div style={{ animation: "slideInDown 0.6s ease-out" }}>
        <h1>Reset Password</h1>
        <p style={{ color: "#b8bfff" }}>
          Enter a new password to complete the reset. You must open this page from the link in the email.
        </p>
      </div>

      <section className="card" style={{ marginTop: "1rem" }}>
        <form onSubmit={handleSubmit}>
          <label htmlFor="reset-password" style={{ display: "block", marginBottom: "0.5rem" }}>
            New Password
          </label>
          <input
            id="reset-password"
            name="password"
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Reset Password
          </button>
        </form>

        {message && <p style={{ marginTop: "1rem", color: status === "error" ? "#ff8a80" : "#b8ffb8" }}>{message}</p>}
      </section>
    </main>
  );
}
