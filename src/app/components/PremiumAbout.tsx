import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const statsData = [
  { value: "10+", label: "Projects Built", sub: "Robotics & Web Architecture" },
  { value: "15+", label: "Technologies", sub: "Full Stack & Machine Learning" },
  { value: "Dual", label: "Academic Tracks", sub: "VIT Chennai & IIT Madras" },
  { value: "3+", label: "Years Experience", sub: "Intelligent Systems & Data" },
];

export function PremiumAbout() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const heading = sectionRef.current?.querySelector<HTMLElement>("[data-about-heading]");
      const badges = sectionRef.current?.querySelector<HTMLElement>("[data-about-badges]");
      const rule = sectionRef.current?.querySelector<HTMLElement>("[data-about-rule]");
      const paragraphs = gsap.utils.toArray<HTMLElement>("[data-about-paragraph]");
      const statCards = gsap.utils.toArray<HTMLElement>("[data-about-stat-card]");
      const background = sectionRef.current?.querySelector<HTMLElement>("[data-about-background]");
      const workHandoff = sectionRef.current?.querySelector<HTMLElement>("[data-about-work-handoff]");

      if (!heading || !rule || paragraphs.length === 0 || statCards.length === 0 || !background || !workHandoff) return;

      gsap.set([heading, badges, ...paragraphs], { opacity: 0, y: 28, filter: "blur(5px)" });
      gsap.set(statCards, { opacity: 0, y: 24, filter: "blur(4px)" });
      gsap.set(rule, { scaleX: 0, opacity: 0, transformOrigin: "center center" });
      gsap.set(workHandoff, { opacity: 0.15, scaleX: 0, transformOrigin: "left center" });
      gsap.set(background, { yPercent: 6, scale: 1.03 });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "bottom 30%",
          scrub: 1.1,
        },
      });

      timeline
        .to(background, { yPercent: -6, scale: 1, duration: 1 }, 0)
        .to(heading, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.28, ease: "power2.out" }, 0.05)
        .to(rule, { scaleX: 1, opacity: 1, duration: 0.2, ease: "power2.out" }, 0.12)
        .to(badges, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.25, ease: "power2.out" }, 0.16)
        .to(paragraphs, { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.08, duration: 0.3, ease: "power2.out" }, 0.22)
        .to(statCards, { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.06, duration: 0.28, ease: "power2.out" }, 0.38)
        .to(workHandoff, { opacity: 1, scaleX: 1, duration: 0.18, ease: "power2.out" }, 0.78);

      return () => timeline.scrollTrigger?.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative overflow-hidden px-6 py-32 calm-about-section">
      <div data-about-background className="absolute inset-0 calm-about-background" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* Header with clean editorial hierarchy */}
        <div data-about-heading className="mb-10 text-center">
          <span className="calm-section-kicker">ABOUT / 02</span>
          <h2 className="mt-4 text-4xl font-bold uppercase tracking-[-0.04em] text-[#f3efe6] md:text-6xl">
            Engineering intelligent systems.
          </h2>
          <div
            data-about-rule
            className="mx-auto mt-6 h-px w-28 bg-gradient-to-r from-transparent via-[#c79863] to-transparent"
          />
        </div>

        {/* Academic Profile Badges */}
        <div data-about-badges className="mb-10 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-950/20 px-4 py-1.5 font-mono text-[0.68rem] tracking-wider text-cyan-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span>VIT CHENNAI • B.TECH IN AI & ROBOTICS</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c79863]/30 bg-[#c79863]/10 px-4 py-1.5 font-mono text-[0.68rem] tracking-wider text-[#c79863] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c79863] shadow-[0_0_8px_#c79863]" />
            <span>IIT MADRAS • BS IN DATA SCIENCE</span>
          </div>
        </div>

        {/* Narrative bio text */}
        <div className="space-y-6">
          <p
            data-about-paragraph
            className="text-lg leading-relaxed text-[#f3efe6]/90 md:text-xl md:leading-relaxed"
          >
            Hi, I&apos;m Gokul A — an <span className="font-medium text-[#22d3ee]">AI and Robotics</span> engineer
            and researcher deeply immersed in <span className="font-medium text-[#c79863]">data science</span> and{" "}
            <span className="font-medium text-[#60a5fa]">cybersecurity</span>. I architect resilient, data-driven systems
            that bridge high-dimensional neural algorithms with real-world physical and digital infrastructure.
          </p>

          <p
            data-about-paragraph
            className="max-w-3xl text-[0.95rem] leading-relaxed text-[#f3efe6]/60 md:text-base md:leading-relaxed"
          >
            My engineering foundation sits at the convergence of Python, C/C++, algorithmic mechanics, Linux systems,
            autonomous navigation, and deep learning. Emerging from the depth of the initial portal, this is the space to
            explore the deliberate philosophy, disciplined engineering, and multi-disciplinary craft behind my work.
          </p>

          {/* Minimalist Glassmorphic Stat Cards */}
          <div className="grid grid-cols-2 gap-3.5 pt-8 md:grid-cols-4 md:gap-5">
            {statsData.map((stat) => (
              <div
                key={stat.label}
                data-about-stat-card
                className="group relative overflow-hidden rounded-xl border border-[#f3efe6]/[0.08] bg-[#f3efe6]/[0.025] p-5 backdrop-blur-xl transition-all duration-400 ease-out hover:-translate-y-1 hover:border-[#c79863]/45 hover:bg-[#f3efe6]/[0.05] hover:shadow-[0_20px_40px_rgba(0,0,0,0.55),0_0_24px_rgba(199,152,99,0.08)]"
              >
                <div className="flex items-start justify-between">
                  <div className="text-3xl font-bold tracking-tight text-[#f3efe6] transition-colors duration-300 group-hover:text-[#c79863] md:text-4xl">
                    {stat.value}
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#f3efe6]/30 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#c79863]" />
                </div>
                <div className="mt-3 font-mono text-[0.68rem] uppercase tracking-widest text-[#f3efe6]/75">
                  {stat.label}
                </div>
                <div className="mt-1 font-mono text-[0.58rem] tracking-wider text-[#f3efe6]/40">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div data-about-work-handoff className="calm-about-work-handoff" aria-hidden="true" />
    </section>
  );
}
