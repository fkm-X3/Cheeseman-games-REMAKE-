import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NavigationClient from "./components/NavigationClient";

export const metadata = {
  title: "Cheeseman Games",
  description: "Play games, sign in, and push your score to the leaderboard.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavigationClient />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
