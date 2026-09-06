import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function PremiumAbout() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const heading = sectionRef.current?.querySelector<HTMLElement>("[data-about-heading]");
      const rule = sectionRef.current?.querySelector<HTMLElement>("[data-about-rule]");
      const body = sectionRef.current?.querySelector<HTMLElement>("[data-about-body]");
      const stats = sectionRef.current?.querySelector<HTMLElement>("[data-about-stats]");
      const background = sectionRef.current?.querySelector<HTMLElement>("[data-about-background]");
      const workHandoff = sectionRef.current?.querySelector<HTMLElement>("[data-about-work-handoff]");

      if (!heading || !rule || !body || !stats || !background || !workHandoff) return;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 78%",
          end: "bottom 35%",
          scrub: 0.9,
        },
      });

      gsap.set([heading, rule, body, stats], { opacity: 0, y: 28 });
      gsap.set(workHandoff, { opacity: 0.18, scaleX: 0, transformOrigin: "left center" });
      gsap.set(background, { yPercent: 8, scale: 1.04 });

      timeline
        .to(background, { yPercent: -8, scale: 1, duration: 1 }, 0)
        .to(heading, { opacity: 1, y: 0, duration: 0.35 }, 0)
        .to(rule, { opacity: 1, scaleX: 1, duration: 0.2 }, 0.14)
        .to(body, { opacity: 1, y: 0, duration: 0.35 }, 0.2)
        .to(stats, { opacity: 1, y: 0, duration: 0.35 }, 0.4)
        .to(body, { opacity: 0.78, y: -18, duration: 0.18, ease: "power2.inOut" }, 0.82)
        .to(workHandoff, { opacity: 1, scaleX: 1, duration: 0.14, ease: "power2.out" }, 0.84);

      return () => timeline.scrollTrigger?.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative overflow-hidden px-6 py-32 calm-about-section">
      <div data-about-background className="absolute inset-0 calm-about-background" aria-hidden="true" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div data-about-heading className="mb-12 text-center">
          <span className="calm-section-kicker">ABOUT / 02</span>
          <h2 className="mt-4 text-5xl font-bold tracking-tight text-white md:text-6xl">Engineering intelligent systems.</h2>
          <div data-about-rule className="mx-auto mt-6 h-px w-24 origin-center scale-x-0 bg-gradient-to-r from-purple-500 to-cyan-500" />
        </div>

        <div data-about-body className="space-y-8">
          <p className="text-lg leading-relaxed text-gray-300 md:text-xl">
            Hi, I&apos;m Gokul A — an <span className="text-purple-400">AI and Robotics</span> student passionate about <span className="text-blue-400">data science</span> and <span className="text-cyan-400">cybersecurity</span>. I build efficient, data-driven systems that move from theory into the real world.
          </p>
          <p className="max-w-3xl text-[0.95rem] leading-relaxed text-gray-400 md:text-base">
            My work sits at the intersection of Python, C/C++, algorithms, Linux-based tools, autonomous systems, and machine learning. After the intensity of the tunnel, this is the space to slow down and understand the thinking behind the work.
          </p>

          <div data-about-stats className="grid grid-cols-2 gap-4 border-t border-white/10 pt-8 md:grid-cols-4 md:gap-6">
            {[
              ["10+", "Projects"],
              ["15+", "Technologies"],
              ["3+", "Years learning"],
              ["∞", "Coffee consumed"],
            ].map(([value, label]) => (
              <div key={label} className="border-l border-white/10 pl-4">
                <div className="text-2xl font-bold text-white md:text-3xl">{value}</div>
                <div className="mt-2 font-mono text-xs uppercase tracking-widest text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div data-about-work-handoff className="calm-about-work-handoff" aria-hidden="true" />
    </section>
  );
}
