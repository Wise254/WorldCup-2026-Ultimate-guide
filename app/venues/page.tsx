"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import venuesData from "@/data/venues.json";
import scheduleData from "@/data/schedule.json";
import { MapPin, Users, Trophy, Star, X, ChevronRight, Globe, Calendar } from "lucide-react";

// Count matches per venue
const matchCounts: Record<string, number> = {};
scheduleData.matches.forEach((m) => {
  matchCounts[m.venueId] = (matchCounts[m.venueId] || 0) + 1;
});

function getVenueId(stadium: string): string {
  const map: Record<string, string> = {
    "Toronto Stadium": "bmo-field",
    "Vancouver Stadium": "bc-place",
    "Estadio Azteca": "estadio-azteca",
    "Estadio Akron": "estadio-akron",
    "Estadio Monterrey": "estadio-bbva",
    "New York New Jersey Stadium": "metlife-stadium",
    "Dallas Stadium": "at&t-stadium",
    "Los Angeles Stadium": "sofi-stadium",
    "Atlanta Stadium": "mercedes-benz-stadium",
    "Miami Stadium": "hard-rock-stadium",
    "Seattle Stadium": "lumen-field",
    "Kansas City Stadium": "arrowhead-stadium",
    "Houston Stadium": "nrg-stadium",
    "San Francisco Bay Area Stadium": "levi's-stadium",
    "Boston Stadium": "gillette-stadium",
    "Philadelphia Stadium": "lincoln-financial-field",
  };
  return map[stadium] || "";
}

const venueHighlights: Record<string, { landmark: string; funFact: string; altitude?: string; opened: string }> = {
  "bmo-field": { landmark: "CN Tower", funFact: "Lakeside stadium in exhibition grounds", opened: "2007" },
  "bc-place": { landmark: "Harbour & Mountains", funFact: "Largest cable-supported retractable roof", opened: "1983" },
  "estadio-azteca": { landmark: "Ancient Pyramids", funFact: "Only stadium to host 3 World Cup openers", altitude: "2,200m", opened: "1966" },
  "estadio-akron": { landmark: "Tequila Fields", funFact: "Shaped like a volcano crater", altitude: "1,566m", opened: "2010" },
  "estadio-bbva": { landmark: "Cerro de la Silla", funFact: "Mountain-backdrop stadium", altitude: "537m", opened: "2015" },
  "metlife-stadium": { landmark: "NYC Skyline", funFact: "Host of the 2026 World Cup Final", opened: "2010" },
  "at&t-stadium": { landmark: "Texas Star", funFact: "World's largest HD video board", opened: "2009" },
  "sofi-stadium": { landmark: "Hollywood Sign", funFact: "Most expensive stadium ever built", opened: "2020" },
  "mercedes-benz-stadium": { landmark: "Peach Blossoms", funFact: "Retractable roof like a camera aperture", opened: "2017" },
  "hard-rock-stadium": { landmark: "Palm & Waves", funFact: "Hosts F1 and tennis alongside football", opened: "1987" },
  "lumen-field": { landmark: "Space Needle", funFact: "Loudest stadium in the NFL", opened: "2002" },
  "arrowhead-stadium": { landmark: "Fountains & BBQ", funFact: "Holds the world record for stadium noise", opened: "1972" },
  "nrg-stadium": { landmark: "Rockets & Oil", funFact: "First NFL stadium with retractable roof", opened: "2002" },
  "levi's-stadium": { landmark: "Golden Gate", funFact: "Silicon Valley's tech-infused stadium", opened: "2014" },
  "gillette-stadium": { landmark: "Lighthouse", funFact: "Features a lighthouse in the end zone", opened: "2002" },
  "lincoln-financial-field": { landmark: "Liberty Bell", funFact: "Home of the Philly Special", opened: "2003" },
};

const countryFlags: Record<string, string> = {
  Canada: "🇨🇦",
  Mexico: "🇲🇽",
  "United States": "🇺🇸",
  USA: "🇺🇸",
};

