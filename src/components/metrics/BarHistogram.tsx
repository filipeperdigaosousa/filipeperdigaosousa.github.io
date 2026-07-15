interface BarHistogramProps {
  data: Record<string, number>;
  color?: string;
  order?: string[];
  unit?: string;
}

export default function BarHistogram({
  data,
  color = "bg-secondary",
  order,
  unit,
}: BarHistogramProps) {
  const keys = order ?? Object.keys(data);
  const max = Math.max(1, ...keys.map((k) => data[k] ?? 0));
  return (
    <div>
      <div className="h-40 flex items-end gap-4 pt-4">
        {keys.map((k) => {
          const v = data[k] ?? 0;
          return (
            <div key={k} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end h-full">
                <div
                  className={`w-full rounded-t ${color} progress-glow transition-all`}
                  style={{ height: `${(v / max) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid gap-4 mt-3" style={{ gridTemplateColumns: `repeat(${keys.length},1fr)` }}>
        {keys.map((k) => {
          const v = data[k] ?? 0;
          return (
            <div key={k} className="text-center">
              <div className="font-mono text-label-caps uppercase text-tertiary tracking-widest">
                {k}
              </div>
              <div className="font-mono text-body-md text-on-surface mt-1">
                {v}
                {unit ? (
                  <span className="text-tertiary text-code-sm ml-1">
                    {unit}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
