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
  { id: "ai", focus: "AI", technology: "Python", supporting: "Machine Learning", accent: "#a78bfa" },
  { id: "robotics", focus: "Robotics", technology: "C/C++", supporting: "ROS2", accent: "#22d3ee" },
  { id: "frontend", focus: "Frontend", technology: "React", supporting: "TypeScript", accent: "#60a5fa" },
  { id: "backend", focus: "Backend", technology: "Node.js", supporting: "PostgreSQL", accent: "#a78bfa" },
  { id: "security", focus: "Security", technology: "Linux", supporting: "Cybersecurity", accent: "#22d3ee" },
  { id: "data", focus: "Data", technology: "Pandas", supporting: "Data Science", accent: "#60a5fa" },
  { id: "systems", focus: "Systems", technology: "Docker", supporting: "Git", accent: "#c79863" },
];

const categorizedSkills = [
  { label: "AI / ROBOTICS", skills: "Python · Machine Learning · Robotics · C/C++" },
  { label: "FRONTEND", skills: "React · TypeScript · Next.js · Tailwind CSS" },
  { label: "BACKEND", skills: "Node.js · PostgreSQL · MongoDB · GraphQL" },
  { label: "SYSTEMS / SECURITY", skills: "Linux · Docker · Git · Cybersecurity" },
];

