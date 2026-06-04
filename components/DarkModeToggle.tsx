"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark =
      localStorage.getItem("darkMode") === "true" ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches &&
        localStorage.getItem("darkMode") !== "false");

    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Prevent flash of wrong icon
  if (!mounted) {
    return <div className="w-10 h-10" />;
  }

  return (
    <motion.button
      onClick={toggleDarkMode}
      className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors overflow-hidden group"
      aria-label="Toggle dark mode"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {/* Ripple on click */}
      <motion.div
        className="absolute inset-0 rounded-xl bg-yellow-400/20 dark:bg-blue-400/20"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 0, opacity: 0 }}
        key={darkMode ? "dark-ripple" : "light-ripple"}
        transition={{ duration: 0.4 }}
        whileTap={{ scale: 2, opacity: 1 }}
      />

      <AnimatePresence mode="wait">
        {darkMode ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            {/* Sun icon */}
            <svg
              className="w-5 h-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <motion.circle
                cx="12"
                cy="12"
                r="5"
                animate={{ r: [5, 5.5, 5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <motion.line
                  key={angle}
                  x1="12"
                  y1="1"
                  x2="12"
                  y2="3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  style={{ transformOrigin: "12px 12px", transform: `rotate(${angle}deg)` }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.25,
                  }}
                />
              ))}
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            {/* Moon icon with stars */}
            <svg
              className="w-5 h-5 text-blue-300"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <motion.path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </svg>
            {/* Tiny stars */}
            <motion.span
              className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full"
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            <motion.span
              className="absolute bottom-1 left-1 w-0.5 h-0.5 bg-white rounded-full"
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hover ring */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-yellow-400/30 dark:group-hover:ring-blue-400/30 transition-all duration-300" />
    </motion.button>
  );
}

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}