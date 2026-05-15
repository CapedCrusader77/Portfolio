import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function PremiumCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);

  // Smooth spring values for different cursor elements
  const cursorX = useSpring(mousePosition.x, { stiffness: 150, damping: 20 });
  const cursorY = useSpring(mousePosition.y, { stiffness: 150, damping: 20 });

  const trailX = useSpring(mousePosition.x, { stiffness: 80, damping: 30 });
  const trailY = useSpring(mousePosition.y, { stiffness: 80, damping: 30 });

  const glowX = useSpring(mousePosition.x, { stiffness: 50, damping: 40 });
  const glowY = useSpring(mousePosition.y, { stiffness: 50, damping: 40 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!hasMoved) setHasMoved(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[data-hoverable]")
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("[data-hoverable]")
      ) {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handleMouseEnter);
    document.addEventListener("mouseout", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handleMouseEnter);
      document.removeEventListener("mouseout", handleMouseLeave);
    };
  }, [hasMoved]);

  if (!hasMoved) return null;

  return (
    <>
      {/* Ambient glow effect */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          x: glowX,
          y: glowY,
          width: 400,
          height: 400,
          marginLeft: -200,
          marginTop: -200,
          zIndex: 9998,
        }}
      >
        <div
          className="w-full h-full rounded-full opacity-30 blur-3xl"
          style={{
            background: `radial-gradient(circle, rgba(139, 92, 246, 0.5) 0%, rgba(59, 130, 246, 0.3) 30%, transparent 70%)`,
          }}
        />
      </motion.div>

      {/* Trail effect */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          x: trailX,
          y: trailY,
          width: 40,
          height: 40,
          marginLeft: -20,
          marginTop: -20,
          zIndex: 9999,
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            border: "2px solid rgba(139, 92, 246, 0.8)",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Main cursor */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          x: cursorX,
          y: cursorY,
          width: isHovering ? 60 : 24,
          height: isHovering ? 60 : 24,
          marginLeft: isHovering ? -30 : -12,
          marginTop: isHovering ? -30 : -12,
          zIndex: 10000,
        }}
        animate={{
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{ duration: 0.1 }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{
            background: isHovering
              ? "rgba(139, 92, 246, 0.6)"
              : "rgba(255, 255, 255, 1)",
            border: isHovering ? "2px solid rgba(139, 92, 246, 1)" : "none",
            backdropFilter: "blur(4px)",
            boxShadow: "0 0 30px rgba(255, 255, 255, 0.5)",
          }}
        />
      </motion.div>

      {/* Cursor dot */}
      <motion.div
        className="fixed pointer-events-none"
        style={{
          x: cursorX,
          y: cursorY,
          width: 8,
          height: 8,
          marginLeft: -4,
          marginTop: -4,
          zIndex: 10001,
        }}
      >
        <div className="w-full h-full rounded-full bg-white shadow-xl" />
      </motion.div>
    </>
  );
}
