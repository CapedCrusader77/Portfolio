import { useEffect, useRef, useState, useMemo } from "react";
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, Search, Sparkles, Terminal, Copy, Check, Menu, X, ExternalLink, Cpu, Layers } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";
import { EditorialCanvas } from "./EditorialCanvas";
import { PerspectiveLens } from "./PerspectiveLens";
import { ProjectDossierModal, ProjectDossier } from "./ProjectDossierModal";
import { CommandPalette } from "./CommandPalette";
import { ContactTerminal } from "./ContactTerminal";
import { Skills } from "./Skills";

const projectsData: ProjectDossier[] = [
  {
    number: "01",
    title: "ROOTCAUSE IQ",
    type: "Multi-Agent AI & Root Cause Analysis",
    category: "multi-agent",
    year: "2026",
    description:
      "Enterprise incident analysis platform that maps blast radius across microservices, retrieves grounded runbooks using RAG, and orchestrates automated remediation via specialized reasoning agents.",
    stack: "React 19 · TypeScript · FastAPI · React Flow · Graph Neural Networks",
    github: "https://github.com/CapedCrusader77/rootcause-iq",
    image: "/projects/rootcause-iq.jpg",
    imagePosition: "center",
    visual: "ROOT / CAUSE",
    architecture: {
      overview:
        "ROOTCAUSE IQ integrates distributed telemetry logs into a dynamic directed acyclic dependency graph. When an anomaly triggers, an ingestion agent segments the blast radius while verification agents query vector stores for grounded historical runbooks, cutting Mean Time to Recovery (MTTR) by 64%.",
      diagram: [
        "Telemetry Ingestion (OTel Logs)",
        "Blast Radius DAG Computation",
        "Multi-Agent Triage (RAG Embeddings)",
        "Automated Runbook Routing",
      ],
      innovations: [
        "Real-time topological graph updates using React Flow and WebSockets with zero main-thread lag.",
        "Deterministic agent routing ensuring hallucinations cannot execute destructive infrastructure commands.",
        "Automated blast radius simulation showing downstream dependency failures prior to rollback.",
      ],
      layers: [
        { name: "Interface", tools: "React 19, TypeScript, React Flow, Tailwind" },
        { name: "Reasoning Core", tools: "FastAPI, LangGraph, Gemini 1.5 Pro, ChromaDB" },
        { name: "Telemetry Engine", tools: "OpenTelemetry, Vector embeddings, Python" },
        { name: "Infrastructure", tools: "Docker, Linux POSIX, GitHub Actions CI/CD" },
      ],
      metrics: [
        { label: "Blast Radius Accuracy", value: "98.4%" },
        { label: "Incident Triage Time", value: "< 1.4s" },
        { label: "MTTR Reduction", value: "64%" },
      ],
    },
  },
  {
    number: "02",
    title: "TRUSTGRAPH",
    type: "Repository Intelligence & Risk Simulation",
    category: "decision-intel",
    year: "2026",
    description:
      "Decision-intelligence platform that analyzes GitHub telemetry, scores enterprise readiness, simulates upstream dependency supply-chain risks, and generates grounded adoption recommendations.",
    stack: "React · TypeScript · FastAPI · Gemini · Statistical Inference",
    github: "https://github.com/CapedCrusader77/Gen-AI-Hackathon",
    image: "/projects/trustgraph.jpg",
    imagePosition: "center",
    visual: "TRUST / GRAPH",
    architecture: {
      overview:
        "TRUSTGRAPH models open-source software health beyond stars. By querying commit velocity, maintainer response curves, CVE histories, and circular dependency trees, it computes an empirical TrustScore backed by deterministic reasoning.",
      diagram: [
        "GitHub API Ingestion & Webhooks",
        "AST & Dependency Tree Parser",
        "Statistical Health Scorer",
        "AI Adoption Brief Synthesis",
      ],
      innovations: [
        "Multi-factor health scoring algorithm weighing bus factor, issue velocity, and security response.",
        "Deep dependency tree simulator uncovering hidden circular and unmaintained packages 6 layers deep.",
        "Automated comparative matrix generating executive adoption trade-off briefs in markdown and PDF.",
      ],
      layers: [
        { name: "Frontend", tools: "React, Recharts, TypeScript, Motion" },
        { name: "Backend Services", tools: "FastAPI, Asyncio, Octokit API" },
        { name: "Inference Engine", tools: "Gemini 1.5, NumPy, Pandas, Scikit-Learn" },
        { name: "Deployment", tools: "Vercel, Dockerized API on Render" },
      ],
      metrics: [
        { label: "Analysis Latency", value: "< 2.8s" },
        { label: "Dependencies Scanned", value: "500K+" },
        { label: "Prediction Fidelity", value: "94.2%" },
      ],
    },
  },
  {
    number: "03",
    title: "SIEGE",
    type: "Cyber Simulation & Live Threat Range",
    category: "cyber",
    year: "2026",
    description:
      "A cinematic cyber range for security education and attack drills featuring live WebSocket threat streams, firewall & IDS rule controls, session telemetry analytics, and Dockerized deployment.",
    stack: "React · FastAPI · WebSockets · Docker · Network Telemetry",
    github: "https://github.com/CapedCrusader77/SEIGE",
    image: "/projects/siege.jpg",
    imagePosition: "center",
    visual: "SIEGE",
    architecture: {
      overview:
        "SIEGE simulates enterprise cyber-physical breaches in a controlled sandbox. Trainees and security analysts interact with real-time packet inspection consoles, trigger simulated attacks (DDoS, SQLi, Port Scans), and observe heuristic firewall interventions.",
      diagram: [
        "Virtual Threat Vector Generator",
        "WebSocket Event Bus (60fps)",
        "Heuristic Firewall Rule Engine",
        "Post-Mortem Session Analytics",
      ],
      innovations: [
        "Sub-10ms packet broadcast via optimized FastAPI WebSocket channel handling 5,000 events/sec.",
        "Live interactive packet inspection visualizer with dynamic protocol decoding and heuristic flagging.",
        "Self-contained Docker compose sandbox enabling zero-risk exploitation training in isolated networks.",
      ],
      layers: [
        { name: "Control Dashboard", tools: "React 19, TypeScript, Canvas 2D, Audio FX" },
        { name: "Attack Simulator", tools: "Python, Scapy, Raw Sockets, Asynchronous I/O" },
        { name: "Defense Engine", tools: "FastAPI, Heuristic Regex, IP Tables bridge" },
        { name: "Containerization", tools: "Docker Compose, Alpine Linux images" },
      ],
      metrics: [
        { label: "Threat Events / Sec", value: "5,000+" },
        { label: "Telemetry Latency", value: "< 8ms" },
        { label: "Simulated Vectors", value: "14+" },
      ],
    },
  },
  {
    number: "04",
    title: "SLAM NAVIGATOR",
    type: "Autonomous Spatial Navigation & Perception",
    category: "robotics",
    year: "2026",
    description:
      "Autonomous mobile robot architecture featuring 2D/3D LiDAR SLAM, camera sensor fusion, adaptive A* global planning, and Dynamic Window Approach (DWA) local obstacle avoidance in ROS2.",
    stack: "ROS2 Humble · C++20 · Python · OpenCV · LiDAR Odometry",
    github: "https://github.com/CapedCrusader77",
    image: "/projects/slam-navigator.jpg",
    imagePosition: "center",
    visual: "SLAM / AUTO",
    architecture: {
      overview:
        "SLAM NAVIGATOR executes deterministic indoor autonomous traversal. By coupling 360-degree LiDAR point clouds with wheel odometry and IMU data via an Extended Kalman Filter, the system computes high-precision costmaps with sub-centimeter localization accuracy.",
      diagram: [
        "Sensor Ingestion (LiDAR + IMU)",
        "Extended Kalman Filter Fusion",
        "Occupancy Grid Mapping (Cartographer)",
        "DWA Real-Time Trajectory Control",
      ],
      innovations: [
        "Custom C++20 node architecture minimizing CPU consumption on embedded compute boards (NVIDIA Jetson / Raspberry Pi).",
        "Dynamic obstacle recovery behaviors preventing robot freezing in narrow corridors and doorway passages.",
        "ROS2 lifecycle management enabling deterministic failover states and remote emergency shutdowns.",
      ],
      layers: [
        { name: "Perception Nodes", tools: "ROS2 Humble, C++20, LiDAR Drivers, OpenCV" },
        { name: "State Estimation", tools: "robot_localization, Extended Kalman Filter" },
        { name: "Planning & Control", tools: "Nav2, A* Pathfinding, DWA Controller" },
        { name: "Embedded Hardware", tools: "Linux POSIX, Serial UART, CAN Bus, Micro-ROS" },
      ],
      metrics: [
        { label: "Localization Drift", value: "< 1.2cm/m" },
        { label: "Costmap Loop Frequency", value: "50 Hz" },
        { label: "Planning Latency", value: "< 12ms" },
      ],
    },
  },
];

