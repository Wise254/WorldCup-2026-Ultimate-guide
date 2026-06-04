import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stadiums & Venues",
  description: "Explore all 16 FIFA World Cup 2026 stadiums across the United States, Canada, and Mexico. Capacity, city highlights, and match allocations.",
  openGraph: {
    title: "FIFA World Cup 2026 — 16 Stadiums",
    description: "16 iconic venues across 3 host nations. From MetLife Stadium to Estadio Azteca.",
  },
};

export default function VenuesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}