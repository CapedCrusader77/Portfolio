import { useEffect, useRef } from "react";
import * as THREE from "three";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { readCssColor } from "./ui";

/* ================================================================== *
 *  math helpers
 * ================================================================== */
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const smooth = (v: number) => {
  const x = clamp(v);
  return x * x * (3 - 2 * x);
};
const stage = (p: number, a: number, b: number) => smooth((p - a) / (b - a));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
/** slight overshoot — a mechanical part snapping into its lock */
const backOut = (x: number) => {
  const c1 = 1.05;
  const c3 = c1 + 1;
  const y = clamp(x) - 1;
  return 1 + c3 * y * y * y + c1 * y * y;
};
const cr = (p0: number, p1: number, p2: number, p3: number, t: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);

/* ================================================================== *
 *  body definition — a low mid-engine wedge, defined as cross-section
 *  stations along the length (z: rear -2.4  →  nose +2.4, metres)
 *    w  = half width at the beltline     yt = roof/hood height
 *    yg = beltline (window base) height  rw = half width of the top
 *    yb = underbody height
 * ================================================================== */
type St = { z: number; w: number; yt: number; yg: number; rw: number; yb: number };
const ST: St[] = [
  { z: -2.4, w: 0.96, yt: 0.88, yg: 0.8, rw: 0.78, yb: 0.26 },
  { z: -2.1, w: 1.0, yt: 0.92, yg: 0.84, rw: 0.82, yb: 0.18 },
  { z: -1.7, w: 1.02, yt: 0.97, yg: 0.87, rw: 0.84, yb: 0.13 },
  { z: -1.35, w: 1.03, yt: 1.0, yg: 0.88, rw: 0.8, yb: 0.12 },
  { z: -0.95, w: 1.02, yt: 1.06, yg: 0.84, rw: 0.62, yb: 0.12 },
  { z: -0.5, w: 1.0, yt: 1.12, yg: 0.8, rw: 0.52, yb: 0.12 },
  { z: 0.05, w: 0.99, yt: 1.13, yg: 0.79, rw: 0.5, yb: 0.12 },
  { z: 0.5, w: 1.0, yt: 1.05, yg: 0.8, rw: 0.56, yb: 0.12 },
  { z: 0.9, w: 1.01, yt: 0.95, yg: 0.83, rw: 0.74, yb: 0.12 },
  { z: 1.35, w: 1.02, yt: 0.88, yg: 0.84, rw: 0.84, yb: 0.12 },
  { z: 1.85, w: 0.95, yt: 0.72, yg: 0.69, rw: 0.8, yb: 0.13 },
  { z: 2.4, w: 0.7, yt: 0.46, yg: 0.44, rw: 0.6, yb: 0.2 },
];

/* wheel arches: the lower body is cut back to an inner well wherever a wheel sits */
const WHEEL_Z = [1.35, -1.35];
const WHEEL_Y = 0.365;
const ARCH_R = 0.415;
const SIDE_K = 5; // control samples up the body side
const U_SMOOTH = 28; // resolution of the smoothed shoulder curve (27 = 3 × 9, so control points land exactly)
const GLASS_I = 3 + 15; // first point above the beltline (control point 5 of 9)
const ROOF_I = 3 + 21; // where the painted roof begins (control point 7 of 9)
const SURF_I = 3 + 12; // start of the upper surface used to seat lights and vents (control point 4 of 9)

function archAt(z: number) {
  for (const zw of WHEEL_Z) {
    const dz = Math.abs(z - zw);
    if (dz < ARCH_R) return WHEEL_Y + Math.sqrt(ARCH_R * ARCH_R - dz * dz);
  }
  return -1;
}
function flareAt(z: number) {
  let f = 0;
  for (const zw of WHEEL_Z) {
    const d = Math.abs(z - zw) / 0.75;
    if (d < 1) f = Math.max(f, 0.5 + 0.5 * Math.cos(d * Math.PI));
  }
  return f * 0.035;
}

function stAt(z: number): St {
  const zc = clamp(z, ST[0].z, ST[ST.length - 1].z);
  let i = 0;
  while (i < ST.length - 2 && zc > ST[i + 1].z) i++;
  const p1 = ST[i];
  const p2 = ST[i + 1];
  const p0 = ST[Math.max(0, i - 1)];
  const p3 = ST[Math.min(ST.length - 1, i + 2)];
  const t = (zc - p1.z) / (p2.z - p1.z);
  const f = (k: "w" | "yt" | "yg" | "rw" | "yb") => cr(p0[k], p1[k], p2[k], p3[k], t);
  const w = f("w");
  const yg = f("yg");
  return { z: zc, w, yg, yt: Math.max(f("yt"), yg + 0.012), rw: Math.min(f("rw"), w - 0.02), yb: f("yb") };
}

/** raw control polyline of a half cross-section, bottom-centre → over the shoulder → top-centre */
function halfRaw(s: St): [number, number][] {
  const { z, yt, yg, rw, yb } = s;
  const w = s.w + flareAt(z); // fenders swell over the wheels
  const h = yt - yg;
  const xs = (y: number) => w * (0.84 + 0.16 * Math.sin(clamp((y - yb) / 0.14) * Math.PI * 0.5));
  const out: [number, number][] = [[0, yb]];
  const ya = archAt(z);
  let y0: number;
  if (ya > 0) {
    // inner wheel-well wall, then the arch lip
    const top = Math.min(ya, yg - 0.07);
    out.push([0.74, yb], [0.74, top]);
    y0 = top;
  } else {
    out.push([w * 0.55, yb], [w * 0.72, yb + 0.004]);
    y0 = yb + 0.008;
  }
  const y1 = yg - 0.04;
  for (let k = 0; k < SIDE_K; k++) {
    const y = y0 + ((y1 - y0) * k) / (SIDE_K - 1);
    out.push([xs(y), y]);
  }
  out.push([w - (w - rw) * 0.18, yg + h * 0.22], [w - (w - rw) * 0.55, yg + h * 0.62], [rw, yt - 0.015], [rw * 0.55, yt], [0, yt]);
  return out;
}

/**
 * The first three points are kept sharp (they hold the wheel-arch lip). Everything from the
 * first side point upward is resampled through a centripetal spline, which is what turns a
 * faceted polygon into a properly rounded shoulder.
 */
function half(s: St): [number, number][] {
  const raw = halfRaw(s);
  const head = raw.slice(0, 3);
  const ctrl = raw.slice(3).map(([x, y]) => new THREE.Vector3(x, y, 0));
  const curve = new THREE.CatmullRomCurve3(ctrl, false, "centripetal");
  const out = head.slice();
  for (let j = 0; j < U_SMOOTH; j++) {
    const p = curve.getPoint(j / (U_SMOOTH - 1));
    out.push([p.x, p.y]);
  }
  return out;
}

type Mode = "full" | "glass" | "roof" | "body";
function ring(s: St, mode: Mode): [number, number][] {
  const h = half(s);
  if (mode === "full") {
    const out = h.slice();
    for (let i = h.length - 2; i >= 1; i--) out.push([-h[i][0], h[i][1]]);
    return out;
  }
  if (mode === "body") {
    // lower body only, open above the beltline so the glass can sit on top and the cabin is visible
    const r = h.slice(0, GLASS_I + 1);
    const out: [number, number][] = [];
    for (let i = r.length - 1; i >= 1; i--) out.push([-r[i][0], r[i][1]]);
    for (let i = 0; i < r.length; i++) out.push(r[i]);
    return out;
  }
  const r = mode === "glass" ? h.slice(GLASS_I) : h.slice(ROOF_I);
  const out = r.slice();
  for (let i = r.length - 2; i >= 0; i--) out.push([-r[i][0], r[i][1]]);
  return out;
}

