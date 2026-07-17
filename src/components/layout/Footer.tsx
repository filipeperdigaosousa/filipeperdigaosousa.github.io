import { profile } from "@/data/profile";

const links = [
  { href: profile.socials.github, label: "GITHUB" },
  { href: profile.socials.linkedin, label: "LINKEDIN" },
  { href: profile.socials.email, label: "EMAIL" },
  { href: profile.socials.buyMeACoffee, label: "BUY ME A COFFEE" },
];

export default function Footer() {
  return (
    <footer className="w-full py-12 border-t border-white/5 bg-background mb-20 md:mb-0">
      <div className="max-w-content mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-mono text-code-sm text-tertiary uppercase tracking-widest text-center md:text-left">
          © {new Date().getFullYear()} {profile.name}. All rights reserved.
        </p>
        <div className="flex gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-code-sm text-tertiary hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
