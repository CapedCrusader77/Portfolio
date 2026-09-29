import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { cn } from "../utils/cn";
import { Counter, Eyes, ease } from "./ui";

/* ---------- engineering philosophy, revealed word by word ---------- */
const statement =
  "Engineering at the boundary where physical systems meet neural cognition. True *autonomy* means making mathematical models work with real sensors, noisy telemetry and zero *latency* tolerance.";

function Word({ children, progress, range, hl, on }: { children: ReactNode; progress: MotionValue<number>; range: [number, number]; hl: boolean; on: boolean }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={cn("mr-[.24em] inline-block", hl && "hl font-serif font-normal italic", hl && on && "on")}>
      {children}
    </motion.span>
  );
}

function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.5"] });
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const words = statement.split(" ");
  return (
    <p ref={ref} className="max-w-[1300px] font-display text-[7vw] font-semibold leading-[1.04] tracking-[-.035em] md:text-[3.9vw]">
      {words.map((w, i) => (
        <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} hl={w.includes("*")} on={inView}>
          {w.replace(/\*/g, "")}
        </Word>
      ))}
    </p>
  );
}

/* ---------- monitor with eyes that follow you ---------- */
function Monitor() {
  return (
    <motion.div
      className="md:col-span-4"
      initial={{ rotate: -5, scale: 0.9, opacity: 0 }}
      whileInView={{ rotate: -2, scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ type: "spring", stiffness: 180, damping: 16 }}
    >
      <div className="bg-[#0d0c0b] p-5 text-[#f3efe6] shadow-[10px_10px_0_var(--acc)]">
        <div className="relative overflow-hidden border-[6px] border-[#2e2a25] bg-[#161412] p-6">
          <div className="scanlines pointer-events-none absolute inset-0" />
          <Eyes className="relative mx-auto w-4/5" />
          <p className="relative mt-6 text-center font-mono text-xs text-acc">
            <span className="caret">$ ros2 topic echo /pointer</span>
          </p>
        </div>
        <div className="mx-auto mt-3 h-3 w-16 bg-[#2e2a25]" />
        <div className="mx-auto h-2 w-28 bg-[#2e2a25]" />
        <p className="mt-4 text-center font-mono text-[10px] font-bold tracking-[.2em] opacity-60">SENSOR: POINTER · LIVE</p>
      </div>
    </motion.div>
  );
}

/* ---------- stats & facts ---------- */
function Stat({ to, suffix, label }: { to: number; suffix?: string; label: string }) {
  return (
    <motion.div className="border-t-2 border-ink py-5" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }}>
      <p className="font-display text-6xl font-extrabold tracking-[-.04em] md:text-7xl">
        <Counter to={to} suffix={suffix} />
      </p>
      <p className="mt-1 font-mono text-[10px] font-bold tracking-[.2em] opacity-60">{label}</p>
    </motion.div>
  );
}

const facts = [
  ["STUDYING", "B.Tech in Artificial Intelligence & Robotics — VIT Chennai (2025–2029)"],
  ["ALSO", "BS in Data Science & Applications — IIT Madras (2025–present)"],
  ["BASE", "Chennai, India"],
  ["FOCUS", "Autonomous systems, multi-agent AI and decision intelligence"],
];

/* ---------- academic journey ---------- */
const journey = [
  {
    n: "01",
    period: "2025 — 2029",
    title: "B.Tech in Artificial Intelligence & Robotics",
    org: "VIT Chennai",
    text: "Autonomous mobile robotics, micro-ROS systems, forward & inverse kinematics, computer vision pipelines, real-time control loops and sensor fusion.",
  },
  {
    n: "02",
    period: "2025 — PRESENT",
    title: "BS in Data Science & Applications",
    org: "IIT Madras",
    text: "Mathematical foundations of computational statistics, linear algebra, deep learning architectures, high-dimensional probability and scalable decision sciences.",
  },
  {
    n: "03",
    period: "CONTINUOUS",
    title: "Curiosity & Systems Engineering",
    org: "Chennai, India · Everywhere",
    text: "Prototyping side projects, exploring open-source codebases, participating in hackathons and turning theoretical research into reliable code.",
  },
];

