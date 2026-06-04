"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";

// Realistic FIFA World Cup Trophy using actual image
export function AnimatedTrophy({ className = "", size = 64 }: { className?: string; size?: number }) {
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      rotateY: [0, 360],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "linear",
      },
    });
  }, [controls]);

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size * 1.6 }}
      animate={controls}
    >
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          filter: [
            "drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))",
            "drop-shadow(0 0 25px rgba(255, 215, 0, 0.9))",
            "drop-shadow(0 0 10px rgba(255, 215, 0, 0.5))",
          ],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/FIFA Worldcup trophy.png"
          alt="FIFA World Cup Trophy"
          style={{
            width: size,
            height: "auto",
            maxHeight: size * 1.6,
            objectFit: "contain",
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// Bouncing Soccer Ball
export function BouncingBall({ className = "", size = 40 }: { className?: string; size?: number }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      animate={{
        y: [0, -12, 0, -6, 0],
        rotate: [0, 10, -10, 5, 0],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className="w-full h-full flex items-center justify-center text-3xl md:text-4xl"
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          repeatDelay: 0.6,
        }}
      >
        ⚽
      </motion.div>
    </motion.div>
  );
}

// Waving Flag
export function WavingFlag({ countryCode, className = "", size = 32 }: { countryCode: "US" | "CA" | "MX"; className?: string; size?: number }) {
  const flags = {
    US: "🇺🇸",
    CA: "🇨🇦",
    MX: "🇲🇽",
  };

  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      animate={{
        rotateZ: [-5, 5, -5],
        x: [-2, 2, -2],
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl">
        {flags[countryCode]}
      </div>
    </motion.div>
  );
}

// Animated Medal (Gold/Silver/Bronze)
export function AnimatedMedal({ rank, className = "", size = 40 }: { rank: 1 | 2 | 3; className?: string; size?: number }) {
  const medals = {
    1: { emoji: "🥇", color: "from-yellow-400 to-amber-500", shadow: "shadow-yellow-500/50" },
    2: { emoji: "🥈", color: "from-gray-300 to-gray-400", shadow: "shadow-gray-400/50" },
    3: { emoji: "🥉", color: "from-amber-600 to-amber-700", shadow: "shadow-amber-600/50" },
  };

  const medal = medals[rank];

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [0, 15, -15, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 1,
        ease: "easeInOut",
      }}
    >
      <motion.div
        className={`w-full h-full flex items-center justify-center text-2xl md:text-3xl bg-gradient-to-br ${medal.color} rounded-full shadow-lg ${medal.shadow} p-1`}
        animate={{
          boxShadow: [
            `0 0 0px ${medal.color.split(" ")[2] || "gold"}`,
            `0 0 20px ${medal.color.split(" ")[2] || "gold"}`,
            `0 0 0px ${medal.color.split(" ")[2] || "gold"}`,
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {medal.emoji}
      </motion.div>
    </motion.div>
  );
}

// Animated Star
export function AnimatedStar({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.3, 1],
        rotate: [0, 20, 0],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="w-full h-full flex items-center justify-center text-yellow-400 text-xl">
        ⭐
      </div>
    </motion.div>
  );
}

// Fire Animation
export function FireIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      style={{ width: size, height: size }}
      animate={{
        scale: [1, 1.2, 1],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="w-full h-full flex items-center justify-center text-red-500 text-xl">
        🔥
      </div>
    </motion.div>
  );
}

// Confetti Explosion
export function ConfettiEffect({ trigger = false }: { trigger?: boolean }) {
  if (!trigger) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: "-10%",
            width: `${6 + Math.random() * 10}px`,
            height: `${6 + Math.random() * 10}px`,
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
            borderRadius: Math.random() > 0.5 ? "50%" : "0%",
          }}
          animate={{
            y: ["0vh", "120vh"],
            x: [
              `${(Math.random() - 0.5) * 200}px`,
              `${(Math.random() - 0.5) * 400}px`,
            ],
            rotate: [0, `${Math.random() * 720}deg`],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            ease: "easeOut",
            delay: Math.random() * 0.5,
          }}
        />
      ))}
    </div>
  );
}