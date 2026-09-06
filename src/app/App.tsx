import { useState, useEffect } from "react";
import { DepthTunnelHero } from "./components/DepthTunnelHero";
import { PremiumAbout } from "./components/PremiumAbout";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { Experience } from "./components/Experience";
import { PremiumContact } from "./components/PremiumContact";
import { PremiumNavigation } from "./components/PremiumNavigation";
import { PremiumCursor } from "./components/PremiumCursor";
import { ScrollProgress } from "./components/ScrollProgress";
import { PremiumFooter } from "./components/PremiumFooter";
import { Toaster } from "./components/ui/sonner";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      setActiveSection(id);
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    let cancelled = false;
    let loadHandler: (() => void) | null = null;

    const pageReady = document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
          loadHandler = () => resolve();
          window.addEventListener("load", loadHandler, { once: true });
        });
    const fontsReady = document.fonts?.ready ?? Promise.resolve();

    Promise.all([pageReady, fontsReady]).then(() => {
      if (cancelled) return;
      requestAnimationFrame(() => ScrollTrigger.refresh());
    });

    const handleScroll = () => {
      const sections = ["hero", "about", "projects", "skills", "experience", "contact"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection((current) => current === section ? current : section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      cancelled = true;
      if (loadHandler) window.removeEventListener("load", loadHandler);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="relative overflow-x-clip text-white bg-[#0d0b09]">
      <Toaster />
      <ScrollProgress />
      <PremiumCursor />
      
      {/* 1. Scroll-controlled depth tunnel hero */}
      <DepthTunnelHero scrollTo={scrollTo} />

      {/* Sticky Premium Navigation for Portfolio */}
      <PremiumNavigation scrollTo={scrollTo} activeSection={activeSection} />

      {/* 2. Full Rich Portfolio Sections */}
      <div className="relative z-10 bg-[#0d0b09]/95 backdrop-blur-md">
        <PremiumAbout />
        <Projects />
        <Skills />
        <Experience />
        <PremiumContact />
        <PremiumFooter />
      </div>
    </div>
  );
}
