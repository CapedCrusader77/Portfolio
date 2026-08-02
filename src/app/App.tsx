import { useState, useEffect } from "react";
import { PrismaHero } from "./components/PrismaHero";
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

export default function App() {
  const [activeSection, setActiveSection] = useState("hero");

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["hero", "about", "projects", "skills", "experience", "contact"];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetBottom = offsetTop + element.offsetHeight;

          if (scrollPosition >= offsetTop && scrollPosition < offsetBottom) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative overflow-x-hidden text-white bg-[#0d0b09]">
      <Toaster />
      <ScrollProgress />
      <PremiumCursor />
      
      {/* 1. Cinematic PRISMA Hero Landing Screen */}
      <PrismaHero scrollTo={scrollTo} />

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
