"use client";

import { useEffect, useState } from "react";

interface TypewriterProps {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
}

export default function Typewriter({
  text,
  speed = 90,
  startDelay = 400,
  className = "",
}: TypewriterProps) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (i < text.length) {
        setShown(text.slice(0, i + 1));
        i++;
        timer = setTimeout(tick, speed);
      }
    };
    const start = setTimeout(tick, startDelay);
    return () => {
      clearTimeout(start);
      clearTimeout(timer);
    };
  }, [text, speed, startDelay]);

  return (
    <span className={className}>
      {shown}
      <span className="terminal-cursor" />
    </span>
  );
}
