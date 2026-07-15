import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export default function GlassCard({
  children,
  className = "",
  as: Tag = "div",
}: GlassCardProps) {
  const El = Tag as React.ElementType;
  return (
    <El className={`glass-card rounded-xl ${className}`}>{children}</El>
  );
}
