"use client";

import { useCallback, useEffect, useRef, useState, type FC } from "react";
import { useParams } from "next/navigation";
import { getErrorMessage } from "../utils";

interface GameConfig {
  name: string;
  icon: string;
  duration: number;
  description: string;
}

interface User {
  username: string;
  email?: string;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

interface CheesePosition {
  left: number;
  top: number;
}

const GamePage: FC = () => {
  const params = useParams();
  const gameKey = params.gameKey as string;

  const gameConfig: Record<string, GameConfig> = {
    "cheese-clicker": {
      name: "Catch the Cheese",
      icon: "🧀",
      duration: 20,
      description: "Click the cheese as many times as possible before time runs out.",
    },
  };

  const config = gameConfig[gameKey] || gameConfig["cheese-clicker"];

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [timeLeft, setTimeLeft] = useState(config.duration);
  const [score, setScore] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [gameMessage, setGameMessage] = useState("");
  const [globalMessage, setGlobalMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [cheesePosition, setCheesePosition] = useState<CheesePosition>({ left: 0, top: 0 });
  const [isReady, setIsReady] = useState(false);
  const timerRef = useRef<number | null>(null);
  const scoreRef = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const cheeseButtonRef = useRef<HTMLButtonElement>(null);

  const api = useCallback(
    async (
      path: string,
      options: { method?: string; auth?: boolean; body?: Record<string, unknown> } = {}
    ): Promise<Record<string, unknown>> => {
      const method = options.method || "GET";
      const headers: Record<string, string> = {
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

      let payload: Record<string, unknown> = {};
      try {
        payload = (await response.json()) as Record<string, unknown>;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        throw new Error((payload.error as string) || `Request failed with status ${response.status}`);
      }

      return payload;
    },
    [token]
  );

  const loadCurrentUser = useCallback(async (): Promise<void> => {
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const payload = await api("/api/auth/me");
      setUser((payload.user as User) || null);
    } catch (error) {
      setUser(null);
      setGlobalMessage(getErrorMessage(error));
    }
  }, [api, token]);

  const loadLeaderboard = useCallback(async (): Promise<void> => {
    try {
      const payload = await api(
        `/api/leaderboard/top?gameKey=${encodeURIComponent(gameKey)}&limit=10`,
        { auth: false }
      );
      setLeaderboard(Array.isArray(payload.leaderboard) ? (payload.leaderboard as LeaderboardEntry[]) : []);
    } catch (error) {
      setGlobalMessage(getErrorMessage(error));
    }
  }, [api, gameKey]);

  const moveCheeseButton = useCallback((): void => {
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
    async (submittedScore: number): Promise<void> => {
      if (!user) {
        setGlobalMessage("Sign in to submit your score.");
        return;
      }

      const payload = await api("/api/leaderboard/submit", {
        method: "POST",
        body: {
          score: submittedScore,
          gameKey: gameKey,
        },
      });
      setGlobalMessage(`Score submitted. Personal best: ${payload.personalBest}`);
      await loadLeaderboard();
    },
    [api, loadLeaderboard, user, gameKey]
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

    const loadData = async (): Promise<void> => {
      await loadCurrentUser();
      await loadLeaderboard();
    };

    void loadData();
  }, [isReady, loadCurrentUser, loadLeaderboard]);

  useEffect(() => {
    if (!isRunning) {
      return;
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

    const finishGame = async (): Promise<void> => {
      setIsRunning(false);
      setGameMessage(`Game over! Final score: ${scoreRef.current}`);
      if (scoreRef.current > 0) {
        try {
          await submitScore(scoreRef.current);
        } catch (error) {
          setGlobalMessage(getErrorMessage(error));
        }
      }
    };

    void finishGame();
  }, [isRunning, submitScore, timeLeft]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const onResize = (): void => moveCheeseButton();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [isRunning, moveCheeseButton]);

  const startGame = (): void => {
    if (isRunning) {
      return;
    }
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(config.duration);
    setIsRunning(true);
    setGameMessage("Catch the cheese!");
    setGlobalMessage("");
    window.requestAnimationFrame(() => moveCheeseButton());
  };

  const handleCheeseClick = (): void => {
    if (!isRunning) {
      return;
    }
    setScore((previous) => {
      const nextValue = previous + 1;
      scoreRef.current = nextValue;
      return nextValue;
    });
    moveCheeseButton();
  };

  return (
    <>
      <div style={{ padding: "1rem 1.25rem" }}>
        <a href="/games" style={{ color: "#5372ff", textDecoration: "none", fontSize: "0.95rem" }}>
          ← Back to games
        </a>
      </div>

      <main className="layout">
        <section className="card" id="user-status-card">
          <h2>Game Status</h2>
          <p id="user-status" style={{ color: "#b8bfff" }}>
            {user ? `Signed in as ${user.username}` : "Not signed in"}
          </p>
          {!user && (
            <p style={{ color: "#ffd484", marginTop: "0.75rem" }}>
              <a href="/account" style={{ color: "#5372ff", textDecoration: "none" }}>
                Sign in
              </a>{" "}
              to submit scores and compete on leaderboards.
            </p>
          )}
        </section>

        <section className="card" id="game-card">
          <h2>
            Game: {config.name} {config.icon}
          </h2>
          <p>{config.description}</p>

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
              {config.icon}
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
};

export default GamePage;
