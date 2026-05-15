import { useEffect, useRef, useState } from 'react';

export function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dynamic import Three.js
    import('three').then(({ default: THREE }) => {
      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Reduced from 2 for better performance
      container.appendChild(renderer.domElement);

      setIsLoaded(true);

      // Create enhanced particles
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 2000; // Reduced from 5000
      const posArray = new Float32Array(particlesCount * 3);
      const colorsArray = new Float32Array(particlesCount * 3);
      const sizesArray = new Float32Array(particlesCount);
      const velocitiesArray = new Float32Array(particlesCount * 3);
      const originalPosArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i += 3) {
        // Position - wider spread
        posArray[i] = (Math.random() - 0.5) * 15;
        posArray[i + 1] = (Math.random() - 0.5) * 15;
        posArray[i + 2] = (Math.random() - 0.5) * 15;

        // Store original positions
        originalPosArray[i] = posArray[i];
        originalPosArray[i + 1] = posArray[i + 1];
        originalPosArray[i + 2] = posArray[i + 2];

        // Velocities for particle movement
        velocitiesArray[i] = (Math.random() - 0.5) * 0.01;
        velocitiesArray[i + 1] = (Math.random() - 0.5) * 0.01;
        velocitiesArray[i + 2] = (Math.random() - 0.5) * 0.01;

        // Colors - more vibrant gradient (cyan to purple to pink)
        const t = Math.random();
        const colorChoice = Math.random();
        if (colorChoice < 0.33) {
          // Cyan
          colorsArray[i] = 0.0;
          colorsArray[i + 1] = 0.5 + t * 0.5;
          colorsArray[i + 2] = 0.8 + t * 0.2;
        } else if (colorChoice < 0.66) {
          // Purple
          colorsArray[i] = 0.4 + t * 0.4;
          colorsArray[i + 1] = 0.2 + t * 0.3;
          colorsArray[i + 2] = 0.8 + t * 0.2;
        } else {
          // Pink
          colorsArray[i] = 0.8 + t * 0.2;
          colorsArray[i + 1] = 0.2 + t * 0.3;
          colorsArray[i + 2] = 0.5 + t * 0.3;
        }

        // Sizes - varied
        sizesArray[i / 3] = Math.random() * 3 + 1;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));
      particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizesArray, 1));

      // Custom shader material for better particle rendering
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });

      const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
      scene.add(particlesMesh);

      // Create floating geometric shapes with more variety
      const shapes: THREE.Mesh[] = [];
      const shapeGeometries = [
        new THREE.IcosahedronGeometry(0.4, 0),
        new THREE.OctahedronGeometry(0.35, 0),
        new THREE.TetrahedronGeometry(0.3, 0),
      ];

      const shapeColors = [0x6366f1, 0x8b5cf6, 0xec4899];

      for (let i = 0; i < 10; i++) { // Reduced from 25
        const geometry = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)];
        const color = shapeColors[Math.floor(Math.random() * shapeColors.length)];
        const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
          color,
          wireframe: true,
          transparent: true,
          opacity: 0.4,
        }));

        mesh.position.set(
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12
        );

        mesh.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );

        mesh.userData = {
          rotationSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02,
          },
          floatSpeed: Math.random() * 0.8 + 0.3,
          floatOffset: Math.random() * Math.PI * 2,
          originalScale: 1,
        };

        shapes.push(mesh);
        scene.add(mesh);
      }

      // Create connecting lines between nearby particles
      const linesGeometry = new THREE.BufferGeometry();
      const linesMaterial = new THREE.LineBasicMaterial({
        color: 0x6366f1,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
      });

      const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
      scene.add(linesMesh);

      // Create click ripple effect
      const rippleGeometry = new THREE.RingGeometry(0.1, 0.15, 32);
      const rippleMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });

      const ripples: THREE.Mesh[] = [];

      const createRipple = (position: THREE.Vector3) => {
        const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial.clone());
        ripple.position.copy(position);
        ripple.userData = {
          age: 0,
          maxAge: 60,
        };
        ripples.push(ripple);
        scene.add(ripple);
      };

      camera.position.z = 6;

      // Mouse interaction
      const mouse = { x: 0, y: 0, z: 0 };
      const targetRotation = { x: 0, y: 0 };
      const mouseWorldPos = new THREE.Vector3();

      const handleMouseMove = (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        targetRotation.x = mouse.y * 0.4;
        targetRotation.y = mouse.x * 0.4;

        // Calculate mouse position in 3D space
        mouseWorldPos.set(mouse.x, mouse.y, 0.5);
        mouseWorldPos.unproject(camera);
        const dir = mouseWorldPos.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        mouseWorldPos.copy(camera.position).add(dir.multiplyScalar(distance));
      };

      const handleClick = (event: MouseEvent) => {
        // Create ripple at click position
        const clickX = (event.clientX / window.innerWidth) * 2 - 1;
        const clickY = -(event.clientY / window.innerHeight) * 2 + 1;

        const clickPos = new THREE.Vector3(clickX, clickY, 0.5);
        clickPos.unproject(camera);
        const dir = clickPos.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        clickPos.copy(camera.position).add(dir.multiplyScalar(distance));

        createRipple(clickPos);

        // Push nearby particles away
        const positions = particlesGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < particlesCount; i++) {
          const i3 = i * 3;
          const px = positions[i3];
          const py = positions[i3 + 1];
          const pz = positions[i3 + 2];

          const dx = px - clickPos.x;
          const dy = py - clickPos.y;
          const dz = pz - clickPos.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 3) {
            const force = (3 - dist) * 0.1;
            velocitiesArray[i3] += (dx / dist) * force;
            velocitiesArray[i3 + 1] += (dy / dist) * force;
            velocitiesArray[i3 + 2] += (dz / dist) * force;
          }
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick);

      // Scroll interaction
      let scrollY = 0;
      const handleScroll = () => {
        scrollY = window.scrollY;
        camera.position.z = 6 + scrollY * 0.002;
      };
      window.addEventListener('scroll', handleScroll);

      // Handle resize
      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);

      // Animation loop
      let time = 0;
      const animate = () => {
        requestAnimationFrame(animate);
        time += 0.01;

        // Smooth camera rotation
        particlesMesh.rotation.x += (targetRotation.x - particlesMesh.rotation.x) * 0.03;
        particlesMesh.rotation.y += (targetRotation.y - particlesMesh.rotation.y) * 0.03;

        // Animate particles with mouse interaction - optimized
        const positions = particlesGeometry.attributes.position.array as Float32Array;
        const colors = particlesGeometry.attributes.color.array as Float32Array;

        // Only update every other particle for better performance
        for (let i = 0; i < particlesCount; i += 2) {
          const i3 = i * 3;

          // Mouse attraction/repulsion
          const dx = positions[i3] - mouseWorldPos.x;
          const dy = positions[i3 + 1] - mouseWorldPos.y;
          const dz = positions[i3 + 2] - mouseWorldPos.z;
          const distSquared = dx * dx + dy * dy + dz * dz;

          if (distSquared < 4 && distSquared > 0.01) {
            // Gentle attraction to mouse
            const dist = Math.sqrt(distSquared);
            const force = 0.001;
            velocitiesArray[i3] -= (dx / dist) * force;
            velocitiesArray[i3 + 1] -= (dy / dist) * force;
            velocitiesArray[i3 + 2] -= (dz / dist) * force;

            // Brighten particles near mouse
            colors[i3] = Math.min(1, colors[i3] + 0.01);
            colors[i3 + 1] = Math.min(1, colors[i3 + 1] + 0.01);
            colors[i3 + 2] = Math.min(1, colors[i3 + 2] + 0.01);
          }

          // Apply velocity
          positions[i3] += velocitiesArray[i3];
          positions[i3 + 1] += velocitiesArray[i3 + 1];
          positions[i3 + 2] += velocitiesArray[i3 + 2];

          // Damping
          velocitiesArray[i3] *= 0.98;
          velocitiesArray[i3 + 1] *= 0.98;
          velocitiesArray[i3 + 2] *= 0.98;

          // Return to original position slowly
          positions[i3] += (originalPosArray[i3] - positions[i3]) * 0.001;
          positions[i3 + 1] += (originalPosArray[i3 + 1] - positions[i3 + 1]) * 0.001;
          positions[i3 + 2] += (originalPosArray[i3 + 2] - positions[i3 + 2]) * 0.001;

          // Subtle wave motion
          positions[i3 + 1] += Math.sin(time + positions[i3] * 0.5) * 0.003;

          // Color cycling
          const hueShift = Math.sin(time * 0.1 + i * 0.01) * 0.02;
          colors[i3] = Math.max(0, Math.min(1, colors[i3] + hueShift));
          colors[i3 + 1] = Math.max(0, Math.min(1, colors[i3 + 1] + hueShift));
          colors[i3 + 2] = Math.max(0, Math.min(1, colors[i3 + 2] + hueShift));
        }

        particlesGeometry.attributes.position.needsUpdate = true;
        particlesGeometry.attributes.color.needsUpdate = true;

        // Animate shapes
        shapes.forEach((shape) => {
          shape.rotation.x += shape.userData.rotationSpeed.x;
          shape.rotation.y += shape.userData.rotationSpeed.y;
          shape.rotation.z += shape.userData.rotationSpeed.z;

          // Floating effect
          shape.position.y += Math.sin(time * shape.userData.floatSpeed + shape.userData.floatOffset) * 0.003;

          // Scale pulse
          const scale = shape.userData.originalScale + Math.sin(time * 2 + shape.userData.floatOffset) * 0.1;
          shape.scale.set(scale, scale, scale);

          // Mouse interaction with shapes
          const dx = shape.position.x - mouseWorldPos.x;
          const dy = shape.position.y - mouseWorldPos.y;
          const dz = shape.position.z - mouseWorldPos.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 2) {
            shape.rotation.x += 0.05;
            shape.rotation.y += 0.05;
          }
        });

        // Update connecting lines - optimized with distance check and limit
        const linePositions: number[] = [];
        const maxDistance = 1.5; // Increased to reduce line count
        const maxLines = 500; // Limit total lines for performance

        let lineCount = 0;
        for (let i = 0; i < particlesCount && lineCount < maxLines; i++) {
          for (let j = i + 1; j < particlesCount && lineCount < maxLines; j++) {
            const i3 = i * 3;
            const j3 = j * 3;

            const dx = positions[i3] - positions[j3];
            const dy = positions[i3 + 1] - positions[j3 + 1];
            const dz = positions[i3 + 2] - positions[j3 + 2];
            const distanceSquared = dx * dx + dy * dy + dz * dz;

            if (distanceSquared < maxDistance * maxDistance) {
              linePositions.push(
                positions[i3], positions[i3 + 1], positions[i3 + 2],
                positions[j3], positions[j3 + 1], positions[j3 + 2]
              );
              lineCount++;
            }
          }
        }

        linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));

        // Animate ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          const ripple = ripples[i];
          ripple.userData.age++;

          const progress = ripple.userData.age / ripple.userData.maxAge;
          const scale = 1 + progress * 5;
          ripple.scale.set(scale, scale, scale);
          (ripple.material as THREE.Material).opacity = 0.8 * (1 - progress);

          if (ripple.userData.age >= ripple.userData.maxAge) {
            scene.remove(ripple);
            (ripple.geometry as THREE.BufferGeometry).dispose();
            (ripple.material as THREE.Material).dispose();
            ripples.splice(i, 1);
          }
        }

        renderer.render(scene, camera);
      };

      animate();

      // Cleanup
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('click', handleClick);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        container.removeChild(renderer.domElement);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        linesGeometry.dispose();
        linesMaterial.dispose();
        rippleGeometry.dispose();
        rippleMaterial.dispose();
        shapes.forEach(shape => {
          shape.geometry.dispose();
          (shape.material as THREE.Material).dispose();
        });
        ripples.forEach(ripple => {
          (ripple.geometry as THREE.BufferGeometry).dispose();
          (ripple.material as THREE.Material).dispose();
        });
      };
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
