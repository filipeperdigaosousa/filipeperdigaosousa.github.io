"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const height = doc.scrollHeight - doc.clientHeight;
      if (height <= 0) {
        setPct(0);
        return;
      }
      const scrolled = window.scrollY;
      setPct(Math.min(100, Math.max(0, (scrolled / height) * 100)));
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="fixed left-0 z-40 h-[2px] bg-secondary transition-[width] duration-100 ease-out"
      style={{ top: "64px", width: `${pct}%` }}
    />
  );
}
