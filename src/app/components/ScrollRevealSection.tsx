import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right";
}

export function ScrollRevealSection({
  children,
  className = "",
  direction = "up",
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const transforms = {
    up: useTransform(scrollYProgress, [0, 0.3], [100, 0]),
    down: useTransform(scrollYProgress, [0, 0.3], [-100, 0]),
    left: useTransform(scrollYProgress, [0, 0.3], [100, 0]),
    right: useTransform(scrollYProgress, [0, 0.3], [-100, 0]),
  };

  const transform = transforms[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        opacity,
        [direction === "up" || direction === "down" ? "y" : "x"]: transform,
      }}
    >
      {children}
    </motion.div>
  );
}
