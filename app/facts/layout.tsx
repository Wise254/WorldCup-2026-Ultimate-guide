import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fun Facts & History",
  description: "Discover fascinating FIFA World Cup facts, records, and historical milestones from 1930 to 2026.",
  openGraph: {
    title: "FIFA World Cup 2026 — Fun Facts & History",
    description: "World Cup trivia, records, and a timeline from Uruguay 1930 to USA/Canada/Mexico 2026.",
  },
};

export default function FactsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}