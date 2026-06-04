import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Match Schedule",
  description: "Full fixture list for FIFA World Cup 2026 — all 72 group stage matches plus knockout rounds across USA, Canada, and Mexico.",
  openGraph: {
    title: "FIFA World Cup 2026 — Match Schedule",
    description: "Full fixture list for the 2026 World Cup. Group stage and knockout matches with dates, times, and venues.",
  },
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}