import { motion } from "motion/react";

export function About() {
  return (
    <section id="about" className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fade-in-section"
        >
          <h2 className="text-3xl md:text-4xl mb-8 text-cyan-400 font-bold tracking-tight">
            About Me
          </h2>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-2xl md:text-3xl text-white/90 font-semibold mb-6"
          >
            Hi, I am <span className="text-purple-300/90">Gokul A</span>
          </motion.p>

          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-200/80 leading-relaxed max-w-3xl"
          >
            I'm an AI and Robotics student passionate about <span className="text-blue-300/90 font-semibold">data science</span> and <span className="text-blue-300/90 font-semibold">cybersecurity</span>. I work with <span className="text-blue-300/90 font-semibold">Python, C/C++, algorithms, and Linux-based tools</span> to build efficient, data-driven solutions that solve real-world problems.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
