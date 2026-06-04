"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [particles, setParticles] = useState<Array<{
    id: number;
    left: string;
    top: string;
    duration: number;
    delay: number;
  }>>([]);
  
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    setParticles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3,
      }))
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise((r) => setTimeout(r, 600));

    if (password === "worldcup2026") {
      document.cookie = "admin_auth=true; path=/; max-age=3600";
      addToast("success", "Welcome back, admin! ⚽");
      router.push("/admin/dashboard");
    } else {
      setError("Invalid password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 px-4 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
  <motion.div
    key={p.id}
    className="absolute w-1 h-1 bg-white/30 rounded-full"
    style={{ left: p.left, top: p.top }}
    animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
  />
))}
      </div>

      {/* Login Card */}
      <motion.div
        className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-md"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-xl -z-10" />

        <motion.div
          className="text-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
        >
          <motion.div
            className="w-20 h-20 mx-auto bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-xl shadow-yellow-500/30"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <span className="text-4xl">🏆</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1 className="text-3xl font-black text-white mb-2">Admin Access</h1>
          <p className="text-white/60 text-sm">Enter password to manage World Cup data</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-5">
            <label className="block text-sm font-medium text-white/80 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full px-4 py-3.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all duration-300"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-4 p-3 bg-red-500/20 border border-red-400/30 text-red-200 rounded-xl text-sm flex items-center gap-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span>❌</span> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-gray-900 font-bold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-yellow-500/25 flex items-center justify-center gap-2"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <>
                <motion.span
                  className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
                Verifying...
              </>
            ) : (
              <>
                <span>🔓</span> Login
              </>
            )}
          </motion.button>
        </motion.form>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <a
            href="/"
            className="text-white/50 hover:text-white/80 text-sm transition-colors inline-flex items-center gap-1"
          >
            <span>←</span> Back to website
          </a>
        </motion.div>

        <motion.p
          className="mt-4 text-center text-white/20 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Hint: worldcup2026
        </motion.p>
      </motion.div>
    </div>
  );
}