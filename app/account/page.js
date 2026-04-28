"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "../games/utils";

export default function AccountPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [globalMessage, setGlobalMessage] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  const setSessionToken = useCallback((nextToken) => {
    setToken(nextToken);
    if (typeof window !== "undefined") {
      if (nextToken) {
        window.localStorage.setItem("authToken", nextToken);
      } else {
        window.localStorage.removeItem("authToken");
      }
    }
  }, []);

  const api = useCallback(
    async (path, options = {}) => {
      const method = options.method || "GET";
      const headers = {
        "Content-Type": "application/json",
      };
      if (options.auth !== false && token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(path, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(payload.error || `Request failed with status ${response.status}`);
      }

      return payload;
    },
    [token]
  );

  const loadCurrentUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const payload = await api("/api/auth/me");
      setUser(payload.user || null);
    } catch (error) {
      setSessionToken(null);
      setUser(null);
      setGlobalMessage(getErrorMessage(error));
    }
  }, [api, setSessionToken, token]);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    async function loadData() {
      await loadCurrentUser();
    }

    void loadData();
  }, [isReady, loadCurrentUser]);

  async function handleRegister(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const payload = await api("/api/auth/register", {
        method: "POST",
        auth: false,
        body: {
          username: String(formData.get("username") || ""),
          email: String(formData.get("email") || ""),
          password: String(formData.get("password") || ""),
        },
      });
      setSessionToken(payload.token || null);
      setUser(payload.user || null);
      event.currentTarget.reset();
      setGlobalMessage("Account created successfully! You are now signed in.");
      setActiveTab("profile");
    } catch (error) {
      setGlobalMessage(getErrorMessage(error));
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      const payload = await api("/api/auth/login", {
        method: "POST",
        auth: false,
        body: {
          identifier: String(formData.get("identifier") || ""),
          password: String(formData.get("password") || ""),
        },
      });
      setSessionToken(payload.token || null);
      setUser(payload.user || null);
      event.currentTarget.reset();
      setGlobalMessage("Signed in successfully!");
      setActiveTab("profile");
    } catch (error) {
      setGlobalMessage(getErrorMessage(error));
    }
  }

  function handleLogout() {
    setSessionToken(null);
    setUser(null);
    setGlobalMessage("Signed out successfully.");
    setActiveTab("profile");
  }

  return (
    <main className="layout" style={{ padding: "2rem 1.25rem 3rem" }}>
      <div style={{ gridColumn: "1 / -1", animation: "slideInDown 0.6s ease-out" }}>
        <h1>Account Management</h1>
        <p style={{ color: "#b8bfff" }}>
          {user ? `Welcome back, ${user.username}!` : "Sign in or create an account to play games and track scores"}
        </p>
      </div>

      {user ? (
        <section className="card" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: "0 0 0.5rem" }}>Your Profile</h2>
              <p style={{ margin: 0, color: "#b8bfff" }}>
                <strong>Username:</strong> {user.username}
              </p>
              <p style={{ margin: "0.25rem 0 0", color: "#b8bfff" }}>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#d32f2f",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#b71c1c";
                e.target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#d32f2f";
                e.target.style.transform = "translateY(0)";
              }}
            >
              Sign Out
            </button>
          </div>

          <hr style={{ margin: "1.5rem 0", borderColor: "#2b3360" }} />

          <div style={{ marginTop: "1.5rem" }}>
            <h3>Next Steps</h3>
            <p style={{ color: "#b8bfff" }}>
              You're all set! Your account works across all games on this site. Head to the{" "}
              <a href="/games" style={{ color: "#5372ff", textDecoration: "none" }}>
                Games Hub
              </a>{" "}
              to start playing and climbing the leaderboards.
            </p>
          </div>
        </section>
      ) : (
        <section style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setActiveTab("login")}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: activeTab === "login" ? "#5372ff" : "#2d3568",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "login") {
                  e.target.style.backgroundColor = "rgba(83, 114, 255, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "login") {
                  e.target.style.backgroundColor = "#2d3568";
                }
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("register")}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: activeTab === "register" ? "#5372ff" : "#2d3568",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "register") {
                  e.target.style.backgroundColor = "rgba(83, 114, 255, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "register") {
                  e.target.style.backgroundColor = "#2d3568";
                }
              }}
            >
              Create Account
            </button>
          </div>

          {activeTab === "login" && (
            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <h2>Sign In</h2>
              <p style={{ color: "#b8bfff", marginBottom: "1.5rem" }}>
                Sign in with your account to play games and submit scores
              </p>
              <form onSubmit={handleLogin}>
                <label htmlFor="login-identifier" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Username or Email
                </label>
                <input
                  id="login-identifier"
                  name="identifier"
                  required
                  style={{
                    width: "100%",
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "#0f1430",
                    color: "#f3f5ff",
                    border: "1px solid #3e4b86",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />

                <label htmlFor="login-password" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Password
                </label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  style={{
                    width: "100%",
                    marginBottom: "1.5rem",
                    padding: "0.75rem",
                    backgroundColor: "#0f1430",
                    color: "#f3f5ff",
                    border: "1px solid #3e4b86",
                    borderRadius: "8px",
                    fontSize: "1rem",
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
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#4259e0";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#5372ff";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Sign In
                </button>
              </form>
            </div>
          )}

          {activeTab === "register" && (
            <div className="card" style={{ gridColumn: "1 / -1" }}>
              <h2>Create Account</h2>
              <p style={{ color: "#b8bfff", marginBottom: "1.5rem" }}>
                Create an account to track your scores across all games
              </p>
              <form onSubmit={handleRegister}>
                <label htmlFor="register-username" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Username
                </label>
                <input
                  id="register-username"
                  name="username"
                  minLength={3}
                  maxLength={24}
                  required
                  style={{
                    width: "100%",
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "#0f1430",
                    color: "#f3f5ff",
                    border: "1px solid #3e4b86",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />

                <label htmlFor="register-email" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Email
                </label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  style={{
                    width: "100%",
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "#0f1430",
                    color: "#f3f5ff",
                    border: "1px solid #3e4b86",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />

                <label htmlFor="register-password" style={{ display: "block", marginBottom: "0.5rem" }}>
                  Password (min 8 characters)
                </label>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  style={{
                    width: "100%",
                    marginBottom: "1.5rem",
                    padding: "0.75rem",
                    backgroundColor: "#0f1430",
                    color: "#f3f5ff",
                    border: "1px solid #3e4b86",
                    borderRadius: "8px",
                    fontSize: "1rem",
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
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#4259e0";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#5372ff";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  Create Account
                </button>
              </form>
            </div>
          )}
        </section>
      )}

      {globalMessage && (
        <p style={{ gridColumn: "1 / -1", color: "#ffd484", textAlign: "center", marginTop: "1rem" }}>
          {globalMessage}
        </p>
      )}
    </main>
  );
}
