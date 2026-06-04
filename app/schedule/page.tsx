"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MatchCard from "@/components/MatchCard";

// Define types
interface Venue {
  stadium: string;
  city: string;
  country: string;
  capacity: number;
}

interface Match {
  id: string;
  stage: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  date: string;
  time: string;
  venueId: string;
  group?: string;
}

const scheduleData = require("@/data/schedule.json") as { matches: Match[] } | Match[];
const venuesData = require("@/data/venues.json") as {
  countries: Array<{
    name: string;
    venues: Array<{
      stadium: string;
      city: string;
      capacity: number;
    }>;
  }>;
};

// Create venue map
const venueMap: Record<string, Venue> = {};
if (venuesData.countries) {
  venuesData.countries.forEach((country) => {
    country.venues.forEach((venue) => {
      const venueId = venue.stadium.toLowerCase().replace(/\s+/g, "-");
      venueMap[venueId] = {
        stadium: venue.stadium,
        city: venue.city,
        country: country.name,
        capacity: venue.capacity,
      };
    });
  });
}

const stages = [
  "All",
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Third-place Match",
  "Final",
];

// Map API stage names to filter names (handle "Third Place" vs "Third-place Match")
const stageNameMap: Record<string, string> = {
  "Third Place": "Third-place Match",
};

// Distinct accent colors for knockout stages
const knockoutAccents: Record<string, { gradient: string; icon: string }> = {
  "Round of 32": {
    gradient: "from-slate-500 to-slate-700",
    icon: "🏟️",
  },
  "Round of 16": {
    gradient: "from-emerald-500 to-teal-600",
    icon: "⚡",
  },
  "Quarter-finals": {
    gradient: "from-blue-500 to-indigo-600",
    icon: "🔥",
  },
  "Semi-finals": {
    gradient: "from-purple-500 to-violet-600",
    icon: "⭐",
  },
  "Third-place Match": {
    gradient: "from-amber-500 to-orange-600",
    icon: "🥉",
  },
  Final: {
    gradient: "from-yellow-400 via-amber-500 to-red-500",
    icon: "👑",
  },
};

