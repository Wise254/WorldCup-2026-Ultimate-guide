"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-gray-50 dark:bg-gray-950">
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            className="text-center max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🔧</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Critical Error
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              The application encountered a fatal error. Please try refreshing.
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              🔄 Reload Application
            </button>
          </motion.div>
        </div>
      </body>
    </html>
  );
}