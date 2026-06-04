"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Lightbulb, Share2, Sparkles, Clock, ChevronRight, RefreshCw } from "lucide-react";

interface Fact {
  id: number;
  category: string;
  fact: string;
  icon: string;
}

interface Stat {
  label: string;
  value: string;
  icon: string;
}

interface TimelineEvent {
  year: string;
  event: string;
  icon: string;
}

interface FactsData {
  facts: Fact[];
  stats: Stat[];
  timeline: TimelineEvent[];
}

export default function FactsPage() {
  const [data, setData] = useState<FactsData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [randomFact, setRandomFact] = useState<Fact | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/facts.json")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const categories = data
    ? ["all", ...Array.from(new Set(data.facts.map((f) => f.category)))]
    : [];

  const filteredFacts = data
    ? selectedCategory === "all"
      ? data.facts
      : data.facts.filter((f) => f.category === selectedCategory)
    : [];

  const generateRandomFact = () => {
    if (!data) return;
    const random = data.facts[Math.floor(Math.random() * data.facts.length)];
    setRandomFact(random);
  };

  const shareFact = async (fact: string) => {
    if (navigator.share) {
      await navigator.share({ title: "World Cup Fun Fact", text: fact });
    } else {
      await navigator.clipboard.writeText(fact);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center text-white">
        <p>Failed to load facts. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* ── Hero ── */}
      <section className="relative pt-20 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 0%, #F59E0B 0%, transparent 60%)" }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Lightbulb className="w-16 h-16 text-amber-400 mx-auto" />
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-black mt-6 mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Did You Know?
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Fascinating stories, records, and trivia from the beautiful game&apos;s greatest stage
          </motion.p>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {data.stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, borderColor: "rgba(245,158,11,0.4)" }}
              >
                <span className="text-2xl block mb-1">{stat.icon}</span>
                <motion.div
                  className="text-2xl font-black text-white"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.1, type: "spring" }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Random Fact Generator ── */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-md border border-amber-500/20 rounded-2xl p-8 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-4">Random Fact Generator</h3>

            <AnimatePresence mode="wait">
              {randomFact ? (
                <motion.div
                  key={randomFact.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6"
                >
                  <span className="text-4xl block mb-3">{randomFact.icon}</span>
                  <p className="text-lg text-gray-200 leading-relaxed italic">
                    &ldquo;{randomFact.fact}&rdquo;
                  </p>
                  <span className="inline-block mt-3 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                    {randomFact.category}
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6"
                >
                  <p className="text-gray-500 italic">Click the button below to discover a fun fact!</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-center gap-3">
              <motion.button
                onClick={generateRandomFact}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl flex items-center gap-2"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <RefreshCw className="w-4 h-4" />
                Generate Fact
              </motion.button>
              {randomFact && (
                <motion.button
                  onClick={() => shareFact(randomFact.fact)}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-2"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Share2 className="w-4 h-4" />
                  {copied ? "Copied!" : "Share"}
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Category Filter ── */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Facts Grid ── */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredFacts.map((fact, idx) => (
                <motion.div
                  key={fact.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-amber-500/30 transition-all duration-300 cursor-default"
                  whileHover={{ y: -4 }}
                >
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); shareFact(fact.fact); }}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>

                  <div className="flex items-start gap-4">
                    <motion.span
                      className="text-4xl flex-shrink-0"
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {fact.icon}
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <span className="inline-block text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-2 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        {fact.category}
                      </span>
                      <p className="text-gray-300 leading-relaxed text-sm">
                        {fact.fact}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="text-center mt-10 text-sm text-gray-600">
            Showing {filteredFacts.length} of {data.facts.length} facts
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-16 px-4 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-white text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Clock className="w-8 h-8 text-amber-400 inline-block mr-2 mb-1" />
            World Cup <span className="text-amber-400">Timeline</span>
          </motion.h2>

          <div className="space-y-0">
            {data.timeline.map((event, i) => (
              <TimelineItem key={event.year} event={event} index={i} isLast={i === data.timeline.length - 1} />
            ))}
          </div>
        </div>
      </section>

      <div className="pb-16" />
    </div>
  );
}

function TimelineItem({ event, index, isLast }: { event: TimelineEvent; index: number; isLast: boolean }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <div ref={ref} className="flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <motion.div
          className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center flex-shrink-0"
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: 0.2, type: "spring" }}
        >
          <span className="text-sm">{event.icon}</span>
        </motion.div>
        {!isLast && (
          <motion.div
            className="w-0.5 flex-1 bg-gradient-to-b from-amber-500/50 to-transparent"
            initial={{ height: 0 }}
            animate={isInView ? { height: "100%" } : {}}
            transition={{ delay: 0.5, duration: 0.8 }}
            style={{ minHeight: "40px" }}
          />
        )}
      </div>

      {/* Content */}
      <motion.div
        className={`pb-10 ${isLast ? "pb-0" : ""}`}
        initial={{ opacity: 0, x: -20 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.3 + index * 0.1 }}
      >
        <span className="text-2xl font-black text-amber-400">{event.year}</span>
        <p className="text-gray-400 mt-1 text-sm leading-relaxed">{event.event}</p>
      </motion.div>
    </div>
  );
}