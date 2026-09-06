import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const projectsData = [
  {
    title: "SIEGE — Cyber Simulation Platform",
    description: "Real-time cyber attack and defense simulator using FastAPI, WebSockets, and React, featuring live event streaming, attack modules, analytics dashboards, and Dockerized deployment.",
    tech: ["FastAPI", "WebSockets", "React", "Docker", "Analytics"],
    year: "2026",
    github: "https://github.com/CapedCrusader77/SEIGE",
    tag: "CYBERSECURITY"
  },
  {
    title: "Stock Market Predictor",
    description: "Advanced machine learning model for predicting stock price movements using LSTM neural networks, technical indicators, and sentiment analysis from financial news.",
    tech: ["Python", "TensorFlow", "LSTM", "Pandas", "Scikit-Learn"],
    year: "2026",
    github: "https://github.com/CapedCrusader77",
    tag: "DATA SCIENCE"
  },
  {
    title: "SentinelML — Intrusion Detection System",
    description: "High-throughput network anomaly detector utilizing Random Forest and XGBoost classifiers, processing real-time PCAP traffic streams via Scapy to flag malicious activity.",
    tech: ["Python", "XGBoost", "Scapy", "Network Security", "Pandas"],
    year: "2026",
    github: "https://github.com/CapedCrusader77",
    tag: "MACHINE LEARNING"
  }
];

