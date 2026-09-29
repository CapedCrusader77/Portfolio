import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../utils/cn";
import { Roll, ease } from "./ui";

/* ---------- generative artwork (all code, no photos) ---------- */
function NetworkArt() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
      {[60, 100, 140, 180].map((r, i) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeOpacity={0.5 - i * 0.09} strokeWidth="1.5" strokeDasharray={i % 2 ? "3 9" : undefined} />
      ))}
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur="14s" repeatCount="indefinite" />
        <circle cx="200" cy="60" r="14" fill="var(--art)" />
        <path d="M200 60 L340 200" stroke="currentColor" strokeOpacity="0.35" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" from="360 200 200" to="0 200 200" dur="22s" repeatCount="indefinite" />
        <circle cx="340" cy="200" r="9" fill="currentColor" />
        <rect x="190" y="290" width="20" height="20" fill="var(--art)" transform="rotate(45 200 300)" />
        <path d="M340 200 L200 300" stroke="currentColor" strokeOpacity="0.35" />
      </g>
      <circle cx="200" cy="200" r="42" fill="currentColor" />
      <circle cx="214" cy="190" r="34" fill="var(--art)" className="drift" />
    </svg>
  );
}

function SortArt() {
  return (
    <div className="flex h-full w-full items-end gap-[3%] p-[6%]">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="bar flex-1 rounded-t-md"
          style={{
            animationDelay: `-${i * 0.15}s`,
            animationDuration: `${1.2 + (i % 4) * 0.25}s`,
            background: i % 4 === 0 ? "var(--art)" : "currentColor",
            height: `${30 + ((i * 37) % 60)}%`,
          }}
        />
      ))}
    </div>
  );
}

function PixelArt() {
  const n = 6;
  return (
    <div className="grid h-full w-full grid-cols-6 content-center gap-[3%] p-[4%]">
      {Array.from({ length: n * n }).map((_, i) => {
        const r = Math.floor(i / n);
        const c = i % n;
        const shape = (r + c) % 3;
        return (
          <div
            key={i}
            className="blk aspect-square"
            style={{
              animationDelay: `-${(r + c) * 0.14}s`,
              borderRadius: shape === 0 ? "50%" : shape === 1 ? "0" : "50% 0 50% 0",
              background: shape === 2 ? "var(--art)" : "currentColor",
            }}
          />
        );
      })}
    </div>
  );
}

/* LiDAR sweep: a rotating beam lights up a ring of scan returns */
const SWEEP = 5;
const returns = Array.from({ length: 48 }, (_, i) => {
  const deg = i * 7.5;
  const rad = Math.max(62, Math.min(184, 118 + 58 * Math.sin(i * 0.9) + 24 * Math.cos(i * 2.3)));
  const a = (deg * Math.PI) / 180;
  return { x: 200 + rad * Math.sin(a), y: 200 - rad * Math.cos(a), t: (deg / 360) * SWEEP };
});