function CityIllustration({ venueId }: { venueId: string }) {
  switch (venueId) {
    case "estadio-azteca":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-amber-500/10 to-amber-900/20 mb-4">
          <motion.div className="absolute bottom-4 left-1/2 -translate-x-1/2" animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <div className="w-0 h-0 border-l-[35px] border-r-[35px] border-b-[55px] border-l-transparent border-r-transparent border-b-amber-400/60 relative">
              <div className="absolute -top-2 -left-2 w-0 h-0 border-l-[25px] border-r-[25px] border-b-[38px] border-l-transparent border-r-transparent border-b-amber-500/40" />
              <div className="absolute -top-3 left-0 w-0 h-0 border-l-[18px] border-r-[18px] border-b-[28px] border-l-transparent border-r-transparent border-b-amber-300/35" />
            </div>
          </motion.div>
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute w-1 h-1 bg-yellow-300 rounded-full" style={{ top: `${10 + (i * 5)}%`, left: `${10 + (i * 12)}%` }} animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }} transition={{ duration: 2 + (i * 0.3), repeat: Infinity, delay: i * 0.3 }} />
          ))}
        </div>
      );
    case "bmo-field":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-sky-400/20 to-blue-900/30 mb-4">
          <motion.div className="absolute bottom-2 left-1/2 -translate-x-1/2" animate={{ y: [0, -2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-6 h-24 bg-gray-300/60 mx-auto rounded-t-lg" />
            <div className="absolute -top-10 -left-3 w-12 h-11 bg-gray-200/60 rounded-t-full" />
            <motion.div className="absolute -top-12 left-0 w-12 h-1.5 bg-red-500 rounded-full" animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1, repeat: Infinity }} />
          </motion.div>
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute w-1.5 h-1.5 bg-white/60 rounded-full" style={{ left: `${8 + i * 11}%` }} animate={{ y: [0, 130], x: [0, (i % 2 === 0 ? 8 : -8)], opacity: [1, 0] }} transition={{ duration: 3 + (i * 0.3), repeat: Infinity, delay: i * 0.4 }} />
          ))}
        </div>
      );
    case "bc-place":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-sky-300/20 to-teal-800/30 mb-4">
          <motion.div className="absolute bottom-4 left-3" animate={{ y: [0, -2, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <div className="w-0 h-0 border-l-[30px] border-r-[30px] border-b-[50px] border-l-transparent border-r-transparent border-b-slate-500/40" />
            <div className="absolute top-3 left-1.5 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[25px] border-l-transparent border-r-transparent border-b-white/30" />
          </motion.div>
          <motion.div className="absolute bottom-3 left-20" animate={{ y: [0, -1.5, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}>
            <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[65px] border-l-transparent border-r-transparent border-b-slate-600/35" />
            <div className="absolute top-4 left-2 w-0 h-0 border-l-[18px] border-r-[18px] border-b-[30px] border-l-transparent border-r-transparent border-b-white/25" />
          </motion.div>
          <motion.div className="absolute bottom-2 right-10" animate={{ x: [0, 12, 0] }} transition={{ duration: 5, repeat: Infinity }}>
            <div className="w-6 h-1.5 bg-white/40 rounded" />
            <div className="absolute -top-3 left-1.5 w-0 h-0 border-l-[3px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-white/50" />
          </motion.div>
        </div>
      );
    case "estadio-akron":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-green-500/10 to-green-900/20 mb-4">
          {[...Array(4)].map((_, i) => (
            <motion.div key={i} className="absolute bottom-2" style={{ left: `${12 + i * 25}%` }} animate={{ rotate: [0, 2, -1, 0] }} transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}>
              <div className="w-2 h-12 bg-green-500/40 rounded-full origin-bottom rotate-[-15deg]" />
              <div className="absolute top-1.5 left-1.5 w-2 h-10 bg-green-400/30 rounded-full origin-bottom rotate-[15deg]" />
              <div className="absolute top-3 left-3 w-1.5 h-8 bg-green-600/35 rounded-full origin-bottom rotate-[0deg]" />
            </motion.div>
          ))}
        </div>
      );
    case "estadio-bbva":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-yellow-500/10 to-orange-900/20 mb-4">
          <motion.div className="absolute bottom-2 left-1/2 -translate-x-1/2" animate={{ y: [0, -1, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <div className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[45px] border-l-transparent border-r-transparent border-b-stone-500/35" />
            <div className="absolute left-2 top-1 w-0 h-0 border-l-[22px] border-r-[22px] border-b-[26px] border-l-transparent border-r-transparent border-b-stone-400/30" />
          </motion.div>
          <motion.div className="absolute top-6 right-8 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500" animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 15px rgba(251,191,36,0.3)", "0 0 30px rgba(251,191,36,0.5)", "0 0 15px rgba(251,191,36,0.3)"] }} transition={{ duration: 3, repeat: Infinity }} />
        </div>
      );
    case "metlife-stadium":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-indigo-400/10 to-slate-900/30 mb-4">
          {[25, 40, 60, 50, 35, 55, 45, 32, 65, 48].map((h, i) => (
            <motion.div key={i} className="absolute bottom-2 bg-slate-500/40 rounded-t-sm" style={{ left: `${i * 10 + 2}%`, width: "7%", height: h }} animate={{ y: [0, -2, 0] }} transition={{ duration: 3 + (i * 0.2), repeat: Infinity, delay: i * 0.2 }}>
              <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-300/50 rounded" />
            </motion.div>
          ))}
          <motion.div className="absolute bottom-2 left-[6%] w-[8%] h-18 bg-slate-400/50 rounded-t" animate={{ y: [0, -1.5, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <motion.div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3 h-4 bg-red-400/35 rounded-t" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} />
          </motion.div>
        </div>
      );
    case "sofi-stadium":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-pink-400/10 to-purple-900/20 mb-4">
          <motion.div className="absolute top-4 left-1/2 -translate-x-1/2" animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 3, repeat: Infinity }}>
            <div className="flex gap-0.5">
              {["H","O","L","L","Y","W","O","O","D"].map((l, i) => (
                <div key={i} className="w-4 h-6 bg-white/60 text-[8px] font-bold text-gray-800 flex items-center justify-center rounded-sm">{l}</div>
              ))}
            </div>
          </motion.div>
          {[18, 42, 72].map((pos, i) => (
            <motion.div key={i} className="absolute bottom-2" style={{ left: `${pos}%` }} animate={{ rotate: [0, 2, -1, 0] }} transition={{ duration: 3 + i, repeat: Infinity }}>
              <div className="w-1.5 h-16 bg-amber-700/50 rounded-full mx-auto" />
              <div className="relative -top-1.5">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                  <div key={angle} className="absolute w-6 h-0.5 bg-green-500/40 rounded-full origin-left" style={{ rotate: `${angle}deg`, left: "0.5px", top: "-1px" }} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      );
    case "at&t-stadium":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-blue-400/10 to-navy-900/20 mb-4">
          <motion.div className="absolute top-6 left-1/2 -translate-x-1/2" animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
            <svg width="45" height="45" viewBox="0 0 60 60">
              <polygon points="30,5 36,22 54,22 39,32 45,49 30,38 15,49 21,32 6,22 24,22" fill="rgba(255,255,255,0.5)" stroke="rgba(255,215,0,0.6)" strokeWidth="1" />
            </svg>
          </motion.div>
          {[12, 52].map((pos, i) => (
            <motion.div key={i} className="absolute bottom-2" style={{ left: `${pos}%` }} animate={{ y: [0, -3, 0, -1.5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}>
              <div className="w-2 h-18 bg-gray-400/45 mx-auto" />
              <div className="absolute -top-1.5 -left-0.5 w-4 h-3 bg-gray-500/35 rounded" />
              <div className="absolute -top-3 left-0.5 w-0.5 h-4 bg-gray-300/30" />
            </motion.div>
          ))}
        </div>
      );
    case "mercedes-benz-stadium":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-pink-300/10 to-rose-900/20 mb-4">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute" style={{ top: `${15 + i * 7}%`, left: `${8 + i * 10}%` }} animate={{ y: [0, -6, 0], rotate: [0, 12, 0] }} transition={{ duration: 3 + (i * 0.4), repeat: Infinity, delay: i * 0.4 }}>
              <div className="relative w-4 h-4">
                {[0, 72, 144, 216, 288].map((r) => (
                  <div key={r} className="absolute w-2.5 h-1.5 bg-pink-300/60 rounded-full origin-bottom" style={{ rotate: `${r}deg`, left: "0.5px", top: "0.5px" }} />
                ))}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-300/50 rounded-full" />
              </div>
            </motion.div>
          ))}
          <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-22 h-22 rounded-full border-3 border-white/15" animate={{ rotate: 360, scale: [1, 1.08, 0.95, 1] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} />
        </div>
      );
    case "lumen-field":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-emerald-400/10 to-gray-900/20 mb-4">
          <motion.div className="absolute bottom-2 left-1/5" animate={{ y: [0, -2, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <div className="w-3 h-22 bg-gray-300/55 mx-auto" />
            <div className="absolute top-0 -left-2.5 w-8 h-6 bg-gray-200/45 rounded-t-full" />
            <div className="absolute -top-3 left-0 w-3 h-3 bg-red-300/40 rounded-full" />
            <div className="absolute top-10 -left-6 w-16 h-2 bg-white/30 rounded-full" />
          </motion.div>
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute w-0.5 h-3 bg-blue-300/30 rounded-full" style={{ left: `${10 + i * 14}%` }} animate={{ y: [0, 120], opacity: [1, 0] }} transition={{ duration: 1 + (i * 0.2), repeat: Infinity, delay: i * 0.3 }} />
          ))}
        </div>
      );
    case "arrowhead-stadium":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-red-500/10 to-amber-900/20 mb-4">
          {[12, 48, 78].map((pos, i) => (
            <motion.div key={i} className="absolute bottom-2" style={{ left: `${pos}%` }} animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
              <div className="w-3 h-16 bg-blue-400/30 rounded-t-full mx-auto" />
              <motion.div className="absolute -top-2 left-0 w-3 h-2 bg-white/50 rounded-full" animate={{ y: [-4, -12], opacity: [0.7, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
            </motion.div>
          ))}
          <motion.div className="absolute top-6 left-1/2 -translate-x-1/2 w-8 h-10" animate={{ scaleY: [1, 1.15, 0.9, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            <div className="w-full h-full bg-gradient-to-t from-red-500 via-orange-500 to-yellow-400 rounded-b-full rounded-t-[50%] opacity-50" />
          </motion.div>
        </div>
      );
    case "hard-rock-stadium":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-cyan-400/10 to-teal-900/20 mb-4">
          {[12, 38, 62, 82].map((pos, i) => (
            <motion.div key={i} className="absolute bottom-2" style={{ left: `${pos}%` }} animate={{ rotate: [0, 3, -2, 0] }} transition={{ duration: 2 + i * 0.5, repeat: Infinity }}>
              <div className="w-1.5 h-18 bg-amber-600/45 mx-auto rounded-full" />
              <div className="relative -top-0.5">
                {[0, 60, 120, 180, 240, 300].map((angle) => (
                  <div key={angle} className="absolute w-8 h-1 bg-green-500/40 rounded-full origin-left" style={{ rotate: `${angle}deg`, left: "0.5px" }} />
                ))}
              </div>
            </motion.div>
          ))}
          {[0, 1, 2].map((i) => (
            <motion.div key={i} className="absolute bottom-1 h-1.5 bg-cyan-400/25 rounded-full" style={{ left: `${i * 35}%`, width: "28%" }} animate={{ x: [-8, 8, -8] }} transition={{ duration: 3 + i, repeat: Infinity }} />
          ))}
        </div>
      );
    case "nrg-stadium":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-orange-400/10 to-gray-900/20 mb-4">
          <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2" animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <div className="w-6 h-16 bg-white/55 rounded-t-full mx-auto relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4.5 h-8 bg-red-400/45 rounded-t-full" />
              <div className="absolute -bottom-1.5 -left-1.5 w-9 h-3 bg-gray-400/35 rounded-sm" />
            </div>
            <motion.div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-4.5 h-6 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-b-full" animate={{ scaleY: [0.5, 1.4, 0.5], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 0.5, repeat: Infinity }} />
          </motion.div>
        </div>
      );
    case "levi's-stadium":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-orange-300/10 to-red-900/20 mb-4">
          <motion.div className="absolute top-6 left-0 w-full" animate={{ y: [0, -1, 0] }} transition={{ duration: 3, repeat: Infinity }}>
            <svg viewBox="0 0 400 50" className="w-full h-10">
              <path d="M0,35 Q50,8 100,35 Q150,8 200,35 Q250,8 300,35 Q350,8 400,35" stroke="rgba(200,50,20,0.5)" strokeWidth="3" fill="none" />
              <line x1="65" y1="8" x2="65" y2="40" stroke="rgba(180,40,15,0.35)" strokeWidth="2.5" />
              <line x1="200" y1="8" x2="200" y2="40" stroke="rgba(180,40,15,0.35)" strokeWidth="2.5" />
              <line x1="335" y1="8" x2="335" y2="40" stroke="rgba(180,40,15,0.35)" strokeWidth="2.5" />
            </svg>
          </motion.div>
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="absolute w-1.5 h-3 bg-cyan-400/30 rounded-sm" style={{ top: `${55 + i * 3}%`, left: `${8 + i * 10}%` }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 2 + (i * 0.3), repeat: Infinity, delay: i * 0.4 }} />
          ))}
        </div>
      );
    case "gillette-stadium":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-blue-500/10 to-indigo-900/20 mb-4">
          <motion.div className="absolute bottom-2 right-1/4" animate={{ y: [0, -1, 0] }} transition={{ duration: 2, repeat: Infinity }}>
            <div className="w-6 h-22 bg-white/55 mx-auto rounded-t-lg" />
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-5 h-3 bg-red-400/35 rounded-t" />
            <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-300/50 rounded-full" animate={{ opacity: [0.4, 1, 0.4], boxShadow: ["0 0 8px rgba(255,200,0,0.3)", "0 0 16px rgba(255,200,0,0.6)", "0 0 8px rgba(255,200,0,0.3)"] }} transition={{ duration: 1.5, repeat: Infinity }} />
          </motion.div>
        </div>
      );
    case "lincoln-financial-field":
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-green-500/10 to-gray-900/20 mb-4">
          <motion.div className="absolute top-6 left-1/2 -translate-x-1/2" animate={{ rotate: [0, 3, -3, 0] }} transition={{ duration: 4, repeat: Infinity }}>
            <div className="w-12 h-16 bg-amber-400/35 rounded-t-full relative">
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-500/35 rounded-full" />
              <div className="absolute top-1.5 left-1/2 -translate-x-[2px] w-1 h-4.5 bg-amber-600/30" />
              <div className="absolute top-3 left-[60%] w-0.5 h-8 bg-gray-600/45 rotate-[10deg]" />
            </div>
          </motion.div>
          <motion.div className="absolute top-4 right-6 text-xl" animate={{ y: [0, -3, 0] }} transition={{ duration: 3, repeat: Infinity }}>🦅</motion.div>
        </div>
      );
    default:
      return (
        <div className="relative h-36 overflow-hidden rounded-lg bg-gradient-to-b from-slate-400/10 to-slate-800/20 mb-4 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white/15" />
        </div>
      );
  }
}

