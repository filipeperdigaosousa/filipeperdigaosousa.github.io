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
  const gridCols = { gridTemplateColumns: `repeat(${keys.length},minmax(0,1fr))` };

  return (
    <div>
      <div className="h-40 grid gap-4 items-end pt-4" style={gridCols}>
        {keys.map((k) => {
          const v = data[k] ?? 0;
          const height = `${Math.max(v ? 6 : 2, (v / max) * 100)}%`;
          return (
            <div
              key={k}
              className={`rounded-t ${color} progress-glow transition-all`}
              style={{ height }}
              title={`${k}: ${v}`}
            />
          );
        })}
      </div>
      <div className="grid gap-4 mt-3" style={gridCols}>
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
