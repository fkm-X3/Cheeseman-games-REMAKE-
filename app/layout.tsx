import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NavigationClient from "./components/NavigationClient";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cheeseman Games",
  description: "Play games, sign in, and push your score to the leaderboard.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
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
