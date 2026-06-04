"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Countdown from "@/components/Countdown";
import tournamentInfo from "@/data/tournament-info.json";
import predictionsData from "@/data/predictions.json";
import teamColorsData from "@/data/team-colors.json";
import fifaRankings from "@/data/fifa-rankings.json";
import { AnimatedTrophy, BouncingBall, WavingFlag, AnimatedStar, FireIcon, ConfettiEffect } from "@/components/AnimatedIcons";

// Lazy load below-fold sections for better initial load
const FunFacts = dynamic(() => import("@/components/FunFacts"), {
  loading: () => <div className="h-32 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />,
});

// Lazy section wrappers for code-splitting
function LazyTournamentOverview() {
  return (
    <TournamentOverviewContent />
  );
}

// Animated counter component
function AnimatedCounter({ end, label, suffix = "", duration = 2 }: { end: number; label: string; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, end, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-5xl font-black text-white">
        {count}{suffix}
      </div>
      <div className="text-sm md:text-base text-white/70 mt-1">{label}</div>
    </div>
  );
}

// Floating particle
function Particle({ delay, duration, x, size }: { delay: number; duration: number; x: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/20"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
      }}
      initial={{ y: "110vh", opacity: 0 }}
      animate={{
        y: "-10vh",
        opacity: [0, 1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Tournament Overview Content (separated for potential lazy loading)
function TournamentOverviewContent() {
  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
              Tournament Overview
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            The biggest World Cup in history. 48 teams. 3 nations. 1 trophy.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 group hover:shadow-2xl transition-shadow duration-500"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5 }}
          >
            <div className="text-4xl mb-4">
              <AnimatedTrophy size={64} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Historic Tournament
            </h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
              {tournamentInfo.overview?.description || "The 2026 FIFA World Cup will be the 23rd edition of the tournament and will feature 48 teams for the first time in history."}
            </p>
            <ul className="space-y-3">
              {tournamentInfo.highlights?.map((highlight: string, idx: number) => (
                <motion.li
                  key={idx}
                  className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 dark:text-green-400 text-sm">✓</span>
                  </span>
                  {highlight}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 group hover:shadow-2xl transition-shadow duration-500"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -5 }}
          >
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Key Dates
            </h3>
            <div className="space-y-1">
              {tournamentInfo.timeline?.slice(0, 6).map((stage: any, idx: number) => (
                <motion.div
                  key={idx}
                  className="flex justify-between items-center py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  whileHover={{ x: 5, backgroundColor: "rgba(59,130,246,0.05)" }}
                >
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{stage.stage}</span>
                  <span className="text-sm text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full">
                    {stage.dates}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Favorites Preview Content
function FavoritesPreviewContent() {
  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            <span className="bg-gradient-to-r from-red-500 to-amber-500 bg-clip-text text-transparent">
              Tournament Favorites
            </span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Who will lift the trophy? Powered by FIFA Rankings
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {predictionsData.favorites?.slice(0, 6).map((fav: any, idx: number) => {
            const teamColors = (() => {
              const key = Object.keys(teamColorsData.teams).find(
                (k) => k.toLowerCase() === fav.team.toLowerCase()
              );
              return key ? (teamColorsData.teams as any)[key] : null;
            })();
            const fifaRank = (() => {
              const entry = fifaRankings.rankings.find(
                (r) => r.team.toLowerCase() === fav.team.toLowerCase()
              );
              return entry ? entry.rank : null;
            })();
            return (
              <motion.div
                key={fav.team}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center group cursor-pointer overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08, type: "spring", stiffness: 200 }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                {teamColors && (
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: `linear-gradient(90deg, ${teamColors.primary}, ${teamColors.accent})` }} />
                )}
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {fifaRank && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      fifaRank <= 5 ? "bg-amber-100 text-amber-700" :
                      fifaRank <= 10 ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      FIFA #{fifaRank}
                    </span>
                  )}
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    fav.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                    fav.rank === 2 ? "bg-gray-100 text-gray-600" :
                    fav.rank === 3 ? "bg-orange-100 text-orange-700" :
                    "bg-blue-50 text-blue-600"
                  }`}>
                    #{fav.rank}
                  </span>
                </div>
                <div className="text-4xl mb-3 mt-2">
                  {fav.rank === 1 && <AnimatedTrophy size={40} />}
                  {fav.rank === 2 && "🥈"}
                  {fav.rank === 3 && "🥉"}
                  {fav.rank > 3 && <BouncingBall size={32} />}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {fav.team}
                </h3>
                {fav.keyPlayer && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {fav.keyPlayer}
                  </p>
                )}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-t from-red-500/5 to-transparent" />
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link href="/predictions">
            <motion.span
              className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 font-bold text-lg cursor-pointer"
              whileHover={{ x: 5 }}
            >
              View Full Predictions <span>→</span>
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);
  const [showConfetti, setShowConfetti] = useState(false);

  const [particles, setParticles] = useState<Array<{
    id: number;
    delay: number;
    duration: number;
    x: number;
    size: number;
  }>>([]);
  
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        delay: Math.random() * 15,
        duration: 8 + Math.random() * 12,
        x: Math.random() * 100,
        size: 2 + Math.random() * 4,
      }))
    );

    setTimeout(() => setShowConfetti(true), 1000);
    setTimeout(() => setShowConfetti(false), 4000);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <ConfettiEffect trigger={showConfetti} />

      {/* Hero Section — ABOVE THE FOLD */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-blue-900 to-indigo-950">
          <motion.div
            className="absolute inset-0 opacity-40"
            animate={{
              background: [
                "radial-gradient(circle at 20% 30%, #DC2626 0%, transparent 50%)",
                "radial-gradient(circle at 80% 70%, #3B82F6 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, #EF4444 0%, transparent 50%)",
                "radial-gradient(circle at 20% 30%, #DC2626 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}

        <motion.div
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
          style={{ opacity: heroOpacity, scale: heroScale }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <AnimatedTrophy size={40} />
            <span className="text-white/90 font-medium text-sm">June 11 - July 19, 2026</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 100 }}
          >
            <span className="bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent">
              FIFA World Cup
            </span>
            <br />
            <div className="flex items-center justify-center gap-4">
              <motion.span
                className="bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8, type: "spring", stiffness: 200 }}
              >
                2026
              </motion.span>
              <BouncingBall size={50} />
            </div>
          </motion.h1>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-3 md:gap-5 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {[
              { name: "United States", code: "US", flag: "🇺🇸", color: "from-red-500 to-blue-500" },
              { name: "Canada", code: "CA", flag: "🇨🇦", color: "from-red-400 to-red-500" },
              { name: "Mexico", code: "MX", flag: "🇲🇽", color: "from-green-500 to-red-500" },
            ].map((country, i) => (
              <motion.span
                key={country.name}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-white font-semibold"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.15, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <WavingFlag countryCode={country.code as "US" | "CA" | "MX"} size={24} />
                <span className="text-sm md:text-base">{country.name}</span>
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
          >
            <p className="text-white/60 text-sm uppercase tracking-widest mb-4">
              Tournament Starts In
            </p>
            <Countdown targetDate="2026-06-11" />
          </motion.div>

          <motion.div
            className="mt-10 flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            <Link href="/schedule">
              <motion.span
                className="inline-flex items-center gap-2 bg-white text-red-600 px-7 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-red-500/30 cursor-pointer"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(220,38,38,0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <FireIcon size={20} /> View Schedule
              </motion.span>
            </Link>
            <Link href="/teams">
              <motion.span
                className="inline-flex items-center gap-2 bg-transparent border-2 border-white/30 backdrop-blur-sm text-white px-7 py-4 rounded-xl font-bold text-lg hover:border-white/60 cursor-pointer"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                whileTap={{ scale: 0.95 }}
              >
                <BouncingBall size={20} /> Teams
              </motion.span>
            </Link>
            <Link href="/predictions">
              <motion.span
                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-amber-500 text-white px-7 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-red-500/30 cursor-pointer"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(245,158,11,0.4)" }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatedStar size={20} /> Predictions
              </motion.span>
            </Link>
          </motion.div>

          <motion.div
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <motion.div
              className="w-6 h-10 border-2 border-white/30 rounded-full mx-auto flex items-start justify-center p-1.5"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <motion.div className="w-1.5 h-3 bg-white/60 rounded-full" />
            </motion.div>
            <p className="text-white/40 text-xs mt-2">Scroll to explore</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 -mt-1">
        <div className="bg-gradient-to-r from-red-600 via-blue-600 to-red-700 py-8 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            <AnimatedCounter end={48} label="Teams" />
            <AnimatedCounter end={104} label="Matches" />
            <AnimatedCounter end={16} label="Stadiums" suffix=" 🏟️" />
            <AnimatedCounter end={3} label="Host Nations" suffix=" 🌎" />
          </div>
        </div>
      </section>

      {/* Tournament Overview — Renders immediately but uses whileInView: once */}
      <TournamentOverviewContent />

      {/* Fun Facts — Lazy loaded */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <FunFacts />
        </div>
      </section>

      {/* Favorites Preview */}
      <FavoritesPreviewContent />

      {/* Host Cities */}
      <section className="py-20 px-4 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              <span className="bg-gradient-to-r from-red-500 via-white to-blue-500 bg-clip-text text-transparent">
                Host Cities
              </span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              16 stadiums across 3 nations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                country: "Canada",
                flag: "🇨🇦",
                color: "from-red-500 to-red-600",
                cities: "Toronto • Vancouver",
                venues: "BMO Field • BC Place",
                count: "2 Cities",
              },
              {
                country: "Mexico",
                flag: "🇲🇽",
                color: "from-green-600 to-green-700",
                cities: "Mexico City • Guadalajara • Monterrey",
                venues: "Estadio Azteca • Estadio Akron • Estadio BBVA",
                count: "3 Cities",
              },
              {
                country: "United States",
                flag: "🇺🇸",
                color: "from-blue-600 to-blue-700",
                cities: "NY/NJ • Dallas • LA • Atlanta • Miami • Seattle • Kansas City • Houston • SF • Boston • Philadelphia",
                venues: "11 world-class stadiums",
                count: "11 Cities",
              },
            ].map((host, idx) => (
              <motion.div
                key={host.country}
                className={`relative bg-gradient-to-br ${host.color} rounded-2xl shadow-xl p-8 text-white text-center overflow-hidden group`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.5 }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <div className="text-5xl mb-4">
                  {host.country === "United States" && <WavingFlag countryCode="US" size={48} />}
                  {host.country === "Canada" && <WavingFlag countryCode="CA" size={48} />}
                  {host.country === "Mexico" && <WavingFlag countryCode="MX" size={48} />}
                </div>
                <h3 className="text-2xl font-bold mb-2">{host.country}</h3>
                <p className="text-white/80 font-semibold mb-2">{host.count}</p>
                <p className="text-white/70 text-sm">{host.cities}</p>
                <p className="text-white/50 text-xs mt-2">{host.venues}</p>
                
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/venues">
              <motion.span
                className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 font-bold text-lg cursor-pointer"
                whileHover={{ x: 5 }}
              >
                View All 16 Stadiums <span>→</span>
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}