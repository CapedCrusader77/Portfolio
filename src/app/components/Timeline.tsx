import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { useRef, useMemo } from "react";
import { LucideIcon } from "lucide-react";
import { ScrollRevealSection } from "./ScrollRevealSection";

interface TimelineItem {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  description: string;
  badge?: string;
  icon?: LucideIcon;
  accent?: "cyan" | "purple" | "blue";
}

interface TimelineProps {
  items: TimelineItem[];
  title?: string;
  subtitle?: string;
}

const accentConfig = {
  blue: {
    dot: "bg-blue-500",
    badge: "border-blue-500 text-blue-400",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
    line: "from-blue-500",
    card: "from-blue-500/10 to-blue-500/5"
  },
  purple: {
    dot: "bg-purple-500",
    badge: "border-purple-500 text-purple-400",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    line: "from-purple-500",
    card: "from-purple-500/10 to-purple-500/5"
  },
  cyan: {
    dot: "bg-cyan-500",
    badge: "border-cyan-500 text-cyan-400",
    glow: "shadow-[0_0_20px_rgba(34,211,238,0.5)]",
    line: "from-cyan-500",
    card: "from-cyan-500/10 to-cyan-500/5"
  }
};

export function Timeline({ items, title = "Timeline", subtitle = "My journey" }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 40%", "end 80%"]
  });

  const smoothLineProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  const lineHeight = useTransform(smoothLineProgress, [0, 1], ["0%", "100%"]);

  const accentedItems = useMemo(() => {
    const accents: Array<"blue" | "purple" | "cyan"> = ["cyan", "purple", "blue"];
    return items.map((item, index) => ({
      ...item,
      accent: (item.accent || accents[index % accents.length]) as "cyan" | "purple" | "blue"
    }));
  }, [items]);

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative py-32 px-6 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 60, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/3 -left-1/3 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <ScrollRevealSection direction="up" distance={30} blur={true}>
          <div className="mb-24 text-center">
            <h2 className="text-4xl md:text-5xl mb-4 text-white/90 tracking-tight font-bold">
              {title}
            </h2>
            <p className="text-gray-400/70 text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>
        </ScrollRevealSection>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/[0.1] -translate-x-1/2">
            <motion.div
              style={{ height: lineHeight }}
              className="w-full bg-gradient-to-b from-cyan-500 via-purple-500 to-blue-500"
            />
          </div>

          {/* Items */}
          <div className="space-y-16">
            {accentedItems.map((item, index) => {
              const config = accentConfig[item.accent];
              const isRight = index % 2 === 1;

              return (
                <ScrollRevealSection
                  key={item.id}
                  direction={isRight ? "right" : "left"}
                  distance={60}
                  scale={0.95}
                  blur={true}
                  rotateY={isRight ? -10 : 10}
                  className={`flex items-center gap-8 ${isRight ? "flex-row" : "flex-row-reverse"}`}
                >
                  {/* Content side */}
                  <div className="flex-1">
                    <motion.div
                      whileHover={{ y: -3 }}
                      className={`bg-gradient-to-br ${config.card} border border-white/[0.08] hover:border-white/[0.15] rounded-2xl p-6 backdrop-blur-sm transition-all duration-300`}
                    >
                      <div className={`text-${isRight ? "right" : "left"}`}>
                        {/* Badge with date */}
                        <div className="flex items-center gap-3 mb-3" style={{ justifyContent: isRight ? "flex-end" : "flex-start" }}>
                          {item.badge && (
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className={`text-xs font-semibold px-3 py-1 border rounded-full ${config.badge}`}
                            >
                              {item.badge}
                            </motion.span>
                          )}
                          <span className="text-sm text-gray-500">{item.date}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                          {item.title}
                        </h3>

                        {/* Subtitle */}
                        {item.subtitle && (
                          <p className="text-sm text-gray-400 mb-3">
                            {item.subtitle}
                          </p>
                        )}

                        {/* Description */}
                        <p className="text-sm text-gray-400/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: item.description }} />
                      </div>
                    </motion.div>
                  </div>

                  {/* Center dot */}
                  <div className="flex-shrink-0 flex items-center justify-center z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1 + 0.1,
                        ease: "easeOut"
                      }}
                      className={`relative w-5 h-5 rounded-full ${config.dot} ${config.glow}`}
                    >
                      <motion.div
                        animate={{ scale: [1, 2, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                        className={`absolute inset-0 rounded-full ${config.dot}`}
                      />
                    </motion.div>
                  </div>

                  {/* Empty side */}
                  <div className="flex-1" />
                </ScrollRevealSection>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
