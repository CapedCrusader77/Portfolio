import { useLayoutEffect, useRef } from "react";
import { ArrowUpRight, Github } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import anime from "animejs";

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
  glowColor: string;
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
    image: "/projects/rootcause-iq.jpg",
    glowColor: "rgba(244, 63, 94, 0.28)",
  },
  {
    title: "TRUSTGRAPH",
    fullTitle: "TRUSTGRAPH - AI-Powered Repository Intelligence",
    description: "An AI decision-intelligence platform that analyzes GitHub telemetry, scores enterprise readiness, compares repositories, simulates dependency blast radius, and generates grounded adoption recommendations.",
    tech: ["React", "TypeScript", "FastAPI", "Gemini"],
    year: "2026",
    tag: "AI / DECISION INTELLIGENCE",
    github: "https://github.com/CapedCrusader77/Gen-AI-Hackathon",
    image: "/projects/trustgraph.jpg",
    glowColor: "rgba(14, 165, 233, 0.32)",
  },
  {
    title: "SIEGE",
    fullTitle: "SIEGE - Cyber Simulation Platform",
    description: "A cinematic cyber range for learning and demos with live WebSocket attack simulations, firewall and IDS controls, session analytics, PDF reporting, and Dockerized deployment.",
    tech: ["React", "FastAPI", "WebSockets", "Docker"],
    year: "2026",
    tag: "CYBERSECURITY",
    github: "https://github.com/CapedCrusader77/SEIGE",
    image: "/projects/siege.jpg",
    glowColor: "rgba(16, 185, 129, 0.3)",
  },
  {
    title: "SLAM NAVIGATOR",
    fullTitle: "SLAM NAVIGATOR - Autonomous Spatial Navigation & Perception",
    description: "Autonomous mobile robot architecture featuring 2D/3D LiDAR SLAM, camera sensor fusion, adaptive A* global planning, and DWA obstacle avoidance in ROS2.",
    tech: ["ROS2 Humble", "C++20", "Python", "LiDAR"],
    year: "2026",
    tag: "AUTONOMOUS ROBOTICS",
    github: "https://github.com/CapedCrusader77",
    image: "/projects/slam-navigator.jpg",
    glowColor: "rgba(234, 179, 8, 0.3)",
  },
];

const imageSources = (image: string) => ({
  src: image,
  srcSet: image.includes("unsplash") ? `${image.replace("w=1200", "w=640")} 640w, ${image} 1200w` : image,
});

