import { useState } from "react";
import { ArrowUpRight, Copy, Check, Send, Terminal, Mail, Github, Linkedin, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function ContactTerminal() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", topic: "collaboration", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const email = "gokula.work@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    toast.success("Email copied to clipboard: gokula.work@gmail.com");
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in your name, email, and a quick note!");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Message dispatched! Thanks for reaching out.", {
        description: `I'll get back to you at ${formData.email} soon!`,
      });
      setFormData({ name: "", email: "", topic: "collaboration", message: "" });
    }, 900);
  };

  return (
    <div className="editorial-contact-terminal" data-reveal>
      {/* Top Header */}
      <div className="editorial-terminal-bar">
        <div className="editorial-terminal-status">
          <Terminal className="w-3.5 h-3.5 text-[var(--editorial-blue)]" />
          <span>SAY HELLO // ALWAYS OPEN FOR COOL IDEAS &amp; BUILDS</span>
        </div>
        <div className="editorial-terminal-coords">
          <span>CHENNAI, IN</span>
          <span>·</span>
          <span>STATUS: ONLINE &amp; TINKERING</span>
        </div>
      </div>

      <div className="editorial-terminal-grid">
        {/* Left Side: Direct Channel & Links */}
        <div className="editorial-terminal-left">
          <div className="editorial-terminal-direct">
            <span className="editorial-terminal-eyebrow">DROP ME A NOTE DIRECTLY</span>
            <div className="editorial-terminal-email-row">
              <a href={`mailto:${email}`} className="editorial-terminal-email-link">
                {email}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="editorial-terminal-copy-btn"
                aria-label="Copy email address"
                title="Copy email to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "COPIED" : "COPY"}</span>
              </button>
            </div>
            <p className="editorial-terminal-subtext">
              Direct inbox checked daily. Whether you want to talk about autonomous robots, multi-agent AI, hackathons, or just grab good coffee — hit me up!
            </p>
          </div>

          {/* Social Channels */}
          <div className="editorial-terminal-channels">
            <span className="editorial-terminal-eyebrow">FIND ME ON THE WEB</span>
            <div className="editorial-terminal-channel-list">
              <a
                href="https://github.com/CapedCrusader77"
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-channel-item"
              >
                <div className="editorial-channel-left">
                  <Github className="w-4 h-4 text-[var(--editorial-blue)]" />
                  <div>
                    <strong>GitHub</strong>
                    <small>@CapedCrusader77 · Projects &amp; Experiments</small>
                  </div>
                </div>
                <ArrowUpRight className="editorial-channel-arrow" />
              </a>

              <a
                href="https://linkedin.com/in/gokul-a"
                target="_blank"
                rel="noopener noreferrer"
                className="editorial-channel-item"
              >
                <div className="editorial-channel-left">
                  <Linkedin className="w-4 h-4 text-[var(--editorial-blue)]" />
                  <div>
                    <strong>LinkedIn</strong>
                    <small>Gokul A · Let&apos;s connect &amp; chat</small>
                  </div>
                </div>
                <ArrowUpRight className="editorial-channel-arrow" />
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Transmission Form */}
        <div className="editorial-terminal-right">
          <form onSubmit={handleSubmit} className="editorial-transmission-form">
            <span className="editorial-terminal-eyebrow">SEND A QUICK MESSAGE</span>

            <div className="editorial-form-group">
              <label htmlFor="contact-name">YOUR NAME</label>
              <input
                id="contact-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ada Lovelace / Fellow Builder"
                className="editorial-form-input"
              />
            </div>

            <div className="editorial-form-group">
              <label htmlFor="contact-email">YOUR EMAIL</label>
              <input
                id="contact-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ada@example.com"
                className="editorial-form-input"
              />
            </div>

            <div className="editorial-form-group">
              <label htmlFor="contact-topic">WHAT&apos;S ON YOUR MIND?</label>
              <select
                id="contact-topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="editorial-form-select"
              >
                <option value="collaboration">Cool Robotics / AI Project Idea</option>
                <option value="engineering">Multi-Agent AI / Architecture Question</option>
                <option value="opportunity">Internship / Research / Work Opportunity</option>
                <option value="general">Just saying hi &amp; sharing good coffee vibes</option>
              </select>
            </div>

            <div className="editorial-form-group">
              <label htmlFor="contact-message">YOUR MESSAGE</label>
              <textarea
                id="contact-message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell me about what you're working on, an interesting bug you hit, or whatever's on your mind..."
                className="editorial-form-textarea"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="editorial-submit-btn"
            >
              {isSubmitting ? (
                <span>SENDING NOTE...</span>
              ) : submitted ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SENT! SEND ANOTHER</span>
                </>
              ) : (
                <>
                  <span>SEND MESSAGE</span>
                  <Send className="w-3.5 h-3.5 text-[var(--editorial-blue)]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
