import React, { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";

interface PrismaHeroProps {
  scrollTo: (id: string) => void;
}

export function PrismaHero({ scrollTo }: PrismaHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Video autoplay fallback
    const video = videoRef.current;
    if (video) {
      const playVideo = () => {
        video.play().catch(() => {});
      };
      video.addEventListener("canplay", playVideo);
      window.addEventListener("load", playVideo);
      playVideo();
      return () => {
        video.removeEventListener("canplay", playVideo);
        window.removeEventListener("load", playVideo);
      };
    }
  }, []);

  return (
    <div className="prisma-hero-container" id="hero">
      <style>{`
        .prisma-hero-container {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 640px;
          overflow: hidden;
          background-color: #0d0b09;
          color: #f3efe6;
          font-family: 'Inter', sans-serif;
        }

        /* BACKGROUND VIDEO */
        .bg-video {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          z-index: 0;
          pointer-events: none;
        }

        /* LEGIBILITY OVERLAY LAYERS */
        .scrim {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: 
            linear-gradient(to bottom, 
              rgba(13, 11, 9, 0.85) 0%, 
              rgba(13, 11, 9, 0.15) 22%, 
              rgba(13, 11, 9, 0.15) 72%, 
              rgba(13, 11, 9, 0.88) 100%
            ),
            radial-gradient(ellipse at center, transparent 35%, rgba(13, 11, 9, 0.65) 100%);
        }

        .vignette {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          box-shadow: inset 0 0 220px 70px #0d0b09;
        }

        /* HERO CONTENT WRAPPER */
        .hero-content {
          position: relative;
          z-index: 3;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 4rem 4rem 4rem;
          box-sizing: border-box;
        }

        /* ENTRANCE ANIMATION (BLUR FADE UP) */
        @keyframes blurFadeUp {
          from {
            opacity: 0;
            filter: blur(18px);
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }

        .rise {
          opacity: 0;
          animation: blurFadeUp 1s cubic-bezier(0.2, 0.7, 0.2, 1) forwards;
        }

        /* HERO GRID */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: flex-end;
          gap: 3rem;
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
        }

        .hero-title-col {
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
        }

        .hero-h1 {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 500;
          font-size: clamp(72px, 12.5vw, 196px);
          line-height: 0.86;
          letter-spacing: -0.045em;
          color: #f3efe6;
          margin: 0;
          user-select: none;
          white-space: nowrap;
        }

        .hero-h1 sup {
          font-size: 0.45em;
          vertical-align: top;
          position: relative;
          top: -0.15em;
          margin-left: -0.04em;
          font-weight: 400;
        }

        .hero-info-col {
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          margin-bottom: 0.4rem;
        }

        .hero-subline {
          font-family: 'Inter', sans-serif;
          font-weight: 400;
          font-size: 1.05rem;
          line-height: 1.55;
          color: rgba(243, 239, 230, 0.7);
          margin-bottom: 1.8rem;
        }

        /* CTA PILL */
        .cta-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.55rem 0.55rem 0.55rem 1.4rem;
          background: rgba(243, 239, 230, 0.06);
          border: 1px solid rgba(243, 239, 230, 0.16);
          border-radius: 9999px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          color: #f3efe6;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 0.925rem;
          letter-spacing: 0.01em;
          transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1), background 0.3s ease, border-color 0.3s ease;
          cursor: pointer;
        }

        .cta-pill:hover {
          transform: translateY(-2px);
          background: rgba(243, 239, 230, 0.12);
          border-color: rgba(243, 239, 230, 0.3);
        }

        .cta-icon-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(243, 239, 230, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.4s cubic-bezier(0.2, 0.7, 0.2, 1), background 0.3s ease;
        }

        .cta-icon-circle svg {
          width: 16px;
          height: 16px;
          stroke: #f3efe6;
          stroke-width: 2;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .cta-pill:hover .cta-icon-circle {
          transform: rotate(45deg);
          background: rgba(243, 239, 230, 0.28);
        }

        /* SCROLL DOWN INDICATOR */
        .scroll-down-hint {
          position: absolute;
          bottom: 1.2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
          color: rgba(243, 239, 230, 0.4);
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .scroll-down-hint:hover {
          color: #f3efe6;
        }

        .scroll-down-icon {
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(6px); }
          60% { transform: translateY(3px); }
        }

        /* RESPONSIVE */
        @media (max-width: 900px) {
          .hero-content {
            padding: 2rem 2rem 3rem;
          }

          .hero-grid {
            grid-template-columns: 1fr;
            align-items: flex-start;
            gap: 2.5rem;
          }

          .hero-info-col {
            max-width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rise {
            animation: none !important;
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
          }

          .cta-pill, .cta-icon-circle {
            transition: none !important;
            transform: none !important;
          }

          .cta-pill:hover .cta-icon-circle {
            transform: none !important;
          }
        }
      `}</style>

      {/* BACKGROUND VIDEO */}
      <video
        ref={videoRef}
        className="bg-video"
        src="https://zxdefgavgwfxastwmmjm.supabase.co/storage/v1/object/public/assets/prisma.mp4"
        autoPlay
        muted
        loop
        playsInline
      />

      {/* LEGIBILITY OVERLAYS */}
      <div className="scrim" />
      <div className="vignette" />

      {/* HERO CONTENT */}
      <div className="hero-content">
        {/* HERO MAIN GRID */}
        <div className="hero-grid">
          <div className="hero-title-col">
            <h1 className="hero-h1 rise" style={{ animationDelay: "200ms" }}>
              Gokul A<sup>*</sup>
            </h1>
          </div>
          <div className="hero-info-col">
            <p className="hero-subline rise" style={{ animationDelay: "360ms" }}>
              AI & Robotics student at VIT Chennai and Data Science student at IIT Madras — exploring machine learning, autonomous systems, cybersecurity, and intelligent software.
            </p>
            <button
              onClick={() => scrollTo("projects")}
              className="cta-pill rise"
              style={{ animationDelay: "500ms" }}
            >
              <span>Explore Selected Work</span>
              <div className="cta-icon-circle">
                <svg viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* SCROLL HINT */}
        <div onClick={() => scrollTo("about")} className="scroll-down-hint rise" style={{ animationDelay: "650ms" }}>
          <span>Scroll to explore</span>
          <div className="scroll-down-icon">
            <ArrowDown style={{ width: "14px", height: "14px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
