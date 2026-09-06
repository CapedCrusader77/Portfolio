import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Project = {
  title: string;
  fullTitle: string;
  description: string;
  tech: string[];
  year: string;
  tag: string;
  github: string | null;
  image: string;
};

const projects: Project[] = [
  {
    title: "ROOTCAUSE",
    fullTitle: "ROOTCAUSE - RootCause IQ — Multi-Agent Incident Analysis",
    description: "A multi-agent platform that diagnoses enterprise incidents, maps blast radius, retrieves grounded runbooks, and routes remediation through specialized reasoning agents.",
    tech: ["React 19", "TypeScript", "FastAPI", "React Flow"],
    year: "2026",
    tag: "MULTI-AGENT AI",
    github: "https://github.com/CapedCrusader77/rootcause-iq",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=85",
  },
  {
    title: "TRUSTGRAPH",
    fullTitle: "TRUSTGRAPH - AI-Powered Repository Intelligence",
    description: "An AI decision-intelligence platform that analyzes GitHub telemetry, scores enterprise readiness, compares repositories, simulates dependency blast radius, and generates grounded adoption recommendations.",
    tech: ["React", "TypeScript", "FastAPI", "Gemini"],
    year: "2026",
    tag: "AI / DECISION INTELLIGENCE",
    github: "https://github.com/CapedCrusader77/Gen-AI-Hackathon",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=85",
  },
  {
    title: "SIEGE",
    fullTitle: "SIEGE - Cyber Simulation Platform",
    description: "A cinematic cyber range for learning and demos with live WebSocket attack simulations, firewall and IDS controls, session analytics, PDF reporting, and Dockerized deployment.",
    tech: ["React", "FastAPI", "WebSockets", "Docker"],
    year: "2026",
    tag: "CYBERSECURITY",
    github: "https://github.com/CapedCrusader77/SEIGE",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=85",
  },
];

