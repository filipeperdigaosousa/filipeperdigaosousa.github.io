export interface ExperienceEntry {
  company: string;
  role: string;
  start: string;
  end: string | null;
  stack: string[];
  summary: string;
  highlights: string[];
  note?: string;
}

export const experience: ExperienceEntry[] = [
  {
    company: "PlayerData",
    role: "Senior Full-Stack Engineer",
    start: "2024-10",
    end: null,
    stack: [
      "Ruby on Rails",
      "GraphQL",
      "React Native",
      "React",
      "TypeScript",
      "PostgreSQL",
    ],
    summary:
      "Core engineer in a cross-functional product pod, delivering end-to-end features for a sports performance analytics platform used by professional sports clubs.",
    highlights: [
      "Delivered a configurable metrics platform spanning backend, web and mobile — server-side unit conversion, per-club configuration, flexible metric selection.",
      "Designed and implemented Session Blueprints — recurring training sessions automatically materialised with device assignment and timezone-aware scheduling.",
      "Led the React Native → web migration with Expo Router, establishing routing patterns adopted across the product.",
      "Built a multi-tenant Staff Admin Panel with a reusable bulk-actions framework for copy, archive, restore and delete across athletes, staff, pitches, tags, surveys.",
      "Migrated ingestion and enrichment pipelines to Numaflow and adapted the API's async job model for improved scalability.",
      "Implemented HubSpot CRM integration synchronising clubs, organisations and staff via webhook-driven async processing.",
      "Optimised backend performance across Rails and GraphQL — eliminated N+1 queries, introduced DataLoader batching.",
      "Assumed Pod Lead while remaining hands-on — delivery planning, risk management, stakeholder coordination.",
    ],
  },
  {
    company: "Pasabi",
    role: "Fullstack Engineer / Tech Lead",
    start: "2022-01",
    end: "2024-08",
    stack: [
      "Node.js",
      "TypeScript",
      "Vue",
      "MongoDB",
      "PostgreSQL",
      "Neo4j",
      "Terraform",
      "AWS",
      "GCP",
    ],
    summary:
      "Fraud and fake-review detection platform. Fullstack engineer becoming Tech Lead, driving technical direction and platform migrations.",
    highlights: [
      "Assumed Tech Lead role, steering development and providing strategic guidance aligned with business goals.",
      "Led migration of a core product database from MongoDB to PostgreSQL, including schema adaptations and system-wide adjustments.",
      "Developed a reusable UI component library and design patterns, standardising interfaces across all Pasabi products.",
      "Unified the codebase into a monorepo, optimising development workflows.",
      "Migrated provisioning infrastructure to Terraform, improving deployment repeatability and scalability.",
      "Executed migration of all infrastructure from GCP to AWS, passing the AWS Foundation Technical Review.",
      "Introduced CI features via GitHub Actions to enhance automated workflows and build processes.",
      "Designed and deployed APIs for seamless customer integrations.",
    ],
  },
  {
    company: "Glazed",
    role: "Full-Stack Software Engineer",
    start: "2016-12",
    end: null,
    stack: ["Ruby on Rails", "Node.js", "React", "TypeScript", "PostgreSQL"],
    summary:
      "Home consultancy since 2016. PlayerData and Pasabi engagements listed above have all been delivered through Glazed.",
    highlights: [
      "9+ years shipping client work across web and mobile, front-end and back-end.",
      "JavaScript, Ruby on Rails, Node.js, React, TypeScript in production across engagements.",
      "PostgreSQL and MongoDB data layers.",
      "Cloud deployments on AWS and GCP with Terraform and Kubernetes.",
      "Drove CI/CD adoption and engineering practice across teams.",
    ],
    note: "Umbrella consultancy — PlayerData and Pasabi were placements delivered through Glazed.",
  },
  {
    company: "WeChangers",
    role: "Full-Stack Engineer",
    start: "2017-01",
    end: "2021-12",
    stack: [
      "Ruby on Rails",
      "React",
      "Node.js",
      "Webpack",
      "PostgreSQL",
      "WebSockets",
    ],
    summary:
      "Social-impact network platform. Owned architecture from day one, delivered the full stack end-to-end.",
    highlights: [
      "Defined project architecture from the beginning — structured and developed all project layers.",
      "Built multi-tenancy infrastructure from start to finish.",
      "Created database models in Ruby on Rails with PostgreSQL integration and developed all pages.",
      "Built an internal real-time messaging system using Rails and React.",
      "Exposed a REST API with JWT authentication to support the iOS app.",
      "Crafted a Node.js web scraper.",
      "Restructured the website to a mobile-first approach using React.",
    ],
  },
  {
    company: "Manolo Blahnik",
    role: "Web Developer",
    start: "2016-01",
    end: "2017-01",
    stack: ["React", "Node.js"],
    summary: "Luxury e-commerce front-end modernisation.",
    highlights: [
      "Migrated the website from a monolithic flux architecture.",
      "Introduced Redux to simplify and enhance state management.",
      "Integrated with the customer's Node.js backend.",
      "Updated the application lifecycle to improve performance.",
    ],
  },
  {
    company: "Deloitte Digital",
    role: "Web Developer",
    start: "2015-01",
    end: "2016-01",
    stack: ["AngularJS", "Node.js", "MongoDB"],
    summary:
      "Digital transformation tooling — insurance products and rapid prototyping platform.",
    highlights: [
      "Developed tools for online insurance companies.",
      "Built a Node.js backend integrated with MongoDB.",
      "Contributed to a framework platform supporting digital transformation processes.",
      "Implemented web and mobile prototypes with Angular to speed up Proof of Concepts.",
    ],
  },
];
