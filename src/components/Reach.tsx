import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { toCreasedNormals } from "three/examples/jsm/utils/BufferGeometryUtils.js";
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
  { z: -2.4, w: 0.98, yt: 0.86, yg: 0.78, rw: 0.8, yb: 0.24 },
  { z: -2.1, w: 1.0, yt: 0.9, yg: 0.8, rw: 0.84, yb: 0.17 },
  { z: -1.6, w: 1.02, yt: 0.93, yg: 0.84, rw: 0.86, yb: 0.13 },
  { z: -1.2, w: 1.03, yt: 0.99, yg: 0.83, rw: 0.76, yb: 0.12 },
  { z: -0.7, w: 1.0, yt: 1.09, yg: 0.79, rw: 0.55, yb: 0.12 },
  { z: -0.1, w: 1.0, yt: 1.14, yg: 0.77, rw: 0.5, yb: 0.12 },
  { z: 0.45, w: 1.0, yt: 1.06, yg: 0.76, rw: 0.55, yb: 0.12 },
  { z: 0.9, w: 1.01, yt: 0.92, yg: 0.75, rw: 0.72, yb: 0.12 },
  { z: 1.35, w: 1.03, yt: 0.76, yg: 0.7, rw: 0.85, yb: 0.12 },
  { z: 1.9, w: 0.92, yt: 0.58, yg: 0.55, rw: 0.78, yb: 0.13 },
  { z: 2.4, w: 0.68, yt: 0.42, yg: 0.4, rw: 0.6, yb: 0.2 },
];

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

/** half cross-section, bottom-centre → over the shoulder → top-centre */
function half(s: St): [number, number][] {
  const { w, yt, yg, rw, yb } = s;
  const h = yt - yg;
  return [
    [0, yb],
    [w * 0.5, yb],
    [w * 0.86, yb + 0.02],
    [w * 0.97, yb + 0.09],
    [w, yb + (yg - yb) * 0.42],
    [w, yg - 0.04],
    [w - (w - rw) * 0.18, yg + h * 0.22],
    [w - (w - rw) * 0.55, yg + h * 0.62],
    [rw, yt - 0.015],
    [rw * 0.55, yt],
    [0, yt],
  ];
}

type Mode = "full" | "glass" | "roof";
function ring(s: St, mode: Mode): [number, number][] {
  const h = half(s);
  if (mode === "full") {
    const out = h.slice();
    for (let i = h.length - 2; i >= 1; i--) out.push([-h[i][0], h[i][1]]);
    return out;
  }
  const r = mode === "glass" ? h.slice(6) : h.slice(8);
  const out = r.slice();
  for (let i = r.length - 2; i >= 0; i--) out.push([-r[i][0], r[i][1]]);
  return out;
}

