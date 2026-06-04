"use client";

import { motion } from "framer-motion";

interface Player {
  position: string;
  player?: string;
  name?: string;
}

interface PitchProps {
  formation: string;
  lineup: Player[];
  teamName: string;
}

function getPositionCoordinates(
  position: string,
  formation: string,
  index: number,
  samePositionCount: number
): { x: number; y: number } {
  const [def, mid, att] = formation.split("-").map(Number);

  if (position === "GK") return { x: 50, y: 8 };

  if (["RB", "RWB"].includes(position)) return { x: 88, y: 22 };
  if (["LB", "LWB"].includes(position)) return { x: 12, y: 22 };
  if (["CB", "RCB", "LCB"].includes(position)) {
    if (def === 5) {
      if (position === "RCB" || (position === "CB" && index === 0)) return { x: 72, y: 20 };
      if (position === "LCB" || (position === "CB" && index === 2)) return { x: 28, y: 20 };
      return { x: 50, y: 18 };
    }
    if (def === 4) {
      return { x: index === 0 ? 63 : 37, y: 20 };
    }
    if (def === 3) {
      if (index === 0) return { x: 75, y: 20 };
      if (index === 2) return { x: 25, y: 20 };
      return { x: 50, y: 18 };
    }
    return { x: 50, y: 20 };
  }

  if (["CDM", "RDM", "LDM"].includes(position)) {
    const yPos = 36;
    if (samePositionCount === 1) return { x: 50, y: yPos };
    if (samePositionCount === 2) return { x: index === 0 ? 62 : 38, y: yPos };
    return { x: index === 0 ? 72 : index === 1 ? 50 : 28, y: yPos };
  }

  if (["CM", "RCM", "LCM"].includes(position)) {
    const yPos = formation.startsWith("4-2") ? 48 : 42;
    if (samePositionCount === 1) return { x: 50, y: yPos };
    if (samePositionCount === 2) return { x: index === 0 ? 62 : 38, y: yPos };
    return { x: index === 0 ? 72 : index === 1 ? 50 : 28, y: yPos };
  }

  if (["CAM"].includes(position)) {
    return { x: 50, y: 58 };
  }

  if (["RM", "RW"].includes(position)) return { x: 82, y: 60 };
  if (["LM", "LW"].includes(position)) return { x: 18, y: 60 };

  if (["ST", "CF"].includes(position)) {
    const yPos = 78;
    if (samePositionCount === 1) return { x: 50, y: yPos };
    if (samePositionCount === 2) return { x: index === 0 ? 62 : 38, y: yPos };
    return { x: index === 0 ? 72 : index === 1 ? 50 : 28, y: yPos };
  }
  if (["RS", "RF"].includes(position)) return { x: 68, y: 72 };
  if (["LS", "LF"].includes(position)) return { x: 32, y: 72 };

  return { x: 50, y: 50 };
}

