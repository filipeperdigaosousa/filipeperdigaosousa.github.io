interface StatusPillProps {
  status: "uphill" | "downhill" | "closed" | "at-risk";
  children?: React.ReactNode;
}

const map = {
  uphill:
    "bg-warn/15 text-warn border-warn/30",
  downhill:
    "bg-secondary/15 text-secondary border-secondary/30",
  closed:
    "bg-white/5 text-tertiary border-white/10",
  "at-risk":
    "bg-error/15 text-error border-error/30",
} as const;

export default function StatusPill({ status, children }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-mono text-[10px] uppercase tracking-widest ${map[status]}`}
    >
      {children ?? status}
    </span>
  );
}
