import { useEffect, useRef } from "react";
import * as THREE from "three";

// Deterministic pseudo-random seed generator
function seeded(index: number, salt = 0): number {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

function smoothstep(min: number, max: number, value: number): number {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return t * t * (3 - 2 * t);
}

// 3 Distinct 3D Attractor Geometries (12,000 Points)
function fluidTorusPoint(i: number, count: number): [number, number, number] {
  const u = (i / count) * Math.PI * 2 * 4;
  const v = seeded(i, 3) * Math.PI * 2;
  const R = 2.6;
  const r = 0.95 + Math.sin(u * 2.5) * 0.28;
  const x = (R + r * Math.cos(v)) * Math.cos(u);
  const y = (R + r * Math.cos(v)) * Math.sin(u) * 0.65;
  const z = r * Math.sin(v) * 1.35;
  return [x, y, z];
}

function vortexPoint(i: number, count: number): [number, number, number] {
  const t = i / count;
  const angle = t * Math.PI * 2 * 14;
  const radius = 0.4 + Math.pow(t, 0.6) * 3.4;
  const height = (seeded(i, 7) - 0.5) * (0.8 + radius * 0.35);
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  return [x, height, z];
}

function latticePoint(i: number, count: number): [number, number, number] {
  const u = seeded(i, 11);
  const v = seeded(i, 12);
  const theta = u * Math.PI * 2;
  const phi = Math.acos(2 * v - 1);
  const r = 2.3 + Math.sin(phi * 8) * Math.cos(theta * 8) * 0.35;
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta) * 0.85,
    r * Math.cos(phi),
  ];
}