export default function Pitch({ formation, lineup, teamName }: PitchProps) {
  const positionCounts: Record<string, number> = {};
  lineup.forEach((p) => {
    positionCounts[p.position] = (positionCounts[p.position] || 0) + 1;
  });

  const positionIndexCounters: Record<string, number> = {};

  return (
    <div className="relative w-full max-w-[350px] xs:max-w-[400px] sm:max-w-[500px] mx-auto aspect-[3/4] sm:aspect-[4/5]">
      {/* Pitch Background */}
      <div className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl">
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(0deg,
                #1a7a1a 0%, #228B22 2%, #2d9d2d 4%, #1a7a1a 6%,
                #228B22 8%, #2d9d2d 10%, #1a7a1a 12%, #228B22 14%,
                #2d9d2d 16%, #1a7a1a 18%, #228B22 20%, #2d9d2d 22%,
                #1a7a1a 24%, #228B22 26%, #2d9d2d 28%, #1a7a1a 30%,
                #228B22 32%, #2d9d2d 34%, #1a7a1a 36%, #228B22 38%,
                #2d9d2d 40%, #1a7a1a 42%, #228B22 44%, #2d9d2d 46%,
                #1a7a1a 48%, #228B22 50%, #2d9d2d 52%, #1a7a1a 54%,
                #228B22 56%, #2d9d2d 58%, #1a7a1a 60%, #228B22 62%,
                #2d9d2d 64%, #1a7a1a 66%, #228B22 68%, #2d9d2d 70%,
                #1a7a1a 72%, #228B22 74%, #2d9d2d 76%, #1a7a1a 78%,
                #228B22 80%, #2d9d2d 82%, #1a7a1a 84%, #228B22 86%,
                #2d9d2d 88%, #1a7a1a 90%, #228B22 92%, #2d9d2d 94%,
                #1a7a1a 96%, #228B22 98%, #2d9d2d 100%
              )
            `,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,0.15) 100%)",
          }}
        />
      </div>

      {/* Pitch Markings */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
        <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="10" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="0.8" fill="rgba(255,255,255,0.8)" />
        <rect x="2" y="32" width="18" height="36" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
        <rect x="2" y="38" width="7" height="24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
        <circle cx="14" cy="50" r="0.6" fill="rgba(255,255,255,0.8)" />
        <rect x="0.5" y="42" width="1.5" height="16" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.8" rx="0.5" />
        <rect x="80" y="32" width="18" height="36" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
        <rect x="91" y="38" width="7" height="24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
        <circle cx="86" cy="50" r="0.6" fill="rgba(255,255,255,0.8)" />
        <rect x="98" y="42" width="1.5" height="16" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="0.8" rx="0.5" />
        <path d="M 2 8 Q 2 2 8 2" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
        <path d="M 98 8 Q 98 2 92 2" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
        <path d="M 2 92 Q 2 98 8 98" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
        <path d="M 98 92 Q 98 98 92 98" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.5" />
      </svg>

      {/* Players */}
      {lineup.map((player, idx) => {
        const posType = player.position;
        const count = positionCounts[posType] || 1;
        const currentIndex = positionIndexCounters[posType] || 0;
        positionIndexCounters[posType] = currentIndex + 1;

        const coords = getPositionCoordinates(posType, formation, currentIndex, count);

        return (
          <motion.div
            key={idx}
            className="absolute group/tooltip cursor-pointer"
            style={{
              left: `${coords.x}%`,
              top: `${coords.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: idx * 0.08,
            }}
            whileHover={{ scale: 1.3, zIndex: 50 }}
          >
            {/* Player dot — smaller on mobile */}
            <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full bg-white dark:bg-gray-200 shadow-lg border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center text-[9px] xs:text-[10px] sm:text-xs font-bold text-gray-700 transition-colors">
              {idx + 1}
            </div>

            {/* Tooltip on hover — hidden on very small screens, shown on tap-friendly sizes */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 sm:mb-2 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 hidden sm:block">
              <div className="bg-gray-900 text-white text-[10px] sm:text-xs rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap shadow-xl">
                <p className="font-semibold">{player.player ?? player.name ?? `Player ${idx + 1}`}</p>
                <p className="text-gray-300 text-[9px] sm:text-[10px]">{player.position}</p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
              </div>
            </div>

            {/* Position label */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0.5">
              <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-bold text-white bg-black/40 px-1 rounded-sm whitespace-nowrap">
                {player.position}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Formation label */}
      <motion.div
        className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <span className="bg-black/60 text-white text-[10px] sm:text-xs md:text-sm font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full backdrop-blur-sm">
          {formation}
        </span>
      </motion.div>

      {/* Team name label */}
      <motion.div
        className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="bg-black/60 text-white text-[10px] sm:text-sm md:text-base font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full backdrop-blur-sm">
          {teamName}
        </span>
      </motion.div>
    </div>
  );
}