function loft(z0: number, z1: number, mode: Mode, cap = false, step = 0.09) {
  const n = Math.max(2, Math.ceil((z1 - z0) / step) + 1);
  const rings: [number, number, number][][] = [];
  for (let i = 0; i < n; i++) {
    const z = z0 + ((z1 - z0) * i) / (n - 1);
    rings.push(ring(stAt(z), mode).map(([x, y]) => [x, y, z] as [number, number, number]));
  }
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
  for (let k = 5; k < h.length - 1; k++) {
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
type KeyDef = { t: number; p: V3; e?: V3; s?: number };
type Key = { t: number; p: THREE.Vector3; q: THREE.Quaternion; s: number };
type Part = { o: THREE.Object3D; keys: Key[] };

const mk = (k: KeyDef): Key => ({
  t: k.t,
  p: new THREE.Vector3(...k.p),
  q: new THREE.Quaternion().setFromEuler(new THREE.Euler(...(k.e ?? [0, 0, 0]))),
  s: k.s ?? 1,
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
  const u = a === b ? 0 : smooth((prog - a.t) / (b.t - a.t));
  part.o.position.lerpVectors(a.p, b.p, u);
  part.o.quaternion.slerpQuaternions(a.q, b.q, u);
  part.o.scale.setScalar(mix(a.s, b.s, u));
}

const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const PI = Math.PI;

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

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------- renderer / scene ---------------- */
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0908);
    scene.fog = new THREE.Fog(0x0a0908, 16, 46);

    // studio reflections for the clearcoat, glass and metals
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    (scene as unknown as { environmentIntensity: number }).environmentIntensity = 0.85;

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
    const rimLight = new THREE.PointLight(0xff5a36, 30, 26, 2);
    rimLight.position.set(-6, 3.5, -5);
    scene.add(rimLight);
    const kicker = new THREE.PointLight(0xffd9a0, 14, 20, 2);
    kicker.position.set(6, 1.8, 4);
    scene.add(kicker);

    /* ---------------- materials ---------------- */
    const paint = new THREE.MeshPhysicalMaterial({ color: 0xff5a36, metalness: 0.55, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.DoubleSide });
    const roofPaint = paint.clone();
    roofPaint.polygonOffset = true;
    roofPaint.polygonOffsetFactor = -4;
    roofPaint.polygonOffsetUnits = -4;
    const carbon = new THREE.MeshStandardMaterial({ color: 0x0e0e0e, metalness: 0.55, roughness: 0.4, side: THREE.DoubleSide });
    const steel = new THREE.MeshStandardMaterial({ color: 0xa8a39a, metalness: 1, roughness: 0.22 });
    const darkSteel = new THREE.MeshStandardMaterial({ color: 0x2a2826, metalness: 0.92, roughness: 0.36 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x0b0b0b, metalness: 0, roughness: 0.86 });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x080d0e,
      metalness: 0,
      roughness: 0.04,
      transparent: true,
      opacity: 0.86,
      side: THREE.DoubleSide,
      envMapIntensity: 1.8,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    const black = new THREE.MeshStandardMaterial({ color: 0x030303, metalness: 0.2, roughness: 0.7, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
    const lightWhite = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff0cc, emissiveIntensity: 3.2, roughness: 0.3 });
    const lightRed = new THREE.MeshStandardMaterial({ color: 0x330000, emissive: 0xff1a10, emissiveIntensity: 2.6, roughness: 0.4 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffd27a, emissiveIntensity: 5, roughness: 0.3 });
    const caliper = new THREE.MeshStandardMaterial({ color: 0xc21b12, metalness: 0.4, roughness: 0.4 });

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
      const barrel = cyl(0.25, 0.25, width * 0.86, steel, 40);
      barrel.rotation.z = PI / 2;
      spin.add(barrel);
      const face = cyl(0.225, 0.225, 0.02, darkSteel, 40);
      face.rotation.z = PI / 2;
      face.position.x = hw * 0.6;
      spin.add(face);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * PI * 2;
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.06), steel);
        spoke.position.set(hw * 0.68, Math.cos(a) * 0.13, Math.sin(a) * 0.13);
        spoke.rotation.x = a;
        spoke.castShadow = true;
        spin.add(spoke);
      }
      const hub = cyl(0.05, 0.05, 0.05, darkSteel, 16);
      hub.rotation.z = PI / 2;
      hub.position.x = hw * 0.72;
      spin.add(hub);
      g.add(spin);
      spinners.push(spin);
      const disc = cyl(0.2, 0.2, 0.035, darkSteel, 40);
      disc.rotation.z = PI / 2;
      disc.position.x = -hw * 0.35;
      g.add(disc);
      const cal = box(0.09, 0.1, 0.17, caliper);
      cal.position.set(-hw * 0.35, 0.155, 0);
      g.add(cal);
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
    put(nose, box(1.5, 0.03, 0.55, carbon), 0, 0.135, 2.28);
    put(nose, box(0.52, 0.12, 0.05, black), 0, 0.3, 2.395);
    for (const sx of [-1, 1]) {
      const ly = surfY(1.9, 0.62 * sx) + 0.006;
      const y = yLight(lightWhite, 0.36);
      y.position.set(0.62 * sx - cNose.x, ly - cNose.y, 1.86 - cNose.z);
      y.rotation.x = -Math.atan(slopeAt(1.86, 0.62 * sx));
      y.scale.x = sx;
      nose.add(y);
      put(nose, box(0.22, 0.1, 0.05, black), 0.5 * sx, 0.3, 2.3);
    }
    reg(nose, [
      { t: 0, p: [0, 0.6, 2.0] },
      { t: 0.24, p: [0, 1.4, 2.6], e: [-0.25, 0, 0] },
      { t: 0.6, p: [0, 3.75, 0.95], e: [PI / 2, 0, 0] },
    ]);

    // HOOD — vents, front arches, windscreen
    const hood = makeGroup(cHood);
    shell(hood, loft(0.55, 1.6, "full", true), paint);
    shell(hood, loft(0.55, 0.93, "glass"), glass);
    for (const sx of [-1, 1]) {
      const y = surfY(1.15, 0.3 * sx) + 0.005;
      const v = box(0.26, 0.012, 0.34, black);
      v.position.set(0.3 * sx - cHood.x, y - cHood.y, 1.15 - cHood.z);
      v.rotation.x = -Math.atan(slopeAt(1.15, 0.3 * sx));
      hood.add(v);
      const arch = cyl(0.43, 0.43, 0.02, black, 40);
      arch.rotation.z = PI / 2;
      put(hood, arch, 1.04 * sx, 0.365, 1.35);
    }
    reg(hood, [
      { t: 0, p: [0, 0.6, 1.075] },
      { t: 0.22, p: [0, 1.5, 1.6], e: [-0.3, 0, 0] },
      { t: 0.62, p: [0, 4.95, 0.85], e: [PI / 2, 0, 0] },
    ]);

    // CABIN — glass, painted roof, side intakes
    const cabin = makeGroup(cCabin);
    shell(cabin, loft(-0.9, 0.55, "full", true), paint);
    shell(cabin, loft(-0.95, 0.56, "glass"), glass);
    shell(cabin, loft(-0.85, 0.3, "roof"), roofPaint);
    for (const sx of [-1, 1]) {
      const intake = box(0.03, 0.2, 0.4, black);
      put(cabin, intake, 1.005 * sx, 0.5, -0.72);
    }
    reg(cabin, [
      { t: 0, p: [0, 0.6, -0.175] },
      { t: 0.2, p: [0, 1.3, -0.5], e: [0.15, 0, 0] },
      { t: 0.66, p: [0, 4.75, -1.0], e: [-PI / 2, 0, 0] },
    ]);

    // REAR — engine cover louvres, hex tail lights, exhaust, diffuser, spoiler, rear arches
    const rear = makeGroup(cRear);
    shell(rear, loft(-2.4, -0.9, "full", true), paint);
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
      for (const x of [0.72, 0.46]) {
        const hex = cyl(0.085, 0.085, 0.03, lightRed, 6);
        hex.rotation.x = PI / 2;
        put(rear, hex, x * sx, 0.6, -2.405);
      }
      const ex = cyl(0.1, 0.1, 0.26, darkSteel, 6);
      ex.rotation.x = PI / 2;
      put(rear, ex, 0.2 * sx, 0.36, -2.48);
      const arch = cyl(0.43, 0.43, 0.02, black, 40);
      arch.rotation.z = PI / 2;
      put(rear, arch, 1.04 * sx, 0.365, -1.35);
      const pylon = box(0.04, 0.2, 0.05, carbon);
      put(rear, pylon, 0.6 * sx, 0.9, -2.2);
    }
    put(rear, box(1.5, 0.014, 0.024, lightRed), 0, 0.71, -2.405);
    put(rear, box(1.7, 0.03, 0.3, carbon), 0, 1.0, -2.25).rotation.x = 0.1;
    for (let i = -3; i <= 3; i++) put(rear, box(0.02, 0.1, 0.34, carbon), i * 0.15, 0.2, -2.24);
    reg(rear, [
      { t: 0, p: [0, 0.6, -1.65] },
      { t: 0.28, p: [0, 1.5, -2.4], e: [0.25, 0, 0] },
      { t: 0.68, p: [0, 2.75, -0.75], e: [-PI / 2, 0, 0] },
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
        { t: 0.58, p: [2.02 * sx, 3.2, 0.1], e: [PI / 2, 0, 0] },
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
        { t: 0, p: [0.98 * sx, 0.365, 1.35], e: fe },
        { t: 0.16, p: [1.3 * sx, 0.6, 1.35], e: fe },
        { t: 0.66, p: [1.86 * sx, 5.2, 0.1], e: fe },
      ]);
      const rw = makeWheel(0.36);
      reg(rw, [
        { t: 0, p: [0.99 * sx, 0.365, -1.35], e: fe },
        { t: 0.16, p: [1.3 * sx, 0.6, -1.35], e: fe },
        { t: 0.7, p: [0.8 * sx, 1.5, 0.55], e: [0, -PI / 2, 0] },
      ]);
    }

    /* ===== internal skeleton — sits inside the hull in car mode ===== */
    const bone = (w: number, h: number, d: number, joint = true) => {
      const g = new THREE.Group();
      g.add(box(w, h, d, darkSteel));
      const trim = box(w * 1.02, h * 0.08, d * 1.02, carbon);
      trim.position.y = h * 0.4;
      g.add(trim);
      const rod = cyl(0.045, 0.045, h * 0.85, steel, 12);
      rod.position.set(w * 0.32, 0, d / 2 + 0.03);
      g.add(rod);
      if (joint) {
        const j = new THREE.Mesh(new THREE.SphereGeometry(Math.min(w, d) * 0.6, 20, 14), steel);
        j.position.y = -h / 2;
        j.castShadow = true;
        g.add(j);
      }
      return g;
    };
    const skeleton: { g: THREE.Group; car: V3; mech: V3; mt: number }[] = [];
    const addBone = (g: THREE.Group, car: V3, mech: V3, mt: number) => skeleton.push({ g, car, mech, mt });
    addBone(bone(1.5, 1.5, 1.0, false), [0, 0.42, 0.0], [0, 4.6, -0.02], 0.6);
    addBone(bone(1.3, 0.7, 0.9, false), [0, 0.4, -0.9], [0, 3.05, 0], 0.6);
    for (const sx of [-1, 1]) {
      addBone(bone(0.55, 1.4, 0.6), [0.45 * sx, 0.4, -1.4], [0.55 * sx, 2.3, 0], 0.62);
      addBone(bone(0.6, 1.5, 0.7), [0.45 * sx, 0.4, -1.0], [0.6 * sx, 0.9, 0.05], 0.64);
      addBone(bone(0.75, 0.3, 1.5, false), [0.4 * sx, 0.3, 0.7], [0.6 * sx, 0.15, 0.32], 0.66);
      addBone(bone(0.5, 1.2, 0.5), [0.5 * sx, 0.45, 0.3], [1.62 * sx, 4.45, 0], 0.62);
      addBone(bone(0.55, 1.3, 0.6), [0.5 * sx, 0.45, -0.2], [1.72 * sx, 3.2, 0.1], 0.64);
      addBone(bone(0.5, 0.5, 0.55, false), [0.5 * sx, 0.4, -0.6], [1.74 * sx, 2.3, 0.15], 0.66);
    }
    skeleton.forEach(({ g, car, mech, mt }) => {
      reg(g, [
        { t: 0, p: car, s: 0.34 },
        { t: 0.3, p: car, s: 0.34 },
        { t: mt, p: mech, s: 1 },
      ]);
    });

    /* ===== head — nested in the body, rises last ===== */
    const head = new THREE.Group();
    head.add(box(0.72, 0.5, 0.58, carbon));
    const faceplate = box(0.56, 0.2, 0.05, steel);
    faceplate.position.set(0, -0.06, 0.31);
    head.add(faceplate);
    for (const x of [-0.16, 0.16]) {
      const eye = box(0.14, 0.05, 0.04, eyeMat);
      eye.position.set(x, 0.06, 0.335);
      head.add(eye);
    }
    const crest = box(0.16, 0.14, 0.5, paint);
    crest.position.set(0, 0.3, -0.02);
    head.add(crest);
    for (const x of [-0.42, 0.42]) {
      const ear = box(0.1, 0.34, 0.3, paint);
      ear.position.set(x, 0.02, -0.04);
      head.add(ear);
    }
    const chin = box(0.3, 0.1, 0.1, steel);
    chin.position.set(0, -0.3, 0.24);
    head.add(chin);
    const neck = cyl(0.16, 0.16, 0.3, darkSteel, 16);
    neck.position.set(0, -0.4, -0.05);
    head.add(neck);
    const eyeLight = new THREE.PointLight(0xffd27a, 0, 7, 2);
    eyeLight.position.set(0, 0.05, 0.9);
    head.add(eyeLight);
    reg(head, [
      { t: 0, p: [0, 0.7, -0.3], s: 0.01 },
      { t: 0.68, p: [0, 5.3, -0.05], s: 0.01 },
      { t: 0.94, p: [0, 6.2, 0.15], s: 1 },
    ]);

    /* ---------------- showroom floor ---------------- */
    const floor = new THREE.Mesh(new THREE.CircleGeometry(40, 64), new THREE.MeshStandardMaterial({ color: 0x0c0b0a, roughness: 0.42, metalness: 0.5 }));
    floor.rotation.x = -PI / 2;
    floor.position.y = -0.01;
    floor.receiveShadow = true;
    scene.add(floor);
    const grid = new THREE.GridHelper(60, 60, 0xff5a36, 0x241b16);
    grid.position.y = 0.002;
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.28;
    scene.add(grid);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff5a36, transparent: true, opacity: 0.55 });
    const turntable = new THREE.Mesh(new THREE.RingGeometry(4.5, 4.56, 96), ringMat);
    turntable.rotation.x = -PI / 2;
    turntable.position.y = 0.006;
    scene.add(turntable);

    /* ---------------- sparks + dust ---------------- */
    const sparkCount = 220;
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkSeed = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount; i++) {
      sparkSeed[i * 3] = (Math.random() - 0.5) * 4.6;
      sparkSeed[i * 3 + 1] = Math.random();
      sparkSeed[i * 3 + 2] = (Math.random() - 0.5) * 3.2;
    }
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({ color: 0xffb24a, size: 0.04, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
    scene.add(new THREE.Points(sparkGeo, sparkMat));
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
    let yaw = -0.75;
    const pointer = { x: 0, y: 0 };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
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
    };

    const clock = new THREE.Clock();
    let accent = "#ff5a36";
    let frame = 0;
    const tmpCam = new THREE.Vector3();
    const tmpLook = new THREE.Vector3();

    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      frame++;
      const dt = Math.min(0.05, clock.getDelta());
      const t = clock.elapsedTime;
      progress += (targetProgress - progress) * (reduce ? 1 : 0.07);

      if (frame % 20 === 0) {
        const next = readCssColor("--acc", "#ff5a36");
        if (next !== accent) {
          accent = next;
          paint.color.set(accent);
          roofPaint.color.set(accent);
          rimLight.color.set(accent);
          ringMat.color.set(accent);
          (grid.material as THREE.LineBasicMaterial).color.set(accent);
        }
      }

      for (const part of parts) evalPart(part, progress);

      // wheels roll in car mode, then wind down as they become joints
      const roll = 7 * (1 - stage(progress, 0.03, 0.2)) * dt;
      spinners.forEach((s) => {
        s.rotation.x -= roll;
      });

      // turntable: the car swings around to face the camera as it stands up
      const yawTarget = mix(-0.8, 0.12, stage(progress, 0.02, 0.95)) + pointer.x * 0.1;
      yaw += (yawTarget - yaw) * 0.06;
      machine.rotation.y = yaw;
      machine.position.y = Math.sin(stage(progress, 0.2, 0.66) * PI) * 0.12;

      // camera: low three-quarter car shot → full-height heroic portrait
      const cp = stage(progress, 0.04, 0.92);
      const fit = Math.max(1, 1.45 / camera.aspect);
      tmpLook.set(0, mix(0.5, 3.2, cp), 0);
      tmpCam.set(mix(5.6, 8.4, cp), mix(1.4, 4.0, cp), mix(6.6, 13.4, cp));
      tmpCam.sub(tmpLook).multiplyScalar(fit).add(tmpLook);
      camera.position.copy(tmpCam);
      camera.position.x += pointer.x * 0.45;
      camera.position.y -= pointer.y * 0.2;
      lookAt.copy(tmpLook);
      camera.lookAt(lookAt);

      // sparks at the joints while the mechanism is moving
      const active = Math.sin(clamp((progress - 0.1) / 0.72) * PI);
      sparkMat.opacity = active * 0.85;
      for (let i = 0; i < sparkCount; i++) {
        const fall = (t * (0.6 + (i % 9) * 0.05) + i * 0.13) % 1;
        sparkPos[i * 3] = sparkSeed[i * 3] * (0.4 + active);
        sparkPos[i * 3 + 1] = mix(0.3, 5.8, sparkSeed[i * 3 + 1]) * (1 - fall * 0.5) - fall * 0.8;
        sparkPos[i * 3 + 2] = sparkSeed[i * 3 + 2] * (0.4 + active);
      }
      (sparkGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      // lamps: headlights always on, eyes ignite when the head is up
      lightWhite.emissiveIntensity = 3.2 + Math.sin(t * 3) * 0.2;
      eyeMat.emissiveIntensity = 5 * stage(progress, 0.86, 0.98) + 0.2;
      eyeLight.intensity = 6 * stage(progress, 0.88, 1);
      kicker.intensity = 14 + active * 16;

      if (progressRef.current) progressRef.current.textContent = `${String(Math.round(progress * 100)).padStart(3, "0")} %`;
      if (systemsRef.current) systemsRef.current.textContent = progress > 0.92 ? "MECH ONLINE" : progress > 0.06 ? "RECONFIGURING" : "VEHICLE MODE";
      if (stageRef.current) {
        stageRef.current.textContent = progress < 0.06 ? "VEHICLE" : progress < 0.26 ? "DOORS · WHEELS" : progress < 0.52 ? "PANEL RELEASE" : progress < 0.8 ? "LIMB LOCK" : progress < 0.94 ? "HEAD DEPLOY" : "MECH";
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
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      [paint, roofPaint, carbon, steel, darkSteel, rubber, glass, black, lightWhite, lightRed, eyeMat, caliper, sparkMat, dustMat, ringMat].forEach((m) => m.dispose());
      envRT.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section ref={sectionRef} id="reach" data-section="TRANSFORM" className="relative h-[360svh] bg-[#0a0908] text-[#f3efe6]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="Original wedge supercar transforming into a robot as the page scrolls" />

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
            An original wedge supercar that unfolds into a robot. Every panel is a rigid part that flies to its place; scroll drives the mechanism.
          </p>
        </div>

        <dl className="pointer-events-none absolute right-5 top-24 z-10 hidden w-56 font-mono text-[10px] tracking-[.14em] md:right-10 md:top-28 md:block">
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

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="mx-5 mb-8 h-px overflow-hidden bg-white/15 md:mx-10">
            <div className="transform-scan h-full bg-acc" />
          </div>
          <div className="flex h-8 items-center justify-between border-t border-white/10 bg-[#0a0908]/80 px-5 font-mono text-[9px] font-bold tracking-[.2em] text-white/55 backdrop-blur md:px-10">
            <span>SCROLL TO TRANSFORM · SCROLL BACK TO REASSEMBLE</span>
            <span className="hidden sm:inline">ORIGINAL PROCEDURAL MODEL · WEBGL</span>
          </div>
        </div>
      </div>
    </section>
  );
}
