"use client";

import { useEffect, useRef } from "react";

export default function StarField() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const stars: HTMLDivElement[] = [];
    for (let i = 0; i < 120; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const size = 1 + Math.random() * 2.5;
      const dur  = 1.5 + Math.random() * 3;
      star.style.cssText = `
        width: ${size}px; height: ${size}px;
        left: ${Math.random() * 100}vw;
        top: ${Math.random() * 100}vh;
        --dur: ${dur}s;
        animation-delay: ${Math.random() * dur}s;
        z-index: 0;
      `;
      container.appendChild(star);
      stars.push(star);
    }

    return () => stars.forEach((s) => s.remove());
  }, []);

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none" />;
}
