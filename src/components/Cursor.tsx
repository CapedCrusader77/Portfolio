import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "../utils/cn";

/* Custom cursor: tight dot + lagging ring that grows into a labelled disc over [data-cursor] targets */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const dx = useSpring(x, { stiffness: 1500, damping: 90, mass: 0.3 });
  const dy = useSpring(y, { stiffness: 1500, damping: 90, mass: 0.3 });
  const rx = useSpring(x, { stiffness: 260, damping: 24, mass: 0.7 });
  const ry = useSpring(y, { stiffness: 260, damping: 24, mass: 0.7 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.body.classList.add("has-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = (e.target as Element | null)?.closest?.("[data-cursor]") as HTMLElement | null;
      setLabel(t && t.dataset.cursor ? t.dataset.cursor : null);
    };
    const d = () => setDown(true);
    const u = () => setDown(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", d);
    window.addEventListener("pointerup", u);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", d);
      window.removeEventListener("pointerup", u);
      document.body.classList.remove("has-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  const big = label !== null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[131] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference"
        style={{ x: dx, y: dy }}
        animate={{ scale: big ? 0 : down ? 0.5 : 1 }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className={cn(
          "pointer-events-none fixed left-0 top-0 z-[130] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-[10px] font-bold tracking-[.2em]",
          big ? "border-transparent bg-acc text-onacc" : "border-white mix-blend-difference"
        )}
        style={{ x: rx, y: ry }}
        animate={{ width: big ? 92 : 34, height: big ? 92 : 34, scale: down ? 0.85 : 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        <AnimatePresence>
          {big && (
            <motion.span key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
