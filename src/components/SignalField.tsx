import { useEffect, useRef } from "react";
import { readCssColor, toRGB } from "./ui";

type V3 = { x: number; y: number; z: number };

const N = 190; // points in the morphing field
const AMBIENT = 460; // background drift particles
const NEIGH = 5; // constellation links per point

/* ------------------------------------------------------------------ *
 * Three formations the field morphs between. Each is a set of target
 * positions on the unit sphere; the live points ease toward a blend of
 * them, which is what makes the transitions feel smooth rather than snappy.
 * ------------------------------------------------------------------ */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const sphereF = new Float32Array(N * 3);
const discF = new Float32Array(N * 3);
const torusF = new Float32Array(N * 3);

for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2;
  const rad = Math.sqrt(Math.max(0, 1 - y * y));
  const a = GOLDEN * i;

  // 1 — neural mesh: even fibonacci sphere
  sphereF[i * 3] = Math.cos(a) * rad;
  sphereF[i * 3 + 1] = y;
  sphereF[i * 3 + 2] = Math.sin(a) * rad;

  // 2 — lidar scan plane: flat disc, points fanned by angle, slight ripple
  const rr = Math.sqrt((i + 0.5) / N) * 1.22;
  const aa = a * 1.9;
  discF[i * 3] = Math.cos(aa) * rr;
  discF[i * 3 + 1] = Math.sin(i * 2.3) * 0.035;
  discF[i * 3 + 2] = Math.sin(aa) * rr * 0.4;

  // 3 — orbit torus: tilted ring of points
  const R = 0.82;
  const rt = 0.34;
  const u = a;
  const v = u * 3;
  const cv = Math.cos(v);
  const x = (R + rt * cv) * Math.cos(u);
  const z = (R + rt * cv) * Math.sin(u);
  const yv = rt * Math.sin(v);
  const t = 0.42;
  torusF[i * 3] = x;
  torusF[i * 3 + 1] = yv * Math.cos(t) - z * Math.sin(t);
  torusF[i * 3 + 2] = yv * Math.sin(t) + z * Math.cos(t);
}

// neighbour links, computed once from the sphere layout
const links: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const d: { j: number; d: number }[] = [];
    for (let j = 0; j < N; j++) {
      if (j === i) continue;
      const dx = sphereF[i * 3] - sphereF[j * 3];
      const dy = sphereF[i * 3 + 1] - sphereF[j * 3 + 1];
      const dz = sphereF[i * 3 + 2] - sphereF[j * 3 + 2];
      d.push({ j, d: dx * dx + dy * dy + dz * dz });
    }
    d.sort((a, b) => a.d - b.d);
    for (let k = 0; k < NEIGH; k++) if (d[k]) out.push([i, d[k].j]);
  }
  return out;
})();

const FORMATIONS = ["NEURAL MESH", "SCAN PLANE", "ORBIT RING"];

