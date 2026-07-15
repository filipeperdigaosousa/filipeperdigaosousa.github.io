interface Repo {
  name: string;
  count: number;
}

interface TopReposListProps {
  repos: Repo[];
}

export default function TopReposList({ repos }: TopReposListProps) {
  const max = Math.max(1, ...repos.map((r) => r.count));
  return (
    <ul className="space-y-3">
      {repos.map((r) => {
        const [owner, name] = r.name.split("/");
        const pct = (r.count / max) * 100;
        return (
          <li key={r.name} className="space-y-1">
            <div className="flex justify-between items-center font-mono text-code-sm">
              <span className="text-on-surface truncate">
                <span className="text-tertiary">{owner}/</span>
                <span>{name}</span>
              </span>
              <span className="text-secondary shrink-0 ml-3">{r.count}</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/70 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
