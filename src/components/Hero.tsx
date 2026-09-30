import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { cn } from "../utils/cn";
import SignalField from "./SignalField";
import { Magnetic, ease, useIstTime } from "./ui";

const letters = "GOKUL A".split("");

/* corner registration ticks */
function Ticks() {
  const tick = "absolute h-4 w-4 border-ink/30";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-5 z-10 hidden md:block">
      <i className={cn(tick, "left-0 top-0 border-l border-t")} />
      <i className={cn(tick, "right-0 top-0 border-r border-t")} />
      <i className={cn(tick, "bottom-0 left-0 border-b border-l")} />
      <i className={cn(tick, "bottom-0 right-0 border-b border-r")} />
    </div>
  );
}

export default function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { label } = useIstTime();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const washScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  const washOpacity = useTransform(scrollYProgress, [0, 0.8], [0.85, 0.15]);
  const vignette = useTransform(scrollYProgress, [0, 1], [0.25, 0.7]);

  return (
    <section id="top" data-section="HELLO" ref={ref} className="bg-grid relative min-h-[100svh] overflow-hidden bg-paper text-ink">
      {/* colour wash — scales and fades with scroll */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          scale: washScale,
          opacity: washOpacity,
          background: "radial-gradient(50% 50% at 62% 42%, color-mix(in srgb, var(--acc) 18%, transparent), transparent 70%)",
        }}
      />

      {/* interactive signal field */}
      <SignalField />

      {/* vignette closes in as you scroll away */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ opacity: vignette, background: "radial-gradient(75% 75% at 50% 50%, transparent 40%, var(--paper) 100%)" }}
      />

      <Ticks />

      {/* copy layer (lets pointer through to the sphere except on links / letters) */}
      <motion.div className="pointer-events-none relative z-10 flex min-h-[100svh] flex-col justify-between px-5 pb-6 pt-28 md:px-10 md:pb-8 md:pt-32" style={{ y, opacity }}>
        <div className="flex items-start justify-between gap-4">
          <motion.div className="space-y-4" initial={{ opacity: 0, y: 16 }} animate={ready ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 0.5, duration: 0.7, ease }}>
            <div className="pointer-events-auto inline-flex items-center gap-2 border border-ink/20 bg-paper/50 px-3 py-1.5 font-mono text-[10px] font-bold tracking-[.2em] backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-acc opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-acc" />
              </span>
              DUAL-DEGREE SCHOLAR
            </div>
            <p className="font-mono text-[10px] leading-relaxed tracking-[.2em] text-ink/55">
              ROLE / AI &amp; ROBOTICS ENGINEER
              <br />
              STUDY / VIT CHENNAI × IIT MADRAS
              <br />
              BASE / CHENNAI, IN · {label} IST
            </p>
          </motion.div>
          <motion.p
            className="hidden border border-ink/20 px-4 py-2 font-mono text-[10px] font-bold tracking-[.2em] md:block"
            initial={{ opacity: 0, y: 16 }}
            animate={ready ? { opacity: 1, y: 0 } : undefined}
            transition={{ delay: 0.6, duration: 0.7, ease }}
          >
            B.TECH AI &amp; ROBOTICS · 2025 — 2029
          </motion.p>
        </div>

        <div>
          <div className="mb-6 flex flex-col gap-6 md:mb-8 md:flex-row md:items-end md:justify-between">
            <motion.p
              className="max-w-md text-lg font-light leading-snug md:text-2xl"
              initial={{ opacity: 0, y: 24 }}
              animate={ready ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 0.75, duration: 0.8, ease }}
            >
              I build <strong className="font-semibold text-acc">robots that move</strong> and <strong className="font-semibold text-acc">AI that actually makes sense.</strong>
              <span className="mt-3 block font-serif text-lg italic text-ink/60 md:text-xl">Curious by nature. Intentional by design.</span>
            </motion.p>
            <motion.div className="flex items-center gap-5" initial={{ opacity: 0 }} animate={ready ? { opacity: 1 } : undefined} transition={{ delay: 1.1 }}>
              <span className="hidden font-mono text-[10px] leading-relaxed tracking-[.2em] text-ink/55 md:block">
                MOVE TO ROTATE · DRAG TO SPIN —
                <br />
                SCROLL TO RESHAPE THE FIELD
              </span>
              <Magnetic className="pointer-events-auto">
                <a href="#work" data-cursor="SCROLL" aria-label="Scroll to work" className="group flex h-20 w-20 items-center justify-center rounded-full border-2 border-ink/80 hover:border-acc hover:bg-acc hover:text-onacc md:h-24 md:w-24">
                  <ArrowDown className="transition-transform duration-500 group-hover:translate-y-1" />
                </a>
              </Magnetic>
            </motion.div>
          </div>

          <h1 aria-label="Gokul A" className="-mb-[.02em] flex overflow-hidden pb-[.04em] font-hero text-[23vw] font-extrabold uppercase leading-[.78] tracking-[-.035em] md:text-[20vw]">
            {letters.map((c, i) => (
              <motion.span
                key={i}
                aria-hidden
                className={cn("glitch-l pointer-events-auto inline-block", i === 6 && "text-acc")}
                initial={{ y: "108%" }}
                animate={ready ? { y: 0 } : undefined}
                transition={{ duration: 1, ease, delay: 0.1 + i * 0.05 }}
              >
                {c === " " ? "\u00A0" : c}
              </motion.span>
            ))}
          </h1>
        </div>
      </motion.div>
    </section>
  );
}
