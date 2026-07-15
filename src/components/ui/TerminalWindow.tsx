import type { ReactNode } from "react";

interface TerminalWindowProps {
  children: ReactNode;
  prompt?: string;
  className?: string;
}

export default function TerminalWindow({
  children,
  prompt = "zsh — 80x24",
  className = "",
}: TerminalWindowProps) {
  return (
    <div className={`glass-card rounded-xl p-6 md:p-8 font-mono ${className}`}>
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
        <div className="w-3 h-3 rounded-full bg-error/50" />
        <div className="w-3 h-3 rounded-full bg-secondary/50" />
        <div className="w-3 h-3 rounded-full bg-primary/50" />
        <span className="ml-4 text-code-sm text-on-surface-variant opacity-40">
          {prompt}
        </span>
      </div>
      {children}
    </div>
  );
}
