"use client";

import React, { useEffect, useState } from 'react';

interface CounterProps {
  target: number;
  duration?: number; // in milliseconds
  prefix?: string;
  suffix?: string;
}

export default function Counter({ target, duration = 1500, prefix = "", suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out quad formula for smooth decelerating animation
      const easedProgress = progress * (2 - progress);
      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration]);

  return (
    <span className="font-bold tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}