export function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

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
        if (progressLabel) {
          progressLabel.textContent = `${String(safeIndex + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
        }
        if (progressBar) {
          progressBar.style.width = `${((safeIndex + 1) / projects.length) * 100}%`;
        }
        if (safeIndex === activeIndex) return;
        activeIndex = safeIndex;

        // Dynamically update the ambient back-glow of the stage
        if (stage) {
          stage.style.setProperty("--project-glow", projects[safeIndex].glowColor);
        }

        // Active story highlight for high-contrast focus
        stories.forEach((story, sIdx) => {
          story.classList.toggle("is-active-story", sIdx === safeIndex);
        });

        indexButtons.forEach((button, buttonIndex) => {
          const active = buttonIndex === safeIndex;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-current", active ? "true" : "false");
          if (active) {
            anime({
              targets: button,
              scale: [1, 1.05, 1.02],
              duration: 350,
              easing: "easeOutElastic(1, .6)",
            });
          }
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

      // Initial visual stage setup with 3D depth and dynamic glow
      stage.style.setProperty("--project-glow", projects[0].glowColor);
      gsap.set(introHeading, { y: 0, scale: 1, opacity: 1, transformOrigin: "left top" });
      gsap.set(compactHeader, { opacity: 0, y: 12 });
      gsap.set(stage, { opacity: 0.5, scale: 0.94, transformOrigin: "center center" });
      gsap.set(skillsHandoff, { opacity: 0.18, scaleX: 0, transformOrigin: "center center" });

      // Visual frames start stacked with 3D blur depth
      gsap.set(visuals, {
        opacity: 0,
        scale: 1.06,
        y: 35,
        filter: "blur(10px) brightness(0.6)",
        zIndex: 1,
        transformPerspective: 1000,
        force3D: true,
      });
      gsap.set(visuals[0], {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px) brightness(1)",
        zIndex: 3,
      });
      gsap.set(stories, { opacity: 0.22, y: 0 });
      gsap.set(stories[0], { opacity: 1 });
      gsap.set(storyNumbers, { y: "110%", opacity: 0 });
      gsap.set(storyTitles, { y: "110%", opacity: 0 });
      gsap.set(storyDetails, { y: 20, opacity: 0 });
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
          start: "top top+=80",
          end: "bottom bottom-=15%",
          scrub: 0.85,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const rawIndex = self.progress * projects.length;
            setActiveIndex(Math.min(projects.length - 1, Math.floor(rawIndex)));
          },
        },
      });

      // Smooth entrance of first project
      timeline
        .to(stage, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }, 0)
        .to(storyNumbers[0], { y: 0, opacity: 1, duration: 0.18, ease: "power2.out" }, 0.05)
        .to(storyTitles[0], { y: 0, opacity: 1, duration: 0.22, ease: "power2.out" }, 0.08)
        .to(storyDetails[0], { y: 0, opacity: 1, duration: 0.20, ease: "power2.out" }, 0.14);

      // Smooth, cinematic 3D cross-fade transitions between each project
      for (let index = 1; index < projects.length; index += 1) {
        const segmentStart = index - 0.28;
        const incomingVisual = visuals[index];
        const outgoingVisual = visuals[index - 1];
        const outgoingImage = outgoingVisual.querySelector("img");
        const incomingImage = incomingVisual.querySelector("img");

        timeline
          .set(incomingVisual, { zIndex: 3 }, segmentStart)
          // Outgoing visual glides back in 3D perspective and softly dissolves
          .to(
            outgoingVisual,
            {
              opacity: 0,
              scale: 0.93,
              y: -35,
              filter: "blur(8px) brightness(0.5)",
              duration: 0.44,
              ease: "power2.inOut",
            },
            segmentStart
          )
          // Incoming visual rises smoothly with clarity from depth
          .fromTo(
            incomingVisual,
            { opacity: 0, scale: 1.07, y: 35, filter: "blur(10px) brightness(0.6)" },
            { opacity: 1, scale: 1, y: 0, filter: "blur(0px) brightness(1)", duration: 0.52, ease: "power2.out" },
            segmentStart + 0.04
          );

        if (outgoingImage) {
          timeline.to(outgoingImage, { yPercent: -6, duration: 0.44, ease: "none" }, segmentStart);
        }
        if (incomingImage) {
          timeline.fromTo(incomingImage, { yPercent: 6 }, { yPercent: 0, duration: 0.52, ease: "none" }, segmentStart + 0.04);
        }

        // Cross-fade the story text with kinetic upward mask transitions
        timeline
          .to(stories[index - 1], { opacity: 0.2, y: -15, duration: 0.28, ease: "power2.inOut" }, segmentStart)
          .to(stories[index], { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }, segmentStart + 0.12)
          .to(storyNumbers[index], { y: 0, opacity: 1, duration: 0.18, ease: "power2.out" }, segmentStart + 0.14)
          .to(storyTitles[index], { y: 0, opacity: 1, duration: 0.22, ease: "power2.out" }, segmentStart + 0.18)
          .to(storyDetails[index], { y: 0, opacity: 1, duration: 0.20, ease: "power2.out" }, segmentStart + 0.24);
      }

      timeline
        .to(stage, { scale: 0.92, opacity: 0.4, filter: "blur(4px)", duration: 0.25, ease: "power2.inOut" }, projects.length - 0.12)
        .to(skillsHandoff, { opacity: 0.85, scaleX: 1, duration: 0.18, ease: "power2.out" }, projects.length - 0.1)
        .to(progressBar, { width: "100%", duration: 0.12, ease: "none" }, projects.length - 0.12);

      setActiveIndex(0);
    }, sectionRef);

    return () => {
      mobileObserver?.disconnect();
      indexHandlers.forEach((handler, button) => button.removeEventListener("click", handler));
      context.revert();
    };
  }, []);

  // --- INTERACTIVE 3D STAGE TILT ON MOUSE HOVER ---
  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current || window.matchMedia("(max-width: 767px)").matches) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(stageRef.current, {
      rotateY: x * 8,
      rotateX: -y * 6,
      transformPerspective: 1000,
      duration: 0.35,
      ease: "power1.out",
    });
  };

  const handleStageMouseLeave = () => {
    if (!stageRef.current) return;
    gsap.to(stageRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.6)",
    });
  };

  const handleTagEnter = (e: React.MouseEvent<HTMLSpanElement>) => {
    anime.remove(e.currentTarget);
    anime({
      targets: e.currentTarget,
      translateY: -3,
      scale: 1.05,
      duration: 250,
      easing: "easeOutElastic(1, .7)",
    });
  };

  const handleTagLeave = (e: React.MouseEvent<HTMLSpanElement>) => {
    anime.remove(e.currentTarget);
    anime({
      targets: e.currentTarget,
      translateY: 0,
      scale: 1,
      duration: 200,
      easing: "easeOutQuad",
    });
  };

  const handleCtaEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    anime.remove(e.currentTarget);
    anime({
      targets: e.currentTarget,
      translateY: -2,
      scale: 1.04,
      duration: 300,
      easing: "easeOutElastic(1, .6)",
    });
  };

  const handleCtaLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    anime.remove(e.currentTarget);
    anime({
      targets: e.currentTarget,
      translateY: 0,
      scale: 1,
      duration: 250,
      easing: "easeOutQuad",
    });
  };

  const handleIndexBtnEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    anime.remove(e.currentTarget);
    anime({
      targets: e.currentTarget,
      translateX: 4,
      scale: 1.03,
      duration: 280,
      easing: "easeOutElastic(1, .7)",
    });
  };

  const handleIndexBtnLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    anime.remove(e.currentTarget);
    anime({
      targets: e.currentTarget,
      translateX: 0,
      scale: 1,
      duration: 220,
      easing: "easeOutQuad",
    });
  };

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

            <div
              ref={stageRef}
              className="selected-work-visual-stage"
              data-project-visual-stage
              onMouseMove={handleStageMouseMove}
              onMouseLeave={handleStageMouseLeave}
            >
              <div className="selected-work-stage-glow" aria-hidden="true" />
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
                  onMouseEnter={handleIndexBtnEnter}
                  onMouseLeave={handleIndexBtnLeave}
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
                    {project.tech.map((technology) => (
                      <span
                        key={technology}
                        onMouseEnter={handleTagEnter}
                        onMouseLeave={handleTagLeave}
                        style={{ cursor: "default" }}
                      >
                        {technology}
                      </span>
                    ))}
                  </div>

                  <div className="selected-work-cta">
                    {project.github ? (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        onMouseEnter={handleCtaEnter}
                        onMouseLeave={handleCtaLeave}
                      >
                        <Github aria-hidden="true" /> VIEW CODE
                      </a>
                    ) : (
                      <a
                        href="#contact"
                        onMouseEnter={handleCtaEnter}
                        onMouseLeave={handleCtaLeave}
                      >
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
