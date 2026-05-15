import { useEffect, useRef } from 'react';

export function TechWaves() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Wave configuration
    interface Wave {
      amplitude: number;
      frequency: number;
      speed: number;
      yOffset: number;
      color: string;
      opacity: number;
    }

    const waves: Wave[] = [
      {
        amplitude: 60,
        frequency: 0.008,
        speed: 0.002,
        yOffset: 0.3,
        color: 'rgba(99, 102, 241, 0.3)', // Indigo
        opacity: 0.3,
      },
      {
        amplitude: 50,
        frequency: 0.01,
        speed: 0.003,
        yOffset: 0.4,
        color: 'rgba(139, 92, 246, 0.25)', // Purple
        opacity: 0.25,
      },
      {
        amplitude: 40,
        frequency: 0.012,
        speed: 0.0025,
        yOffset: 0.5,
        color: 'rgba(59, 130, 246, 0.2)', // Blue
        opacity: 0.2,
      },
      {
        amplitude: 35,
        frequency: 0.015,
        speed: 0.0035,
        yOffset: 0.6,
        color: 'rgba(20, 184, 166, 0.15)', // Teal
        opacity: 0.15,
      },
      {
        amplitude: 30,
        frequency: 0.018,
        speed: 0.004,
        yOffset: 0.7,
        color: 'rgba(6, 182, 212, 0.1)', // Cyan
        opacity: 0.1,
      },
    ];

    // Floating particles
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }

    const particles: Particle[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const animate = () => {
      time += 1;

      const w = canvas.width;
      const h = canvas.height;

      // Clear with light gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      gradient.addColorStop(0, '#0f172a'); // Dark slate
      gradient.addColorStop(0.5, '#1e1b4b'); // Dark indigo
      gradient.addColorStop(1, '#0f172a'); // Dark slate
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Draw waves
      waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.moveTo(0, h);

        for (let x = 0; x <= w; x += 5) {
          const y =
            h * wave.yOffset +
            Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
            Math.sin(x * wave.frequency * 0.5 + time * wave.speed * 0.7) * (wave.amplitude * 0.5);

          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.closePath();

        // Create gradient for wave
        const waveGradient = ctx.createLinearGradient(0, h * wave.yOffset - wave.amplitude, 0, h);
        waveGradient.addColorStop(0, wave.color.replace('0.3', '0.4').replace('0.25', '0.35').replace('0.2', '0.3').replace('0.15', '0.25').replace('0.1', '0.2'));
        waveGradient.addColorStop(1, 'transparent');

        ctx.fillStyle = waveGradient;
        ctx.fill();

        // Add glow effect
        ctx.shadowColor = wave.color;
        ctx.shadowBlur = 20;
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // Draw floating particles
      particles.forEach((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Wrap around screen
        if (particle.x < 0) particle.x = w;
        if (particle.x > w) particle.x = 0;
        if (particle.y < 0) particle.y = h;
        if (particle.y > h) particle.y = 0;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${particle.opacity})`;
        ctx.fill();

        // Glow effect for larger particles
        if (particle.size > 2) {
          ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
