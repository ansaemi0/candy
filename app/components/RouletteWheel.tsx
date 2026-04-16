"use client";

import { useRef, useEffect, useCallback } from "react";

const PRIZES = [
  { label: "1원",    color: "#1a1a3e", textColor: "#FFD700" },
  { label: "십원",   color: "#c8960c", textColor: "#1a0a00" },
  { label: "백원",   color: "#8b0000", textColor: "#FFD700" },
  { label: "천원",   color: "#4a0080", textColor: "#FFD700" },
  { label: "만원",   color: "#003580", textColor: "#FFD700" },
  { label: "십만원", color: "#005c2e", textColor: "#FFD700" },
  { label: "백만원", color: "#8b3000", textColor: "#FFD700" },
  { label: "천만원", color: "#8b0020", textColor: "#FFE066" },
];

const SLICE_COUNT = 8;
const SLICE_ANGLE = (2 * Math.PI) / SLICE_COUNT;

interface Props {
  rotation: number;
  size: number;
}

export default function RouletteWheel({ rotation, size }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr    = window.devicePixelRatio || 1;
    const w      = size * dpr;
    const h      = size * dpr;
    canvas.width  = w;
    canvas.height = h;
    ctx.scale(dpr, dpr);

    const CX     = size / 2;
    const CY     = size / 2;
    const RADIUS = size / 2 - 6;

    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(CX, CY);

    // Outer dark ring
    ctx.beginPath();
    ctx.arc(0, 0, RADIUS + 4, 0, Math.PI * 2);
    ctx.fillStyle = "#2a1800";
    ctx.fill();

    // Slices
    for (let i = 0; i < SLICE_COUNT; i++) {
      const startAngle = rotation + i * SLICE_ANGLE;
      const endAngle   = startAngle + SLICE_ANGLE;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, RADIUS, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = PRIZES[i].color;
      ctx.fill();
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth   = 2;
      ctx.stroke();

      // Radial line
      ctx.save();
      ctx.rotate(startAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(RADIUS, 0);
      ctx.strokeStyle = "rgba(255,215,0,0.8)";
      ctx.lineWidth   = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Labels
    for (let i = 0; i < SLICE_COUNT; i++) {
      const mid      = rotation + i * SLICE_ANGLE + SLICE_ANGLE / 2;
      const textR    = RADIUS * 0.65;
      const label    = PRIZES[i].label;
      const isLong   = label.length > 2;
      const fontSize = isLong
        ? Math.max(12, RADIUS * 0.085)
        : Math.max(15, RADIUS * 0.1);

      ctx.save();
      ctx.rotate(mid);
      ctx.font         = `bold ${fontSize}px Orbitron, "Malgun Gothic", "Apple SD Gothic Neo", sans-serif`;
      ctx.fillStyle    = PRIZES[i].textColor;
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor  = "rgba(0,0,0,0.8)";
      ctx.shadowBlur   = 4;

      ctx.save();
      ctx.translate(textR, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(label, 0, 0);
      ctx.restore();
      ctx.restore();
    }

    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth   = 3;
    ctx.shadowColor  = "#FFD700";
    ctx.shadowBlur   = 12;
    ctx.stroke();
    ctx.shadowBlur   = 0;

    // Gold center
    ctx.beginPath();
    ctx.arc(0, 0, RADIUS * 0.18, 0, Math.PI * 2);
    ctx.fillStyle   = "#FFD700";
    ctx.shadowColor = "#FFD700";
    ctx.shadowBlur  = 15;
    ctx.fill();
    ctx.shadowBlur  = 0;

    ctx.beginPath();
    ctx.arc(0, 0, RADIUS * 0.11, 0, Math.PI * 2);
    ctx.fillStyle = "#1a0a2e";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, RADIUS * 0.045, 0, Math.PI * 2);
    ctx.fillStyle = "#FFD700";
    ctx.fill();

    ctx.restore();
  }, [rotation, size]);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="block rounded-full"
    />
  );
}
