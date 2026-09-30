import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { cn } from "../utils/cn";
import { readCssColor, toRGB, useIstTime } from "./ui";

/* ---------- toys ---------- */
function BlendLab() {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const sx = useSpring(x, { stiffness: 120, damping: 18 });
  const sy = useSpring(y, { stiffness: 120, damping: 18 });
  const left = useTransform(sx, (v) => `${v * 100}%`);
  const top = useTransform(sy, (v) => `${v * 100}%`);
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width);
    y.set((e.clientY - r.top) / r.height);
  };
  return (
    <div className="relative h-full w-full bg-[#090807]" onPointerMove={onMove}>
      <div className="absolute left-[36%] top-[46%] aspect-square w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-acc" style={{ mixBlendMode: "screen" }} />
      <div className="floaty absolute left-[64%] top-[52%] aspect-square w-[50%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-acc2" style={{ mixBlendMode: "screen" }} />
      <motion.div className="absolute aspect-square w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2ee59d]" style={{ left, top, mixBlendMode: "screen" }} />
    </div>
  );
}

function MatrixRain() {
  const ref = useRef<HTMLCanvasElement>(null);
  const fast = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chars = "01{}[]<>/=+*#$%&;:ABCDEFabcdef";
    const size = 15;
    let w = 0;
    let h = 0;
    let drops: number[] = [];
    let raf = 0;
    let last = 0;
    let frame = 0;
    let visible = true;
    let acc = readCssColor("--acc", "#ff2238");

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = Array.from({ length: Math.ceil(w / size) }, () => Math.random() * -30);
      ctx.fillStyle = "#090807";
      ctx.fillRect(0, 0, w, h);
    };

    const draw = () => {
      ctx.fillStyle = "rgba(9,8,7,.18)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `700 ${size}px "Space Mono", monospace`;
      for (let i = 0; i < drops.length; i++) {
        const yy = drops[i] * size;
        const ch = chars[(Math.random() * chars.length) | 0];
        ctx.fillStyle = drops[i] > 0 && Math.random() > 0.97 ? "#ffffff" : acc;
        ctx.fillText(ch, i * size, yy);
        if (yy > h && Math.random() > 0.96) drops[i] = 0;
        drops[i] += 1;
      }
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;
      if (t - last < (fast.current ? 26 : 58)) return;
      last = t;
      if (++frame % 25 === 0) acc = readCssColor("--acc", "#ff2238");
      draw();
    };

    resize();
    if (reduce) {
      for (let k = 0; k < 40; k++) draw();
    } else {
      raf = requestAnimationFrame(loop);
    }
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden
      onPointerEnter={() => {
        fast.current = true;
      }}
      onPointerLeave={() => {
        fast.current = false;
      }}
    />
  );
}

/* 2D LiDAR: the pointer is the robot, 120 rays are cast against a floor plan */
function LidarScan() {
  const ref = useRef<HTMLCanvasElement>(null);
  const target = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const layout: [number, number, number, number][] = [
      [0.04, 0.05, 0.96, 0.05],
      [0.96, 0.05, 0.96, 0.95],
      [0.96, 0.95, 0.04, 0.95],
      [0.04, 0.95, 0.04, 0.05],
      [0.32, 0.05, 0.32, 0.42],
      [0.32, 0.42, 0.52, 0.42],
      [0.66, 0.95, 0.66, 0.6],
      [0.66, 0.6, 0.86, 0.6],
      [0.14, 0.72, 0.4, 0.72],
      [0.72, 0.22, 0.72, 0.36],
      [0.72, 0.22, 0.88, 0.22],
    ];
    let segs: [number, number, number, number][] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let frame = 0;
    let visible = true;
    let acc = toRGB(readCssColor("--acc", "#ff2238"));
    const pos = { x: 0, y: 0 };
    const RAYS = 120;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      segs = layout.map(([a, b, c, d]) => [a * w, b * h, c * w, d * h]);
      if (pos.x === 0) {
        pos.x = w * 0.5;
        pos.y = h * 0.6;
      }
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || w === 0) return;
      if (++frame % 30 === 0) acc = toRGB(readCssColor("--acc", "#ff2238"));
      const time = reduce ? 0 : t;
      const tg = target.current;
      const gx = tg ? tg.x : w * (0.5 + 0.34 * Math.sin(time * 0.00031));
      const gy = tg ? tg.y : h * (0.5 + 0.3 * Math.sin(time * 0.00043 + 1.3));
      pos.x += (gx - pos.x) * 0.08;
      pos.y += (gy - pos.y) * 0.08;

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(243,239,230,.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (const [x1, y1, x2, y2] of segs) {
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();

      const sweep = (time * 0.0022) % (Math.PI * 2);
      const [cr, cg, cb] = [acc[0] | 0, acc[1] | 0, acc[2] | 0];
      ctx.lineWidth = 1;
      for (let i = 0; i < RAYS; i++) {
        const a = (i / RAYS) * Math.PI * 2;
        const dx = Math.cos(a);
        const dy = Math.sin(a);
        let best = Infinity;
        for (const [x1, y1, x2, y2] of segs) {
          const sx = x2 - x1;
          const sy = y2 - y1;
          const den = dx * sy - dy * sx;
          if (Math.abs(den) < 1e-9) continue;
          const tt = ((x1 - pos.x) * sy - (y1 - pos.y) * sx) / den;
          const uu = ((x1 - pos.x) * dy - (y1 - pos.y) * dx) / den;
          if (tt > 0 && uu >= 0 && uu <= 1 && tt < best) best = tt;
        }
        if (!isFinite(best)) continue;
        const hx = pos.x + dx * best;
        const hy = pos.y + dy * best;
        let d = (sweep - a) % (Math.PI * 2);
        if (d < 0) d += Math.PI * 2;
        const lit = Math.max(0, 1 - d / 1.4);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.04 + lit * 0.35})`;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.35 + lit * 0.65})`;
        ctx.beginPath();
        ctx.arc(hx, hy, 1.6 + lit * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "#f3efe6";
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgb(${cr},${cg},${cb})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2);
      ctx.stroke();
    };

    resize();
    raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        target.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      }}
      onPointerLeave={() => {
        target.current = null;
      }}
    />
  );
}

