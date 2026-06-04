"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface RippleButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  variant?: "primary" | "success" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const variants = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25",
  success: "bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/25",
  ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-xl",
};

export default function RippleButton({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  variant = "primary",
  size = "md",
}: RippleButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
    >
      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 2, opacity: 1 }}
        transition={{ duration: 0.4 }}
        key={Math.random()}
      />
      {children}
    </motion.button>
  );
}