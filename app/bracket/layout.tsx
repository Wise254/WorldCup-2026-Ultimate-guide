import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knockout Bracket",
  description: "Follow the road to the FIFA World Cup 2026 Final. Round of 32 through to the championship match at MetLife Stadium.",
  openGraph: {
    title: "FIFA World Cup 2026 — Knockout Bracket",
    description: "Track the knockout stages from Round of 32 to the Final. Who will lift the trophy?",
  },
};

export default function BracketLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}