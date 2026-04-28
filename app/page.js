"use client";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>Cheeseman Games</h1>
          <p>Catch cheese, climb leaderboards, and compete with friends</p>
          <a href="/games" className="cta-button">
            Play Now
          </a>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <div className="feature-icon">🎮</div>
          <h3>Engaging Games</h3>
          <p>Play a variety of fast-paced, fun games designed for quick bursts of entertainment</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🏆</div>
          <h3>Leaderboards</h3>
          <p>Compete globally and locally. Climb the rankings and earn bragging rights</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">👤</div>
          <h3>Accounts</h3>
          <p>Create an account to save your scores and compete with other players</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Instant Play</h3>
          <p>No downloads needed. Play instantly in your browser, anytime, anywhere</p>
        </div>
      </section>

      <section style={{ textAlign: "center", padding: "3rem 1.25rem 2rem" }}>
        <h2>Ready to Play?</h2>
        <p style={{ color: "#b8bfff", marginBottom: "2rem" }}>
          Jump into Catch the Cheese and test your reflexes
        </p>
        <a href="/games" className="cta-button">
          Explore Games
        </a>
      </section>
    </>
  );
}