export default function SchedulePage() {
  const [selectedStage, setSelectedStage] = useState("All");
  const [knockoutMatches, setKnockoutMatches] = useState<Match[]>([]);
  const [isLoadingKnockout, setIsLoadingKnockout] = useState(true);

  // Fetch knockout matches from API
  useEffect(() => {
    const fetchKnockoutMatches = async () => {
      try {
        const res = await fetch("/api/admin/matches");
        const data = await res.json();
        const apiMatches: Match[] = Array.isArray(data) ? data : data.matches || [];
        const knockout = apiMatches.filter((m) => m.stage !== "Group Stage");
        setKnockoutMatches(knockout);
      } catch (err) {
        console.error("Failed to fetch knockout matches:", err);
        setKnockoutMatches([]);
      } finally {
        setIsLoadingKnockout(false);
      }
    };
    fetchKnockoutMatches();
  }, []);

  // Build complete match list: static group stage + API knockout matches
  const allMatches = useMemo(() => {
    let staticMatches: Match[] = [];
    if (scheduleData && "matches" in scheduleData && Array.isArray(scheduleData.matches)) {
      staticMatches = scheduleData.matches;
    } else if (Array.isArray(scheduleData)) {
      staticMatches = scheduleData;
    }

    // Deduplicate by ID (API knockouts take priority for score updates)
    const knockoutIds = new Set(knockoutMatches.map((m) => m.id));
    const filteredStatic = staticMatches.filter((m) => !knockoutIds.has(m.id));

    return [...filteredStatic, ...knockoutMatches];
  }, [knockoutMatches]);

  // Filter matches by selected stage
  const matches = useMemo(() => {
    if (selectedStage === "All") {
      return allMatches;
    }
    const apiStageName =
      Object.entries(stageNameMap).find(([_, v]) => v === selectedStage)?.[0] || selectedStage;
    return allMatches.filter(
      (match) => match.stage === selectedStage || match.stage === apiStageName
    );
  }, [selectedStage, allMatches]);

  // Group matches by date
  const matchesByDate = useMemo(() => {
    return matches.reduce(
      (acc, match) => {
        if (!acc[match.date]) acc[match.date] = [];
        acc[match.date].push(match);
        return acc;
      },
      {} as Record<string, Match[]>
    );
  }, [matches]);

  const sortedDates = Object.keys(matchesByDate).sort();

  // Counts
  const knockoutCount = allMatches.filter((m) => m.stage !== "Group Stage").length;
  const isKnockoutStage = selectedStage !== "All" && selectedStage !== "Group Stage";
  const isFilteredEmpty = matches.length === 0 && !isLoadingKnockout;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header — ALWAYS VISIBLE */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600 bg-clip-text text-transparent">
              Match Schedule
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Full fixture list for FIFA World Cup 2026
          </p>
          <motion.div
            className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          >
            <span>⚽</span>
            {allMatches.length} Matches
            {knockoutCount > 0 && (
              <>
                <span className="opacity-50">·</span>
                <span className="text-yellow-200">{knockoutCount} knockout</span>
              </>
            )}
            <span>🏟️</span>
          </motion.div>
          {isLoadingKnockout && (
            <motion.p
              className="text-xs text-gray-400 dark:text-gray-500 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Checking for knockout matches...
            </motion.p>
          )}
        </motion.div>

        {/* Stage Filter Pills — ALWAYS VISIBLE */}
        <motion.div
          className="mb-8 flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {stages.map((stage, index) => {
            const isKnockoutBtn = stage !== "All" && stage !== "Group Stage";
            const accent = isKnockoutBtn ? knockoutAccents[stage] : null;
            const isSelected = selectedStage === stage;

            let selectedClass = "";
            if (isSelected) {
              if (stage === "All") {
                selectedClass =
                  "bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105";
              } else if (stage === "Group Stage") {
                selectedClass =
                  "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105";
              } else if (accent) {
                selectedClass = `bg-gradient-to-r ${accent.gradient} text-white shadow-lg scale-105`;
              }
            }

            return (
              <motion.button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-4 py-2.5 rounded-full font-medium text-sm transition-all duration-300 ${
                  isSelected
                    ? selectedClass
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md border border-gray-200 dark:border-gray-700"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.04 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={
                  stage === "All"
                    ? "Show all matches (Group Stage + Knockout)"
                    : `Filter by ${stage}`
                }
              >
                {stage === "All" && "🌍 "}
                {stage === "Group Stage" && "🏆 "}
                {isKnockoutBtn && accent ? `${accent.icon} ` : ""}
                {stage}
              </motion.button>
            );
          })}
        </motion.div>

        {/* Content Area */}
        {isLoadingKnockout && allMatches.length === 0 ? (
          <div className="flex justify-center py-16">
            <motion.div
              className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
        ) : isFilteredEmpty ? (
          /* Empty state for selected filter — filter pills remain visible above */
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-6xl block mb-4">
              {isKnockoutStage
                ? knockoutAccents[selectedStage]?.icon || "🏟️"
                : "📋"}
            </span>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
              {isKnockoutStage
                ? `No ${selectedStage} matches scheduled yet.`
                : "No matches scheduled for this stage yet."}
            </p>
            <p className="text-gray-400 dark:text-gray-500 mt-2 max-w-md mx-auto">
              {isKnockoutStage
                ? "Knockout matches will be added by the admin once the group stage concludes. Use the filters above to view other stages."
                : "The full schedule will be released closer to the tournament."}
            </p>
            {/* Quick-jump to stages that have content */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setSelectedStage("All")}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm font-medium transition-colors shadow-md"
              >
                🌍 View All Matches
              </button>
              <button
                onClick={() => setSelectedStage("Group Stage")}
                className="px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium transition-colors shadow-md border border-gray-200 dark:border-gray-700"
              >
                🏆 Group Stage (72 matches)
              </button>
            </div>
          </motion.div>
        ) : (
          /* Match list */
          <div className="space-y-10">
            <AnimatePresence mode="wait">
              {sortedDates.map((date, dateIndex) => {
                const dateMatches = matchesByDate[date];
                const dateHasKnockout = dateMatches.some((m) => m.stage !== "Group Stage");

                return (
                  <motion.div
                    key={date}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, delay: dateIndex * 0.05 }}
                  >
                    {/* Date Header */}
                    <div className="flex items-center gap-4 mb-5">
                      <div
                        className={`flex-1 h-px bg-gradient-to-r from-transparent ${
                          dateHasKnockout && isKnockoutStage
                            ? "via-amber-400 dark:via-amber-500"
                            : "via-gray-300 dark:via-gray-600"
                        } to-transparent`}
                      />
                      <h2
                        className={`text-xl sm:text-2xl font-bold whitespace-nowrap px-4 py-2 rounded-full shadow-md border ${
                          dateHasKnockout && isKnockoutStage
                            ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800"
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-100 dark:border-gray-700"
                        }`}
                      >
                        <span className="mr-2">
                          {dateHasKnockout && isKnockoutStage ? "⚔️" : "📅"}
                        </span>
                        {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </h2>
                      <div
                        className={`flex-1 h-px bg-gradient-to-r from-transparent ${
                          dateHasKnockout && isKnockoutStage
                            ? "via-amber-400 dark:via-amber-500"
                            : "via-gray-300 dark:via-gray-600"
                        } to-transparent`}
                      />
                    </div>

                    {/* Match Cards */}
                    <div className="space-y-4">
                      {dateMatches.map((match, matchIndex) => {
                        const venue = venueMap[match.venueId];
                        const isKnockoutMatch = match.stage !== "Group Stage";
                        const matchAccent = isKnockoutMatch
                          ? knockoutAccents[match.stage] ||
                            knockoutAccents[stageNameMap[match.stage] || match.stage]
                          : null;

                        return (
                          <motion.div
                            key={match.id}
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: matchIndex * 0.08,
                              type: "spring",
                              stiffness: 250,
                              damping: 25,
                            }}
                            className="relative"
                          >
                            {isKnockoutMatch && matchAccent && (
                              <div
                                className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl bg-gradient-to-b ${matchAccent.gradient} z-10`}
                              />
                            )}
                            <MatchCard
                              homeTeam={match.homeTeam}
                              awayTeam={match.awayTeam}
                              homeScore={match.homeScore}
                              awayScore={match.awayScore}
                              date={match.date}
                              time={match.time}
                              venue={venue?.stadium || match.venueId}
                              stage={match.stage}
                              group={match.group}
                              matchId={match.id}
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom Note — ALWAYS VISIBLE */}
        <motion.p
          className="text-center text-sm text-gray-400 dark:text-gray-500 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          * Schedule subject to change. All times are local to the venue.
        </motion.p>
      </div>
    </div>
  );
}