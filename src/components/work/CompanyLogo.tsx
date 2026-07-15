"use client";

import { useState } from "react";

interface CompanyLogoProps {
  company: string;
  domain?: string;
  logo?: string;
  size?: number;
  className?: string;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");
}

export default function CompanyLogo({
  company,
  domain,
  logo,
  size = 48,
  className = "",
}: CompanyLogoProps) {
  const initial = logo ?? (domain ? `/logos/${domain.split(".")[0]}.png` : null);
  const google =
    domain && `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  const [src, setSrc] = useState<string | null>(initial ?? google ?? null);
  const [failed, setFailed] = useState<Set<string>>(new Set());

  const onError = () => {
    if (!src) return;
    const next = new Set(failed);
    next.add(src);
    if (initial && !next.has(initial) && google && !next.has(google)) {
      setSrc(google);
    } else {
      setSrc(null);
    }
    setFailed(next);
  };

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg bg-surface-container border border-white/10 font-mono text-primary font-bold ${className}`}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.35) }}
        aria-label={`${company} logo placeholder`}
      >
        {initials(company)}
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg overflow-hidden bg-surface-container border border-white/10 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={src}
        alt={`${company} logo`}
        width={size}
        height={size}
        onError={onError}
        className="w-full h-full object-contain"
      />
    </div>
  );
}
