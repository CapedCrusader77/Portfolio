import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import { Roll, ease } from "./ui";

const EMAIL = "gokula.work@gmail.com";
const GITHUB = "https://github.com/CapedCrusader77";
const LINKEDIN = "https://linkedin.com/in/gokul-a";

type Line = { id: number; input?: string; out?: ReactNode };

const skillGroups: [string, string][] = [
  ["robotics", "ROS2 Humble · SLAM · Sensor Fusion (LiDAR + Camera + IMU) · Embedded C++20 · OpenCV · Nav2 · Kinematics · Gazebo Sim · micro-ROS"],
  ["ai", "Python · PyTorch · LangGraph · Multi-Agent RAG · FastAPI · Scikit-Learn · Gemini 1.5 Pro · ChromaDB · Statistical ML · GNNs"],
  ["web", "React 19 · TypeScript · Next.js · WebSockets · Three.js · Canvas 2D · GSAP / Framer Motion · Tailwind · Node.js · PostgreSQL"],
  ["systems", "Linux POSIX · Docker · Scapy · Network Telemetry · Git / CI/CD · Cyber Ranges · Raw Sockets · Alpine Linux"],
];

const projectList: [string, string][] = [
  ["rootcause-iq", "2026 · multi-agent incident analysis & blast-radius mapping"],
  ["trustgraph", "2026 · open-source health scoring & supply-chain risk simulation"],
  ["siege", "2026 · live cyber range for security drills"],
  ["slam-navigator", "2026 · LiDAR SLAM + sensor fusion on ROS2 Humble"],
];

const suggestions = ["help", "about", "education", "skills", "projects", "neofetch", "contact", "theme", "sudo hire me", "clear"];

const helpRows: [string, string][] = [
  ["help", "list every command"],
  ["about", "who is gokul?"],
  ["education", "the dual-degree path"],
  ["skills", "toolkit by domain"],
  ["projects", "project list"],
  ["neofetch", "system info"],
  ["contact", "get in touch"],
  ["theme", "cycle the interface palette"],
  ["cd <page>", "jump to work | transform | about | lab | contact"],
  ["sudo hire me", "open contact email"],
  ["clear", "wipe the screen"],
];

function Pre({ children }: { children: ReactNode }) {
  return <pre className="whitespace-pre-wrap break-words font-mono">{children}</pre>;
}

