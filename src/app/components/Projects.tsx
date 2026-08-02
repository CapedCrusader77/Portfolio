import { motion } from "motion/react";
import { ExternalLink, Github, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { ScrollRevealSection } from "./ScrollRevealSection";

const projects = [
  {
    title: "SIEGE - Cyber Simulation Platform",
    description: "Built a real-time cyber attack and defense simulator using FastAPI, WebSockets, and React, featuring live event streaming, multiple attack modules, analytics dashboards, and automated reporting with Dockerized deployment.",
    tech: ["FastAPI", "WebSockets", "React", "Docker", "Analytics"],
    year: "2026",
    github: "https://github.com/CapedCrusader77/SEIGE",
    gradient: "from-blue-500/20 to-purple-500/20",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80"
  },
  {
    title: "AURA - Autonomous Maze-Solving Robot Simulator",
    description: "Developed an autonomous pathfinding simulation for a differential drive robot using ROS2, LiDAR sensor feeds, and A* / Q-learning path planning, featuring a web-based WebGL simulation visualizer.",
    tech: ["Python", "ROS2", "LiDAR", "A* Pathfinding", "Q-Learning", "Three.js"],
    year: "2026",
    github: "https://github.com/CapedCrusader77",
    gradient: "from-cyan-500/20 to-blue-500/20",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80"
  },
  {
    title: "Stock Market Predictor",
    description: "Advanced machine learning model for predicting stock price movements using LSTM neural networks, technical indicators, and sentiment analysis from financial news and social media data.",
    tech: ["Python", "TensorFlow", "LSTM", "Pandas", "Scikit-learn"],
    year: "2026",
    github: null,
    gradient: "from-green-500/20 to-emerald-500/20",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80"
  },
  {
    title: "SentinelML - Intrusion Detection System",
    description: "Built a high-throughput network anomaly detector utilizing an ensemble of Random Forest and XGBoost classifiers, processing real-time PCAP traffic streams via Scapy to flag malicious network activity.",
    tech: ["Python", "XGBoost", "Scapy", "Network Security", "Pandas"],
    year: "2026",
    github: "https://github.com/CapedCrusader77",
    gradient: "from-red-500/20 to-purple-500/20",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80"
  }
];

export function Projects() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="projects" className="relative py-32 px-6 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-1/2 -left-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <ScrollRevealSection direction="up" distance={40} blur={true}>
          <div className="mb-20 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-400/30 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300/90">Featured Projects</span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl mb-6 text-white/90 tracking-tight font-bold">
              Selected Work
            </h2>
            <p className="text-gray-400/70 leading-relaxed max-w-2xl mx-auto text-lg">
              Projects that blend functionality with thoughtful design
            </p>
          </div>
        </ScrollRevealSection>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <ScrollRevealSection
              key={project.title}
              direction={index % 2 === 0 ? "left" : "right"}
              distance={80}
              rotateY={index % 2 === 0 ? 10 : -10}
              scale={0.95}
              blur={true}
              className="group relative"
            >
              <div
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ perspective: 1000 }}
              >
              {/* Glow effect on hover */}
              <motion.div
                animate={{
                  opacity: hoveredIndex === index ? 1 : 0,
                  scale: hoveredIndex === index ? 1 : 0.8,
                }}
                transition={{ duration: 0.3 }}
                className={`absolute inset-0 bg-gradient-to-r ${project.gradient} rounded-2xl blur-xl -z-10`}
              />

              {/* Card */}
              <motion.div
                animate={{
                  rotateX: hoveredIndex === index ? 5 : 0,
                  rotateY: hoveredIndex === index ? -5 : 0,
                  y: hoveredIndex === index ? -10 : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="relative h-full bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-xl p-5 backdrop-blur-sm overflow-hidden"
              >
                {/* Animated gradient overlay */}
                <motion.div
                  animate={{
                    opacity: hoveredIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Project Image */}
                  <motion.div
                    animate={{
                      scale: hoveredIndex === index ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="relative mb-4 overflow-hidden rounded-lg aspect-video bg-white/[0.02]"
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    {/* Gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-t ${project.gradient} opacity-30`} />
                  </motion.div>

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <motion.div
                          animate={{
                            rotate: hoveredIndex === index ? 360 : 0,
                          }}
                          transition={{ duration: 0.6 }}
                          className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"
                        >
                          <Sparkles className="w-4 h-4 text-blue-400" />
                        </motion.div>
                        <span className="text-xs text-gray-500 font-mono">{project.year}</span>
                      </div>

                      <h3 className="text-lg md:text-xl text-white/90 group-hover:text-white transition-colors duration-300 mb-2 font-semibold">
                        {project.title}
                      </h3>
                    </div>

                    <motion.div
                      animate={{
                        x: hoveredIndex === index ? 5 : 0,
                        y: hoveredIndex === index ? -5 : 0,
                        rotate: hoveredIndex === index ? 45 : 0,
                      }}
                      transition={{ duration: 0.3 }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                    </motion.div>
                  </div>

                  <p className="text-gray-400/80 leading-relaxed mb-4 text-sm line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tech.map((tech, i) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + i * 0.05 }}
                        whileHover={{
                          scale: 1.05,
                          backgroundColor: "rgba(59, 130, 246, 0.2)",
                          borderColor: "rgba(59, 130, 246, 0.4)",
                        }}
                        className="px-2.5 py-1 bg-white/[0.03] border border-white/[0.08] rounded-lg text-xs text-blue-300/80 transition-all duration-300 font-medium"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: hoveredIndex === index ? 1 : 0,
                      y: hoveredIndex === index ? 0 : 10,
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-2"
                  >
                    {project.github ? (
                      <motion.a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600/50 to-purple-600/50 hover:from-blue-500/60 hover:to-purple-500/60 border border-blue-400/30 rounded-lg text-white text-xs font-medium transition-all duration-300 shadow-lg shadow-blue-500/20"
                      >
                        <Github className="w-3.5 h-3.5" />
                        GitHub
                      </motion.a>
                    ) : (
                      <motion.a
                        href="#"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600/50 to-purple-600/50 hover:from-blue-500/60 hover:to-purple-500/60 border border-blue-400/30 rounded-lg text-white text-xs font-medium transition-all duration-300 shadow-lg shadow-blue-500/20"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Project
                      </motion.a>
                    )}
                  </motion.div>
                </div>

                {/* Shimmer effect */}
                <motion.div
                  animate={{
                    x: hoveredIndex === index ? "100%" : "-100%",
                  }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"
                />
              </motion.div>
            </div>
          </ScrollRevealSection>
          ))}
        </div>

        {/* View more button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.1] hover:border-white/[0.2] rounded-xl text-white/80 hover:text-white transition-all duration-300"
          >
            View All Projects
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
