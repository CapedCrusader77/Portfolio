import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import "@/styles/cyber-hero.css";

interface CyberParticleHeroProps {
  scrollTo: (id: string) => void;
}

export type SimulationMode = "FLUID" | "VORTEX" | "LATTICE";

const MODES: { id: SimulationMode; label: string }[] = [
  { id: "FLUID",   label: "FLUID"   },
  { id: "VORTEX",  label: "VORTEX"  },
  { id: "LATTICE", label: "LATTICE" },
];

// Stagger timing constants
const FADE_UP = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0  },
};
const FADE_IN = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
};
const SLIDE_LEFT  = { hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } };
const SLIDE_RIGHT = { hidden: { opacity: 0, x:  16 }, visible: { opacity: 1, x: 0 } };

const ease = [0.22, 1, 0.36, 1] as const;

export function CyberParticleHero({ scrollTo }: CyberParticleHeroProps) {
  const [activeMode, setActiveMode] = useState<SimulationMode>("FLUID");
  const [timeStr, setTimeStr]       = useState("");

  useEffect(() => {
    const fmt = () =>
      new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      });
    setTimeStr(fmt());
    const id = setInterval(() => setTimeStr(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleModeChange = (mode: SimulationMode) => {
    setActiveMode(mode);
    window.dispatchEvent(new CustomEvent("portfolio:sim-mode", { detail: { mode } }));
  };

  return (
    <section
      id="hero"
      className="ch-stage"
      aria-label="Gokul A Engineering Portfolio Hero"
    >
      {/* ── Left side tag ── */}
      <motion.div
        className="ch-side ch-side-left"
        variants={SLIDE_LEFT}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.2, duration: 0.7, ease }}
        aria-hidden="true"
      >
        <span>CHENNAI, IN · GMT+5:30</span>
      </motion.div>

      {/* ── Right side tag ── */}
      <motion.div
        className="ch-side ch-side-right"
        variants={SLIDE_RIGHT}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.2, duration: 0.7, ease }}
        aria-hidden="true"
      >
        <span>AI &amp; ROBOTICS ENGINEER</span>
      </motion.div>

      {/* ── Center block ── */}
      <div className="ch-center">
        {/* Kicker */}
        <motion.div
          className="ch-kicker"
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.15, duration: 0.65, ease }}
        >
          <span className="ch-kicker-dot" />
          <span>AUTONOMOUS SYSTEMS</span>
          <span className="ch-kicker-sep" />
          <span className="ch-kicker-dim">DEEP REINFORCEMENT LEARNING</span>
        </motion.div>

        {/* Name — each word animates in separately */}
        <h1 className="ch-name" aria-label="Gokul A.">
          <motion.span
            className="ch-name-line"
            variants={FADE_UP}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3, duration: 0.8, ease }}
          >
            GOKUL
          </motion.span>
          <motion.span
            className="ch-name-indent"
            variants={FADE_UP}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.46, duration: 0.8, ease }}
          >
            A<span className="ch-dot">.</span>
          </motion.span>
        </h1>

        {/* Rule */}
        <motion.div
          className="ch-rule"
          variants={FADE_IN}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.7, duration: 0.9, ease }}
        >
          <span className="ch-rule-line" />
          <span className="ch-rule-node" />
          <span className="ch-rule-line" />
        </motion.div>

        {/* Specs */}
        <motion.div
          className="ch-specs"
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.85, duration: 0.65, ease }}
        >
          <div className="ch-spec">
            <span className="ch-spec-val">VIT CHENNAI</span>
            <span className="ch-spec-sub">B.TECH · AI &amp; ROBOTICS</span>
          </div>
          <div className="ch-spec-div" />
          <div className="ch-spec">
            <span className="ch-spec-val">IIT MADRAS</span>
            <span className="ch-spec-sub">DATA SCIENCE · DIPLOMA</span>
          </div>
          <div className="ch-spec-div" />
          <div className="ch-spec">
            <span className="ch-spec-val">12 K GPU</span>
            <span className="ch-spec-sub">PARTICLE FIELD ACTIVE</span>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="ch-actions"
          variants={FADE_UP}
          initial="hidden"
          animate="visible"
          transition={{ delay: 1.0, duration: 0.65, ease }}
        >
          <motion.button
            type="button"
            onClick={() => scrollTo("projects")}
            className="ch-btn-primary"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>DEPLOYMENTS</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
          </motion.button>

          <motion.button
            type="button"
            onClick={() => scrollTo("about")}
            className="ch-btn-ghost"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>DOSSIER</span>
          </motion.button>
        </motion.div>
      </div>

      {/* ── Bottom telemetry bar ── */}
      <motion.div
        className="ch-telemetry-bar"
        variants={FADE_IN}
        initial="hidden"
        animate="visible"
        transition={{ delay: 1.1, duration: 0.8, ease }}
      >
        {/* Left: mode selector */}
        <div className="ch-telem-left">
          <span className="ch-telem-label">FIELD //</span>
          <div className="ch-mode-row">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => handleModeChange(m.id)}
                className={`ch-mode-pill ${activeMode === m.id ? "is-active" : ""}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center: live clock */}
        <div className="ch-telem-center">
          <span className="ch-telem-live-dot" />
          <AnimatePresence mode="wait">
            <motion.span
              key={timeStr}
              className="ch-telem-time"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {timeStr}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Right: scroll */}
        <motion.button
          type="button"
          onClick={() => scrollTo("about")}
          className="ch-telem-scroll"
          whileHover={{ color: "#00e5ff" }}
        >
          <span>SCROLL</span>
          <ArrowDown className="w-3 h-3 animate-bounce" />
        </motion.button>
      </motion.div>
    </section>
  );
}
