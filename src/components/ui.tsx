import { useEffect, useId, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react";
import { animate, motion, useInView, useMotionValue, useSpring } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { cn } from "../utils/cn";

export const ease = [0.76, 0, 0.24, 1] as const;

/* ---------- css colour helpers for canvas drawing ---------- */
export function readCssColor(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

export function toRGB(color: string): [number, number, number] {
  const c = color.trim();
  if (c.startsWith("#")) {
    const h = c.length === 4 ? c.slice(1).split("").map((x) => x + x).join("") : c.slice(1, 7);
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = c.match(/[\d.]+/g);
  if (m && m.length >= 3) {
    const k = c.startsWith("color(") ? 255 : 1;
    return [Number(m[0]) * k, Number(m[1]) * k, Number(m[2]) * k];
  }
  return [255, 90, 54];
}

/* Element that leans toward the pointer */
export function Magnetic({ children, strength = 0.25, className }: { children: ReactNode; strength?: number; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16 });
  const sy = useSpring(y, { stiffness: 220, damping: 16 });
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  return (
    <motion.div
      className={cn("inline-block", className)}
      style={{ x: sx, y: sy }}
      onPointerMove={onMove}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* Label that rolls up on hover of the parent link/button */
export function Roll({ text, className }: { text: string; className?: string }) {
  return (
    <span className={cn("roll", className)} data-text={text}>
      <span>{text}</span>
    </span>
  );
}

/* Rotating circular text badge */
export function Stamp({ text, className, children, duration = 18 }: { text: string; className?: string; children?: ReactNode; duration?: number }) {
  const id = "stamp" + useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <div className={cn("relative flex shrink-0 items-center justify-center rounded-full", className)}>
      <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration, ease: "linear", repeat: Infinity }}>
        <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
          <defs>
            <path id={id} d="M50 50 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0" />
          </defs>
          <text fill="currentColor" fontSize="8.4" fontWeight="700" letterSpacing="1" textLength="232" lengthAdjust="spacingAndGlyphs" style={{ fontFamily: '"Space Mono", monospace' }}>
            <textPath href={`#${id}`}>{text}</textPath>
          </text>
        </svg>
      </motion.div>
      {children}
    </div>
  );
}

/* Eyes that follow the pointer */
export function Eyes({ className }: { className?: string }) {
  const l = useRef<HTMLDivElement>(null);
  const r = useRef<HTMLDivElement>(null);
  const lx = useMotionValue(0);
  const ly = useMotionValue(0);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);

  useEffect(() => {
    const look = (el: HTMLDivElement | null, x: MotionValue<number>, y: MotionValue<number>, e: PointerEvent) => {
      if (!el) return;
      const b = el.getBoundingClientRect();
      const dx = e.clientX - (b.left + b.width / 2);
      const dy = e.clientY - (b.top + b.height / 2);
      const d = Math.hypot(dx, dy) || 1;
      const m = Math.min(d, b.width * 0.24);
      x.set((dx / d) * m);
      y.set((dy / d) * m);
    };
    const onMove = (e: PointerEvent) => {
      look(l.current, lx, ly, e);
      look(r.current, rx, ry, e);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [lx, ly, rx, ry]);

  const eye = (ref: RefObject<HTMLDivElement | null>, x: MotionValue<number>, y: MotionValue<number>, delay: string) => (
    <div ref={ref} className="eye relative aspect-square w-1/2 overflow-hidden rounded-full border-[3px] border-[#141210] bg-[#f3efe6]" style={{ animationDelay: delay }}>
      <motion.div className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#141210]" style={{ x, y }}>
        <span className="absolute left-[18%] top-[16%] h-[30%] w-[30%] rounded-full bg-white" />
      </motion.div>
    </div>
  );

  return (
    <div className={cn("flex gap-[6%]", className)}>
      {eye(l, lx, ly, "0s")}
      {eye(r, rx, ry, "0.15s")}
    </div>
  );
}

/* Infinite marquee whose letters travel in a wave */
export function WaveMarquee({ items, className, speed = 30, sep = "  </>  " }: { items: string[]; className?: string; speed?: number; sep?: string }) {
  const chars = items.map((s) => `${s}${sep}`).join("").split("");
  const track = (
    <span className="inline-block whitespace-pre" aria-hidden>
      {chars.map((c, i) => (
        <span key={i} className="wave-char" style={{ animationDelay: `-${(i % 24) * 0.09}s` }}>
          {c}
        </span>
      ))}
    </span>
  );
  return (
    <div className={cn("overflow-hidden", className)} aria-label={items.join(", ")}>
      <div className="marquee flex w-max" style={{ animationDuration: `${speed}s` }}>
        {track}
        {track}
      </div>
    </div>
  );
}

/* Number that counts up when scrolled into view */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: (n) => setV(Math.round(n)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {v}
      {suffix}
    </span>
  );
}

/* Live Chennai time (IST) */
export function useIstTime() {
  const [t, setT] = useState({ h: 0, m: 0, s: 0, label: "--:--" });
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const tick = () => {
      const parts = fmt.formatToParts(new Date());
      const get = (k: string) => Number(parts.find((p) => p.type === k)?.value ?? 0) % 60;
      const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0) % 24;
      const m = get("minute");
      const s = get("second");
      setT({ h, m, s, label: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}` });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}
