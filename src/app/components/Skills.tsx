import { useState } from 'react';
import { motion } from 'motion/react';

interface Skill {
  name: string;
  category: 'frontend' | 'backend' | 'devops' | 'ai' | 'design';
}

const skillsData: Skill[] = [
  { name: 'Python', category: 'backend' },
  { name: 'C/C++', category: 'backend' },
  { name: 'Algorithms', category: 'backend' },
  { name: 'Linux', category: 'devops' },
  { name: 'React', category: 'frontend' },
  { name: 'TypeScript', category: 'frontend' },
  { name: 'Next.js', category: 'frontend' },
  { name: 'Tailwind CSS', category: 'frontend' },
  { name: 'Node.js', category: 'backend' },
  { name: 'PostgreSQL', category: 'backend' },
  { name: 'MongoDB', category: 'backend' },
  { name: 'GraphQL', category: 'backend' },
  { name: 'AWS', category: 'devops' },
  { name: 'Docker', category: 'devops' },
  { name: 'Git', category: 'devops' },
  { name: 'Performance', category: 'frontend' },
  { name: 'Figma', category: 'design' },
  { name: 'UI/UX Design', category: 'design' },
  { name: 'Accessibility', category: 'frontend' },
  { name: 'Web Performance', category: 'frontend' },
  { name: 'Machine Learning', category: 'ai' },
  { name: 'Data Science', category: 'ai' },
  { name: 'Cybersecurity', category: 'ai' },
  { name: 'Robotics', category: 'ai' },
];

const categoryColors = {
  frontend: '#3b82f6',
  backend: '#8b5cf6',
  devops: '#06b6d4',
  ai: '#ec4899',
  design: '#f59e0b',
};

function TextScramble({ text, isActive }: { text: string; isActive: boolean }) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';

  const animate = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    let iterations = 0;
    const maxIterations = text.length + 5;

    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iterations) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      iterations += 1/3;

      if (iterations >= maxIterations) {
        clearInterval(interval);
        setDisplayText(text);
        setIsAnimating(false);
      }
    }, 30);
  };

  if (isActive && !isAnimating) {
    animate();
  }

  return <span className="inline-block w-full text-center">{displayText}</span>;
}

export function Skills() {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  return (
    <section id="skills" className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl mb-3 text-white/90 tracking-tight">
            Skills & Tools
          </h2>
          <p className="text-gray-400/70 text-sm max-w-xl">
            Technologies I work with
          </p>
        </motion.div>

        {/* Skills Grid */}
        <div className="flex flex-wrap gap-2">
          {skillsData.map((skill, index) => {
            const color = categoryColors[skill.category];
            const isHovered = hoveredSkill === skill.name;

            return (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.01,
                }}
                onMouseEnter={() => setHoveredSkill(skill.name)}
                onMouseLeave={() => setHoveredSkill(null)}
                className="relative"
              >
                <motion.div
                  animate={{
                    backgroundColor: isHovered ? `${color}20` : 'transparent',
                  }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-2 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer"
                  style={{
                    minWidth: '100px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="text-sm text-gray-300 hover:text-white transition-colors font-mono">
                    <TextScramble text={skill.name} isActive={isHovered} />
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}