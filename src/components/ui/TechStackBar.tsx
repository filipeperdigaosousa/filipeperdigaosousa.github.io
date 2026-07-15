interface TechStackBarProps {
  label: string;
  percent: number;
}

export default function TechStackBar({ label, percent }: TechStackBarProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between font-mono text-code-sm text-on-surface-variant">
        <span>{label}</span>
        <span className="text-secondary">{percent}%</span>
      </div>
      <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden">
        <div
          className="h-full bg-secondary progress-glow"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
