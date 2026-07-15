interface SkillTagProps {
  name: string;
  variant?: "default" | "featured";
}

export default function SkillTag({ name, variant = "default" }: SkillTagProps) {
  const featured = variant === "featured";
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded font-mono text-code-sm border transition-all ${
        featured
          ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(173,198,255,0.2)]"
          : "bg-white/5 text-on-surface-variant border-white/10 hover:border-white/20 hover:text-on-surface"
      }`}
    >
      {name}
    </span>
  );
}
