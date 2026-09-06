import { useLayoutEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface DepthTunnelHeroProps {
  scrollTo: (id: string) => void;
}

export function DepthTunnelHero({ scrollTo }: DepthTunnelHeroProps) {
  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const heroLayer = containerRef.current?.querySelector<HTMLElement>("[data-depth-hero]");
      const title = containerRef.current?.querySelector<HTMLElement>("[data-depth-title]");
      const secondary = containerRef.current?.querySelector<HTMLElement>("[data-depth-secondary]");
      const background = containerRef.current?.querySelector<HTMLElement>("[data-depth-background]");
      const tunnel = containerRef.current?.querySelector<HTMLElement>("[data-depth-tunnel]");
      const tunnelWord = containerRef.current?.querySelector<HTMLElement>("[data-depth-word]");
      const tunnelOutline = containerRef.current?.querySelector<HTMLElement>("[data-depth-outline]");
      const nextScene = containerRef.current?.querySelector<HTMLElement>("[data-depth-next]");
      const portal = containerRef.current?.querySelector<HTMLElement>("[data-depth-portal]");

      if (!heroLayer || !title || !secondary || !background || !tunnel || !tunnelWord || !tunnelOutline || !nextScene || !portal || reduceMotion) {
        return;
      }

      const titleScale = isMobile ? 1.12 : 1.34;
      const tunnelScale = isMobile ? 7 : 13;
      const depth = isMobile ? 140 : 340;
      gsap.set(background, {
        opacity: 0.48,
        scale: 1.08,
        yPercent: 3,
        transformOrigin: "50% 50%",
        force3D: true,
      });
      gsap.set(heroLayer, { opacity: 0, transformPerspective: 1200, transformOrigin: "50% 50%", force3D: true });
      gsap.set(title, { transformPerspective: 1200, transformOrigin: "50% 50%", force3D: true });
      gsap.set([tunnelWord, tunnelOutline], { transformPerspective: 1200, transformOrigin: "50% 50%", force3D: true });
      gsap.set(tunnel, { opacity: 0, z: -420, transformPerspective: 1200, force3D: true });
      gsap.set([nextScene, portal], { opacity: 0, z: -220, transformPerspective: 1200, force3D: true });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.65,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // 0–100%: establish the forward camera move through the tunnel.
      timeline
        .to(heroLayer, { opacity: 1, z: 0, scale: 1, yPercent: 0, duration: 0.08, ease: "power2.out" }, 0)
        .to(background, { opacity: 1, scale: 1.02, yPercent: 0, duration: 0.24 }, 0)
        .to(background, { scale: isMobile ? 1.06 : 1.14, yPercent: -4, duration: 0.66 }, 0.22)
        .to(heroLayer, { z: -depth, scale: isMobile ? 0.94 : 0.86, opacity: 0.2, yPercent: -3, duration: 0.3 }, 0.08)
        .to(title, { z: depth, scale: titleScale, yPercent: -2, duration: 0.28 }, 0.08)
        .to(secondary, { z: -depth * 1.3, y: isMobile ? -16 : -26, opacity: 0, duration: 0.2 }, 0.11)

        // 28–70%: reveal and pass through the AI portal in one continuous motion.
        .to(tunnel, { opacity: 1, z: 0, duration: 0.12 }, 0.28)
        .fromTo(tunnelWord, { scale: 0.3, opacity: 0, z: -420 }, { scale: 1, opacity: 1, z: 0, duration: 0.18 }, 0.33)
        .fromTo(tunnelOutline, { scale: 0.34, opacity: 0 }, { scale: 1, opacity: 0.78, duration: 0.16 }, 0.34)
        .to(tunnelWord, { scale: tunnelScale, z: 640, opacity: 0.9, duration: 0.34 }, 0.49)
        .to(tunnelOutline, { scale: tunnelScale * 1.03, z: 700, opacity: 0.24, duration: 0.34 }, 0.49)

        // 70–100%: settle into the next scene with a soft, controlled handoff.
        .to(nextScene, { opacity: 1, z: 0, scale: 1, duration: 0.22 }, 0.68)
        .to(portal, { opacity: 0.78, scale: isMobile ? 1.45 : 2, duration: 0.18 }, 0.7)
        .to(heroLayer, { opacity: 0, duration: 0.16 }, 0.72)
        .to(tunnel, { opacity: 0, duration: 0.16 }, 0.8)
        .to(portal, { opacity: 0, scale: 1, duration: 0.16 }, 0.87)
        .to(nextScene, { y: isMobile ? -6 : -12, duration: 0.13 }, 0.89);

      return () => {
        timeline.scrollTrigger?.kill();
      };
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="hero" className="depth-tunnel-shell" aria-label="Gokul A introduction">
      <div className="depth-tunnel-sticky">
        <div data-depth-background className="depth-tunnel-background" aria-hidden="true" />
        <div className="depth-tunnel-scrim" aria-hidden="true" />
        <div className="depth-tunnel-vignette" aria-hidden="true" />

        <div data-depth-portal className="depth-tunnel-portal" aria-hidden="true" />

        <div data-depth-next className="depth-tunnel-next" aria-hidden="true">
          <span className="depth-tunnel-kicker">ABOUT / 02</span>
          <p>Engineering<br />intelligent<br />systems.</p>
          <span className="depth-tunnel-next-line" />
        </div>

        <div data-depth-tunnel className="depth-tunnel-word-layer" aria-hidden="true">
          <span data-depth-outline className="depth-tunnel-word depth-tunnel-word-outline">AI</span>
          <span data-depth-word className="depth-tunnel-word depth-tunnel-word-fill">AI</span>
        </div>

        <div data-depth-hero className="depth-tunnel-hero-layer">
          <div className="depth-tunnel-topline">
            <span>GOKUL A<span className="depth-tunnel-accent">.</span></span>
            <span>01 / INTRO</span>
          </div>

          <div className="depth-tunnel-hero-grid">
            <div className="depth-tunnel-title-wrap">
              <span className="depth-tunnel-eyebrow">AI · ROBOTICS · DATA SCIENCE · CYBERSECURITY</span>
              <h1 data-depth-title className="depth-tunnel-title">Gokul A<sup>*</sup></h1>
            </div>

            <div data-depth-secondary className="depth-tunnel-secondary">
              <p>
                AI &amp; Robotics student at VIT Chennai and Data Science student at IIT Madras — exploring machine learning, autonomous systems, cybersecurity, and intelligent software.
              </p>
              <button type="button" onClick={() => scrollTo("projects")} className="depth-tunnel-cta">
                <span>Explore selected work</span>
                <span className="depth-tunnel-cta-icon" aria-hidden="true">↗</span>
              </button>
            </div>
          </div>

          <button type="button" onClick={() => scrollTo("about")} className="depth-tunnel-scroll-hint">
            <span>Scroll to explore</span>
            <ArrowDown aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
