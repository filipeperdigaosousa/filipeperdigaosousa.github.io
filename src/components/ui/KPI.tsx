interface KPIProps {
  label: string;
  value: string | number;
  sub?: string;
  variant?: "default" | "primary" | "secondary";
}

const variantColor = {
  default: "text-on-surface",
  primary: "text-primary",
  secondary: "text-secondary",
} as const;

export default function KPI({ label, value, sub, variant = "default" }: KPIProps) {
  return (
    <div className="glass-card rounded-xl p-6">
      <p className="font-mono text-label-caps uppercase text-on-surface-variant tracking-widest">
        {label}
      </p>
      <p
        className={`font-mono text-headline-xl-mobile md:text-headline-xl font-bold ${variantColor[variant]} mt-2`}
      >
        {value}
      </p>
      {sub ? (
        <p className="text-body-md text-on-surface-variant/80 mt-2">{sub}</p>
      ) : null}
    </div>
  );
}
