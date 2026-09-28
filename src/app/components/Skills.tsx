import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SkillPair = {
  id: string;
  focus: string;
  technology: string;
  supporting: string;
  accent: string;
};

const relationshipPairs: SkillPair[] = [
  { id: "ai", focus: "Multi-Agent AI", technology: "Python", supporting: "LangGraph · Gemini", accent: "#86bdd8" },
  { id: "robotics", focus: "Autonomous Robotics", technology: "ROS2 Humble", supporting: "LiDAR SLAM · C++20", accent: "#e2b887" },
  { id: "decision", focus: "Decision Intel", technology: "Statistical Models", supporting: "FastAPI · Scikit-Learn", accent: "#86bdd8" },
  { id: "security", focus: "Defensive Cyber", technology: "WebSockets & Scapy", supporting: "Docker · Linux POSIX", accent: "#34d399" },
  { id: "interfaces", focus: "Interface Arch", technology: "React 19 & TypeScript", supporting: "Canvas · Three.js", accent: "#86bdd8" },
  { id: "data", focus: "Data Science", technology: "Pandas & PyTorch", supporting: "Feature Pipelines", accent: "#e2b887" },
  { id: "systems", focus: "Distributed Infra", technology: "Alpine Linux & Git", supporting: "CI/CD · Containers", accent: "#c79863" },
];

interface CleanDomain {
  id: string;
  num: string;
  category: string;
  title: string;
  description: string;
  accent: string;
  skills: string[];
}

const cleanDomains: CleanDomain[] = [
  {
    id: "ai-robotics",
    num: "01",
    category: "AI & ROBOTICS",
    title: "Autonomous Systems & Machine Learning",
    description: "Deep learning models, vision pipelines, and real-time robotic control loops.",
    accent: "#e2b887",
    skills: ["Python", "PyTorch", "ROS2 Humble", "SLAM Navigation", "Sensor Fusion", "C++20", "OpenCV"],
  },
  {
    id: "decision-ml",
    num: "02",
    category: "DECISION INTEL",
    title: "Statistical Learning & Inference",
    description: "High-dimensional data modeling, probabilistic inference, and reliable decision models grounded in mathematics.",
    accent: "#86bdd8",
    skills: ["Deep Neural Nets", "Statistical Inference", "FastAPI", "Pandas", "Scikit-Learn", "Gemini API"],
  },
  {
    id: "frontend",
    num: "03",
    category: "INTERFACES & WEB",
    title: "Modern Interface Architecture",
    description: "Fast, responsive web applications with 60fps canvas animations, reactive data streams, and editorial aesthetics.",
    accent: "#86bdd8",
    skills: ["React 19", "TypeScript", "Next.js", "WebSockets", "Three.js", "GSAP / Motion", "Tailwind CSS"],
  },
  {
    id: "systems-security",
    num: "04",
    category: "SYSTEMS & SECURITY",
    title: "POSIX, Networks & Defensive Core",
    description: "Low-level system programming, network telemetry analysis, container orchestration, and defensive security.",
    accent: "#34d399",
    skills: ["Linux OS", "Docker Sandboxes", "Network Telemetry", "Scapy", "Git / CI/CD", "Cyber Ranges"],
  },
];