function RadarArt() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden>
      {[50, 100, 150, 190].map((r, i) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="currentColor" strokeOpacity={0.32 - i * 0.05} strokeDasharray={i % 2 ? "3 8" : undefined} />
      ))}
      <path d="M200 8 V392 M8 200 H392" stroke="currentColor" strokeOpacity="0.2" />
      {returns.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.2" fill="var(--art)" opacity="0.15">
          <animate attributeName="opacity" values="1;0.15;0.15" keyTimes="0;0.55;1" dur={`${SWEEP}s`} begin={`${(p.t - SWEEP).toFixed(2)}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <g>
        <animateTransform attributeName="transform" type="rotate" from="0 200 200" to="360 200 200" dur={`${SWEEP}s`} repeatCount="indefinite" />
        <path d="M200 200 L200 10 A190 190 0 0 0 91 44.4 Z" fill="var(--art)" opacity="0.28" />
        <path d="M200 200 L200 10" stroke="var(--art)" strokeWidth="2" />
      </g>
      <circle cx="200" cy="200" r="9" fill="currentColor" />
      <circle cx="200" cy="200" r="17" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* ---------- data ---------- */
type Project = {
  n: string;
  title: string;
  kind: string;
  year: string;
  concept: string;
  desc: string;
  points: string[];
  metrics: [string, string][];
  tags: string[];
  repo: string;
  card: string;
  art: ReactNode;
};

const projects: Project[] = [
  {
    n: "01",
    title: "ROOTCAUSE IQ",
    kind: "MULTI-AGENT AI · INCIDENT ANALYSIS",
    year: "2026",
    concept: "Autonomous blast radius mapping & deterministic runbook triage.",
    desc: "Enterprise incident analysis platform that maps blast radius across microservices, retrieves grounded runbooks using RAG, and orchestrates automated remediation via specialized reasoning agents.",
    points: [
      "Dynamic DAG computation for microservice blast radius.",
      "Multi-agent triage routing with deterministic rollback guards to prevent hallucinated actions.",
      "Real-time React Flow telemetry canvas with zero main-thread lag.",
    ],
    metrics: [
      ["98.4%", "BLAST RADIUS ACCURACY"],
      ["< 1.4s", "INCIDENT TRIAGE TIME"],
      ["64%", "MTTR REDUCTION"],
    ],
    tags: ["React 19", "TypeScript", "FastAPI", "LangGraph", "React Flow", "GNNs", "Gemini 1.5 Pro", "ChromaDB"],
    repo: "https://github.com/CapedCrusader77/rootcause-iq",
    card: "bg-acc text-onacc [--art:#f3efe6]",
    art: <NetworkArt />,
  },
  {
    n: "02",
    title: "TRUSTGRAPH",
    kind: "DECISION INTELLIGENCE · RISK SIMULATION",
    year: "2026",
    concept: "Modeling open-source software health beyond GitHub stars.",
    desc: "Decision-intelligence platform that analyzes GitHub telemetry, scores enterprise readiness, simulates upstream dependency supply-chain risks, and generates grounded adoption recommendations.",
    points: [
      "Dependency tree simulation 6 layers deep to uncover hidden circular and unmaintained packages.",
      "Multi-factor health scoring weighing bus factor, issue velocity and security response.",
      "Comparative matrix that synthesizes executive adoption trade-off briefs with Gemini 1.5.",
    ],
    metrics: [
      ["500K+", "DEPENDENCIES SCANNED"],
      ["94.2%", "PREDICTION FIDELITY"],
      ["< 2.8s", "ANALYSIS LATENCY"],
    ],
    tags: ["React", "TypeScript", "FastAPI", "Gemini API", "Statistical ML", "Octokit", "Recharts"],
    repo: "https://github.com/CapedCrusader77/Gen-AI-Hackathon",
    card: "bg-[#ede7dc] text-[#141210] [--art:var(--acc)]",
    art: <SortArt />,
  },
  {
    n: "03",
    title: "SIEGE",
    kind: "CYBER SIMULATION · LIVE THREAT RANGE",
    year: "2026",
    concept: "A cinematic cyber range for security education & attack drills.",
    desc: "Real-time cyber range for security training and drills featuring live WebSocket threat streams, heuristic firewall & IDS rule controls, session telemetry analytics, and Dockerized sandboxing.",
    points: [
      "Sub-10ms packet broadcast engine handling 5,000 events/second via FastAPI WebSockets.",
      "Interactive canvas packet inspector with dynamic protocol decoding and heuristic flagging.",
      "Self-contained Docker Compose sandbox for zero-risk drills across 14+ simulated attack vectors.",
    ],
    metrics: [
      ["5,000+", "THREAT EVENTS / SEC"],
      ["< 8ms", "TELEMETRY LATENCY"],
      ["14+", "ATTACK VECTORS"],
    ],
    tags: ["React 19", "FastAPI", "WebSockets", "Docker Compose", "Scapy", "Raw Sockets"],
    repo: "https://github.com/CapedCrusader77/SEIGE",
    card: "bg-card text-ink ring-1 ring-white/15 [--art:var(--acc)]",
    art: <PixelArt />,
  },
  {
    n: "04",
    title: "SLAM NAVIGATOR",
    kind: "AUTONOMOUS SYSTEMS · PERCEPTION & CONTROL",
    year: "2026",
    concept: "Indoor autonomous traversal with sub-centimeter localization.",
    desc: "Autonomous mobile robot architecture featuring 2D/3D LiDAR SLAM, camera sensor fusion, adaptive A* global planning, and Dynamic Window Approach local obstacle avoidance in ROS2 Humble.",
    points: [
      "Custom C++20 ROS2 node pipeline that minimizes CPU load on Jetson and Raspberry Pi boards.",
      "Extended Kalman Filter fusing LiDAR, IMU and wheel odometry.",
      "Doorway and narrow-corridor recovery behaviors to keep the robot from freezing.",
    ],
    metrics: [
      ["< 1.2cm/m", "LOCALIZATION DRIFT"],
      ["50 Hz", "COSTMAP LOOP"],
      ["< 12ms", "PLANNING LATENCY"],
    ],
    tags: ["ROS2 Humble", "C++20", "Python", "OpenCV", "Nav2", "Gazebo Sim"],
    repo: "https://github.com/CapedCrusader77",
    card: "bg-acc2 text-onacc [--art:#f3efe6]",
    art: <RadarArt />,
  },
];

/* ---------- stacking card ---------- */
function Card({ p, i, n, progress }: { p: Project; i: number; n: number; progress: MotionValue<number> }) {
  const target = 1 - (n - 1 - i) * 0.05;
  const scale = useTransform(progress, [i / n, 1], [1, target]);
  const rotate = useTransform(progress, [i / n, 1], [0, i % 2 ? 1.5 : -1.5]);

  return (
    <div className="sticky top-0 flex h-screen items-center justify-center px-4 md:px-8">
      <motion.article
        className={cn("relative flex h-[80vh] w-full max-w-[1400px] flex-col overflow-hidden border border-current/20 md:h-[80vh] md:flex-row", p.card)}
        style={{ scale, rotate, top: `calc(-4vh + ${i * 22}px)`, transformOrigin: "top center" }}
      >
        <div className="relative h-[24%] w-full shrink-0 border-b border-current/20 md:h-full md:w-[42%] md:border-b-0 md:border-r">
          <div className="absolute inset-0 p-4 md:p-10">{p.art}</div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col justify-between p-4 md:p-10">
          <div className="flex items-start justify-between gap-3 font-mono text-[10px] font-bold tracking-[.18em] md:text-[11px]">
            <span>
              {p.n} / 0{n}
            </span>
            <span className="border border-current px-2.5 py-1 text-right">
              {p.kind} · {p.year}
            </span>
          </div>

          <div>
            <h3 className="font-display text-[9.5vw] font-extrabold leading-[.92] tracking-[-.045em] md:text-[4.4vw]">{p.title}</h3>
            <p className="mt-2 font-serif text-lg italic leading-snug opacity-85 md:mt-3 md:text-2xl">{p.concept}</p>
            <p className="mt-2 line-clamp-3 max-w-xl text-[13px] font-normal leading-relaxed opacity-80 md:mt-4 md:line-clamp-none md:text-[15px]">{p.desc}</p>
            <ul className="tall-only mt-4 max-w-xl space-y-1.5 text-[13px] font-normal leading-snug opacity-80">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-2">
                  <span className="opacity-60">→</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <dl className="grid grid-cols-3 gap-2 border-t border-current/25 pt-3 md:gap-4 md:pt-4">
              {p.metrics.map(([v, l]) => (
                <div key={l}>
                  <dt className="font-display text-xl font-extrabold leading-none tracking-tight md:text-4xl">{v}</dt>
                  <dd className="mt-1.5 font-mono text-[8px] font-bold leading-tight tracking-[.12em] opacity-70 md:text-[10px] md:tracking-[.14em]">{l}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 md:mt-5">
              <ul className="flex max-w-[34rem] flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <li key={t} className="border border-current/50 px-2 py-0.5 font-mono text-[9px] tracking-[.1em] md:px-2.5 md:py-1 md:text-[10px]">
                    {t}
                  </li>
                ))}
              </ul>
              <a href={p.repo} target="_blank" rel="noreferrer" data-cursor="REPO" className="group flex items-center gap-2 font-mono text-[11px] font-bold tracking-[.2em]">
                <Roll text="REPOSITORY" />
                <ArrowUpRight size={16} className="transition-transform duration-500 group-hover:rotate-45" />
              </a>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export default function WorkStack() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section id="work" data-section="WORK" className="relative bg-paper text-ink">
      <div className="flex items-end justify-between px-5 pb-10 pt-28 md:px-10 md:pt-40">
        <motion.h2
          className="font-display text-[14vw] font-extrabold leading-[.85] tracking-[-.05em] md:text-[9vw]"
          initial={{ y: 80, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease }}
        >
          SELECTED
          <br />
          <span className="text-acc">projects</span>
        </motion.h2>
        <div className="mb-2 hidden text-right font-mono text-[11px] font-bold tracking-[.2em] md:block">
          (02) 4 PROJECTS / 2026
          <br />
          SCROLL / VIEW PROJECTS ↓
        </div>
      </div>
      <div ref={ref} className="relative">
        {projects.map((p, i) => (
          <Card key={p.n} p={p} i={i} n={projects.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
