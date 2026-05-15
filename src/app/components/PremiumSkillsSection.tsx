import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

interface PremiumSkillBarProps {
  name: string;
  level: number;
  delay?: number;
}

export function PremiumSkillBar({ name, level, delay = 0 }: PremiumSkillBarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const width = useTransform(scrollYProgress, [0, 0.5], [0, level]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      className="mb-6"
    >
      <div className="flex justify-between mb-2">
        <span className="text-white font-medium">{name}</span>
        <motion.span
          className="text-purple-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {level}%
        </motion.span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full"
          style={{ width }}
        >
          <motion.div
            className="h-full w-full"
            animate={{
              backgroundPosition: ["0%", "100%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
              backgroundSize: "200% 100%",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

interface PremiumSkillsSectionProps {
  skills: Array<{ name: string; level: number }>;
  title?: string;
}

export function PremiumSkillsSection({
  skills,
  title = "Technical Skills",
}: PremiumSkillsSectionProps) {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-white mb-12 text-center"
        >
          <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {title}
          </span>
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8">
          {skills.map((skill, index) => (
            <PremiumSkillBar
              key={skill.name}
              name={skill.name}
              level={skill.level}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
