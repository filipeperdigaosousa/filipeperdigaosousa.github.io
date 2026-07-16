"use client";

import { useEffect, useRef, useState } from "react";

type Variant = "text" | "icon" | "chip";

interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  disabled?: boolean;
  className?: string;
  variant?: Variant;
  title?: string;
}

export default function CopyButton({
  value,
  label = "copy",
  copiedLabel = "copied!",
  disabled,
  className,
  variant = "text",
  title,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  async function onClick() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
    } catch {
      setFailed(true);
      setCopied(false);
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 1500);
  }

  const state = failed ? "failed" : copied ? "copied" : "idle";
  const isDisabled = disabled || !value;

  if (variant === "icon") {
    const icon =
      state === "copied" ? "check" : state === "failed" ? "error" : "content_copy";
    const color =
      state === "copied"
        ? "text-secondary"
        : state === "failed"
          ? "text-[#ff6b6b]"
          : "text-tertiary hover:text-primary";
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        title={title ?? (state === "copied" ? copiedLabel : label)}
        aria-label={label}
        className={`p-1.5 rounded transition-colors disabled:opacity-40 ${color} ${className ?? ""}`}
      >
        <span className="material-symbols-outlined text-base">{icon}</span>
      </button>
    );
  }

  if (variant === "chip") {
    const color =
      state === "copied"
        ? "border-secondary/60 bg-secondary/10 text-secondary"
        : state === "failed"
          ? "border-[#ff6b6b]/60 bg-[#ff6b6b]/10 text-[#ff6b6b]"
          : "border-white/10 bg-white/5 text-on-surface-variant hover:text-primary hover:border-primary/40";
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={isDisabled}
        className={`px-3 py-1.5 rounded-lg border font-mono text-code-sm inline-flex items-center gap-1.5 transition-colors disabled:opacity-40 ${color} ${className ?? ""}`}
      >
        <span className="material-symbols-outlined text-base">
          {state === "copied" ? "check" : state === "failed" ? "error" : "content_copy"}
        </span>
        {state === "copied" ? copiedLabel : state === "failed" ? "failed" : label}
      </button>
    );
  }

  const color =
    state === "copied"
      ? "text-secondary"
      : state === "failed"
        ? "text-[#ff6b6b]"
        : "text-tertiary hover:text-primary";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={`font-mono text-code-sm inline-flex items-center gap-1 transition-colors disabled:opacity-40 ${color} ${className ?? ""}`}
    >
      <span className="material-symbols-outlined text-base">
        {state === "copied" ? "check" : state === "failed" ? "error" : "content_copy"}
      </span>
      {state === "copied" ? copiedLabel : state === "failed" ? "failed" : label}
    </button>
  );
}
