import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Brain, Layers, Server, ShieldCheck, Cpu, Sparkles, Activity, Terminal } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type SkillPair = {
  id: string;
  focus: string;
  technology: string;
  supporting: string;
  accent: string;
};

const relationshipPairs: SkillPair[] = [
  { id: "ai", focus: "AI", technology: "Python", supporting: "Machine Learning", accent: "#a78bfa" },
  { id: "robotics", focus: "Robotics", technology: "C/C++", supporting: "ROS2", accent: "#22d3ee" },
  { id: "frontend", focus: "Frontend", technology: "React", supporting: "TypeScript", accent: "#60a5fa" },
  { id: "backend", focus: "Backend", technology: "Node.js", supporting: "PostgreSQL", accent: "#a78bfa" },
  { id: "security", focus: "Security", technology: "Linux", supporting: "Cybersecurity", accent: "#22d3ee" },
  { id: "data", focus: "Data", technology: "Pandas", supporting: "Data Science", accent: "#60a5fa" },
  { id: "systems", focus: "Systems", technology: "Docker", supporting: "Git", accent: "#c79863" },
];

interface SkillItem {
  name: string;
  level: string;
  tags: string[];
}

interface DomainArchitecture {
  id: string;
  code: string;
  categoryTag: string;
  title: string;
  subtitle: string;
  accent: string;
  icon: typeof Brain;
  telemetry: string;
  profile: string;
  skills: SkillItem[];
}

const skillDomains: DomainArchitecture[] = [
  {
    id: "ai-robotics",
    code: "01 // NEURAL",
    categoryTag: "Intelligent Systems",
    title: "AI / Robotics",
    subtitle: "Deep learning models, computer vision & embedded robotics control.",
    accent: "#22d3ee",
    icon: Brain,
    telemetry: "INFERENCE < 14MS",
    profile: "NEURAL & REAL-TIME EMBEDDED",
    skills: [
      { name: "Python", level: "Expert", tags: ["PyTorch", "NumPy", "OpenCV", "FastAPI"] },
      { name: "Machine Learning", level: "Advanced", tags: ["Deep Learning", "Vision", "LLMs", "NLP"] },
      { name: "Robotics", level: "Specialized", tags: ["ROS2", "Kinematics", "Microcontrollers", "Sensors"] },
      { name: "C / C++", level: "Advanced", tags: ["Real-Time", "Embedded", "Low-Latency", "Algorithms"] },
    ],
  },
  {
    id: "frontend",
    code: "02 // INTERFACE",
    categoryTag: "Design & Interaction",
    title: "Frontend Engineering",
    subtitle: "Dynamic 3D canvas, reactive state architecture & fluid micro-interactions.",
    accent: "#38bdf8",
    icon: Layers,
    telemetry: "FLUID 120 FPS",
    profile: "GRAPHICS & INTERACTIVE UI",
    skills: [
      { name: "React 19", level: "Expert", tags: ["Hooks", "Concurrent", "Server Components", "State"] },
      { name: "TypeScript", level: "Expert", tags: ["Generics", "Type Safety", "Utility Types", "AST"] },
      { name: "Next.js", level: "Advanced", tags: ["App Router", "SSR / SSG", "Edge Runtime", "SEO"] },
      { name: "Tailwind CSS", level: "Expert", tags: ["GSAP", "Motion", "Design Tokens", "Shaders"] },
    ],
  },
  {
    id: "backend",
    code: "03 // RUNTIME",
    categoryTag: "Cloud & Data Systems",
    title: "Backend Infrastructure",
    subtitle: "High-throughput asynchronous APIs, relational & document datastores.",
    accent: "#c79863",
    icon: Server,
    telemetry: "99.99% UPSTREAM",
    profile: "HIGH-CONCURRENCY MICROSERVICES",
    skills: [
      { name: "Node.js", level: "Expert", tags: ["Event Loop", "Express", "Async Streams", "REST"] },
      { name: "PostgreSQL", level: "Advanced", tags: ["ACID", "Prisma ORM", "Indexing", "Optimized SQL"] },
      { name: "MongoDB", level: "Advanced", tags: ["NoSQL", "Aggregations", "Sharding", "Mongoose"] },
      { name: "GraphQL", level: "Advanced", tags: ["Apollo", "Subscriptions", "Schemas", "WebSockets"] },
    ],
  },
  {
    id: "systems-security",
    code: "04 // SECURITY",
    categoryTag: "DevOps & Core OS",
    title: "Systems / Security",
    subtitle: "POSIX server administration, isolated containerization & defensive security.",
    accent: "#10b981",
    icon: ShieldCheck,
    telemetry: "HARDENED PROTOCOLS",
    profile: "CONTAINERIZED & DEFENSIVE ARCHITECTURE",
    skills: [
      { name: "Linux OS", level: "Advanced", tags: ["Bash Scripting", "Kernel Tuning", "POSIX", "SysAdmin"] },
      { name: "Docker", level: "Advanced", tags: ["Compose", "Multi-stage", "Isolation", "CI/CD"] },
      { name: "Git", level: "Expert", tags: ["GitOps", "Actions", "Branch Topologies", "Workflows"] },
      { name: "Cybersecurity", level: "Advanced", tags: ["Auth / JWT", "OWASP", "PenTesting", "Encryption"] },
    ],
  },
];