export function Skills() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const header = sectionRef.current?.querySelector<HTMLElement>("[data-skills-header]");
      const centerLine = sectionRef.current?.querySelector<HTMLElement>("[data-skills-center-line]");
      const connector = sectionRef.current?.querySelector<HTMLElement>("[data-skill-connector]");
      const leftColumn = sectionRef.current?.querySelector<HTMLElement>("[data-skills-left]");
      const rightColumn = sectionRef.current?.querySelector<HTMLElement>("[data-skills-right]");
      const categories = sectionRef.current?.querySelector<HTMLElement>("[data-skill-categories]");
      const experienceLine = sectionRef.current?.querySelector<HTMLElement>("[data-skill-experience-line]");
      const leftRows = gsap.utils.toArray<HTMLElement>("[data-skill-left-row]");
      const rightRows = gsap.utils.toArray<HTMLElement>("[data-skill-right-row]");
      const leftLabels = gsap.utils.toArray<HTMLElement>("[data-skill-left-label]");
      const rightLabels = gsap.utils.toArray<HTMLElement>("[data-skill-right-label]");
      const mobilePairs = gsap.utils.toArray<HTMLElement>("[data-mobile-skill-pair]");
      const activeIndex = sectionRef.current?.querySelector<HTMLElement>("[data-skill-active-index]");
      const activeLabel = sectionRef.current?.querySelector<HTMLElement>("[data-skill-active-label]");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!header || !centerLine || !connector || !leftColumn || !rightColumn || !categories || !experienceLine || !activeIndex || !activeLabel || reduceMotion) return;

      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const firstRow = leftRows[0];
      const secondRow = leftRows[1];
      const step = secondRow && firstRow ? Math.abs(secondRow.offsetTop - firstRow.offsetTop) : (isMobile ? 64 : 104);
      const travel = step * (isMobile ? 1.5 : relationshipPairs.length - 1);
      let lastActiveIndex = -1;

      gsap.set(header, { opacity: 1, y: 0 });
      gsap.set(centerLine, { opacity: 1, scaleY: 1 });
      gsap.set(connector, { opacity: 1, scaleX: 1, transformOrigin: "center center" });
      gsap.set(categories, { opacity: 0, y: 24 });
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
            const choreographyProgress = gsap.utils.clamp(0, 1, (self.progress - 0.2) / 0.58);
            const nextIndex = Math.min(relationshipPairs.length - 1, Math.floor(choreographyProgress * relationshipPairs.length));
            if (nextIndex !== lastActiveIndex) {
              lastActiveIndex = nextIndex;
              const pair = relationshipPairs[nextIndex];
              activeIndex.textContent = String(nextIndex + 1).padStart(2, "0");
              activeLabel.textContent = `${pair.focus} × ${pair.technology}`;
            }
          },
        },
      });

      timeline
        .to(header, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0)
        .to(centerLine, { opacity: 1, scaleY: 1, duration: 0.12, ease: "power2.out" }, 0.1)
        .to([leftColumn, rightColumn], { opacity: 1, duration: 0.12, ease: "power2.out" }, 0.15)
        .to(header, { opacity: 0, y: -42, duration: 0.14, ease: "power2.in" }, 0.28)
        .to(connector, { opacity: 1, scaleX: 1, duration: 0.1, ease: "power2.out" }, 0.18)
        .to(connector, { scaleX: 0, duration: 0.08, ease: "power2.in" }, 0.29);

      if (isMobile) {
        timeline
          .to([leftColumn, rightColumn, connector, centerLine], { opacity: 0, duration: 0.12 }, 0.22)
          .to(mobilePairs, { opacity: 1, y: 0, stagger: 0.06, duration: 0.2, ease: "power2.out" }, 0.24)
          .to(categories, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, 0.7)
          .to(experienceLine, { opacity: 1, scaleY: 1, duration: 0.16, ease: "power2.out" }, 0.9);
      } else {
        timeline
          .to(leftColumn, { y: -travel, duration: 0.58, ease: "none" }, 0.2)
          .to(rightColumn, { y: travel, duration: 0.58, ease: "none" }, 0.2);

        relationshipPairs.forEach((pair, index) => {
          const pairStart = 0.2 + (index / (relationshipPairs.length - 1)) * 0.56;
          timeline
            .to([leftLabels[index], rightLabels[index]], { opacity: 1, scale: 1.1, color: pair.accent, duration: 0.07, ease: "power2.out" }, pairStart)
            .to(connector, { opacity: 1, scaleX: 1, duration: 0.06, ease: "power2.out" }, pairStart)
            .to([leftLabels[index], rightLabels[index]], { opacity: 0.34, scale: 0.95, color: "rgba(243,239,230,0.5)", duration: 0.08, ease: "power2.in" }, pairStart + 0.09)
            .to(connector, { opacity: 0, scaleX: 0, duration: 0.06, ease: "power2.in" }, pairStart + 0.1);
        });

        timeline
          .to([leftColumn, rightColumn], { opacity: 0, duration: 0.12 }, 0.78)
          .to(categories, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, 0.82)
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
            <span className="sequence-kicker">TECHNICAL STACK / 04</span>
            <h2 className="mt-3 text-4xl font-bold uppercase leading-[0.86] tracking-[-0.06em] text-white md:text-7xl">The tools<br />behind the work.</h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm leading-relaxed text-gray-500 md:block">Capabilities on the left. The systems that make them real on the right.</p>
        </header>

        <div className="split-skills-stage">
          <div data-skills-center-line className="split-skills-center-line" aria-hidden="true" />
          <div data-skill-connector className="split-skills-connector" aria-hidden="true"><span /></div>
          <div className="split-skills-scanner" aria-hidden="true"><span data-skill-active-index>01</span><span data-skill-active-label>AI × Python</span></div>

          <div data-skills-left className="split-skills-column split-skills-left">
            {relationshipPairs.map((pair, index) => (
              <div key={pair.id} data-skill-left-row className="split-skill-row" style={rowStyle(index, "left")}>
                <span className="split-skill-row-number">0{index + 1}</span><span data-skill-left-label={index}>{pair.focus}</span>
              </div>
            ))}
          </div>
          <div data-skills-right className="split-skills-column split-skills-right">
            {relationshipPairs.map((pair, index) => (
              <div key={pair.id} data-skill-right-row className="split-skill-row" style={rowStyle(index, "right")}>
                <span data-skill-right-label={index}>{pair.technology}</span><span className="split-skill-support">{pair.supporting}</span>
              </div>
            ))}
          </div>

          <div className="split-skills-mobile-pairs">
            {relationshipPairs.map((pair, index) => (
              <div key={pair.id} data-mobile-skill-pair className="split-skills-mobile-pair">
                <span style={{ color: pair.accent }}>0{index + 1}</span><strong>{pair.focus}</strong><i>→</i><b>{pair.technology}</b><small>{pair.supporting}</small>
              </div>
            ))}
          </div>
        </div>

        <div data-skill-categories className="skill-categories">
          {categorizedSkills.map((category) => <div key={category.label} className="skill-category"><span>{category.label}</span><strong>{category.skills}</strong></div>)}
        </div>

        <div data-skill-experience-line className="split-skills-experience-line" aria-hidden="true"><span /></div>
        <div className="split-skills-footer"><span>SCROLL TO ALIGN</span><span>07 / 07</span></div>
      </div>
    </section>
  );
}
