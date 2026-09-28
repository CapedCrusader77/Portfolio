import { useEffect, useState, useRef } from "react";
import { Search, ArrowRight, CornerDownLeft, Sparkles, FolderGit2, BookOpen, Mail, Github, Linkedin, X } from "lucide-react";
import { toast } from "sonner";

interface CommandItem {
  id: string;
  title: string;
  category: "Sections" | "Projects" | "Actions";
  icon: typeof Search;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject?: (title: string) => void;
}

export function CommandPalette({ isOpen, onClose, onSelectProject }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const copyEmail = () => {
    navigator.clipboard.writeText("gokula.work@gmail.com");
    toast.success("Email copied to clipboard: gokula.work@gmail.com");
    onClose();
  };

  const copyGithub = () => {
    navigator.clipboard.writeText("https://github.com/CapedCrusader77");
    toast.success("GitHub profile copied: github.com/CapedCrusader77");
    onClose();
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    onClose();
  };

  const toggleAttractor = (mode: "LATTICE" | "VORTEX" | "TORUS") => {
    window.dispatchEvent(new CustomEvent("portfolio:attractor-mode", { detail: { mode } }));
    toast.success(`3D Particle Field switched to ${mode} mode`);
    onClose();
  };

  const items: CommandItem[] = [
    // Sections
    { id: "sec-hero", title: "Home / Overview", category: "Sections", icon: BookOpen, action: () => scrollTo("hero") },
    { id: "sec-about", title: "01 / Perspective (Two Degrees, One Curiosity)", category: "Sections", icon: Sparkles, action: () => scrollTo("about") },
    { id: "sec-projects", title: "02 / Things I've Built (Shipped Work)", category: "Sections", icon: FolderGit2, action: () => scrollTo("projects") },
    { id: "sec-skills", title: "03 / Tools of the Trade (Skills & Tech)", category: "Sections", icon: BookOpen, action: () => scrollTo("skills") },
    { id: "sec-journey", title: "04 / Journey (Parallel Tracks)", category: "Sections", icon: BookOpen, action: () => scrollTo("experience") },
    { id: "sec-contact", title: "05 / Say Hello (Direct Contact)", category: "Sections", icon: Mail, action: () => scrollTo("contact") },

    // Featured Projects
    {
      id: "proj-rootcause",
      title: "ROOTCAUSE IQ — Multi-Agent Incident Analysis",
      category: "Projects",
      icon: FolderGit2,
      action: () => {
        scrollTo("projects");
        if (onSelectProject) onSelectProject("ROOTCAUSE");
        onClose();
      },
    },
    {
      id: "proj-trustgraph",
      title: "TRUSTGRAPH — Repository Decision Intelligence",
      category: "Projects",
      icon: FolderGit2,
      action: () => {
        scrollTo("projects");
        if (onSelectProject) onSelectProject("TRUSTGRAPH");
        onClose();
      },
    },
    {
      id: "proj-siege",
      title: "SIEGE — Live Cyber Simulation Range",
      category: "Projects",
      icon: FolderGit2,
      action: () => {
        scrollTo("projects");
        if (onSelectProject) onSelectProject("SIEGE");
        onClose();
      },
    },
    {
      id: "proj-slam",
      title: "SLAM NAVIGATOR — Autonomous Spatial Perception",
      category: "Projects",
      icon: FolderGit2,
      action: () => {
        scrollTo("projects");
        if (onSelectProject) onSelectProject("SLAM NAVIGATOR");
        onClose();
      },
    },

    // Actions
    { id: "act-email", title: "Copy Email: gokula.work@gmail.com", category: "Actions", icon: Mail, shortcut: "⌘E", action: copyEmail },
    { id: "act-github", title: "Copy GitHub: github.com/CapedCrusader77", category: "Actions", icon: Github, action: copyGithub },
    {
      id: "act-bg-minimal-tech",
      title: "Background: Minimal Tech Blueprint (Default)",
      category: "Actions",
      icon: Sparkles,
      action: () => {
        window.dispatchEvent(new CustomEvent("portfolio:switch-bg", { detail: { id: "minimal-tech", url: "/minimal-tech-bg.jpg" } }));
        toast.success("Background: Minimal Tech Blueprint");
        onClose();
      },
    },
    {
      id: "act-bg-blueprint",
      title: "Background: Minimal Radar Grid",
      category: "Actions",
      icon: Sparkles,
      action: () => {
        window.dispatchEvent(new CustomEvent("portfolio:switch-bg", { detail: { id: "blueprint", url: "/minimal-blueprint-bg.jpg" } }));
        toast.success("Background: Minimal Radar Grid");
        onClose();
      },
    },
    {
      id: "act-bg-monolith",
      title: "Background: Architectural Citadel",
      category: "Actions",
      icon: Sparkles,
      action: () => {
        window.dispatchEvent(new CustomEvent("portfolio:switch-bg", { detail: { id: "citadel", url: "/arch-monolith-bg.jpg" } }));
        toast.success("Background: Architectural Citadel");
        onClose();
      },
    },
    {
      id: "act-bg-cyber",
      title: "Background: Cyber Architecture V3",
      category: "Actions",
      icon: Sparkles,
      action: () => {
        window.dispatchEvent(new CustomEvent("portfolio:switch-bg", { detail: { id: "cyber", url: "/cinematic-hero-architecture-v3.png" } }));
        toast.success("Background: Cyber Architecture");
        onClose();
      },
    },
    { id: "act-field-lattice", title: "3D Field: Quantum Lattice Mode", category: "Actions", icon: Sparkles, action: () => toggleAttractor("LATTICE") },
    { id: "act-field-vortex", title: "3D Field: Cyber Vortex Mode", category: "Actions", icon: Sparkles, action: () => toggleAttractor("VORTEX") },
    { id: "act-field-torus", title: "3D Field: Fluid Torus Mode", category: "Actions", icon: Sparkles, action: () => toggleAttractor("TORUS") },
  ];

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else window.dispatchEvent(new CustomEvent("portfolio:open-command"));
      }
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="editorial-palette-backdrop" onClick={onClose}>
      <div className="editorial-palette-box" onClick={(e) => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="editorial-palette-input-bar">
          <Search className="w-4 h-4 text-[var(--editorial-blue)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, project, or section... (e.g. 'ROS2', 'Work', 'Email')"
            className="editorial-palette-input"
            aria-label="Search portfolio commands"
          />
          <button
            type="button"
            onClick={onClose}
            className="editorial-palette-close-btn"
            aria-label="Close command palette"
          >
            <span className="editorial-palette-esc">ESC</span>
          </button>
        </div>

        {/* Results List */}
        <div className="editorial-palette-list" role="listbox">
          {filtered.length === 0 ? (
            <div className="editorial-palette-empty">
              <span>No commands or items matching &quot;{query}&quot;</span>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={item.action}
                  className={`editorial-palette-item ${isSelected ? "is-selected" : ""}`}
                >
                  <div className="editorial-palette-item-left">
                    <Icon className="w-3.5 h-3.5 text-[var(--editorial-blue)] shrink-0" />
                    <span className="editorial-palette-item-title">{item.title}</span>
                  </div>
                  <div className="editorial-palette-item-right">
                    <span className="editorial-palette-cat-tag">{item.category}</span>
                    {isSelected && <CornerDownLeft className="w-3.5 h-3.5 text-[var(--editorial-paper)]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="editorial-palette-footer">
          <div className="editorial-palette-hints">
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>esc</kbd> Dismiss</span>
          </div>
          <span className="editorial-palette-brand">GOKUL A. / QUICK NAV</span>
        </div>
      </div>
    </div>
  );
}