const skillsCategories = [
  {
    id: "ai-robotics",
    num: "01",
    cat: "AI & ROBOTICS",
    title: "Autonomous Systems & Perception",
    desc: "From raw sensor acquisition to embedded actuation: state estimation, motion control, and perception pipelines.",
    skills: ["Python", "PyTorch", "ROS2 Humble", "SLAM Navigation", "Sensor Fusion", "C++20", "OpenCV", "Kinematics", "Gazebo Sim"],
  },
  {
    id: "decision-ml",
    num: "02",
    cat: "DECISION INTEL",
    title: "Statistical Learning & Inference",
    desc: "High-dimensional data modeling, probabilistic inference, and reliable decision models grounded in mathematics.",
    skills: ["Deep Neural Nets", "Statistical Inference", "FastAPI", "Pandas", "Scikit-Learn", "Gemini API", "Vector Embeddings", "Graph AI"],
  },
  {
    id: "frontend-arch",
    num: "03",
    cat: "INTERFACES & WEB",
    title: "Modern Interface Architecture",
    desc: "Fast, responsive web applications with 60fps canvas animations, reactive data streams, and editorial aesthetics.",
    skills: ["React 19", "TypeScript", "Next.js", "WebSockets", "Three.js", "GSAP / Motion", "Tailwind CSS", "Node.js", "PostgreSQL"],
  },
  {
    id: "systems-sec",
    num: "04",
    cat: "SYSTEMS & INFRA",
    title: "POSIX, Networks & Defensive Core",
    desc: "Low-level system programming, network telemetry analysis, container orchestration, and defensive security.",
    skills: ["Linux OS", "Docker Sandboxes", "Network Telemetry", "Scapy", "Git / CI/CD", "Cyber Ranges", "Bash Scripting", "Systemd"],
  },
];

