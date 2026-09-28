import { useEffect } from "react";
import { X, ExternalLink, Copy, Check, Terminal, Layers, Cpu, Shield, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface ProjectDossier {
  number: string;
  title: string;
  type: string;
  category: "multi-agent" | "decision-intel" | "cyber" | "robotics";
  year: string;
  description: string;
  stack: string;
  github: string;
  image: string;
  imagePosition: string;
  visual: string;
  architecture: {
    overview: string;
    diagram: string[];
    innovations: string[];
    layers: { name: string; tools: string }[];
    metrics: { label: string; value: string }[];
  };
}

interface ProjectDossierModalProps {
  project: ProjectDossier | null;
  onClose: () => void;
}

export function ProjectDossierModal({ project, onClose }: ProjectDossierModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  const handleCopyClone = () => {
    const command = `git clone ${project.github}.git`;
    navigator.clipboard.writeText(command);
    setCopied(true);
    toast.success("Clone command copied to clipboard", {
      description: command,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="editorial-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
    >
      <div
        className="editorial-modal-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="editorial-modal-header">
          <div className="editorial-modal-topline">
            <span className="editorial-modal-num">{project.number} // PROJECT DEEP DIVE</span>
            <span className="editorial-modal-status">
              <i className="editorial-status-dot" /> TESTED &amp; SHIPPED
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="editorial-modal-close"
            aria-label="Close dossier modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="editorial-modal-body">
          {/* Title Area */}
          <div className="editorial-modal-title-area">
            <div className="editorial-modal-meta">
              <span>{project.type}</span>
              <span>{project.year}</span>
            </div>
            <h2 id="modal-project-title" className="editorial-modal-title">
              {project.title}
            </h2>
            <p className="editorial-modal-desc">{project.architecture.overview}</p>
          </div>

          {/* Architectural Visual Banner */}
          {project.image && (
            <div
              style={{
                position: "relative",
                width: "100%",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid rgba(237, 240, 237, 0.12)",
                aspectRatio: "16 / 9",
                background: "#0c1117",
              }}
            >
              <img
                src={project.image}
                alt={`${project.title} architectural visualization`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: project.imagePosition || "center",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(10, 14, 18, 0.75) 0%, rgba(10, 14, 18, 0.1) 40%, transparent 100%)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "14px",
                  fontFamily: "var(--font-mono, monospace)",
                  fontSize: "0.62rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--editorial-paper, #edf0ed)",
                  background: "rgba(10, 14, 18, 0.75)",
                  backdropFilter: "blur(6px)",
                  padding: "4px 8px",
                  border: "1px solid rgba(237, 240, 237, 0.15)",
                }}
              >
                LIVE TOPOLOGY &amp; ARCHITECTURE
              </div>
            </div>
          )}

          {/* Key Metrics Strip */}
          <div className="editorial-modal-metrics">
            {project.architecture.metrics.map((m) => (
              <div key={m.label} className="editorial-modal-metric">
                <span className="editorial-modal-metric-val">{m.value}</span>
                <span className="editorial-modal-metric-lbl">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Architectural Pipeline Flow */}
          <div className="editorial-modal-section">
            <div className="editorial-modal-sec-header">
              <Terminal className="w-3.5 h-3.5 text-[var(--editorial-blue)]" />
              <span>HOW IT FLOWS //</span>
            </div>
            <div className="editorial-modal-pipeline">
              {project.architecture.diagram.map((step, idx) => (
                <div key={idx} className="editorial-pipeline-step">
                  <span className="editorial-step-index">0{idx + 1}</span>
                  <span className="editorial-step-text">{step}</span>
                  {idx < project.architecture.diagram.length - 1 && (
                    <ArrowRight className="editorial-step-arrow" aria-hidden="true" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Engineering Innovations */}
          <div className="editorial-modal-section">
            <div className="editorial-modal-sec-header">
              <Cpu className="w-3.5 h-3.5 text-[var(--editorial-blue)]" />
              <span>THE COOL PARTS //</span>
            </div>
            <ul className="editorial-modal-innovations">
              {project.architecture.innovations.map((item, idx) => (
                <li key={idx}>
                  <span className="editorial-bullet" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* System Layer Decomposition */}
          <div className="editorial-modal-section">
            <div className="editorial-modal-sec-header">
              <Layers className="w-3.5 h-3.5 text-[var(--editorial-blue)]" />
              <span>TECH STACK BREAKDOWN //</span>
            </div>
            <div className="editorial-modal-layers">
              {project.architecture.layers.map((layer) => (
                <div key={layer.name} className="editorial-modal-layer">
                  <strong className="editorial-layer-name">{layer.name}</strong>
                  <span className="editorial-layer-tools">{layer.tools}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="editorial-modal-footer">
          <button
            type="button"
            onClick={handleCopyClone}
            className="editorial-action-btn editorial-btn-ghost"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "COPIED!" : "GIT CLONE"}</span>
          </button>

          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-action-btn editorial-btn-primary"
          >
            <span>VIEW CODE ON GITHUB</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
