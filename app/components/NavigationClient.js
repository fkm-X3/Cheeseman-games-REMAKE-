"use client";

import { useEffect, useState } from "react";

export default function NavigationClient() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = window.localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !token) {
      return;
    }

    async function loadUser() {
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const response = await fetch("/api/auth/me", {
          method: "GET",
          headers,
        });

        if (response.ok) {
          const payload = await response.json();
          setUser(payload.user || null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    }

    void loadUser();
  }, [isReady, token]);

  const handleLogout = () => {
    window.localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  return (
    <nav className="site-nav">
      <a href="/" className="nav-logo">
        🧀 Cheeseman
      </a>
      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/games">Games</a>
        <a href="/leaderboard">Leaderboard</a>
        {user ? (
          <>
            <span style={{ color: "#b8bfff" }}>|</span>
            <span style={{ color: "#5372ff", fontWeight: "bold", padding: "0.5rem 0" }}>
              {user.username}
            </span>
            <a href="/account" style={{ fontSize: "0.9rem" }}>
              Profile
            </a>
            <button
              onClick={handleLogout}
              style={{
                background: "transparent",
                color: "#f3f5ff",
                border: "none",
                cursor: "pointer",
                padding: "0.5rem 0.75rem",
                borderRadius: "8px",
                transition: "all 0.3s ease",
                fontSize: "0.9rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(83, 114, 255, 0.2)";
                e.currentTarget.style.color = "#5372ff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#f3f5ff";
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <span style={{ color: "#b8bfff" }}>|</span>
            <a href="/account" style={{ fontSize: "0.9rem" }}>
              Sign In
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
