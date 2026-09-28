import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Sparkles } from "lucide-react";
import anime from "animejs";

export type LensId = "synthesis" | "physical" | "neural";

interface LensData {
  id: LensId;
  tabLabel: string;
  kicker: string;
  badge: string;
  badgeColor: string;
  glowColor: string;
  title: string;
  narrative: string;
  stack: string[];
}

const lenses: Record<LensId, LensData> = {
  synthesis: {
    id: "synthesis",
    tabLabel: "The Sweet Spot",
    kicker: "ROBOTICS × DATA SCIENCE",
    badge: "The Full Picture",
    badgeColor: "border-[#86bdd8]/40 bg-[#86bdd8]/10 text-[#b0d8e7]",
    glowColor: "rgba(134, 189, 216, 0.22)",
    title: "Where messy physical hardware shakes hands with smart neural algorithms.",
    narrative:
      "Why pick between software and hardware when you can play with both? I build systems where smart math doesn't just sit in a Jupyter notebook—it drives motors, navigates real rooms, and handles chaotic real-world inputs without breaking a sweat.",
    stack: ["ROS2 Humble", "PyTorch", "Embedded C++", "Linux Systems", "Multi-Agent AI", "FastAPI"],
  },
  physical: {
    id: "physical",
    tabLabel: "VIT Chennai · Hardware & Motion",
    kicker: "VIT CHENNAI · B.TECH IN AI & ROBOTICS",
    badge: "Robots That Move",
    badgeColor: "border-[#86bdd8]/40 bg-[#86bdd8]/10 text-[#86bdd8]",
    glowColor: "rgba(134, 189, 216, 0.25)",
    title: "Teaching machines to look around, dodge obstacles, and move with precision.",
    narrative:
      "From LiDAR point clouds and camera feeds to high-speed micro-controllers and SLAM maps. Here, I tinker with autonomous mobile robots that map unfamiliar rooms, dodge moving obstacles, and don't get stuck in doorways.",
    stack: ["ROS2 Perception", "SLAM Navigation", "Sensor Fusion", "Kinematics", "C++20", "OpenCV"],
  },
  neural: {
    id: "neural",
    tabLabel: "IIT Madras · Data & Intelligence",
    kicker: "IIT MADRAS · BS IN DATA SCIENCE",
    badge: "Brains & Models",
    badgeColor: "border-[#b0d8e7]/40 bg-[#b0d8e7]/10 text-[#b0d8e7]",
    glowColor: "rgba(176, 216, 231, 0.22)",
    title: "Turning oceans of chaotic numbers into grounded, sensible decisions.",
    narrative:
      "Deep diving into probability, linear algebra, and neural architectures. It's about designing machine learning pipelines and decision agents that actually know when they're uncertain and give answers humans can trust.",
    stack: ["Deep Neural Nets", "Telemetry Pipelines", "Statistical ML", "FastAPI", "Decision Models", "Graph AI"],
  },
};

const telemetryStats = [
  { target: 10, suffix: "+", label: "Projects Shipped", sub: "From Localhost to Reality" },
  { target: 15, suffix: "+", label: "Technologies", sub: "ROS2, PyTorch, C++, Linux & more" },
  { target: 2, suffix: "", displayVal: "02", label: "Concurrent Degrees", sub: "VIT Chennai × IIT Madras (Coffee fueled)" },
  { target: 99, suffix: "%", displayVal: "99%", label: "Curiosity Factor", sub: "Always breaking & fixing things" },
];