function Journey() {
  return (
    <div className="mt-24 md:mt-36">
      <div className="mb-2 flex flex-col justify-between gap-4 border-b-2 border-ink pb-5 md:flex-row md:items-end">
        <div>
            <p className="font-mono text-[11px] font-bold tracking-[.22em] opacity-60">EDUCATION / 2025 — PRESENT</p>
          <h3 className="mt-2 font-display text-4xl font-extrabold tracking-[-.04em] md:text-6xl">
            CONCURRENT STUDY
          </h3>
        </div>
          <p className="font-mono text-[10px] font-bold tracking-[.2em] opacity-65">VIT CHENNAI × IIT MADRAS</p>
      </div>
      <ol>
        {journey.map((j, i) => (
          <motion.li
            key={j.n}
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8%" }}
            transition={{ duration: 0.7, ease, delay: i * 0.06 }}
            data-cursor="EDU"
            className="grid gap-4 border-b border-ink/25 px-1 py-7 transition-all duration-500 hover:bg-ink hover:px-5 hover:text-paper md:grid-cols-12 md:gap-8 md:py-9"
          >
            <div className="font-mono text-[11px] font-bold tracking-[.2em] md:col-span-2">
              <p className="opacity-50">{j.n}</p>
              <p className="mt-1">{j.period}</p>
            </div>
            <div className="md:col-span-5">
              <h4 className="font-display text-2xl font-extrabold leading-[1.05] tracking-tight md:text-4xl">{j.title}</h4>
              <p className="mt-2 font-serif text-lg italic opacity-75 md:text-xl">{j.org}</p>
            </div>
            <p className="text-sm font-normal leading-relaxed opacity-80 md:col-span-5 md:text-base">{j.text}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- toolchain architecture matrix + live module inspector ---------- */
type ToolSpec = {
  code: string;
  name: string;
  layer: string;
  used: number;
  items: string;
  summary: string;
  output: string;
};

type ToolLayer = { id: string; label: string; note: string; tools: ToolSpec[] };

const toolLayers: ToolLayer[] = [
  {
    id: "01",
    label: "AUTONOMOUS ROBOTICS",
    note: "Perception, planning & control",
    tools: [
      {
        code: "L1.01",
        name: "ROS2 · Nav2 · SLAM",
        layer: "AUTONOMOUS ROBOTICS",
        used: 1,
        items: "ROS2 Humble · Nav2 · micro-ROS · SLAM",
        summary: "Custom C++20 node pipeline for 2D/3D LiDAR SLAM with adaptive A* global planning and Dynamic Window Approach obstacle avoidance.",
        output: "SLAM NAVIGATOR",
      },
      {
        code: "L1.02",
        name: "Sensor Fusion · EKF",
        layer: "AUTONOMOUS ROBOTICS",
        used: 1,
        items: "LiDAR + Camera + IMU · Kinematics",
        summary: "Extended Kalman Filter fusing LiDAR, IMU and wheel odometry for sub-centimeter localization — under 1.2 cm/m drift.",
        output: "SLAM NAVIGATOR",
      },
      {
        code: "L1.03",
        name: "C++20 · OpenCV",
        layer: "AUTONOMOUS ROBOTICS",
        used: 1,
        items: "Embedded C++20 · OpenCV · Gazebo Sim",
        summary: "Lean embedded pipelines for Jetson and Raspberry Pi boards, validated in Gazebo Sim before touching hardware.",
        output: "SLAM NAVIGATOR",
      },
    ],
  },
  {
    id: "02",
    label: "AI & DECISION INTELLIGENCE",
    note: "Agents, retrieval & inference",
    tools: [
      {
        code: "L2.01",
        name: "LangGraph · Multi-Agent RAG",
        layer: "AI & DECISION INTELLIGENCE",
        used: 1,
        items: "LangGraph · RAG · ChromaDB · Embeddings",
        summary: "Specialized reasoning agents with deterministic rollback guards, grounded in runbooks retrieved from a vector store.",
        output: "ROOTCAUSE IQ",
      },
      {
        code: "L2.02",
        name: "Gemini 1.5 · FastAPI",
        layer: "AI & DECISION INTELLIGENCE",
        used: 2,
        items: "Gemini 1.5 Pro · FastAPI · Python",
        summary: "Grounded incident triage and executive adoption briefs, served through low-latency FastAPI backends.",
        output: "ROOTCAUSE IQ · TRUSTGRAPH",
      },
      {
        code: "L2.03",
        name: "PyTorch · GNNs · Scikit-Learn",
        layer: "AI & DECISION INTELLIGENCE",
        used: 2,
        items: "PyTorch · Scikit-Learn · Graph Neural Networks",
        summary: "Graph neural networks for blast-radius mapping and statistical inference for multi-factor health scoring.",
        output: "ROOTCAUSE IQ · TRUSTGRAPH",
      },
    ],
  },
  {
    id: "03",
    label: "INTERFACES & WEB",
    note: "Real-time interfaces that stay fast",
    tools: [
      {
        code: "L3.01",
        name: "React 19 · TypeScript",
        layer: "INTERFACES & WEB",
        used: 3,
        items: "React 19 · TypeScript · Next.js · Tailwind",
        summary: "Typed, component-driven front ends for telemetry-heavy products — this portfolio included.",
        output: "ROOTCAUSE IQ · TRUSTGRAPH · SIEGE",
      },
      {
        code: "L3.02",
        name: "React Flow · Recharts",
        layer: "INTERFACES & WEB",
        used: 2,
        items: "React Flow · Recharts · Framer Motion · GSAP",
        summary: "A live telemetry canvas with zero main-thread lag and comparative matrices that read at a glance.",
        output: "ROOTCAUSE IQ · TRUSTGRAPH",
      },
      {
        code: "L3.03",
        name: "WebSockets · Canvas 2D",
        layer: "INTERFACES & WEB",
        used: 1,
        items: "WebSockets · Canvas 2D · Three.js · Node.js · PostgreSQL",
        summary: "Sub-10ms packet broadcast at 5,000 events per second, with an interactive canvas packet inspector.",
        output: "SIEGE",
      },
    ],
  },
  {
    id: "04",
    label: "SYSTEMS & SECURITY",
    note: "POSIX, sandboxes & defensive security",
    tools: [
      {
        code: "L4.01",
        name: "Docker · Alpine Linux",
        layer: "SYSTEMS & SECURITY",
        used: 1,
        items: "Docker Compose · Alpine Linux · Linux POSIX",
        summary: "Self-contained sandboxes enabling zero-risk exploitation drills across 14+ simulated attack vectors.",
        output: "SIEGE",
      },
      {
        code: "L4.02",
        name: "Scapy · Raw Sockets",
        layer: "SYSTEMS & SECURITY",
        used: 1,
        items: "Scapy · Raw Sockets · Network Telemetry",
        summary: "Dynamic protocol decoding and heuristic flagging for packet-level security training.",
        output: "SIEGE",
      },
      {
        code: "L4.03",
        name: "Git · CI/CD",
        layer: "SYSTEMS & SECURITY",
        used: 4,
        items: "Git · CI/CD · Cyber Ranges",
        summary: "Version control and automated pipelines behind every project on this page.",
        output: "ALL FOUR PROJECTS",
      },
    ],
  },
];

function ToolchainMatrix() {
  const [active, setActive] = useState<ToolSpec>(toolLayers[0].tools[0]);

  return (
    <div className="mt-24 md:mt-36">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b-2 border-ink pb-5 md:flex-row md:items-end">
        <div>
          <p className="font-mono text-[11px] font-bold tracking-[.22em] opacity-60">TOOLS / 4 DOMAINS</p>
          <h3 className="mt-2 font-display text-4xl font-extrabold tracking-[-.04em] md:text-6xl">
            ENGINEERING STACK
          </h3>
        </div>
        <p className="font-mono text-[10px] font-bold tracking-[.2em] opacity-65">12 TOOLS · SELECT ONE TO INSPECT</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Live Module Inspector */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 flex h-full flex-col justify-between border-2 border-ink bg-[#0d0c0b] p-6 text-[#f3efe6] shadow-[8px_8px_0_var(--acc)]">
            <div>
              <div className="flex items-center justify-between border-b border-white/15 pb-3 font-mono text-[10px] font-bold tracking-[.2em]">
                <span className="flex items-center gap-2 text-acc">
                  <span className="h-2 w-2 bg-acc" />
                  MODULE INSPECTOR
                </span>
                <span className="text-white/50">{active.code}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={active.code} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }} className="mt-6">
                  <p className="font-mono text-[10px] tracking-[.2em] text-white/50">{active.layer}</p>
                  <h4 className="mt-1 font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-[#f3efe6] md:text-4xl">{active.name}</h4>
                  <p className="mt-4 text-sm leading-relaxed text-white/80 md:text-base">{active.summary}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-8 space-y-4 border-t border-white/15 pt-4 font-mono text-[11px]">
              <div>
                <div className="mb-1.5 flex justify-between tracking-[.16em]">
                  <span className="text-white/50">PROJECT COVERAGE</span>
                  <span className="text-acc">{active.used} / 4</span>
                </div>
                <div className="h-2 w-full bg-white/10">
                  <motion.div className="h-full bg-acc" initial={false} animate={{ width: `${(active.used / 4) * 100}%` }} transition={{ duration: 0.4, ease }} />
                </div>
              </div>

              <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-3 tracking-[.14em]">
                <span className="shrink-0 text-white/50">INCLUDES</span>
                <span className="text-right font-bold leading-relaxed">{active.items}</span>
              </div>
              <div className="flex items-start justify-between gap-4 border-t border-white/10 pt-3 tracking-[.14em]">
                <span className="shrink-0 text-white/50">SHIPPED IN</span>
                <span className="text-right font-bold leading-relaxed text-acc2">{active.output}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4-layer architectural grid */}
        <div className="divide-y-2 divide-ink border-2 border-ink bg-card lg:col-span-8">
          {toolLayers.map((layer) => (
            <div key={layer.id} className="grid md:grid-cols-12">
              <div className="flex flex-col justify-between border-b border-ink/20 bg-paper/60 p-4 md:col-span-4 md:border-b-0 md:border-r-2 md:border-ink md:p-5">
                <div className="flex items-center justify-between font-mono text-[10px] font-bold tracking-[.2em] opacity-60">
                  <span>SYS.{layer.id}</span>
                  <span>03 UNITS</span>
                </div>
                <div className="my-3">
                  <p className="font-display text-xl font-extrabold leading-tight tracking-tight">{layer.label}</p>
                  <p className="mt-1 font-serif text-base italic opacity-75">{layer.note}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 divide-y divide-ink/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0 md:col-span-8">
                {layer.tools.map((tool) => {
                  const isSelected = active.code === tool.code;
                  return (
                    <button
                      key={tool.code}
                      type="button"
                      data-cursor="SPEC"
                      onMouseEnter={() => setActive(tool)}
                      onFocus={() => setActive(tool)}
                      onClick={() => setActive(tool)}
                      className={cn("group relative flex flex-col justify-between p-4 text-left transition-colors duration-300 md:p-5", isSelected ? "bg-[#0d0c0b] text-[#f3efe6]" : "hover:bg-ink/5")}
                    >
                      <div className="flex w-full items-center justify-between font-mono text-[10px] tracking-[.18em]">
                        <span className={cn("font-bold", isSelected ? "text-acc" : "opacity-50")}>{tool.code}</span>
                        <span className={cn("border px-1.5 py-0.5 text-[9px] font-bold", isSelected ? "border-acc text-acc" : "border-current/30 opacity-70")}>{tool.used}/4</span>
                      </div>

                      <div className="my-5">
                        <p className="font-display text-lg font-extrabold leading-tight tracking-tight md:text-xl">{tool.name}</p>
                      </div>

                      <div className="w-full">
                        <div className="mb-1 flex justify-between font-mono text-[9px] tracking-[.15em] opacity-60">
                          <span>USED IN</span>
                          <span>{tool.used} / 4 PROJECTS</span>
                        </div>
                        <div className={cn("h-1 w-full overflow-hidden", isSelected ? "bg-white/15" : "bg-ink/15")}>
                          <div className={cn("h-full transition-all duration-500", isSelected ? "bg-acc" : "bg-ink")} style={{ width: `${(tool.used / 4) * 100}%` }} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- process squiggle drawn by scroll ---------- */
const steps = [
  { t: 0.04, x: 3, y: 58, label: "MODEL", sub: "the math, on paper first" },
  { t: 0.36, x: 34, y: 55, label: "SIMULATE", sub: "Gazebo before hardware" },
  { t: 0.68, x: 66, y: 50, label: "INTEGRATE", sub: "real sensors, real noise" },
  { t: 0.97, x: 97, y: 50, label: "DEPLOY", sub: "measure, then iterate" },
];
const squiggle = "M 0 120 C 120 20, 220 20, 340 110 S 560 210, 660 100 S 880 -10, 1000 100";

function Marker({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const s = steps[i];
  const scale = useTransform(progress, [Math.max(0, s.t - 0.06), s.t], [0, 1]);
  return (
    <motion.div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: `${s.x}%`, top: `${s.y}%`, scale }}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-ink bg-acc font-mono text-xs font-bold text-onacc md:h-16 md:w-16">0{i + 1}</span>
      <span className="mt-3 font-display text-lg font-extrabold tracking-tight md:text-2xl">{s.label}</span>
      <span className="font-serif text-base italic opacity-70 md:text-lg">{s.sub}</span>
    </motion.div>
  );
}

function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  return (
    <div className="mt-28 md:mt-40">
      <p className="mb-16 font-mono text-[11px] font-bold tracking-[.22em]">HOW A SYSTEM GETS BUILT ↓</p>
      <div ref={ref} className="relative mx-6 h-[260px] md:mx-12 md:h-[320px]">
        <svg viewBox="0 0 1000 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <path d={squiggle} fill="none" stroke="var(--ink)" strokeOpacity="0.14" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <motion.path d={squiggle} fill="none" stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ pathLength: progress }} />
        </svg>
        {steps.map((_, i) => (
          <Marker key={i} i={i} progress={progress} />
        ))}
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" data-section="ABOUT" className="theme-light relative z-10 border-y border-ink/15 bg-paper px-5 py-28 text-ink md:px-10 md:py-44">
      <div className="mb-10 flex items-center gap-3 font-mono text-[11px] font-bold tracking-[.22em]">
        <span className="h-2 w-2 rounded-full bg-ink" />
        (04) ABOUT — GOKUL A
      </div>

      <Statement />

      <div className="mt-20 grid gap-10 md:mt-32 md:grid-cols-12">
        <Monitor />

        <div className="grid gap-10 md:col-span-8 md:grid-cols-2 md:gap-14">
          <div className="grid grid-cols-2 gap-x-6">
            <Stat to={2} label="CONCURRENT DEGREES" />
            <Stat to={4} label="SELECTED PROJECTS" />
            <Stat to={14} suffix="+" label="ATTACK VECTORS SIMULATED" />
            <Stat to={500} suffix="K+" label="DEPENDENCIES SCANNED" />
          </div>
          <dl className="space-y-7 border-t-2 border-ink pt-6">
            {facts.map(([k, v], i) => (
              <motion.div key={k} initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease, delay: i * 0.08 }}>
                <dt className="font-mono text-[10px] font-bold tracking-[.2em] opacity-60">{k}</dt>
                <dd className="mt-1 text-lg font-normal leading-snug md:text-xl">{v}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>

      <Journey />

      <ToolchainMatrix />

      <Process />
    </section>
  );
}