export function Skills() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const header = sectionRef.current?.querySelector<HTMLElement>("[data-skills-header]");
      const centerLine = sectionRef.current?.querySelector<HTMLElement>("[data-skills-center-line]");
      const connector = sectionRef.current?.querySelector<HTMLElement>("[data-skill-connector]");
      const scanner = sectionRef.current?.querySelector<HTMLElement>(".split-skills-scanner");
      const leftColumn = sectionRef.current?.querySelector<HTMLElement>("[data-skills-left]");
      const rightColumn = sectionRef.current?.querySelector<HTMLElement>("[data-skills-right]");
      const cleanWrap = sectionRef.current?.querySelector<HTMLElement>("[data-clean-skills-wrap]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-clean-card]");
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

      if (!header || !centerLine || !connector || !scanner || !leftColumn || !rightColumn || !cleanWrap || !experienceLine || !activeIndex || !activeLabel || reduceMotion) return;

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
      gsap.set(cleanWrap, { opacity: 0, y: 30, pointerEvents: "none" });
      gsap.set(cards, { opacity: 0, y: 25, filter: "blur(6px)" });
      gsap.set(experienceLine, { opacity: 0, scaleY: 0, transformOrigin: "top center" });
      gsap.set([leftColumn, rightColumn], { opacity: isMobile ? 0 : 0.85, y: 0, x: 0, filter: "blur(0px)" });
      gsap.set([...leftLabels, ...rightLabels], { opacity: isMobile ? 0.78 : 0.3, scale: 1, color: "rgba(243,239,230,0.5)" });
      gsap.set([leftLabels[0], rightLabels[0]], { opacity: 1, scale: 1.1, color: relationshipPairs[0].accent });
      gsap.set(mobilePairs, { opacity: 0, y: 14 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
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
              if (self.progress >= 0.74) {
                footerStatus.textContent = "CORE ENGINEERING CAPABILITIES";
              } else {
                footerStatus.textContent = "SCROLL TO EXPLORE STACK";
              }
            }
          },
        },
      });

      // 1. Initial entrance
      timeline
        .to(header, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0)
        .to(centerLine, { opacity: 1, scaleY: 1, duration: 0.12, ease: "power2.out" }, 0.08)
        .to([leftColumn, rightColumn], { opacity: 1, duration: 0.12, ease: "power2.out" }, 0.1)
        .to(scanner, { opacity: 1, scale: 1, duration: 0.1, ease: "power2.out" }, 0.12)
        .to(header, { opacity: 0, y: -40, duration: 0.14, ease: "power2.in" }, 0.28);

      if (isMobile) {
        timeline
          .to([leftColumn, rightColumn, connector, centerLine, scanner], { opacity: 0, duration: 0.12 }, 0.22)
          .to(mobilePairs, { opacity: 1, y: 0, stagger: 0.06, duration: 0.2, ease: "power2.out" }, 0.24)
          .to(cleanWrap, { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.2, ease: "power2.out" }, 0.7)
          .to(cards, { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.05, duration: 0.2, ease: "power2.out" }, 0.72)
          .to(experienceLine, { opacity: 1, scaleY: 1, duration: 0.16, ease: "power2.out" }, 0.9);
      } else {
        // 2. Liquid vertical travel of the two columns
        timeline
          .to(leftColumn, { y: -travel, duration: 0.54, ease: "none" }, 0.18)
          .to(rightColumn, { y: travel, duration: 0.54, ease: "none" }, 0.18);

        relationshipPairs.forEach((pair, index) => {
          const pairStart = 0.18 + (index / (relationshipPairs.length - 1)) * 0.52;
          timeline
            .to([leftLabels[index], rightLabels[index]], { opacity: 1, scale: 1.08, color: pair.accent, duration: 0.06, ease: "power2.out" }, pairStart)
            .to(connector, { opacity: 1, scaleX: 1, duration: 0.05, ease: "power2.out" }, pairStart)
            .to([leftLabels[index], rightLabels[index]], { opacity: 0.32, scale: 0.96, color: "rgba(243,239,230,0.5)", duration: 0.07, ease: "power2.in" }, pairStart + 0.08)
            .to(connector, { opacity: 0, scaleX: 0, duration: 0.05, ease: "power2.in" }, pairStart + 0.09);
        });

        // 3. Luxurious crossfade transition into Clean Showcase
        // Smoothly float the columns outward with subtle blur & fade out
        timeline
          .to(leftColumn, { opacity: 0, x: -35, filter: "blur(5px)", duration: 0.13, ease: "power2.in" }, 0.72)
          .to(rightColumn, { opacity: 0, x: 35, filter: "blur(5px)", duration: 0.13, ease: "power2.in" }, 0.72)
          .to([scanner, connector, centerLine], { opacity: 0, scale: 0.85, duration: 0.12, ease: "power2.in" }, 0.72)
          // Clean cards glide in smoothly from below with stagger & de-blurring
          .to(cleanWrap, { opacity: 1, y: 0, pointerEvents: "auto", duration: 0.18, ease: "power2.out" }, 0.76)
          .to(cards, { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.04, duration: 0.18, ease: "power2.out" }, 0.78)
          .to(experienceLine, { opacity: 1, scaleY: 1, duration: 0.16, ease: "power2.out" }, 0.94);
      }

      return () => timeline.scrollTrigger?.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const rowStyle = (index: number, direction: "left" | "right") => ({
    "--skill-offset": `${(direction === "left" ? index : -index) * 6.4}rem`,
  } as CSSProperties & { "--skill-offset": string });

  return (
    <section ref={sectionRef} id="skills" className="split-skills-shell">
      <div className="split-skills-sticky">
        <header data-skills-header className="split-skills-header">
          <div>
            <span className="sequence-kicker font-mono text-[0.68rem] tracking-[0.16em] text-[var(--editorial-blue,#86bdd8)] uppercase">
              03 / TECHNICAL STACK
            </span>
            <h2 className="mt-2 text-4xl font-bold uppercase leading-[0.88] tracking-[-0.05em] text-[var(--editorial-paper,#edf0ed)] md:text-7xl font-sans">
              The tools<br />
              <em className="font-serif italic font-normal text-[var(--editorial-paper,#edf0ed)]">behind the work.</em>
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-xs leading-relaxed text-[var(--editorial-muted,#8f9ba8)] md:block font-mono">
            Capabilities on the left. The systems that make them real on the right.
          </p>
        </header>

        {/* Alignment scroll stage */}
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

        {/* Simple, Clean Minimalist Showcase */}
        <div data-clean-skills-wrap className="clean-skills-wrap">
          <div className="clean-skills-header">
            <span className="clean-skills-kicker">Core Disciplines & Competencies</span>
            <span className="clean-skills-subtitle">Production Stack</span>
          </div>

          <div className="clean-skills-grid">
            {cleanDomains.map((domain) => (
              <div
                key={domain.id}
                data-clean-card
                className="clean-skill-card"
              >
                <div className="clean-skill-top">
                  <span className="clean-skill-index">{domain.num}</span>
                  <span className="clean-skill-category">{domain.category}</span>
                </div>

                <h3 className="clean-skill-title">{domain.title}</h3>
                <p className="clean-skill-desc">{domain.description}</p>

                <div className="clean-skill-pills">
                  {domain.skills.map((skill) => (
                    <span key={skill} className="clean-skill-pill">
                      <span className="clean-skill-dot" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div data-skill-experience-line className="split-skills-experience-line" aria-hidden="true"><span /></div>
        <div className="split-skills-footer">
          <span data-skill-footer-status>SCROLL TO EXPLORE STACK</span>
          <span>04 DISCIPLINES</span>
        </div>
      </div>
    </section>
  );
}
