import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Custom React hook for smooth, performant 3D parallax tilt effects.
 * Inspired by Vanilla-Tilt.js, built natively for React with zero dependencies.
 *
 * @param {Object} options
 * @param {number} options.max - Max tilt rotation in degrees (default: 10)
 * @param {number} options.perspective - 3D perspective depth in px (default: 1000)
 * @param {number} options.scale - Scale factor on hover (default: 1.02)
 * @param {number} options.speed - Transition speed in ms (default: 400)
 * @param {boolean} options.glare - Enable dynamic specular highlight (default: true)
 */
export function use3DTilt(options = {}) {
  const {
    max = 10,
    perspective = 1000,
    scale = 1.02,
    speed = 400,
    glare = true,
    reverse = false,
  } = options;

  const cardRef = useRef(null);
  const [glareStyle, setGlareStyle] = useState({ opacity: 0, x: 50, y: 50 });
  const rafId = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPct = x / rect.width;
    const yPct = y / rect.top ? y / rect.height : 0.5;

    // Calculate angles (-1 to +1)
    const xRatio = (xPct - 0.5) * 2;
    const yRatio = (yPct - 0.5) * 2;

    const rotX = (reverse ? -1 : 1) * -yRatio * max;
    const rotY = (reverse ? -1 : 1) * xRatio * max;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transform = `perspective(${perspective}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;
      }
      if (glare) {
        setGlareStyle({
          opacity: 0.15,
          x: Math.round(xPct * 100),
          y: Math.round(yPct * 100),
        });
      }
    });
  }, [max, perspective, scale, glare, reverse]);

  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
    cardRef.current.style.willChange = 'transform';
  }, [speed]);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    cardRef.current.style.transition = `transform ${speed * 1.5}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
    cardRef.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    if (glare) {
      setGlareStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [speed, perspective, glare]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave]);

  return { cardRef, glareStyle };
}
