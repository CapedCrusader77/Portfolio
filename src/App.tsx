import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Cursor from "./components/Cursor";
import Preloader from "./components/Preloader";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import WorkStack from "./components/WorkStack";
import Reach from "./components/Reach";
import About from "./components/About";
import Playground from "./components/Playground";
import Terminal from "./components/Terminal";
import Footer from "./components/Footer";
import { WaveMarquee, ease } from "./components/ui";
import { applyPalette, palettes } from "./lib/palettes";

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef(0);
  const paletteIndex = useRef(0);
  const [section, setSection] = useState({ i: 0, name: "HELLO", total: 7 });

  useEffect(() => {
    applyPalette(palettes[0]);
  }, []);

  // lock scroll while the preloader is up
  useEffect(() => {
    document.body.style.overflow = loaded ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [loaded]);

  // section counter
  useEffect(() => {
    if (!loaded) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = els.indexOf(e.target as HTMLElement);
            setSection({ i, name: els[i]?.dataset.section ?? "", total: els.length });
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [loaded]);

  // Cycle the interface accent pair; returns the new name for the terminal response.
  const remix = useCallback(() => {
    paletteIndex.current = (paletteIndex.current + 1) % palettes.length;
    const p = palettes[paletteIndex.current];
    applyPalette(p);
    setToast(p.name);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
    return p.name;
  }, []);

  const onDone = useCallback(() => setLoaded(true), []);

  return (
    <>
      <Cursor />
      <div className="grain" aria-hidden />

      <AnimatePresence>{!loaded && <Preloader key="preloader" onDone={onDone} />}</AnimatePresence>

      <Nav onRemix={remix} />

      <main className="bg-paper text-ink">
        <Hero ready={loaded} />
        <WaveMarquee
          items={["ROS2", "SLAM", "LANGGRAPH", "PYTORCH", "FASTAPI", "REACT 19", "DOCKER", "C++20"]}
          className="border-y border-acc bg-acc py-4 font-display text-3xl font-extrabold tracking-tight text-onacc md:py-5 md:text-5xl"
        />
        <WorkStack />
        <Reach />
        <About />
        <Playground />
        <Terminal onTheme={remix} />
        <Footer />
      </main>

      {/* section counter */}
      <div className="pointer-events-none fixed bottom-6 left-6 z-[100] hidden items-center gap-3 font-mono text-[10px] font-bold tracking-[.22em] text-white mix-blend-difference md:flex">
        <span>
          0{section.i + 1} / 0{section.total}
        </span>
        <span className="h-px w-8 bg-white" />
        <span className="relative h-3 w-28 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span key={section.name} className="absolute left-0 top-0 leading-none" initial={{ y: 14 }} animate={{ y: 0 }} exit={{ y: -14 }} transition={{ duration: 0.35, ease }}>
              {section.name}
            </motion.span>
          </AnimatePresence>
        </span>
      </div>

      {/* palette toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 z-[150] flex items-center gap-3 border border-white/30 bg-acc px-5 py-3 font-mono text-[11px] font-bold tracking-[.2em] text-onacc shadow-2xl"
            initial={{ y: 40, x: "-50%", opacity: 0, scale: 0.9 }}
            animate={{ y: 0, x: "-50%", opacity: 1, scale: 1 }}
            exit={{ y: 20, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            <span className="flex -space-x-1">
              <i className="h-3 w-3 rounded-full bg-[#0d0c0b] ring-2 ring-acc" />
              <i className="h-3 w-3 rounded-full bg-acc2 ring-2 ring-acc" />
            </span>
            PALETTE SET — {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
