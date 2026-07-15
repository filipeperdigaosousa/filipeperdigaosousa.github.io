export type SkillCategory =
  | "language"
  | "framework"
  | "storage"
  | "cloud"
  | "tooling";

export interface Skill {
  name: string;
  category: SkillCategory;
  featured?: boolean;
}

export const skills: Skill[] = [
  { name: "TypeScript", category: "language", featured: true },
  { name: "JavaScript", category: "language" },
  { name: "Ruby", category: "language", featured: true },
  { name: "SQL", category: "language" },

  { name: "React Native", category: "framework", featured: true },
  { name: "React", category: "framework", featured: true },
  { name: "Ruby on Rails", category: "framework", featured: true },
  { name: "GraphQL", category: "framework", featured: true },
  { name: "Node.js", category: "framework", featured: true },
  { name: "Vue", category: "framework" },
  { name: "Expo", category: "framework" },
  { name: "REST", category: "framework" },
  { name: "WebSockets", category: "framework" },

  { name: "PostgreSQL", category: "storage", featured: true },
  { name: "MongoDB", category: "storage" },
  { name: "Neo4j", category: "storage" },
  { name: "Redis", category: "storage" },

  { name: "GCP", category: "cloud" },
  { name: "AWS", category: "cloud" },
  { name: "Kubernetes", category: "cloud" },
  { name: "Terraform", category: "cloud" },
  { name: "Docker", category: "cloud" },

  { name: "Git", category: "tooling" },
  { name: "GitHub Actions", category: "tooling" },
  { name: "CI/CD", category: "tooling" },
  { name: "Numaflow", category: "tooling" },
  { name: "Storybook", category: "tooling" },
  { name: "pnpm / npm", category: "tooling" },
  { name: "Biome", category: "tooling" },
  { name: "ESLint", category: "tooling" },
];

export const skillsByCategory: Record<SkillCategory, Skill[]> = {
  language: skills.filter((s) => s.category === "language"),
  framework: skills.filter((s) => s.category === "framework"),
  storage: skills.filter((s) => s.category === "storage"),
  cloud: skills.filter((s) => s.category === "cloud"),
  tooling: skills.filter((s) => s.category === "tooling"),
};

export const featuredSkills = skills.filter((s) => s.featured);

export const categoryLabels: Record<SkillCategory, string> = {
  language: "Languages",
  framework: "Frameworks & Libraries",
  storage: "Storage",
  cloud: "Cloud & Infra",
  tooling: "Tooling",
};
