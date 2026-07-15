export type Availability = "open" | "contract-only" | "closed";

export interface Profile {
  name: string;
  handle: string;
  role: string;
  tagline: string;
  location: string;
  availability: Availability;
  socials: {
    github: string;
    linkedin: string;
    email: string;
  };
}

export const profile: Profile = {
  name: "Filipe Sousa",
  handle: "filipeperdigaosousa",
  role: "Senior Full-Stack Engineer",
  tagline:
    "React Native + TypeScript on the front. Ruby on Rails + GraphQL on the back. I own the load-bearing migrations other engineers build on.",
  location: "Porto, Portugal",
  availability: "open",
  socials: {
    github: "https://github.com/filipeperdigaosousa",
    linkedin: "https://www.linkedin.com/in/filipeperdigaosousa/",
    email: "mailto:fpsousa91@gmail.com",
  },
};
