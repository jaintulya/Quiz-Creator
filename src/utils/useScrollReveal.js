import { useEffect, useRef, useState } from 'react';

/**
 * Returns [ref, isVisible] - element becomes visible when it enters the viewport.
 * Use with CSS classes to trigger staggered entrance animations.
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once !== false) observer.unobserve(el);
        }
      },
      { threshold: options.threshold ?? 0.12, rootMargin: options.rootMargin ?? '0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}