const imageSources = (image: string) => ({
  src: image,
  srcSet: `${image.replace("w=1200", "w=640")} 640w, ${image} 1200w`,
});

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let mobileObserver: IntersectionObserver | null = null;
    const indexHandlers = new Map<HTMLButtonElement, () => void>();

    const context = gsap.context(() => {
      const intro = section.querySelector<HTMLElement>("[data-selected-work-intro]");
      const introHeading = section.querySelector<HTMLElement>("[data-selected-work-intro-heading]");
      const compactHeader = section.querySelector<HTMLElement>("[data-selected-work-compact-header]");
      const storyList = section.querySelector<HTMLElement>("[data-project-story-list]");
      const stage = section.querySelector<HTMLElement>("[data-project-visual-stage]");
      const skillsHandoff = section.querySelector<HTMLElement>("[data-project-skills-handoff]");
      const visuals = gsap.utils.toArray<HTMLElement>("[data-project-visual-frame]");
      const stories = gsap.utils.toArray<HTMLElement>("[data-project-story]");
      const storyNumbers = gsap.utils.toArray<HTMLElement>("[data-project-story-number]");
      const storyTitles = gsap.utils.toArray<HTMLElement>("[data-project-story-title]");
      const storyDetails = gsap.utils.toArray<HTMLElement>("[data-project-story-detail]");
      const progressBar = section.querySelector<HTMLElement>("[data-project-progress-fill]");
      const progressLabel = section.querySelector<HTMLElement>("[data-project-progress-label]");
      const indexButtons = gsap.utils.toArray<HTMLButtonElement>("[data-project-index-button]");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const mobile = window.matchMedia("(max-width: 767px)").matches;

      if (!intro || !introHeading || !compactHeader || !storyList || !stage || !skillsHandoff || !visuals.length || !stories.length) return;

      let activeIndex = -1;

      const setActiveIndex = (index: number) => {
        const safeIndex = Math.max(0, Math.min(index, projects.length - 1));
        if (progressLabel) progressLabel.textContent = `${String(safeIndex + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
        if (progressBar) progressBar.style.width = `${((safeIndex + 1) / projects.length) * 100}%`;
        if (safeIndex === activeIndex) return;
        activeIndex = safeIndex;
        indexButtons.forEach((button, buttonIndex) => {
          const active = buttonIndex === safeIndex;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-current", active ? "true" : "false");
        });
      };

      const scrollToStory = (index: number) => {
        stories[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
      };

      indexButtons.forEach((button, index) => {
        const handler = () => scrollToStory(index);
        indexHandlers.set(button, handler);
        button.addEventListener("click", handler);
      });

      if (reduceMotion) {
        gsap.set([introHeading, compactHeader, stage, skillsHandoff, ...visuals, ...stories, ...storyNumbers, ...storyTitles, ...storyDetails], {
          clearProps: "all",
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          clipPath: "inset(0 0 0 0)",
        });
        setActiveIndex(0);
        return;
      }

      if (mobile) {
        mobileObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) entry.target.classList.add("is-visible");
            });
          },
          { threshold: 0.2 },
        );
        stories.forEach((story) => mobileObserver?.observe(story));
        setActiveIndex(0);
        return;
      }

      gsap.set(introHeading, { y: 0, scale: 1, opacity: 1, transformOrigin: "left top" });
      gsap.set(compactHeader, { opacity: 0, y: 12 });
      gsap.set(stage, { opacity: 0.5, scale: 0.94, transformOrigin: "center center" });
      gsap.set(skillsHandoff, { opacity: 0.18, scaleX: 0, transformOrigin: "center center" });
      // Keep one frame readable at a time. The first card starts on the right,
      // then each following card hands off from the opposite side.
      gsap.set(visuals, { opacity: 0, xPercent: 0, scale: 1.02, zIndex: 0 });
      gsap.set(visuals[0], { opacity: 1, xPercent: 8, scale: 1, zIndex: 2 });
      gsap.set(stories, { opacity: 0.38 });
      gsap.set(storyNumbers, { y: "110%", opacity: 0.35 });
      gsap.set(storyTitles, { y: "110%", opacity: 0.35 });
      gsap.set(storyDetails, { y: 16, opacity: 0.35 });
      gsap.set(progressBar, { width: `${100 / projects.length}%` });

      const introTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: intro,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      });
      introTimeline
        .to(introHeading, { y: "-28%", scale: 0.34, opacity: 0.52, duration: 0.72, ease: "power2.out" }, 0)
        .to(compactHeader, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, 0.52);

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: storyList,
          start: "top top+=96",
          end: "bottom bottom-=18%",
          scrub: 0.7,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const rawIndex = self.progress * projects.length;
            setActiveIndex(Math.min(projects.length - 1, Math.floor(rawIndex)));
          },
        },
      });

      timeline
        .to(stage, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }, 0)
        .to(storyNumbers[0], { y: 0, opacity: 1, duration: 0.14, ease: "power2.out" }, 0.05)
        .to(storyTitles[0], { y: 0, opacity: 1, duration: 0.18, ease: "power2.out" }, 0.09)
        .to(storyDetails[0], { y: 0, opacity: 1, duration: 0.16, ease: "power2.out" }, 0.19);

      for (let index = 1; index < projects.length; index += 1) {
        const segmentStart = index - 0.22;
        const incomingVisual = visuals[index];
        const outgoingVisual = visuals[index - 1];
        const incomingDirection = index % 2 === 0 ? 1 : -1;

        timeline
          .set(incomingVisual, { zIndex: 2 }, segmentStart)
          .to(
            outgoingVisual,
            { opacity: 0, xPercent: incomingDirection * -12, scale: 0.985, duration: 0.42, ease: "none" },
            segmentStart,
          )
          .fromTo(
            incomingVisual,
            { opacity: 0, xPercent: incomingDirection * 14, scale: 1.015 },
            { opacity: 1, xPercent: 0, scale: 1, duration: 0.52, ease: "none" },
            segmentStart + 0.02,
          )
          .to(stories[index - 1], { opacity: 0.52, duration: 0.16 }, segmentStart)
          .to(stories[index], { opacity: 1, duration: 0.2 }, segmentStart + 0.1)
          .to(storyNumbers[index], { y: 0, opacity: 1, duration: 0.14, ease: "power2.out" }, segmentStart + 0.12)
          .to(storyTitles[index], { y: 0, opacity: 1, duration: 0.18, ease: "power2.out" }, segmentStart + 0.17)
          .to(storyDetails[index], { y: 0, opacity: 1, duration: 0.16, ease: "power2.out" }, segmentStart + 0.27);
      }

      timeline
        .to(stage, { scale: 0.9, opacity: 0.45, duration: 0.24, ease: "power2.inOut" }, projects.length - 0.12)
        .to(skillsHandoff, { opacity: 0.85, scaleX: 1, duration: 0.16, ease: "power2.out" }, projects.length - 0.1)
        .to(progressBar, { width: "100%", duration: 0.12, ease: "none" }, projects.length - 0.12);

      setActiveIndex(0);
    }, sectionRef);

    return () => {
      mobileObserver?.disconnect();
      indexHandlers.forEach((handler, button) => button.removeEventListener("click", handler));
      context.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} id="projects" className="selected-work-shell">
      <div className="selected-work-intro" data-selected-work-intro>
        <div className="selected-work-intro-inner">
          <span className="selected-work-kicker">SELECTED WORK / 03</span>
          <h2 data-selected-work-intro-heading>
            SELECTED
            <br />
            WORK
          </h2>
          <p>Digital systems, simulations, and intelligent tools built with intention.</p>
        </div>
      </div>

      <div className="selected-work-body">
        <div className="selected-work-visual-column">
          <div className="selected-work-visual-sticky">
            <div className="selected-work-compact-header" data-selected-work-compact-header>
              <span>SELECTED WORK</span>
              <span data-project-progress-label>01 / {String(projects.length).padStart(2, "0")}</span>
            </div>

            <div className="selected-work-visual-stage" data-project-visual-stage>
              <div className="selected-work-visual-frames">
                {projects.map((project, index) => {
                  const source = imageSources(project.image);
                  return (
                    <figure key={project.title} className="selected-work-visual-frame" data-project-visual-frame>
                      <div className="selected-work-browser-bar" aria-hidden="true">
                        <span /><span /><span />
                        <small>{project.tag.toLowerCase()}</small>
                      </div>
                      <img
                        {...source}
                        sizes="(max-width: 1100px) 64vw, 62vw"
                        alt={`${project.fullTitle} project visual`}
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        width="1200"
                        height="675"
                      />
                      <figcaption>{project.title}</figcaption>
                    </figure>
                  );
                })}
              </div>
            </div>
            <div className="selected-work-skills-handoff" data-project-skills-handoff aria-hidden="true" />

            <nav className="selected-work-index" aria-label="Selected work projects">
              {projects.map((project, index) => (
                <button
                  key={project.title}
                  type="button"
                  data-project-index-button
                  aria-current={index === 0 ? "true" : "false"}
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{project.title}</span>
                </button>
              ))}
            </nav>

            <div className="selected-work-progress" aria-label="Project progress">
              <span>01</span>
              <i><b data-project-progress-fill /></i>
              <span>{String(projects.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>

        <div className="selected-work-story-list" data-project-story-list>
          {projects.map((project, index) => {
            const source = imageSources(project.image);
            return (
              <article key={project.title} className="selected-work-story" data-project-story>
                <div className="selected-work-mobile-visual">
                  <div className="selected-work-browser-bar" aria-hidden="true">
                    <span /><span /><span />
                    <small>{project.tag.toLowerCase()}</small>
                  </div>
                  <img
                    {...source}
                    sizes="calc(100vw - 2.5rem)"
                    alt={`${project.fullTitle} project visual`}
                    loading="lazy"
                    decoding="async"
                    width="1200"
                    height="675"
                  />
                </div>

                <div className="selected-work-story-inner">
                  <div className="selected-work-story-number-mask">
                    <span data-project-story-number>{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="selected-work-story-title-mask">
                    <h3 data-project-story-title>{project.title}</h3>
                  </div>
                  <p className="selected-work-story-full-title">{project.fullTitle.replace(`${project.title} - `, "")}</p>
                  <p className="selected-work-story-detail" data-project-story-detail>{project.description}</p>

                  <dl className="selected-work-facts">
                    <div><dt>TYPE</dt><dd>{project.tag}</dd></div>
                    <div><dt>YEAR</dt><dd>{project.year}</dd></div>
                    <div><dt>STACK</dt><dd>{project.tech.join(" / ")}</dd></div>
                  </dl>

                  <div className="selected-work-tech" aria-label={`${project.title} technology stack`}>
                    {project.tech.map((technology) => <span key={technology}>{technology}</span>)}
                  </div>

                  <div className="selected-work-cta">
                    {project.github ? (
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <Github aria-hidden="true" /> VIEW CODE
                      </a>
                    ) : (
                      <a href="#contact">
                        <ArrowUpRight aria-hidden="true" /> VIEW PROJECT
                      </a>
                    )}
                    <span>{String(index + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

    </section>
  );
}
