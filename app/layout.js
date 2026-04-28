import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  title: "Cheeseman Games",
  description: "Play games, sign in, and push your score to the leaderboard.",
};

function Navigation() {
  return (
    <nav className="site-nav">
      <a href="/" className="nav-logo">
        🧀 Cheeseman
      </a>
      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/games">Games</a>
        <a href="/leaderboard">Leaderboard</a>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
