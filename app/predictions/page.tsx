"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import predictionsData from "@/data/predictions.json";
import teamsData from "@/data/teams.json";
import teamColorsData from "@/data/team-colors.json";
import tacticalData from "@/data/tactical-analysis.json";
import fifaRankings from "@/data/fifa-rankings.json";
import { AnimatedTrophy, BouncingBall } from "@/components/AnimatedIcons";

// ─── Helpers ────────────────────────────────────────

function getTeamColor(teamName: string) {
  const key = Object.keys(teamColorsData.teams).find(
    (k) => k.toLowerCase() === teamName.toLowerCase()
  );
  return key ? (teamColorsData.teams as any)[key] : null;
}

function getFifaRank(teamName: string): number | null {
  // Handle name variations
  const nameMap: Record<string, string> = {
    "Iran": "Iran",
    "IR Iran": "Iran",
    "Côte d'Ivoire": "Ivory Coast",
    "Ivory Coast": "Ivory Coast",
    "Cabo Verde": "Cape Verde",
    "Cape Verde": "Cape Verde",
    "Bosnia and Herzegovina": "Bosnia & Herzegovina",
    "Bosnia & Herzegovina": "Bosnia & Herzegovina",
    "Korea Republic": "South Korea",
    "South Korea": "South Korea",
    "Czech Republic": "Czech Republic",
  };
  const lookupName = nameMap[teamName] || teamName;
  const entry = fifaRankings.rankings.find(
    (r) => r.team.toLowerCase() === lookupName.toLowerCase()
  );
  return entry ? entry.rank : null;
}

const allTeamsSorted = [...teamsData.allTeams].sort();
const tacticalMap = new Map(tacticalData.analyses.map((t) => [t.team, t]));

// ─── Sub-Components ─────────────────────────────────

function RankBadge({ rank, size = "sm" }: { rank: number; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5",
    md: "text-xs px-2 py-0.5",
    lg: "text-sm px-2.5 py-1",
  };

  let colors = "bg-gray-700 text-gray-300";
  if (rank <= 5) colors = "bg-amber-400/20 text-amber-400 border border-amber-400/30";
  else if (rank <= 10) colors = "bg-blue-400/20 text-blue-400 border border-blue-400/30";
  else if (rank <= 20) colors = "bg-green-400/20 text-green-400 border border-green-400/30";

  return (
    <span className={`font-bold rounded-full ${sizeClasses[size]} ${colors}`}>
      #{rank}
    </span>
  );
}

