import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export type AttractorMode = "LATTICE" | "VORTEX" | "TORUS";

function seeded(index: number, salt = 0): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function torusPoint(i: number, count: number): [number, number, number] {
  const u = (i / count) * Math.PI * 2 * 3;
  const v = seeded(i, 3) * Math.PI * 2;
  const R = 3.2;
  const r = 0.85 + Math.sin(u * 2) * 0.22;
  const x = (R + r * Math.cos(v)) * Math.cos(u);
  const y = (R + r * Math.cos(v)) * Math.sin(u) * 0.7;
  const z = r * Math.sin(v) * 1.2;
  return [x, y, z];
}

function vortexPoint(i: number, count: number): [number, number, number] {
  const t = i / count;
  const angle = t * Math.PI * 2 * 10;
  const radius = 0.35 + Math.pow(t, 0.65) * 3.8;
  const height = (seeded(i, 5) - 0.5) * (0.9 + radius * 0.3);
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return [x, height, z];
}

function latticePoint(i: number, count: number): [number, number, number] {
  const u = seeded(i, 8);
  const v = seeded(i, 9);
  const theta = u * Math.PI * 2;
  const phi = Math.acos(2 * v - 1);
  const r = 2.8 + Math.sin(phi * 6) * Math.cos(theta * 6) * 0.35;
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta) * 0.78,
    r * Math.cos(phi),
  ];
}

interface EditorialCanvasProps {
  opacity?: number;
  interactive?: boolean;
}

export function EditorialCanvas({ opacity = 0.38, interactive = true }: EditorialCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentMode, setCurrentMode] = useState<AttractorMode>("LATTICE");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let animId: number;
    let isVisible = true;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090d, 0.05);

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 70);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x07090d, 0);
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // Particles Setup
    const POINT_COUNT = 6500;
    const posLattice = new Float32Array(POINT_COUNT * 3);
    const posVortex = new Float32Array(POINT_COUNT * 3);
    const posTorus = new Float32Array(POINT_COUNT * 3);
    const currentPositions = new Float32Array(POINT_COUNT * 3);
    const colors = new Float32Array(POINT_COUNT * 3);

    // Steel-blue palette based on DESIGN.md
    const colorSignal = new THREE.Color("#86bdd8");
    const colorBright = new THREE.Color("#b0d8e7");
    const colorMuted = new THREE.Color("#566b7a");

    for (let i = 0; i < POINT_COUNT; i++) {
      const i3 = i * 3;
      const [lx, ly, lz] = latticePoint(i, POINT_COUNT);
      const [vx, vy, vz] = vortexPoint(i, POINT_COUNT);
      const [tx, ty, tz] = torusPoint(i, POINT_COUNT);

      posLattice[i3] = lx;
      posLattice[i3 + 1] = ly;
      posLattice[i3 + 2] = lz;

      posVortex[i3] = vx;
      posVortex[i3 + 1] = vy;
      posVortex[i3 + 2] = vz;

      posTorus[i3] = tx;
      posTorus[i3 + 1] = ty;
      posTorus[i3 + 2] = tz;

      currentPositions[i3] = lx;
      currentPositions[i3 + 1] = ly;
      currentPositions[i3 + 2] = lz;

      // Color variation across depth
      const mix = seeded(i, 1);
      const pointColor = mix < 0.4 ? colorSignal : mix < 0.75 ? colorBright : colorMuted;
      colors[i3] = pointColor.r;
      colors[i3 + 1] = pointColor.g;
      colors[i3 + 2] = pointColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Custom point texture for crisp circular nodes
    const canvasPoint = document.createElement("canvas");
    canvasPoint.width = 32;
    canvasPoint.height = 32;
    const ctx = canvasPoint.getContext("2d");
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.35, "rgba(176,216,231,0.85)");
      gradient.addColorStop(0.7, "rgba(134,189,216,0.3)");
      gradient.addColorStop(1, "rgba(7,9,13,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const pointTexture = new THREE.CanvasTexture(canvasPoint);

    const material = new THREE.PointsMaterial({
      size: 0.055,
      map: pointTexture,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pointCloud = new THREE.Points(geometry, material);
    rootGroup.add(pointCloud);

    // Target blend state
    let targetPositions = posLattice;
    let blendFactor = 1.0;

    const handleModeSwitch = (e: CustomEvent<{ mode: AttractorMode }>) => {
      const mode = e.detail?.mode;
      if (!mode) return;
      setCurrentMode(mode);
      blendFactor = 0;
      if (mode === "VORTEX") targetPositions = posVortex;
      else if (mode === "TORUS") targetPositions = posTorus;
      else targetPositions = posLattice;
    };

    window.addEventListener("portfolio:attractor-mode" as any, handleModeSwitch as any);

    // Parallax mouse interaction
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      pointer.targetX = (e.clientX / window.innerWidth - 0.5) * 0.7;
      pointer.targetY = (e.clientY / window.innerHeight - 0.5) * -0.5;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Window Resize
    const onResize = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", onResize);

    // Tab visibility handling to pause rendering
    const onVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Animation loop
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      clock += 0.008;

      // Smooth pointer lerp
      pointer.x += (pointer.targetX - pointer.x) * 0.04;
      pointer.y += (pointer.targetY - pointer.y) * 0.04;

      rootGroup.rotation.y = clock * 0.12 + pointer.x;
      rootGroup.rotation.x = Math.sin(clock * 0.08) * 0.15 + pointer.y;

      // Morphing positions between geometries
      if (blendFactor < 1) {
        blendFactor = Math.min(1, blendFactor + 0.025);
        const posAttr = geometry.attributes.position as THREE.BufferAttribute;
        const array = posAttr.array as Float32Array;

        for (let i = 0; i < POINT_COUNT * 3; i++) {
          array[i] += (targetPositions[i] - array[i]) * 0.08;
        }
        posAttr.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("portfolio:attractor-mode" as any, handleModeSwitch as any);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      pointTexture.dispose();
      renderer.dispose();
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className="editorial-canvas-container"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity,
        overflow: "hidden",
      }}
      aria-hidden="true"
    />
  );
}