function loft(z0: number, z1: number, mode: Mode, cap = false, step = 0.06) {
  // uniform stations plus extra ones hugging each arch edge, so the cut-outs stay crisp
  const steps = Math.max(2, Math.ceil((z1 - z0) / step) + 1);
  const zset = new Set<number>();
  for (let i = 0; i < steps; i++) zset.add(z0 + ((z1 - z0) * i) / (steps - 1));
  for (const zw of WHEEL_Z) {
    for (const d of [-ARCH_R - 0.004, -ARCH_R + 0.002, -ARCH_R * 0.7, 0, ARCH_R * 0.7, ARCH_R - 0.002, ARCH_R + 0.004]) {
      const z = zw + d;
      if (z > z0 && z < z1) zset.add(z);
    }
  }
  const zs = [...zset].sort((a, b) => a - b);
  const n = zs.length;
  const rings: [number, number, number][][] = [];
  for (const z of zs) rings.push(ring(stAt(z), mode).map(([x, y]) => [x, y, z] as [number, number, number]));
  const m = rings[0].length;
  const closed = mode === "full";
  const pos: number[] = [];
  rings.forEach((r) => r.forEach((p) => pos.push(p[0], p[1], p[2])));
  const idx: number[] = [];
  const segs = closed ? m : m - 1;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * m + j;
      const b = i * m + ((j + 1) % m);
      const c = (i + 1) * m + j;
      const d = (i + 1) * m + ((j + 1) % m);
      idx.push(a, c, b, b, c, d);
    }
  }
  if (cap && closed) {
    for (const end of [0, n - 1]) {
      let cx = 0;
      let cy = 0;
      const z = rings[end][0][2];
      rings[end].forEach((p) => {
        cx += p[0];
        cy += p[1];
      });
      cx /= m;
      cy /= m;
      const ci = pos.length / 3;
      pos.push(cx, cy, z);
      for (let j = 0; j < m; j++) idx.push(ci, end * m + j, end * m + ((j + 1) % m));
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  return toCreasedNormals(g, 0.75);
}

/** y of the upper body surface at (z, |x|) — used to seat lights and vents */
function surfY(z: number, x: number) {
  const h = half(stAt(z));
  const ax = Math.abs(x);
  for (let k = SURF_I; k < h.length - 1; k++) {
    const [x0, y0] = h[k];
    const [x1, y1] = h[k + 1];
    if (ax <= x0 && ax >= x1) return y0 + (y1 - y0) * ((x0 - ax) / (x0 - x1 || 1));
  }
  return h[h.length - 1][1];
}
const slopeAt = (z: number, x: number) => (surfY(z + 0.05, x) - surfY(z - 0.05, x)) / 0.1;

/* ================================================================== *
 *  keyframed rigid poses
 * ================================================================== */
type V3 = [number, number, number];
type KeyDef = { t: number; p: V3; e?: V3; s?: number; back?: boolean };
type Key = { t: number; p: THREE.Vector3; q: THREE.Quaternion; s: number; back?: boolean };
type Part = { o: THREE.Object3D; keys: Key[] };

const mk = (k: KeyDef): Key => ({
  t: k.t,
  p: new THREE.Vector3(...k.p),
  q: new THREE.Quaternion().setFromEuler(new THREE.Euler(...(k.e ?? [0, 0, 0]))),
  s: k.s ?? 1,
  back: k.back,
});

function evalPart(part: Part, prog: number) {
  const ks = part.keys;
  let a = ks[0];
  let b = ks[0];
  if (prog >= ks[ks.length - 1].t) {
    a = b = ks[ks.length - 1];
  } else if (prog > ks[0].t) {
    for (let i = 0; i < ks.length - 1; i++) {
      if (prog >= ks[i].t && prog <= ks[i + 1].t) {
        a = ks[i];
        b = ks[i + 1];
        break;
      }
    }
  }
  const raw = a === b ? 0 : clamp((prog - a.t) / (b.t - a.t));
  const u = a === b ? 0 : b.back ? backOut(raw) : smooth(raw);
  part.o.position.lerpVectors(a.p, b.p, u);
  part.o.quaternion.slerpQuaternions(a.q, b.q, u);
  part.o.scale.setScalar(mix(a.s, b.s, u));
}

const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const PI = Math.PI;

/* moments where a joint seats: sparks + steam + a small camera kick (machine-local coords) */
type Lock = { p: number; x: number; y: number; z: number; mirror: boolean; kick: number; power?: boolean };
const LOCKS: Lock[] = [
  { p: 0.11, x: 1.05, y: 0.85, z: 0.35, mirror: true, kick: 0.25 }, // doors swing up
  { p: 0.28, x: 1.3, y: 0.6, z: 1.35, mirror: true, kick: 0.3 }, // front wheels release
  { p: 0.3, x: 1.3, y: 0.6, z: -1.35, mirror: true, kick: 0.3 }, // rear wheels release
  { p: 0.48, x: 0, y: 3.0, z: 0.4, mirror: false, kick: 0.45 }, // chassis splits
  { p: 0.62, x: 0, y: 4.9, z: 1.2, mirror: false, kick: 0.5 }, // chest plate seats
  { p: 0.66, x: 1.86, y: 5.2, z: 0.1, mirror: true, kick: 0.4 }, // shoulders
  { p: 0.7, x: 0.8, y: 1.5, z: 0.55, mirror: true, kick: 0.4 }, // knees
  { p: 0.76, x: 0.6, y: 0.2, z: 0.35, mirror: true, kick: 0.5 }, // feet plant
  { p: 0.94, x: 0, y: 6.0, z: 0.1, mirror: false, kick: 0.6, power: true }, // head online
];

/* camera stations: azimuth, radius, height, look-at height — Catmull-Rom between them */
type Cam = { p: number; a: number; r: number; h: number; ly: number };
const CAMS: Cam[] = [
  { p: 0, a: 0.82, r: 8.6, h: 1.3, ly: 0.55 },
  { p: 0.12, a: 1.4, r: 8.4, h: 1.6, ly: 0.75 },
  { p: 0.3, a: 0.35, r: 8.2, h: 2.1, ly: 1.5 },
  { p: 0.5, a: -0.6, r: 10.2, h: 3.2, ly: 2.6 },
  { p: 0.72, a: -0.2, r: 12.6, h: 3.6, ly: 3.0 },
  { p: 0.9, a: 0.05, r: 14.2, h: 3.0, ly: 3.2 },
  { p: 1, a: 0.12, r: 14.8, h: 2.5, ly: 3.4 },
];
function camAt(p: number) {
  let i = 0;
  while (i < CAMS.length - 2 && p > CAMS[i + 1].p) i++;
  const c1 = CAMS[i];
  const c2 = CAMS[i + 1];
  const c0 = CAMS[Math.max(0, i - 1)];
  const c3 = CAMS[Math.min(CAMS.length - 1, i + 2)];
  const u = clamp((p - c1.p) / (c2.p - c1.p));
  const f = (k: "a" | "r" | "h" | "ly") => cr(c0[k], c1[k], c2[k], c3[k], u);
  return { a: f("a"), r: Math.max(6, f("r")), h: f("h"), ly: f("ly") };
}

const STEPS = ["VEHICLE", "DOORS OPEN", "WHEELS OUT", "CHASSIS SPLIT", "LIMBS LOCK", "HEAD ONLINE", "MECH ONLINE"];
const STEP_AT = [0, 0.06, 0.2, 0.42, 0.6, 0.86, 0.95];

/* ================================================================== *
 *  small hud row
 * ================================================================== */
function HudRow({ k, vRef, initial }: { k: string; vRef?: React.RefObject<HTMLSpanElement | null>; initial: string }) {
  return (
    <div className="flex justify-between gap-8 border-t border-white/15 py-1.5 first:border-t-0">
      <dt className="text-white/45">{k}</dt>
      <dd ref={vRef} className="font-bold tabular-nums text-acc">
        {initial}
      </dd>
    </div>
  );
}

export default function Reach() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const systemsRef = useRef<HTMLSpanElement>(null);
  const panelsRef = useRef<HTMLSpanElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------- renderer / scene ---------------- */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0908);
    scene.fog = new THREE.Fog(0x0a0908, 16, 46);

    // Custom HDR studio: softbox overhead, long side strips and a warm back strip.
    // These are what paint the crisp light-lines across the clearcoat.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const studio = new THREE.Scene();
    const hdr = (v: number, r = 1, g = 1, b = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(r * v, g * v, b * v), side: THREE.DoubleSide });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(30, 32, 16), hdr(0.045, 1, 0.95, 0.9));
    dome.material.side = THREE.BackSide;
    studio.add(dome);
    // four overhead bars: the classic striped reflection that runs down a real car's hood and roof
    for (const z of [-3.2, -1.1, 1.1, 3.2]) {
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.0), hdr(7));
      bar.position.set(0, 12, z);
      bar.rotation.x = Math.PI / 2;
      studio.add(bar);
    }
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(9, 3), hdr(1.4));
    panel.position.set(0, 7, 14);
    panel.rotation.x = Math.PI;
    studio.add(panel);
    for (const sx of [-1, 1]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7, 18), hdr(3.2));
      strip.position.set(12 * sx, 4, 0);
      studio.add(strip);
      const low = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 16), hdr(2.4));
      low.position.set(11 * sx, 0.6, 0);
      studio.add(low);
    }
    const warm = new THREE.Mesh(new THREE.BoxGeometry(18, 1.1, 0.5), hdr(3.4, 1, 0.45, 0.25));
    warm.position.set(0, 3, -13);
    studio.add(warm);
    const frontStrip = new THREE.Mesh(new THREE.BoxGeometry(12, 0.7, 0.5), hdr(2));
    frontStrip.position.set(0, 2, 13);
    studio.add(frontStrip);
    const studioFloor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), hdr(0.012));
    studioFloor.rotation.x = -Math.PI / 2;
    studioFloor.position.y = -0.5;
    studio.add(studioFloor);
    const envRT = pmrem.fromScene(studio, 0.03);
    studio.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      if (m.material) (m.material as THREE.Material).dispose();
    });
    scene.environment = envRT.texture;
    (scene as unknown as { environmentIntensity: number }).environmentIntensity = 1;

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 120);
    const lookAt = new THREE.Vector3();

    const key = new THREE.DirectionalLight(0xffe6d0, 3.2);
    key.position.set(7, 11, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -8;
    key.shadow.camera.right = 8;
    key.shadow.camera.top = 10;
    key.shadow.camera.bottom = -4;
    key.shadow.camera.far = 40;
    key.shadow.bias = -0.0004;
    key.shadow.normalBias = 0.03;
    scene.add(key);
    const rimLight = new THREE.PointLight(0xff6b00, 30, 26, 2);
    rimLight.position.set(-6, 3.5, -5);
    scene.add(rimLight);
    const kicker = new THREE.PointLight(0xffd9a0, 14, 20, 2);
    kicker.position.set(6, 1.8, 4);
    scene.add(kicker);

    /* ---------------- materials ---------------- */
    const paint = new THREE.MeshPhysicalMaterial({
      color: 0xff6b00,
      metalness: 0.62,
      roughness: 0.32,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.25,
      side: THREE.DoubleSide,
    });
    const roofPaint = paint.clone();
    roofPaint.polygonOffset = true;
    roofPaint.polygonOffsetFactor = -4;
    roofPaint.polygonOffsetUnits = -4;
    const carbon = new THREE.MeshStandardMaterial({ color: 0x0e0e0e, metalness: 0.55, roughness: 0.4, side: THREE.DoubleSide });
    const steel = new THREE.MeshStandardMaterial({ color: 0xa8a39a, metalness: 1, roughness: 0.22 });
    const darkSteel = new THREE.MeshStandardMaterial({ color: 0x2a2826, metalness: 0.92, roughness: 0.36 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, metalness: 0, roughness: 0.86 });
    // tinted privacy glass — dark enough to reflect the studio, clear enough to see the cabin behind it
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x0b1315,
      metalness: 0,
      roughness: 0.02,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
      envMapIntensity: 2.4,
      clearcoat: 1,
      clearcoatRoughness: 0,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const black = new THREE.MeshStandardMaterial({ color: 0x030303, metalness: 0.2, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
    // lamp internals read as plastic now — no self-emission, so the studio lights do all the work
    const lightWhite = new THREE.MeshStandardMaterial({ color: 0xd8d4cb, metalness: 0.1, roughness: 0.35 });
    const lightRed = new THREE.MeshStandardMaterial({ color: 0x7c1710, metalness: 0.1, roughness: 0.4 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffd27a, emissiveIntensity: 5, roughness: 0.3 });
    const caliper = new THREE.MeshStandardMaterial({ color: 0xc21b12, metalness: 0.4, roughness: 0.4 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x2f2f31, metalness: 1, roughness: 0.3 });
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x1c1b1a, metalness: 0.9, roughness: 0.4, side: THREE.DoubleSide });
    const linerMat = new THREE.MeshStandardMaterial({ color: 0x050505, metalness: 0, roughness: 0.95, side: THREE.DoubleSide });

    // interior
    const leather = new THREE.MeshStandardMaterial({ color: 0x1a130f, metalness: 0, roughness: 0.52 });
    const alcantara = new THREE.MeshStandardMaterial({ color: 0x0b0a09, metalness: 0, roughness: 0.94 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x050505, emissive: 0xffb347, emissiveIntensity: 1.6, roughness: 0.3 });
    const stitch = new THREE.MeshStandardMaterial({ color: 0xff6b00, roughness: 0.6 });

    // clear polycarbonate lenses that sit over the lamp internals
    const lensMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.02,
      transparent: true,
      opacity: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0,
      envMapIntensity: 2.6,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -6,
      polygonOffsetUnits: -6,
    });
    const lensRed = lensMat.clone();
    lensRed.color = new THREE.Color(0xff2a1a);
    lensRed.opacity = 0.3;

    // drilled, vented brake disc: a circular texture drawn onto the cylinder cap
    const discTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d")!;
      g.fillStyle = "#57534e";
      g.fillRect(0, 0, 256, 256);
      g.beginPath();
      g.arc(128, 128, 122, 0, Math.PI * 2);
      g.arc(128, 128, 62, 0, Math.PI * 2, true);
      g.fillStyle = "#8c8780";
      g.fill();
      g.fillStyle = "#0a0a0a";
      for (let i = 0; i < 30; i++) {
        const a = (i / 30) * Math.PI * 2;
        for (const r of [92, 108]) {
          g.beginPath();
          g.arc(128 + Math.cos(a + (r > 100 ? 0.1 : 0)) * r, 128 + Math.sin(a + (r > 100 ? 0.1 : 0)) * r, 4.2, 0, Math.PI * 2);
          g.fill();
        }
      }
      g.beginPath();
      g.arc(128, 128, 46, 0, Math.PI * 2);
      g.fillStyle = "#1c1b1a";
      g.fill();
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })();
    const discMat = new THREE.MeshStandardMaterial({ map: discTex, metalness: 0.95, roughness: 0.38 });

    // tyre tread + sidewall relief, used as a bump map (u runs around the tyre, v across it)
    const tireBump = (() => {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 256;
      const g = c.getContext("2d")!;
      g.fillStyle = "#808080";
      g.fillRect(0, 0, 128, 256);
      g.fillStyle = "#151515";
      for (const y of [92, 128, 164]) g.fillRect(0, y - 4, 128, 8);
      g.strokeStyle = "#1a1a1a";
      g.lineWidth = 5;
      for (let i = -2; i < 6; i++) {
        g.beginPath();
        g.moveTo(i * 32, 70);
        g.lineTo(i * 32 + 26, 100);
        g.moveTo(i * 32, 186);
        g.lineTo(i * 32 + 26, 156);
        g.stroke();
      }
      g.fillStyle = "#e8e8e8";
      g.fillRect(0, 26, 128, 3);
      g.fillRect(0, 227, 128, 3);
      for (let i = 0; i < 6; i++) g.fillRect(6 + i * 20, 10, 11, 9);
      for (let i = 0; i < 5; i++) g.fillRect(14 + i * 22, 236, 13, 9);
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(30, 1);
      return tex;
    })();
    rubber.bumpMap = tireBump;
    rubber.bumpScale = 2.2;
    rubber.color.set(0x121212);
    rubber.roughness = 0.9;

    // hexagonal mesh for intakes and grilles
    const meshTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const g = c.getContext("2d")!;
      g.fillStyle = "#050505";
      g.fillRect(0, 0, 128, 128);
      g.strokeStyle = "#3a3a3a";
      g.lineWidth = 3;
      const r = 10;
      const hh = Math.sqrt(3) * r;
      for (let row = -1; row < 128 / hh + 1; row++) {
        for (let col = -1; col < 128 / (r * 1.5) + 1; col++) {
          const cx = col * r * 1.5;
          const cy = row * hh + (col % 2 ? hh / 2 : 0);
          g.beginPath();
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2;
            g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
          }
          g.closePath();
          g.stroke();
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(5, 2);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })();
    const grille = new THREE.MeshStandardMaterial({ map: meshTex, metalness: 0.5, roughness: 0.55, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });

    /* ---------------- tiny builders ---------------- */
    const box = (w: number, h: number, d: number, m: THREE.Material) => {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };
    const cyl = (rt: number, rb: number, h: number, m: THREE.Material, seg = 24) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
      mesh.castShadow = true;
      return mesh;
    };
    const makeGroup = (c: THREE.Vector3) => {
      const g = new THREE.Group();
      g.userData.c = c;
      return g;
    };
    const put = (g: THREE.Group, o: THREE.Object3D, x: number, y: number, z: number) => {
      const c = g.userData.c as THREE.Vector3;
      o.position.set(x - c.x, y - c.y, z - c.z);
      g.add(o);
      return o;
    };
    const shell = (g: THREE.Group, geo: THREE.BufferGeometry, m: THREE.Material) => {
      const c = g.userData.c as THREE.Vector3;
      geo.translate(-c.x, -c.y, -c.z);
      const mesh = new THREE.Mesh(geo, m);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
      return mesh;
    };

    const rbox = (w: number, h: number, d: number, m: THREE.Material, r = 0.035) => {
      const rad = Math.max(0.004, Math.min(r, Math.min(w, h, d) / 2 - 0.002));
      const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, rad), m);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    // thin dark shut-line wrapped around the body at a panel joint
    const seamMat = new THREE.LineBasicMaterial({ color: 0x050505, transparent: true, opacity: 0.9 });
    const seam = (g: THREE.Group, z: number) => {
      const c = g.userData.c as THREE.Vector3;
      const pts = ring(stAt(z), "full").map(([x, y]) => new THREE.Vector3(x * 1.004 - c.x, 0.5 + (y - 0.5) * 1.004 - c.y, z - c.z));
      const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), seamMat);
      g.add(line);
    };

    // a dark wall that sits just inside a sealed shell end, so the painted cap never shows through glass
    const bulkMat = new THREE.MeshStandardMaterial({ color: 0x0a0908, roughness: 0.95, side: THREE.DoubleSide });
    const bulkhead = (g: THREE.Group, z: number) => {
      const c = g.userData.c as THREE.Vector3;
      const pts = ring(stAt(z), "full").map(([x, y]) => new THREE.Vector2(x * 0.985, 0.5 + (y - 0.5) * 0.985));
      const geo = new THREE.ShapeGeometry(new THREE.Shape(pts));
      geo.translate(-c.x, -c.y, 0);
      const mesh = new THREE.Mesh(geo, bulkMat);
      mesh.position.z = z - c.z;
      g.add(mesh);
    };

    // inner wheel-well liner: an open half-cylinder that fills the arch cut-out
    const linerGeo = () => {
      const g = new THREE.CylinderGeometry(ARCH_R - 0.006, ARCH_R - 0.006, 0.36, 40, 1, true, -0.25, PI + 0.5);
      g.rotateZ(PI / 2);
      return g;
    };

    const yLight = (m: THREE.Material, len = 0.3) => {
      const g = new THREE.Group();
      const stem = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.012, len * 0.6), m);
      stem.position.z = -len * 0.3;
      g.add(stem);
      for (const a of [-0.5, 0.5]) {
        const L = len * 0.62;
        const arm = new THREE.Mesh(new THREE.BoxGeometry(0.026, 0.012, L), m);
        arm.position.set((Math.sin(a) * L) / 2, 0, (Math.cos(a) * L) / 2);
        arm.rotation.y = a;
        g.add(arm);
      }
      return g;
    };

    /* ---------------- machine + rigid parts ---------------- */
    const machine = new THREE.Group();
    scene.add(machine);
    const parts: Part[] = [];
    const reg = (o: THREE.Object3D, keys: KeyDef[]) => {
      machine.add(o);
      const part: Part = { o, keys: keys.map(mk) };
      parts.push(part);
      evalPart(part, 0);
      return part;
    };

    /* ===== wheel ===== */
    const spinners: THREE.Group[] = [];
    const makeWheel = (width: number) => {
      const g = new THREE.Group();
      const spin = new THREE.Group();
      const hw = width / 2;
      const prof = [
        [0.235, -hw * 0.96],
        [0.3, -hw],
        [0.345, -hw * 0.86],
        [0.362, -hw * 0.55],
        [0.366, 0],
        [0.362, hw * 0.55],
        [0.345, hw * 0.86],
        [0.3, hw],
        [0.235, hw * 0.96],
      ].map(([r, y]) => new THREE.Vector2(r, y));
      const tireGeo = new THREE.LatheGeometry(prof, 44);
      tireGeo.rotateZ(PI / 2);
      const tire = new THREE.Mesh(tireGeo, rubber);
      tire.castShadow = true;
      spin.add(tire);
      // open rim barrel (double-sided) so the brake disc and caliper are visible between the spokes
      const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, width * 0.86, 44, 1, true), barrelMat);
      barrel.rotation.z = PI / 2;
      spin.add(barrel);
      // polished outer lip
      const lip = new THREE.Mesh(new THREE.TorusGeometry(0.243, 0.011, 8, 56), steel);
      lip.rotation.y = PI / 2;
      lip.position.x = hw * 0.8;
      spin.add(lip);
      // five Y-spokes: each pair converges on the hub
      for (let i = 0; i < 5; i++) {
        for (const off of [-0.17, 0.17]) {
          const a = (i / 5) * PI * 2 + off;
          const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.19, 0.03), rimMat);
          spoke.position.set(hw * 0.7, Math.cos(a) * 0.14, Math.sin(a) * 0.14);
          spoke.rotation.x = a - off * 0.9;
          spoke.castShadow = true;
          spin.add(spoke);
        }
      }
      const cap = cyl(0.06, 0.07, 0.05, rimMat, 20);
      cap.rotation.z = PI / 2;
      cap.position.x = hw * 0.72;
      spin.add(cap);
      const hub = cyl(0.035, 0.035, 0.07, steel, 6);
      hub.rotation.z = PI / 2;
      hub.position.x = hw * 0.8;
      spin.add(hub);
      // five lug bolts around the centre cap
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * PI * 2 + 0.3;
        const bolt = cyl(0.011, 0.011, 0.03, steel, 6);
        bolt.rotation.z = PI / 2;
        bolt.position.set(hw * 0.76, Math.cos(a) * 0.045, Math.sin(a) * 0.045);
        spin.add(bolt);
      }
      g.add(spin);
      spinners.push(spin);
      // big drilled disc sits behind the spokes and turns with the wheel
      const disc = cyl(0.218, 0.218, 0.032, discMat, 48);
      disc.rotation.z = PI / 2;
      disc.position.x = hw * 0.12;
      spin.add(disc);
      const cal = rbox(0.1, 0.14, 0.2, caliper, 0.02);
      cal.position.set(hw * 0.12, 0.17, 0.02);
      g.add(cal);
      const brembo = box(0.104, 0.03, 0.12, black);
      brembo.position.set(hw * 0.12, 0.17, 0.02);
      g.add(brembo);
      return g;
    };

    /* ===== body shells ===== */
    const cHood = new THREE.Vector3(0, 0.6, 1.075);
    const cCabin = new THREE.Vector3(0, 0.6, -0.175);
    const cNose = new THREE.Vector3(0, 0.6, 2.0);
    const cRear = new THREE.Vector3(0, 0.6, -1.65);

    // NOSE — splitter, Y headlights, intakes
    const nose = makeGroup(cNose);
    shell(nose, loft(1.6, 2.4, "full", true), paint);
    seam(nose, 1.6);
    put(nose, box(1.5, 0.03, 0.55, carbon), 0, 0.135, 2.28);
    put(nose, box(0.5, 0.11, 0.04, grille), 0, 0.29, 2.405);
    for (const sx of [-1, 1]) {
      const lz = 1.86;
      const ly = surfY(lz, 0.62) + 0.006;
      const tilt = -Math.atan(slopeAt(lz, 0.62));
      // recessed black housing under the Y-shaped lamp
      const housing = box(0.46, 0.006, 0.36, black);
      housing.position.set(0.6 * sx - cNose.x, ly - 0.004 - cNose.y, lz - cNose.z);
      housing.rotation.x = tilt;
      nose.add(housing);
      const y = yLight(lightWhite, 0.36);
      y.position.set(0.62 * sx - cNose.x, ly - cNose.y, lz - cNose.z);
      y.rotation.x = tilt;
      y.scale.x = sx;
      nose.add(y);
      // lamp internals + clear outer lens, in the tilted plane of the housing
      const lamp = new THREE.Group();
      lamp.position.set(0.6 * sx - cNose.x, ly - cNose.y, lz - cNose.z);
      lamp.rotation.x = tilt;
      const outer = rbox(0.5, 0.03, 0.4, lensMat, 0.012);
      outer.position.y = 0.024;
      outer.castShadow = false;
      lamp.add(outer);
      for (const [px, pz, pr] of [
        [-0.12 * sx, 0.06, 0.04],
        [0.06 * sx, 0.1, 0.028],
      ] as [number, number, number][]) {
        const proj = cyl(pr, pr, 0.022, lightWhite, 24);
        proj.position.set(px, 0.009, pz);
        lamp.add(proj);
        const bezel = new THREE.Mesh(new THREE.TorusGeometry(pr * 1.18, pr * 0.16, 8, 28), steel);
        bezel.rotation.x = PI / 2;
        bezel.position.set(px, 0.016, pz);
        lamp.add(bezel);
      }
      nose.add(lamp);
      // corner intakes and canards
      put(nose, box(0.3, 0.12, 0.05, grille), 0.44 * sx, 0.27, 2.395);
      const canard = box(0.26, 0.012, 0.12, carbon);
      canard.rotation.z = -0.3 * sx;
      put(nose, canard, 0.74 * sx, 0.26, 2.15);
    }
    reg(nose, [
      { t: 0, p: [0, 0.6, 2.0] },
      { t: 0.24, p: [0, 1.4, 2.6], e: [-0.25, 0, 0] },
      { t: 0.6, p: [0, 3.75, 0.95], e: [PI / 2, 0, 0], back: true },
    ]);

    // HOOD — vents, front arches, windscreen
    const hood = makeGroup(cHood);
    shell(hood, loft(0.93, 1.6, "full", true), paint);
    shell(hood, loft(0.55, 0.93, "body"), paint);
    shell(hood, loft(0.55, 0.93, "glass"), glass);
    bulkhead(hood, 0.925);
    seam(hood, 0.55);
    for (const sx of [-1, 1]) {
      const y = surfY(1.15, 0.3 * sx) + 0.005;
      const v = box(0.26, 0.012, 0.34, black);
      v.position.set(0.3 * sx - cHood.x, y - cHood.y, 1.15 - cHood.z);
      v.rotation.x = -Math.atan(slopeAt(1.15, 0.3 * sx));
      hood.add(v);
      put(hood, new THREE.Mesh(linerGeo(), linerMat), 0.88 * sx, WHEEL_Y, 1.35);
    }
    reg(hood, [
      { t: 0, p: [0, 0.6, 1.075] },
      { t: 0.22, p: [0, 1.5, 1.6], e: [-0.3, 0, 0] },
      { t: 0.62, p: [0, 4.95, 0.85], e: [PI / 2, 0, 0], back: true },
    ]);

    // CABIN — glass, painted roof, side intakes
    const cabin = makeGroup(cCabin);
    shell(cabin, loft(-0.9, 0.55, "body"), paint);
    shell(cabin, loft(-0.95, 0.56, "glass"), glass);
    shell(cabin, loft(-0.85, 0.3, "roof"), roofPaint);
    bulkhead(cabin, -0.893);
    for (const sx of [-1, 1]) {
      const intake = box(0.03, 0.2, 0.4, grille);
      put(cabin, intake, 1.005 * sx, 0.5, -0.72);
    }

    // ---- interior: what you see through the glass ----
    put(cabin, box(1.55, 0.02, 1.35, alcantara), 0, 0.17, -0.2); // floor
    for (const sx of [-1, 1]) {
      const cx = 0.42 * sx;
      put(cabin, rbox(0.48, 0.13, 0.58, leather, 0.05), cx, 0.32, -0.22); // seat base
      const back = rbox(0.48, 0.66, 0.13, leather, 0.06);
      back.rotation.x = -0.24;
      put(cabin, back, cx, 0.66, -0.55); // seat back
      put(cabin, box(0.05, 0.52, 0.006, stitch), cx, 0.64, -0.485).rotation.x = -0.24; // stitch panel
      const head = rbox(0.28, 0.2, 0.1, leather, 0.05);
      head.rotation.x = -0.24;
      put(cabin, head, cx, 1.0, -0.62); // headrest
      for (const s2 of [-1, 1]) {
        const bol = rbox(0.08, 0.5, 0.15, leather, 0.04);
        bol.rotation.x = -0.24;
        bol.rotation.z = 0.12 * s2;
        put(cabin, bol, cx + 0.26 * s2, 0.64, -0.53); // side bolsters
      }
      put(cabin, rbox(0.06, 0.42, 1.25, alcantara, 0.03), 0.9 * sx, 0.46, -0.12); // door card
    }
    put(cabin, rbox(0.2, 0.15, 1.05, alcantara, 0.05), 0, 0.26, -0.1); // centre tunnel
    put(cabin, rbox(0.07, 0.07, 0.15, steel, 0.02), 0, 0.37, 0.04); // gear selector
    const dash = rbox(1.66, 0.13, 0.34, alcantara, 0.05);
    dash.rotation.x = 0.12;
    put(cabin, dash, 0, 0.62, 0.4); // dashboard
    put(cabin, rbox(0.36, 0.13, 0.13, alcantara, 0.04), 0.42, 0.72, 0.32); // instrument binnacle
    const cluster = box(0.3, 0.085, 0.008, screenMat);
    cluster.rotation.x = -0.55;
    put(cabin, cluster, 0.42, 0.71, 0.255);
    const centre = box(0.17, 0.12, 0.008, screenMat);
    centre.rotation.x = -0.3;
    put(cabin, centre, 0, 0.6, 0.23);
    const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.021, 10, 40), alcantara);
    wheelRim.rotation.x = 1.0;
    wheelRim.castShadow = true;
    put(cabin, wheelRim, 0.42, 0.72, 0.12); // steering wheel
    put(cabin, rbox(0.1, 0.05, 0.05, steel, 0.015), 0.42, 0.72, 0.12);
    for (const a of [0.6, PI - 0.6, PI / 2 + PI]) {
      const spoke = box(0.012, 0.012, 0.15, darkSteel);
      spoke.rotation.set(1.0, 0, 0);
      const sp = new THREE.Group();
      sp.rotation.z = a;
      sp.add(spoke);
      put(cabin, sp, 0.42, 0.72, 0.12);
    }
    reg(cabin, [
      { t: 0, p: [0, 0.6, -0.175] },
      { t: 0.2, p: [0, 1.3, -0.5], e: [0.15, 0, 0] },
      { t: 0.66, p: [0, 4.75, -1.0], e: [-PI / 2, 0, 0], back: true },
    ]);

    // REAR — engine cover louvres, hex tail lights, exhaust, diffuser, spoiler, rear arches
    const rear = makeGroup(cRear);
    shell(rear, loft(-2.4, -0.9, "full", true), paint);
    seam(rear, -0.9);
    for (let z = -1.3; z >= -2.1; z -= 0.16) {
      for (const sx of [-1, 1]) {
        const x = 0.4 * sx;
        const y = surfY(z, x) + 0.005;
        const s = box(0.5, 0.012, 0.055, black);
        s.position.set(x - cRear.x, y - cRear.y, z - cRear.z);
        s.rotation.x = -Math.atan(slopeAt(z, x));
        s.rotation.y = -0.4 * sx;
        rear.add(s);
      }
    }
    for (const sx of [-1, 1]) {
      // Y-shaped tail lamp on a black housing
      put(rear, box(0.44, 0.16, 0.012, black), 0.58 * sx, 0.62, -2.404);
      const tl = yLight(lightRed, 0.26);
      tl.rotation.set(PI / 2, 0, (sx * PI) / 2, "ZYX");
      put(rear, tl, 0.58 * sx, 0.62, -2.414);
      const tailLens = rbox(0.48, 0.19, 0.02, lensRed, 0.02);
      tailLens.castShadow = false;
      put(rear, tailLens, 0.58 * sx, 0.62, -2.428);
      put(rear, box(0.34, 0.13, 0.012, grille), 0.56 * sx, 0.4, -2.404);
      const ex = cyl(0.1, 0.1, 0.26, darkSteel, 6);
      ex.rotation.x = PI / 2;
      put(rear, ex, 0.2 * sx, 0.36, -2.48);
      const exIn = cyl(0.074, 0.074, 0.05, black, 6);
      exIn.rotation.x = PI / 2;
      put(rear, exIn, 0.2 * sx, 0.36, -2.6);
      put(rear, new THREE.Mesh(linerGeo(), linerMat), 0.88 * sx, WHEEL_Y, -1.35);
      const pylon = box(0.04, 0.2, 0.05, carbon);
      put(rear, pylon, 0.6 * sx, 0.9, -2.2);
    }
    put(rear, box(1.5, 0.014, 0.024, lightRed), 0, 0.74, -2.405);
    put(rear, box(1.7, 0.03, 0.3, carbon), 0, 1.0, -2.25).rotation.x = 0.1;
    for (let i = -3; i <= 3; i++) put(rear, box(0.02, 0.1, 0.34, carbon), i * 0.15, 0.2, -2.24);
    reg(rear, [
      { t: 0, p: [0, 0.6, -1.65] },
      { t: 0.28, p: [0, 1.5, -2.4], e: [0.25, 0, 0] },
      { t: 0.68, p: [0, 2.75, -0.75], e: [-PI / 2, 0, 0], back: true },
    ]);

    /* ===== scissor doors → forearm plates ===== */
    const doorGeo = (sign: 1 | -1) => {
      const s = new THREE.Shape();
      s.moveTo(-0.8, 0.25);
      s.lineTo(-0.66, 0.74);
      s.lineTo(0.4, 0.74);
      s.lineTo(0.54, 0.52);
      s.lineTo(0.54, 0.25);
      s.closePath();
      const g = new THREE.ExtrudeGeometry(s, { depth: 0.035, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2, curveSegments: 1 });
      g.rotateY(-PI / 2);
      g.translate(1.045, 0, 0);
      if (sign < 0) g.scale(-1, 1, 1);
      return g;
    };
    for (const sx of [-1, 1] as const) {
      const geo = doorGeo(sx);
      geo.computeBoundingBox();
      const c = new THREE.Vector3();
      geo.boundingBox!.getCenter(c);
      const g = makeGroup(c);
      shell(g, toCreasedNormals(geo, 0.6), paint);
      put(g, box(0.03, 0.03, 0.22, black), 1.07 * sx, 0.6, 0.02);
      const stalk = box(0.05, 0.03, 0.05, carbon);
      put(g, stalk, 1.08 * sx, 0.78, 0.4);
      put(g, box(0.04, 0.075, 0.17, paint), 1.12 * sx, 0.82, 0.36);
      const cp: V3 = [c.x, c.y, c.z];
      reg(g, [
        { t: 0, p: cp },
        { t: 0.1, p: add3(cp, [0.18 * sx, 0.49, 0.22]), e: [0.85, 0, 0] },
        { t: 0.3, p: add3(cp, [0.18 * sx, 0.49, 0.22]), e: [0.85, 0, 0] },
        { t: 0.58, p: [2.02 * sx, 3.2, 0.1], e: [PI / 2, 0, 0], back: true },
      ]);
    }

    /* ===== side skirts → thigh / shin trim ===== */
    for (const sx of [-1, 1]) {
      const zs: [number, number, number][] = [
        [0.55, 2.3, 0.0],
        [-0.55, 1.0, 0.0],
      ];
      zs.forEach(([z, my, mz], i) => {
        const s = box(0.06, 0.14, 0.95, carbon);
        const cp: V3 = [1.045 * sx, 0.19, z];
        reg(s, [
          { t: 0, p: cp },
          { t: 0.14, p: add3(cp, [0.22 * sx, 0.1, 0]) },
          { t: 0.56 + i * 0.02, p: [(i === 0 ? 0.92 : 0.98) * sx, my, mz], e: [PI / 2, 0, 0] },
        ]);
      });
    }

    /* ===== wheels → shoulders and knees ===== */
    for (const sx of [-1, 1]) {
      const fw = makeWheel(0.3);
      const fe: V3 = [0, sx < 0 ? PI : 0, 0];
      reg(fw, [
        { t: 0, p: [0.97 * sx, 0.365, 1.35], e: fe },
        { t: 0.16, p: [1.3 * sx, 0.6, 1.35], e: fe },
        { t: 0.66, p: [1.86 * sx, 5.2, 0.1], e: fe, back: true },
      ]);
      const rw = makeWheel(0.36);
      reg(rw, [
        { t: 0, p: [0.96 * sx, 0.365, -1.35], e: fe },
        { t: 0.16, p: [1.3 * sx, 0.6, -1.35], e: fe },
        { t: 0.7, p: [0.8 * sx, 1.5, 0.55], e: [0, -PI / 2, 0], back: true },
      ]);
    }

    /* ===== robot skeleton — articulated armoured assemblies that unfold out of the hull ===== */
    const accentGlow = new THREE.MeshStandardMaterial({ color: 0xffe2a0, emissive: 0xffa333, emissiveIntensity: 0.4, roughness: 0.35 });
    const coreMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff8a3c, emissiveIntensity: 0.2, roughness: 0.3 });

    const mount = (g: THREE.Group, o: THREE.Object3D, x: number, y: number, z: number) => {
      o.position.set(x, y, z);
      g.add(o);
      return o;
    };
    const ball = (r: number, m: THREE.Material) => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), m);
      s.castShadow = true;
      return s;
    };
    // a hinge drum lying along X, with a darker capped axle through it
    const hinge = (g: THREE.Group, x: number, y: number, z: number, r: number, len: number) => {
      const j = cyl(r, r, len, steel, 28);
      j.rotation.z = PI / 2;
      mount(g, j, x, y, z);
      const cap = cyl(r * 0.55, r * 0.55, len * 1.06, darkSteel, 18);
      cap.rotation.z = PI / 2;
      mount(g, cap, x, y, z);
    };
    // vertical hydraulic ram: fat sleeve + polished rod
    const hydraulic = (g: THREE.Group, x: number, y: number, z: number, len: number) => {
      mount(g, cyl(0.075, 0.075, len * 0.55, darkSteel, 14), x, y - len * 0.22, z);
      mount(g, cyl(0.042, 0.042, len * 0.7, steel, 12), x, y + len * 0.16, z);
    };

    /* ---------- detail kit: rivets, seams, vents, cabling, decals, worn metal ---------- */
    const extraDispose: { dispose: () => void }[] = [];
    const boltMat = new THREE.MeshStandardMaterial({ color: 0x77726a, metalness: 1, roughness: 0.32 });
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, metalness: 0.25, roughness: 0.55 });

    // hazard-stripe label (amber / black diagonals), used as small warning plates
    const hazardTex = (() => {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 32;
      const g2 = c.getContext("2d")!;
      g2.fillStyle = "#e8b32a";
      g2.fillRect(0, 0, 128, 32);
      g2.fillStyle = "#0b0b0b";
      for (let x = -32; x < 160; x += 32) {
        g2.beginPath();
        g2.moveTo(x, 32);
        g2.lineTo(x + 16, 32);
        g2.lineTo(x + 32, 0);
        g2.lineTo(x + 16, 0);
        g2.closePath();
        g2.fill();
      }
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    })();
    const hazardMat = new THREE.MeshStandardMaterial({ map: hazardTex, roughness: 0.6, metalness: 0.2, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 });

    // scratched, pitted grime → bump map for the dark structural steel
    const grungeTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g2 = c.getContext("2d")!;
      g2.fillStyle = "#808080";
      g2.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2600; i++) {
        const v = 70 + Math.floor(Math.random() * 110);
        g2.fillStyle = `rgb(${v},${v},${v})`;
        g2.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2);
      }
      g2.lineWidth = 1;
      for (let i = 0; i < 70; i++) {
        const v = 150 + Math.floor(Math.random() * 90);
        g2.strokeStyle = `rgba(${v},${v},${v},0.55)`;
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const a = Math.random() * PI;
        const l = 8 + Math.random() * 40;
        g2.beginPath();
        g2.moveTo(x, y);
        g2.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l);
        g2.stroke();
      }
      for (let i = 0; i < 14; i++) {
        const x = Math.random() * 256;
        const grd = g2.createLinearGradient(0, 0, 0, 256);
        grd.addColorStop(0, "rgba(40,40,40,0)");
        grd.addColorStop(0.5, "rgba(40,40,40,0.35)");
        grd.addColorStop(1, "rgba(40,40,40,0)");
        g2.fillStyle = grd;
        g2.fillRect(x, 0, 2 + Math.random() * 4, 256);
      }
      const t = new THREE.CanvasTexture(c);
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    })();
    darkSteel.bumpMap = grungeTex;
    darkSteel.bumpScale = 1.4;
    extraDispose.push(boltMat, cableMat, hazardTex, hazardMat, grungeTex);

    // one InstancedMesh per limb for every rivet on it (axis: 0 = x, 1 = y, 2 = z)
    const rivetGeo = new THREE.CylinderGeometry(0.02, 0.026, 0.022, 8);
    const rivets = (g: THREE.Group) => {
      const items: { p: V3; ax: 0 | 1 | 2 }[] = [];
      const api = {
        add(x: number, y: number, z: number, ax: 0 | 1 | 2 = 2) {
          items.push({ p: [x, y, z], ax });
        },
        row(x: number, y: number, z: number, dx: number, dy: number, dz: number, n: number, ax: 0 | 1 | 2 = 2) {
          for (let i = 0; i < n; i++) items.push({ p: [x + dx * i, y + dy * i, z + dz * i], ax });
        },
        done() {
          if (!items.length) return;
          const im = new THREE.InstancedMesh(rivetGeo, boltMat, items.length);
          const m4 = new THREE.Matrix4();
          const q = new THREE.Quaternion();
          const e = new THREE.Euler();
          const v = new THREE.Vector3();
          const one = new THREE.Vector3(1, 1, 1);
          items.forEach((it, i) => {
            e.set(it.ax === 2 ? PI / 2 : 0, 0, it.ax === 0 ? PI / 2 : 0);
            q.setFromEuler(e);
            v.set(...it.p);
            m4.compose(v, q, one);
            im.setMatrixAt(i, m4);
          });
          im.castShadow = true;
          g.add(im);
        },
      };
      return api;
    };

    // slatted vent: n dark slats stacked downward from y. face "z" = on a front/back panel, "x" = on a side panel
    const vents = (g: THREE.Group, x: number, y: number, z: number, len: number, n: number, gap: number, face: "z" | "x" = "z") => {
      for (let i = 0; i < n; i++) {
        const s = face === "z" ? box(len, 0.022, 0.02, black) : box(0.02, 0.022, len, black);
        mount(g, s, x, y - i * gap, z);
      }
    };

    // flexible cable run along a spline
    const cable = (g: THREE.Group, pts: V3[], r = 0.022) => {
      const curve = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
      const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, r, 8, false), cableMat);
      m.castShadow = true;
      g.add(m);
    };

    // lettering decal painted onto a flat panel
    const decal = (g: THREE.Group, text: string, w: number, h: number, x: number, y: number, z: number, color = "#f3efe6") => {
      const c = document.createElement("canvas");
      c.width = 512;
      c.height = Math.max(48, Math.round((512 * h) / w));
      const c2 = c.getContext("2d")!;
      c2.fillStyle = color;
      c2.font = `800 ${Math.round(c.height * 0.82)}px "Barlow Condensed","Arial Narrow",sans-serif`;
      c2.textAlign = "center";
      c2.textBaseline = "middle";
      c2.fillText(text, c.width / 2, c.height / 2 + c.height * 0.04);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.55, metalness: 0.1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      m.position.set(x, y, z);
      g.add(m);
      extraDispose.push(tex, mat);
      return m;
    };

    // a warning label: hazard stripes on a small plane
    const hazard = (g: THREE.Group, w: number, h: number, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), hazardMat);
      m.position.set(x, y, z);
      g.add(m);
    };

    const makeTorso = () => {
      const g = new THREE.Group();
      const rv = rivets(g);
      g.add(rbox(1.5, 1.5, 1.0, darkSteel, 0.06));
      mount(g, cyl(0.3, 0.3, 0.3, steel, 24), 0, 0, 0).rotation.z = PI / 2;
      for (const sx of [-1, 1]) {
        mount(g, rbox(0.08, 1.1, 0.7, carbon), 0.77 * sx, -0.1, 0);
        // shoulder socket: flanged ring with a dark bore and eight bolts
        const flange = cyl(0.36, 0.36, 0.1, steel, 36);
        flange.rotation.z = PI / 2;
        mount(g, flange, 0.78 * sx, 0.37, 0);
        const bore = cyl(0.25, 0.25, 0.12, black, 28);
        bore.rotation.z = PI / 2;
        mount(g, bore, 0.8 * sx, 0.37, 0);
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * PI * 2;
          rv.add(0.84 * sx, 0.37 + Math.cos(a) * 0.31, Math.sin(a) * 0.31, 0);
        }
        // side louvres
        vents(g, 0.812 * sx, -0.35, 0.04, 0.4, 5, 0.085, "x");
      }
      // waist: accordion bellows between torso and pelvis, spine column and swivel ring
      mount(g, cyl(0.3, 0.3, 0.5, darkSteel, 24), 0, -1.05, 0);
      for (let i = 0; i < 6; i++) {
        const rr = 0.44 - Math.abs(i - 2.5) * 0.015;
        mount(g, cyl(rr, rr, 0.045, darkSteel, 32), 0, -0.93 - i * 0.065, 0);
      }
      mount(g, cyl(0.56, 0.56, 0.3, steel, 32), 0, -0.8, 0);
      rv.done();
      return g;
    };
    const makePelvis = () => {
      const g = new THREE.Group();
      const rv = rivets(g);
      g.add(rbox(1.3, 0.62, 0.92, darkSteel, 0.05));
      mount(g, rbox(1.36, 0.12, 0.98, carbon, 0.03), 0, 0.22, 0);
      rv.row(-0.6, 0.22, 0.5, 0.15, 0, 0, 9);
      mount(g, box(0.3, 0.08, 0.04, accentGlow), 0, 0.22, 0.52);
      // codpiece plate
      const cod = rbox(0.44, 0.36, 0.14, paint, 0.05);
      cod.rotation.x = -0.12;
      mount(g, cod, 0, -0.1, 0.5);
      mount(g, box(0.02, 0.3, 0.02, black), 0, -0.1, 0.578);
      for (const sx of [-1, 1]) {
        mount(g, ball(0.3, steel), 0.58 * sx, -0.3, 0);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 10, 36), darkSteel);
        ring.rotation.y = PI / 2;
        mount(g, ring, 0.62 * sx, -0.3, 0);
        // hip skirt armour, flared outward
        const skirt = rbox(0.12, 0.46, 0.72, paint, 0.04);
        skirt.rotation.z = 0.14 * sx;
        mount(g, skirt, 0.72 * sx, -0.02, 0);
        rv.row(0.79 * sx, 0.12, -0.25, 0, 0, 0.25, 3, 0);
      }
      rv.done();
      return g;
    };
    const makeThigh = (sx: number) => {
      const g = new THREE.Group();
      const rv = rivets(g);
      g.add(rbox(0.66, 1.25, 0.72, darkSteel));
      mount(g, rbox(0.52, 0.95, 0.08, paint, 0.03), 0, 0.05, 0.4);
      mount(g, rbox(0.1, 0.9, 0.05, carbon), 0, 0.05, 0.46);
      // panel seams and corner rivets on the front plate
      mount(g, box(0.52, 0.012, 0.012, black), 0, 0.3, 0.446);
      mount(g, box(0.52, 0.012, 0.012, black), 0, -0.12, 0.446);
      rv.row(-0.2, 0.45, 0.445, 0.4, 0, 0, 2);
      rv.row(-0.2, -0.33, 0.445, 0.4, 0, 0, 2);
      decal(g, sx > 0 ? "02" : "01", 0.16, 0.1, 0.16, 0.16, 0.446);
      hazard(g, 0.18, 0.05, -0.16, -0.22, 0.447);
      // sculpted knee guard
      const kg = rbox(0.5, 0.26, 0.2, paint, 0.06);
      kg.rotation.x = 0.28;
      mount(g, kg, 0, -0.56, 0.42);
      // outer-side vent stack
      vents(g, 0.336 * sx, 0.3, 0.05, 0.32, 4, 0.075, "x");
      hydraulic(g, -0.2, 0, -0.42, 1.0);
      hydraulic(g, 0.2, 0, -0.42, 1.0);
      cable(g, [[0, 0.55, -0.4], [0.3 * sx, 0.15, -0.52], [0.05 * sx, -0.3, -0.46], [0, -0.58, -0.3]]);
      hinge(g, 0, -0.66, 0, 0.27, 0.74);
      rv.done();
      return g;
    };
    const makeShin = (sx: number) => {
      const g = new THREE.Group();
      const rv = rivets(g);
      g.add(rbox(0.6, 1.05, 0.68, darkSteel));
      mount(g, rbox(0.5, 0.85, 0.14, paint, 0.04), 0, 0.1, -0.4);
      mount(g, rbox(0.44, 0.8, 0.06, carbon), 0, 0.05, 0.37);
      mount(g, box(0.04, 0.6, 0.02, accentGlow), 0, 0.02, 0.405);
      // chevrons on the front guard
      for (const y of [0.26, 0.14]) {
        for (const s of [-1, 1]) {
          const ch = box(0.2, 0.03, 0.02, stitch);
          ch.rotation.z = 0.55 * s;
          mount(g, ch, 0.1 * s, y, 0.41);
        }
      }
      // calf vents
      vents(g, 0, 0.42, -0.475, 0.34, 6, 0.09);
      // outer fin + ankle cuff
      mount(g, rbox(0.08, 0.62, 0.5, paint, 0.03), 0.34 * sx, 0.12, 0);
      mount(g, rbox(0.64, 0.1, 0.72, carbon, 0.03), 0, -0.4, 0);
      rv.row(-0.2, -0.4, 0.366, 0.4, 0, 0, 2);
      rv.row(-0.18, 0.46, 0.405, 0.36, 0, 0, 2);
      hinge(g, 0, -0.55, 0, 0.22, 0.66);
      rv.done();
      return g;
    };
    const makeFoot = () => {
      const g = new THREE.Group();
      const rv = rivets(g);
      g.add(rbox(0.72, 0.3, 1.25, darkSteel, 0.04));
      // split toe
      for (const s of [-1, 1]) {
        const toe = rbox(0.32, 0.2, 0.46, paint, 0.05);
        toe.rotation.x = -0.12;
        mount(g, toe, 0.18 * s, -0.02, 0.7);
      }
      mount(g, box(0.02, 0.22, 0.46, black), 0, -0.02, 0.7);
      mount(g, rbox(0.6, 0.36, 0.32, carbon), 0, 0.03, -0.6);
      mount(g, rbox(0.78, 0.07, 1.5, carbon, 0.03), 0, -0.17, 0.05);
      // ankle guard and heel spur
      mount(g, rbox(0.56, 0.12, 0.4, paint, 0.04), 0, 0.22, -0.3);
      const spur = rbox(0.3, 0.12, 0.24, steel, 0.03);
      spur.rotation.x = 0.4;
      mount(g, spur, 0, -0.04, -0.82);
      mount(g, box(0.5, 0.02, 0.04, accentGlow), 0, 0.16, 0.42);
      rv.row(-0.25, 0.155, 0.05, 0.25, 0, 0, 3, 1);
      rv.done();
      return g;
    };
    const makeUpperArm = (sx: number) => {
      const g = new THREE.Group();
      const rv = rivets(g);
      g.add(rbox(0.5, 1.0, 0.54, darkSteel));
      mount(g, rbox(0.42, 0.62, 0.1, paint, 0.035), 0, 0.12, 0.31);
      decal(g, sx > 0 ? "02" : "01", 0.16, 0.1, 0, 0.12, 0.363);
      rv.row(-0.15, 0.36, 0.362, 0.3, 0, 0, 2);
      rv.row(-0.15, -0.12, 0.362, 0.3, 0, 0, 2);
      mount(g, rbox(0.08, 0.8, 0.4, carbon), 0.29 * sx, 0.05, 0);
      mount(g, ball(0.28, steel), 0, 0.5, 0);
      const axle = cyl(0.2, 0.2, 1.0, darkSteel, 24);
      axle.rotation.z = PI / 2;
      mount(g, axle, -0.37 * sx, 0.52, 0);
      // domed pauldron with a carbon rim
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.44, 28, 14, 0, PI * 2, 0, PI * 0.55), paint);
      dome.scale.set(1, 0.8, 1.05);
      dome.castShadow = true;
      mount(g, dome, 0.06 * sx, 0.52, 0);
      mount(g, cyl(0.44, 0.44, 0.06, carbon, 36), 0.06 * sx, 0.47, 0);
      // elbow guard
      const eg = rbox(0.36, 0.2, 0.3, paint, 0.06);
      eg.rotation.x = 0.3;
      mount(g, eg, 0, -0.4, -0.3);
      hinge(g, 0, -0.52, 0, 0.24, 0.6);
      hydraulic(g, -0.2 * sx, 0, -0.32, 0.9);
      cable(g, [[0.12 * sx, 0.45, -0.3], [0.24 * sx, 0.05, -0.36], [0.1 * sx, -0.35, -0.34]]);
      rv.done();
      return g;
    };
    const makeForearm = (sx: number) => {
      const g = new THREE.Group();
      const rv = rivets(g);
      g.add(rbox(0.54, 1.25, 0.6, darkSteel));
      mount(g, rbox(0.1, 1.0, 0.5, carbon), -0.3 * sx, 0, 0);
      mount(g, rbox(0.46, 0.92, 0.1, paint, 0.04), 0, 0.1, 0.33);
      mount(g, box(0.04, 0.72, 0.02, accentGlow), 0, 0.1, 0.385);
      hazard(g, 0.2, 0.06, 0.12, -0.22, 0.387);
      rv.row(-0.17, 0.5, 0.385, 0.34, 0, 0, 2);
      rv.row(-0.17, -0.3, 0.385, 0.34, 0, 0, 2);
      // outer shield plate + vents
      mount(g, rbox(0.1, 0.9, 0.46, paint, 0.04), 0.31 * sx, 0.05, 0);
      vents(g, 0.366 * sx, 0.35, 0, 0.3, 4, 0.12, "x");
      hydraulic(g, -0.15, 0, -0.34, 1.0);
      hydraulic(g, 0.15, 0, -0.34, 1.0);
      mount(g, cyl(0.3, 0.3, 0.14, steel, 28), 0, -0.6, 0);
      mount(g, cyl(0.26, 0.26, 0.12, steel, 28), 0, 0.62, 0);
      rv.done();
      return g;
    };
    const makeHand = (sx: number) => {
      const g = new THREE.Group();
      g.add(rbox(0.44, 0.34, 0.46, darkSteel, 0.04));
      mount(g, rbox(0.4, 0.3, 0.08, paint, 0.03), 0, 0.02, -0.27);
      mount(g, rbox(0.4, 0.06, 0.4, carbon, 0.02), 0, -0.14, 0.03);
      for (let i = 0; i < 4; i++) {
        const z = -0.17 + i * 0.115;
        mount(g, rbox(0.085, 0.2, 0.1, steel, 0.025), 0, -0.27, z);
        mount(g, ball(0.05, darkSteel), 0, -0.375, z);
        const lo = rbox(0.075, 0.18, 0.09, darkSteel, 0.025);
        lo.rotation.x = -0.45;
        mount(g, lo, 0, -0.45, z + 0.04);
      }
      const thumb = rbox(0.09, 0.22, 0.1, steel, 0.025);
      thumb.rotation.z = 0.5 * sx;
      mount(g, thumb, -0.29 * sx, -0.05, 0.12);
      mount(g, ball(0.06, steel), -0.26 * sx, 0.02, 0.12);
      return g;
    };
    const makeStack = () => {
      const g = new THREE.Group();
      g.add(cyl(0.09, 0.09, 1.1, darkSteel, 18));
      mount(g, cyl(0.12, 0.12, 0.12, steel, 18), 0, -0.3, 0);
      for (let i = 0; i < 5; i++) mount(g, cyl(0.105, 0.105, 0.028, steel, 18), 0, -0.1 + i * 0.12, 0);
      mount(g, cyl(0.15, 0.1, 0.16, steel, 22), 0, 0.45, 0);
      mount(g, cyl(0.13, 0.13, 0.06, accentGlow, 18), 0, 0.56, 0);
      mount(g, cyl(0.1, 0.1, 0.02, black, 18), 0, 0.6, 0);
      mount(g, rbox(0.3, 0.12, 0.3, darkSteel, 0.03), 0, -0.52, 0);
      return g;
    };

    // each limb starts tiny inside the hull, lying flat, then swings out and snaps into place
    const limb = (g: THREE.Group, car: V3, carE: V3, mech: V3, mt: number, t0 = 0.3) => {
      reg(g, [
        { t: 0, p: car, e: carE, s: 0.26 },
        { t: t0, p: car, e: carE, s: 0.26 },
        { t: mt, p: mech, s: 1, back: true },
      ]);
    };
    const FLAT: V3 = [PI / 2, 0, 0];
    const NONE: V3 = [0, 0, 0];
    limb(makeTorso(), [0, 0.42, 0], NONE, [0, 4.6, -0.02], 0.58);
    limb(makePelvis(), [0, 0.4, -0.9], NONE, [0, 3.05, 0], 0.58);
    for (const sx of [-1, 1]) {
      limb(makeThigh(sx), [0.45 * sx, 0.4, -1.4], FLAT, [0.58 * sx, 2.25, 0.02], 0.62);
      limb(makeShin(sx), [0.45 * sx, 0.4, -1.0], FLAT, [0.6 * sx, 1.1, 0.05], 0.66);
      limb(makeFoot(), [0.4 * sx, 0.3, 0.7], NONE, [0.6 * sx, 0.21, 0.32], 0.7);
      limb(makeUpperArm(sx), [0.5 * sx, 0.45, 0.3], FLAT, [1.62 * sx, 4.45, 0], 0.62);
      limb(makeForearm(sx), [0.5 * sx, 0.45, -0.2], FLAT, [1.72 * sx, 3.2, 0.1], 0.66);
      limb(makeHand(sx), [0.5 * sx, 0.4, -0.6], NONE, [1.74 * sx, 2.25, 0.12], 0.7);
      limb(makeStack(), [0.42 * sx, 0.45, -1.9], FLAT, [0.55 * sx, 5.95, -1.15], 0.74);
    }

    // chest power core — sits on the chest plate, ignites as the robot comes online
    const coreG = new THREE.Group();
    const hexBase = cyl(0.2, 0.22, 0.06, darkSteel, 6);
    hexBase.rotation.x = PI / 2;
    coreG.add(hexBase);
    const coreGlow = cyl(0.12, 0.12, 0.08, coreMat, 28);
    coreGlow.rotation.x = PI / 2;
    mount(coreG, coreGlow, 0, 0, 0.03);
    mount(coreG, new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.012, 8, 36), steel), 0, 0, 0.05);
    // four armour wings crossing behind the core, and a bolt at each hex corner
    for (const sx of [-1, 1]) {
      for (const sy of [-1, 1]) {
        const wing = rbox(0.34, 0.05, 0.07, paint, 0.02);
        wing.rotation.z = 0.5 * sx * sy;
        mount(coreG, wing, 0.3 * sx, 0.14 * sy, 0);
      }
    }
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * PI * 2;
      const bo = cyl(0.018, 0.018, 0.04, boltMat, 8);
      bo.rotation.x = PI / 2;
      mount(coreG, bo, Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0.035);
    }
    reg(coreG, [
      { t: 0, p: [0, 0.45, 0.6], s: 0.01 },
      { t: 0.8, p: [0, 0.45, 0.6], s: 0.01 },
      { t: 0.94, p: [0, 4.85, 1.22], e: [-0.25, 0, 0], s: 1, back: true },
    ]);

    /* ===== head — nested in the body, rises last ===== */
    const head = new THREE.Group();
    head.add(rbox(0.7, 0.46, 0.6, darkSteel, 0.05));
    // brow ridge, angled like a visor hood
    const brow = rbox(0.76, 0.1, 0.34, paint, 0.03);
    brow.rotation.x = 0.28;
    mount(head, brow, 0, 0.22, 0.24);
    // faceplate with a slim glowing visor bar and mouth vents
    mount(head, rbox(0.52, 0.3, 0.1, steel, 0.04), 0, -0.1, 0.33);
    mount(head, box(0.56, 0.07, 0.045, eyeMat), 0, 0.07, 0.345);
    for (let i = 0; i < 3; i++) mount(head, box(0.3, 0.014, 0.02, black), 0, -0.14 - i * 0.045, 0.385);
    // swept crest from a side-profile polygon
    const crestShape = new THREE.Shape();
    crestShape.moveTo(-0.3, 0);
    crestShape.lineTo(0.3, 0);
    crestShape.lineTo(0.22, 0.14);
    crestShape.lineTo(-0.1, 0.27);
    crestShape.lineTo(-0.3, 0.1);
    crestShape.closePath();
    const crestGeo = new THREE.ExtrudeGeometry(crestShape, { depth: 0.09, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 });
    crestGeo.translate(0, 0, -0.045);
    crestGeo.rotateY(PI / 2);
    const crest = new THREE.Mesh(toCreasedNormals(crestGeo, 0.6), paint);
    crest.castShadow = true;
    mount(head, crest, 0, 0.23, -0.02);
    // ear vents and antenna
    for (const sx of [-1, 1]) {
      mount(head, rbox(0.1, 0.3, 0.3, paint, 0.03), 0.4 * sx, 0, -0.05);
      mount(head, box(0.02, 0.2, 0.18, black), 0.455 * sx, 0, -0.05);
    }
    mount(head, cyl(0.012, 0.012, 0.42, steel, 8), 0.44, 0.3, -0.12);
    mount(head, rbox(0.3, 0.1, 0.1, steel, 0.03), 0, -0.3, 0.24);
    // neck column
    mount(head, cyl(0.17, 0.2, 0.5, darkSteel, 20), 0, -0.45, -0.05);
    mount(head, cyl(0.22, 0.22, 0.08, steel, 20), 0, -0.26, -0.05);
    // cheek guards, swept horns, ear discs, a visor lens and cabling down the neck
    for (const sx of [-1, 1]) {
      const cheek = rbox(0.14, 0.2, 0.1, paint, 0.03);
      cheek.rotation.y = -0.35 * sx;
      mount(head, cheek, 0.29 * sx, -0.14, 0.32);
      const horn = rbox(0.05, 0.34, 0.08, paint, 0.02);
      horn.rotation.z = -0.28 * sx;
      mount(head, horn, 0.3 * sx, 0.4, -0.04);
      const disc = cyl(0.11, 0.11, 0.05, steel, 20);
      disc.rotation.z = PI / 2;
      mount(head, disc, 0.5 * sx, 0, -0.05);
      cable(head, [[0.1 * sx, -0.55, -0.12], [0.22 * sx, -0.75, -0.2], [0.2 * sx, -0.95, -0.12]], 0.022);
    }
    mount(head, box(0.6, 0.09, 0.02, lensMat), 0, 0.07, 0.375);
    const eyeLight = new THREE.PointLight(0xffd27a, 0, 7, 2);
    eyeLight.position.set(0, 0.05, 0.9);
    head.add(eyeLight);
    const headPart = reg(head, [
      { t: 0, p: [0, 0.7, -0.3], s: 0.01 },
      { t: 0.68, p: [0, 5.3, -0.05], s: 0.01 },
      { t: 0.94, p: [0, 6.2, 0.15], s: 1, back: true },
    ]);

    /* ---------------- showroom floor ---------------- */
    // true mirror floor: the car is re-rendered upside-down beneath the ground plane
    const reflector = new Reflector(new THREE.CircleGeometry(40, 64), { textureWidth: 768, textureHeight: 768, color: 0x8e8e8e, clipBias: 0.003 });
    reflector.rotation.x = -PI / 2;
    reflector.position.y = -0.008;
    scene.add(reflector);

    // frosted fade: strong reflection right under the car, dissolving into the dark studio with distance
    const frostTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      grd.addColorStop(0, "rgba(10,9,8,0.34)");
      grd.addColorStop(0.3, "rgba(10,9,8,0.6)");
      grd.addColorStop(0.65, "rgba(10,9,8,0.95)");
      grd.addColorStop(1, "rgba(10,9,8,1)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 256, 256);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    })();
    const frost = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), new THREE.MeshBasicMaterial({ map: frostTex, transparent: true, depthWrite: false }));
    frost.rotation.x = -PI / 2;
    frost.position.y = -0.004;
    scene.add(frost);

    // the shadow the car throws onto that floor
    const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(44, 44), new THREE.ShadowMaterial({ opacity: 0.55 }));
    shadowPlane.rotation.x = -PI / 2;
    shadowPlane.position.y = 0.001;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const grid = new THREE.GridHelper(60, 60, 0xff6b00, 0x241b16);
    grid.position.y = 0.002;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.16;
    scene.add(grid);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff6b00, transparent: true, opacity: 0.55 });
    const turntable = new THREE.Mesh(new THREE.RingGeometry(4.5, 4.56, 96), ringMat);
    turntable.rotation.x = -PI / 2;
    turntable.position.y = 0.006;
    scene.add(turntable);

    // anything sitting on the floor must not appear inside the reflection, or it would dim it twice
    const floorOverlays: THREE.Object3D[] = [frost, shadowPlane, grid, turntable];
    const reflectorBefore = reflector.onBeforeRender;
    reflector.onBeforeRender = function (this: THREE.Object3D, ...a: Parameters<typeof reflectorBefore>) {
      const was = floorOverlays.map((o) => o.visible);
      floorOverlays.forEach((o) => {
        o.visible = false;
      });
      reflectorBefore.apply(this, a);
      floorOverlays.forEach((o, i) => {
        o.visible = was[i];
      });
    };

    // soft contact shadow — grounds the car far better than shadow maps alone
    const shadowTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64);
      grd.addColorStop(0, "rgba(0,0,0,0.92)");
      grd.addColorStop(0.55, "rgba(0,0,0,0.55)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(c);
    })();
    const contactMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 5.8), contactMat);
    contact.rotation.x = -PI / 2;
    contact.position.y = 0.008;
    machine.add(contact);
    floorOverlays.push(contact);

    /* ---------------- sparks + dust ---------------- */
    // burst sparks: additive blending + a colour attribute that fades to black = free per-particle fade
    const MAXS = 720;
    const sPos = new Float32Array(MAXS * 3);
    const sVel = new Float32Array(MAXS * 3);
    const sCol = new Float32Array(MAXS * 3);
    const sLife = new Float32Array(MAXS);
    const sMax = new Float32Array(MAXS);
    let sHead = 0;
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
    sparkGeo.setAttribute("color", new THREE.BufferAttribute(sCol, 3));
    const sparkMat = new THREE.PointsMaterial({ size: 0.075, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    sparkPoints.frustumCulled = false;
    scene.add(sparkPoints);
    const emitSparks = (x: number, y: number, z: number, n: number, speed: number) => {
      for (let k = 0; k < n; k++) {
        const i = sHead;
        sHead = (sHead + 1) % MAXS;
        const a = Math.random() * PI * 2;
        const up = 0.25 + Math.random() * 0.9;
        const sp = speed * (0.35 + Math.random() * 0.85);
        sPos[i * 3] = x;
        sPos[i * 3 + 1] = y;
        sPos[i * 3 + 2] = z;
        sVel[i * 3] = Math.cos(a) * sp;
        sVel[i * 3 + 1] = up * sp;
        sVel[i * 3 + 2] = Math.sin(a) * sp;
        sMax[i] = 0.55 + Math.random() * 0.9;
        sLife[i] = sMax[i];
      }
    };

    // steam: a pool of soft sprites that drift up and swell
    const puffTex = (() => {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const g = c.getContext("2d")!;
      const grd = g.createRadialGradient(32, 32, 2, 32, 32, 32);
      grd.addColorStop(0, "rgba(255,255,255,0.9)");
      grd.addColorStop(0.5, "rgba(255,255,255,0.35)");
      grd.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grd;
      g.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    })();
    const puffs = Array.from({ length: 36 }, () => {
      const m = new THREE.SpriteMaterial({ map: puffTex, transparent: true, depthWrite: false, opacity: 0, color: 0xd9d3c8 });
      const s = new THREE.Sprite(m);
      s.visible = false;
      scene.add(s);
      return { s, m, life: 0, max: 1, vx: 0, vy: 0, vz: 0, size: 1 };
    });
    let puffHead = 0;
    const emitPuffs = (x: number, y: number, z: number, n: number) => {
      for (let k = 0; k < n; k++) {
        const p = puffs[puffHead];
        puffHead = (puffHead + 1) % puffs.length;
        p.s.position.set(x + (Math.random() - 0.5) * 0.3, y, z + (Math.random() - 0.5) * 0.3);
        p.vx = (Math.random() - 0.5) * 0.7;
        p.vy = 0.5 + Math.random() * 0.9;
        p.vz = (Math.random() - 0.5) * 0.7;
        p.max = 1.0 + Math.random() * 0.8;
        p.life = p.max;
        p.size = 0.5 + Math.random() * 0.5;
        p.s.visible = true;
      }
    };

    // power-up shockwave on the floor when the robot comes online
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0xff6b00, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const pulseRing = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 96), pulseMat);
    pulseRing.rotation.x = -PI / 2;
    pulseRing.position.y = 0.012;
    pulseRing.visible = false;
    scene.add(pulseRing);
    let pulseT = -1;
    const chestLight = new THREE.PointLight(0xff8a3c, 0, 9, 2);
    chestLight.position.set(0, 4.9, 2.3);
    machine.add(chestLight);
    const dustPos = new Float32Array(360 * 3);
    for (let i = 0; i < 360; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 30;
      dustPos[i * 3 + 1] = Math.random() * 10;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 24;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xb4a797, size: 0.022, transparent: true, opacity: 0.3, depthWrite: false });
    scene.add(new THREE.Points(dustGeo, dustMat));

    if (panelsRef.current) panelsRef.current.textContent = String(parts.length);

    /* ---------------- loop ---------------- */
    let w = 0;
    let h = 0;
    let progress = 0;
    let targetProgress = 0;
    let raf = 0;
    let visible = false;
    let yaw = 0;
    let userYaw = 0; // extra rotation added by dragging
    let userVel = 0; // spin inertia after release
    let userPitch = 0; // camera height offset from vertical drag
    let dragging = false;
    let lastDX = 0;
    let lastDY = 0;
    let shake = 0;
    let powerFlash = 0;
    let steamT = 0;
    let lastStep = -1;
    const tmpV = new THREE.Vector3();
    const qTmp = new THREE.Quaternion();
    const eTmp = new THREE.Euler();
    const pointer = { x: 0, y: 0 };

    // no post-processing: rendered straight to the canvas, so nothing glows
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    };
    const onScroll = () => {
      const r = section.getBoundingClientRect();
      targetProgress = clamp(-r.top / Math.max(1, r.height - window.innerHeight));
    };
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (dragging) {
        const dx = e.clientX - lastDX;
        const dy = e.clientY - lastDY;
        lastDX = e.clientX;
        lastDY = e.clientY;
        userYaw += dx * 0.0075;
        userVel = dx * 0.0032;
        userPitch = clamp(userPitch + dy * 0.006, -1.2, 1.6);
      }
    };
    const onDown = (e: PointerEvent) => {
      // grab starts on the canvas; touch keeps vertical page scroll via pan-y
      dragging = true;
      lastDX = e.clientX;
      lastDY = e.clientY;
      userVel = 0;
      canvas.setPointerCapture(e.pointerId);
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    };

    const clock = new THREE.Clock();
    let accent = "#ff6b00";
    let frame = 0;
    const tmpCam = new THREE.Vector3();
    const tmpLook = new THREE.Vector3();

    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      frame++;
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;
      const pPrev = progress;
      progress += (targetProgress - progress) * (reduce ? 1 : 0.07);

      if (frame % 20 === 0) {
        const next = readCssColor("--acc", "#ff6b00");
        if (next !== accent) {
          accent = next;
          paint.color.set(accent);
          roofPaint.color.set(accent);
          rimLight.color.set(accent);
          ringMat.color.set(accent);
          pulseMat.color.set(accent);
          coreMat.emissive.set(accent);
          accentGlow.emissive.set(readCssColor("--acc2", "#ffa333"));
          (grid.material as THREE.LineBasicMaterial).color.set(accent);
        }
      }

      for (const part of parts) evalPart(part, progress);

      // lock events — each time a joint seats: sparks, steam, a small camera kick
      if (!reduce) {
        for (const L of LOCKS) {
          const crossed = (pPrev < L.p && progress >= L.p) || (pPrev >= L.p && progress < L.p);
          if (!crossed) continue;
          const forward = progress >= pPrev;
          for (const sgn of L.mirror ? [-1, 1] : [1]) {
            tmpV.set(L.x * sgn, L.y, L.z);
            machine.localToWorld(tmpV);
            emitSparks(tmpV.x, tmpV.y, tmpV.z, forward ? 30 : 16, 5.5);
            emitPuffs(tmpV.x, tmpV.y, tmpV.z, forward ? 3 : 2);
          }
          shake = Math.min(1, shake + L.kick);
          if (L.power && forward) {
            pulseT = 0;
            powerFlash = 1;
            pulseRing.visible = true;
          }
        }
      }

      // once it is a robot it comes alive: head tracks the pointer, chest breathes
      const mechAmt = stage(progress, 0.93, 1);
      if (mechAmt > 0.001 && !reduce) {
        eTmp.set(pointer.y * 0.22 * mechAmt, (pointer.x * 0.42 + Math.sin(t * 0.7) * 0.08) * mechAmt, 0);
        headPart.o.quaternion.multiply(qTmp.setFromEuler(eTmp));
      }

      // idle: steam bleeds off both exhaust stacks once the robot is standing
      if (mechAmt > 0.5 && !reduce) {
        steamT -= dt;
        if (steamT <= 0) {
          steamT = 0.45 + Math.random() * 0.4;
          for (const sgn of [-1, 1]) {
            tmpV.set(0.55 * sgn, 6.6, -1.15);
            machine.localToWorld(tmpV);
            emitPuffs(tmpV.x, tmpV.y, tmpV.z, 1);
          }
        }
      }

      // wheels roll in car mode, then wind down as they become joints
      const roll = 7 * (1 - stage(progress, 0.03, 0.2)) * dt;
      spinners.forEach((s) => {
        s.rotation.x -= roll;
      });

      // turntable: the car swings around to face the camera as it stands up
      // slow showroom turntable sway while it is still a car
      const idle = 1 - stage(progress, 0.01, 0.1);
      // free-spin inertia after a drag, and a slow return of the camera-height offset
      if (!dragging) {
        userYaw += userVel;
        userVel *= Math.exp(-dt * 2.2);
        userPitch *= Math.exp(-dt * 0.25);
      }
      const yawTarget = pointer.x * 0.1 * (dragging ? 0 : 1) + Math.sin(t * 0.22) * 0.32 * idle * (dragging ? 0 : 1);
      contactMat.opacity = 1 - stage(progress, 0.04, 0.4) * 0.55;
      yaw += (yawTarget - yaw) * 0.06;
      machine.rotation.y = yaw + userYaw;
      machine.position.y = Math.sin(stage(progress, 0.2, 0.66) * PI) * 0.12 + Math.sin(t * 1.3) * 0.02 * mechAmt;

      // camera: low three-quarter car shot → full-height heroic portrait
      // camera orbits the machine through seven stations, then settles into a low heroic angle
      const cam = camAt(progress);
      const fit = Math.max(1, 1.45 / camera.aspect);
      tmpLook.set(0, cam.ly, 0);
      tmpCam.set(Math.sin(cam.a) * cam.r, cam.h, Math.cos(cam.a) * cam.r);
      tmpCam.sub(tmpLook).multiplyScalar(fit).add(tmpLook);
      camera.position.copy(tmpCam);
      camera.position.x += pointer.x * 0.45 * (dragging ? 0 : 1);
      camera.position.y -= pointer.y * 0.2 * (dragging ? 0 : 1);
      // vertical drag raises or lowers the viewpoint, then eases back over time
      camera.position.y = Math.max(0.35, camera.position.y + userPitch);
      shake *= Math.exp(-dt * 6);
      if (shake > 0.002) {
        camera.position.x += (Math.random() - 0.5) * shake * 0.22;
        camera.position.y += (Math.random() - 0.5) * shake * 0.22;
        camera.position.z += (Math.random() - 0.5) * shake * 0.12;
      }
      lookAt.copy(tmpLook);
      camera.lookAt(lookAt);

      // sparks at the joints while the mechanism is moving
      const active = Math.sin(clamp((progress - 0.1) / 0.72) * PI);

      // while the mechanism is moving fast, loose sparks shake off random joints
      const speed = Math.abs(progress - pPrev) / Math.max(dt, 0.001);
      if (!reduce && speed > 0.02 && progress > 0.12 && progress < 0.92 && frame % 2 === 0) {
        tmpV.set((Math.random() - 0.5) * 3.2, 0.6 + Math.random() * 5, (Math.random() - 0.5) * 2);
        machine.localToWorld(tmpV);
        emitSparks(tmpV.x, tmpV.y, tmpV.z, 3, 3.5);
      }

      // spark physics: gravity, floor bounce, colour cools from white-gold to red as it fades
      for (let i = 0; i < MAXS; i++) {
        if (sLife[i] <= 0) {
          sCol[i * 3] = 0;
          sCol[i * 3 + 1] = 0;
          sCol[i * 3 + 2] = 0;
          continue;
        }
        sLife[i] -= dt;
        sVel[i * 3 + 1] -= 9 * dt;
        sPos[i * 3] += sVel[i * 3] * dt;
        sPos[i * 3 + 1] += sVel[i * 3 + 1] * dt;
        sPos[i * 3 + 2] += sVel[i * 3 + 2] * dt;
        if (sPos[i * 3 + 1] < 0.02) {
          sPos[i * 3 + 1] = 0.02;
          sVel[i * 3 + 1] *= -0.3;
          sVel[i * 3] *= 0.6;
          sVel[i * 3 + 2] *= 0.6;
        }
        const f = clamp(sLife[i] / sMax[i]);
        sCol[i * 3] = f;
        sCol[i * 3 + 1] = 0.62 * f * f;
        sCol[i * 3 + 2] = 0.2 * f * f * f;
      }
      (sparkGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (sparkGeo.attributes.color as THREE.BufferAttribute).needsUpdate = true;

      // steam puffs drift up, swell and fade
      for (const p of puffs) {
        if (p.life <= 0) continue;
        p.life -= dt;
        if (p.life <= 0) {
          p.s.visible = false;
          p.m.opacity = 0;
          continue;
        }
        const k = 1 - p.life / p.max;
        p.s.position.x += p.vx * dt;
        p.s.position.y += p.vy * dt;
        p.s.position.z += p.vz * dt;
        p.vx *= 0.985;
        p.vz *= 0.985;
        p.s.scale.setScalar(p.size * (0.6 + k * 2.2));
        p.m.opacity = 0.34 * (1 - k) * Math.min(1, k * 12);
      }

      // floor shockwave when the robot powers up
      powerFlash *= Math.exp(-dt * 3.2);
      if (pulseT >= 0) {
        pulseT += dt;
        const k = pulseT / 1.7;
        if (k >= 1) {
          pulseT = -1;
          pulseRing.visible = false;
          pulseMat.opacity = 0;
        } else {
          pulseRing.scale.setScalar(0.6 + k * 12);
          pulseMat.opacity = (1 - k) * 0.9;
        }
      }

      // lamps: headlights always on, eyes ignite when the head is up
      lightWhite.emissiveIntensity = 3.2 + Math.sin(t * 3) * 0.2;
      const eyeOn = stage(progress, 0.86, 0.98);
      eyeMat.emissiveIntensity = 5 * eyeOn + 0.2 + powerFlash * 6 - (eyeOn > 0.9 && Math.sin(t * 41) > 0.985 ? 2.5 : 0);
      eyeLight.intensity = 6 * stage(progress, 0.88, 1) + powerFlash * 10;
      coreMat.emissiveIntensity = (0.2 + 4 * stage(progress, 0.84, 0.98)) * (0.86 + 0.14 * Math.sin(t * 4)) + powerFlash * 6;
      chestLight.intensity = 10 * stage(progress, 0.88, 1) + powerFlash * 24;
      accentGlow.emissiveIntensity = 0.4 + 2.2 * stage(progress, 0.6, 0.95);
      kicker.intensity = 14 + active * 16;

      if (progressRef.current) progressRef.current.textContent = `${String(Math.round(progress * 100)).padStart(3, "0")} %`;
      if (systemsRef.current) systemsRef.current.textContent = progress > 0.92 ? "MECH ONLINE" : progress > 0.06 ? "RECONFIGURING" : "VEHICLE MODE";
      let step = 0;
      for (let i = 0; i < STEP_AT.length; i++) if (progress >= STEP_AT[i]) step = i;
      if (step !== lastStep) {
        lastStep = step;
        if (stageRef.current) stageRef.current.textContent = STEPS[step];
        stepRefs.current.forEach((li, i) => {
          if (li) li.className = i === step ? "flex gap-3 text-acc" : i < step ? "flex gap-3 text-white/75" : "flex gap-3 text-white/30";
        });
      }

      renderer.render(scene, camera);
    };

    resize();
    onScroll();
    progress = targetProgress;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(section);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      [paint, roofPaint, carbon, steel, darkSteel, rubber, glass, black, lightWhite, lightRed, eyeMat, caliper, rimMat, linerMat, grille, contactMat, sparkMat, dustMat, ringMat, accentGlow, coreMat, pulseMat].forEach((m) => m.dispose());
      puffs.forEach((p) => p.m.dispose());
      puffTex.dispose();
      meshTex.dispose();
      shadowTex.dispose();
      reflector.dispose();

      frostTex.dispose();
      discTex.dispose();
      tireBump.dispose();
      extraDispose.forEach((d) => d.dispose());
      rivetGeo.dispose();
      [leather, alcantara, screenMat, stitch, lensMat, lensRed, discMat, barrelMat, bulkMat, seamMat, frost.material as THREE.Material, shadowPlane.material as THREE.Material].forEach((m) => m.dispose());
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section ref={sectionRef} id="reach" data-section="TRANSFORM" className="relative h-[440svh] bg-[#0a0908] text-[#f3efe6]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas
          ref={canvasRef}
          data-cursor="DRAG"
          className="absolute inset-0 h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
          aria-label="Original wedge supercar transforming into a robot as the page scrolls. Drag to spin it and view other angles."
        />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_75%_at_50%_50%,transparent_40%,rgba(10,9,8,.7)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0a0908] to-transparent" />

        <div className="pointer-events-none absolute left-5 top-24 z-10 max-w-md md:left-10 md:top-28">
          <p className="mb-4 font-mono text-[11px] font-bold tracking-[.22em] text-acc">(03) VEHICLE / MECH</p>
          <h2 className="font-hero text-[14vw] font-extrabold uppercase leading-[.82] tracking-[-.035em] md:text-[6vw]">
            MACHINE /
            <br />
            <span className="text-acc">FORM</span>
          </h2>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65 md:text-[15px]">
            An original wedge supercar that unfolds into a robot. Every panel is a rigid part; limbs swing out from inside the hull, joints lock with a spark, and the head deploys last. Scroll drives the mechanism.
          </p>
        </div>

        <div className="pointer-events-none absolute right-5 top-24 z-10 hidden w-56 font-mono text-[10px] tracking-[.14em] md:right-10 md:top-28 md:block">
        <dl>
          <div className="mb-2 flex items-center gap-2 font-bold text-white/70">
            <span className="h-1.5 w-1.5 bg-acc" />
            AXIOM / 01
          </div>
          <HudRow k="STATE" vRef={systemsRef} initial="VEHICLE MODE" />
          <HudRow k="SEQUENCE" vRef={stageRef} initial="VEHICLE" />
          <HudRow k="PROGRESS" vRef={progressRef} initial="000 %" />
          <HudRow k="PARTS" vRef={panelsRef} initial="—" />
          <HudRow k="LAYOUT" initial="MID-ENGINE WEDGE" />
          <HudRow k="DRIVE" initial="ELECTRIC / AWD" />
        </dl>
        <ol className="mt-4 space-y-1 border-t border-white/15 pt-3 text-[9px] tracking-[.16em]">
          {STEPS.map((s, i) => (
            <li
              key={s}
              ref={(el) => {
                stepRefs.current[i] = el;
              }}
              className={i === 0 ? "flex gap-3 text-acc" : "flex gap-3 text-white/30"}
            >
              <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              {s}
            </li>
          ))}
        </ol>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="mx-5 mb-8 h-px overflow-hidden bg-white/15 md:mx-10">
            <div className="transform-scan h-full bg-acc" />
          </div>
          <div className="flex h-8 items-center justify-between border-t border-white/10 bg-[#0a0908]/80 px-5 font-mono text-[9px] font-bold tracking-[.2em] text-white/55 backdrop-blur md:px-10">
            <span>SCROLL TO TRANSFORM · DRAG TO SPIN &amp; VIEW ANY ANGLE</span>
            <span className="hidden sm:inline">ORIGINAL PROCEDURAL MODEL · WEBGL</span>
          </div>
        </div>
      </div>
    </section>
  );
}
