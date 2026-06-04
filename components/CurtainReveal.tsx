"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CurtainReveal() {
  const [show, setShow] = useState(true);
  const [stage, setStage] = useState<"intro" | "logo" | "open" | "done">("intro");

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("curtain_seen");
    if (hasSeen) {
      setShow(false);
      setStage("done");
      return;
    }

    const t1 = setTimeout(() => setStage("logo"), 600);
    const t2 = setTimeout(() => setStage("open"), 2200);
    const t3 = setTimeout(() => {
      setStage("done");
      sessionStorage.setItem("curtain_seen", "true");
    }, 3200);
    const t4 = setTimeout(() => setShow(false), 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] pointer-events-none"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Dark background */}
          <div className="absolute inset-0 bg-[#0a0a0a]" />

          {/* Spotlight effect — responsive size */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: stage === "intro" ? 0 : 1 }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="absolute w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[600px] md:h-[600px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 30%, transparent 70%)",
                filter: "blur(20px)",
              }}
            />
          </motion.div>

          {/* Left Curtain */}
          <motion.div
            className="absolute top-0 left-0 h-full w-1/2"
            initial={{ x: "0%" }}
            animate={{ x: stage === "open" || stage === "done" ? "-105%" : "0%" }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: stage === "open" ? 0 : 0 }}
            style={{
              background: `
                linear-gradient(90deg, 
                  #1a0a0a 0%, 
                  #3d1111 15%, 
                  #5c1a1a 30%, 
                  #7a1f1f 50%, 
                  #5c1a1a 70%, 
                  #3d1111 85%, 
                  #1a0a0a 100%
                )
              `,
              boxShadow: "inset -8px 0 30px rgba(0,0,0,0.8), 8px 0 20px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 30px,
                    rgba(0,0,0,0.3) 30px,
                    rgba(0,0,0,0.3) 35px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 80px,
                    rgba(0,0,0,0.2) 80px,
                    rgba(0,0,0,0.2) 82px
                  )
                `,
              }}
            />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(255,255,255,0.05) 60%, transparent 100%)",
              }}
            />
            {/* Curtain rod rings — fewer on mobile */}
            <div className="absolute top-0 left-0 right-0 h-4 sm:h-6 bg-gradient-to-b from-[#2a1a1a] to-transparent flex justify-start gap-2 sm:gap-4 px-3 sm:px-8 pt-0.5 sm:pt-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#8B7355] border border-[#6B5335] shadow-inner"
                />
              ))}
            </div>
          </motion.div>

          {/* Right Curtain */}
          <motion.div
            className="absolute top-0 right-0 h-full w-1/2"
            initial={{ x: "0%" }}
            animate={{ x: stage === "open" || stage === "done" ? "105%" : "0%" }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1], delay: stage === "open" ? 0 : 0 }}
            style={{
              background: `
                linear-gradient(270deg, 
                  #1a0a0a 0%, 
                  #3d1111 15%, 
                  #5c1a1a 30%, 
                  #7a1f1f 50%, 
                  #5c1a1a 70%, 
                  #3d1111 85%, 
                  #1a0a0a 100%
                )
              `,
              boxShadow: "inset 8px 0 30px rgba(0,0,0,0.8), -8px 0 20px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    270deg,
                    transparent,
                    transparent 30px,
                    rgba(0,0,0,0.3) 30px,
                    rgba(0,0,0,0.3) 35px
                  ),
                  repeating-linear-gradient(
                    270deg,
                    transparent,
                    transparent 80px,
                    rgba(0,0,0,0.2) 80px,
                    rgba(0,0,0,0.2) 82px
                  )
                `,
              }}
            />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 40%, rgba(255,255,255,0.05) 60%, transparent 100%)",
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-4 sm:h-6 bg-gradient-to-b from-[#2a1a1a] to-transparent flex justify-end gap-2 sm:gap-4 px-3 sm:px-8 pt-0.5 sm:pt-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#8B7355] border border-[#6B5335] shadow-inner"
                />
              ))}
            </div>
          </motion.div>

          {/* Golden curtain rod */}
          <div className="absolute top-0 left-0 right-0 h-2 sm:h-3 bg-gradient-to-b from-[#DAA520] via-[#FFD700] to-[#B8860B] shadow-lg shadow-amber-500/30 z-10" />
          <div className="absolute top-2 sm:top-3 left-0 right-0 h-0.5 sm:h-1 bg-gradient-to-b from-[#B8860B] to-transparent" />

          {/* Center Logo — responsive sizing */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-20 px-4"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: stage === "logo" || stage === "open" ? 1 : 0,
              scale: stage === "logo" || stage === "open" ? 1 : 0.5,
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="relative"
              animate={{
                filter: [
                  "drop-shadow(0 0 20px rgba(255,255,255,0.4))",
                  "drop-shadow(0 0 40px rgba(255,255,255,0.7))",
                  "drop-shadow(0 0 20px rgba(255,255,255,0.4))",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/fifa world cup 2026 logo.png"
                alt="FIFA World Cup 2026"
                className="w-[180px] sm:w-[240px] md:w-[320px] lg:w-[400px] h-auto object-contain"
              />
            </motion.div>
          </motion.div>

          {/* Bottom golden trim */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-t from-[#DAA520] via-[#FFD700] to-[#B8860B] shadow-lg shadow-amber-500/20" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}