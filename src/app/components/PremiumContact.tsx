import { useLayoutEffect, useRef } from "react";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const socialLinks = [
  { icon: Mail, href: "mailto:gokula.work@gmail.com", label: "Email", value: "gokula.work@gmail.com" },
  { icon: Linkedin, href: "https://linkedin.com/in/gokul-a", label: "LinkedIn", value: "View profile" },
  { icon: Github, href: "https://github.com/CapedCrusader77", label: "GitHub", value: "Explore code" },
  { icon: Twitter, href: "https://twitter.com/CapedCrusader77", label: "Twitter", value: "Follow along" },
];

export function PremiumContact() {
  const sectionRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const context = gsap.context(() => {
      const headingLines = gsap.utils.toArray<HTMLElement>("[data-contact-heading-line]");
      const copy = section.querySelector<HTMLElement>("[data-contact-copy]");
      const links = gsap.utils.toArray<HTMLElement>("[data-contact-link]");
      const bridge = section.querySelector<HTMLElement>("[data-contact-bridge]");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduceMotion) {
        gsap.set([bridge, ...headingLines, copy, ...links], {
          clearProps: "all",
          opacity: 1,
          y: 0,
          yPercent: 0,
        });
        return;
      }

      gsap.set(headingLines, { yPercent: 110 });
      gsap.set([copy, ...links], { opacity: 0, y: 12 });
      gsap.set(bridge, { opacity: 0.35, scaleY: 0.65, transformOrigin: "top center" });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 78%",
          once: true,
        },
      });

      timeline
        .to(bridge, { opacity: 1, scaleY: 1, duration: 0.35, ease: "power2.out" }, 0)
        .to(headingLines, { yPercent: 0, duration: 0.75, stagger: 0.08, ease: "power3.out" }, 0.08)
        .to(copy, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, 0.48)
        .to(links, { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: "power2.out" }, 0.58);
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <section ref={sectionRef} id="contact" className="final-contact-section">
      <div className="final-contact-bridge" data-contact-bridge aria-hidden="true">
        <span />
      </div>

      <div className="final-contact-inner">
        <header className="final-contact-header">
          <span className="final-contact-kicker">GET IN TOUCH / 06</span>
          <span className="final-contact-kicker">THE JOURNEY ENDS HERE</span>
        </header>

        <div className="final-contact-layout">
          <div className="final-contact-heading" aria-label="Let's build something.">
            <div className="final-contact-heading-mask"><span data-contact-heading-line>LET&apos;S BUILD</span></div>
            <div className="final-contact-heading-mask"><span data-contact-heading-line>SOMETHING.</span></div>
          </div>

          <div className="final-contact-aside">
            <p data-contact-copy>Have an idea, project, research problem, or opportunity? Let&apos;s talk.</p>

            <a className="final-contact-email" href="mailto:gokula.work@gmail.com" data-contact-link>
              <span>gokula.work@gmail.com</span>
              <span aria-hidden="true">↗</span>
            </a>

            <nav className="final-contact-links" aria-label="Contact links">
              {socialLinks.slice(1).map(({ icon: Icon, href, label, value }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="final-contact-link"
                  data-contact-link
                  aria-label={`${label}: ${value}`}
                >
                  <span>
                    <Icon aria-hidden="true" />
                    <strong>{label}</strong>
                  </span>
                  <span>{value} ↗</span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="final-contact-endpoint" aria-hidden="true">
          <span />
        </div>
      </div>
    </section>
  );
}
