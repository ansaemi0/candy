"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import RouletteWheel from "./RouletteWheel";

const PRIZES = [
  { label: "1원",    textColor: "#FFD700" },
  { label: "십원",   textColor: "#1a0a00" },
  { label: "백원",   textColor: "#FFD700" },
  { label: "천원",   textColor: "#FFD700" },
  { label: "만원",   textColor: "#FFD700" },
  { label: "십만원", textColor: "#FFD700" },
  { label: "백만원", textColor: "#FFD700" },
  { label: "천만원", textColor: "#FFE066" },
];

const SLICE_COUNT    = 8;
const SLICE_ANGLE    = (2 * Math.PI) / SLICE_COUNT;
const FRICTION       = 0.985;
const MIN_ROTATIONS  = 6;
const MIN_SPIN_RAD   = MIN_ROTATIONS * 2 * Math.PI;
const STOP_THRESHOLD = 0.004;

const CONFETTI_COLORS = ["#FFD700","#FF4444","#44FF88","#4488FF","#FF88FF","#FFAA00","#FF6600"];

export default function CasinoRoulette() {
  const [rotation, setRotation]       = useState(-Math.PI / 2 - SLICE_ANGLE / 2);
  const [isSpinning, setIsSpinning]   = useState(false);
  const [showResult, setShowResult]   = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [prizeIndex, setPrizeIndex]   = useState(0);
  const [wheelSize, setWheelSize]     = useState(420);

  const stateRef = useRef({
    currentAngle: -Math.PI / 2 - SLICE_ANGLE / 2,
    angularVelocity: 0,
    totalSpun: 0,
    targetIndex: 0,
    lastSliceIndex: -1,
    animId: 0,
  });

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Responsive size
  useEffect(() => {
    const update = () => {
      const size = Math.min(window.innerWidth * 0.82, window.innerHeight * 0.42, 420);
      setWheelSize(size);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
  }, []);

  const playTick = useCallback(() => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "triangle";
      osc.frequency.value = 900 + Math.random() * 200;
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
    } catch { /* ignore */ }
  }, []);

  const playWin = useCallback((idx: number) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      const baseFreqs = [523.25, 659.25, 783.99, 1046.50];
      const mul = 1 + idx * 0.06;
      baseFreqs.forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq * mul;
        const t = ctx.currentTime + i * 0.11;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.start(t); osc.stop(t + 0.5);
      });
    } catch { /* ignore */ }
  }, []);

  const launchConfetti = useCallback(() => {
    for (let i = 0; i < 80; i++) {
      setTimeout(() => {
        const el = document.createElement("div");
        el.className = "confetti-piece";
        const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        const dur   = 1.8 + Math.random() * 1.5;
        const drift = (Math.random() - 0.5) * 200;
        el.style.cssText = `
          left: ${Math.random() * 100}vw; top: -10px;
          background: ${color};
          --dur: ${dur}s; --drift: ${drift}px;
          width: ${6 + Math.random() * 6}px;
          height: ${6 + Math.random() * 6}px;
          border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), dur * 1000 + 200);
      }, i * 18);
    }
  }, []);

  function getIndexUnderPointer(angle: number) {
    const a = ((-Math.PI / 2 - angle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    return Math.floor(a / SLICE_ANGLE) % SLICE_COUNT;
  }

  const onSpinEnd = useCallback((idx: number) => {
    setIsSpinning(false);
    setPrizeIndex(idx);
    setShowResult(true);
    playWin(idx);
    setTimeout(() => {
      setShowModal(true);
      launchConfetti();
    }, 700);
  }, [playWin, launchConfetti]);

  const snapAndStop = useCallback((targetIdx: number) => {
    const s = stateRef.current;
    const sliceCenter = targetIdx * SLICE_ANGLE + SLICE_ANGLE / 2;
    let finalAngle = -Math.PI / 2 - sliceCenter;

    while (finalAngle < s.currentAngle) finalAngle += 2 * Math.PI;
    if (finalAngle - s.currentAngle > Math.PI) finalAngle -= 2 * Math.PI;

    const startAngle = s.currentAngle;
    const delta      = finalAngle - startAngle;
    const FRAMES     = 30;
    let   frame      = 0;

    const tween = () => {
      frame++;
      const t    = frame / FRAMES;
      const ease = 1 - Math.pow(1 - t, 3);
      s.currentAngle = startAngle + delta * ease;
      setRotation(s.currentAngle);

      if (frame < FRAMES) {
        s.animId = requestAnimationFrame(tween);
      } else {
        s.currentAngle = finalAngle;
        setRotation(finalAngle);
        onSpinEnd(targetIdx);
      }
    };
    s.animId = requestAnimationFrame(tween);
  }, [onSpinEnd]);

  const animate = useCallback(() => {
    const s = stateRef.current;
    s.currentAngle    += s.angularVelocity;
    s.totalSpun       += s.angularVelocity;

    const curSlice = getIndexUnderPointer(s.currentAngle);
    if (curSlice !== s.lastSliceIndex) {
      s.lastSliceIndex = curSlice;
      playTick();
    }

    if (s.totalSpun >= MIN_SPIN_RAD) s.angularVelocity *= FRICTION;
    setRotation(s.currentAngle);

    if (s.totalSpun >= MIN_SPIN_RAD && s.angularVelocity < STOP_THRESHOLD) {
      snapAndStop(s.targetIndex);
      return;
    }
    s.animId = requestAnimationFrame(animate);
  }, [playTick, snapAndStop]);

  const spin = useCallback(() => {
    if (isSpinning) return;
    ensureAudio();

    const s          = stateRef.current;
    s.totalSpun      = 0;
    s.angularVelocity = 0.28 + Math.random() * 0.18;
    s.targetIndex    = Math.floor(Math.random() * SLICE_COUNT);
    s.lastSliceIndex = getIndexUnderPointer(s.currentAngle);

    setIsSpinning(true);
    setShowResult(false);
    s.animId = requestAnimationFrame(animate);
  }, [isSpinning, ensureAudio, animate]);

  const closeModal = () => {
    setShowModal(false);
    setShowResult(false);
  };

  return (
    <div className="relative z-10 flex flex-col items-center gap-5 px-4 py-4">
      {/* Title */}
      <h1
        className="title-glow text-center leading-tight tracking-widest"
        style={{
          fontFamily: "var(--font-cinzel), serif",
          fontSize: "clamp(1.6rem, 5vw, 3rem)",
          fontWeight: 900,
          color: "#FFD700",
        }}
      >
        Lucky<br />
        <span style={{ color: "#fff" }}>Roulette</span>
      </h1>

      {/* Divider */}
      <div
        className="w-72 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, #FFD700 30%, #FFA500 50%, #FFD700 70%, transparent)",
          boxShadow: "0 0 10px #FFD700",
        }}
      />

      {/* Wheel */}
      <div className="relative flex items-center justify-center">
        {/* Shadow ring */}
        <div
          className="absolute rounded-full"
          style={{
            width:  wheelSize + 24,
            height: wheelSize + 24,
            left:   -12,
            top:    -12,
            boxShadow:
              "0 0 0 5px #8B6914, 0 0 0 8px #FFD700, 0 0 0 12px #8B6914, 0 0 50px rgba(255,215,0,0.6), 0 0 100px rgba(255,165,0,0.3)",
          }}
        />
        {/* Pointer */}
        <div
          className="absolute z-10"
          style={{
            top:  -18,
            left: "50%",
            transform: "translateX(-50%)",
            width:       0,
            height:      0,
            borderLeft:  "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop:   "32px solid #FF2200",
            filter: "drop-shadow(0 0 8px #FF4400) drop-shadow(0 -2px 4px rgba(255,50,0,0.8))",
          }}
        />
        <RouletteWheel rotation={rotation} size={wheelSize} />
      </div>

      {/* Spin button */}
      <button
        onClick={spin}
        disabled={isSpinning}
        className={`btn-pulse rounded-md font-black tracking-widest uppercase transition-transform ${
          isSpinning ? "opacity-50 cursor-not-allowed" : "hover:-translate-y-0.5 hover:scale-[1.03] active:translate-y-0.5 active:scale-[0.98]"
        }`}
        style={{
          fontFamily:    "var(--font-orbitron), sans-serif",
          fontSize:      "clamp(1rem, 3vw, 1.3rem)",
          color:         "#0a0a0f",
          background:    "linear-gradient(135deg, #FFE44D 0%, #FFD700 30%, #FFA500 70%, #FF8C00 100%)",
          border:        "none",
          padding:       "16px 64px",
          cursor:        isSpinning ? "not-allowed" : "pointer",
          boxShadow:     "0 4px 15px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
        }}
      >
        SPIN
      </button>

      {/* Result banner */}
      <div
        className="min-w-64 text-center px-7 py-3 rounded-lg transition-all duration-400"
        style={{
          background:  "linear-gradient(135deg, rgba(20,5,40,0.95), rgba(10,5,25,0.95))",
          border:      "1px solid #FFD700",
          boxShadow:   "0 0 20px rgba(255,215,0,0.4), 0 0 50px rgba(255,165,0,0.2)",
          opacity:     showResult ? 1 : 0,
          transform:   showResult ? "translateY(0)" : "translateY(20px)",
          pointerEvents: showResult ? "auto" : "none",
        }}
      >
        <span
          style={{
            fontFamily:  "var(--font-orbitron), sans-serif",
            fontSize:    "clamp(1rem, 3vw, 1.2rem)",
            fontWeight:  700,
            color:       "#FFD700",
            letterSpacing: "0.1em",
            textShadow:  "0 0 10px #FFD700",
          }}
        >
          🎉 {PRIZES[prizeIndex].label} 당첨!
        </span>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,10,0.85)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div
            className="modal-in text-center rounded-2xl"
            style={{
              background:   "linear-gradient(160deg, #120825 0%, #0a0518 50%, #180830 100%)",
              border:       "2px solid #FFD700",
              padding:      "48px 56px",
              maxWidth:     "90vw",
              boxShadow:    "0 0 0 1px #8B6914, 0 0 40px rgba(255,215,0,0.5), 0 0 80px rgba(255,165,0,0.3), 0 20px 60px rgba(0,0,0,0.8)",
            }}
          >
            <p
              style={{
                fontFamily:   "var(--font-cinzel), serif",
                fontSize:     "clamp(1rem, 3vw, 1.3rem)",
                color:        "#fff",
                letterSpacing: "0.15em",
                textShadow:   "0 0 15px #FFD700, 0 0 30px #FFA500",
                marginBottom:  16,
              }}
            >
              🎰 축하합니다! 🎰
            </p>

            <div
              className="prize-shine"
              style={{
                fontFamily:   "var(--font-orbitron), sans-serif",
                fontSize:     "clamp(3rem, 10vw, 5.5rem)",
                fontWeight:   900,
                color:        "#FFD700",
                letterSpacing: "0.05em",
                margin:       "8px 0 20px",
              }}
            >
              {PRIZES[prizeIndex].label}
            </div>

            <p
              style={{
                fontSize:     "clamp(0.75rem, 2vw, 0.9rem)",
                color:        "rgba(255,215,0,0.7)",
                letterSpacing: "0.2em",
                marginBottom:  32,
              }}
            >
              당첨 · WINNER · 当選
            </p>

            <button
              onClick={closeModal}
              className="rounded-md font-bold tracking-widest uppercase transition-transform hover:-translate-y-0.5 hover:scale-[1.04]"
              style={{
                fontFamily: "var(--font-orbitron), sans-serif",
                fontSize:   "0.9rem",
                color:      "#0a0a0f",
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                border:     "none",
                padding:    "12px 36px",
                cursor:     "pointer",
                boxShadow:  "0 0 20px rgba(255,215,0,0.5), 0 4px 12px rgba(0,0,0,0.5)",
              }}
            >
              다시 돌리기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
