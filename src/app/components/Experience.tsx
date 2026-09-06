import { EducationJourney } from "./EducationJourney";

const educationTracks = [
  {
    id: "vit",
    institution: "VIT Chennai",
    degree: "B.Tech · Bachelor of Technology",
    startYear: "2025",
    endYear: "2029",
    status: "Ongoing",
    description: "Building foundations in computer science, AI, robotics, and software engineering through coursework and hands-on projects.",
    accent: "cyan" as const,
  },
  {
    id: "iitm",
    institution: "IIT Madras",
    degree: "BS Degree",
    startYear: "2025",
    endYear: "Present",
    status: "Ongoing",
    description: "Studying data science and applications with programming, statistics, machine learning, and analytical foundations.",
    accent: "purple" as const,
  },
];

export function Experience() {
  return (
    <EducationJourney
      tracks={educationTracks}
      title="ACADEMIC JOURNEY"
      subtitle="Two parallel paths shaping how I build, analyze, and understand intelligent systems."
    />
  );
}
