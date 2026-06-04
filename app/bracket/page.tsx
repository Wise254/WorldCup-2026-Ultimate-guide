"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import teamColors from "@/data/team-colors.json";
import fifaRankings from "@/data/fifa-rankings.json";
import { AnimatedTrophy, ConfettiEffect } from "@/components/AnimatedIcons";

interface BracketMatch {
  id: string;
  homeTeam: string | null;
  awayTeam: string | null;
  homeScore?: number;
  awayScore?: number;
  completed: boolean;
}

function getTeamColors(team: string | null) {
  if (!team) return { primary: "#94A3B8", secondary: "#CBD5E1", accent: "#64748B" };
  const cleanName = team.replace(/-/g, " ");
  return (
    (teamColors as any).teams[cleanName] || {
      primary: "#64748B",
      secondary: "#94A3B8",
      accent: "#475569",
    }
  );
}

function getFifaRank(teamName: string | null): number | null {
  if (!teamName) return null;
  const nameMap: Record<string, string> = {
    "Iran": "Iran", "IR Iran": "Iran",
    "Côte d'Ivoire": "Ivory Coast", "Ivory Coast": "Ivory Coast",
    "Cabo Verde": "Cape Verde", "Cape Verde": "Cape Verde",
    "Bosnia and Herzegovina": "Bosnia & Herzegovina", "Bosnia & Herzegovina": "Bosnia & Herzegovina",
    "Korea Republic": "South Korea", "South Korea": "South Korea",
    "Czech Republic": "Czech Republic",
  };
  const lookupName = nameMap[teamName] || teamName;
  const entry = fifaRankings.rankings.find(
    (r) => r.team.toLowerCase() === lookupName.toLowerCase()
  );
  return entry ? entry.rank : null;
}

