"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import teamColors from "@/data/team-colors.json";
import fifaRankings from "@/data/fifa-rankings.json";

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number | null;
  awayScore?: number | null;
  date: string;
  time: string;
  venue: string;
  stage: string;
  group?: string;
  matchId?: string;
}

function getTeamColors(team: string) {
  return (
    (teamColors as any).teams[team] || {
      primary: "#64748B",
      secondary: "#94A3B8",
      accent: "#475569",
    }
  );
}

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

function RankDiff({ higher, lower }: { higher: number; lower: number }) {
  const diff = lower - higher;
  if (diff <= 5) return <span className="text-[10px] text-gray-400">≈</span>;
  if (higher < lower) {
    return <span className="text-[10px] text-green-500 font-bold">▲{diff}</span>;
  }
  return null;
}

function CountdownTimer({ targetDate, targetTime }: { targetDate: string; targetTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const target = new Date(`${targetDate}T${targetTime}`);
    
    const updateTimer = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Kickoff!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);

  return (
    <span className="text-xs font-mono bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full animate-pulse">
      ⏱ {timeLeft}
    </span>
  );
}

function getGoogleSearchUrl(homeTeam: string, awayTeam: string): string {
  const query = encodeURIComponent(`${homeTeam} vs ${awayTeam} World Cup 2026 live score`);
  return `https://www.google.com/search?q=${query}`;
}

export default function MatchCard({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  date,
  time,
  venue,
  stage,
  group,
  matchId,
}: MatchCardProps) {
  const isPlayed =
    homeScore !== undefined && homeScore !== null && awayScore !== undefined && awayScore !== null;

  // A match is "live" if it's past kickoff time but no score has been entered yet
  // and it's within 3 hours of kickoff (typical match duration window)
  const kickoffTime = new Date(`${date}T${time}`);
  const now = new Date();
  const matchEndEstimate = new Date(kickoffTime.getTime() + 3 * 60 * 60 * 1000); // +3 hours
  const isLive = !isPlayed && now >= kickoffTime && now <= matchEndEstimate;
  const isUpcoming = now < kickoffTime;
  const isPastUnscored = !isPlayed && !isUpcoming && !isLive; // match ended but no score entered

  const homeColors = getTeamColors(homeTeam);
  const awayColors = getTeamColors(awayTeam);
  const homeRank = getFifaRank(homeTeam);
  const awayRank = getFifaRank(awayTeam);
  const liveScoreUrl = getGoogleSearchUrl(homeTeam, awayTeam);

  const getStatusBadge = () => {
    if (isLive) {
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </span>
      );
    }
    if (isPlayed) {
      return (
        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-bold px-3 py-1 rounded-full">
          FINISHED
        </span>
      );
    }
    if (isPastUnscored) {
      return (
        <span className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-400 text-xs font-bold px-3 py-1 rounded-full">
          AWAITING
        </span>
      );
    }
    return (
      <span className="bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
        UPCOMING
      </span>
    );
  };

  return (
    <motion.div
      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Team Color Strip - Top */}
      <div className="flex h-1.5">
        <div className="flex-1" style={{ backgroundColor: homeColors.primary }} />
        <div className="w-8 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent" />
        <div className="flex-1" style={{ backgroundColor: awayColors.primary }} />
      </div>

      {/* LIVE pulse bar */}
      {isLive && (
        <motion.div
          className="h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      <div className="p-4 sm:p-5">
        {/* Stage & Status Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {stage}
            </span>
            {group && (
              <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md">
                Group {group}
              </span>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex-1 text-right">
            <div className="flex items-center justify-end gap-3">
              <div>
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {homeTeam}
                  </p>
                  {homeRank && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      #{homeRank}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-3 h-8 sm:h-10 rounded-r-full shadow-md" style={{ backgroundColor: homeColors.primary }} />
            </div>
          </div>

          {/* Score / Status Center */}
          <div className="flex-shrink-0 text-center px-4">
            {isPlayed ? (
              <motion.div
                className="flex items-center gap-2 sm:gap-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <motion.span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                  {homeScore}
                </motion.span>
                <span className="text-lg sm:text-xl font-bold text-gray-400 dark:text-gray-500">-</span>
                <motion.span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                  {awayScore}
                </motion.span>
              </motion.div>
            ) : isLive ? (
              /* LIVE — Game Active */
              <a
                href={liveScoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group/live"
              >
                <motion.span
                  className="text-xl sm:text-2xl font-black text-red-500 dark:text-red-400"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  VS
                </motion.span>
                <motion.span
                  className="text-[10px] sm:text-xs font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full whitespace-nowrap group-hover/live:bg-red-100 dark:group-hover/live:bg-red-900/40 transition-colors"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Game Active · View Live Score →
                </motion.span>
              </a>
            ) : isPastUnscored ? (
              /* Past kickoff but no score yet */
              <a
                href={liveScoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1 group/live"
              >
                <span className="text-xl sm:text-2xl font-black text-gray-300 dark:text-gray-600">VS</span>
                <span className="text-[10px] sm:text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1.5 rounded-full whitespace-nowrap group-hover/live:bg-yellow-100 dark:group-hover/live:bg-yellow-900/40 transition-colors">
                  Check Live Score →
                </span>
              </a>
            ) : isUpcoming ? (
              /* Upcoming */
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl sm:text-2xl font-black text-gray-300 dark:text-gray-600">VS</span>
                {homeRank && awayRank && (
                  <RankDiff higher={Math.min(homeRank, awayRank)} lower={Math.max(homeRank, awayRank)} />
                )}
                <CountdownTimer targetDate={date} targetTime={time} />
              </div>
            ) : (
              /* Fallback */
              <div className="flex flex-col items-center gap-1">
                <span className="text-xl sm:text-2xl font-black text-gray-300 dark:text-gray-600">VS</span>
                {homeRank && awayRank && (
                  <RankDiff higher={Math.min(homeRank, awayRank)} lower={Math.max(homeRank, awayRank)} />
                )}
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-left">
            <div className="flex items-center justify-start gap-3">
              <div className="w-3 h-8 sm:h-10 rounded-l-full shadow-md" style={{ backgroundColor: awayColors.primary }} />
              <div>
                <div className="flex items-center justify-start gap-1.5">
                  {awayRank && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                      #{awayRank}
                    </span>
                  )}
                  <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                    {awayTeam}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1.5 xs:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(`${date}T${time}`).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {time}
            </span>
          </div>
          <span className="flex items-center gap-1 min-w-0">
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{venue}</span>
          </span>
        </div>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute inset-0 rounded-xl ${
          isLive 
            ? "bg-gradient-to-r from-red-500/10 via-red-400/5 to-red-500/10" 
            : "bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"
        }`} />
      </div>
    </motion.div>
  );
}