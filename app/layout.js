import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Cheeseman Games",
  description: "Play games, sign in, and push your score to the leaderboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