export default function BracketPage() {
  const [round32, setRound32] = useState<BracketMatch[]>([]);
  const [round16, setRound16] = useState<BracketMatch[]>([]);
  const [quarterfinals, setQuarterfinals] = useState<BracketMatch[]>([]);
  const [semifinals, setSemifinals] = useState<BracketMatch[]>([]);
  const [final, setFinal] = useState<BracketMatch | null>(null);
  const [thirdPlace, setThirdPlace] = useState<BracketMatch | null>(null);
  const [hoveredMatch, setHoveredMatch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasKnockoutMatches, setHasKnockoutMatches] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/matches");
      const data = await res.json();
      const matches = Array.isArray(data) ? data : data.matches || [];

      const knockoutMatches = matches.filter(
        (m: any) => m.stage !== "Group Stage"
      );

      if (knockoutMatches.length === 0) {
        setHasKnockoutMatches(false);
        setRound32(emptySlots(32));
        setRound16(emptySlots(16));
        setQuarterfinals(emptySlots(8));
        setSemifinals(emptySlots(4));
        setFinal(null);
        setThirdPlace(null);
      } else {
        setHasKnockoutMatches(true);
        organizeKnockoutMatches(knockoutMatches);
      }
    } catch (err) {
      console.error("Failed to fetch matches:", err);
      setHasKnockoutMatches(false);
      setRound32(emptySlots(32));
      setRound16(emptySlots(16));
      setQuarterfinals(emptySlots(8));
      setSemifinals(emptySlots(4));
      setFinal(null);
      setThirdPlace(null);
    } finally {
      setLoading(false);
    }
  };

  const emptySlots = (count: number): BracketMatch[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `empty-${i}`,
      homeTeam: null,
      awayTeam: null,
      completed: false,
    }));
  };

  const organizeKnockoutMatches = (matches: any[]) => {
    const r32: any[] = [];
    const r16: any[] = [];
    const qf: any[] = [];
    const sf: any[] = [];
    let finalMatch: any = null;
    let thirdMatch: any = null;

    matches.forEach((m: any) => {
      const matchData = {
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeScore: m.homeScore,
        awayScore: m.awayScore,
        completed: m.homeScore !== null && m.awayScore !== null,
      };

      switch (m.stage) {
        case "Round of 32": r32.push(matchData); break;
        case "Round of 16": r16.push(matchData); break;
        case "Quarter-finals": qf.push(matchData); break;
        case "Semi-finals": sf.push(matchData); break;
        case "Final": finalMatch = matchData; break;
        case "Third Place": thirdMatch = matchData; break;
      }
    });

    while (r32.length < 32) r32.push({ id: `r32-${r32.length}`, homeTeam: null, awayTeam: null, completed: false });
    while (r16.length < 16) r16.push({ id: `r16-${r16.length}`, homeTeam: null, awayTeam: null, completed: false });
    while (qf.length < 8) qf.push({ id: `qf-${qf.length}`, homeTeam: null, awayTeam: null, completed: false });
    while (sf.length < 4) sf.push({ id: `sf-${sf.length}`, homeTeam: null, awayTeam: null, completed: false });

    setRound32(r32);
    setRound16(r16);
    setQuarterfinals(qf);
    setSemifinals(sf);
    setFinal(finalMatch || { id: "final", homeTeam: null, awayTeam: null, completed: false });
    setThirdPlace(thirdMatch || { id: "third-place", homeTeam: null, awayTeam: null, completed: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/20 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-full mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <AnimatedTrophy size={64} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-red-500 via-amber-500 to-red-500 bg-clip-text text-transparent">
              Knockout Bracket
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            The road to the World Cup Final
          </p>
          {!hasKnockoutMatches && (
            <motion.p
              className="text-amber-500 text-sm mt-3 bg-amber-50 dark:bg-amber-900/20 inline-block px-4 py-2 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Knockout matches will appear here once added by the admin
            </motion.p>
          )}
          <motion.div
            className="mt-4 inline-flex items-center gap-3 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-amber-500" />
              <span className="text-gray-500 dark:text-gray-400">Final</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-500" />
              <span className="text-gray-500 dark:text-gray-400">Semi-Final</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-500" />
              <span className="text-gray-500 dark:text-gray-400">Quarter-Final</span>
            </span>
          </motion.div>
        </motion.div>

        {/* Mobile scroll hint */}
        <motion.div
          className="flex sm:hidden items-center justify-center gap-2 mb-4 text-xs text-gray-400 dark:text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          <span>Swipe to view full bracket</span>
          <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </motion.div>

        {/* Bracket scroll container */}
        <div className="overflow-x-auto pb-8 custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="min-w-[1000px] lg:min-w-[1200px]">
            <div className="grid grid-cols-5 gap-3 mb-6 text-center">
              {[
                { label: "Round of 32", icon: "🏟️", color: "text-gray-600 dark:text-gray-400" },
                { label: "Round of 16", icon: "⚡", color: "text-green-600 dark:text-green-400" },
                { label: "Quarter-Finals", icon: "🔥", color: "text-blue-600 dark:text-blue-400" },
                { label: "Semi-Finals", icon: "⭐", color: "text-purple-600 dark:text-purple-400" },
                { label: "Final", icon: "👑", color: "text-red-600 dark:text-red-400" },
              ].map((round, i) => (
                <motion.div
                  key={round.label}
                  className="flex flex-col items-center gap-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="text-xl">{round.icon}</span>
                  <span className={`font-bold text-sm ${round.color}`}>{round.label}</span>
                </motion.div>
              ))}
            </div>

            <div className="relative">
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                style={{ minHeight: "800px" }}
              >
                {Array.from({ length: 16 }, (_, i) => {
                  const rowHeight = 90;
                  return (
                    <g key={`r32-r16-${i}`}>
                      <line x1="20%" y1={45 + i * rowHeight} x2="40%" y2={45 + i * rowHeight} stroke="currentColor" strokeWidth="1.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="4 4" />
                    </g>
                  );
                })}
                {Array.from({ length: 8 }, (_, i) => {
                  const rowHeight = 180;
                  return (
                    <g key={`r16-qf-${i}`}>
                      <line x1="40%" y1={90 + i * rowHeight} x2="60%" y2={90 + i * rowHeight} stroke="currentColor" strokeWidth="1.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="4 4" />
                    </g>
                  );
                })}
                {Array.from({ length: 4 }, (_, i) => {
                  const rowHeight = 360;
                  return (
                    <g key={`qf-sf-${i}`}>
                      <line x1="60%" y1={180 + i * rowHeight} x2="80%" y2={180 + i * rowHeight} stroke="currentColor" strokeWidth="1.5" className="text-gray-300 dark:text-gray-600" strokeDasharray="4 4" />
                    </g>
                  );
                })}
                <line x1="80%" y1="270" x2="95%" y2="400" stroke="currentColor" strokeWidth="2" className="text-red-400 dark:text-red-500" />
                <line x1="80%" y1="630" x2="95%" y2="500" stroke="currentColor" strokeWidth="2" className="text-red-400 dark:text-red-500" />
              </svg>

              <div className="relative z-10">
                {Array.from({ length: 8 }, (_, rowIndex) => (
                  <motion.div
                    key={rowIndex}
                    className="grid grid-cols-5 gap-3 mb-3 items-center"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: rowIndex * 0.05 }}
                  >
                    <div className="space-y-2">
                      <BracketSlot match={round32[rowIndex * 4]} round="R32" isHovered={hoveredMatch === round32[rowIndex * 4]?.id} onHover={(id) => setHoveredMatch(id)} />
                      <BracketSlot match={round32[rowIndex * 4 + 1]} round="R32" isHovered={hoveredMatch === round32[rowIndex * 4 + 1]?.id} onHover={(id) => setHoveredMatch(id)} />
                    </div>
                    <div className="flex items-center justify-center">
                      <BracketSlot match={round16[rowIndex * 2]} round="R16" isHovered={hoveredMatch === round16[rowIndex * 2]?.id} onHover={(id) => setHoveredMatch(id)} />
                    </div>
                    <div className="flex items-center justify-center">
                      <BracketSlot match={quarterfinals[rowIndex]} round="QF" isHovered={hoveredMatch === quarterfinals[rowIndex]?.id} onHover={(id) => setHoveredMatch(id)} />
                    </div>
                    <div className="flex items-center justify-center">
                      {rowIndex < 4 && (
                        <BracketSlot match={semifinals[rowIndex]} round="SF" isHovered={hoveredMatch === semifinals[rowIndex]?.id} onHover={(id) => setHoveredMatch(id)} />
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      {rowIndex === 2 && (
                        <div className="space-y-3 w-full">
                          <BracketSlot match={final} round="🏆 FINAL" isFinal isHovered={hoveredMatch === "final"} onHover={(id) => setHoveredMatch(id)} />
                          <BracketSlot match={thirdPlace} round="🥉 3RD PLACE" isHovered={hoveredMatch === "third-place"} onHover={(id) => setHoveredMatch(id)} />
                        </div>
                      )}
                      {rowIndex === 6 && (
                        <div className="space-y-3 w-full">
                          <BracketSlot match={semifinals[2]} round="SF" isHovered={hoveredMatch === semifinals[2]?.id} onHover={(id) => setHoveredMatch(id)} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.div className="mt-16 text-center" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <div className="inline-block bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-medium">Tournament Format</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <span className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">48 Teams</span>
              <span>→</span>
              <span className="bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">32 Advance</span>
              <span>→</span>
              <span className="bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">16 → 8 → 4</span>
              <span>→</span>
              <span className="bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full font-bold flex items-center gap-1">🏆 Champion</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Bracket Slot Component
function BracketSlot({
  match,
  round,
  isFinal = false,
  isHovered = false,
  onHover,
}: {
  match: BracketMatch | null;
  round: string;
  isFinal?: boolean;
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
}) {
  if (!match) {
    return (
      <motion.div
        className={`rounded-lg p-2.5 text-center border-2 border-dashed ${
          isFinal
            ? "border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10"
            : "border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
        }`}
        whileHover={{ scale: 1.03 }}
      >
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">TBD</span>
      </motion.div>
    );
  }

  const isCompleted = match.completed;
  const homeColors = getTeamColors(match.homeTeam);
  const awayColors = getTeamColors(match.awayTeam);
  const homeRank = getFifaRank(match.homeTeam);
  const awayRank = getFifaRank(match.awayTeam);

  return (
    <motion.div
      className={`relative rounded-lg p-2.5 cursor-pointer transition-all duration-300 ${
        isFinal
          ? "border-2 border-red-400 dark:border-red-500 shadow-lg shadow-red-500/20 bg-gradient-to-br from-red-50 to-amber-50 dark:from-red-900/20 dark:to-amber-900/20"
          : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
      } ${isHovered ? "ring-2 ring-red-400 scale-105 z-20" : ""}`}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      onMouseEnter={() => onHover?.(match.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-lg flex">
        <div className="flex-1" style={{ backgroundColor: homeColors.primary }} />
        <div className="w-2 bg-transparent" />
        <div className="flex-1" style={{ backgroundColor: awayColors.primary }} />
      </div>

      <div className="flex justify-between items-center mb-2 pt-1">
        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {isFinal ? (
            <span className="flex items-center gap-1">
              <AnimatedTrophy size={12} /> {round}
            </span>
          ) : round}
        </span>
        {isCompleted && (
          <motion.span className="text-green-500 text-xs" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>✓</motion.span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: homeColors.primary }} />
        <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
          {match.homeTeam || "TBD"}
        </span>
        {homeRank && (
          <span className="text-[9px] text-gray-400 font-medium ml-auto">#{homeRank}</span>
        )}
        {isCompleted && match.homeScore !== undefined && (
          <motion.span className="text-xs font-bold text-gray-900 dark:text-white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
            {match.homeScore}
          </motion.span>
        )}
      </div>

      <div className="flex items-center gap-2 my-1">
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">VS</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600" />
      </div>

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: awayColors.primary }} />
        <span className="text-xs font-semibold text-gray-900 dark:text-white truncate">
          {match.awayTeam || "TBD"}
        </span>
        {awayRank && (
          <span className="text-[9px] text-gray-400 font-medium ml-auto">#{awayRank}</span>
        )}
        {isCompleted && match.awayScore !== undefined && (
          <motion.span className="text-xs font-bold text-gray-900 dark:text-white" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }}>
            {match.awayScore}
          </motion.span>
        )}
      </div>

      <div className="absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-t from-red-500/5 to-transparent" />
    </motion.div>
  );
}