export function CinematicCyberCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animId: number;
    const progressRef = { current: 0 };
    const pointerRef = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const mouseScreenRef = { x: -1000, y: -1000 };
    const shockwaveRef = { originX: 0, originY: 0, radius: 0, active: false, intensity: 0 };
    const modeState = { current: "FLUID", blendTorus: 1, blendVortex: 0, blendLattice: 0 };

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05080e, 0.04);

    let width = window.innerWidth;
    let height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 85);
    camera.position.set(0, 0.15, 7.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x05080e, 0);
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 2. 12,000 Particle Field Setup
    const POINT_COUNT = 12000;
    const posFluid = new Float32Array(POINT_COUNT * 3);
    const posVortex = new Float32Array(POINT_COUNT * 3);
    const posLattice = new Float32Array(POINT_COUNT * 3);
    const currentPositions = new Float32Array(POINT_COUNT * 3);
    const originalPositions = new Float32Array(POINT_COUNT * 3);
    const colors = new Float32Array(POINT_COUNT * 3);
    const sizes = new Float32Array(POINT_COUNT);

    const cyanColor = new THREE.Color("#00e5ff");
    const blueColor = new THREE.Color("#38bdf8");
    const violetColor = new THREE.Color("#818cf8");

    for (let i = 0; i < POINT_COUNT; i++) {
      const pF = fluidTorusPoint(i, POINT_COUNT);
      const pV = vortexPoint(i, POINT_COUNT);
      const pL = latticePoint(i, POINT_COUNT);

      posFluid[i * 3] = pF[0];
      posFluid[i * 3 + 1] = pF[1];
      posFluid[i * 3 + 2] = pF[2];

      posVortex[i * 3] = pV[0];
      posVortex[i * 3 + 1] = pV[1];
      posVortex[i * 3 + 2] = pV[2];

      posLattice[i * 3] = pL[0];
      posLattice[i * 3 + 1] = pL[1];
      posLattice[i * 3 + 2] = pL[2];

      currentPositions[i * 3] = pF[0];
      currentPositions[i * 3 + 1] = pF[1];
      currentPositions[i * 3 + 2] = pF[2];

      originalPositions[i * 3] = pF[0];
      originalPositions[i * 3 + 1] = pF[1];
      originalPositions[i * 3 + 2] = pF[2];

      // Color palette: 70% Quantum Cyan, 20% Sky Blue, 10% Arctic Violet
      const rand = seeded(i, 44);
      const col = rand > 0.3 ? (rand > 0.85 ? violetColor : blueColor) : cyanColor;
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = 1.4 + seeded(i, 99) * 2.2;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(currentPositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particleGeo.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    // Custom GPU Shader Material with Distance Attenuation & Soft Circular Glow
    const particleMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelDensity: { value: Math.min(window.devicePixelRatio, 1.75) },
        uOpacity: { value: 0.82 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vDepth;
        uniform float uTime;
        uniform float uPixelDensity;

        void main() {
          vColor = color;
          vec3 p = position;

          // Subtle micro-breathing wave
          p.y += sin(uTime * 1.1 + p.x * 1.5 + p.z) * 0.025;
          p.x += cos(uTime * 0.9 + p.y * 1.2) * 0.02;

          vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
          vDepth = clamp(1.0 - (-mvPosition.z / 18.0), 0.0, 1.0);
          gl_PointSize = size * uPixelDensity * (11.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vDepth;
        uniform float uOpacity;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = smoothstep(0.5, 0.04, dist) * uOpacity * (0.35 + vDepth * 0.65);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    });

    const particleMesh = new THREE.Points(particleGeo, particleMat);
    rootGroup.add(particleMesh);

    // 3. Constellation Line Filaments (Connected Cyber Nodes)
    const NODE_COUNT = 70;
    const nodeVectors: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const p = fluidTorusPoint(i * 35, POINT_COUNT);
      nodeVectors.push(new THREE.Vector3(p[0] * 0.85, p[1] * 0.85, p[2] * 0.85));
    }

    const linePositions: number[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (nodeVectors[i].distanceTo(nodeVectors[j]) < 1.7 && linePositions.length < 1600) {
          linePositions.push(
            nodeVectors[i].x, nodeVectors[i].y, nodeVectors[i].z,
            nodeVectors[j].x, nodeVectors[j].y, nodeVectors[j].z
          );
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });
    const constellationLines = new THREE.LineSegments(lineGeo, lineMat);
    rootGroup.add(constellationLines);

    // 4. Holographic Gyroscope Orbital Rings & Geometric Wireframe Core
    const gyroGroup = new THREE.Group();
    rootGroup.add(gyroGroup);

    // Central Wireframe Icosahedron
    const icosaGeo = new THREE.IcosahedronGeometry(1.25, 1);
    const icosaMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const icosaMesh = new THREE.Mesh(icosaGeo, icosaMat);
    gyroGroup.add(icosaMesh);

    // 5 Concentric Tilted Torus Rings
    const ringGroup = new THREE.Group();
    gyroGroup.add(ringGroup);

    for (let i = 0; i < 5; i++) {
      const ringGeo = new THREE.TorusGeometry(1.6 + i * 0.22, 0.008 + i * 0.0015, 6, 96);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x00e5ff : 0x38bdf8,
        transparent: true,
        opacity: 0.22,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.set(Math.PI / 2 + i * 0.16, i * 0.24, 0);
      ringGroup.add(ringMesh);
    }

    // Sweeping Laser Radar Plane
    const radarGeo = new THREE.PlaneGeometry(4.4, 0.02);
    const radarMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const radarPlane = new THREE.Mesh(radarGeo, radarMat);
    gyroGroup.add(radarPlane);

    // 5. Ambient Celestial Dust Starfield
    const STAR_COUNT = 1600;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 36;
      starPositions[i + 1] = (Math.random() - 0.5) * 36;
      starPositions[i + 2] = (Math.random() - 0.5) * 36;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x64748b,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 6. Listeners: Scroll, Mouse Fluid Displacement & Click Shockwave
    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      progressRef.current = window.scrollY / maxScroll;
    };

    const handleMouseMove = (e: MouseEvent) => {
      pointerRef.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.targetY = -((e.clientY / window.innerHeight) * 2 - 1);
      mouseScreenRef.x = pointerRef.targetX * 3.5;
      mouseScreenRef.y = pointerRef.targetY * 2.2;
    };

    const handleClick = (e: MouseEvent) => {
      shockwaveRef.originX = (e.clientX / window.innerWidth) * 2 - 1;
      shockwaveRef.originY = -((e.clientY / window.innerHeight) * 2 - 1);
      shockwaveRef.radius = 0.1;
      shockwaveRef.intensity = 1.0;
      shockwaveRef.active = true;
    };

    const handleModeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ mode: "FLUID" | "VORTEX" | "LATTICE" }>;
      if (customEvent.detail?.mode) {
        modeState.current = customEvent.detail.mode;
      }
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      particleMat.uniforms.uPixelDensity.value = Math.min(window.devicePixelRatio, 1.75);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("click", handleClick);
    window.addEventListener("portfolio:sim-mode", handleModeEvent);
    window.addEventListener("resize", handleResize);

    handleScroll();

    // 7. High-Performance Physics Animation Loop
    const clock = new THREE.Clock();
    const pos = particleGeo.attributes.position.array as Float32Array;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const p = progressRef.current;

      // Smooth pointer damping
      pointerRef.x += (pointerRef.targetX - pointerRef.x) * 0.045;
      pointerRef.y += (pointerRef.targetY - pointerRef.y) * 0.045;

      // Fluid Camera travel along cinematic spline curve
      const isMobile = width < 768;
      const cameraTravel = isMobile ? 0.45 : 0.85;
      const targetCamX = Math.sin(p * Math.PI * 3.5) * cameraTravel + pointerRef.x * 0.28;
      const targetCamY = Math.cos(p * Math.PI * 2.2) * 0.38 + pointerRef.y * 0.18;
      const targetCamZ = 7.8 - Math.sin(p * Math.PI) * 1.5;

      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ - camera.position.z) * 0.04;
      camera.lookAt(0, 0, 0);

      // World tilt with smooth inertia
      rootGroup.rotation.y = Math.sin(time * 0.08) * 0.12 + pointerRef.x * 0.045;
      rootGroup.rotation.x = Math.cos(time * 0.06) * 0.08 + pointerRef.y * 0.035;

      // Smooth mode blending (FLUID / VORTEX / LATTICE)
      const targetTorus = modeState.current === "FLUID" ? 1 : 0;
      const targetVortex = modeState.current === "VORTEX" ? 1 : 0;
      const targetLattice = modeState.current === "LATTICE" ? 1 : 0;

      modeState.blendTorus += (targetTorus - modeState.blendTorus) * 0.06;
      modeState.blendVortex += (targetVortex - modeState.blendVortex) * 0.06;
      modeState.blendLattice += (targetLattice - modeState.blendLattice) * 0.06;

      // Update Shockwave Ripple
      if (shockwaveRef.active) {
        shockwaveRef.radius += 0.14;
        shockwaveRef.intensity *= 0.94;
        if (shockwaveRef.radius > 6.5 || shockwaveRef.intensity < 0.02) {
          shockwaveRef.active = false;
        }
      }

      // Physics Displacement Tick (Fluid Wake + Shockwave)
      const mouseX = mouseScreenRef.x;
      const mouseY = mouseScreenRef.y;
      const hasShock = shockwaveRef.active;
      const shockR = shockwaveRef.radius;
      const shockI = shockwaveRef.intensity;
      const shockOX = shockwaveRef.originX * 3.5;
      const shockOY = shockwaveRef.originY * 2.2;

      for (let i = 0; i < POINT_COUNT; i++) {
        const i3 = i * 3;

        // Base target position blended across active physics modes
        const tx =
          posFluid[i3] * modeState.blendTorus +
          posVortex[i3] * modeState.blendVortex +
          posLattice[i3] * modeState.blendLattice;
        const ty =
          posFluid[i3 + 1] * modeState.blendTorus +
          posVortex[i3 + 1] * modeState.blendVortex +
          posLattice[i3 + 1] * modeState.blendLattice;
        const tz =
          posFluid[i3 + 2] * modeState.blendTorus +
          posVortex[i3 + 2] * modeState.blendVortex +
          posLattice[i3 + 2] * modeState.blendLattice;

        // 1. Fluid Mouse Displacement (Magnetic Wake)
        const dx = pos[i3] - mouseX;
        const dy = pos[i3 + 1] - mouseY;
        const distSq = dx * dx + dy * dy;
        let repelX = 0;
        let repelY = 0;

        if (distSq < 2.5 && distSq > 0.001) {
          const dist = Math.sqrt(distSq);
          const force = (1.0 - dist / 1.58) * 0.35;
          repelX = (dx / dist) * force;
          repelY = (dy / dist) * force;
        }

        // 2. Click Shockwave blast wave
        let blastX = 0;
        let blastY = 0;
        let blastZ = 0;
        if (hasShock) {
          const sdx = pos[i3] - shockOX;
          const sdy = pos[i3 + 1] - shockOY;
          const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
          const diff = Math.abs(sdist - shockR);
          if (diff < 0.6) {
            const blastForce = (1.0 - diff / 0.6) * shockI * 0.45;
            blastX = (sdx / (sdist || 1)) * blastForce;
            blastY = (sdy / (sdist || 1)) * blastForce;
            blastZ = (seeded(i, 8) - 0.5) * blastForce * 0.8;
          }
        }

        // Spring return toward target
        pos[i3] += (tx + repelX + blastX - pos[i3]) * 0.08;
        pos[i3 + 1] += (ty + repelY + blastY - pos[i3 + 1]) * 0.08;
        pos[i3 + 2] += (tz + blastZ - pos[i3 + 2]) * 0.08;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Update shader time & opacity
      particleMat.uniforms.uTime.value = time;
      particleMat.uniforms.uOpacity.value = 0.65 + Math.sin(time * 1.4) * 0.15;

      // Constellation Lines Rotation & Visibility
      const networkShow = smoothstep(0.05, 0.28, p) * (1 - smoothstep(0.68, 0.92, p));
      lineMat.opacity = networkShow * 0.24;
      constellationLines.rotation.y = time * 0.025;

      // Gyroscope Core Rotation & Sweeping Radar Line
      const coreShow = smoothstep(0.24, 0.52, p);
      gyroGroup.visible = coreShow > 0.01;
      gyroGroup.scale.setScalar(0.72 + coreShow * 0.35);
      gyroGroup.rotation.y = time * 0.16 + p * 2.2;
      gyroGroup.rotation.x = Math.sin(time * 0.22) * 0.14;

      radarPlane.position.y = Math.sin(time * 1.5) * 1.4;

      ringGroup.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh;
        mesh.rotation.z = time * (0.12 + i * 0.038) * (i % 2 === 0 ? 1 : -1);
      });

      // Starfield slow drift
      starPoints.rotation.y = time * 0.012;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("portfolio:sim-mode", handleModeEvent);
      window.removeEventListener("resize", handleResize);

      particleGeo.dispose();
      particleMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      icosaGeo.dispose();
      icosaMat.dispose();
      radarGeo.dispose();
      radarMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="cinematic-canvas-shell"
      aria-hidden="true"
    />
  );
}
