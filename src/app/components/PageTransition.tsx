import { motion } from "motion/react";

export function PageTransition() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] pointer-events-none"
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      exit={{ scaleY: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformOrigin: "top" }}
    >
      <div className="w-full h-full bg-gradient-to-b from-purple-600 to-blue-600" />
    </motion.div>
  );
}
