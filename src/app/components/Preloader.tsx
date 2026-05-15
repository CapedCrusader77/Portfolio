import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useRef } from "react";

export function Preloader() {
  const [isVisible, setIsVisible] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);

    // Disable scrolling when preloader is visible
    document.body.style.overflow = 'hidden';

    // Set video playback speed to 1.8x
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.8;
    }

    return () => {
      // Re-enable scrolling when preloader is removed
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleVideoEnd = () => {
    // Re-enable scrolling immediately when video ends
    document.body.style.overflow = 'auto';

    // Start fade out when video ends
    setTimeout(() => {
      setIsVisible(false);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleVideoEnd}
            className="w-full h-full object-cover"
          >
            <source src="/Loading page.mp4" type="video/mp4" />
          </video>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
