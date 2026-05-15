import { ScrollSequence } from "./components/ScrollSequence";
import { PremiumAbout } from "./components/PremiumAbout";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { Experience } from "./components/Experience";
import { PremiumContact } from "./components/PremiumContact";
import { PremiumNavigation } from "./components/PremiumNavigation";
import { PremiumCursor } from "./components/PremiumCursor";
import { ScrollProgress } from "./components/ScrollProgress";
import { ThreeBackground } from "./components/ThreeBackground";
import { ContentBackground } from "./components/ContentBackground";
import { NoiseOverlay } from "./components/NoiseOverlay";
import { PremiumHero } from "./components/PremiumHero";
import { PremiumFooter } from "./components/PremiumFooter";
import { useState, useEffect } from "react";

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
    <div className="relative overflow-x-hidden text-white" style={{ background: "#000000" }}>
      <NoiseOverlay />
      <ThreeBackground />
      <ContentBackground />
      <div className="relative z-10">
        <PremiumNavigation scrollTo={scrollTo} activeSection={activeSection} />
        <ScrollProgress />
        <PremiumCursor />
        <ScrollSequence />
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
