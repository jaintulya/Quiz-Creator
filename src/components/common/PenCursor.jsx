import { useState, useEffect, useRef } from 'react';

/**
 * Custom Pen / Stylus Cursor for QuizCraft
 * ONLY active on Laptop / Desktop devices with fine mouse pointers.
 * Completely disabled on mobile phones and touchscreens to prevent floating or erratic behavior.
 */
export default function PenCursor() {
  const [isSupported, setIsSupported] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [ripples, setRipples] = useState([]);

  const cursorRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Strict Laptop / Desktop pointer verification:
    // Requires both hover capability AND fine pointer (mouse/trackpad).
    const finePointerMedia = window.matchMedia('(hover: hover) and (pointer: fine)');

    const isLaptopOrDesktop = () => {
      const hasTouchOnly = 'ontouchstart' in window && !finePointerMedia.matches;
      return finePointerMedia.matches && window.innerWidth >= 768 && !hasTouchOnly;
    };

    if (!isLaptopOrDesktop()) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    document.body.classList.add('has-pen-cursor');

    // 2. Touch event safeguard:
    // If a touch interaction ever occurs (e.g., hybrid 2-in-1 device switched to tablet mode),
    // immediately disable the custom cursor so it never floats randomly.
    const handleTouch = () => {
      setIsSupported(false);
      document.body.classList.remove('has-pen-cursor');
    };
    window.addEventListener('touchstart', handleTouch, { passive: true, once: true });

    // 3. 60/120fps Hardware-accelerated cursor tracking
    const onMouseMove = (e) => {
      if (!visible) setVisible(true);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check if hovering over an interactive or clickable element
      const target = e.target;
      const isClickable = Boolean(
        target &&
        target.closest(
          'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"], .cursor-pointer, .glass-card-hover'
        )
      );
      setIsHovering(isClickable);
    };

    const onMouseDown = (e) => {
      setIsClicking(true);
      // Spawn small ink drop ripple at exact click point
      const rippleId = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-4), { id: rippleId, x: e.clientX, y: e.clientY }]);
    };

    const onMouseUp = () => {
      setIsClicking(false);
    };

    const onMouseEnter = () => {
      setVisible(true);
    };

    const onMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      document.body.classList.remove('has-pen-cursor');
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  if (!isSupported) return null;

  return (
    <>
      {/* Ink Click Ripples (Expands and fades on click) */}
      {ripples.map((rip) => (
        <span
          key={rip.id}
          onAnimationEnd={() => setRipples((prev) => prev.filter((r) => r.id !== rip.id))}
          className="fixed pointer-events-none rounded-full border border-amber-400/50 animate-ink-ripple z-[9998]"
          style={{
            left: rip.x - 7,
            top: rip.y - 7,
            width: 14,
            height: 14,
          }}
        />
      ))}

      {/* Custom Pen Cursor Container */}
      <div
        ref={cursorRef}
        className={`fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-150 will-change-transform ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: 'translate3d(-100px, -100px, 0)',
        }}
      >
        <div
          className={`transition-transform duration-150 origin-top-left ${
            isClicking
              ? 'scale-90 rotate-[-12deg]'
              : isHovering
              ? 'rotate-[-8deg] scale-105'
              : 'rotate-0 scale-100'
          }`}
        >
          {/* Beautiful Crafted SVG Pen Pointer */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[1px_2px_3px_rgba(0,0,0,0.5)]"
          >
            {/* Nib (Tip touches 0, 0 perfectly) */}
            <path
              d="M0 0 L2.8 7.5 L7.5 2.8 Z"
              fill={isHovering ? '#ffe3b3' : '#ffd699'}
              stroke="#b45309"
              strokeWidth="0.5"
            />
            {/* Ink Slit & Breather Hole */}
            <line x1="0" y1="0" x2="3.4" y2="3.4" stroke="#451a03" strokeWidth="0.6" />
            <circle cx="3.4" cy="3.4" r="0.65" fill="#451a03" />

            {/* Grip Collar / Metallic Ring */}
            <path
              d="M2.8 7.5 L7.5 2.8 L10.5 5.8 L5.8 10.5 Z"
              fill="#f5ba72"
              stroke="#d97706"
              strokeWidth="0.4"
            />

            {/* Pen Barrel */}
            <path
              d="M5.8 10.5 L10.5 5.8 L22 17.3 C23.6 18.9 23.6 21.5 22 23.1 C20.4 24.7 17.8 24.7 16.2 23.1 L5.8 10.5 Z"
              fill="#181512"
              stroke="#f5ba72"
              strokeWidth="0.7"
            />

            {/* Golden Clip / Stripe */}
            <line
              x1="8"
              y1="8"
              x2="20.5"
              y2="20.5"
              stroke="#ffd699"
              strokeWidth="0.9"
              strokeLinecap="round"
            />

            {/* Subtle Metallic Highlight along Barrel */}
            <line
              x1="9"
              y1="6.5"
              x2="19.5"
              y2="17"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="0.6"
              strokeLinecap="round"
            />
          </svg>

          {/* Tiny subtle ink dot indicator on hover */}
          {isHovering && (
            <span
              className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 rounded-full bg-amber-400 opacity-80"
              style={{ pointerEvents: 'none' }}
            />
          )}
        </div>
      </div>
    </>
  );
}
