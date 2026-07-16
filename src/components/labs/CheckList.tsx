import type { ReactNode } from "react";

interface CheckItemProps {
  done?: boolean;
  children: ReactNode;
}

export function CheckItem({ done, children }: CheckItemProps) {
  return (
    <li className="flex items-start gap-3">
      <span
        className={`mt-1 shrink-0 w-4 h-4 border rounded-sm flex items-center justify-center ${
          done
            ? "bg-secondary/20 border-secondary/60"
            : "bg-transparent border-outline/60"
        }`}
        aria-hidden
      >
        {done ? (
          <span className="material-symbols-outlined text-secondary text-[14px] leading-none">
            check
          </span>
        ) : null}
      </span>
      <span className={done ? "text-on-surface-variant" : "text-on-surface/85"}>
        {children}
      </span>
    </li>
  );
}

export default function CheckList({ children }: { children: ReactNode }) {
  return <ul className="not-prose space-y-2 my-4 pl-0">{children}</ul>;
}
