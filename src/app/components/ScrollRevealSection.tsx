import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef } from "react";

interface ScrollRevealSectionProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  distance?: number;
  scale?: number;
  rotateX?: number;
  rotateY?: number;
  blur?: boolean;
  fade?: boolean;
}

export function ScrollRevealSection({
  children,
  className = "",
  direction = "up",
  delay = 0,
  distance = 50,
  scale = 1,
  rotateX = 0,
  rotateY = 0,
  blur = false,
  fade = true,
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Apply spring physics to scroll progress for inertia and buttery smoothness
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 25,
    restDelta: 0.001,
  });

  // Calculate transitions based on smoothProgress
  const opacity = useTransform(
    smoothProgress,
    [0, 0.25, 0.75, 1],
    [fade ? 0 : 1, 1, 1, fade ? 0 : 1]
  );

  const scaleVal = useTransform(
    smoothProgress,
    [0, 0.25, 0.75, 1],
    [scale, 1, 1, scale]
  );

  // Directional translation values mapping smoothProgress
  const xVal = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [
    direction === "left" ? distance : direction === "right" ? -distance : 0,
    0,
    0,
    direction === "left" ? -distance : direction === "right" ? distance : 0
  ]);

  const yVal = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [
    direction === "up" ? distance : direction === "down" ? -distance : 0,
    0,
    0,
    direction === "up" ? -distance : direction === "down" ? distance : 0
  ]);

  // 3D rotations based on scroll
  const rotXVal = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [rotateX, 0, 0, -rotateX]);
  const rotYVal = useTransform(smoothProgress, [0, 0.25, 0.75, 1], [rotateY, 0, 0, -rotateY]);

  // Cinematic camera focus pull (blur)
  const filterVal = useTransform(
    smoothProgress,
    [0, 0.25, 0.75, 1],
    [
      blur ? "blur(8px)" : "blur(0px)",
      "blur(0px)",
      "blur(0px)",
      blur ? "blur(8px)" : "blur(0px)"
    ]
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        opacity,
        x: xVal,
        y: yVal,
        scale: scaleVal,
        rotateX: rotXVal,
        rotateY: rotYVal,
        filter: filterVal,
        perspective: 1000,
      }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

