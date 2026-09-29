import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Roll, ease } from "./ui";

const links = [
  { label: "WORK", href: "#work" },
  { label: "TRANSFORM", href: "#reach" },
  { label: "ABOUT", href: "#about" },
  { label: "LAB", href: "#lab" },
  { label: "TERMINAL", href: "#terminal" },
];

function Swatches() {
  return (
    <span className="flex -space-x-1">
      <i className="h-2.5 w-2.5 bg-acc ring-1 ring-[#0d0c0b]" />
      <i className="h-2.5 w-2.5 bg-acc2 ring-1 ring-[#0d0c0b]" />
    </span>
  );
}

function Menu({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[160] flex flex-col bg-[#0d0c0b] text-[#f3efe6]"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.7, ease }}
    >
      <div className="flex items-center justify-between px-5 py-6">
        <span className="font-mono text-sm font-bold tracking-[.18em] text-acc">GOKUL A / 01</span>
        <button onClick={onClose} className="border border-white/25 px-4 py-2 font-mono text-[11px] font-bold tracking-[.18em]">
          CLOSE
        </button>
      </div>
      <nav className="mt-auto flex flex-col px-5 pb-12">
        {[...links, { label: "CONTACT", href: "#contact" }].map((l, i) => (
          <motion.a
            key={l.href}
            href={l.href}
            onClick={onClose}
            className="flex items-baseline gap-4 border-t border-white/15 py-4 font-display text-6xl font-extrabold tracking-tight active:text-acc"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease }}
          >
            <span className="font-mono text-xs font-normal opacity-50">0{i + 1}</span>
            {l.label}
          </motion.a>
        ))}
        <p className="mt-8 font-mono text-sm text-acc">gokula.work@gmail.com</p>
      </nav>
    </motion.div>
  );
}

export default function Nav({ onRemix }: { onRemix: () => void }) {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  // slide away when scrolling down, return when scrolling up
  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    if (v > prev && v > 220) setHidden(true);
    else if (v < prev) setHidden(false);
  });

  return (
    <>
      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-[140] flex items-center justify-between border-b border-white/10 bg-[#0d0c0b]/70 px-4 py-3 backdrop-blur-md md:px-8 md:py-4"
        animate={{ y: hidden && !open ? -110 : 0 }}
        transition={{ duration: 0.45, ease }}
      >
        <a href="#top" data-cursor="TOP" className="pointer-events-auto flex items-center gap-2.5 border-l-2 border-acc py-1 pl-3 pr-4 text-[#f3efe6]">
          <span className="relative flex h-2 w-2">
            <span className="ping-soft absolute inline-flex h-full w-full bg-acc opacity-70" />
            <span className="relative inline-flex h-2 w-2 bg-acc" />
          </span>
          <span className="font-mono text-xs font-bold leading-none tracking-[.18em]">GOKUL A</span>
          <span className="hidden font-mono text-[10px] tracking-[.18em] text-white/45 sm:inline">AI × ROBOTICS</span>
        </a>

        <nav className="pointer-events-auto hidden items-center border-x border-white/20 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="border-r border-white/20 px-4 py-2 font-mono text-[11px] font-bold tracking-[.18em] last:border-r-0 hover:bg-white/10 hover:text-acc">
              <Roll text={l.label} />
            </a>
          ))}
        </nav>

        <div className="pointer-events-auto flex items-center gap-2">
          <button onClick={onRemix} data-cursor="PALETTE" aria-label="Change palette" className="flex items-center gap-2 border border-white/20 px-3.5 py-2.5 font-mono text-[11px] font-bold tracking-[.18em] text-[#f3efe6] hover:border-acc hover:text-acc">
            <Swatches />
            <span className="hidden sm:inline">
              <Roll text="PALETTE" />
            </span>
          </button>
          <a href="#contact" data-cursor="HI" className="hidden bg-acc px-5 py-2.5 font-mono text-[11px] font-bold tracking-[.18em] text-onacc md:block">
            <Roll text="CONTACT" />
          </a>
          <button onClick={() => setOpen(true)} className="border border-white/20 px-4 py-2.5 font-mono text-[11px] font-bold tracking-[.18em] text-[#f3efe6] md:hidden">
            MENU
          </button>
        </div>
      </motion.header>

      <AnimatePresence>{open && <Menu onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