const skillsCategories = [
  { label: "All", skills: ["Python", "C/C++", "Algorithms", "ROS2", "Linux", "React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", "PostgreSQL", "MongoDB", "AWS", "Docker", "Git", "Machine Learning", "Data Science", "Cybersecurity", "Robotics"] },
  { label: "AI & Robotics", skills: ["Python", "ROS2", "LiDAR", "A* Pathfinding", "Q-Learning", "TensorFlow", "PyTorch", "Robotics", "Machine Learning", "Data Science"] },
  { label: "Systems & Security", skills: ["C/C++", "Algorithms", "Linux", "Cybersecurity", "FastAPI", "WebSockets", "Scapy", "XGBoost", "Docker", "AWS", "PostgreSQL"] },
  { label: "Web & Tools", skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", "MongoDB", "GraphQL", "Git", "Three.js", "Figma"] }
];

export function PrismaLanding() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Scroll Reveal Intersection Observer
    const revealElements = document.querySelectorAll(".reveal-block");
    if ("IntersectionObserver" in window) {
      const observerOptions = {
        threshold: 0.14,
        rootMargin: "0px 0px -8% 0px",
      };
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, observerOptions);

      revealElements.forEach((el) => observer.observe(el));

      return () => {
        revealElements.forEach((el) => observer.unobserve(el));
      };
    } else {
      revealElements.forEach((el) => el.classList.add("is-visible"));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message sent! Gokul will reach out to you shortly.");
      setFormData({ name: "", email: "", message: "" });
    }, 1500);
  };

  const currentSkills = skillsCategories.find((c) => c.label === activeCategory)?.skills || skillsCategories[0].skills;

  return (
    <div className="prisma-wrapper">
      <style>{`
        /* RESET & BASE */
        .prisma-wrapper *, .prisma-wrapper *::before, .prisma-wrapper *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .prisma-wrapper {
          background-color: #0d0b09;
          color: #f3efe6;
          font-family: 'Inter', sans-serif;
          font-size: 16px;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          min-height: 100vh;
          width: 100%;
          position: relative;
          overflow-x: hidden;
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
              rgba(13, 11, 9, 0.12) 22%, 
              rgba(13, 11, 9, 0.12) 72%, 
              rgba(13, 11, 9, 0.88) 100%
            ),
            radial-gradient(ellipse at center, transparent 35%, rgba(13, 11, 9, 0.6) 100%);
        }

        .vignette {
          position: fixed;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          box-shadow: inset 0 0 220px 70px #0d0b09;
        }

        /* MAIN CONTAINER */
        .page-content {
          position: relative;
          z-index: 3;
          width: 100%;
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

        /* NAVIGATION */
        .main-nav {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2.2rem 1.5rem;
          z-index: 10;
        }

        .nav-list {
          display: flex;
          align-items: center;
          gap: 2.5rem;
          list-style: none;
        }

        .nav-link {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(243, 239, 230, 0.7);
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: #f3efe6;
        }

        /* HERO SECTION */
        .hero-section {
          height: 100vh;
          min-height: 640px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 4rem 4rem 4.5rem;
          box-sizing: border-box;
          position: relative;
          overflow: hidden;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: flex-end;
          gap: 3rem;
          width: 100%;
          max-width: 1360px;
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
          font-size: clamp(72px, 11.5vw, 180px);
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
          border-style: solid;
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

        /* BELOW THE FOLD CONTENT */
        .body-sections {
          position: relative;
          padding-top: 5rem;
          padding-bottom: 2rem;
        }

        .section-container {
          width: 100%;
          max-width: 1360px;
          margin: 0 auto 7rem auto;
          padding: 0 4rem;
        }

        /* SECTION TITLES & EYEBROWS */
        .eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(243, 239, 230, 0.46);
          margin-bottom: 1.25rem;
          display: block;
        }

        .section-title {
          font-family: 'Inter Tight', sans-serif;
          font-size: clamp(2rem, 3.8vw, 3.25rem);
          font-weight: 500;
          line-height: 1.08;
          letter-spacing: -0.035em;
          color: #f3efe6;
          margin-bottom: 1.25rem;
        }

        .lead-line {
          font-family: 'Inter', sans-serif;
          font-size: 1.125rem;
          line-height: 1.55;
          color: rgba(243, 239, 230, 0.7);
          max-width: 650px;
          margin-bottom: 3.75rem;
        }

        /* CARDS GRID */
        .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.75rem;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .card {
          border-radius: 20px;
          border: 1px solid rgba(243, 239, 230, 0.16);
          background: rgba(13, 11, 9, 0.32);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          padding: 2.75rem 2.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 280px;
          transition: border-color 0.35s ease, background 0.35s ease, transform 0.35s ease;
        }

        .card:hover {
          border-color: rgba(243, 239, 230, 0.32);
          background: rgba(13, 11, 9, 0.48);
          transform: translateY(-3px);
        }

        .card-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85rem;
          font-weight: 500;
          color: rgba(243, 239, 230, 0.46);
          margin-bottom: 2rem;
          display: block;
        }

        .card-heading {
          font-family: 'Inter Tight', sans-serif;
          font-size: 1.4rem;
          font-weight: 500;
          letter-spacing: -0.025em;
          color: #f3efe6;
          margin-bottom: 0.85rem;
        }

        .card-copy {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          line-height: 1.55;
          color: rgba(243, 239, 230, 0.7);
        }

        .tech-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .tech-pill {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          border: 1px solid rgba(243, 239, 230, 0.16);
          background: rgba(243, 239, 230, 0.04);
          color: rgba(243, 239, 230, 0.7);
        }

        /* PULL-QUOTE BAND */
        .pullquote-band {
          width: 100%;
          border-top: 1px solid rgba(243, 239, 230, 0.16);
          border-bottom: 1px solid rgba(243, 239, 230, 0.16);
          padding: 7rem 2rem;
          margin: 7rem 0;
          text-align: center;
          background: rgba(13, 11, 9, 0.22);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .pullquote-text {
          font-family: 'Inter Tight', sans-serif;
          font-size: clamp(1.85rem, 4vw, 3.2rem);
          font-weight: 500;
          line-height: 1.22;
          letter-spacing: -0.035em;
          color: #f3efe6;
          max-width: 940px;
          margin: 0 auto;
        }

        /* SKILLS FILTER & GRID */
        .filter-buttons {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          padding: 0.5rem 1.2rem;
          border-radius: 9999px;
          border: 1px solid rgba(243, 239, 230, 0.16);
          background: rgba(243, 239, 230, 0.04);
          color: rgba(243, 239, 230, 0.7);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn.active, .filter-btn:hover {
          background: rgba(243, 239, 230, 0.12);
          border-color: rgba(243, 239, 230, 0.32);
          color: #f3efe6;
        }

        .skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .skill-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          padding: 0.6rem 1.1rem;
          border-radius: 12px;
          border: 1px solid rgba(243, 239, 230, 0.16);
          background: rgba(13, 11, 9, 0.35);
          backdrop-filter: blur(12px);
          color: #f3efe6;
          transition: border-color 0.3s ease, background 0.3s ease;
        }

        .skill-tag:hover {
          border-color: rgba(243, 239, 230, 0.35);
          background: rgba(243, 239, 230, 0.08);
        }

        /* CONTACT FORM GRID */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          color: rgba(243, 239, 230, 0.7);
          text-transform: uppercase;
        }

        .form-input, .form-textarea {
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          padding: 0.9rem 1.2rem;
          border-radius: 12px;
          border: 1px solid rgba(243, 239, 230, 0.16);
          background: rgba(13, 11, 9, 0.35);
          backdrop-filter: blur(16px);
          color: #f3efe6;
          outline: none;
          transition: border-color 0.3s ease, background 0.3s ease;
        }

        .form-input:focus, .form-textarea:focus {
          border-color: rgba(243, 239, 230, 0.4);
          background: rgba(13, 11, 9, 0.55);
        }

        .social-link-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-radius: 14px;
          border: 1px solid rgba(243, 239, 230, 0.16);
          background: rgba(13, 11, 9, 0.35);
          backdrop-filter: blur(16px);
          color: #f3efe6;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
          margin-bottom: 1rem;
        }

        .social-link-card:hover {
          border-color: rgba(243, 239, 230, 0.35);
          background: rgba(13, 11, 9, 0.5);
          transform: translateX(4px);
        }

        /* FOOTER BAR */
        .footer-bar {
          border-top: 1px solid rgba(243, 239, 230, 0.16);
          margin-top: 7rem;
          padding: 2.5rem 4rem 3.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          max-width: 1360px;
          margin-left: auto;
          margin-right: auto;
        }

        .footer-brand {
          font-family: 'Inter Tight', sans-serif;
          font-weight: 600;
          font-size: 1.25rem;
          letter-spacing: -0.03em;
          color: #f3efe6;
          text-decoration: none;
        }

        .footer-brand sup {
          font-size: 0.45em;
          vertical-align: top;
          font-weight: 400;
        }

        .footer-copy {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: rgba(243, 239, 230, 0.46);
        }

        .footer-links {
          display: flex;
          gap: 2rem;
          list-style: none;
        }

        .footer-link {
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          color: rgba(243, 239, 230, 0.46);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: #f3efe6;
        }

        /* SCROLL REVEAL ANIMATIONS */
        .reveal-block {
          opacity: 0;
          transform: translateY(26px);
          transition: opacity 0.85s cubic-bezier(0.2, 0.7, 0.2, 1), transform 0.85s cubic-bezier(0.2, 0.7, 0.2, 1);
        }

        .reveal-block.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* RESPONSIVE STYLES */
        @media (max-width: 900px) {
          .nav-list {
            display: none;
          }

          .hero-section {
            padding: 3rem 2rem 3.5rem;
            height: auto;
            min-height: 100vh;
            justify-content: flex-end;
          }

          .hero-grid {
            grid-template-columns: 1fr;
            align-items: flex-start;
            gap: 2.5rem;
          }

          .hero-info-col {
            max-width: 100%;
          }

          .section-container {
            padding: 0 2rem;
            margin-bottom: 5rem;
          }

          .cards-grid, .projects-grid, .contact-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .footer-bar {
            flex-direction: column;
            gap: 1.75rem;
            text-align: center;
            padding: 2.5rem 2rem 3.5rem;
          }

          .footer-links {
            justify-content: center;
          }
        }

        /* ACCESSIBILITY: PREFERS REDUCED MOTION */
        @media (prefers-reduced-motion: reduce) {
          .rise {
            animation: none !important;
            opacity: 1 !important;
            filter: none !important;
            transform: none !important;
          }

          .reveal-block {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }

          .cta-pill,
          .cta-icon-circle,
          .nav-link,
          .card,
          .footer-link {
            transition: none !important;
            transform: none !important;
          }

          .cta-pill:hover .cta-icon-circle {
            transform: none !important;
          }
        }
      `}</style>

      {/* LEGIBILITY OVERLAY LAYERS */}
      <div className="scrim" />
      <div className="vignette" />

      {/* MAIN PAGE WRAPPER */}
      <div className="page-content">
        {/* NAVIGATION */}
        <header>
          <nav className="main-nav" aria-label="Main Navigation">
            <ul className="nav-list">
              <li className="rise" style={{ animationDelay: "0ms" }}>
                <a href="#hero" className="nav-link">Story</a>
              </li>
              <li className="rise" style={{ animationDelay: "70ms" }}>
                <a href="#focus" className="nav-link">Focus</a>
              </li>
              <li className="rise" style={{ animationDelay: "140ms" }}>
                <a href="#projects" className="nav-link">Selected Work</a>
              </li>
              <li className="rise" style={{ animationDelay: "210ms" }}>
                <a href="#education" className="nav-link">Education</a>
              </li>
              <li className="rise" style={{ animationDelay: "280ms" }}>
                <a href="#contact" className="nav-link">Inquiries</a>
              </li>
            </ul>
          </nav>
        </header>

        <main>
          {/* HERO SECTION */}
          <section className="hero-section" id="hero">
            <div className="hero-grid">
              <div className="hero-title-col">
                <h1 className="hero-h1 rise" style={{ animationDelay: "400ms" }}>
                  Gokul A<sup>*</sup>
                </h1>
              </div>
              <div className="hero-info-col">
                <p className="hero-subline rise" style={{ animationDelay: "560ms" }}>
                  AI & Robotics student at VIT Chennai and Data Science student at IIT Madras — bound by a shared curiosity for autonomous systems, machine learning, and cybersecurity.
                </p>
                <a href="#projects" className="cta-pill rise" style={{ animationDelay: "700ms" }}>
                  <span>Explore Selected Work</span>
                  <div className="cta-icon-circle">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>
          </section>

          {/* BODY SECTIONS */}
          <div className="body-sections">
            {/* SECTION 1: FOCUS AREAS / ECOSYSTEM */}
            <section className="section-container reveal-block" id="focus">
              <span className="eyebrow">// CORE DISCIPLINES</span>
              <h2 className="section-title">Engineering at the edge of autonomy.</h2>
              <p className="lead-line">
                Combining rigorous mathematical foundations in data science with hands-on robotics and defensive security engineering.
              </p>

              <div className="cards-grid">
                <article className="card">
                  <span className="card-num">01</span>
                  <div>
                    <h3 className="card-heading">AI & Robotics</h3>
                    <p className="card-copy">
                      B.Tech student at VIT Chennai focusing on ROS2, LiDAR-based pathfinding algorithms, and autonomous multi-agent simulation environments.
                    </p>
                  </div>
                </article>

                <article className="card">
                  <span className="card-num">02</span>
                  <div>
                    <h3 className="card-heading">Data Science</h3>
                    <p className="card-copy">
                      BS Degree student at IIT Madras mastering predictive statistical modeling, deep learning architectures, and real-world data analytics.
                    </p>
                  </div>
                </article>

                <article className="card">
                  <span className="card-num">03</span>
                  <div>
                    <h3 className="card-heading">Cybersecurity</h3>
                    <p className="card-copy">
                      Developing real-time cyber attack/defense simulation platforms and PCAP stream anomaly detection using machine learning classifiers.
                    </p>
                  </div>
                </article>
              </div>
            </section>

            {/* SECTION 2: SELECTED PROJECTS */}
            <section className="section-container reveal-block" id="projects">
              <span className="eyebrow">// SELECTED WORK</span>
              <h2 className="section-title">Built with intention and technical depth.</h2>
              <p className="lead-line">
                Highlighting major projects in network simulation, autonomous robotics, market prediction, and threat detection.
              </p>

              <div className="projects-grid">
                {projectsData.map((project, idx) => (
                  <article className="card" key={idx}>
                    <div>
                      <span className="card-num">// {project.tag} • {project.year}</span>
                      <h3 className="card-heading">{project.title}</h3>
                      <p className="card-copy">{project.description}</p>
                      <div className="tech-pills">
                        {project.tech.map((t) => (
                          <span className="tech-pill" key={t}>{t}</span>
                        ))}
                      </div>
                    </div>
                    {project.github && (
                      <div style={{ marginTop: "2rem" }}>
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="cta-pill" style={{ padding: "0.45rem 0.45rem 0.45rem 1.1rem", fontSize: "0.85rem" }}>
                          <span>View Code</span>
                          <div className="cta-icon-circle" style={{ width: "30px", height: "30px" }}>
                            <svg viewBox="0 0 24 24">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </div>
                        </a>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>

            {/* SECTION 3: PULL-QUOTE BAND */}
            <section className="pullquote-band reveal-block">
              <blockquote className="pullquote-text">
                “Building the intersection of autonomous robotics, intelligent data systems, and defensive cybersecurity.”
              </blockquote>
            </section>

            {/* SECTION 4: EDUCATION & JOURNEY */}
            <section className="section-container reveal-block" id="education">
              <span className="eyebrow">// ACADEMIC FOUNDATION</span>
              <h2 className="section-title">Education & Journey.</h2>
              <p className="lead-line">
                Pursuing dual specialized degrees in engineering and applied data science.
              </p>

              <div className="projects-grid">
                <article className="card">
                  <span className="card-num">2025 — 2029</span>
                  <div>
                    <h3 className="card-heading">VIT Chennai</h3>
                    <span className="eyebrow" style={{ marginBottom: "0.5rem" }}>B.Tech in AI & Robotics</span>
                    <p className="card-copy">
                      Comprehensive program blending computer science fundamentals with AI, automation, and intelligent robotics systems through hands-on projects and laboratory research.
                    </p>
                  </div>
                </article>

                <article className="card">
                  <span className="card-num">2025 — Present</span>
                  <div>
                    <h3 className="card-heading">IIT Madras</h3>
                    <span className="eyebrow" style={{ marginBottom: "0.5rem" }}>BS Degree in Data Science</span>
                    <p className="card-copy">
                      Pioneering degree program covering machine learning, deep learning, computer vision, and large-scale data analytics with Python and PyTorch.
                    </p>
                  </div>
                </article>
              </div>
            </section>

            {/* SECTION 5: SKILLS & TOOLS */}
            <section className="section-container reveal-block">
              <span className="eyebrow">// TECHNICAL STACK</span>
              <h2 className="section-title">Tools & Technologies.</h2>
              <p className="lead-line">
                Languages, frameworks, and tools used across AI, robotics, backend systems, and security research.
              </p>

              <div className="filter-buttons">
                {skillsCategories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setActiveCategory(cat.label)}
                    className={`filter-btn ${activeCategory === cat.label ? "active" : ""}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="skills-grid">
                {currentSkills.map((s) => (
                  <div className="skill-tag" key={s}>
                    {s}
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 6: INQUIRIES & CONTACT */}
            <section className="section-container reveal-block" id="contact" style={{ marginBottom: "0" }}>
              <span className="eyebrow">// INITIATION</span>
              <h2 className="section-title">Let's build something unusual.</h2>
              <p className="lead-line">
                Have a project in mind or interested in collaborating? Send a note directly or reach out on social channels.
              </p>

              <div className="contact-grid">
                {/* Contact Form */}
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-textarea"
                      rows={5}
                      placeholder="Tell me about your project or inquiry..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="cta-pill" style={{ justifySelf: "start", marginTop: "0.5rem" }}>
                    <span>{isSubmitting ? "Sending..." : "Send Message"}</span>
                    <div className="cta-icon-circle">
                      <svg viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                </form>

                {/* Social Links */}
                <div>
                  <a href="mailto:gokula.work@gmail.com" className="social-link-card">
                    <span>Email — gokula.work@gmail.com</span>
                    <span>↗</span>
                  </a>
                  <a href="https://github.com/CapedCrusader77" target="_blank" rel="noopener noreferrer" className="social-link-card">
                    <span>GitHub — @CapedCrusader77</span>
                    <span>↗</span>
                  </a>
                  <a href="https://linkedin.com/in/gokul-a" target="_blank" rel="noopener noreferrer" className="social-link-card">
                    <span>LinkedIn — Gokul A</span>
                    <span>↗</span>
                  </a>
                  <a href="https://twitter.com/CapedCrusader77" target="_blank" rel="noopener noreferrer" className="social-link-card">
                    <span>Twitter — @CapedCrusader77</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </section>
          </div>
        </main>

        {/* FOOTER */}
        <footer>
          <div className="footer-bar reveal-block">
            <a href="#" className="footer-brand">
              Gokul A<sup>*</sup>
            </a>
            <span className="footer-copy">© 2026 Gokul A. All rights reserved.</span>
            <ul className="footer-links">
              <li><a href="https://github.com/CapedCrusader77" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a></li>
              <li><a href="https://linkedin.com/in/gokul-a" target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a></li>
              <li><a href="mailto:gokula.work@gmail.com" className="footer-link">Email</a></li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
}
