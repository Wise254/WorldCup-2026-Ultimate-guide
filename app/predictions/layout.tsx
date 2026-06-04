import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tournament Predictions",
  description: "Expert predictions for FIFA World Cup 2026 — tournament favorites, dark horses, Golden Boot contenders, and bracket forecasts.",
  openGraph: {
    title: "FIFA World Cup 2026 — Predictions & Analysis",
    description: "Who will win the 2026 World Cup? Favorites, dark horses, and expert bracket predictions.",
  },
};

export default function PredictionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}