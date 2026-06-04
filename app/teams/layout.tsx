import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams & Squads",
  description: "All 48 teams competing in FIFA World Cup 2026. View squads, formations, FIFA rankings, and player lineups for every nation.",
  openGraph: {
    title: "FIFA World Cup 2026 — Teams & Squads",
    description: "48 teams, 6 confederations, full player lineups and formations for the 2026 World Cup.",
  },
};

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}