import type { ReactNode } from "react";

interface CalloutProps {
  icon?: string;
  tone?: "default" | "warn" | "success" | "info";
  children: ReactNode;
}

const toneMap = {
  default: "border-white/10 bg-white/[.03]",
  warn: "border-warn/30 bg-warn/5 text-warn",
  success: "border-secondary/30 bg-secondary/5",
  info: "border-primary/30 bg-primary/5",
} as const;

export default function Callout({
  icon = "📌",
  tone = "default",
  children,
}: CalloutProps) {
  return (
    <aside
      className={`not-prose flex gap-4 border rounded-xl px-5 py-4 my-6 ${toneMap[tone]}`}
    >
      <span aria-hidden className="text-lg leading-none pt-0.5 select-none">
        {icon}
      </span>
      <div className="flex-1 [&_p:last-child]:mb-0">{children}</div>
    </aside>
  );
}