export default function Terminal({ onTheme }: { onTheme: () => string }) {
  const [lines, setLines] = useState<Line[]>([
    { id: 0, out: <Pre>{"gokul.a portfolio [v2026.1]\ntype 'help' to get started — or tap a command on the right →"}</Pre> },
  ]);
  const [value, setValue] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const add = (input: string, out?: ReactNode) => setLines((l) => [...l, { id: nextId.current++, input, out }]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    if (!cmd) return;
    setHist((h) => [...h, cmd]);
    setHIdx(-1);
    const [name, ...args] = cmd.split(/\s+/);
    const key = name.toLowerCase();

    if (key === "clear") {
      setLines([]);
      return;
    }

    let out: ReactNode;
    switch (key) {
      case "help":
        out = (
          <div className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-0.5">
            {helpRows.map(([c, d]) => (
              <span key={c} className="contents">
                <span className="text-acc">{c}</span>
                <span className="text-white/65">{d}</span>
              </span>
            ))}
          </div>
        );
        break;
      case "about":
      case "whoami":
        out = (
          <Pre>
            {"gokul a — ai & robotics engineer.\nb.tech ai & robotics @ vit chennai · bs data science @ iit madras.\nfocus: autonomous systems, multi-agent ai and decision intelligence."}
          </Pre>
        );
        break;
      case "education":
      case "edu":
        out = (
          <Pre>
            {"2025–2029   B.Tech, Artificial Intelligence & Robotics — VIT Chennai\n2025–now    BS, Data Science & Applications — IIT Madras\ncontinuous  side projects, open source, hackathons"}
          </Pre>
        );
        break;
      case "skills":
        out = (
          <div className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-1.5">
            {skillGroups.map(([k, v]) => (
              <span key={k} className="contents">
                <span className="text-acc2">{k}/</span>
                <span className="text-white/75">{v}</span>
              </span>
            ))}
          </div>
        );
        break;
      case "projects":
      case "ls":
        out = (
          <div className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-0.5">
            {projectList.map(([p, d]) => (
              <span key={p} className="contents">
                <span className="text-acc2">{p}/</span>
                <span className="text-white/65">{d}</span>
              </span>
            ))}
          </div>
        );
        break;
      case "neofetch":
        out = (
          <Pre>
            <span className="text-acc">{"gokul@robotics\n--------------\n"}</span>
            {"OS:       Linux (POSIX)\nHost:     Chennai, India\nDegrees:  B.Tech AI & Robotics · BS Data Science\nFocus:    Autonomous robotics · Multi-agent AI\nStack:    ROS2 · C++20 · Python · React 19\nTheme:    vermilion-on-obsidian\nStatus:   building and testing"}
          </Pre>
        );
        break;
      case "contact":
        out = (
          <div className="space-y-0.5">
            <p>
              email &nbsp;&nbsp;&nbsp;→{" "}
              <a className="text-acc underline underline-offset-4" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
            </p>
            <p>
              github &nbsp;&nbsp;→{" "}
              <a className="text-acc underline underline-offset-4" href={GITHUB} target="_blank" rel="noreferrer">
                @CapedCrusader77
              </a>
            </p>
            <p>
              linkedin →{" "}
              <a className="text-acc underline underline-offset-4" href={LINKEDIN} target="_blank" rel="noreferrer">
                gokul-a
              </a>
            </p>
          </div>
        );
        break;
      case "theme":
      case "palette": {
        const name2 = onTheme();
        out = <Pre>{`palette switched → ${name2}`}</Pre>;
        break;
      }
      case "cd": {
        const target = (args[0] ?? "").replace(/\//g, "").toLowerCase();
        const map: Record<string, string> = { work: "work", projects: "work", transform: "reach", reach: "reach", arm: "reach", about: "about", lab: "lab", contact: "contact", home: "top", "~": "top" };
        const id = map[target];
        if (id) {
          out = <Pre>{`navigating to ${target || "~"} …`}</Pre>;
          window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 350);
        } else {
          out = <Pre>{`cd: no such page: ${args[0] ?? ""}\ntry: work | transform | about | lab | contact`}</Pre>;
        }
        break;
      }
      case "sudo":
        if (args.join(" ").toLowerCase().includes("hire")) {
          out = <Pre>{"[sudo] password for recruiter: ********\naccess granted ✓ — opening your mail client …"}</Pre>;
          window.setTimeout(() => {
            window.location.href = `mailto:${EMAIL}?subject=Project enquiry from portfolio`;
          }, 1100);
        } else {
          out = <Pre>{"nice try. this incident will be reported."}</Pre>;
        }
        break;
      case "echo":
        out = <Pre>{args.join(" ")}</Pre>;
        break;
      case "pwd":
        out = <Pre>{"/home/gokul/portfolio"}</Pre>;
        break;
      case "date":
        out = <Pre>{new Date().toString()}</Pre>;
        break;
      default:
        out = <Pre>{`command not found: ${name}\ntry 'help'`}</Pre>;
    }
    add(cmd, out);
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!hist.length) return;
      const i = hIdx === -1 ? hist.length - 1 : Math.max(0, hIdx - 1);
      setHIdx(i);
      setValue(hist[i]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (hIdx === -1) return;
      const i = hIdx + 1;
      if (i >= hist.length) {
        setHIdx(-1);
        setValue("");
      } else {
        setHIdx(i);
        setValue(hist[i]);
      }
    }
  };

  return (
    <section
      id="terminal"
      data-section="TERMINAL"
      className="theme-light relative z-10 border-y border-ink/15 bg-paper px-5 py-28 text-ink md:px-10 md:py-40"
    >
      <div className="mb-12 flex items-end justify-between gap-6 md:mb-20">
        <motion.h2
          className="font-display text-[14vw] font-extrabold leading-[.85] tracking-[-.05em] md:text-[9vw]"
          initial={{ y: 80, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease }}
        >
          COMMAND LINE
          <br />
          <span className="font-serif font-normal italic">run a query</span>
        </motion.h2>
        <p className="mb-2 hidden text-right font-mono text-[11px] font-bold tracking-[.2em] md:block">
          (06) INTERACTIVE
          <br />
          TYPE A COMMAND ↓
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <motion.div
          className="md:col-span-8"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease }}
        >
          <div
            data-cursor="TYPE"
            onClick={() => input.current?.focus({ preventScroll: true })}
            className="overflow-hidden border border-black/20 bg-[#0d0c0b] text-[#f3efe6] shadow-[0_30px_80px_-24px_rgba(0,0,0,.55)]"
          >
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <i className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <i className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <i className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-3 font-mono text-[11px] text-white/45">gokul@robotics: ~/portfolio — zsh</span>
            </div>
            <div ref={scroller} className="h-[380px] space-y-2 overflow-y-auto overscroll-contain p-4 font-mono text-[13px] font-normal leading-relaxed md:h-[440px] md:p-6 md:text-sm">
              {lines.map((l) => (
                <div key={l.id}>
                  {l.input !== undefined && (
                    <p>
                      <span className="text-acc">gokul@robotics</span>
                      <span className="text-white/40">:</span>
                      <span className="text-acc2">~</span>
                      <span className="text-white/40">$ </span>
                      {l.input}
                    </p>
                  )}
                  {l.out && <div className="mt-1 text-white/85">{l.out}</div>}
                </div>
              ))}
              <div className="flex items-center">
                <span className="shrink-0">
                  <span className="text-acc">gokul@robotics</span>
                  <span className="text-white/40">:</span>
                  <span className="text-acc2">~</span>
                  <span className="text-white/40">$&nbsp;</span>
                </span>
                <input
                  ref={input}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKey}
                  aria-label="Terminal input"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="min-w-0 flex-1 bg-transparent font-mono text-[#f3efe6] caret-[var(--acc)] outline-none"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <aside className="md:col-span-4">
          <p className="mb-5 font-mono text-[11px] font-bold tracking-[.22em]">COMMANDS ↓</p>
          <ul className="flex flex-wrap gap-2.5 md:flex-col md:gap-0 md:border-t-2 md:border-ink">
            {suggestions.map((s) => (
              <li key={s} className="md:border-b md:border-ink/25">
                <button
                  onClick={() => run(s)}
                  data-cursor="RUN"
                  className="group flex w-full items-center justify-between border border-ink px-4 py-2 font-mono text-xs font-bold tracking-[.08em] transition-colors hover:bg-acc hover:text-onacc md:border-0 md:border-b md:border-ink/25 md:px-1 md:py-3.5 md:hover:px-3 md:text-sm md:transition-all"
                >
                  <span>
                    <span className="opacity-40">$ </span>
                    <Roll text={s} />
                  </span>
                  <span className="hidden transition-transform duration-300 group-hover:translate-x-1 md:block">→</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
