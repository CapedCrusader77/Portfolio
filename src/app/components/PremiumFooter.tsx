import { ArrowUp } from "lucide-react";

export function PremiumFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="final-footer">
      <span>© 2026 Gokul A</span>
      <span>BUILT WITH REACT / TYPESCRIPT</span>
      <button type="button" onClick={scrollToTop}>
        BACK TO TOP <ArrowUp aria-hidden="true" />
      </button>
    </footer>
  );
}
