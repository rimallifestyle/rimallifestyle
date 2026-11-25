"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Sparkles } from "lucide-react";
import { useAdminTheme } from "@/context/AdminThemeContext";

export function ThemeToggle() {
  const { isLight, toggleTheme } = useAdminTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
      className={`relative h-10 w-[72px] rounded-full p-1 transition-all duration-500 ease-in-out cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C52A35] ${
        isLight
          ? "bg-gradient-to-r from-amber-100/90 to-sky-100/90 border border-black/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]"
          : "bg-gradient-to-r from-[#180000] via-[#2a0404] to-[#120000] border border-white/15 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),0_0_12px_rgba(197,42,53,0.15)]"
      }`}
    >
      {/* Background ambient elements */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
        {/* Sun indicator text/icon space */}
        <span
          className={`transition-opacity duration-300 ${
            isLight ? "opacity-30" : "opacity-0"
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-amber-600" />
        </span>

        {/* Moon indicator text/icon space */}
        <span
          className={`transition-opacity duration-300 ${
            !isLight ? "opacity-40" : "opacity-0"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
        </span>
      </div>

      {/* Sliding Knob with Smooth Spring Physics */}
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 450,
          damping: 28,
        }}
        animate={{
          x: isLight ? 32 : 0,
        }}
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 shadow-md ${
          isLight
            ? "bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 text-amber-950 shadow-[0_2px_10px_rgba(245,158,11,0.5)] border border-amber-200"
            : "bg-gradient-to-tr from-[#3a0808] via-[#550000] to-[#7A1111] text-amber-200 shadow-[0_2px_10px_rgba(0,0,0,0.6)] border border-white/20"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isLight ? (
            <motion.div
              key="sun-icon"
              initial={{ rotate: -90, scale: 0.2, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <Sun className="w-4 h-4 text-amber-900 fill-amber-400 drop-shadow-sm" />
            </motion.div>
          ) : (
            <motion.div
              key="moon-icon"
              initial={{ rotate: 90, scale: 0.2, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex items-center justify-center"
            >
              <Moon className="w-4 h-4 text-amber-300 fill-amber-300/30 drop-shadow-sm" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}
