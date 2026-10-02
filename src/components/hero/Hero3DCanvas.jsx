import { useEffect, useRef } from 'react';

/**
 * Hero3DCanvas - Interactive 3D Geometric Crystal with Mouse Parallax
 *
 * Lightweight, 60fps 3D canvas rendering an interactive geometric crystal
 * with vertices and connecting filaments in warm amber and gold tones.
 * Damps rotation towards cursor position for interactive tactile depth.
 */
export default function Hero3DCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1));
    let height = (canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1));

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      height = canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
    };

    window.addEventListener('resize', handleResize);

    // 3D Vertices for a stylized Icosahedron / Crystal
    const phi = (1 + Math.sqrt(5)) / 2;
    const rawVertices = [
      [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
      [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
      [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1],
    ].map(([x, y, z]) => {
      const len = Math.sqrt(x * x + y * y + z * z);
      return [x / len, y / len, z / len];
    });

    // Edges connecting vertices
    const edges = [];
    for (let i = 0; i < rawVertices.length; i++) {
      for (let j = i + 1; j < rawVertices.length; j++) {
        const dx = rawVertices[i][0] - rawVertices[j][0];
        const dy = rawVertices[i][1] - rawVertices[j][1];
        const dz = rawVertices[i][2] - rawVertices[j][2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        // Connect nearby vertices (threshold for icosahedron ~1.05)
        if (dist > 0.9 && dist < 1.2) {
          edges.push([i, j]);
        }
      }
    }

    // Particle dust floating around crystal
    const particles = Array.from({ length: 24 }, () => ({
      x: (Math.random() - 0.5) * 2.2,
      y: (Math.random() - 0.5) * 2.2,
      z: (Math.random() - 0.5) * 2.2,
      size: Math.random() * 2 + 1,
      speed: (Math.random() * 0.005 + 0.002) * (Math.random() > 0.5 ? 1 : -1),
    }));

    let rotX = 0.2;
    let rotY = 0.4;
    let targetRotX = 0.2;
    let targetRotY = 0.4;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.5;
      targetRotX = -y * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Render loop
    const render = () => {
      // Smooth lerp towards target rotation + gentle auto spin
      rotX += (targetRotX - rotX) * 0.05 + 0.002;
      rotY += (targetRotY - rotY) * 0.05 + 0.005;

      ctx.clearRect(0, 0, width, height);

      const dpr = window.devicePixelRatio || 1;
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.32;
      const cameraDistance = 3.2;

      // 3D rotation helper
      const project = ([x, y, z]) => {
        // Rotate Y
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;

        // Rotate X
        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;

        // Perspective projection
        const depth = cameraDistance + z2;
        const fov = 1.8 / Math.max(0.2, depth);
        return {
          px: cx + x1 * scale * fov,
          py: cy + y2 * scale * fov,
          z: z2,
          alpha: Math.max(0.15, Math.min(1, (z2 + 1) / 2)),
        };
      };

      // Draw Edges
      ctx.lineWidth = 1.2 * dpr;
      for (const [i, j] of edges) {
        const p1 = project(rawVertices[i]);
        const p2 = project(rawVertices[j]);

        const avgAlpha = (p1.alpha + p2.alpha) / 2;
        ctx.strokeStyle = `rgba(245, 186, 114, ${avgAlpha * 0.4})`;

        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }

      // Draw Vertex Nodes
      for (let i = 0; i < rawVertices.length; i++) {
        const p = project(rawVertices[i]);
        const radius = (2.5 + p.z * 1.2) * dpr;

        // Glow
        const gradient = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, radius * 3.5);
        gradient.addColorStop(0, `rgba(245, 186, 114, ${p.alpha * 0.9})`);
        gradient.addColorStop(0.5, `rgba(240, 154, 62, ${p.alpha * 0.4})`);
        gradient.addColorStop(1, 'rgba(245, 186, 114, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.px, p.py, radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(1, radius * 0.7), 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw orbiting micro-particles
      for (const pt of particles) {
        pt.x += pt.speed;
        if (Math.abs(pt.x) > 1.4) pt.speed = -pt.speed;
        const p = project([pt.x, pt.y, pt.z]);

        ctx.fillStyle = `rgba(254, 215, 170, ${p.alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, pt.size * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none select-none ${className}`}
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}
