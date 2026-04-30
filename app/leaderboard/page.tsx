"use client";

import { useCallback, useEffect, useState } from "react";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
}

interface Game {
  key: string;
  name: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>("cheese-clicker");
  const [globalMessage, setGlobalMessage] = useState<string>("");

  const games: Game[] = [
    { key: "cheese-clicker", name: "Catch the Cheese" },
  ];

  const loadLeaderboard = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/leaderboard/top?gameKey=${encodeURIComponent(selectedGame)}&limit=50`
      );
      const payload = await response.json();
      setLeaderboard(Array.isArray(payload.leaderboard) ? payload.leaderboard : []);
      setGlobalMessage("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load leaderboard";
      setGlobalMessage(message);
    }
  }, [selectedGame]);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <main className="layout" style={{ padding: "2rem 1.25rem 3rem" }}>
      <div style={{ gridColumn: "1 / -1", animation: "slideInDown 0.6s ease-out" }}>
        <h1>Global Leaderboard</h1>
        <p style={{ color: "#b8bfff" }}>Top scores across all games</p>
      </div>

      <section className="card" style={{ gridColumn: "1 / -1" }}>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {games.map((game) => (
            <button
              key={game.key}
              onClick={() => setSelectedGame(game.key)}
              style={{
                padding: "0.5rem 1.5rem",
                backgroundColor: selectedGame === game.key ? "#5372ff" : "#2d3568",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (selectedGame !== game.key) {
                  (e.target as HTMLButtonElement).style.backgroundColor = "rgba(83, 114, 255, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedGame !== game.key) {
                  (e.target as HTMLButtonElement).style.backgroundColor = "#2d3568";
                }
              }}
            >
              {game.name}
            </button>
          ))}
        </div>

        <div>
          <button
            onClick={() => void loadLeaderboard()}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#2d3568",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              marginBottom: "1rem",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = "rgba(83, 114, 255, 0.4)";
              target.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = "#2d3568";
              target.style.transform = "translateY(0)";
            }}
          >
            Refresh
          </button>
        </div>

        <ol style={{ margin: "1rem 0 0", paddingLeft: "1.3rem" }}>
          {!leaderboard.length ? (
            <li style={{ color: "#b8bfff" }}>No scores yet.</li>
          ) : (
            leaderboard.map((entry, index) => (
              <li
                key={`${entry.username}-${entry.rank}-${entry.score}`}
                style={{
                  marginBottom: "0.75rem",
                  padding: "0.5rem 0.75rem",
                  backgroundColor: index === 0 ? "rgba(255, 212, 132, 0.1)" : "transparent",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLLIElement).style.backgroundColor = "rgba(83, 114, 255, 0.1)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLLIElement).style.backgroundColor =
                    index === 0 ? "rgba(255, 212, 132, 0.1)" : "transparent";
                }}
              >
                <strong>#{entry.rank}</strong> {entry.username} -{" "}
                <span style={{ color: "#5372ff", fontWeight: "bold" }}>{entry.score}</span>
              </li>
            ))
          )}
        </ol>
      </section>

      {globalMessage && (
        <p style={{ gridColumn: "1 / -1", color: "#ffd484", textAlign: "center" }}>
          {globalMessage}
        </p>
      )}
    </main>
  );
}