function CapacityBar({ capacity, max }: { capacity: number; max: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const pct = (capacity / max) * 100;

  return (
    <div ref={ref} className="mt-1">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-0.5">
        <span>Capacity</span>
        <span>{capacity.toLocaleString()}</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${pct}%` } : { width: 0 }}
          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function VenueCard({ venue, country, index }: { venue: any; country: string; index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => { setMounted(true); }, []);

  const venueId = getVenueId(venue.stadium);
  const highlight = venueHighlights[venueId];
  const matchesHosted = matchCounts[venueId] || 0;
  const maxCapacity = 87500;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, rotateX: 5 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative rounded-xl overflow-hidden bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-shadow duration-500 cursor-pointer"
        style={{ transformStyle: "preserve-3d", transition: "transform 0.6s", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* FRONT — Stadium Image */}
        <div className={isFlipped ? "invisible" : ""} style={{ backfaceVisibility: "hidden" }}>
          <div className="relative h-48 overflow-hidden bg-gray-200 dark:bg-gray-700">
            {venue.image && !imgError ? (
              <Image
                src={`/images/${venue.image}`}
                alt={venue.stadium}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                onError={() => setImgError(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 dark:from-gray-600 dark:to-gray-800 flex items-center justify-center">
                <Trophy className="w-16 h-16 text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute top-3 right-3 flex gap-1.5">
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-sm text-white">
                {country === "United States" || country === "USA" ? "USA" : country}
              </span>
              {matchesHosted > 0 && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-400/80 text-gray-900">
                  {matchesHosted} matches
                </span>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-lg font-bold text-white leading-tight drop-shadow-lg">{venue.stadium}</h3>
              <p className="flex items-center gap-1 text-sm text-white/80 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {venue.city}
              </p>
            </div>
          </div>
          <div className="p-4">
            <CapacityBar capacity={venue.capacity} max={maxCapacity} />
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400 dark:text-gray-500">
              <Users className="w-3 h-3" />
              <span>{((venue.capacity / maxCapacity) * 100).toFixed(0)}% of max capacity</span>
            </div>
            {highlight && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Star className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                <span>{highlight.funFact}</span>
              </div>
            )}
          </div>
          <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
              Flip for city <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* BACK — City Animation + Details */}
        <div
          className={`absolute inset-0 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 p-5 flex flex-col ${!isFlipped ? "invisible" : ""}`}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <button
            className="absolute top-3 right-3 z-10 p-1 rounded-full bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-700 transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          {mounted && <CityIllustration venueId={venueId} />}

          <div className="text-center mb-3">
            <div className="text-3xl mb-1">{countryFlags[country] || "🏟️"}</div>
            <h4 className="text-base font-bold text-gray-900 dark:text-white">{venue.stadium}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">{venue.city}, {country === "United States" || country === "USA" ? "USA" : country}</p>
          </div>

          <div className="space-y-2 text-xs">
            {highlight?.opened && (
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Opened</span>
                <span className="font-semibold text-gray-900 dark:text-white">{highlight.opened}</span>
              </div>
            )}
            {highlight?.altitude && (
              <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">Altitude</span>
                <span className="font-semibold text-gray-900 dark:text-white">{highlight.altitude}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Capacity</span>
              <span className="font-semibold text-gray-900 dark:text-white">{venue.capacity.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-gray-100 dark:border-gray-700">
              <span className="text-gray-500 dark:text-gray-400">Matches</span>
              <span className="font-semibold text-gray-900 dark:text-white">{matchesHosted}</span>
            </div>
            {highlight?.landmark && (
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500 dark:text-gray-400">Landmark</span>
                <span className="font-semibold text-gray-900 dark:text-white text-right">{highlight.landmark}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatsBanner() {
  const totalCapacity = venuesData.allVenues.reduce((sum, v) => sum + v.capacity, 0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
    >
      {[
        { icon: Trophy, label: "Stadiums", value: "16", color: "from-amber-400 to-orange-500" },
        { icon: Globe, label: "Host Nations", value: "3", color: "from-blue-400 to-indigo-500" },
        { icon: Users, label: "Total Capacity", value: (totalCapacity / 1000000).toFixed(1) + "M", color: "from-green-400 to-emerald-500" },
        { icon: Calendar, label: "Group Matches", value: "72", color: "from-purple-400 to-pink-500" },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="bg-white dark:bg-gray-800/80 rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center hover:shadow-lg transition-shadow"
        >
          <div className={`inline-flex p-3 rounded-full bg-gradient-to-br ${stat.color} mb-3`}>
            <stat.icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{stat.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function VenuesPage() {
  const [activeTab, setActiveTab] = useState<"countries" | "grid">("countries");
  const allVenues = venuesData.allVenues;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-5xl font-bold text-white mb-4">
            World Cup Venues
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }} className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            16 iconic stadiums across 3 nations, ready to host the greatest show on earth
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="flex items-center justify-center gap-3 mt-6">
            {["🇨🇦 Canada", "🇲🇽 Mexico", "🇺🇸 USA"].map((c) => (
              <span key={c} className="px-4 py-1.5 bg-white/15 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/20">{c}</span>
            ))}
          </motion.div>
        </div>
        <div className="absolute -bottom-1 w-full">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" className="fill-gray-50 dark:fill-gray-900" />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <StatsBanner />

        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-gray-200 dark:bg-gray-800 rounded-full p-1">
            {[{ id: "countries", label: "By Country" }, { id: "grid", label: "All Stadiums" }].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "countries" | "grid")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-md"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "countries" && (
          <div className="space-y-14">
            {venuesData.countries.map((country) => (
              <motion.div key={country.name} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{countryFlags[country.name] || "🏟️"}</span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {country.name}
                  </h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">({country.venues.length} stadiums)</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent ml-4" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {country.venues.map((venue: any, i: number) => (
                    <VenueCard key={venue.stadium} venue={venue} country={country.name} index={i} />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {allVenues.map((venue: any, i: number) => (
              <VenueCard key={venue.stadium} venue={venue} country={venue.country} index={i} />
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mt-12">
        <div className="max-w-4xl mx-auto text-center py-12 px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Trophy className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">The Road to Glory Ends Here</h2>
            <p className="text-white/70 max-w-xl mx-auto">
              MetLife Stadium will host the 2026 FIFA World Cup Final on July 19, 2026.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}