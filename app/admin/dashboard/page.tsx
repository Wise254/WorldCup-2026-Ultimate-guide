"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/Toast";
import RippleButton from "@/components/RippleButton";
import groupsData from "@/data/groups.json";
import teamColorsData from "@/data/team-colors.json";
import teamsData from "@/data/teams.json";
import venuesData from "@/data/venues.json";
import dynamic from "next/dynamic";
const PlayerManager = dynamic(() => import("@/components/PlayerManager"), {
  loading: () => (
    <div className="h-64 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

interface Match {
  id: string;
  date: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  stage: string;
  group?: string;
  venue?: {
    stadium: string;
    city: string;
    country: string;
  };
}

interface ScoreHistory {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  previousHomeScore: number | null;
  previousAwayScore: number | null;
  newHomeScore: number;
  newAwayScore: number;
  timestamp: number;
}

// NEW: Track recently added matches for undo
interface MatchAddHistory {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  stage: string;
  timestamp: number;
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
  color?: { primary: string; secondary: string; accent: string };
}

interface VenueOption {
  id: string;
  city: string;
  stadium: string;
  country: string;
  capacity: number;
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
  return teamColorsMap.get(normalizeTeamName(teamName));
}

const allVenues: VenueOption[] = (venuesData.allVenues || []).map((v: any) => ({
  id: v.stadium.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
  city: v.city,
  stadium: v.stadium,
  country: v.country || "",
  capacity: v.capacity || 0,
}));

const allTeamsSorted = [...teamsData.allTeams].sort();

const knockoutStages = [
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Third Place",
  "Final",
];

function calculateStandings(matches: Match[]): Record<string, StandingsRow[]> {
  const allStandings: Record<string, StandingsRow[]> = {};

  Object.entries(groupsData.groups).forEach(([letter, group]) => {
    const teamStats: Record<string, { played: number; won: number; drawn: number; lost: number; gf: number; ga: number }> = {};

    group.teams.forEach((team) => {
      teamStats[normalizeTeamName(team)] = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
    });

    const groupMatches = matches.filter(
      (m) => m.group === letter && m.homeScore !== null && m.awayScore !== null
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

    const standings: StandingsRow[] = group.teams.map((team) => {
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
        color: getTeamColor(team),
      };
    });

    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.team.localeCompare(b.team);
    });

    standings.forEach((s, i) => (s.pos = i + 1));
    allStandings[letter] = standings;
  });

  return allStandings;
}

export default function AdminDashboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [originalMatches, setOriginalMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreHistory[]>([]);
  // NEW: Track added matches for undo
  const [matchAddHistory, setMatchAddHistory] = useState<MatchAddHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showStandings, setShowStandings] = useState(false);
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showPlayers, setShowPlayers] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    matchId: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
  } | null>(null);
  const [dirtyMatches, setDirtyMatches] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { addToast } = useToast();
  const pendingChangesRef = useRef<Map<string, { home: number; away: number }>>(new Map());

  const [addMatchForm, setAddMatchForm] = useState({
    stage: "Round of 32",
    homeTeam: "",
    awayTeam: "",
    date: "",
    time: "",
    venueId: "",
  });
  const [addMatchError, setAddMatchError] = useState("");
  const [addingMatch, setAddingMatch] = useState(false);

  useEffect(() => {
    const isLoggedIn = document.cookie.includes("admin_auth=true");
    if (!isLoggedIn) {
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/matches");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const matchesArray = Array.isArray(data) ? data : data.matches || [];
      setMatches(matchesArray);
      setOriginalMatches(JSON.parse(JSON.stringify(matchesArray)));
      setDirtyMatches(new Set());
      pendingChangesRef.current.clear();
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError("Failed to load matches. Make sure schedule.json exists.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddMatchError("");

    const { stage, homeTeam, awayTeam, date, time, venueId } = addMatchForm;

    if (!homeTeam || !awayTeam || !date || !time || !venueId) {
      setAddMatchError("All fields are required.");
      return;
    }

    if (homeTeam === awayTeam) {
      setAddMatchError("A team cannot play against itself.");
      return;
    }

    setAddingMatch(true);

    try {
      const response = await fetch("/api/admin/add-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeTeam, awayTeam, date, time, venueId, stage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add match");
      }

      const venue = allVenues.find((v) => v.id === venueId);
      const newMatch: Match = {
        ...data,
        status: "upcoming",
        venue: venue ? { stadium: venue.stadium, city: venue.city, country: venue.country } : undefined,
      };

      setMatches((prev) => [...prev, newMatch]);
      setOriginalMatches((prev) => [...prev, newMatch]);

      // NEW: Add to match addition history for undo
      setMatchAddHistory((prev) => [
        {
          matchId: data.id,
          homeTeam,
          awayTeam,
          stage,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 9), // Keep last 10 additions
      ]);

      addToast("success", `Match added: ${homeTeam} vs ${awayTeam} (${stage})`);

      setAddMatchForm({
        stage: "Round of 32",
        homeTeam: "",
        awayTeam: "",
        date: "",
        time: "",
        venueId: "",
      });
    } catch (err: any) {
      setAddMatchError(err.message || "Failed to add match");
      addToast("error", err.message || "Failed to add match");
    } finally {
      setAddingMatch(false);
    }
  };

  // NEW: Undo match addition (delete the match)
  const undoAddMatch = async (entry: MatchAddHistory) => {
    setSaving(entry.matchId);
    try {
      const response = await fetch("/api/admin/delete-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: entry.matchId }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete match");
      }

      // Remove from local state
      setMatches((prev) => prev.filter((m) => m.id !== entry.matchId));
      setOriginalMatches((prev) => prev.filter((m) => m.id !== entry.matchId));

      // Remove from history
      setMatchAddHistory((prev) => prev.filter((h) => h.matchId !== entry.matchId));

      addToast("info", `Removed: ${entry.homeTeam} vs ${entry.awayTeam}`);
    } catch (err: any) {
      addToast("error", err.message || "Failed to undo match addition");
    } finally {
      setSaving(null);
    }
  };

  // NEW: Delete any knockout match (even older ones)
  const deleteMatch = async (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    // Don't allow deleting group stage matches
    if (match.stage === "Group Stage") {
      addToast("warning", "Cannot delete group stage matches");
      return;
    }

    setSaving(matchId);
    try {
      const response = await fetch("/api/admin/delete-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to delete match");
      }

      setMatches((prev) => prev.filter((m) => m.id !== matchId));
      setOriginalMatches((prev) => prev.filter((m) => m.id !== matchId));
      setMatchAddHistory((prev) => prev.filter((h) => h.matchId !== matchId));

      addToast("info", `Deleted: ${match.homeTeam} vs ${match.awayTeam}`);
    } catch (err: any) {
      addToast("error", err.message || "Failed to delete match");
    } finally {
      setSaving(null);
    }
  };

  const requestUpdateScore = (matchId: string, homeScore: number, awayScore: number) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    setConfirmDialog({
      matchId,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      homeScore,
      awayScore,
    });
  };

  const executeUpdateScore = async (matchId: string, homeScore: number, awayScore: number) => {
    setSaving(matchId);
    setConfirmDialog(null);

    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    const previousHomeScore = match.homeScore;
    const previousAwayScore = match.awayScore;

    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId
          ? { ...m, homeScore, awayScore, status: "finished" }
          : m
      )
    );
    setDirtyMatches((prev) => {
      const next = new Set(prev);
      next.add(matchId);
      return next;
    });

    try {
      const response = await fetch("/api/admin/update-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, homeScore, awayScore }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to update");
      }

      setOriginalMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, homeScore, awayScore, status: "finished" } : m))
      );

      setScoreHistory((prev) => [
        {
          matchId,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          previousHomeScore,
          previousAwayScore,
          newHomeScore: homeScore,
          newAwayScore: awayScore,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 19),
      ]);

      setDirtyMatches((prev) => {
        const next = new Set(prev);
        next.delete(matchId);
        return next;
      });
      pendingChangesRef.current.delete(matchId);

      addToast("success", `Score updated! ${match.homeTeam} ${homeScore} - ${awayScore} ${match.awayTeam} ⚽`);
      setExpandedMatch(null);
    } catch (err: any) {
      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? { ...m, homeScore: previousHomeScore, awayScore: previousAwayScore, status: previousHomeScore !== null ? "finished" : "upcoming" }
            : m
        )
      );
      setDirtyMatches((prev) => {
        const next = new Set(prev);
        next.delete(matchId);
        return next;
      });
      pendingChangesRef.current.delete(matchId);
      addToast("error", err.message || "Failed to update score. Changes rolled back.");
    } finally {
      setSaving(null);
    }
  };

  const undoLastChange = async () => {
    if (scoreHistory.length === 0) return;

    const lastChange = scoreHistory[0];
    setSaving(lastChange.matchId);

    try {
      const response = await fetch("/api/admin/update-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: lastChange.matchId,
          homeScore: lastChange.previousHomeScore,
          awayScore: lastChange.previousAwayScore,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to undo");
      }

      setMatches((prev) =>
        prev.map((m) =>
          m.id === lastChange.matchId
            ? {
                ...m,
                homeScore: lastChange.previousHomeScore,
                awayScore: lastChange.previousAwayScore,
                status: lastChange.previousHomeScore !== null ? "finished" : "upcoming",
              }
            : m
        )
      );

      setOriginalMatches((prev) =>
        prev.map((m) =>
          m.id === lastChange.matchId
            ? {
                ...m,
                homeScore: lastChange.previousHomeScore,
                awayScore: lastChange.previousAwayScore,
                status: lastChange.previousHomeScore !== null ? "finished" : "upcoming",
              }
            : m
        )
      );

      setScoreHistory((prev) => prev.slice(1));
      addToast("info", `Undo successful! Reverted ${lastChange.homeTeam} vs ${lastChange.awayTeam}`);
    } catch (err: any) {
      addToast("error", "Failed to undo. Please try manually.");
    } finally {
      setSaving(null);
    }
  };

  const clearScore = async (matchId: string) => {
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;

    setSaving(matchId);

    try {
      const response = await fetch("/api/admin/update-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          homeScore: null,
          awayScore: null,
        }),
      });

      if (!response.ok) throw new Error("Failed to clear score");

      setMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? { ...m, homeScore: null, awayScore: null, status: "upcoming" }
            : m
        )
      );

      setOriginalMatches((prev) =>
        prev.map((m) =>
          m.id === matchId
            ? { ...m, homeScore: null, awayScore: null, status: "upcoming" }
            : m
        )
      );

      setDirtyMatches((prev) => {
        const next = new Set(prev);
        next.delete(matchId);
        return next;
      });

      addToast("info", `Score cleared for ${match.homeTeam} vs ${match.awayTeam}`);
    } catch (err: any) {
      addToast("error", "Failed to clear score");
    } finally {
      setSaving(null);
    }
  };

  const handleLogout = () => {
    document.cookie = "admin_auth=; path=/; max-age=0";
    addToast("info", "Logged out successfully");
    router.push("/admin/login");
  };

  const standings = calculateStandings(matches);
  const groupStageMatches = matches.filter((m) => m.stage === "Group Stage");
  const knockoutMatches = matches.filter((m) => m.stage !== "Group Stage");
  const upcomingMatches = matches.filter((m) => m.homeScore === null);
  const finishedMatches = matches.filter((m) => m.homeScore !== null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading matches...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
        <motion.div
          className="text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="text-5xl block mb-4">⚠️</span>
          <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
          <RippleButton onClick={fetchMatches} variant="primary">
            🔄 Retry
          </RippleButton>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50/20 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">⚙️ Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Update match scores, add knockout fixtures &amp; preview standings</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {/* NEW: Show Undo Add button if recently added matches exist */}
            {matchAddHistory.length > 0 && (
              <RippleButton
                variant="ghost"
                onClick={() => undoAddMatch(matchAddHistory[0])}
                size="sm"
                disabled={saving !== null}
              >
                ↩️ Undo Add ({matchAddHistory.length})
              </RippleButton>
            )}
            {scoreHistory.length > 0 && (
              <RippleButton variant="ghost" onClick={undoLastChange} size="sm" disabled={saving !== null}>
                ↩️ Undo Score ({scoreHistory.length})
              </RippleButton>
            )}
            <RippleButton variant="ghost" onClick={() => setShowHistory(!showHistory)} size="sm">
              📋 History
            </RippleButton>
            <RippleButton variant="ghost" onClick={() => setShowStandings(!showStandings)} size="sm">
              📊 Standings
            </RippleButton>
            <RippleButton variant="ghost" onClick={() => setShowPlayers(!showPlayers)} size="sm">
              👥 Players
            </RippleButton>
            <RippleButton variant="ghost" onClick={fetchMatches} size="sm">
              🔄 Refresh
            </RippleButton>
            <RippleButton variant="danger" onClick={handleLogout} size="sm">
              🚪 Logout
            </RippleButton>
          </div>
        </motion.div>

        {/* NEW: Recently Added Matches — Quick Undo Toast */}
        <AnimatePresence>
          {matchAddHistory.length > 0 && (
            <motion.div
              className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center justify-between"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200">
                <span>📌</span>
                <span>
                  Last added: <strong>{matchAddHistory[0].homeTeam} vs {matchAddHistory[0].awayTeam}</strong> ({matchAddHistory[0].stage})
                </span>
              </div>
              <button
                onClick={() => undoAddMatch(matchAddHistory[0])}
                disabled={saving !== null}
                className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
              >
                Undo
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { label: "Total Matches", value: matches.length, icon: "📋", color: "from-blue-500 to-blue-600" },
            { label: "Group Stage", value: groupStageMatches.length, icon: "🏟️", color: "from-green-500 to-green-600" },
            { label: "Knockout", value: knockoutMatches.length, icon: "🏆", color: "from-yellow-500 to-yellow-600" },
            { label: "Completed", value: finishedMatches.length, icon: "✅", color: "from-purple-500 to-purple-600" },
            { label: "Pending", value: upcomingMatches.length, icon: "⏳", color: "from-orange-500 to-orange-600" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{stat.icon}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
              <p className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Add Knockout Match Section */}
        <motion.div
          className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div
            className="px-5 py-4 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-between cursor-pointer"
            onClick={() => setShowAddMatch(!showAddMatch)}
          >
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="text-xl">🏆</span>
              Add Knockout Match
            </h3>
            <motion.div
              animate={{ rotate: showAddMatch ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-white/80"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </motion.div>
          </div>

          <AnimatePresence>
            {showAddMatch && (
              <motion.form
                onSubmit={handleAddMatch}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-5 border-t border-gray-100 dark:border-gray-700">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Stage
                      </label>
                      <select
                        value={addMatchForm.stage}
                        onChange={(e) => setAddMatchForm({ ...addMatchForm, stage: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                      >
                        {knockoutStages.map((stage) => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Home Team
                      </label>
                      <select
                        value={addMatchForm.homeTeam}
                        onChange={(e) => setAddMatchForm({ ...addMatchForm, homeTeam: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                      >
                        <option value="">Select home team...</option>
                        {allTeamsSorted.map((team) => (
                          <option key={team} value={team} disabled={team === addMatchForm.awayTeam}>
                            {team}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Away Team
                      </label>
                      <select
                        value={addMatchForm.awayTeam}
                        onChange={(e) => setAddMatchForm({ ...addMatchForm, awayTeam: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                      >
                        <option value="">Select away team...</option>
                        {allTeamsSorted.map((team) => (
                          <option key={team} value={team} disabled={team === addMatchForm.homeTeam}>
                            {team}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Date
                      </label>
                      <input
                        type="date"
                        value={addMatchForm.date}
                        onChange={(e) => setAddMatchForm({ ...addMatchForm, date: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Kickoff Time
                      </label>
                      <input
                        type="time"
                        value={addMatchForm.time}
                        onChange={(e) => setAddMatchForm({ ...addMatchForm, time: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Venue
                      </label>
                      <select
                        value={addMatchForm.venueId}
                        onChange={(e) => setAddMatchForm({ ...addMatchForm, venueId: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-amber-500 focus:outline-none transition-colors text-sm"
                      >
                        <option value="">Select venue...</option>
                        {allVenues.map((venue) => (
                          <option key={venue.id} value={venue.id}>
                            {venue.stadium} — {venue.city}, {venue.country} ({venue.capacity.toLocaleString()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {addMatchError && (
                    <motion.p className="text-red-500 text-sm mb-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      ⚠️ {addMatchError}
                    </motion.p>
                  )}

                  {addMatchForm.homeTeam && addMatchForm.awayTeam && addMatchForm.stage && (
                    <motion.div
                      className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-center"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium uppercase tracking-wide mb-1">
                        {addMatchForm.stage}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {addMatchForm.homeTeam || "?"} <span className="text-gray-400">vs</span> {addMatchForm.awayTeam || "?"}
                      </p>
                      {addMatchForm.venueId && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          📍 {allVenues.find((v) => v.id === addMatchForm.venueId)?.stadium}
                        </p>
                      )}
                    </motion.div>
                  )}

                  <div className="flex justify-end">
                    <RippleButton
                      type="submit"
                      variant="success"
                      disabled={addingMatch || !addMatchForm.homeTeam || !addMatchForm.awayTeam}
                      size="md"
                    >
                      {addingMatch ? (
                        <span className="flex items-center gap-2">
                          <motion.span
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          />
                          Adding...
                        </span>
                      ) : (
                        "➕ Add Match"
                      )}
                    </RippleButton>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Player Manager Panel */}
        <AnimatePresence>
          {showPlayers && (
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PlayerManager />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Change History Panel */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-700/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">📋 Recent Score Changes</h3>
                <button
                  onClick={() => setScoreHistory([])}
                  className="text-xs text-red-500 hover:text-red-600 font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {scoreHistory.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">No changes yet</p>
                ) : (
                  scoreHistory.map((entry, i) => (
                    <motion.div
                      key={entry.timestamp}
                      className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      <div className="text-sm">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {entry.homeTeam} vs {entry.awayTeam}
                        </span>
                        <span className="text-gray-400 mx-2">→</span>
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {entry.newHomeScore} - {entry.newAwayScore}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Standings Preview Panel */}
        <AnimatePresence>
          {showStandings && (
            <motion.div
              className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between">
                <h3 className="font-semibold">📊 Live Group Standings Preview</h3>
                <span className="text-xs text-blue-200">Auto-updates as scores change</span>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[600px] overflow-y-auto">
                {Object.entries(standings).map(([letter, rows]) => (
                  <div key={letter} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {letter}
                      </span>
                      Group {letter}
                    </h4>
                    <div className="space-y-1">
                      {rows.map((row) => {
                        const maxPossiblePlayed = Math.max(...rows.map((r) => r.played));
                        const groupComplete = maxPossiblePlayed >= 6;
                        const status = row.pos <= 2
                          ? { icon: groupComplete ? "✅" : "🟢", label: groupComplete ? "Q" : "Adv", color: "text-green-600 dark:text-green-400" }
                          : row.pos === 3
                          ? { icon: groupComplete ? "⚠️" : "🟡", label: groupComplete ? "?" : "Pos", color: "text-amber-500" }
                          : { icon: groupComplete ? "❌" : "🔴", label: groupComplete ? "Out" : "Risk", color: "text-red-500" };

                        return (
                          <div
                            key={row.team}
                            className={`flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600/50 ${
                              row.pos <= 2 && groupComplete ? "bg-green-50/50 dark:bg-green-900/10" : ""
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[10px] w-4 text-center font-bold text-gray-400">{row.pos}</span>
                              <div
                                className="w-1 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: row.color?.primary || "#6b7280" }}
                              />
                              <span className="text-gray-700 dark:text-gray-300 font-medium truncate">{row.team}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className={`text-[10px] ${status.color}`} title={status.label}>{status.icon}</span>
                              <span className="font-bold text-blue-600 dark:text-blue-400">{row.points}pts</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content: Upcoming + Finished matches side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Matches */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              Matches Needing Scores
            </h2>
            {upcomingMatches.length === 0 ? (
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-4xl">🎉</span>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">All matches have scores!</p>
              </motion.div>
            ) : (
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                {upcomingMatches.map((match, index) => (
                  <MatchEditor
                    key={match.id}
                    match={match}
                    onSave={requestUpdateScore}
                    saving={saving === match.id}
                    isExpanded={expandedMatch === match.id}
                    onToggleExpand={() =>
                      setExpandedMatch(expandedMatch === match.id ? null : match.id)
                    }
                    index={index}
                    onDelete={match.stage !== "Group Stage" ? () => deleteMatch(match.id) : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Finished Matches */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              Completed Matches
            </h2>
            {finishedMatches.length === 0 ? (
              <motion.div
                className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-dashed border-gray-300 dark:border-gray-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-4xl">📝</span>
                <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">No completed matches yet.</p>
              </motion.div>
            ) : (
              <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
                {finishedMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ x: 3 }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {match.date} · {match.time} · <span className="font-semibold">{match.stage}</span>
                        {match.group && ` · Group ${match.group}`}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                        {match.homeTeam} vs {match.awayTeam}
                      </div>
                      {match.venue && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">📍 {match.venue.stadium}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                        {match.homeScore} - {match.awayScore}
                      </div>
                      <button
                        onClick={() => clearScore(match.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-500 hover:text-red-600 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                        title="Clear score"
                      >
                        ✕
                      </button>
                      {/* NEW: Delete button for knockout matches */}
                      {match.stage !== "Group Stage" && (
                        <button
                          onClick={() => deleteMatch(match.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-red-400 hover:text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete match"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setConfirmDialog(null)}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-4">
                <span className="text-5xl block mb-3">⚽</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Score</h3>
              </div>
              <div className="text-center mb-6">
                <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">
                  {confirmDialog.homeTeam}
                </p>
                <p className="text-4xl font-black text-gray-900 dark:text-white my-2">
                  {confirmDialog.homeScore} - {confirmDialog.awayScore}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-semibold">
                  {confirmDialog.awayTeam}
                </p>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center mb-4">
                This will update the standings. You can undo this change.
              </p>
              <div className="flex gap-3">
                <RippleButton variant="ghost" onClick={() => setConfirmDialog(null)} className="flex-1">
                  Cancel
                </RippleButton>
                <RippleButton
                  variant="success"
                  onClick={() => executeUpdateScore(confirmDialog.matchId, confirmDialog.homeScore, confirmDialog.awayScore)}
                  className="flex-1"
                >
                  ✅ Confirm
                </RippleButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Match Editor Component
function MatchEditor({
  match,
  onSave,
  saving,
  isExpanded,
  onToggleExpand,
  index,
  onDelete,
}: {
  match: Match;
  onSave: (id: string, home: number, away: number) => void;
  saving: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  index: number;
  onDelete?: () => void;
}) {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away)) {
      setError("Please enter both scores");
      return;
    }
    if (home < 0 || away < 0) {
      setError("Scores cannot be negative");
      return;
    }
    setError("");
    onSave(match.id, home, away);
    setHomeScore("");
    setAwayScore("");
  };

  const quickSet = (h: number, a: number) => {
    setHomeScore(h.toString());
    setAwayScore(a.toString());
    setError("");
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <motion.div
        className="p-4 cursor-pointer flex items-center justify-between"
        onClick={onToggleExpand}
        whileHover={{ backgroundColor: "rgba(59,130,246,0.03)" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <motion.span
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-gray-400 flex-shrink-0"
          >
            ▶
          </motion.span>
          <div className="min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {match.date} · {match.time} · <span className="font-semibold">{match.stage}</span>
              {match.group && ` · Group ${match.group}`}
            </div>
            <div className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate">
              {match.homeTeam} <span className="text-gray-400 font-normal">vs</span> {match.awayTeam}
            </div>
            {match.venue && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                📍 {match.venue.stadium}, {match.venue.city}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {/* NEW: Delete button for knockout matches */}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-xs text-red-400 hover:text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete this match"
            >
              🗑
            </button>
          )}
          <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            {isExpanded ? "Cancel" : "Set Score"}
          </span>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              <div className="flex justify-center gap-2 mb-4 flex-wrap">
                {[[1, 0], [2, 0], [2, 1], [1, 1], [0, 0], [1, 2], [0, 2], [0, 1]].map(([h, a]) => (
                  <button
                    key={`${h}-${a}`}
                    type="button"
                    onClick={() => quickSet(h, a)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {h} - {a}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4 flex-wrap justify-center">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{match.homeTeam}</p>
                  <input
                    type="number"
                    value={homeScore}
                    onChange={(e) => { setHomeScore(e.target.value); setError(""); }}
                    placeholder="0"
                    min="0"
                    className="w-20 px-4 py-3 text-center text-2xl font-bold border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <span className="text-2xl font-light text-gray-400 mt-6">-</span>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{match.awayTeam}</p>
                  <input
                    type="number"
                    value={awayScore}
                    onChange={(e) => { setAwayScore(e.target.value); setError(""); }}
                    placeholder="0"
                    min="0"
                    className="w-20 px-4 py-3 text-center text-2xl font-bold border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div className="mt-6">
                  <RippleButton type="submit" variant="success" disabled={saving} size="md">
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <motion.span
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Saving...
                      </span>
                    ) : (
                      "💾 Save Score"
                    )}
                  </RippleButton>
                </div>
              </div>
              {error && (
                <motion.p className="text-center text-red-500 text-sm mt-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {error}
                </motion.p>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}