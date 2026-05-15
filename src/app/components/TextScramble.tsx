import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "motion/react";

interface TextScrambleProps {
  text: string;
  speed?: number; // milliseconds per character
  className?: string;
  triggerOnHover?: boolean;
  triggerOnScroll?: boolean;
  glowColor?: "cyan" | "blue" | "purple";
}

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const glowClasses = {
  cyan: "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]",
  blue: "text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]",
  purple: "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"
};

export function TextScramble({
  text,
  speed = 40,
  className = "",
  triggerOnHover = false,
  triggerOnScroll = false,
  glowColor = "cyan"
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  // Generate random character
  const getRandomChar = useCallback(() => {
    return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
  }, []);

  // Animate text scramble
  const animateScramble = useCallback(() => {
    if (isAnimating) return;

    setIsAnimating(true);
    let currentIndex = 0;
    const originalText = text;
    const textLength = originalText.length;

    const animate = () => {
      if (currentIndex <= textLength) {
        const scrambledPart = Array(currentIndex)
          .fill(0)
          .map((_, i) => originalText[i])
          .join("");

        const randomPart = Array(textLength - currentIndex)
          .fill(0)
          .map(() => getRandomChar())
          .join("");

        setDisplayText(scrambledPart + randomPart);
        currentIndex++;
        animationRef.current = setTimeout(animate, speed);
      } else {
        setDisplayText(originalText);
        setIsAnimating(false);
      }
    };

    animate();
  }, [text, speed, isAnimating, getRandomChar]);

  // Trigger animation on hover
  const handleMouseEnter = useCallback(() => {
    if (triggerOnHover) {
      setIsHovered(true);
      animateScramble();
    }
  }, [triggerOnHover, animateScramble]);

  const handleMouseLeave = useCallback(() => {
    if (triggerOnHover) {
      setIsHovered(false);
    }
  }, [triggerOnHover]);

  // Trigger animation on scroll (viewport entry)
  useEffect(() => {
    if (!triggerOnScroll || hasTriggeredRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          animateScramble();
        }
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [triggerOnScroll, animateScramble]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block transition-all duration-300 ${
        isHovered ? glowClasses[glowColor] : ""
      } ${className}`}
    >
      {/* Glow effect background (when active) */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`absolute inset-0 blur-md opacity-40 rounded ${
            glowColor === "cyan" ? "bg-cyan-500/20" : glowColor === "blue" ? "bg-blue-500/20" : "bg-purple-500/20"
          }`}
        />
      )}

      {/* Text */}
      <span className="relative z-10 font-mono tracking-wider">
        {displayText}
      </span>
    </div>
  );
}

// Preset variants for common use cases
export function TextScrambleSkill({
  text,
  speed = 35,
  className = "",
  glowColor = "cyan"
}: Omit<TextScrambleProps, "triggerOnHover" | "triggerOnScroll">) {
  return (
    <TextScramble
      text={text}
      speed={speed}
      className={`text-sm md:text-base font-medium text-gray-300 hover:text-white transition-colors ${className}`}
      triggerOnHover
      glowColor={glowColor}
    />
  );
}

export function TextScrambleTitle({
  text,
  speed = 30,
  className = "",
  glowColor = "cyan"
}: Omit<TextScrambleProps, "triggerOnHover" | "triggerOnScroll">) {
  return (
    <TextScramble
      text={text}
      speed={speed}
      className={`text-xl md:text-2xl font-bold text-white ${className}`}
      triggerOnScroll
      glowColor={glowColor}
    />
  );
}