export function PerspectiveLens() {
  const [activeLens, setActiveLens] = useState<LensId>("synthesis");
  const consoleRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sliderPillRef = useRef<HTMLSpanElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const counterDoneRef = useRef(false);

  const current = lenses[activeLens];

  // Align the sliding indicator pill behind the active tab
  useEffect(() => {
    if (!tabsContainerRef.current || !sliderPillRef.current) return;
    const activeBtn = tabsContainerRef.current.querySelector<HTMLButtonElement>(
      `[data-tab-id="${activeLens}"]`
    );
    if (!activeBtn) return;

    anime({
      targets: sliderPillRef.current,
      left: activeBtn.offsetLeft,
      width: activeBtn.offsetWidth,
      duration: 320,
      easing: "easeOutElastic(1, 0.8)",
    });
  }, [activeLens]);

  // Numeric counter observer on entry
  useEffect(() => {
    const consoleEl = consoleRef.current;
    if (!consoleEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !counterDoneRef.current) {
            counterDoneRef.current = true;
            const statEls = consoleEl.querySelectorAll<HTMLElement>("[data-telemetry-num]");
            statEls.forEach((el) => {
              const targetVal = parseFloat(el.getAttribute("data-telemetry-num") || "0");
              const suffix = el.getAttribute("data-telemetry-suffix") || "";
              const displayVal = el.getAttribute("data-telemetry-display");
              if (isNaN(targetVal) || targetVal === 0) return;

              const countObj = { val: 0 };
              anime({
                targets: countObj,
                val: targetVal,
                round: 1,
                duration: 1400,
                easing: "easeOutExpo",
                update: () => {
                  if (displayVal && targetVal < 10) {
                    el.textContent = `0${Math.round(countObj.val)}${suffix}`;
                  } else {
                    el.textContent = `${Math.round(countObj.val)}${suffix}`;
                  }
                },
                complete: () => {
                  anime({
                    targets: el,
                    scale: [1, 1.06, 1],
                    duration: 260,
                    easing: "easeOutQuad",
                  });
                },
              });
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(consoleEl);
    return () => observer.disconnect();
  }, []);

  const switchLens = (lensId: LensId) => {
    if (lensId === activeLens) return;
    setActiveLens(lensId);

    if (bodyRef.current) {
      anime.remove(bodyRef.current);
      anime({
        targets: bodyRef.current,
        opacity: [0.3, 1],
        translateY: [6, 0],
        duration: 260,
        easing: "easeOutQuad",
      });

      anime({
        targets: bodyRef.current.querySelectorAll(".lens-stack-pill"),
        opacity: [0, 1],
        scale: [0.94, 1],
        delay: anime.stagger(30),
        duration: 220,
        easing: "easeOutQuad",
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <section id="about" className="editorial-section editorial-about">
      <div className="editorial-section-header" data-reveal>
        <span>01 / PERSPECTIVE</span>
        <span>TWO DEGREES, ONE CURIOSITY</span>
      </div>

      <div className="editorial-about-grid">
        <h2 data-reveal>
          Two degrees.<br />
          <em>One big curiosity.</em>
        </h2>

        <div className="editorial-about-copy" data-reveal>
          <p className="editorial-lede">
            Hey, I&apos;m Gokul — building robots that move and AI that actually makes sense.
          </p>
          <p>
            Dual-degree student in AI &amp; Robotics at VIT Chennai and Data Science at IIT Madras. I love bridging the gap between algorithms on a screen and mechanisms in the wild. Whether it&apos;s a mobile robot calculating its next path or a multi-agent system tracking down a crashed microservice, I turn curious late-night experiments into reliable, real-world systems.
          </p>
          <div className="editorial-credentials">
            <span>VIT CHENNAI / B.TECH IN AI &amp; ROBOTICS (2025 — 2029)</span>
            <span>IIT MADRAS / BS IN DATA SCIENCE &amp; APPLICATIONS (2025 — PRESENT)</span>
          </div>
        </div>
      </div>

      {/* Interactive Perspective Console */}
      <div
        ref={consoleRef}
        onMouseMove={handleMouseMove}
        className="editorial-perspective-console"
        data-reveal
        style={{
          boxShadow: `0 24px 60px rgba(0, 0, 0, 0.65), 0 0 45px ${current.glowColor}`,
        }}
      >
        {/* Top Control Bar */}
        <div className="editorial-console-topbar">
          <div className="editorial-console-tag">
            <Sparkles className="w-3.5 h-3.5 text-[var(--editorial-blue)]" aria-hidden="true" />
            <span>PERSPECTIVE LENS //</span>
          </div>

          {/* Segmented Switcher */}
          <div ref={tabsContainerRef} className="editorial-console-tabs" role="tablist">
            <span ref={sliderPillRef} className="editorial-console-pill" aria-hidden="true" />

            <button
              type="button"
              role="tab"
              aria-selected={activeLens === "synthesis"}
              data-tab-id="synthesis"
              onClick={() => switchLens("synthesis")}
              className={`editorial-tab-btn ${activeLens === "synthesis" ? "is-active" : ""}`}
            >
              The Sweet Spot
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeLens === "physical"}
              data-tab-id="physical"
              onClick={() => switchLens("physical")}
              className={`editorial-tab-btn ${activeLens === "physical" ? "is-active" : ""}`}
            >
              Hardware &amp; Motion
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeLens === "neural"}
              data-tab-id="neural"
              onClick={() => switchLens("neural")}
              className={`editorial-tab-btn ${activeLens === "neural" ? "is-active" : ""}`}
            >
              Data &amp; Intelligence
            </button>
          </div>
        </div>

        {/* Dynamic Body Content */}
        <div ref={bodyRef} className="editorial-console-body">
          <div className="editorial-console-kicker-row">
            <span className="editorial-console-kicker">{current.kicker}</span>
            <span className={`editorial-console-badge ${current.badgeColor}`}>{current.badge}</span>
          </div>

          <h3 className="editorial-console-title">{current.title}</h3>
          <p className="editorial-console-narrative">{current.narrative}</p>

          <div className="editorial-console-stack">
            <span className="editorial-console-stack-label">ACTIVE STACK:</span>
            <div className="editorial-console-pills">
              {current.stack.map((tech) => (
                <span key={tech} className="lens-stack-pill">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Telemetry Numeric Counter Dock */}
        <div className="editorial-console-dock">
          {telemetryStats.map((item) => (
            <div key={item.label} className="editorial-dock-cell group">
              <div className="editorial-dock-cell-top">
                <span
                  data-telemetry-num={item.target > 0 ? item.target : undefined}
                  data-telemetry-suffix={item.suffix}
                  data-telemetry-display={item.displayVal}
                  className="editorial-dock-num"
                >
                  {item.displayVal || (item.target > 0 ? `0${item.suffix}` : "0")}
                </span>
                <ArrowUpRight className="editorial-dock-icon" aria-hidden="true" />
              </div>
              <div className="editorial-dock-label">{item.label}</div>
              <div className="editorial-dock-sub">{item.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Transitive Spine to Projects */}
      <div className="editorial-section-spine" aria-hidden="true">
        <span className="editorial-spine-line" />
        <a href="#projects" className="editorial-spine-link">
          <span>02 / SELECTED WORK</span>
          <ArrowDown className="w-3.5 h-3.5 text-[var(--editorial-blue)] animate-bounce" />
        </a>
      </div>
    </section>
  );
}
