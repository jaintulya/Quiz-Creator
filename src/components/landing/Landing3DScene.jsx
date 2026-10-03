import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Landing3DScene — High-performance interactive 3D WebGL canvas
 * Built with Three.js. Features an interactive orbital knowledge core,
 * ambient dust particles, mouse-reactive tilt, and deep scroll-linked camera dynamics.
 */
export default function Landing3DScene({ className = '' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let animationFrameId;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090807, 0.032);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffd699, 2.2);
    keyLight.position.set(5, 6, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xff8c42, 1.2);
    fillLight.position.set(-5, -3, 3);
    scene.add(fillLight);

    const coreLight = new THREE.PointLight(0xf5ba72, 2.5, 12);
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);

    // 3. Central 3D Knowledge Core (Geometric Polyhedrons & Orbital Rings)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // A. Inner Golden Wireframe Crystal
    const crystalGeo = new THREE.IcosahedronGeometry(1.6, 1);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xf5ba72,
      emissive: 0x422006,
      roughness: 0.25,
      metalness: 0.85,
      wireframe: true,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    coreGroup.add(crystalMesh);

    // B. Inner Translucent Faceted Core
    const innerCoreGeo = new THREE.OctahedronGeometry(0.9, 0);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xffd699,
      emissive: 0xb45309,
      emissiveIntensity: 0.4,
      roughness: 0.1,
      metalness: 0.9,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    coreGroup.add(innerCoreMesh);

    // C. Orbital Ring 1
    const ring1Geo = new THREE.TorusGeometry(2.35, 0.035, 16, 120);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xf5ba72,
      roughness: 0.3,
      metalness: 0.8,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ringMat);
    ring1Mesh.rotation.x = Math.PI / 3;
    ring1Mesh.rotation.y = Math.PI / 6;
    coreGroup.add(ring1Mesh);

    // D. Orbital Ring 2 (Counter-axis)
    const ring2Geo = new THREE.TorusGeometry(2.85, 0.025, 16, 120);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0xffa052,
      roughness: 0.4,
      metalness: 0.7,
    });
    const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2Mesh.rotation.x = -Math.PI / 4;
    ring2Mesh.rotation.z = Math.PI / 5;
    coreGroup.add(ring2Mesh);

    // E. Floating Satellite Knowledge Fragments
    const satellites = [];
    const satGeometries = [
      new THREE.TetrahedronGeometry(0.22),
      new THREE.OctahedronGeometry(0.25),
      new THREE.DodecahedronGeometry(0.24),
      new THREE.IcosahedronGeometry(0.2),
      new THREE.TetrahedronGeometry(0.2),
      new THREE.OctahedronGeometry(0.22),
    ];

    satGeometries.forEach((geo, i) => {
      const mat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? 0xf5ba72 : 0xff8c42,
        roughness: 0.3,
        metalness: 0.7,
      });
      const sat = new THREE.Mesh(geo, mat);
      const angle = (i / satGeometries.length) * Math.PI * 2;
      const radius = 3.4 + (i % 3) * 0.4;
      sat.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 1.5) * 1.2,
        Math.sin(angle) * radius
      );
      sat.userData = {
        angle,
        radius,
        speed: 0.005 + (i % 3) * 0.003,
        rotSpeedX: 0.01 + Math.random() * 0.02,
        rotSpeedY: 0.01 + Math.random() * 0.02,
      };
      satellites.push(sat);
      coreGroup.add(sat);
    });

    // 4. Ambient Starfield / Floating Knowledge Dust Particles
    const particleCount = 300;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * 24;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * 20;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * 16;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xf5ba72,
      size: 0.055,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Interactive Mouse & Smooth Scroll Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scrollY = 0;
    let targetScrollProgress = 0;
    let smoothScrollProgress = 0;

    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = Math.max(
        document.documentElement.scrollHeight - window.innerHeight,
        1
      );
      targetScrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Initial check
    handleScroll();

    // 6. Responsive Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 7. 60fps Animation Loop with Scroll Damping
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Damped mouse tracking
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Damped scroll progress (smooth 60fps lerp)
      smoothScrollProgress += (targetScrollProgress - smoothScrollProgress) * 0.06;

      // Base rotations
      crystalMesh.rotation.y = time * 0.16 + smoothScrollProgress * Math.PI * 1.5;
      crystalMesh.rotation.x = time * 0.1;
      innerCoreMesh.rotation.y = -time * 0.3 - smoothScrollProgress * Math.PI * 2;
      innerCoreMesh.rotation.z = time * 0.18;

      ring1Mesh.rotation.z = time * 0.2 + smoothScrollProgress * 2;
      ring2Mesh.rotation.y = -time * 0.25 - smoothScrollProgress * 2.5;

      // Orbit satellites in 3D
      satellites.forEach((sat) => {
        sat.userData.angle += sat.userData.speed;
        sat.position.x = Math.cos(sat.userData.angle) * sat.userData.radius;
        sat.position.z = Math.sin(sat.userData.angle) * sat.userData.radius;
        sat.rotation.x += sat.userData.rotSpeedX;
        sat.rotation.y += sat.userData.rotSpeedY;
      });

      // Background particles drift with time and scroll
      particles.rotation.y = time * 0.015 + smoothScrollProgress * 0.8;
      particles.rotation.x = time * 0.008;
      particles.position.y = smoothScrollProgress * 3.5;

      // Scroll scrubbing effect: core spatial journey across the whole page
      coreGroup.position.y = (0.2 - smoothScrollProgress * 1.8);
      coreGroup.position.x = Math.sin(smoothScrollProgress * Math.PI * 1.2) * 1.5;
      coreGroup.rotation.y = mouse.x * 0.35 + smoothScrollProgress * Math.PI;
      coreGroup.rotation.x = -mouse.y * 0.25;

      // Camera slight parallax tracking + scroll dolly
      camera.position.x = mouse.x * 0.5;
      camera.position.y = -mouse.y * 0.35 - smoothScrollProgress * 0.5;
      camera.position.z = 8.5 + Math.sin(smoothScrollProgress * Math.PI) * 1.2;
      camera.lookAt(0, -smoothScrollProgress * 0.8, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 8. Disposal & Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      crystalGeo.dispose();
      crystalMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ringMat.dispose();
      ring2Mat.dispose();
      satGeometries.forEach((g) => g.dispose());
      particleGeo.dispose();
      particleMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`pointer-events-none overflow-hidden ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
