"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CountdownProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        return;
      }

      setIsExpired(false);
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timeUnits = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  if (isExpired) {
    return (
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <motion.div
          className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4"
          animate={{
            boxShadow: [
              "0 0 20px rgba(234, 179, 8, 0.2)",
              "0 0 40px rgba(234, 179, 8, 0.4)",
              "0 0 20px rgba(234, 179, 8, 0.2)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⚽
          </motion.span>
          <span className="text-2xl md:text-4xl font-black text-white">
            Tournament Underway!
          </span>
          <motion.span
            className="text-3xl"
            animate={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          >
            🏆
          </motion.span>
        </motion.div>
        <p className="text-white/60 text-sm mt-3 uppercase tracking-widest">
          Follow live scores & standings
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-3 md:gap-5">
      {timeUnits.map((unit, index) => (
        <motion.div
          key={unit.label}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
        >
          <motion.div
            className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-xl md:rounded-2xl p-3 md:p-5 min-w-[70px] md:min-w-[100px] shadow-2xl overflow-hidden group"
            whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.4)" }}
          >
            {/* Shine effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-white/10 via-transparent to-white/20" />
            
            <motion.span
              className="relative block text-3xl md:text-5xl font-black text-white tabular-nums"
              key={unit.value}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {unit.value.toString().padStart(2, "0")}
            </motion.span>
            <span className="relative block text-xs md:text-sm text-white/60 mt-2 font-medium uppercase tracking-wider">
              {unit.label}
            </span>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}