export default function SignalField({ labelRef }: { labelRef?: React.RefObject<HTMLSpanElement | null> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* point state */
    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const pz = new Float32Array(N);
    const sx = new Float32Array(N);
    const sy = new Float32Array(N);
    const sz = new Float32Array(N);
    const sg = new Float32Array(N); // pointer glow, 0..1
    for (let i = 0; i < N; i++) {
      px[i] = sphereF[i * 3];
      py[i] = sphereF[i * 3 + 1];
      pz[i] = sphereF[i * 3 + 2];
    }

    /* ambient drift particles */
    const ax = new Float32Array(AMBIENT);
    const ay = new Float32Array(AMBIENT);
    const avx = new Float32Array(AMBIENT);
    const avy = new Float32Array(AMBIENT);
    const as = new Float32Array(AMBIENT);
    for (let i = 0; i < AMBIENT; i++) {
      ax[i] = Math.random();
      ay[i] = Math.random();
      const sp = 0.00004 + Math.random() * 0.00012;
      const ang = Math.random() * Math.PI * 2;
      avx[i] = Math.cos(ang) * sp;
      avy[i] = Math.sin(ang) * sp * 0.6;
      as[i] = 0.4 + Math.random() * 1.5;
    }

    /* signal arcs that travel between two random points */
    type Arc = { a: number; b: number; t: number; dur: number };
    const arcs: Arc[] = [];
    let nextArc = 0;

    /* expanding pings from the core */
    const pings: number[] = [];
    let nextPing = 0;

    let w = 0;
    let h = 0;
    let cx = 0;
    let cy = 0;
    let R = 0;
    let raf = 0;
    let frame = 0;
    let visible = false;
    let heroTop = 0;
    let heroH = 1;

    let yaw = 0.6;
    let pitch = -0.3;
    let vyaw = 0.0026;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let morph = 0; // eased 0..2
    let morphTarget = 0;
    const ptr = { x: -9999, y: -9999 };

    let c1 = toRGB(readCssColor("--acc", "#ff6b00"));
    let c2 = toRGB(readCssColor("--acc2", "#ffa333"));
    const C1 = (a: number) => `rgba(${c1[0] | 0},${c1[1] | 0},${c1[2] | 0},${a})`;
    const C2 = (a: number) => `rgba(${c2[0] | 0},${c2[1] | 0},${c2[2] | 0},${a})`;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const wide = w > 900;
      cx = w * (wide ? 0.63 : 0.5);
      cy = h * (wide ? 0.44 : 0.4);
      R = Math.min(wide ? w * 0.2 : w * 0.32, h * 0.29);
      heroTop = r.top + window.scrollY;
      heroH = Math.max(1, h);
    };

    const draw = (time: number) => {
      frame++;
      if (frame % 25 === 0) {
        c1 = toRGB(readCssColor("--acc", "#ff6b00"));
        c2 = toRGB(readCssColor("--acc2", "#ffa333"));
      }

      /* ---- scroll drives which formation we are easing toward ---- */
      if (!reduce) {
        const p = Math.max(0, Math.min(1, (window.scrollY - heroTop) / heroH));
        morphTarget = p * 2;
      } else {
        morphTarget = 0;
      }
      morph += (morphTarget - morph) * 0.035;

      let w0 = 0;
      let w1 = 0;
      let w2 = 0;
      if (morph <= 1) {
        w0 = 1 - morph;
        w1 = morph;
      } else {
        w1 = 2 - morph;
        w2 = morph - 1;
      }

      /* ---- rotation ---- */
      if (!dragging) {
        yaw += vyaw;
        vyaw += (0.0026 - vyaw) * 0.02;
        const ny = ptr.y > -9000 ? ptr.y / h - 0.5 : 0;
        pitch += (-0.3 + ny * 0.55 - pitch) * 0.035;
      }

      /* ---- ease points toward the blended target ---- */
      const damp = reduce ? 1 : 0.075;
      for (let i = 0; i < N; i++) {
        const tx = w0 * sphereF[i * 3] + w1 * discF[i * 3] + w2 * torusF[i * 3];
        const ty = w0 * sphereF[i * 3 + 1] + w1 * discF[i * 3 + 1] + w2 * torusF[i * 3 + 1];
        const tz = w0 * sphereF[i * 3 + 2] + w1 * discF[i * 3 + 2] + w2 * torusF[i * 3 + 2];
        px[i] += (tx - px[i]) * damp;
        py[i] += (ty - py[i]) * damp;
        pz[i] += (tz - pz[i]) * damp;
      }

      /* ---- project ---- */
      const cyw = Math.cos(yaw);
      const syw = Math.sin(yaw);
      const cpt = Math.cos(pitch);
      const spt = Math.sin(pitch);
      for (let i = 0; i < N; i++) {
        const x1 = px[i] * cyw + pz[i] * syw;
        const z1 = -px[i] * syw + pz[i] * cyw;
        const y2 = py[i] * cpt - z1 * spt;
        const z2 = py[i] * spt + z1 * cpt;
        const f2 = 1 / (1 - z2 * 0.22);
        let X = cx + x1 * R * f2;
        let Y = cy + y2 * R * f2;
        const dx = X - ptr.x;
        const dy = Y - ptr.y;
        const d = Math.hypot(dx, dy);
        let glow = 0;
        if (d < 170) {
          glow = 1 - d / 170;
          const push = glow * glow * 26;
          X += (dx / (d || 1)) * push;
          Y += (dy / (d || 1)) * push;
        }
        sx[i] = X;
        sy[i] = Y;
        sz[i] = (z2 + 1) / 2;
        sg[i] = glow;
      }

      ctx.clearRect(0, 0, w, h);

      /* ---- ambient drift ---- */
      ctx.fillStyle = C1(0.3);
      ctx.beginPath();
      for (let i = 0; i < AMBIENT; i++) {
        if (!reduce) {
          ax[i] += avx[i];
          ay[i] += avy[i];
          if (ax[i] < -0.05) ax[i] = 1.05;
          if (ax[i] > 1.05) ax[i] = -0.05;
          if (ay[i] < -0.05) ay[i] = 1.05;
          if (ay[i] > 1.05) ay[i] = -0.05;
        }
        const X = ax[i] * w;
        const Y = ay[i] * h;
        const s = as[i];
        ctx.moveTo(X + s, Y);
        ctx.arc(X, Y, s, 0, Math.PI * 2);
      }
      ctx.fill();

      /* ---- core glow ---- */
      const pulse = reduce ? 0.5 : 0.5 + Math.sin(time * 0.0011) * 0.16;
      const g = ctx.createRadialGradient(cx, cy, R * 0.05, cx, cy, R * 1.9);
      g.addColorStop(0, C1(0.16 * pulse));
      g.addColorStop(0.45, C1(0.05 * pulse));
      g.addColorStop(1, C1(0));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      /* ---- horizon rings ---- */
      const rings: [number, number, number, number][] = [
        [R * 1.5, 0.26, -0.42, 0.0006],
        [R * 1.95, 0.15, 0.9, -0.0004],
        [R * 2.5, 0.09, 0.1, 0.00025],
      ];
      rings.forEach(([rr, sq, rot, sp], idx) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.setLineDash([3, 10]);
        ctx.strokeStyle = C1(idx === 0 ? 0.28 : 0.14);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, rr, rr * sq, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        if (!reduce) {
          const ang = time * sp + idx;
          const X = Math.cos(ang) * rr;
          const Y = Math.sin(ang) * rr * sq;
          const front = Y >= 0 ? 1 : 0.3;
          ctx.fillStyle = idx === 0 ? C2(front) : C1(front);
          if (idx === 0) {
            ctx.beginPath();
            ctx.arc(X, Y, 5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(X - 3.5, Y - 3.5, 7, 7);
          }
        }
        ctx.restore();
      });

      /* ---- constellation links ---- */
      ctx.lineWidth = 1;
      for (let k = 0; k < links.length; k++) {
        const a = links[k][0];
        const b = links[k][1];
        const depth = (sz[a] + sz[b]) / 2;
        const gl = Math.max(sg[a], sg[b]);
        ctx.strokeStyle = C1(0.035 + depth * depth * 0.3 + gl * 0.4);
        ctx.beginPath();
        ctx.moveTo(sx[a], sy[a]);
        ctx.lineTo(sx[b], sy[b]);
        ctx.stroke();
      }

      /* ---- expanding pings ---- */
      if (!reduce && time > nextPing) {
        pings.push(time);
        nextPing = time + 2600 + Math.random() * 2400;
      }
      for (let i = pings.length - 1; i >= 0; i--) {
        const age = time - pings[i];
        const life = 1800;
        if (age > life) {
          pings.splice(i, 1);
          continue;
        }
        const t = age / life;
        const rr = R * (0.25 + t * 1.05);
        ctx.strokeStyle = C2((1 - t) * 0.5);
        ctx.lineWidth = 1.5 * (1 - t) + 0.4;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr, rr * 0.34, -0.42, 0, Math.PI * 2);
        ctx.stroke();
      }

      /* ---- signal arcs between points ---- */
      if (!reduce && time > nextArc && arcs.length < 5) {
        arcs.push({ a: (Math.random() * N) | 0, b: (Math.random() * N) | 0, t: 0, dur: 620 + Math.random() * 420 });
        nextArc = time + 900 + Math.random() * 1500;
      }
      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        arc.t += 1;
        const p = arc.t / arc.dur;
        if (p >= 1) {
          arcs.splice(i, 1);
          continue;
        }
        const a = arc.a;
        const b = arc.b;
        const mx = (sx[a] + sx[b]) / 2;
        const my = (sy[a] + sy[b]) / 2 - Math.hypot(sx[b] - sx[a], sy[b] - sy[a]) * 0.22;
        const shown = Math.min(1, p * 3.2);
        const fade = 1 - Math.max(0, (p - 0.6) / 0.4);
        ctx.strokeStyle = C2(fade * 0.75);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        // quadratic bezier drawn up to `shown`
        const q = (u: number) => {
          const iu = 1 - u;
          return {
            x: iu * iu * sx[a] + 2 * iu * u * mx + u * u * sx[b],
            y: iu * iu * sy[a] + 2 * iu * u * my + u * u * sy[b],
          };
        };
        ctx.moveTo(sx[a], sy[a]);
        for (let s = 1; s <= 14; s++) {
          const pt = q((s / 14) * shown);
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.stroke();
        const head = q(shown);
        ctx.fillStyle = C2(fade);
        ctx.beginPath();
        ctx.arc(head.x, head.y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ---- points ---- */
      for (let i = 0; i < N; i++) {
        const r = 1 + sz[i] * 2.1 + sg[i] * 3.6;
        ctx.fillStyle = sg[i] > 0.05 ? `rgba(255,255,255,${0.45 + sg[i] * 0.55})` : C1(0.22 + sz[i] * 0.72);
        ctx.beginPath();
        ctx.arc(sx[i], sy[i], r, 0, Math.PI * 2);
        ctx.fill();
      }

      /* ---- formation label (written straight to the DOM) ---- */
      if (labelRef?.current && frame % 12 === 0) {
        const idx = Math.max(0, Math.min(2, Math.round(morph)));
        const next = labelRef.current.textContent;
        const name = FORMATIONS[idx];
        if (next !== name) labelRef.current.textContent = name;
      }
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible || w === 0) return;
      draw(t);
    };

    const rel = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
    };
    const onMove = (e: PointerEvent) => {
      rel(e);
      canvas.dataset.cursor = Math.hypot(ptr.x - cx, ptr.y - cy) < R * 1.3 ? "DRAG" : "";
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        yaw += dx * 0.008;
        pitch = Math.max(-1.3, Math.min(1.3, pitch + dy * 0.006));
        vyaw = dx * 0.0024;
      }
    };
    const onLeave = () => {
      ptr.x = -9999;
      ptr.y = -9999;
    };
    const onDown = (e: PointerEvent) => {
      rel(e);
      if (Math.hypot(ptr.x - cx, ptr.y - cy) > R * 1.3) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };

    resize();
    raf = requestAnimationFrame(loop);
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
    });
    io.observe(canvas);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", resize, { passive: true });
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [labelRef]);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full touch-pan-y" aria-hidden />;
}

export type { V3 };
