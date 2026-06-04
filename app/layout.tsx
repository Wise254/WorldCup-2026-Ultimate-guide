import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ToastProvider } from "@/components/Toast";
import CurtainReveal from "@/components/CurtainReveal";
import PageTransition from "@/components/PageTransition";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "FIFA World Cup 2026 — Live Scores, Teams, Bracket & Stadiums",
    template: "%s | FIFA World Cup 2026",
  },
  description:
    "The ultimate fan guide to the 2026 FIFA World Cup hosted by USA, Canada, and Mexico. Live match scores, team lineups, knockout bracket, 16 stadiums, predictions, and fun facts.",
  keywords: [
    "FIFA World Cup 2026",
    "World Cup",
    "soccer",
    "football",
    "USA",
    "Canada",
    "Mexico",
    "tournament",
    "bracket",
    "scores",
    "stadiums",
    "teams",
  ],
  authors: [{ name: "FIFA World Cup 2026 Fan Site" }],
  openGraph: {
    title: "FIFA World Cup 2026 — Live Scores, Teams, Bracket & Stadiums",
    description:
      "The ultimate fan guide to the 2026 FIFA World Cup. Live scores, 48 teams, knockout bracket, 16 stadiums across USA, Canada, and Mexico.",
    type: "website",
    locale: "en_US",
    siteName: "FIFA World Cup 2026",
  },
  twitter: {
    card: "summary_large_image",
    title: "FIFA World Cup 2026",
    description:
      "Live scores, teams, bracket & stadiums for the 2026 World Cup.",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Blocking script: sets dark class BEFORE paint to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('darkMode');
                  if (stored === 'true') {
                    document.documentElement.classList.add('dark');
                  } else if (stored === 'false') {
                    document.documentElement.classList.remove('dark');
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {
                  // localStorage unavailable (e.g. incognito), fall back to system preference
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <CurtainReveal />
        <ToastProvider>
          <Header />
          <main className="min-h-screen">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}