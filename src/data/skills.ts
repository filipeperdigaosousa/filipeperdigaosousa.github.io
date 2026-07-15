export interface Skill {
  name: string;
  proficiency: number;
  category: SkillCategory;
}

export type SkillCategory =
  | "language"
  | "framework"
  | "storage"
  | "cloud"
  | "tooling";

export const skills: Skill[] = [
  { name: "TypeScript", proficiency: 95, category: "language" },
  { name: "JavaScript", proficiency: 95, category: "language" },
  { name: "Ruby", proficiency: 90, category: "language" },
  { name: "SQL", proficiency: 85, category: "language" },

  { name: "React Native", proficiency: 92, category: "framework" },
  { name: "React", proficiency: 92, category: "framework" },
  { name: "Ruby on Rails", proficiency: 92, category: "framework" },
  { name: "GraphQL", proficiency: 88, category: "framework" },
  { name: "Node.js", proficiency: 85, category: "framework" },
  { name: "Vue", proficiency: 70, category: "framework" },

  { name: "PostgreSQL", proficiency: 88, category: "storage" },
  { name: "MongoDB", proficiency: 75, category: "storage" },

  { name: "GCP", proficiency: 78, category: "cloud" },
  { name: "AWS", proficiency: 75, category: "cloud" },
  { name: "Kubernetes", proficiency: 65, category: "cloud" },
  { name: "Terraform", proficiency: 70, category: "cloud" },

  { name: "Git", proficiency: 92, category: "tooling" },
  { name: "Docker", proficiency: 80, category: "tooling" },
];

export const skillsByCategory: Record<SkillCategory, Skill[]> = {
  language: skills.filter((s) => s.category === "language"),
  framework: skills.filter((s) => s.category === "framework"),
  storage: skills.filter((s) => s.category === "storage"),
  cloud: skills.filter((s) => s.category === "cloud"),
  tooling: skills.filter((s) => s.category === "tooling"),
};

export const featuredSkills: Skill[] = [
  skills.find((s) => s.name === "TypeScript")!,
  skills.find((s) => s.name === "React Native")!,
  skills.find((s) => s.name === "Ruby on Rails")!,
  skills.find((s) => s.name === "GraphQL")!,
  skills.find((s) => s.name === "Node.js")!,
  skills.find((s) => s.name === "PostgreSQL")!,
];