function ConfidenceRing({ confidence, size = 80 }: { confidence: number; size?: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (confidence / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
        <motion.circle
          cx="40" cy="40" r={radius} fill="none" stroke="url(#confidenceGradient)" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
        <defs>
          <linearGradient id="confidenceGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black text-white">{confidence}%</span>
      </div>
    </div>
  );
}

function UpsetMeter({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400">Upset Potential</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${level * 10}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-xs font-bold text-orange-400">{level}/10</span>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────

export default function PredictionsPage() {
  const [activeNarrative, setActiveNarrative] = useState<number | null>(null);
  const [whatIfHome, setWhatIfHome] = useState("");
  const [whatIfAway, setWhatIfAway] = useState("");
  const [showWhatIf, setShowWhatIf] = useState(false);

  const homeAnalysis = tacticalMap.get(whatIfHome);
  const awayAnalysis = tacticalMap.get(whatIfAway);
  const homeColor = getTeamColor(whatIfHome);
  const awayColor = getTeamColor(whatIfAway);
  const homeRank = getFifaRank(whatIfHome);
  const awayRank = getFifaRank(whatIfAway);

  const predictionResult = useMemo(() => {
    if (!whatIfHome || !whatIfAway) return null;
    
    let hScore = 50;
    let aScore = 50;
    
    // Use tactical data if available
    if (homeAnalysis) hScore += homeAnalysis.strengths.length * 8;
    if (awayAnalysis) aScore += awayAnalysis.strengths.length * 8;
    
    // Use FIFA rankings for edge (lower rank = better)
    if (homeRank && awayRank) {
      const rankDiff = awayRank - homeRank;
      hScore += Math.max(-20, Math.min(20, rankDiff * 1.5));
    } else if (homeRank && !awayRank) {
      hScore += 10;
    } else if (!homeRank && awayRank) {
      aScore += 10;
    }
    
    const total = hScore + aScore;
    const homePct = Math.round((hScore / total) * 100);
    return { homePct, awayPct: 100 - homePct, winner: homePct >= 50 ? whatIfHome : whatIfAway };
  }, [homeAnalysis, awayAnalysis, homeRank, awayRank, whatIfHome, whatIfAway]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f1e] via-[#0d1528] to-[#0a0f1e]">
      {/* ── Hero: The Oracle's Verdict ── */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #F59E0B 0%, transparent 60%)" }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <AnimatedTrophy size={80} />
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-black mt-6 mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          >
            The Oracle&apos;s Verdict
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          >
            Expert analysis, data-driven predictions, and the narratives that will define World Cup 2026
          </motion.p>
          <motion.p
            className="text-xs text-gray-500 mt-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          >
            Powered by latest FIFA Rankings • Updated {fifaRankings.lastUpdated}
          </motion.p>
        </div>
      </section>

      {/* ── Tier of Titans ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            👑 Tier of <span className="text-amber-400">Titans</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {predictionsData.favorites.map((fav, idx) => {
              const colors = getTeamColor(fav.team);
              const fifaRank = getFifaRank(fav.team);
              return (
                <motion.div
                  key={fav.team}
                  className={`relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 cursor-pointer group overflow-hidden ${
                    fav.rank === 1 ? "lg:col-span-2 lg:row-span-1" : ""
                  }`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, type: "spring", stiffness: 200 }}
                  whileHover={{ y: -6, borderColor: "rgba(255,255,255,0.2)" }}
                >
                  {/* Rank badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {fifaRank && <RankBadge rank={fifaRank} size="md" />}
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                      fav.rank === 1 ? "bg-amber-400 text-black" :
                      fav.rank === 2 ? "bg-gray-300 text-gray-800" :
                      fav.rank === 3 ? "bg-orange-500 text-white" :
                      "bg-white/10 text-white"
                    }`}>#{fav.rank}</span>
                  </div>

                  {/* Team color bar */}
                  {colors && (
                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})` }} />
                  )}

                  <div className="flex items-start gap-4 mt-2">
                    <ConfidenceRing confidence={fav.confidence} size={fav.rank === 1 ? 90 : 70} />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl md:text-2xl font-bold text-white">{fav.team}</h3>
                        {fifaRank && <RankBadge rank={fifaRank} size="sm" />}
                      </div>
                      <p className="text-sm text-amber-400 font-semibold">{fav.keyPlayer}</p>
                      <p className="text-sm text-gray-400 mt-1 leading-relaxed">{fav.reason}</p>
                      <div className="mt-2 inline-block bg-white/5 rounded-lg px-3 py-1.5">
                        <p className="text-xs text-gray-500">
                          <span className="text-amber-400 font-bold">X-Factor:</span> {fav.xFactor}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Path to Glory (flip on hover) */}
                  <div className="absolute inset-0 bg-[#0d1528]/95 backdrop-blur-sm rounded-2xl flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="text-center">
                      <h4 className="text-amber-400 font-bold text-lg mb-2">Path to Glory</h4>
                      <p className="text-gray-300 text-sm">Group → R32 → R16 → QF → SF → Final</p>
                      <p className="text-white font-bold mt-2">
                        {fav.rank <= 2 ? "🏆 Champion Pick" : "🏅 Semifinalist Pick"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Dark Horses: The Spoiler Alert ── */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            🐎 <span className="text-orange-400">Dark Horses</span> — The Spoiler Alert
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {predictionsData.darkHorses.map((horse, idx) => {
              const colors = getTeamColor(horse.team);
              const fifaRank = getFifaRank(horse.team);
              return (
                <motion.div
                  key={horse.team}
                  className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 group hover:border-orange-500/30 transition-colors"
                  initial={{ opacity: 0, y: 20, rotate: idx % 2 === 0 ? -1 : 1 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, type: "spring" }}
                  whileHover={{ y: -4 }}
                >
                  {colors && (
                    <div className="absolute top-0 left-4 right-4 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})` }} />
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <h3 className="text-lg font-bold text-white">{horse.team}</h3>
                    {fifaRank && <RankBadge rank={fifaRank} size="sm" />}
                  </div>
                  <p className="text-sm text-gray-400 mt-1.5">{horse.reason}</p>
                  <div className="mt-3">
                    <UpsetMeter level={horse.upsetPotential} />
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <p className="text-xs text-gray-500">
                      <span className="text-orange-400 font-semibold">⚡ Weapon:</span> {horse.signatureWeapon}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="text-orange-400 font-semibold">✨ Dream:</span> {horse.dreamScenario}
                    </p>
                  </div>
                  {/* Corkboard pin */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50 border-2 border-red-700" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── What If? Simulator ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            🔮 <span className="text-purple-400">What If?</span> Simulator
          </motion.h2>
          <p className="text-center text-gray-400 mb-10">Create hypothetical matchups and see who has the edge</p>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5">Home Team</label>
                <select
                  value={whatIfHome}
                  onChange={(e) => { setWhatIfHome(e.target.value); setShowWhatIf(false); }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none text-sm"
                >
                  <option value="">Select team...</option>
                  {allTeamsSorted.map((t) => {
                    const rank = getFifaRank(t);
                    return (
                      <option key={t} value={t} disabled={t === whatIfAway}>
                        {t} {rank ? `(#${rank})` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="text-center text-gray-500 font-bold text-xl md:self-center">VS</div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-400 mb-1.5">Away Team</label>
                <select
                  value={whatIfAway}
                  onChange={(e) => { setWhatIfAway(e.target.value); setShowWhatIf(false); }}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:outline-none text-sm"
                >
                  <option value="">Select team...</option>
                  {allTeamsSorted.map((t) => {
                    const rank = getFifaRank(t);
                    return (
                      <option key={t} value={t} disabled={t === whatIfHome}>
                        {t} {rank ? `(#${rank})` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="text-center mt-6">
              <motion.button
                onClick={() => setShowWhatIf(true)}
                disabled={!whatIfHome || !whatIfAway}
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Simulate Matchup
              </motion.button>
            </div>

            <AnimatePresence>
              {showWhatIf && whatIfHome && whatIfAway && predictionResult && (
                <motion.div className="mt-8" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <div className="border-t border-white/10 pt-6">
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-1">
                        <span className="text-xl font-bold text-white">{whatIfHome}</span>
                        {homeRank && <RankBadge rank={homeRank} size="sm" />}
                        <span className="text-gray-500">vs</span>
                        {awayRank && <RankBadge rank={awayRank} size="sm" />}
                        <span className="text-xl font-bold text-white">{whatIfAway}</span>
                      </div>
                      <motion.p className="text-3xl font-black mt-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                        <span className="text-purple-400">{predictionResult.homePct}%</span>
                        <span className="text-gray-500 mx-2">—</span>
                        <span className="text-pink-400">{predictionResult.awayPct}%</span>
                      </motion.p>
                      <p className="text-amber-400 font-semibold mt-2">
                        🏆 Predicted Winner: <span className="text-white">{predictionResult.winner}</span>
                      </p>
                      {(homeRank && awayRank) && (
                        <p className="text-xs text-gray-500 mt-1">
                          Based on FIFA rankings: #{homeRank} vs #{awayRank}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[ { team: whatIfHome, analysis: homeAnalysis, color: homeColor, rank: homeRank, side: "home" as const },
                         { team: whatIfAway, analysis: awayAnalysis, color: awayColor, rank: awayRank, side: "away" as const } ].map(({ team, analysis, color, rank, side }) => (
                        <div key={side} className="bg-white/5 rounded-xl p-4 border border-white/5">
                          <div className="flex items-center gap-2 mb-3">
                            {color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.primary }} />}
                            <h4 className="font-bold text-white text-sm">{team}</h4>
                            {rank && <RankBadge rank={rank} size="sm" />}
                          </div>
                          {analysis ? (
                            <>
                              <p className="text-xs text-gray-400 mb-3 italic">{analysis.style}</p>
                              <div className="space-y-2">
                                {analysis.strengths.map((s: string, i: number) => (
                                  <motion.div key={s} className="flex items-center gap-2" initial={{ opacity: 0, x: side === "home" ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                      <motion.div className="h-full rounded-full" style={{ backgroundColor: color?.primary || "#6b7280" }} initial={{ width: 0 }} animate={{ width: `${85 - i * 10}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }} />
                                    </div>
                                    <span className="text-xs text-gray-300 flex-shrink-0">{s}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="space-y-2">
                              {["Attack", "Midfield", "Defense", "Experience"].map((attr, i) => {
                                const seed = team.charCodeAt(0) + team.charCodeAt(2) + i * 7;
                                const strength = 40 + Math.floor(Math.abs(seed) % 45);
                                return (
                                  <motion.div key={attr} className="flex items-center gap-2" initial={{ opacity: 0, x: side === "home" ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                      <motion.div className="h-full rounded-full" style={{ backgroundColor: color?.primary || "#6b7280" }} initial={{ width: 0 }} animate={{ width: `${strength}%` }} transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }} />
                                    </div>
                                    <span className="text-xs text-gray-300 flex-shrink-0">{attr}</span>
                                  </motion.div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

            {/* ── Golden Boot Race ── */}
            <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            ⚽ The <span className="text-yellow-400">Golden Boot</span> Chase
          </motion.h2>
          <p className="text-center text-gray-400 mb-10">Who will finish as the tournament&apos;s top scorer?</p>

          <div className="space-y-4">
            {predictionsData.goldenBootCandidates.map((candidate, idx) => {
              const colors = getTeamColor(candidate.team);
              const teamRank = getFifaRank(candidate.team);
              return (
                <motion.div
                  key={candidate.player}
                  className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 flex items-center gap-4 group hover:border-yellow-500/30 transition-colors"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-white font-black text-sm">
                    {idx + 1}
                  </div>
                  {colors && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: colors.primary }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white">{candidate.player}</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-400">{candidate.team}</p>
                      {teamRank && <RankBadge rank={teamRank} size="sm" />}
                    </div>
                    <div className="mt-2">
                      <span className="text-xs text-amber-400/70 italic">Tournament prediction pending</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      candidate.odds === "Favorite" ? "bg-yellow-400/20 text-yellow-400" : "bg-gray-700 text-gray-300"
                    }`}>{candidate.odds}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Expert's Notebook ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            📰 <span className="text-blue-400">Expert&apos;s Notebook</span>
          </motion.h2>

          <div className="space-y-4">
            {predictionsData.narratives.map((narrative, idx) => (
              <motion.div
                key={idx}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setActiveNarrative(activeNarrative === idx ? null : idx)}
              >
                <div className="p-5 flex items-center justify-between">
                  <h3 className="font-bold text-white text-lg pr-4">{narrative.headline}</h3>
                  <motion.span
                    animate={{ rotate: activeNarrative === idx ? 180 : 0 }}
                    className="text-gray-400 flex-shrink-0"
                  >
                    ▼
                  </motion.span>
                </div>
                <AnimatePresence>
                  {activeNarrative === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 border-t border-white/5 pt-4">
                        <motion.p
                          className="text-gray-400 leading-relaxed"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.15 }}
                        >
                          {narrative.summary}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tournament Format ── */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 className="text-2xl md:text-3xl font-bold text-white mb-8" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            📋 Tournament <span className="text-green-400">Format</span>
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Groups", value: "12 groups × 4 teams", icon: "🏟️" },
              { label: "Advance", value: "Top 2 + 8 best 3rd", icon: "⬆️" },
              { label: "Knockout", value: "Round of 32 → Final", icon: "🏆" },
              { label: "Total Matches", value: "104", icon: "📋" },
              { label: "Duration", value: "39 Days", icon: "📅" },
              { label: "Hosts", value: "USA · Canada · Mexico", icon: "🌎" },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                className="bg-white/5 rounded-xl p-5 border border-white/10"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -3 }}
              >
                <span className="text-2xl block mb-2">{item.icon}</span>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{item.label}</p>
                <p className="text-white font-bold mt-1">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="pb-16" />
    </div>
  );
}