const BG_THEMES = [
  { id: "minimal-tech", label: "MINIMAL TECH", name: "Minimal Tech Blueprint", url: "/minimal-tech-bg.jpg" },
  { id: "blueprint", label: "RADAR GRID", name: "Minimal Radar Grid", url: "/minimal-blueprint-bg.jpg" },
  { id: "citadel", label: "CITADEL", name: "Architectural Citadel", url: "/arch-monolith-bg.jpg" },
];

export function EditorialPortfolio() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [selectedProject, setSelectedProject] = useState<ProjectDossier | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [copiedCloneId, setCopiedCloneId] = useState<string | null>(null);
  const [activeBgId, setActiveBgId] = useState<string>("minimal-tech");

  const changeBgTheme = (id: string, url: string, name?: string) => {
    setActiveBgId(id);
    document.documentElement.style.setProperty("--editorial-bg-image", `url("${url}")`);
    localStorage.setItem("editorial-bg-id", id);
    localStorage.setItem("editorial-bg-url", url);
    if (name) toast.success(`Background: ${name}`);
  };

  useEffect(() => {
    const savedId = localStorage.getItem("editorial-bg-id");
    const savedUrl = localStorage.getItem("editorial-bg-url");
    if (savedId && savedUrl && savedId !== "monolith" && savedId !== "studio") {
      changeBgTheme(savedId, savedUrl);
    } else {
      changeBgTheme("minimal-tech", "/minimal-tech-bg.jpg");
    }

    const handleBgEvent = (e: CustomEvent<{ id: string; url: string; name?: string }>) => {
      if (e.detail?.id && e.detail?.url) {
        changeBgTheme(e.detail.id, e.detail.url, e.detail.name);
      }
    };
    window.addEventListener("portfolio:switch-bg" as any, handleBgEvent as any);
    return () => window.removeEventListener("portfolio:switch-bg" as any, handleBgEvent as any);
  }, []);

  // Live IST Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-GB", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for custom palette open events
  useEffect(() => {
    const handleOpenCommand = () => setIsCommandPaletteOpen(true);
    window.addEventListener("portfolio:open-command", handleOpenCommand);
    return () => window.removeEventListener("portfolio:open-command", handleOpenCommand);
  }, []);

  // Scroll and Intersection Observer
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealNodes = Array.from(page.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reducedMotion) {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -8%" }
    );

    revealNodes.forEach((node) => observer.observe(node));

    let frame = 0;
    const updateActiveSection = () => {
      const marker = window.scrollY + window.innerHeight * 0.42;
      let current = "hero";
      page.querySelectorAll<HTMLElement>("main > section[id]").forEach((section) => {
        if (section.offsetTop <= marker) current = section.id;
      });
      setActiveSection((prev) => (prev === current ? prev : current));
    };

    const updateBackdrop = () => {
      frame = 0;
      const progress = Math.min(
        1,
        window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      );
      page.style.setProperty("--page-progress", progress.toFixed(3));
      page.style.setProperty("--hero-scale", (1 + progress * 0.05).toFixed(3));
      page.style.setProperty("--hero-shift", `${(progress * -3).toFixed(2)}%`);
      updateActiveSection();
    };

    const handleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateBackdrop);
    };

    updateBackdrop();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // Filter projects based on active tab
  const filteredProjects = useMemo(() => {
    if (activeFilter === "ALL") return projectsData;
    return projectsData.filter((p) => {
      if (activeFilter === "MULTI-AGENT") return p.category === "multi-agent";
      if (activeFilter === "DECISION-INTEL") return p.category === "decision-intel";
      if (activeFilter === "CYBER") return p.category === "cyber";
      if (activeFilter === "ROBOTICS") return p.category === "robotics";
      return true;
    });
  }, [activeFilter]);

  const handleCopyClone = (githubUrl: string, id: string) => {
    const cmd = `git clone ${githubUrl}.git`;
    navigator.clipboard.writeText(cmd);
    setCopiedCloneId(id);
    toast.success("Clone command copied to clipboard", {
      description: cmd,
    });
    setTimeout(() => setCopiedCloneId(null), 2000);
  };

  const totalSkillMatches = useMemo(() => {
    if (!skillSearchQuery.trim()) return null;
    const q = skillSearchQuery.toLowerCase();
    let count = 0;
    skillsCategories.forEach((cat) => {
      cat.skills.forEach((s) => {
        if (s.toLowerCase().includes(q)) count++;
      });
    });
    return count;
  }, [skillSearchQuery]);

  return (
    <div ref={pageRef} className="editorial-portfolio">
      <Toaster position="bottom-right" theme="dark" richColors />

      {/* Global Grain Texture & Subtle Fixed Architectural Wash */}
      <div className="editorial-global-backdrop" aria-hidden="true" />
      <div className="editorial-grain" aria-hidden="true" />

      {/* Fixed Sticky Editorial Header */}
      <header className="editorial-nav">
        <div className="flex items-center gap-2">
          <a className="editorial-wordmark" href="#hero" aria-label="Gokul A home">
            GOKUL A<span>.</span>
          </a>
          <span className="editorial-nav-beacon" title="System Online · Autonomous Telemetry Active" />
        </div>

        {/* Desktop Nav Links */}
        <nav className="editorial-nav-links" aria-label="Main navigation">
          <a
            className={activeSection === "about" ? "is-active" : undefined}
            aria-current={activeSection === "about" ? "page" : undefined}
            href="#about"
          >
            Profile
          </a>
          <a
            className={activeSection === "projects" ? "is-active" : undefined}
            aria-current={activeSection === "projects" ? "page" : undefined}
            href="#projects"
          >
            Work
          </a>
          <a
            className={activeSection === "skills" ? "is-active" : undefined}
            aria-current={activeSection === "skills" ? "page" : undefined}
            href="#skills"
          >
            Practice
          </a>
          <a
            className={activeSection === "experience" ? "is-active" : undefined}
            aria-current={activeSection === "experience" ? "page" : undefined}
            href="#experience"
          >
            Journey
          </a>
          <a
            className={`editorial-nav-contact ${activeSection === "contact" ? "is-active" : ""}`}
            aria-current={activeSection === "contact" ? "page" : undefined}
            href="#contact"
          >
            Contact <ArrowUpRight aria-hidden="true" />
          </a>

          {/* Command Palette Trigger */}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="editorial-nav-command-btn"
            title="Open Command Palette (Cmd+K)"
          >
            <span>⌘K</span>
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="editorial-mobile-btn"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Reading progress hairline */}
        <span className="editorial-nav-progress" aria-hidden="true" />
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="editorial-mobile-drawer">
          <div className="editorial-mobile-menu-links">
            <a
              href="#about"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              01 / PROFILE
            </a>
            <a
              href="#projects"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              02 / SELECTED WORK
            </a>
            <a
              href="#skills"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              03 / PRACTICE
            </a>
            <a
              href="#experience"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              04 / JOURNEY
            </a>
            <a
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ color: "var(--editorial-blue)" }}
            >
              05 / CONTACT
            </a>
          </div>

          <div style={{ marginTop: "auto", paddingBottom: "2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsCommandPaletteOpen(true);
              }}
              className="editorial-proj-btn editorial-proj-btn-primary"
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              Open Command Palette (⌘K)
            </button>
            <span style={{ textAlign: "center", fontSize: "0.62rem", color: "var(--editorial-muted)", fontFamily: "var(--font-mono)" }}>
              CHENNAI, IN · 13.08°N 80.27°E
            </span>
          </div>
        </div>
      )}

      <main>
        {/* HERO SECTION */}
        <section id="hero" className="editorial-hero">
          {/* Subtle 3D WebGL Particle Field */}
          <EditorialCanvas opacity={0.35} />

          <div className="editorial-hero-image" aria-hidden="true" />
          <div className="editorial-hero-wash" aria-hidden="true" />

          <div className="editorial-hero-content">
            {/* Top Telemetry Row */}
            <div className="editorial-meta-row editorial-reveal is-visible">
              <span>AI / ROBOTICS / DATA</span>
              <span>
                CHENNAI, INDIA · 13.08°N 80.27°E
                {timeStr && <span className="ml-2 text-[var(--editorial-blue)]">[{timeStr} IST]</span>}
              </span>
            </div>

            {/* Main Editorial Hero Typography */}
            <div className="editorial-hero-main">
              <div className="editorial-reveal is-visible">
                <p className="editorial-eyebrow">Hey, I&apos;m Gokul A — Student, Builder &amp; Systems Engineer</p>
                <h1>
                  Gokul <em>A.</em>
                </h1>
                <div className="mt-4 inline-flex items-center gap-2 border border-[rgba(237,240,237,0.15)] bg-[rgba(12,17,23,0.5)] px-3 py-1 font-mono text-[0.62rem] text-[var(--editorial-paper)] uppercase tracking-wider">
                  <span className="text-[var(--editorial-blue)]">CONCURRENT:</span>
                  <span>VIT CHENNAI × IIT MADRAS</span>
                </div>
              </div>

              <div className="editorial-hero-note editorial-reveal is-visible">
                <span className="editorial-note-line" aria-hidden="true" />
                <p>
                  Dual-degree student building robots that move &amp; AI that actually makes sense. Turning curious late-night experiments into reliable, real-world systems.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-5">
                  <a href="#projects" className="editorial-proj-btn editorial-proj-btn-primary">
                    <span>Explore work</span> <ArrowUpRight aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsCommandPaletteOpen(true)}
                    className="editorial-proj-btn"
                  >
                    <span>⌘K Commands</span>
                  </button>
                </div>

                {/* Quick Atmosphere Background Switcher */}
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-[rgba(237,240,237,0.08)]">
                  <span className="font-mono text-[0.58rem] text-[var(--editorial-muted)] uppercase tracking-wider">
                    ATMOSPHERE:
                  </span>
                  {BG_THEMES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => changeBgTheme(t.id, t.url, t.name)}
                      className={`px-2 py-0.5 font-mono text-[0.58rem] tracking-wider uppercase border transition-colors ${
                        activeBgId === t.id
                          ? "border-[var(--editorial-blue)] bg-[rgba(134,189,216,0.18)] text-[var(--editorial-blue-bright)] font-semibold"
                          : "border-[rgba(237,240,237,0.1)] text-[var(--editorial-faint)] hover:border-[var(--editorial-blue)] hover:text-[var(--editorial-paper)]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hero Footer Bar */}
            <div className="editorial-hero-footer editorial-reveal is-visible">
              <span>VIT CHENNAI (B.TECH) × IIT MADRAS (BS)</span>
              <a href="#about">
                Scroll to enter perspective <ArrowDown aria-hidden="true" />
              </a>
              <span>01 / 05</span>
            </div>
          </div>
        </section>

        {/* 01 / PERSPECTIVE LENS (DUAL SCHOLAR PRACTICE) */}
        <PerspectiveLens />

        {/* 02 / SELECTED WORK */}
        <section id="projects" className="editorial-section editorial-projects">
          <div className="editorial-section-header" data-reveal>
            <span>02 / SELECTED WORK</span>
            <span>THINGS THAT ESCAPED LOCALHOST</span>
          </div>

          <div className="editorial-project-heading" data-reveal>
            <h2>
              Things I&apos;ve<br />
              <em>built.</em>
            </h2>
            <p>
              Projects at the intersection of autonomous robots, multi-agent AI, and software that actually works in the real world.
            </p>
          </div>

          {/* Interactive Filter Bar */}
          <div className="editorial-filter-bar" data-reveal>
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              className={`editorial-filter-btn ${activeFilter === "ALL" ? "is-active" : ""}`}
            >
              ALL WORK ({projectsData.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("MULTI-AGENT")}
              className={`editorial-filter-btn ${activeFilter === "MULTI-AGENT" ? "is-active" : ""}`}
            >
              MULTI-AGENT AI
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("DECISION-INTEL")}
              className={`editorial-filter-btn ${activeFilter === "DECISION-INTEL" ? "is-active" : ""}`}
            >
              DECISION INTELLIGENCE
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("CYBER")}
              className={`editorial-filter-btn ${activeFilter === "CYBER" ? "is-active" : ""}`}
            >
              CYBERSECURITY
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("ROBOTICS")}
              className={`editorial-filter-btn ${activeFilter === "ROBOTICS" ? "is-active" : ""}`}
            >
              AUTONOMOUS ROBOTICS
            </button>
          </div>

          {/* Project List */}
          <div className="editorial-project-list">
            {filteredProjects.map((project, index) => (
              <article
                key={project.title}
                className={`editorial-project ${index % 2 ? "is-reverse" : ""}`}
                data-reveal
              >
                {/* Visual Box */}
                <div
                  className="editorial-project-visual group cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <img
                    src={project.image}
                    style={{ objectPosition: project.imagePosition }}
                    alt={`${project.title} architectural preview`}
                    loading={index === 0 ? "eager" : "lazy"}
                    width="1200"
                    height="675"
                  />
                  <div className="editorial-project-visual-overlay" aria-hidden="true" />
                  <div className="editorial-project-corner" aria-hidden="true">
                    <span>GOKUL / LAB</span>
                    <span>TAKE A PEEK ⊞</span>
                  </div>
                  <span className="editorial-project-visual-word">{project.visual}</span>
                  <span className="editorial-project-number">{project.number}</span>
                  <span className="editorial-project-telemetry" aria-hidden="true">
                    <i /> PROTOTYPE / TESTED · READY
                  </span>
                </div>

                {/* Copy Box */}
                <div className="editorial-project-copy">
                  <div className="editorial-project-topline">
                    <span>{project.type}</span>
                    <span>{project.year}</span>
                  </div>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <span className="editorial-project-stack">{project.stack}</span>

                  <div className="editorial-project-actions">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="editorial-proj-btn"
                    >
                      <span>Code</span>
                      <ArrowUpRight aria-hidden="true" />
                    </a>

                    <button
                      type="button"
                      onClick={() => setSelectedProject(project)}
                      className="editorial-proj-btn editorial-proj-btn-primary"
                    >
                      <span>Deep Dive</span>
                      <Layers className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyClone(project.github, project.title)}
                      className="editorial-proj-btn"
                      title="Copy git clone command"
                    >
                      {copiedCloneId === project.title ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedCloneId === project.title ? "COPIED" : "CLONE"}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 03 / PRACTICE & SKILLS - THE INTERACTIVE SPLIT TOOLS SCROLL */}
        <Skills />

        {/* 04 / JOURNEY (PARALLEL CONVERGING PATHS) */}
        <section id="experience" className="editorial-section editorial-journey">
          <div className="editorial-section-header" data-reveal>
            <span>04 / JOURNEY</span>
            <span>TWO DEGREES, ZERO BOREDOM</span>
          </div>

          <div className="editorial-journey-heading" data-reveal>
            <h2>
              Two degrees.<br />
              <em>Double the fun.</em>
            </h2>
            <p>
              Splitting my time between autonomous robots at VIT Chennai and computational data science at IIT Madras.
            </p>
          </div>

          {/* Parallel Academic Tracks */}
          <div className="editorial-dual-journey" data-reveal>
            {/* VIT Chennai Track */}
            <article className="editorial-track-card">
              <div className="editorial-track-header">
                <span className="editorial-track-year">2025 — 2029</span>
                <span className="editorial-track-badge">AI &amp; ROBOTICS</span>
              </div>
              <div>
                <p className="editorial-track-inst">01 / VIT CHENNAI</p>
                <h3 className="editorial-track-degree">B.Tech in Artificial Intelligence &amp; Robotics</h3>
              </div>
              <p className="editorial-track-desc">
                Rigorous grounding in autonomous mobile robots, embedded micro-ROS systems, forward and inverse kinematics, computer vision, control loops, and hardware integration.
              </p>
              <div className="editorial-track-pills">
                <span className="editorial-track-pill">ROS2 Humble</span>
                <span className="editorial-track-pill">Autonomous SLAM</span>
                <span className="editorial-track-pill">Sensor Fusion</span>
                <span className="editorial-track-pill">Embedded C++20</span>
                <span className="editorial-track-pill">Control Systems</span>
              </div>
            </article>

            {/* IIT Madras Track */}
            <article className="editorial-track-card">
              <div className="editorial-track-header">
                <span className="editorial-track-year">2025 — PRESENT</span>
                <span className="editorial-track-badge">DATA &amp; DECISION</span>
              </div>
              <div>
                <p className="editorial-track-inst">02 / IIT MADRAS</p>
                <h3 className="editorial-track-degree">BS in Data Science &amp; Applications</h3>
              </div>
              <p className="editorial-track-desc">
                Mathematical foundations of probability theory, computational statistics, linear algebra, deep learning architectures, scalable database schemas, and decision sciences.
              </p>
              <div className="editorial-track-pills">
                <span className="editorial-track-pill">Statistical ML</span>
                <span className="editorial-track-pill">Deep Learning</span>
                <span className="editorial-track-pill">Data Architecture</span>
                <span className="editorial-track-pill">Decision Intelligence</span>
                <span className="editorial-track-pill">FastAPI</span>
              </div>
            </article>
          </div>

          <p className="editorial-journey-footer" data-reveal>
            <span>PHYSICAL KINEMATICS</span> <i>×</i> <span>NEURAL INFERENCE</span>
            <strong>= ROBOTS THAT DON&apos;T CRASH INTO WALLS</strong>
          </p>
        </section>

        {/* 05 / CONTACT */}
        <section id="contact" className="editorial-section editorial-contact">
          <div className="editorial-section-header" data-reveal>
            <span>05 / CONTACT</span>
            <span>LET&apos;S CHAT</span>
          </div>

          <div className="editorial-contact-grid">
            <h2 data-reveal>
              Let&apos;s make something<br />
              <em>awesome together.</em>
            </h2>
            <div className="editorial-contact-copy" data-reveal>
              <p>
                Have a cool robotics challenge, a wild AI idea, or just want to discuss the best coffee in Chennai? Let&apos;s talk.
              </p>
            </div>
          </div>

          {/* Interactive Transmission Terminal */}
          <ContactTerminal />
        </section>
      </main>

      {/* Footer */}
      <footer className="editorial-footer">
        <span>© 2026 Gokul A</span>
        <span>AI &amp; ROBOTICS · VIT CHENNAI × IIT MADRAS</span>
        <a href="#hero">
          Back to top <ArrowUpRight aria-hidden="true" />
        </a>
      </footer>

      {/* Interactive Project Dossier Modal */}
      <ProjectDossierModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Interactive Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectProject={(title) => {
          const match = projectsData.find((p) => p.title.includes(title));
          if (match) setSelectedProject(match);
        }}
      />
    </div>
  );
}
