import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";
import { ease } from "./ui";

const bootLines = [
  "> gokul.a --init",
  "> spawning ros2 nodes ........... ok",
  "> fusing sensor streams ......... ok",
  "> mounting interface ............ ok",
];

const COLS = 6;

/* Terminal boot sequence; the interface exits through offset blueprint shutters. */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [lines, setLines] = useState(1);

  useEffect(() => {
    const timers = [350, 750, 1150].map((t, i) => window.setTimeout(() => setLines(i + 2), t));
    const controls = animate(0, 100, { duration: 1.7, ease: [0.65, 0, 0.35, 1], onUpdate: (v) => setCount(Math.round(v)) });
    timers.push(window.setTimeout(onDone, 2000));
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      controls.stop();
    };
  }, [onDone]);

  return (
    <motion.div className="fixed inset-0 z-[300]" initial="show" animate="show" exit="exit">
      {/* trailing dark stripes */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: COLS }).map((_, i) => (
          <motion.div
            key={i}
            className="h-full origin-top bg-[#0d0c0b]"
            style={{ width: "calc(16.7% + 2px)", marginLeft: i ? -2 : 0 }}
            variants={{ show: { scaleY: 1 }, exit: { scaleY: 0, transition: { duration: 0.7, ease, delay: 0.14 + i * 0.06 } } }}
          />
        ))}
      </div>
      {/* Signal-colour shutters */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: COLS }).map((_, i) => (
          <motion.div
            key={i}
            className="h-full origin-top bg-acc"
            style={{ width: "calc(16.7% + 2px)", marginLeft: i ? -2 : 0 }}
            variants={{ show: { scaleY: 1 }, exit: { scaleY: 0, transition: { duration: 0.7, ease, delay: i * 0.06 } } }}
          />
        ))}
      </div>

      <motion.div
        className="relative flex h-full flex-col justify-between p-6 text-onacc md:p-10"
        variants={{ show: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0.2 } } }}
      >
        <div className="flex justify-between font-mono text-[11px] font-bold tracking-[.22em]">
          <span>GOKUL A — PORTFOLIO.EXE</span>
          <span>V2026.1</span>
        </div>

        <div className="font-mono text-sm font-bold leading-relaxed md:text-lg">
          {bootLines.slice(0, lines).map((l, i) => (
            <motion.p key={l} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }} className={i === lines - 1 ? "caret" : ""}>
              {l}
            </motion.p>
          ))}
        </div>

        <div>
          <div className="mb-3 flex items-end justify-between">
            <span className="font-mono text-[11px] font-bold tracking-[.22em]">LOADING</span>
            <span className="font-display text-[34vw] font-extrabold leading-[.75] tracking-[-.06em] md:text-[22vw]">{count}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden bg-onacc/20">
            <div className="h-full bg-onacc" style={{ width: `${count}%` }} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
