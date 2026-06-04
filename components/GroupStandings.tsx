"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import groupsData from "@/data/groups.json";
import teamColorsData from "@/data/team-colors.json";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  group?: string;
}

interface StandingsRow {
  pos: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

interface GroupStandingsProps {
  onTeamClick: (team: string) => void;
}

function normalizeTeamName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/č/g, "c")
    .replace(/ć/g, "c")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .trim();
}

const teamColorsMap = new Map<string, { primary: string; secondary: string; accent: string }>();
Object.entries(teamColorsData.teams).forEach(([teamName, colors]) => {
  teamColorsMap.set(normalizeTeamName(teamName), colors);
});

function getTeamColor(teamName: string) {
  const normalized = normalizeTeamName(teamName);
  return teamColorsMap.get(normalized);
}

// Determine qualification status for 2026 format: top 2 qualify, 3rd may qualify as best 3rd-place
function getQualificationStatus(pos: number, totalMatchesPlayed: number): { label: string; color: string; icon: string } {
  // If all 6 matches in the group have been played
  const groupComplete = totalMatchesPlayed >= 6;

  if (pos <= 2) {
    if (groupComplete) {
      return { label: "Qualified", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: "✅" };
    }
    return { label: "Advancing", color: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400", icon: "🟢" };
  }
  if (pos === 3) {
    if (groupComplete) {
      return { label: "May Qualify", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", icon: "⚠️" };
    }
    return { label: "Possible", color: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400", icon: "🟡" };
  }
  if (groupComplete) {
    return { label: "Eliminated", color: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400", icon: "❌" };
  }
  return { label: "At Risk", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500", icon: "🔴" };
}

function calculateStandings(matches: Match[], groupTeams: string[], groupLetter: string): { standings: StandingsRow[]; totalPlayed: number } {
  const teamStats: Record<string, { played: number; won: number; drawn: number; lost: number; gf: number; ga: number }> = {};

  groupTeams.forEach((team) => {
    teamStats[normalizeTeamName(team)] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
  });

  const groupMatches = matches.filter(
    (m) => m.group === groupLetter && m.homeScore !== null && m.awayScore !== null
  );

  groupMatches.forEach((match) => {
    const homeNorm = normalizeTeamName(match.homeTeam);
    const awayNorm = normalizeTeamName(match.awayTeam);

    if (teamStats[homeNorm] && teamStats[awayNorm]) {
      const hScore = match.homeScore!;
      const aScore = match.awayScore!;

      teamStats[homeNorm].played++;
      teamStats[awayNorm].played++;
      teamStats[homeNorm].gf += hScore;
      teamStats[homeNorm].ga += aScore;
      teamStats[awayNorm].gf += aScore;
      teamStats[awayNorm].ga += hScore;

      if (hScore > aScore) {
        teamStats[homeNorm].won++;
        teamStats[awayNorm].lost++;
      } else if (aScore > hScore) {
        teamStats[awayNorm].won++;
        teamStats[homeNorm].lost++;
      } else {
        teamStats[homeNorm].drawn++;
        teamStats[awayNorm].drawn++;
      }
    }
  });

  const standings: StandingsRow[] = groupTeams.map((team) => {
    const norm = normalizeTeamName(team);
    const stats = teamStats[norm] || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
    return {
      pos: 0,
      team,
      played: stats.played,
      won: stats.won,
      drawn: stats.drawn,
      lost: stats.lost,
      goalsFor: stats.gf,
      goalsAgainst: stats.ga,
      goalDiff: stats.gf - stats.ga,
      points: stats.won * 3 + stats.drawn,
    };
  });

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.localeCompare(b.team);
  });

  standings.forEach((s, i) => (s.pos = i + 1));

  const totalPlayed = groupMatches.length;

  return { standings, totalPlayed };
}

export default function GroupStandings({ onTeamClick }: GroupStandingsProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/matches");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setMatches(Array.isArray(data) ? data : data.matches || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching matches for standings:", err);
      try {
        const fallbackData = await import("@/data/schedule.json");
        setMatches(fallbackData.default.matches || []);
      } catch {
        setError("Failed to load standings");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMatches();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const handleToggleGroup = async (group: string) => {
    if (expandedGroup !== group) {
      await fetchMatches();
      setLastUpdated(Date.now());
    }
    setExpandedGroup(expandedGroup === group ? null : group);
  };

  const toggleGroup = (group: string) => {
    handleToggleGroup(group);
  };

  if (error && matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={fetchMatches}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2 text-xs text-gray-400 dark:text-gray-500 mb-2">
        <span>Auto-refreshes every 30s</span>
        <button
          onClick={fetchMatches}
          className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Refresh now"
        >
          🔄
        </button>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <span>Last updated: {new Date(lastUpdated).toLocaleTimeString()}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(groupsData.groups).map(([letter, group], groupIndex) => {
          const { standings, totalPlayed } = calculateStandings(matches, group.teams, letter);
          
          return (
            <motion.div
              key={letter}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50 cursor-pointer group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: groupIndex * 0.05 }}
              whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
              onClick={() => toggleGroup(letter)}
            >
              {/* Group Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-5 py-3.5 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold backdrop-blur-sm">
                    {letter}
                  </span>
                  {group.name}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Matches played indicator */}
                  <span className="text-xs text-white/60 bg-white/10 px-2 py-0.5 rounded-full">
                    {totalPlayed}/6
                  </span>
                  <motion.div
                    animate={{ rotate: expandedGroup === letter ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-white/80"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </motion.div>
                </div>
              </div>

              {/* Mini team list always visible */}
              <div className="px-4 py-3 flex flex-wrap gap-1.5">
                {group.teams.map((team) => {
                  const teamColor = getTeamColor(team);
                  return (
                    <span
                      key={team}
                      className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300"
                      style={{
                        borderLeft: teamColor ? `3px solid ${teamColor.primary}` : undefined,
                      }}
                    >
                      {team}
                    </span>
                  );
                })}
              </div>

              {/* Expandable Standings Table */}
              <AnimatePresence>
                {expandedGroup === letter && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t dark:border-gray-700">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <div className="col-span-1 text-center">#</div>
                        <div className="col-span-4">Team</div>
                        <div className="col-span-1 text-center">P</div>
                        <div className="col-span-1 text-center">GD</div>
                        <div className="col-span-2 text-center font-semibold text-blue-600 dark:text-blue-400">Pts</div>
                        <div className="col-span-3 text-center">Status</div>
                      </div>

                      {/* Standings Rows */}
                      {standings.map((row, idx) => {
                        const teamColor = getTeamColor(row.team);
                        const status = getQualificationStatus(row.pos, totalPlayed);
                        const isQualified = row.pos <= 2 && totalPlayed >= 6;
                        const isEliminated = row.pos === 4 && totalPlayed >= 6;
                        
                        return (
                          <motion.div
                            key={row.team}
                            className={`grid grid-cols-12 gap-1 px-3 py-2.5 border-b dark:border-gray-700/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer items-center ${
                              isQualified
                                ? "bg-green-50/30 dark:bg-green-900/10"
                                : isEliminated
                                ? "bg-red-50/30 dark:bg-red-900/5"
                                : ""
                            }`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.06 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onTeamClick(row.team);
                            }}
                            whileHover={{ scale: 1.01, backgroundColor: "rgba(59, 130, 246, 0.08)" }}
                          >
                            <div className="col-span-1 text-center">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                                  row.pos <= 2
                                    ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                                    : row.pos === 3
                                    ? "bg-gradient-to-br from-amber-400 to-amber-500 text-white"
                                    : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                                }`}
                              >
                                {row.pos}
                              </span>
                            </div>
                            <div className="col-span-4 flex items-center gap-1.5">
                              <div
                                className="w-1 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: teamColor?.primary || "#6b7280" }}
                              />
                              <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {row.team}
                              </span>
                            </div>
                            <div className="col-span-1 text-center text-xs text-gray-600 dark:text-gray-400">{row.played}</div>
                            <div className="col-span-1 text-center text-xs font-medium">
                              <span className={row.goalDiff > 0 ? "text-green-600 dark:text-green-400" : row.goalDiff < 0 ? "text-red-500" : "text-gray-500"}>
                                {row.goalDiff > 0 ? "+" : ""}{row.goalDiff}
                              </span>
                            </div>
                            <div className="col-span-2 text-center text-sm font-bold text-blue-600 dark:text-blue-400">{row.points}</div>
                            <div className="col-span-3 text-center">
                              <span className={`inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full ${status.color}`}>
                                <span>{status.icon}</span>
                                <span className="hidden sm:inline">{status.label}</span>
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t dark:border-gray-700">
                      <div className="flex flex-wrap gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <span className="text-green-600 dark:text-green-400">✅</span> Top 2 qualify
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-amber-500">⚠️</span> 3rd may qualify
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-red-500">❌</span> 4th eliminated
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}