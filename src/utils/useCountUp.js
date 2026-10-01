import { useEffect, useState } from 'react';

/**
 * Animates a number from 0 to `end` over `duration` ms.
 * Only starts when `isActive` is true (e.g., when element enters viewport).
 */
export function useCountUp(end, duration = 1800, isActive = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isActive || !end) return;
    let startTime = null;
    const startVal = 0;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(startVal + (end - startVal) * eased));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(end);
    }

    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, isActive]);

  return count;
}
