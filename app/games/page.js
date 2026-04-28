"use client";

export default function GamesHubPage() {
  const games = [
    {
      key: "cheese-clicker",
      name: "Catch the Cheese",
      icon: "🧀",
      description: "Click the bouncing cheese as many times as possible before time runs out. Quick reflexes required!",
    },
  ];

  return (
    <main className="layout" style={{ padding: "2rem 1.25rem 3rem" }}>
      <h1 style={{ gridColumn: "1 / -1", animation: "slideInDown 0.6s ease-out" }}>
        Available Games
      </h1>
      <p style={{ gridColumn: "1 / -1", color: "#b8bfff", marginTop: "-1rem" }}>
        Choose a game and test your skills
      </p>

      <div className="games-grid">
        {games.map((game) => (
          <div key={game.key} className="game-card">
            <div className="game-card-header">{game.icon}</div>
            <div className="game-card-content">
              <h3>{game.name}</h3>
              <p>{game.description}</p>
              <a href={`/games/${game.key}`} className="game-card-link">
                Play →
              </a>
            </div>
          </div>
        ))}
      </div>

      <section style={{ gridColumn: "1 / -1", marginTop: "3rem", textAlign: "center" }}>
        <h2>More games coming soon!</h2>
        <p style={{ color: "#b8bfff" }}>
          New games are being developed. Check back soon for more challenges.
        </p>
      </section>
    </main>
  );
}
