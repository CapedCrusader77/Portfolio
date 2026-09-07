import { useLayoutEffect, useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import anime from "animejs";

gsap.registerPlugin(ScrollTrigger);

type LensId = "synthesis" | "physical" | "neural";

interface LensData {
  id: LensId;
  tabLabel: string;
  kicker: string;
  badge: string;
  badgeColor: string;
  glowColor: string;
  title: string;
  narrative: string;
  stack: string[];
}

const lenses: Record<LensId, LensData> = {
  synthesis: {
    id: "synthesis",
    tabLabel: "The Synthesis",
    kicker: "CONCURRENT DUAL PERSPECTIVE",
    badge: "Unified Mind",
    badgeColor: "border-[#c79863]/40 bg-[#c79863]/10 text-[#c79863]",
    glowColor: "rgba(199, 152, 99, 0.15)",
    title: "Engineering at the boundary where physical systems meet neural cognition.",
    narrative:
      "I don't isolate intelligence from mechanics. True autonomy happens when deep mathematical models are forced to survive in physical environments with real sensors, noisy telemetry, and zero latency tolerance.",
    stack: ["ROS2 Humble", "PyTorch", "Embedded C++", "Linux Systems", "Multi-Agent AI", "Cyber Defense"],
  },
  physical: {
    id: "physical",
    tabLabel: "VIT Chennai · Physical",
    kicker: "VIT CHENNAI · B.TECH",
    badge: "Robotics & Perception",
    badgeColor: "border-cyan-400/40 bg-cyan-400/10 text-cyan-400",
    glowColor: "rgba(34, 211, 238, 0.15)",
    title: "Grounding perception & kinematics into deterministic hardware action.",
    narrative:
      "Specializing in autonomous spatial navigation, SLAM, lidar/camera sensor fusion, and embedded control loops. Crafting robot architectures that see, calculate, and safely maneuver through physical spaces.",
    stack: ["ROS2 Perception", "SLAM Navigation", "Sensor Fusion", "Kinematics", "C++20", "Serial Protocols"],
  },
  neural: {
    id: "neural",
    tabLabel: "IIT Madras · Neural",
    kicker: "IIT MADRAS · BS",
    badge: "Data & Inference",
    badgeColor: "border-amber-400/40 bg-amber-400/10 text-amber-300",
    glowColor: "rgba(251, 191, 36, 0.15)",
    title: "Synthesizing high-dimensional data into grounded reasoning & decision models.",
    narrative:
      "Trained in probability theory, statistical machine learning, and deep neural pipelines. Engineering decision-intelligence platforms that transform complex telemetry into reliable, explainable actions.",
    stack: ["Deep Neural Nets", "Telemetry Pipelines", "Statistical Inference", "FastAPI", "Decision Models", "Graph AI"],
  },
};

const telemetryStats = [
  { target: 10, suffix: "+", label: "Projects Built", sub: "Autonomous & Web Systems" },
  { target: 15, suffix: "+", label: "Technologies", sub: "C++, PyTorch, ROS2, Linux" },
  { target: 2, suffix: "", displayVal: "02", label: "Concurrent Degrees", sub: "VIT Chennai × IIT Madras" },
  { target: 3, suffix: "+", displayVal: "03+", label: "Years Craft", sub: "Applied Engineering" },
];

export function PremiumAbout() {
  const sectionRef = useRef<HTMLElement>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sliderPillRef = useRef<HTMLSpanElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const [activeLens, setActiveLens] = useState<LensId>("synthesis");
  const current = lenses[activeLens];

  // Align the sliding indicator pill behind the active tab
  useEffect(() => {
    if (!tabsContainerRef.current || !sliderPillRef.current) return;
    const activeBtn = tabsContainerRef.current.querySelector<HTMLButtonElement>(
      `[data-tab-id="${activeLens}"]`
    );
    if (!activeBtn) return;

    anime({
      targets: sliderPillRef.current,
      left: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
      duration: 320,
      easing: "easeOutElastic(1, 0.8)",
    });
  }, [activeLens]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const consoleEl = consoleRef.current;
    if (!section || !consoleEl) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(consoleEl, { opacity: 1, y: 0 });
      return;
    }

    // PEAK TRANSITIVE MODE: Smooth GSAP Scroll Scrub entrance from Hero
    const ctx = gsap.context(() => {
      gsap.fromTo(
        consoleEl,
        {
          y: 28,
          opacity: 0.2,
          scale: 0.98,
          filter: "blur(4px)",
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            end: "top 35%",
            scrub: 0.75,
          },
        }
      );

      // Kinetic numeric counters triggered smoothly on entrance
      let counterDone = false;
      ScrollTrigger.create({
        trigger: consoleEl,
        start: "top 75%",
        onEnter: () => {
          if (counterDone) return;
          counterDone = true;

          const statEls = consoleEl.querySelectorAll<HTMLElement>("[data-telemetry-num]");
          statEls.forEach((el) => {
            const targetVal = parseFloat(el.getAttribute("data-telemetry-num") || "0");
            const suffix = el.getAttribute("data-telemetry-suffix") || "";
            const displayVal = el.getAttribute("data-telemetry-display");
            if (isNaN(targetVal) || targetVal === 0) return;

            const countObj = { val: 0 };
            anime({
              targets: countObj,
              val: targetVal,
              round: 1,
              duration: 1500,
              easing: "easeOutExpo",
              update: () => {
                if (displayVal && targetVal < 10) {
                  el.textContent = `0${Math.round(countObj.val)}${suffix}`;
                } else {
                  el.textContent = `${Math.round(countObj.val)}${suffix}`;
                }
              },
              complete: () => {
                anime({
                  targets: el,
                  scale: [1, 1.07, 1],
                  duration: 300,
                  easing: "easeOutQuad",
                });
              },
            });
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Smooth lens switch with Anime.js spring physics
  const switchLens = (lensId: LensId) => {
    if (lensId === activeLens) return;
    setActiveLens(lensId);

    if (bodyRef.current) {
      anime.remove(bodyRef.current);
      anime({
        targets: bodyRef.current,
        opacity: [0.2, 1],
        translateY: [6, 0],
        duration: 280,
        easing: "easeOutQuad",
      });

      anime({
        targets: bodyRef.current.querySelectorAll(".lens-stack-pill"),
        opacity: [0, 1],
        scale: [0.93, 1],
        delay: anime.stagger(30),
        duration: 250,
        easing: "easeOutQuad",
      });
    }
  };

  // Interactive mouse spotlight on console
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative px-6 py-10 sm:py-14 calm-about-section overflow-hidden"
    >
      {/* Background matching #0d0b09 with soft atmospheric warmth */}
      <div
        className="absolute inset-0 calm-about-background pointer-events-none"
        aria-hidden="true"
      />

      {/* 1. Transitive Entry Spine (Smooth flow down from Hero) */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="about-transitive-spine" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#c79863] shadow-[0_0_8px_#c79863] -mt-1" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl mt-3">
        {/* Header: Clean, balanced, no orphan words */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 font-mono text-[0.64rem] tracking-[0.22em] text-[#c79863] uppercase">
            <span>02 / PERSPECTIVE</span>
            <span className="text-[#f3efe6]/25">·</span>
            <span>DUAL SCHOLAR</span>
          </div>

          <h2 className="mt-2 text-2xl font-light tracking-tight text-[#f3efe6] sm:text-3xl max-w-lg mx-auto leading-snug text-balance">
            Two disciplines.{" "}
            <em className="font-serif italic font-normal text-[#c79863]">
              One unified instinct
            </em>{" "}
            for building.
          </h2>

          <p className="mx-auto mt-2 max-w-md text-[0.84rem] text-[#f3efe6]/60 text-balance">
            Concurrently training across physical robotics at{" "}
            <span className="text-[#f3efe6] font-medium">VIT Chennai</span> and data intelligence at{" "}
            <span className="text-[#f3efe6] font-medium">IIT Madras</span>.
          </p>
        </div>

        {/* 2. Unified Glassmorphic Console (Small, Crisp & Peak Animative) */}
        <div
          ref={consoleRef}
          onMouseMove={handleMouseMove}
          className="about-console relative"
          style={{
            boxShadow: `0 24px 50px rgba(0,0,0,0.55), 0 0 45px ${current.glowColor}`,
          }}
        >
          {/* Top Bar: Lens Switcher with Animated Sliding Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f3efe6]/[0.08] px-5 py-3.5 sm:px-6">
            <div className="flex items-center gap-1.5 font-mono text-[0.62rem] tracking-wider text-[#f3efe6]/40 uppercase">
              <Sparkles className="h-3 w-3 text-[#c79863]" />
              <span>Perspective Lens</span>
            </div>

            {/* Segmented Control Container */}
            <div
              ref={tabsContainerRef}
              className="relative inline-flex items-center rounded-full border border-[#f3efe6]/10 bg-[#0d0b09]/80 p-1 backdrop-blur-md"
            >
              {/* Animated Sliding Pill Highlight */}
              <span
                ref={sliderPillRef}
                className="absolute top-1 bottom-1 rounded-full bg-[#f3efe6]/10 border border-[#f3efe6]/15 shadow-sm transition-all pointer-events-none"
                style={{ left: 4, width: 90 }}
              />

              <button
                type="button"
                data-tab-id="synthesis"
                onClick={() => switchLens("synthesis")}
                className={`relative z-10 rounded-full px-3 py-1 font-mono text-[0.65rem] font-medium tracking-wide transition-colors duration-200 ${
                  activeLens === "synthesis"
                    ? "text-[#c79863]"
                    : "text-[#f3efe6]/60 hover:text-[#f3efe6]"
                }`}
              >
                The Synthesis
              </button>

              <button
                type="button"
                data-tab-id="physical"
                onClick={() => switchLens("physical")}
                className={`relative z-10 rounded-full px-3 py-1 font-mono text-[0.65rem] font-medium tracking-wide transition-colors duration-200 ${
                  activeLens === "physical"
                    ? "text-cyan-400"
                    : "text-[#f3efe6]/60 hover:text-[#f3efe6]"
                }`}
              >
                VIT Chennai · Physical
              </button>

              <button
                type="button"
                data-tab-id="neural"
                onClick={() => switchLens("neural")}
                className={`relative z-10 rounded-full px-3 py-1 font-mono text-[0.65rem] font-medium tracking-wide transition-colors duration-200 ${
                  activeLens === "neural"
                    ? "text-amber-300"
                    : "text-[#f3efe6]/60 hover:text-[#f3efe6]"
                }`}
              >
                IIT Madras · Neural
              </button>
            </div>
          </div>

          {/* Middle Body: Reactive Lens Content */}
          <div ref={bodyRef} className="px-5 py-5 sm:px-7 sm:py-6 space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[0.68rem] font-semibold tracking-wider text-[#c79863]">
                {current.kicker}
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider ${current.badgeColor}`}
              >
                {current.badge}
              </span>
            </div>

            <h3 className="text-[1.05rem] font-medium tracking-tight text-[#f3efe6] sm:text-lg leading-snug">
              {current.title}
            </h3>

            <p className="text-[0.86rem] leading-relaxed text-[#f3efe6]/75">
              {current.narrative}
            </p>

            {/* Core Stack Pills */}
            <div className="pt-1.5">
              <div className="flex flex-wrap gap-1.5">
                {current.stack.map((tech) => (
                  <span
                    key={tech}
                    className="lens-stack-pill rounded-md border border-[#f3efe6]/[0.08] bg-[#f3efe6]/[0.025] px-2.5 py-1 font-mono text-[0.64rem] text-[#f3efe6]/70 transition-colors duration-200 hover:border-[#c79863]/30 hover:text-[#f3efe6]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Dock: Integrated Precision Telemetry (Clean, Crisp & Unified) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-[#f3efe6]/[0.08] bg-[#0d0b09]/40 divide-y sm:divide-y-0 sm:divide-x divide-[#f3efe6]/[0.07]">
            {telemetryStats.map((item) => (
              <div
                key={item.label}
                className="about-dock-cell p-3.5 sm:p-4 text-left group cursor-default transition-colors hover:bg-[#f3efe6]/[0.03]"
              >
                <div className="flex items-start justify-between">
                  <div
                    data-telemetry-num={item.target > 0 ? item.target : undefined}
                    data-telemetry-suffix={item.suffix}
                    data-telemetry-display={item.displayVal}
                    className="text-2xl font-semibold tracking-tight text-[#f3efe6] transition-colors group-hover:text-[#c79863]"
                  >
                    {item.displayVal || (item.target > 0 ? `0${item.suffix}` : "0")}
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-[#f3efe6]/25 transition-transform group-hover:text-[#c79863] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-1 font-mono text-[0.64rem] uppercase tracking-wider text-[#f3efe6]/80 font-medium">
                  {item.label}
                </div>
                <div className="font-mono text-[0.56rem] tracking-wide text-[#f3efe6]/40 truncate">
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Smooth Transitive Handoff to Projects */}
        <div className="mt-8 flex flex-col items-center">
          <div className="h-6 w-px bg-gradient-to-b from-transparent via-[#c79863]/40 to-transparent" />
          <a
            href="#projects"
            className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[0.62rem] tracking-[0.2em] text-[#f3efe6]/40 uppercase transition-colors hover:text-[#c79863]"
          >
            <span>03 / SELECTED WORK</span>
            <ArrowDown className="h-3 w-3 animate-bounce text-[#c79863]" />
          </a>
        </div>
      </div>
    </section>
  );
}