function Hand({ deg, len, w, cls }: { deg: number; len: string; w: number; cls: string }) {
  return <span className={cn("absolute left-1/2 top-1/2 rounded-full", cls)} style={{ width: w, height: len, transform: `translate(-50%, -100%) rotate(${deg}deg)`, transformOrigin: "50% 100%" }} />;
}

function Clock() {
  const { h, m, s } = useIstTime();
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="relative aspect-square w-[72%] max-w-[280px] rounded-full border-[3px] border-current">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="absolute left-1/2 top-1/2 h-[46%] w-[3px]" style={{ transform: `translate(-50%, -100%) rotate(${i * 30}deg)`, transformOrigin: "50% 100%" }}>
            <span className={cn("block w-full rounded-full bg-current", i % 3 === 0 ? "h-4" : "h-2 opacity-60")} />
          </span>
        ))}
        <Hand deg={(h % 12) * 30 + m * 0.5} len="26%" w={6} cls="bg-current" />
        <Hand deg={m * 6 + s * 0.1} len="38%" w={4} cls="bg-current" />
        <Hand deg={s * 6} len="44%" w={2} cls="bg-[#0d0c0b]" />
        <span className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0d0c0b] ring-4 ring-current" />
      </div>
    </div>
  );
}

const spiroPath = (() => {
  const R = 90;
  const r = 32;
  const d = 55;
  let s = "";
  for (let t = 0; t <= Math.PI * 2 * 16; t += 0.08) {
    const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
    s += `${s ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return s + "Z";
})();

function Spiro() {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <svg viewBox="-120 -120 240 240" className="h-full max-h-[320px] w-full" aria-hidden>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="40s" repeatCount="indefinite" />
          <path d={spiroPath} fill="none" stroke="var(--acc)" strokeWidth="1.2" />
        </g>
        <g>
          <animateTransform attributeName="transform" type="rotate" from="360 0 0" to="0 0 0" dur="55s" repeatCount="indefinite" />
          <path d={spiroPath} fill="none" stroke="var(--acc2)" strokeWidth="1.2" />
        </g>
      </svg>
    </div>
  );
}

type Tile = { n: string; title: string; sub: string; cls: string; node: ReactNode };

const tiles: Tile[] = [
  {
    n: "01",
    title: "BREATHING TYPE",
    sub: "variable font stress test",
    cls: "bg-card text-ink ring-1 ring-white/15",
    node: (
      <div className="flex h-full items-center justify-center">
        <span className="breathe font-display text-[30vw] leading-none text-acc md:text-[11vw]">Aa</span>
      </div>
    ),
  },
  { n: "02", title: "BLEND LAB", sub: "move your pointer", cls: "bg-card text-ink ring-1 ring-white/15", node: <BlendLab /> },
  { n: "03", title: "LIDAR SCAN", sub: "your pointer is the robot", cls: "bg-[#090807] text-ink ring-1 ring-white/15", node: <LidarScan /> },
  { n: "04", title: "MATRIX RAIN", sub: "hover to speed it up", cls: "bg-[#090807] text-ink ring-1 ring-white/15", node: <MatrixRain /> },
  { n: "05", title: "CHENNAI · IST", sub: "Indian Standard Time", cls: "bg-acc text-onacc", node: <Clock /> },
  { n: "06", title: "SPIROGRAPH", sub: "parametric curves", cls: "bg-card text-ink ring-1 ring-white/15", node: <Spiro /> },
];

/* ---------- pinned horizontal scroll ---------- */
export default function Playground() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState(0);

  useEffect(() => {
    const measure = () => {
      const t = trackRef.current;
      if (!t) return;
      setRange(Math.max(0, t.scrollWidth - window.innerWidth));
    };
    measure();
    const id = window.setTimeout(measure, 600);
    window.addEventListener("resize", measure);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -range]);

  return (
    <section id="lab" data-section="LAB" ref={ref} className="relative bg-paper text-ink" style={{ height: `calc(100vh + ${range}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mb-6 flex items-end justify-between px-5 md:px-10">
          <h2 className="font-display text-5xl font-extrabold tracking-[-.045em] md:text-8xl">
            EXPERIMENT <span className="text-acc">INDEX</span>
          </h2>
          <p className="hidden font-mono text-[11px] font-bold tracking-[.2em] md:block">(05) SIX EXPERIMENTS — SCROLL →</p>
        </div>
        <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-5 px-5 pr-10 md:gap-8 md:px-10 md:pr-24">
          {tiles.map((t) => (
            <motion.article
              key={t.n}
              data-cursor="PLAY"
              className={cn("relative flex h-[62vh] w-[80vw] shrink-0 flex-col overflow-hidden border border-current/20 md:w-[32vw] md:min-w-[380px]", t.cls)}
              whileHover={{ scale: 1.015 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
            >
              <div className="relative flex-1 overflow-hidden">{t.node}</div>
              <div className="flex items-end justify-between gap-4 border-t border-current/20 p-5">
                <div>
                  <p className="font-mono text-[10px] tracking-[.2em] opacity-60">{t.n}</p>
                  <h3 className="mt-1 font-display text-xl font-extrabold tracking-tight md:text-2xl">{t.title}</h3>
                </div>
                <p className="text-right font-serif text-lg italic opacity-70">{t.sub}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
