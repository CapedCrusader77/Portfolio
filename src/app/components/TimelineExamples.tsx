import { Timeline } from "./Timeline";
import { GraduationCap, Award, BookOpen, Star } from "lucide-react";

/**
 * Example usage of the Timeline component
 * This shows how to use it for different types of timelines:
 * - Professional experience
 * - Education
 * - Milestones/achievements
 * - Projects
 */

// Example 1: Education Timeline
export const educationItems = [
  {
    id: "edu-1",
    date: "2016 — 2020",
    title: "B.S. Computer Science",
    description: "Major in Computer Science with a minor in Web Development. Graduated with honors. Thesis on performance optimization in large-scale React applications.",
    badge: "University of Technology",
    icon: GraduationCap,
    accent: "cyan" as const
  },
  {
    id: "edu-2",
    date: "2021",
    title: "AWS Solutions Architect Certification",
    description: "Completed comprehensive training in cloud architecture, scalability, and best practices for enterprise applications on AWS infrastructure.",
    badge: "AWS Certified",
    icon: Award,
    accent: "blue" as const
  },
  {
    id: "edu-3",
    date: "2022 — 2023",
    title: "Advanced React & TypeScript Bootcamp",
    description: "Intensive program focusing on advanced React patterns, TypeScript mastery, and modern web development best practices with industry experts.",
    badge: "Online Academy",
    icon: BookOpen,
    accent: "purple" as const
  }
];

// Example 2: Milestones Timeline
export const milestonesItems = [
  {
    id: "milestone-1",
    date: "2019",
    title: "First Published Article",
    description: "Published 'Building Scalable React Applications' on a major tech blog, reaching 50k+ readers and starting my technical writing journey.",
    badge: "Tech Writing",
    icon: Star,
    accent: "green" as const
  },
  {
    id: "milestone-2",
    date: "2021",
    title: "Open Source Contributor",
    description: "Contributed to multiple open-source projects including React ecosystem tools. Maintained a library with 10k+ GitHub stars.",
    badge: "Open Source",
    icon: Award,
    accent: "cyan" as const
  },
  {
    id: "milestone-3",
    date: "2023",
    title: "Speaking at International Conferences",
    description: "Presented on 'Advanced Performance Optimization' at three major tech conferences in Europe and Asia, reaching thousands of developers.",
    badge: "Speaker",
    icon: Star,
    accent: "pink" as const
  },
  {
    id: "milestone-4",
    date: "2024",
    title: "Founded Developer Community",
    description: "Launched a thriving developer community with 5,000+ members. Organized monthly meetups and quarterly conferences for knowledge sharing.",
    badge: "Community Lead",
    icon: Award,
    accent: "blue" as const
  }
];

// Example 3: Project Timeline
export const projectsItems = [
  {
    id: "proj-1",
    date: "Q1 2024",
    title: "E-commerce Platform Redesign",
    description: "Led complete redesign and refactoring of legacy e-commerce platform. Improved performance by 65%, reduced bundle size by 40%, and increased conversion rates.",
    badge: "Featured Project",
    icon: Star,
    accent: "blue" as const
  },
  {
    id: "proj-2",
    date: "Q2 2024",
    title: "Real-time Collaboration Tool",
    description: "Built WebSocket-based real-time collaboration platform supporting 1000+ concurrent users. Implemented with React, Node.js, and PostgreSQL.",
    badge: "Architecture Lead",
    icon: Award,
    accent: "purple" as const
  },
  {
    id: "proj-3",
    date: "Q3 2024",
    title: "AI-Powered Analytics Dashboard",
    description: "Created intelligent analytics dashboard using machine learning for anomaly detection. Reduced manual analysis time by 80% with real-time insights.",
    badge: "AI Integration",
    icon: Star,
    accent: "cyan" as const
  },
  {
    id: "proj-4",
    date: "Q4 2024",
    title: "Mobile App Development",
    description: "Developed cross-platform mobile app using React Native. Achieved 4.8-star rating on both App Store and Google Play with 100k+ downloads.",
    badge: "Mobile Lead",
    icon: Award,
    accent: "green" as const
  }
];

// Example component showcasing the Timeline
export function TimelineExamples() {
  return (
    <div className="space-y-32">
      <Timeline
        items={educationItems}
        title="Education & Certifications"
        subtitle="Continuous learning and professional development"
      />

      <Timeline
        items={milestonesItems}
        title="Key Milestones"
        subtitle="Important achievements and career highlights"
      />

      <Timeline
        items={projectsItems}
        title="Featured Projects"
        subtitle="Notable work and technical accomplishments"
      />
    </div>
  );
}
