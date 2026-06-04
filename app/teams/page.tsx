"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import teamsData from "@/data/teams.json";
import playersData from "@/data/players.json";
import tacticalData from "@/data/tactical-analysis.json";
import playersToWatchData from "@/data/players-to-watch.json";
import fifaRankings from "@/data/fifa-rankings.json";
import Pitch from "@/components/Pitch";
import GroupStandings from "@/components/GroupStandings";

// ─── Helpers ────────────────────────────────────────

function getFifaRank(teamName: string): number | null {
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

function RankBadge({ rank }: { rank: number }) {
  let colors = "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300";
  if (rank <= 5) colors = "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 font-bold";
  else if (rank <= 10) colors = "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 font-bold";
  else if (rank <= 20) colors = "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-bold";

  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${colors}`}>
      #{rank}
    </span>
  );
}

export default function TeamsPage() {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"lineups" | "tactical">("lineups");
  const [viewMode, setViewMode] = useState<"confederations" | "groups">("confederations");

  const lineupMap = new Map(playersData.teams.map((t) => [t.name, t]));
  const tacticalMap = new Map(tacticalData.analyses.map((t) => [t.team, t]));

  const allTeamsList = teamsData.allTeams;

  const getConfederation = (team: string): string => {
    for (const [code, conf] of Object.entries(teamsData.confederations)) {
      if ((conf as any).teams.includes(team)) return (conf as any).name;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-green-500 to-blue-600 bg-clip-text text-transparent">
              Teams
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            All 48 qualified nations for FIFA World Cup 2026
          </p>
          <motion.div
            className="mt-4 inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          >
            {allTeamsList.length} Teams • 6 Confederations • 12 Groups
          </motion.div>
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-gray-200/50 dark:border-gray-700/50 inline-flex gap-1">
            <motion.button
              onClick={() => setViewMode("confederations")}
              className={`relative px-6 py-2.5 rounded-xl font-semibold text-sm sm:text-base transition-colors duration-300 ${
                viewMode === "confederations"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {viewMode === "confederations" && (
                <motion.div
                  layoutId="viewToggle"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-md"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                🌍 By Confederation
              </span>
            </motion.button>

            <motion.button
              onClick={() => setViewMode("groups")}
              className={`relative px-6 py-2.5 rounded-xl font-semibold text-sm sm:text-base transition-colors duration-300 ${
                viewMode === "groups"
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {viewMode === "groups" && (
                <motion.div
                  layoutId="viewToggle"
                  className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-md"
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                🏆 Group Standings
              </span>
            </motion.button>
          </div>
        </motion.div>

        {/* Content - Confederation View */}
        <AnimatePresence mode="wait">
          {viewMode === "confederations" ? (
            <motion.div
              key="confederations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-8 mb-12"
            >
              {Object.entries(teamsData.confederations).map(
                ([code, conf]: [string, any], confIndex) => (
                  <motion.div
                    key={code}
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: confIndex * 0.1 }}
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4">
                      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <span className="text-2xl">
                          {code === "UEFA" ? "🇪🇺" : code === "CONMEBOL" ? "🇧🇷" : code === "CAF" ? "🇲🇦" : code === "AFC" ? "🇯🇵" : code === "CONCACAF" ? "🇺🇸" : "🇳🇿"}
                        </span>
                        {conf.name}
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-3">
                        {conf.teams.map((team: string, teamIndex: number) => {
                          const rank = getFifaRank(team);
                          const hasLineup = lineupMap.has(team);
                          return (
                            <motion.button
                              key={team}
                              onClick={() =>
                                setSelectedTeam(team === selectedTeam ? null : team)
                              }
                              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                                selectedTeam === team
                                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105"
                                  : hasLineup
                                  ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 hover:shadow-md"
                                  : "bg-gray-100/50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105 hover:shadow-md"
                              }`}
                              initial={{ opacity: 0, scale: 0.8 }}
                              whileInView={{ opacity: 1, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: teamIndex * 0.03, type: "spring" }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span>{team}</span>
                              {rank && <RankBadge rank={rank} />}
                              {hasLineup && (
                                <span className="text-[10px] text-green-500" title="Squad available">✓</span>
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </motion.div>
          ) : (
            /* Group Standings View */
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="mb-12"
            >
              <GroupStandings
                onTeamClick={(team) =>
                  setSelectedTeam(team === selectedTeam ? null : team)
                }
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Team Detail Modal */}
        <AnimatePresence>
          {selectedTeam && (() => {
            const teamLineup = lineupMap.get(selectedTeam);
            if (!teamLineup) return null;
            return (
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTeam(null)}
              >
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50"
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-white">{selectedTeam}</h2>
                        {getFifaRank(selectedTeam) && (
                          <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
                            FIFA #{getFifaRank(selectedTeam)}
                          </span>
                        )}
                      </div>
                      <p className="text-blue-200 text-sm">{getConfederation(selectedTeam)}</p>
                    </div>
                    <motion.button
                      onClick={() => setSelectedTeam(null)}
                      className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </motion.button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6">
                    {/* Tab Switcher */}
                    <div className="flex gap-3 mb-6">
                      <motion.button
                        onClick={() => setActiveTab("lineups")}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                          activeTab === "lineups"
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ⚽ Squad Lineup
                      </motion.button>
                      <motion.button
                        onClick={() => setActiveTab("tactical")}
                        className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-300 ${
                          activeTab === "tactical"
                            ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        📊 Tactical Analysis
                      </motion.button>
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                      {activeTab === "lineups" && teamLineup && (
                        <motion.div
                          key="lineups"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          {teamLineup.players && teamLineup.players.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                              <div className="lg:col-span-3 flex justify-center">
                                <div className="bg-gradient-to-b from-green-50 to-green-100/50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-4 w-full">
                                  <Pitch
                                    formation={teamLineup.formation}
                                    lineup={teamLineup.players}
                                    teamName={selectedTeam}
                                  />
                                </div>
                              </div>
                              <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-4">
                                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <span className="w-2 h-6 rounded-full bg-blue-500"></span>
                                    Starting XI
                                  </h3>
                                  <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full font-bold">
                                    {teamLineup.formation}
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {teamLineup.players.map((player: any, idx: number) => (
                                    <motion.div
                                      key={idx}
                                      className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-blue-50/50 dark:from-gray-700/50 dark:to-gray-700/30 p-3.5 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer group border border-transparent hover:border-blue-200/50 dark:hover:border-blue-800/30"
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05, type: "spring", stiffness: 200 }}
                                      whileHover={{ scale: 1.02, x: 5 }}
                                    >
                                      <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all flex-shrink-0">
                                        {player.number || idx + 1}
                                      </span>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                                          {player.name}
                                        </p>
                                      </div>
                                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/40 px-2.5 py-1 rounded-full shadow-sm flex-shrink-0">
                                        {player.position}
                                      </span>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                              <span className="text-5xl block mb-4">📝</span>
                              <p className="font-medium">Squad not yet confirmed</p>
                              <p className="text-sm mt-1">The lineup for {selectedTeam} will be available closer to the tournament.</p>
                            </div>
                          )}
                        </motion.div>
                      )}

                      {activeTab === "tactical" && tacticalMap.has(selectedTeam) && (
                        <motion.div
                          key="tactical"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-6 border border-blue-100/50 dark:border-blue-900/20">
                            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 font-medium leading-relaxed">
                              {tacticalMap.get(selectedTeam)?.style}
                            </p>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg flex items-center gap-2">
                              <span className="text-green-500">✅</span> Key Strengths:
                            </h4>
                            <ul className="space-y-3">
                              {tacticalMap.get(selectedTeam)?.strengths.map(
                                (strength: string, idx: number) => (
                                  <motion.li
                                    key={idx}
                                    className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                  >
                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 shadow-sm shadow-green-500/30" />
                                    {strength}
                                  </motion.li>
                                )
                              )}
                            </ul>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "tactical" && !tacticalMap.has(selectedTeam) && (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                          <span className="text-5xl block mb-4">📊</span>
                          <p className="font-medium">Tactical analysis not available</p>
                          <p className="text-sm mt-1">Coming soon for {selectedTeam}.</p>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Players to Watch */}
        <motion.div
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50 dark:border-gray-700/50"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">⭐</span> Players to Watch
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {playersToWatchData.players.map((player, index) => {
              const playerTeamRank = getFifaRank(player.team);
              return (
                <motion.div
                  key={player.name}
                  className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-lg p-5 text-center hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5, scale: 1.03 }}
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform">
                    {player.name.charAt(0)}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {player.name}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                      {player.team}
                    </p>
                    {playerTeamRank && <RankBadge rank={playerTeamRank} />}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {player.position}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}