export function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const header = sectionRef.current?.querySelector<HTMLElement>("[data-skills-header]");
      const centerLine = sectionRef.current?.querySelector<HTMLElement>("[data-skills-center-line]");
      const connector = sectionRef.current?.querySelector<HTMLElement>("[data-skill-connector]");
      const scanner = sectionRef.current?.querySelector<HTMLElement>(".split-skills-scanner");
      const leftColumn = sectionRef.current?.querySelector<HTMLElement>("[data-skills-left]");
      const rightColumn = sectionRef.current?.querySelector<HTMLElement>("[data-skills-right]");
      const matrixWrap = sectionRef.current?.querySelector<HTMLElement>("[data-skills-matrix]");
      const experienceLine = sectionRef.current?.querySelector<HTMLElement>("[data-skill-experience-line]");
      const footerStatus = sectionRef.current?.querySelector<HTMLElement>("[data-skill-footer-status]");
      const leftRows = gsap.utils.toArray<HTMLElement>("[data-skill-left-row]");
      const rightRows = gsap.utils.toArray<HTMLElement>("[data-skill-right-row]");
      const leftLabels = gsap.utils.toArray<HTMLElement>("[data-skill-left-label]");
      const rightLabels = gsap.utils.toArray<HTMLElement>("[data-skill-right-label]");
      const mobilePairs = gsap.utils.toArray<HTMLElement>("[data-mobile-skill-pair]");
      const activeIndex = sectionRef.current?.querySelector<HTMLElement>("[data-skill-active-index]");
      const activeLabel = sectionRef.current?.querySelector<HTMLElement>("[data-skill-active-label]");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!header || !centerLine || !connector || !scanner || !leftColumn || !rightColumn || !matrixWrap || !experienceLine || !activeIndex || !activeLabel || reduceMotion) return;

      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const firstRow = leftRows[0];
      const secondRow = leftRows[1];
      const step = secondRow && firstRow ? Math.abs(secondRow.offsetTop - firstRow.offsetTop) : (isMobile ? 64 : 104);
      const travel = step * (isMobile ? 1.5 : relationshipPairs.length - 1);
      let lastActiveIndex = -1;

      gsap.set(header, { opacity: 1, y: 0 });
      gsap.set(centerLine, { opacity: 1, scaleY: 1 });
      gsap.set(connector, { opacity: 1, scaleX: 1, transformOrigin: "center center" });
      gsap.set(scanner, { opacity: 1, scale: 1 });
      gsap.set(matrixWrap, { opacity: 0, y: 24, scale: 0.98, pointerEvents: "none" });
      gsap.set(experienceLine, { opacity: 0, scaleY: 0, transformOrigin: "top center" });
      gsap.set([leftColumn, rightColumn], { opacity: isMobile ? 0 : 0.82, y: 0 });
      gsap.set([...leftLabels, ...rightLabels], { opacity: isMobile ? 0.78 : 0.3, scale: 1, color: "rgba(243,239,230,0.5)" });
      gsap.set([leftLabels[0], rightLabels[0]], { opacity: 1, scale: 1.1, color: relationshipPairs[0].accent });
      gsap.set(mobilePairs, { opacity: 0, y: 14 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const choreographyProgress = gsap.utils.clamp(0, 1, (self.progress - 0.15) / 0.58);
            const nextIndex = Math.min(relationshipPairs.length - 1, Math.floor(choreographyProgress * relationshipPairs.length));
            if (nextIndex !== lastActiveIndex) {
              lastActiveIndex = nextIndex;
              const pair = relationshipPairs[nextIndex];
              activeIndex.textContent = String(nextIndex + 1).padStart(2, "0");
              activeLabel.textContent = `${pair.focus} × ${pair.technology}`;
            }

            if (footerStatus) {
              if (self.progress >= 0.76) {
                footerStatus.textContent = "QUANTUM ARCHITECTURE MATRIX";
              } else {
                footerStatus.textContent = "SCROLL TO ALIGN STACK";
              }
            }
          },
        },
      });

      timeline
        .to(header, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0)
        .to(centerLine, { opacity: 1, scaleY: 1, duration: 0.12, ease: "power2.out" }, 0.08)
        .to([leftColumn, rightColumn], { opacity: 1, duration: 0.12, ease: "power2.out" }, 0.12)
        .to(scanner, { opacity: 1, scale: 1, duration: 0.1, ease: "power2.out" }, 0.12)
        .to(header, { opacity: 0, y: -42, duration: 0.14, ease: "power2.in" }, 0.28);

      if (isMobile) {
        timeline
          .to([leftColumn, rightColumn, connector, centerLine, scanner], { opacity: 0, duration: 0.12 }, 0.22)
          .to(mobilePairs, { opacity: 1, y: 0, stagger: 0.06, duration: 0.2, ease: "power2.out" }, 0.24)
          .to(matrixWrap, { opacity: 1, y: 0, scale: 1, pointerEvents: "auto", duration: 0.2, ease: "power2.out" }, 0.7)
          .to(experienceLine, { opacity: 1, scaleY: 1, duration: 0.16, ease: "power2.out" }, 0.9);
      } else {
        timeline
          .to(leftColumn, { y: -travel, duration: 0.54, ease: "none" }, 0.18)
          .to(rightColumn, { y: travel, duration: 0.54, ease: "none" }, 0.18);

        relationshipPairs.forEach((pair, index) => {
          const pairStart = 0.18 + (index / (relationshipPairs.length - 1)) * 0.52;
          timeline
            .to([leftLabels[index], rightLabels[index]], { opacity: 1, scale: 1.1, color: pair.accent, duration: 0.06, ease: "power2.out" }, pairStart)
            .to(connector, { opacity: 1, scaleX: 1, duration: 0.05, ease: "power2.out" }, pairStart)
            .to([leftLabels[index], rightLabels[index]], { opacity: 0.34, scale: 0.95, color: "rgba(243,239,230,0.5)", duration: 0.07, ease: "power2.in" }, pairStart + 0.08)
            .to(connector, { opacity: 0, scaleX: 0, duration: 0.05, ease: "power2.in" }, pairStart + 0.09);
        });

        // Hide columns, center crosshair line, connector, and the floating scanner badge completely!
        timeline
          .to([leftColumn, rightColumn, scanner, connector, centerLine], { opacity: 0, scale: 0.92, duration: 0.12, ease: "power2.in" }, 0.74)
          .to(matrixWrap, { opacity: 1, y: 0, scale: 1, pointerEvents: "auto", duration: 0.18, ease: "power2.out" }, 0.78)
          .to(experienceLine, { opacity: 1, scaleY: 1, duration: 0.16, ease: "power2.out" }, 0.94);
      }

      return () => timeline.scrollTrigger?.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const rowStyle = (index: number, direction: "left" | "right") => ({
    "--skill-offset": `${(direction === "left" ? index : -index) * 6.4}rem`,
  } as CSSProperties & { "--skill-offset": string });

  const displayedDomains = activeFilter === "all"
    ? skillDomains
    : skillDomains.filter(d => d.id === activeFilter);

  return (
    <section ref={sectionRef} id="skills" className="split-skills-shell">
      <div className="split-skills-sticky">
        <header data-skills-header className="split-skills-header">
          <div>
            <span className="sequence-kicker">TECHNICAL STACK / 04</span>
            <h2 className="mt-3 text-4xl font-bold uppercase leading-[0.86] tracking-[-0.06em] text-white md:text-7xl">
              The tools<br />behind the work.
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm leading-relaxed text-gray-500 md:block">
            Capabilities on the left. The systems that make them real on the right.
          </p>
        </header>

        {/* Alignment scroll stage with center crosshair */}
        <div className="split-skills-stage">
          <div data-skills-center-line className="split-skills-center-line" aria-hidden="true" />
          <div data-skill-connector className="split-skills-connector" aria-hidden="true"><span /></div>
          <div className="split-skills-scanner" aria-hidden="true">
            <span data-skill-active-index>01</span>
            <span data-skill-active-label>AI × Python</span>
          </div>

          <div data-skills-left className="split-skills-column split-skills-left">
            {relationshipPairs.map((pair, index) => (
              <div key={pair.id} data-skill-left-row className="split-skill-row" style={rowStyle(index, "left")}>
                <span className="split-skill-row-number">0{index + 1}</span>
                <span data-skill-left-label={index}>{pair.focus}</span>
              </div>
            ))}
          </div>
          <div data-skills-right className="split-skills-column split-skills-right">
            {relationshipPairs.map((pair, index) => (
              <div key={pair.id} data-skill-right-row className="split-skill-row" style={rowStyle(index, "right")}>
                <span data-skill-right-label={index}>{pair.technology}</span>
                <span className="split-skill-support">{pair.supporting}</span>
              </div>
            ))}
          </div>

          <div className="split-skills-mobile-pairs">
            {relationshipPairs.map((pair, index) => (
              <div key={pair.id} data-mobile-skill-pair className="split-skills-mobile-pair">
                <span style={{ color: pair.accent }}>0{index + 1}</span>
                <strong>{pair.focus}</strong>
                <i>→</i>
                <b>{pair.technology}</b>
                <small>{pair.supporting}</small>
              </div>
            ))}
          </div>
        </div>

        {/* Futuristic Quantum Architecture Bento Matrix */}
        <div data-skills-matrix className="skills-matrix-wrap">
          <div className="skills-matrix-topbar">
            <div className="skills-matrix-meta">
              <span className="skills-matrix-pulse" />
              <span className="skills-matrix-kicker">Quantum Engineering Matrix</span>
              <span className="skills-matrix-badge-live">Live Architecture</span>
            </div>

            <div className="skills-matrix-tabs" role="tablist">
              <button
                type="button"
                className={`skills-matrix-tab ${activeFilter === "all" ? "is-active" : ""}`}
                onClick={() => setActiveFilter("all")}
              >
                All Domains (4)
              </button>
              {skillDomains.map((domain) => (
                <button
                  key={domain.id}
                  type="button"
                  className={`skills-matrix-tab ${activeFilter === domain.id ? "is-active" : ""}`}
                  onClick={() => setActiveFilter(domain.id)}
                >
                  {domain.title}
                </button>
              ))}
            </div>
          </div>

          <div className={`skills-matrix-grid ${activeFilter !== "all" ? "single-mode" : ""}`}>
            {displayedDomains.map((domain) => {
              const IconComponent = domain.icon;
              return (
                <div
                  key={domain.id}
                  className="skills-bento-card group"
                  style={{ "--card-accent": domain.accent } as CSSProperties}
                >
                  <div className="skills-bento-ambient" />

                  <div className="skills-bento-header">
                    <div className="skills-bento-title-block">
                      <div className="skills-bento-code-row">
                        <span className="skills-bento-code">{domain.code}</span>
                        <span className="skills-bento-category-tag">• {domain.categoryTag}</span>
                      </div>
                      <h3 className="skills-bento-title">{domain.title}</h3>
                      <p className="skills-bento-subtitle">{domain.subtitle}</p>
                    </div>

                    <div className="skills-bento-icon-box">
                      <IconComponent />
                    </div>
                  </div>

                  <div className="skills-bento-chips">
                    {domain.skills.map((skill) => (
                      <div key={skill.name} className="skills-chip">
                        <div className="skills-chip-head">
                          <span className="skills-chip-name">{skill.name}</span>
                          <span className="skills-chip-level">{skill.level}</span>
                        </div>
                        <div className="skills-chip-tags">
                          {skill.tags.map((tag, i) => (
                            <span key={tag} className="skills-chip-tag">
                              {tag}{i < skill.tags.length - 1 ? " •" : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="skills-bento-footer">
                    <div className="skills-bento-telemetry">
                      <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                      <span>Telemetry:</span>
                      <span className="skills-bento-telemetry-val">{domain.telemetry}</span>
                    </div>
                    <span className="skills-bento-profile">{domain.profile}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div data-skill-experience-line className="split-skills-experience-line" aria-hidden="true"><span /></div>
        <div className="split-skills-footer">
          <span data-skill-footer-status>SCROLL TO ALIGN STACK</span>
          <span>07 / 07 ARCHITECTURE</span>
        </div>
      </div>
    </section>
  );
}
