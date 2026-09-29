import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Magnetic, Roll, WaveMarquee, useIstTime } from "./ui";

const EMAIL = "gokula.work@gmail.com";
const GITHUB = "https://github.com/CapedCrusader77";
const LINKEDIN = "https://linkedin.com/in/gokul-a";

const pages = [
  { label: "HOME", href: "#top" },
  { label: "WORK", href: "#work" },
  { label: "TRANSFORM", href: "#reach" },
  { label: "ABOUT", href: "#about" },
  { label: "LAB", href: "#lab" },
  { label: "TERMINAL", href: "#terminal" },
];

const channels = [
  { label: "GITHUB", href: GITHUB, external: true },
  { label: "LINKEDIN", href: LINKEDIN, external: true },
  { label: "EMAIL", href: `mailto:${EMAIL}`, external: false },
];

function CopyButton() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      /* clipboard unavailable — still show feedback */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button onClick={copy} data-cursor="COPY" className="group relative overflow-hidden border border-ink px-7 py-4 font-mono text-xs font-bold tracking-[.2em]">
      <span className="absolute inset-0 origin-bottom scale-y-0 bg-acc transition-transform duration-500 ease-[cubic-bezier(.76,0,.24,1)] group-hover:scale-y-100" />
      <span className="relative block h-4 min-w-[10ch] overflow-hidden transition-colors duration-500 group-hover:text-onacc">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={copied ? "y" : "n"} className="block" initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.25 }}>
            {copied ? "COPIED ✓" : "COPY EMAIL"}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}

function SignalPanel({ time }: { time: string }) {
  return (
    <div className="relative grid aspect-square w-44 grid-cols-4 grid-rows-4 border border-acc md:w-56" aria-label="Live connection signal">
      {Array.from({ length: 16 }).map((_, i) => (
        <span key={i} className="border border-acc/20" />
      ))}
      <span className="absolute left-1/4 top-1/4 h-1/2 w-1/2 border border-acc bg-acc/10" />
      <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-acc" />
      <span className="absolute left-3 top-3 font-mono text-[9px] font-bold tracking-[.14em] text-acc">CHENNAI</span>
      <span className="absolute bottom-3 right-3 font-mono text-[9px] font-bold tracking-[.14em] text-acc">{time} IST</span>
    </div>
  );
}

export default function Footer() {
  const { label } = useIstTime();
  const letters = "WRITE".split("");

  return (
    <footer id="contact" data-section="CONTACT" className="relative z-10 bg-[#0d0c0b] px-3 pb-3 pt-24 text-[#f3efe6] md:px-6 md:pb-6 md:pt-40">
      <div className="mx-auto max-w-[1600px]">
        <div className="px-2 md:px-4">
          <p className="mb-6 font-mono text-[11px] font-bold tracking-[.22em] text-white/60">(07) CONTACT / CHENNAI</p>
          <a href={`mailto:${EMAIL}`} className="block font-display text-[26vw] font-extrabold leading-[.85] tracking-[-.06em] md:text-[19vw]" aria-label="Email Gokul">
            {letters.map((c, i) => (
              <motion.span
                key={i}
                aria-hidden
                className="inline-block hover:text-acc"
                whileHover={{ y: -30, rotate: i % 2 ? 8 : -8 }}
                transition={{ type: "spring", stiffness: 400, damping: 12 }}
              >
                {c === " " ? "\u00A0" : c}
              </motion.span>
            ))}
          </a>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <CopyButton />
            <a href={LINKEDIN} target="_blank" rel="noreferrer" data-cursor="LINKEDIN" className="border border-white/30 px-7 py-4 font-mono text-xs font-bold tracking-[.2em] hover:border-acc hover:text-acc">
              <Roll text="CONNECT ON LINKEDIN ↗" />
            </a>
          </div>
        </div>

        <div className="mt-20 overflow-hidden border border-white/20 bg-card md:mt-28">
          <div className="grid gap-12 p-6 md:grid-cols-12 md:p-12">
            <nav className="md:col-span-4" aria-label="Pages">
              <p className="mb-5 font-mono text-[10px] font-bold tracking-[.22em] text-acc">INDEX</p>
              <ul className="space-y-1">
                {pages.map((p) => (
                  <li key={p.label}>
                    <a href={p.href} className="group inline-flex items-center gap-3 font-display text-3xl font-extrabold tracking-tight hover:text-acc md:text-4xl">
                      <Roll text={p.label} />
                      <ArrowUpRight size={22} className="-translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center md:col-span-4 md:justify-center">
              <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.7, ease: "easeOut" }}>
                <SignalPanel time={label} />
              </motion.div>
            </div>

            <div className="md:col-span-4 md:text-right">
              <p className="mb-5 font-mono text-[10px] font-bold tracking-[.22em] text-acc">CHANNELS</p>
              <ul className="space-y-2 font-mono text-xs font-bold tracking-[.2em]">
                {channels.map((c) => (
                  <li key={c.label}>
                    <a href={c.href} {...(c.external ? { target: "_blank", rel: "noreferrer" } : {})} className="inline-flex items-center gap-2 hover:text-acc">
                      <Roll text={c.label} />
                      <ArrowUpRight size={14} />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-8 break-all font-mono text-xs text-acc">{EMAIL}</p>
            </div>
          </div>

          <div className="border-t border-white/10 py-4">
            <WaveMarquee items={["ROS2", "SLAM", "LANGGRAPH", "PYTORCH", "FASTAPI", "REACT 19", "DOCKER"]} speed={40} sep="   ·   " className="font-mono text-sm font-bold tracking-[.2em] text-ink/70" />
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-4 px-2 pb-2 font-mono text-[10px] font-bold tracking-[.18em] text-white/65 md:flex-row md:items-center md:justify-between md:px-4">
          <span>© GOKUL A · VIT CHENNAI × IIT MADRAS</span>
          <span>BUILT WITH PRECISION &amp; FEELING</span>
          <Magnetic>
            <a href="#top" className="inline-flex items-center gap-2">
              <Roll text="BACK TO TOP" /> ↑
            </a>
          </Magnetic>
        </div>
      </div>
    </footer>
  );
}
