'use client'

import { useEffect, useRef } from "react";
import clsx from "clsx";

type CursorGlowProps = {
  glowColor?: string;
  glowSize?: number;
  softness?: number;
  blendMode?: "normal" | "screen" | "plus-lighter" | "overlay";
  zIndex?: number;
};

export default function CursorGlow({
  glowColor = "rgba(255, 255, 255, 1)",
  glowSize = 30,
  softness = 1,
  blendMode = "plus-lighter",
  zIndex = 2147483647,
}: CursorGlowProps) {
  const glowRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const glow = glowRef.current!;
    const halfGlow = glowSize / 2;

    const onMove = (e: MouseEvent) => {
      glow.style.transform = `translate(${e.clientX - halfGlow}px, ${e.clientY - halfGlow}px)`;
    };

    const createRipple = () => {
      if (!containerRef.current) return;
      const ripple = document.createElement("div");
      ripple.className = "cursor-ripple";
      containerRef.current.appendChild(ripple);

      // Remove ripple after animation
      ripple.addEventListener("animationend", () => ripple.remove());
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "BUTTON") {
        createRipple();
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onMouseOver);
    };
  }, [glowSize]);

  return (
    <>
      <style>
        {`
          .cursor-ripple {
            position: absolute;
            left: 50%;
            top: 50%;
            width: 10px;
            height: 10px;
            background: rgba(255,255,255,0.4);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: rippleAnim 0.5s ease-out forwards;
            pointer-events: none;
          }

          @keyframes rippleAnim {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
            100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
          }
        `}
      </style>

      <div ref={containerRef} style={{ position: "fixed", left: 0, top: 0, pointerEvents: "none", width: "100vw", height: "100vh", zIndex }}>
        <div
          ref={glowRef}
          aria-hidden="true"
          className={clsx(
            "fixed rounded-full pointer-events-none will-change-transform blur-[35px]",
            blendMode === "screen" && "mix-blend-screen",
            blendMode === "overlay" && "mix-blend-overlay",
            blendMode === "normal" && "mix-blend-normal",
            blendMode === "plus-lighter" && "mix-blend-plus-lighter"
          )}
          style={{
            left: 0,
            top: 0,
            width: glowSize,
            height: glowSize,
            background: `radial-gradient(circle, ${glowColor} 0% ${Math.round(softness * 100)}%, transparent 100%)`,
          }}
        />
      </div>
    </>
  );
}
