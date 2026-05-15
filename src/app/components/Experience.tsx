import { Timeline } from "./Timeline";
import { GraduationCap, Code, Zap, Briefcase } from "lucide-react";

const experiences = [
  {
    id: "exp-1",
    date: "2025 — 2029",
    title: "VIT Chennai",
    subtitle: "B.Tech",
    description: "Comprehensive program blending computer science fundamentals with AI and robotics, mastering machine learning, automation, and intelligent systems through hands-on projects and industrial internships.",
    badge: "EDUCATION",
    icon: GraduationCap,
    accent: "cyan" as const
  },
  {
    id: "exp-2",
    date: "2025-Present",
    title: "IIT Madras",
    subtitle: "BS Degree",
    description: "Pioneering 4-year program in Data Science and Applications, mastering machine learning, deep learning, and computer vision with hands-on experience in Python, PyTorch, and real-world analytics.",
    badge: "EDUCATION",
    icon: GraduationCap,
    accent: "purple" as const
  }
];

export function Experience() {
  return (
    <Timeline
      items={experiences}
      title="Professional Experience"
      subtitle="My journey in software development"
    />
  );
}
