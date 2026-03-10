import React from "react";
import { motion } from "motion/react";

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-theme-bg-primary transition-colors duration-300">
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-theme-primary-500 to-transparent rounded-full dark:opacity-20 opacity-40 blur-3xl"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, 30, 60, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-theme-accent-500 to-transparent rounded-full dark:opacity-20 opacity-40 blur-3xl"
        animate={{
          x: [0, -40, 20, 0],
          y: [0, -50, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-theme-primary-400 to-transparent rounded-full dark:opacity-20 opacity-40 blur-3xl"
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.05, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
};
