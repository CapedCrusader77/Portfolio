import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScrollRevealSection } from './ScrollRevealSection';

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

const categories = [
  { id: 'all', label: 'All Technologies' },
  { id: 'ai', label: 'AI & Robotics' },
  { id: 'backend', label: 'Backend & Systems' },
  { id: 'frontend', label: 'Frontend' },
  { id: 'devops', label: 'DevOps & Git' },
  { id: 'design', label: 'UI/UX Design' }
];

export function Skills() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  const filteredSkills = selectedCategory === 'all'
    ? skillsData
    : skillsData.filter(skill => skill.category === selectedCategory);

  return (
    <section id="skills" className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <ScrollRevealSection direction="up" distance={30} blur={true}>
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl mb-3 text-white/90 tracking-tight font-bold">
              Skills & Tools
            </h2>
            <p className="text-gray-400/70 text-sm max-w-xl">
              Technologies I work with
            </p>
          </div>
        </ScrollRevealSection>

        {/* Categories Tabs */}
        <ScrollRevealSection direction="none" scale={0.95} blur={true} delay={0.1}>
          <div className="flex flex-wrap gap-2.5 mb-10">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 border-transparent text-white shadow-lg shadow-purple-500/20'
                    : 'bg-white/[0.02] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.05]'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </ScrollRevealSection>

        {/* Skills Grid */}
        <ScrollRevealSection direction="up" distance={40} scale={0.95} blur={true} delay={0.2}>
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
          >
            <AnimatePresence mode="popLayout">
              {filteredSkills.map((skill, index) => {
                const color = categoryColors[skill.category];
                const isHovered = hoveredSkill === skill.name;

                return (
                  <motion.div
                    key={skill.name}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setHoveredSkill(skill.name)}
                    onMouseLeave={() => setHoveredSkill(null)}
                    className="relative"
                  >
                    <motion.div
                      animate={{
                        backgroundColor: isHovered ? `${color}20` : 'rgba(255,255,255,0.02)',
                        borderColor: isHovered ? color : 'rgba(255,255,255,0.08)',
                      }}
                      transition={{ duration: 0.2 }}
                      className="px-4 py-3 rounded-xl border flex items-center justify-center cursor-pointer h-12 backdrop-blur-xs select-none"
                    >
                      <span className="text-sm text-gray-300 hover:text-white transition-colors font-mono">
                        <TextScramble text={skill.name} isActive={isHovered} />
                      </span>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </ScrollRevealSection>
      </div>
    </section>
  );
}