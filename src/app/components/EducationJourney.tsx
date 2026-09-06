import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type EducationTrack = {
  id: string;
  institution: string;
  degree: string;
  startYear: string;
  endYear: string;
  status: string;
  description: string;
  accent: "cyan" | "purple";
};

type EducationJourneyProps = {
  tracks: EducationTrack[];
  title?: string;
  subtitle?: string;
};

const accentColors = {
  cyan: "#22d3ee",
  purple: "#a855f7",
};

export function EducationJourney({
  tracks,
  title = "Academic Journey",
  subtitle = "Two parallel programs shaping how I approach engineering, data, and intelligent systems.",
}: EducationJourneyProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || tracks.length !== 2) return;

    const context = gsap.context(() => {
      const header = section.querySelector<HTMLElement>("[data-academic-header]");
      const headerText = header ? Array.from(header.querySelectorAll<HTMLElement>(".academic-journey-kicker, h2, p, .academic-journey-mode")) : [];
      const continuation = section.querySelector<HTMLElement>("[data-academic-continuation]");
      const origin = section.querySelector<HTMLElement>("[data-academic-origin]");
      const spine = section.querySelector<HTMLElement>("[data-academic-spine]");
      const connectors = gsap.utils.toArray<HTMLElement>("[data-academic-connector]");
      const trackElements = gsap.utils.toArray<HTMLElement>("[data-academic-track]");
      const trackContents = gsap.utils.toArray<HTMLElement>("[data-academic-track-content]");
      const conclusion = section.querySelector<HTMLElement>("[data-academic-conclusion]");
      const contactLine = section.querySelector<HTMLElement>("[data-academic-contact-line]");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!header || headerText.length !== 4 || !continuation || !origin || !spine || connectors.length !== 2 || trackContents.length !== 2 || !conclusion || !contactLine) return;

      let activeTrack = -1;
      const setActiveTrack = (index: number) => {
        if (index === activeTrack) return;
        activeTrack = index;
        trackElements.forEach((track, trackIndex) => track.classList.toggle("is-active", trackIndex === index));
      };

      if (reduceMotion) {
        gsap.set([header, ...headerText, continuation, origin, spine, ...connectors, ...trackContents, conclusion, contactLine], {
          clearProps: "all",
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          scaleX: 1,
          scaleY: 1,
        });
        setActiveTrack(-1);
        return;
      }

      gsap.set(header, { opacity: 1, y: 0 });
      gsap.set(headerText, { opacity: 0, y: 16 });
      gsap.set(continuation, { opacity: 0.3, scaleY: 0.55, transformOrigin: "top center" });
      gsap.set(origin, { opacity: 0, y: 10 });
      gsap.set(spine, { scaleY: 0, transformOrigin: "top center" });
      gsap.set(connectors, { opacity: 0.25, scaleX: 0, transformOrigin: "center center" });
      gsap.set(trackElements, { opacity: 0.72 });
      gsap.set(trackContents[0], { opacity: 0, x: -24 });
      gsap.set(trackContents[1], { opacity: 0, x: 24 });
      gsap.set(conclusion, { opacity: 0, y: 12 });
      gsap.set(contactLine, { opacity: 0.2, scaleY: 0, transformOrigin: "top center" });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          end: "bottom 62%",
          scrub: 0.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const nextTrack = self.progress < 0.56 ? -1 : self.progress < 0.72 ? 0 : self.progress < 0.86 ? 1 : -1;
            setActiveTrack(nextTrack);
          },
        },
      });

      timeline
        .to(headerText, { opacity: 1, y: 0, duration: 0.16, stagger: 0.045, ease: "power2.out" }, 0)
        .to(continuation, { opacity: 0.85, scaleY: 1, duration: 0.1, ease: "none" }, 0.08)
        .to(origin, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, 0.12)
        .to(spine, { scaleY: 1, duration: 0.36, ease: "none" }, 0.2)
        .to(connectors, { opacity: 0.8, scaleX: 1, duration: 0.12, ease: "power2.out" }, 0.46)
        .to(trackElements, { opacity: 1, duration: 0.22, stagger: 0.06, ease: "power2.out" }, 0.47)
        .to(trackContents, { opacity: 1, x: 0, duration: 0.18, ease: "power2.out" }, 0.48)
        .to(conclusion, { opacity: 1, y: 0, duration: 0.16, ease: "power2.out" }, 0.78)
        .to(contactLine, { opacity: 0.75, scaleY: 1, duration: 0.12, ease: "none" }, 0.9);

      setActiveTrack(-1);
    }, sectionRef);

    return () => context.revert();
  }, [tracks.length]);

  return (
    <section ref={sectionRef} id="experience" className="academic-journey-shell">
      <div className="academic-journey-stage">
        <div className="academic-journey-continuation" data-academic-continuation aria-hidden="true" />

        <header className="academic-journey-header" data-academic-header>
          <div>
            <span className="academic-journey-kicker">ACADEMIC / 05</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <span className="academic-journey-mode">TWO TRACKS · ONE JOURNEY</span>
        </header>

        <div className="academic-journey-origin" data-academic-origin>
          <span className="academic-journey-origin-year">2025</span>
          <span className="academic-journey-origin-node" aria-hidden="true" />
          <span className="academic-journey-origin-label">PARALLEL PATHS</span>
        </div>

        <div className="academic-journey-spine" data-academic-spine aria-hidden="true" />
        <span className="academic-journey-connector academic-journey-connector-left" data-academic-connector aria-hidden="true" />
        <span className="academic-journey-connector academic-journey-connector-right" data-academic-connector aria-hidden="true" />

        <div className="academic-journey-track-grid">
          {tracks.map((track, index) => {
            const accent = accentColors[track.accent];
            return (
              <article
                key={track.id}
                className={`academic-journey-track academic-journey-track-${index === 0 ? "left" : "right"}`}
                data-academic-track
                style={{ "--academic-accent": accent } as CSSProperties & Record<string, string>}
              >
                <div className="academic-journey-track-content" data-academic-track-content>
                  <div className="academic-journey-track-meta">
                    <span>{String(index + 1).padStart(2, "0")} / {track.id.toUpperCase()}</span>
                    <span>{track.status}</span>
                  </div>
                  <h3>{track.institution}</h3>
                  <p className="academic-journey-degree">{track.degree}</p>
                  <p className="academic-journey-years">{track.startYear} — {track.endYear}</p>
                  <p className="academic-journey-description">{track.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="academic-journey-conclusion" data-academic-conclusion>
          <div className="academic-journey-conclusion-equation">
            <span>SYSTEMS</span>
            <i>×</i>
            <span>DATA</span>
          </div>
          <strong>BUILDING INTELLIGENT SYSTEMS</strong>
        </div>

        <div className="academic-journey-contact-line" data-academic-contact-line aria-hidden="true" />
      </div>
    </section>
  );
}
