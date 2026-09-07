import { useLayoutEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import anime from "animejs";

gsap.registerPlugin(ScrollTrigger);

interface DepthTunnelHeroProps {
  scrollTo: (id: string) => void;
}

export function DepthTunnelHero({ scrollTo }: DepthTunnelHeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const ctaBtnRef = useRef<HTMLButtonElement>(null);
  const ctaIconRef = useRef<HTMLSpanElement>(null);
  const scrollHintRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroLayer = containerRef.current?.querySelector<HTMLElement>("[data-depth-hero]");
    const title = containerRef.current?.querySelector<HTMLElement>("[data-depth-title]");
    const secondary = containerRef.current?.querySelector<HTMLElement>("[data-depth-secondary]");
    const topline = containerRef.current?.querySelector<HTMLElement>(".depth-tunnel-topline");
    const eyebrow = containerRef.current?.querySelector<HTMLElement>(".depth-tunnel-eyebrow");
    const scrollHint = containerRef.current?.querySelector<HTMLElement>(".depth-tunnel-scroll-hint");
    const background = containerRef.current?.querySelector<HTMLElement>("[data-depth-background]");
    const visionLayer = containerRef.current?.querySelector<HTMLElement>("[data-depth-vision-layer]");
    const visionContainer = containerRef.current?.querySelector<HTMLElement>("[data-depth-vision]");
    const visionHeadline = containerRef.current?.querySelector<HTMLElement>(".depth-vision-headline");
    const visionSubtext = containerRef.current?.querySelector<HTMLElement>(".depth-vision-subtext");
    const visionKicker = containerRef.current?.querySelector<HTMLElement>(".depth-vision-kicker");
    const visionAura = containerRef.current?.querySelector<HTMLElement>(".depth-vision-aura");
    const visionPillars = gsap.utils.toArray<HTMLElement>("[data-vision-pillar]");
    const pillarLeft = containerRef.current?.querySelector<HTMLElement>('[data-vision-pillar="1"]');
    const pillarCenter = containerRef.current?.querySelector<HTMLElement>('[data-vision-pillar="2"]');
    const pillarRight = containerRef.current?.querySelector<HTMLElement>('[data-vision-pillar="3"]');
    const nextScene = containerRef.current?.querySelector<HTMLElement>("[data-depth-next]");
    const portal = containerRef.current?.querySelector<HTMLElement>("[data-depth-portal]");
    const heroChars = containerRef.current?.querySelectorAll<HTMLElement>(".anime-hero-char");

    if (!heroLayer || !title || !secondary || !background || !visionLayer || !visionContainer || !nextScene || !portal || reduceMotion) {
      return;
    }

    const titleScale = isMobile ? 1.12 : 1.25;
    const depth = isMobile ? 140 : 320;

    // --- ANIME.JS KINETIC ENTRANCE (Subtle spring lift, keeping 100% visibility) ---
    let entranceAnime: anime.AnimeTimelineInstance | null = null;
    let portalAnime: anime.AnimeInstance | null = null;
    let auraAnime: anime.AnimeInstance | null = null;

    try {
      if (window.scrollY < 40) {
        entranceAnime = anime.timeline({
          easing: "easeOutExpo",
        });

        entranceAnime
          .add({
            targets: topline,
            translateY: [-12, 0],
            duration: 650,
          }, 50)
          .add({
            targets: eyebrow,
            translateY: [14, 0],
            duration: 750,
          }, 120)
          .add({
            targets: heroChars ? Array.from(heroChars) : [],
            translateY: [32, 0],
            rotateX: [25, 0],
            duration: 800,
            delay: anime.stagger(35),
          }, 180)
          .add({
            targets: secondary,
            translateY: [16, 0],
            duration: 700,
            easing: "easeOutCubic",
          }, 360)
          .add({
            targets: scrollHint,
            translateY: [12, 0],
            duration: 600,
          }, 480);
      }

      // --- ANIME.JS PORTAL BREATHING ENERGY LOOP ---
      portalAnime = anime({
        targets: portal,
        boxShadow: [
          "0 0 45px 10px rgba(199, 152, 99, 0.12)",
          "0 0 85px 24px rgba(199, 152, 99, 0.24)",
          "0 0 45px 10px rgba(199, 152, 99, 0.12)",
        ],
        duration: 3400,
        loop: true,
        easing: "easeInOutSine",
      });

      // --- ANIME.JS AMBIENT VISION AURA BREATHING ---
      auraAnime = anime({
        targets: visionAura,
        opacity: [0.6, 0.95, 0.6],
        scale: [0.96, 1.04, 0.96],
        duration: 4500,
        loop: true,
        easing: "easeInOutSine",
      });
    } catch (e) {
      console.warn("Anime.js entrance failed:", e);
    }

    // --- GSAP SCROLL-TRIGGERED CAMERA TRANSLATION ---
    const ctx = gsap.context(() => {
      // Initial GSAP coordinates
      gsap.set(background, {
        opacity: 1,
        scale: 1,
        yPercent: 0,
        transformOrigin: "50% 50%",
        force3D: true,
      });
      gsap.set(heroLayer, {
        opacity: 1,
        visibility: "visible",
        transformPerspective: 1200,
        transformOrigin: "50% 50%",
        force3D: true,
      });
      gsap.set(title, {
        opacity: 1,
        scale: 1,
        z: 0,
        yPercent: 0,
        transformPerspective: 1200,
        transformOrigin: "50% 50%",
        force3D: true,
      });
      gsap.set(visionLayer, {
        opacity: 0,
        visibility: "hidden",
        z: -300,
        transformPerspective: 1200,
        force3D: true,
      });
      gsap.set(visionContainer, {
        opacity: 0,
        scale: 0.72,
        z: -260,
        transformPerspective: 1200,
        transformOrigin: "50% 50%",
        force3D: true,
      });
      gsap.set(visionPillars, {
        opacity: 1,
        x: 0,
        y: 0,
        z: 0,
        transformPerspective: 1200,
        force3D: true,
      });
      gsap.set([nextScene, portal], {
        opacity: 0,
        visibility: "hidden",
        z: -200,
        transformPerspective: 1200,
        force3D: true,
      });

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

      // --- 1. CONTINUOUS ARCHITECTURAL TUNNEL MOTION (0.00 -> 0.70) ---
      timeline.to(background, {
        scale: isMobile ? 1.08 : 1.18,
        yPercent: -4,
        duration: 0.70,
      }, 0);

      // --- 2. HERO LAYER DEPARTURE (0.00 -> 0.20) ---
      const headerElements = [topline, scrollHint].filter(Boolean);
      if (headerElements.length > 0) {
        timeline.to(headerElements, {
          opacity: 0,
          y: isMobile ? -10 : -16,
          duration: 0.08,
        }, 0);
      }

      if (secondary) {
        timeline.to(secondary, {
          opacity: 0,
          y: isMobile ? -14 : -24,
          z: -depth * 0.7,
          duration: 0.12,
        }, 0.02);
      }

      if (eyebrow) {
        timeline.to(eyebrow, {
          opacity: 0,
          y: -10,
          duration: 0.11,
        }, 0.02);
      }

      // "Gokul A" zooms subtly forward and cleanly fades to 0
      timeline.to(title, {
        z: depth * 0.55,
        scale: titleScale,
        opacity: 0,
        duration: 0.15,
        ease: "power1.out",
      }, 0.02);

      // Hero layer completely hides by 0.18 so Gokul A is 100% gone
      timeline.to(heroLayer, {
        opacity: 0,
        autoAlpha: 0,
        duration: 0.16,
      }, 0.02);

      // --- 3. HUMANE EDITORIAL PERSPECTIVE EMERGENCE & 3D FLYTHROUGH (0.20 -> 0.62) ---
      timeline.set(visionLayer, { visibility: "visible" }, 0.20);
      timeline.to(visionLayer, { opacity: 1, z: 0, duration: 0.08 }, 0.20);

      // Vision Container zooms into crystal-clear editorial focus from the depth
      timeline.fromTo(
        visionContainer,
        { scale: 0.72, opacity: 0, z: -260 },
        { scale: 1, opacity: 1, z: 0, duration: 0.16, ease: "power1.out" },
        0.21
      );

      // Camera accelerates and smoothly glides through the 3 pillars
      const pillarSpreadX = isMobile ? 140 : 280;

      if (pillarLeft) {
        timeline.to(pillarLeft, { x: -pillarSpreadX, y: -20, scale: 1.8, z: 460, duration: 0.22, ease: "power2.in" }, 0.38);
      }
      if (pillarRight) {
        timeline.to(pillarRight, { x: pillarSpreadX, y: -20, scale: 1.8, z: 460, duration: 0.22, ease: "power2.in" }, 0.38);
      }
      if (pillarCenter) {
        timeline.to(pillarCenter, { y: 60, scale: 2.1, z: 540, duration: 0.22, ease: "power2.in" }, 0.38);
      }

      // Pillars dissolve cleanly as they pass camera
      timeline.to(visionPillars, {
        opacity: 0,
        duration: 0.12,
        ease: "power2.in",
      }, 0.46);

      // Headline and subtext lift softly and dissolve
      if (visionHeadline) {
        timeline.to(visionHeadline, { y: -50, scale: 1.2, z: 320, opacity: 0, duration: 0.18, ease: "power2.in" }, 0.38);
      }
      if (visionSubtext) {
        timeline.to(visionSubtext, { y: -30, opacity: 0, duration: 0.12, ease: "power2.in" }, 0.38);
      }
      if (visionKicker) {
        timeline.to(visionKicker, { opacity: 0, duration: 0.08 }, 0.38);
      }
      if (visionAura) {
        timeline.to(visionAura, { scale: 2.2, opacity: 0, duration: 0.18, ease: "power2.in" }, 0.38);
      }

      timeline.to(visionLayer, {
        opacity: 0,
        duration: 0.08,
      }, 0.58);
      timeline.set(visionLayer, { visibility: "hidden" }, 0.62);

      // --- 4. PROLOGUE / NEXT SCENE (0.62 -> 0.96) ---
      timeline.set([nextScene, portal], { visibility: "visible" }, 0.62);
      timeline.to(nextScene, {
        opacity: 1,
        z: 0,
        scale: 1,
        duration: 0.14,
        ease: "power1.out",
      }, 0.63);
      timeline.to(portal, {
        opacity: 0.78,
        scale: isMobile ? 1.4 : 1.9,
        duration: 0.14,
      }, 0.64);

      // Soft dissolve into the About section below
      timeline.to(portal, {
        opacity: 0,
        scale: 1,
        duration: 0.12,
      }, 0.80);
      timeline.to(nextScene, {
        y: isMobile ? -35 : -55,
        opacity: 0,
        filter: "blur(6px)",
        duration: 0.14,
        ease: "power2.in",
      }, 0.82);
      timeline.set([nextScene, portal], { visibility: "hidden" }, 0.96);

      return () => {
        timeline.scrollTrigger?.kill();
      };
    }, containerRef);

    return () => {
      ctx.revert();
      try {
        portalAnime?.pause();
        entranceAnime?.pause();
        auraAnime?.pause();
      } catch (e) {}
    };
  }, []);

  // --- ANIME.JS BUTTON MICRO-INTERACTIONS ---
  const handleCtaMouseEnter = () => {
    if (ctaBtnRef.current && ctaIconRef.current) {
      anime.remove([ctaBtnRef.current, ctaIconRef.current]);
      anime({
        targets: ctaBtnRef.current,
        translateY: -3,
        scale: 1.03,
        duration: 350,
        easing: "easeOutElastic(1, .7)",
      });
      anime({
        targets: ctaIconRef.current,
        rotate: 45,
        scale: 1.18,
        duration: 400,
        easing: "easeOutElastic(1, .6)",
      });
    }
  };

  const handleCtaMouseLeave = () => {
    if (ctaBtnRef.current && ctaIconRef.current) {
      anime.remove([ctaBtnRef.current, ctaIconRef.current]);
      anime({
        targets: ctaBtnRef.current,
        translateY: 0,
        scale: 1,
        duration: 300,
        easing: "easeOutQuad",
      });
      anime({
        targets: ctaIconRef.current,
        rotate: 0,
        scale: 1,
        duration: 300,
        easing: "easeOutQuad",
      });
    }
  };

  const handleScrollHintEnter = () => {
    if (scrollHintRef.current) {
      anime({
        targets: scrollHintRef.current.querySelector("svg"),
        translateY: 5,
        duration: 300,
        easing: "easeOutElastic(1, .5)",
      });
    }
  };

  const handleScrollHintLeave = () => {
    if (scrollHintRef.current) {
      anime({
        targets: scrollHintRef.current.querySelector("svg"),
        translateY: 0,
        duration: 300,
        easing: "easeOutQuad",
      });
    }
  };

  return (
    <section ref={containerRef} id="hero" className="depth-tunnel-shell" aria-label="Gokul A introduction">
      <div className="depth-tunnel-sticky">
        <div data-depth-background className="depth-tunnel-background" aria-hidden="true" />
        <div className="depth-tunnel-scrim" aria-hidden="true" />
        <div className="depth-tunnel-vignette" aria-hidden="true" />

        <div data-depth-portal className="depth-tunnel-portal" aria-hidden="true" />

        <div data-depth-next className="depth-tunnel-next" aria-hidden="true">
          <span className="depth-tunnel-kicker">PROLOGUE</span>
          <p>Where neural code<br />meets physical<br />reality.</p>
          <span className="depth-tunnel-next-line" />
        </div>

        {/* Humane Editorial Vision Layer (Clean, Purpose-Driven & Humane) */}
        <div data-depth-vision-layer className="depth-tunnel-vision-layer" aria-hidden="true">
          <div data-depth-vision className="depth-vision-container">
            <div className="depth-vision-aura" aria-hidden="true" />

            <div className="depth-vision-content">
              <div className="depth-vision-kicker">
                <span className="depth-vision-kicker-dot" />
                <span>PERSPECTIVE &amp; PHILOSOPHY</span>
              </div>

              <h2 className="depth-vision-headline">
                Building intelligent systems that honor <em>human curiosity</em>.
              </h2>

              <p className="depth-vision-subtext">
                Pursuing autonomous robotics at VIT Chennai and data science at IIT Madras — uniting physical intuition, mathematical rigor, and dependable software.
              </p>

              <div className="depth-vision-pillars">
                <div data-vision-pillar="1" className="depth-vision-pillar">
                  <span className="depth-vision-num">01 / PERCEPTION</span>
                  <h3 className="depth-vision-pillar-title">Physical Systems</h3>
                  <p className="depth-vision-pillar-desc">
                    Robotics, SLAM, and sensor fusion — empowering machines to see, interpret, and move safely through real physical environments.
                  </p>
                </div>

                <div data-vision-pillar="2" className="depth-vision-pillar">
                  <span className="depth-vision-num">02 / COGNITION</span>
                  <h3 className="depth-vision-pillar-title">Neural Intelligence</h3>
                  <p className="depth-vision-pillar-desc">
                    Deep learning, multi-agent reasoning, and statistical pipelines — turning high-dimensional data into principled decisions.
                  </p>
                </div>

                <div data-vision-pillar="3" className="depth-vision-pillar">
                  <span className="depth-vision-num">03 / INTEGRITY</span>
                  <h3 className="depth-vision-pillar-title">Resilience &amp; Trust</h3>
                  <p className="depth-vision-pillar-desc">
                    Cyber defense, fault-tolerant architectures, and rigorous simulation — creating software that humans can reliably depend on.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div data-depth-hero className="depth-tunnel-hero-layer">
          <div className="depth-tunnel-topline">
            <span>GOKUL A<span className="depth-tunnel-accent">.</span></span>
            <span>01 / INTRO</span>
          </div>

          <div className="depth-tunnel-hero-grid">
            <div className="depth-tunnel-title-wrap">
              <span className="depth-tunnel-eyebrow">AI · ROBOTICS · DATA SCIENCE · CYBERSECURITY</span>
              <h1 data-depth-title className="depth-tunnel-title">
                {"Gokul A".split("").map((char, index) => (
                  <span
                    key={index}
                    className="inline-block anime-hero-char"
                    style={{ display: "inline-block", willChange: "transform, opacity" }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </h1>
            </div>

            <div data-depth-secondary className="depth-tunnel-secondary">
              <p>
                AI &amp; Robotics student at VIT Chennai and Data Science student at IIT Madras — exploring machine learning, autonomous systems, cybersecurity, and intelligent software.
              </p>
              <button
                ref={ctaBtnRef}
                type="button"
                onClick={() => scrollTo("projects")}
                onMouseEnter={handleCtaMouseEnter}
                onMouseLeave={handleCtaMouseLeave}
                className="depth-tunnel-cta"
              >
                <span>Explore selected work</span>
                <span ref={ctaIconRef} className="depth-tunnel-cta-icon" aria-hidden="true">↗</span>
              </button>
            </div>
          </div>

          <button
            ref={scrollHintRef}
            type="button"
            onClick={() => scrollTo("about")}
            onMouseEnter={handleScrollHintEnter}
            onMouseLeave={handleScrollHintLeave}
            className="depth-tunnel-scroll-hint"
          >
            <span>Scroll to explore</span>
            <ArrowDown aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}
