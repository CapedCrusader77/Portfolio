import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

  const TOTAL_FRAMES = 203;
  const FRAME_TO_REVEAL_TEXT = 100;

export function ScrollSequence() {
  // Robot animation refs
  const robotContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const textOverlayRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);
  const [frames, setFrames] = useState<HTMLImageElement[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [hasStartedScrolling, setHasStartedScrolling] = useState(false);

  // Animation state refs
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const autoScrollIntervalRef = useRef<number | null>(null);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load robot frames in parallel
  useEffect(() => {
    const loadFrames = async () => {
      const framePromises = Array.from({ length: TOTAL_FRAMES }, async (_, i) => {
        const num = String(i + 1).padStart(3, '0');
        const img = new Image();
        // Enable high quality rendering
        img.src = `/robot-frames/ezgif-frame-${num}.jpg`;
        img.style.imageRendering = 'auto';
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
        return img;
      });

      const loadedFrames = await Promise.all(framePromises);
      setFrames(loadedFrames);
      setIsReady(true);
    };

    loadFrames();
  }, []);

  // Setup robot animation
  useEffect(() => {
    if (!isReady || !canvasRef.current || !robotContainerRef.current) return;

    // Set initial states
    if (textOverlayRef.current) {
      textOverlayRef.current.style.opacity = '1';
    }
    if (titleRef.current) {
      titleRef.current.style.opacity = '0';
    }
    if (subtextRef.current) {
      subtextRef.current.style.opacity = '0';
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const drawFrame = (frameIndex: number) => {
      if (!ctx) return;

      const index = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.floor(frameIndex)));

      if (index >= frames.length) return;

      const frame = frames[index];
      if (!frame || frame.width === 0) return;

      // Use display dimensions for calculations
      const displayWidth = canvas.width / (window.devicePixelRatio || 1);
      const displayHeight = canvas.height / (window.devicePixelRatio || 1);

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Use cover fit for better quality
      const scale = Math.max(displayWidth / frame.width, displayHeight / frame.height);
      const x = (displayWidth - frame.width * scale) / 2;
      const y = (displayHeight - frame.height * scale) / 2;

      try {
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(frame, x, y, frame.width * scale, frame.height * scale);
      } catch (e) {
        console.error('Canvas drawing error:', e);
      }
    };

    const animate = () => {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;

      const diff = target - current;
      if (Math.abs(diff) > 0.01) {
        const lerpFactor = 0.15; // Even faster lerp
        currentFrameRef.current += diff * lerpFactor;
        drawFrame(currentFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const updateCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);

      // Re-enable high quality image smoothing after resize
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      currentFrameRef.current = 50;
      targetFrameRef.current = 50;

      // Reset canvas styles on resize
      if (canvasRef.current) {
        canvasRef.current.style.opacity = '1';
        canvasRef.current.style.filter = 'none';
      }

      drawFrame(50);
    };

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    ctx.scale(dpr, dpr);

    // Re-enable high quality image smoothing after scale
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    currentFrameRef.current = 50;
    targetFrameRef.current = 50;

    // Set initial canvas styles
    if (canvasRef.current) {
      canvasRef.current.style.opacity = '1';
      canvasRef.current.style.filter = 'none';
    }

    drawFrame(50);

    window.addEventListener('resize', updateCanvasSize);

    // Auto-scroll functionality
    let autoScrollProgress = 0.25; // Start from middle (frame 50)
    const autoScrollSpeed = 0.003; // Speed of auto-scroll

    const startAutoScroll = () => {
      if (autoScrollIntervalRef.current) return;

      autoScrollIntervalRef.current = window.setInterval(() => {
        autoScrollProgress += autoScrollSpeed;

        if (autoScrollProgress >= 1) {
          // Stop auto-scroll when complete
          if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
          }
          return;
        }

        // Update target frame based on auto-scroll progress
        targetFrameRef.current = autoScrollProgress * (TOTAL_FRAMES - 1);

        // Update visual effects - start from blurred state
        const progressFromStart = (autoScrollProgress - 0.25) / 0.75; // Normalize from 0.25 to 1
        const robotFadeIn = Math.min(1, Math.max(0.8, progressFromStart * 1.5));

        if (canvasRef.current) {
          canvasRef.current.style.opacity = robotFadeIn.toString();
          canvasRef.current.style.filter = 'none';
        }

        // Fade out portfolio text as auto-scrolling starts
        const portfolioFadeOut = Math.max(0, 1 - progressFromStart * 3);
        if (textOverlayRef.current) {
          textOverlayRef.current.style.opacity = portfolioFadeOut.toString();
        }

        // Fade in name text just before the end of scrolling
        const nameFadeIn = Math.max(0, Math.min(1, (progressFromStart - 0.6) * 3));
        if (titleRef.current) {
          titleRef.current.style.opacity = nameFadeIn.toString();
        }
        if (subtextRef.current) {
          subtextRef.current.style.opacity = nameFadeIn.toString();
        }

        const fadeStart = 0.8;
        const fadeProgress = Math.max(0, (autoScrollProgress - fadeStart) / (1 - fadeStart));

        if (overlayRef.current) {
          overlayRef.current.style.opacity = fadeProgress.toString();
        }

        setHasStartedScrolling(true);
      }, 16); // ~60fps
    };

    // Start auto-scroll after a short delay
    const autoScrollTimeout = setTimeout(() => {
      startAutoScroll();
    }, 500);

    ScrollTrigger.create({
      trigger: robotContainerRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1, // Reduced from 2 for snappier response
      pin: true,
      pinSpacing: false,
      onUpdate: (self) => {
        if (self.progress > 0.01 && !hasStartedScrolling) {
          setHasStartedScrolling(true);
        }

        targetFrameRef.current = self.progress * (TOTAL_FRAMES - 1);

        // Update visual effects - handle initial blurred state
        const robotFadeIn = Math.min(1, Math.max(0.8, self.progress * 1.5));

        if (canvasRef.current) {
          canvasRef.current.style.opacity = robotFadeIn.toString();
          canvasRef.current.style.filter = 'none';
        }

        // Fade out portfolio text as scrolling starts
        const portfolioFadeOut = Math.max(0, 1 - self.progress * 3);
        if (textOverlayRef.current) {
          textOverlayRef.current.style.opacity = portfolioFadeOut.toString();
        }

        // Fade in name text just before the end of scrolling
        const nameFadeIn = Math.max(0, Math.min(1, (self.progress - 0.7) * 4));
        if (titleRef.current) {
          titleRef.current.style.opacity = nameFadeIn.toString();
        }
        if (subtextRef.current) {
          subtextRef.current.style.opacity = nameFadeIn.toString();
        }

        const fadeStart = 0.8;
        const fadeProgress = Math.max(0, (self.progress - fadeStart) / (1 - fadeStart));

        if (overlayRef.current) {
          overlayRef.current.style.opacity = fadeProgress.toString();
        }
      },
    });

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
      }
      clearTimeout(autoScrollTimeout);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [isReady, frames, hasStartedScrolling]);

  return (
    <>
      {/* Robot Frame Scroll Sequence */}
      <div
        ref={robotContainerRef}
        className="relative w-full overflow-hidden"
        style={{ height: '400vh' }}
      >
        {/* Canvas for robot animation */}
        <canvas
          ref={canvasRef}
          className="fixed top-0 left-0 w-screen h-screen"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 10,
            opacity: 1,
            filter: 'none',
            imageRendering: 'auto',
            imageRendering: '-webkit-optimize-contrast',
          }}
        />

        {/* Initial Portfolio Text */}
        <div
          ref={textOverlayRef}
          className="fixed top-0 left-0 w-screen h-screen flex flex-col items-center justify-center pointer-events-none z-20"
          style={{
            opacity: 1,
          }}
        >
          <div
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight mb-4 text-center px-4"
            style={{
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)',
              fontWeight: 700,
            }}
          >
            MY PERSONAL PORTFOLIO
          </div>
          <div
            className="text-lg md:text-xl text-gray-400 animate-pulse"
          >
            Scroll to explore
          </div>
        </div>

        {/* Name Text Overlay - appears after scrolling */}
        <div
          className="fixed top-0 left-0 w-screen h-screen flex flex-col items-center justify-center pointer-events-none z-40"
        >
          {/* Title */}
          <div
            ref={titleRef}
            className="text-7xl md:text-8xl lg:text-9xl font-bold text-white tracking-tight mb-6 text-center px-4"
            style={{
              textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)',
              fontWeight: 700,
              opacity: 0,
            }}
          >
            Gokul. A
          </div>

          {/* Subtitle */}
          <div
            ref={subtextRef}
            className="text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-3xl mx-auto px-6 text-center"
            style={{
              textShadow: '0 1px 10px rgba(0, 0, 0, 0.6)',
              opacity: 0,
            }}
          >
            Building efficient algorithms and solving real-world problems through AI, robotics, and cybersecurity.
          </div>
        </div>

        {/* Fade overlay for smooth transition */}
        <div
          ref={overlayRef}
          className="fixed top-0 left-0 w-screen h-screen pointer-events-none z-30"
          style={{
            opacity: 0,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.8) 100%)',
          }}
        />
      </div>
    </>
  );
}
