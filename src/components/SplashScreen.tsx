import React from "react";
import { motion } from "motion/react";

interface SplashScreenProps {
  status: string;
  accentColor: string;
  isDarkActive?: boolean;
}

export default function SplashScreen({ status, accentColor, isDarkActive = true }: SplashScreenProps) {
  return (
    <div className={`fixed inset-0 w-screen h-screen ${isDarkActive ? "bg-[#202124] text-zinc-300" : "bg-[#ffffff] text-zinc-800"} transition-colors duration-350 flex flex-col items-center justify-between select-none font-sans overflow-hidden py-16 px-4 z-50`}>
      {/* Top spacer for alignment */}
      <div className="h-10 shrink-0" />

      {/* Center Logo */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center text-center z-10 max-w-md"
      >
        {/* App Logo Container */}
        <div className="w-20 h-20 rounded-2xl bg-[#0494f4] flex items-center justify-center shadow-lg shrink-0 overflow-hidden relative">
          <img 
            src="/icon-512-maskable.png" 
            alt="Gothwad Icon" 
            className="w-full h-full object-cover relative z-10" 
            referrerPolicy="no-referrer" 
          />
        </div>
      </motion.div>

      {/* Bottom Loading Animation & Status */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col items-center gap-3 z-10 shrink-0 pb-6"
      >
        {/* Spinning indicator */}
        <div 
          className={`h-6 w-6 animate-spin rounded-full border-t-2 border-r-2 ${isDarkActive ? "border-zinc-700" : "border-zinc-300"}`} 
          style={{ borderTopColor: accentColor }} 
        />
      </motion.div>
    </div>
  );
}
