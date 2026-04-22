"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GAME_KEY = "cheese-clicker";

function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unexpected error.";
}

export default function HomePage() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameMessage, setGameMessage] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);
  const [cheesePosition, setCheesePosition] = useState({ left: 0, top: 0 });
  const [isReady, setIsReady] = useState(false);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);
  const gameAreaRef = useRef(null);
  const cheeseButtonRef = useRef(null);

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

  const loadLeaderboard = useCallback(async () => {
    try {
      const payload = await api(
        `/api/leaderboard/top?gameKey=${encodeURIComponent(GAME_KEY)}&limit=10`,
        { auth: false }
      );
      setLeaderboard(Array.isArray(payload.leaderboard) ? payload.leaderboard : []);
    } catch (error) {
      setGlobalMessage(getErrorMessage(error));
    }
  }, [api]);

  const moveCheeseButton = useCallback(() => {
    const area = gameAreaRef.current;
    const cheese = cheeseButtonRef.current;
    if (!area || !cheese) {
      return;
    }

    const areaRect = area.getBoundingClientRect();
    const cheeseRect = cheese.getBoundingClientRect();
    const maxLeft = Math.max(0, areaRect.width - cheeseRect.width);
    const maxTop = Math.max(0, areaRect.height - cheeseRect.height);
    const left = Math.floor(Math.random() * (maxLeft + 1));
    const top = Math.floor(Math.random() * (maxTop + 1));

    setCheesePosition({ left, top });
  }, []);

  const submitScore = useCallback(
    async (submittedScore) => {
      if (!user) {
        setGlobalMessage("Sign in to submit your score.");
        return;
      }

      const payload = await api("/api/leaderboard/submit", {
        method: "POST",
        body: {
          score: submittedScore,
          gameKey: GAME_KEY,
        },
      });
      setGlobalMessage(`Score submitted. Personal best: ${payload.personalBest}`);
      await loadLeaderboard();
    },
    [api, loadLeaderboard, user]
  );

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

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
      await loadLeaderboard();
    }

    void loadData();
  }, [isReady, loadCurrentUser, loadLeaderboard]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    timerRef.current = window.setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || timeLeft > 0) {
      return;
    }

    async function finishGame() {
      setIsRunning(false);
      setGameMessage(`Game over! Final score: ${scoreRef.current}`);
      if (scoreRef.current > 0) {
        try {
          await submitScore(scoreRef.current);
        } catch (error) {
          setGlobalMessage(getErrorMessage(error));
        }
      }
    }

    void finishGame();
  }, [isRunning, submitScore, timeLeft]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const onResize = () => moveCheeseButton();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [isRunning, moveCheeseButton]);

  function startGame() {
    if (isRunning) {
      return;
    }
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(20);
    setIsRunning(true);
    setGameMessage("Catch the cheese!");
    setGlobalMessage("");
    window.requestAnimationFrame(() => moveCheeseButton());
  }

  function handleCheeseClick() {
    if (!isRunning) {
      return;
    }
    setScore((previous) => {
      const nextValue = previous + 1;
      scoreRef.current = nextValue;
      return nextValue;
    });
    moveCheeseButton();
  }

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
      setGlobalMessage("Account created and signed in.");
      await loadLeaderboard();
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
      setGlobalMessage("Signed in.");
      await loadLeaderboard();
    } catch (error) {
      setGlobalMessage(getErrorMessage(error));
    }
  }

  function handleLogout() {
    setSessionToken(null);
    setUser(null);
    setGlobalMessage("Signed out.");
  }

  return (
    <>
      <header className="site-header">
        <h1>Cheeseman Games</h1>
        <p>Play games, sign in, and push your score to the leaderboard.</p>
      </header>

      <main className="layout">
        <section className="card" id="auth-card">
          <h2>Account</h2>
          <p id="auth-status">
            {user ? `Signed in as ${user.username}` : "You are not signed in."}
          </p>
          <button
            id="logout-button"
            className="secondary"
            hidden={!user}
            onClick={handleLogout}
            type="button"
          >
            Log out
          </button>

          <div className="form-grid">
            <form id="register-form" onSubmit={handleRegister}>
              <h3>Create account</h3>
              <label htmlFor="register-username">Username</label>
              <input id="register-username" name="username" minLength={3} maxLength={24} required />

              <label htmlFor="register-email">Email</label>
              <input id="register-email" name="email" type="email" required />

              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                name="password"
                type="password"
                minLength={8}
                required
              />

              <button type="submit">Register</button>
            </form>

            <form id="login-form" onSubmit={handleLogin}>
              <h3>Sign in</h3>
              <label htmlFor="login-identifier">Username or email</label>
              <input id="login-identifier" name="identifier" required />

              <label htmlFor="login-password">Password</label>
              <input id="login-password" name="password" type="password" minLength={8} required />

              <button type="submit">Login</button>
            </form>
          </div>
        </section>

        <section className="card" id="game-card">
          <h2>Game: Catch the Cheese</h2>
          <p>Click the cheese as many times as possible before time runs out.</p>

          <div className="game-stats">
            <span>
              Time: <strong id="time-left">{timeLeft}</strong>s
            </span>
            <span>
              Score: <strong id="current-score">{score}</strong>
            </span>
          </div>

          <button id="start-game-button" onClick={startGame} disabled={isRunning} type="button">
            Start game
          </button>
          <p id="game-message">{gameMessage}</p>

          <div id="game-area" aria-label="Game area" ref={gameAreaRef}>
            <button
              id="cheese-button"
              hidden={!isRunning}
              type="button"
              aria-label="Catch cheese"
              onClick={handleCheeseClick}
              ref={cheeseButtonRef}
              style={{
                left: `${cheesePosition.left}px`,
                top: `${cheesePosition.top}px`,
              }}
            >
              🧀
            </button>
          </div>
        </section>

        <section className="card" id="leaderboard-card">
          <div className="leaderboard-header">
            <h2>Leaderboard</h2>
            <button
              id="refresh-leaderboard-button"
              className="secondary"
              onClick={() => {
                void loadLeaderboard();
              }}
              type="button"
            >
              Refresh
            </button>
          </div>
          <ol id="leaderboard-list">
            {!leaderboard.length ? (
              <li>No scores yet.</li>
            ) : (
              leaderboard.map((entry) => (
                <li key={`${entry.username}-${entry.rank}-${entry.score}`}>
                  {entry.username} - {entry.score}
                </li>
              ))
            )}
          </ol>
        </section>
      </main>

      <p id="global-message" className="global-message">
        {globalMessage}
      </p>
    </>
  );
}
