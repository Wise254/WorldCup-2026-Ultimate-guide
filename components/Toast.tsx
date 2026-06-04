"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Toast {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

interface ToastContextType {
  addToast: (type: Toast["type"], message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

const icons: Record<Toast["type"], string> = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
};

const colors: Record<Toast["type"], string> = {
  success: "border-l-green-500 bg-green-50 dark:bg-green-900/20",
  error: "border-l-red-500 bg-red-50 dark:bg-red-900/20",
  info: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20",
  warning: "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast["type"], message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container — centered on mobile, bottom-right on desktop */}
      <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[100] flex flex-col items-center sm:items-end gap-2 sm:max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className={`pointer-events-auto border-l-4 rounded-lg shadow-xl p-3 sm:p-4 backdrop-blur-md w-full ${colors[toast.type]} cursor-pointer`}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => removeToast(toast.id)}
              whileHover={{ scale: 1.02 }}
              layout
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-base sm:text-lg flex-shrink-0">{icons[toast.type]}</span>
                <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">
                  {toast.message}
                </p>
              </div>
              {/* Progress bar */}
              <motion.div
                className={`absolute bottom-0 left-0 h-1 rounded-full ${
                  toast.type === "success"
                    ? "bg-green-400"
                    : toast.type === "error"
                    ? "bg-red-400"
                    : toast.type === "warning"
                    ? "bg-yellow-400"
                    : "bg-blue-400"
                }`}
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 3.5, ease: "linear" }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}