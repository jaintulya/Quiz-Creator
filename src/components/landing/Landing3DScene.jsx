import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Landing3DScene — Cinematic Full-Page Scroll-Controlled 3D Knowledge Core
 * Built with Three.js & GSAP ScrollTrigger.
 * The 3D scene evolves continuously across all 7 scenes of the landing page:
 * - Hero: Centered orbital core & floating satellites
 * - Study Modes: Tilts & shifts right to frame the pinned 3-mode card
 * - Quiz Journey: Shifts left; knowledge lines pulse to reflect problem-solving
 * - Analytics: Rearranges into an orbital telemetry arc
 * - Highlights: Editorial lateral framing
 * - Final CTA: Expands into an amber gateway portal
 */
export default function Landing3DScene({ scrollContainerRef }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090807, 0.028);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.touchAction = 'none';

    container.appendChild(renderer.domElement);

    // 2. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.75);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffd699, 2.4);
    keyLight.position.set(5, 7, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xff7722, 1.3);
    fillLight.position.set(-6, -4, 4);
    scene.add(fillLight);

    const corePointLight = new THREE.PointLight(0xf5ba72, 3.2, 14);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    // 3. Central Knowledge System Hierarchy
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // A. Outer Wireframe Knowledge Crystal (Icosahedron)
    const crystalGeo = new THREE.IcosahedronGeometry(1.65, 1);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xf5ba72,
      emissive: 0x3d1d04,
      roughness: 0.22,
      metalness: 0.85,
      wireframe: true,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    worldGroup.add(crystalMesh);

    // B. Inner Glowing Polyhedral Nucleus (Octahedron)
    const nucleusGeo = new THREE.OctahedronGeometry(0.85, 0);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0xffd699,
      emissive: 0xb45309,
      emissiveIntensity: 0.65,
      roughness: 0.12,
      metalness: 0.9,
    });
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    worldGroup.add(nucleusMesh);

    // C. Orbital Torus Ring 1 (Progress Arc)
    const ring1Geo = new THREE.TorusGeometry(2.4, 0.032, 16, 120);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0xf5ba72,
      roughness: 0.28,
      metalness: 0.82,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI / 3;
    ring1Mesh.rotation.y = Math.PI / 6;
    worldGroup.add(ring1Mesh);

    // D. Orbital Torus Ring 2 (Cross Axis)
    const ring2Geo = new THREE.TorusGeometry(2.95, 0.024, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xff9040,
      roughness: 0.35,
      metalness: 0.75,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 4;
    ring2Mesh.rotation.z = Math.PI / 5;
    worldGroup.add(ring2Mesh);

    // E. Satellite Knowledge Concept Nodes
    const satelliteCount = 7;
    const satellites = [];
    const satGeometries = [
      new THREE.TetrahedronGeometry(0.24),
      new THREE.OctahedronGeometry(0.25),
      new THREE.DodecahedronGeometry(0.22),
      new THREE.IcosahedronGeometry(0.23),
      new THREE.TetrahedronGeometry(0.2),
      new THREE.OctahedronGeometry(0.22),
      new THREE.DodecahedronGeometry(0.24),
    ];

    satGeometries.forEach((geo, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xf5ba72 : 0xff8c42,
        roughness: 0.3,
        metalness: 0.75,
        emissive: i % 2 === 0 ? 0x221100 : 0x331500,
      });
      const sat = new THREE.Mesh(geo, mat);
      const angle = (i / satelliteCount) * Math.PI * 2;
      const baseRadius = 3.3 + (i % 3) * 0.45;

      sat.position.set(
        Math.cos(angle) * baseRadius,
        Math.sin(angle * 1.6) * 1.3,
        Math.sin(angle) * baseRadius
      );

      sat.userData = {
        baseAngle: angle,
        currentAngle: angle,
        baseRadius,
        elevation: Math.sin(angle * 1.6) * 1.3,
        speed: 0.006 + (i % 3) * 0.002,
        rotX: 0.01 + Math.random() * 0.015,
        rotY: 0.012 + Math.random() * 0.015,
      };
      satellites.push(sat);
      worldGroup.add(sat);
    });

    // F. Neural Knowledge Lines (Connecting Central Core to Satellites)
    const linePositions = new Float32Array(satelliteCount * 2 * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0xf5ba72,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const knowledgeLines = new THREE.LineSegments(lineGeo, lineMat);
    worldGroup.add(knowledgeLines);

    // G. Ambient Starfield / Golden Knowledge Dust Particles
    const particleCount = 260;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 26;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 22;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 16;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xf5ba72,
      size: 0.052,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 4. Mouse Tracking & GSAP Scroll Integration
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let targetProgress = 0;
    let smoothProgress = 0;

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // GSAP ScrollTrigger instance on the landing page container
    let scrollTriggerInstance = null;
    const targetElement = scrollContainerRef?.current || document.body;

    scrollTriggerInstance = ScrollTrigger.create({
      trigger: targetElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        targetProgress = self.progress;
      },
    });

    // 5. Responsive Resize
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    // 6. 60fps Render Loop with Smooth Spatial Choreography
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Damped mouse movement (micro-parallax)
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Damped scroll progress (smooth 60fps scrub)
      if (prefersReducedMotion) {
        smoothProgress = 0;
      } else {
        smoothProgress += (targetProgress - smoothProgress) * 0.07;
      }

      const p = smoothProgress;

      // ─────────────────────────────────────────────────────────────
      // SPATIAL CHOREOGRAPHY ACROSS THE 7 SCENES:
      // - p: 0.00 -> 0.15: Hero (Centered, inviting)
      // - p: 0.15 -> 0.35: Study Modes (Shifts to right, tilts)
      // - p: 0.35 -> 0.55: Quiz Journey (Shifts to left, pulses)
      // - p: 0.55 -> 0.72: Analytics & Mastery (Fans out radially)
      // - p: 0.72 -> 0.88: Highlights (Lateral framing)
      // - p: 0.88 -> 1.00: Final CTA (Expands into gateway portal)
      // ─────────────────────────────────────────────────────────────

      let targetX = 0;
      let targetY = 0;
      let targetZ = 0;
      let targetScale = 1;
      let ringTiltX = Math.PI / 3;
      let ringTiltY = Math.PI / 6;

      if (p <= 0.15) {
        // Hero
        const t = p / 0.15;
        targetX = THREE.MathUtils.lerp(0, 1.4, t);
        targetY = THREE.MathUtils.lerp(0.15, 0.4, t);
        targetZ = THREE.MathUtils.lerp(0, -0.3, t);
        targetScale = THREE.MathUtils.lerp(1.0, 1.1, t);
      } else if (p <= 0.35) {
        // Study Modes (pinned left, 3D on right)
        const t = (p - 0.15) / 0.2;
        targetX = THREE.MathUtils.lerp(1.4, 2.3, t);
        targetY = THREE.MathUtils.lerp(0.4, 0.1, t);
        targetZ = THREE.MathUtils.lerp(-0.3, -0.6, t);
        targetScale = THREE.MathUtils.lerp(1.1, 1.0, t);
        ringTiltX = Math.PI / 3 + t * 0.5;
      } else if (p <= 0.55) {
        // Quiz Journey (pinned right, 3D on left)
        const t = (p - 0.35) / 0.2;
        targetX = THREE.MathUtils.lerp(2.3, -2.4, t);
        targetY = THREE.MathUtils.lerp(0.1, -0.2, t);
        targetZ = THREE.MathUtils.lerp(-0.6, 0.2, t);
        targetScale = THREE.MathUtils.lerp(1.0, 1.15, t);
      } else if (p <= 0.72) {
        // Analytics & Mastery
        const t = (p - 0.55) / 0.17;
        targetX = THREE.MathUtils.lerp(-2.4, 0, t);
        targetY = THREE.MathUtils.lerp(-0.2, -1.2, t);
        targetZ = THREE.MathUtils.lerp(0.2, 0.6, t);
        targetScale = THREE.MathUtils.lerp(1.15, 1.25, t);
      } else if (p <= 0.88) {
        // Platform Highlights
        const t = (p - 0.72) / 0.16;
        targetX = THREE.MathUtils.lerp(0, 2.5, t);
        targetY = THREE.MathUtils.lerp(-1.2, 0.2, t);
        targetZ = THREE.MathUtils.lerp(0.6, -0.4, t);
        targetScale = THREE.MathUtils.lerp(1.25, 0.95, t);
      } else {
        // Final CTA Gateway
        const t = (p - 0.88) / 0.12;
        targetX = THREE.MathUtils.lerp(2.5, 0, t);
        targetY = THREE.MathUtils.lerp(0.2, 0, t);
        targetZ = THREE.MathUtils.lerp(-0.4, 1.2, t);
        targetScale = THREE.MathUtils.lerp(0.95, 1.7, t);
      }

      // Smoothly apply world group positioning
      worldGroup.position.x = targetX;
      worldGroup.position.y = targetY;
      worldGroup.position.z = targetZ;
      worldGroup.scale.setScalar(targetScale);

      // Rotations scrubbed with scroll & continuous time
      crystalMesh.rotation.y = time * 0.14 + p * Math.PI * 3.5;
      crystalMesh.rotation.x = time * 0.08 + p * Math.PI;

      nucleusMesh.rotation.y = -time * 0.25 - p * Math.PI * 4;
      nucleusMesh.rotation.z = time * 0.12;

      ring1Mesh.rotation.x = ringTiltX + Math.sin(time * 0.2) * 0.1;
      ring1Mesh.rotation.y = ringTiltY + p * Math.PI * 2.5;
      ring1Mesh.rotation.z = time * 0.15;

      ring2Mesh.rotation.x = -Math.PI / 4 + p * 1.5;
      ring2Mesh.rotation.y = -time * 0.2 - p * Math.PI * 2;

      // Update Satellites & Neural Connection Lines
      const posArray = lineGeo.attributes.position.array;

      satellites.forEach((sat, i) => {
        sat.userData.currentAngle += sat.userData.speed;
        const ang = sat.userData.currentAngle + p * Math.PI * 1.8;
        const rad = sat.userData.baseRadius + Math.sin(p * Math.PI * 4 + i) * 0.4;

        sat.position.x = Math.cos(ang) * rad;
        sat.position.z = Math.sin(ang) * rad;
        sat.position.y = sat.userData.elevation + Math.sin(time + i) * 0.25;

        sat.rotation.x += sat.userData.rotX;
        sat.rotation.y += sat.userData.rotY;

        // Neural line connection from center (0,0,0) to satellite
        const idx = i * 6;
        posArray[idx] = 0;
        posArray[idx + 1] = 0;
        posArray[idx + 2] = 0;
        posArray[idx + 3] = sat.position.x;
        posArray[idx + 4] = sat.position.y;
        posArray[idx + 5] = sat.position.z;
      });

      lineGeo.attributes.position.needsUpdate = true;
      lineMat.opacity = 0.22 + Math.sin(time * 2) * 0.08 + (p > 0.3 && p < 0.6 ? 0.25 : 0);

      // Particles drift with scroll
      particles.rotation.y = time * 0.012 + p * 1.2;
      particles.position.y = p * 4;

      // Camera parallax & dolly
      camera.position.x = mouse.x * 0.35;
      camera.position.y = -mouse.y * 0.25;
      camera.position.z = 8.5 - Math.sin(p * Math.PI) * 0.8;
      camera.lookAt(targetX * 0.35, targetY * 0.35, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 7. Cleanup & Disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill();
      }

      crystalGeo.dispose();
      crystalMat.dispose();
      nucleusGeo.dispose();
      nucleusMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring1Mat.dispose();
      ring2Mat.dispose();
      satGeometries.forEach((g) => g.dispose());
      lineGeo.dispose();
      lineMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollContainerRef]);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{ pointerEvents: 'none', touchAction: 'none' }}
      aria-hidden="true"
    />
  );
}
