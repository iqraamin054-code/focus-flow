import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function isWebGLAvailable(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const LandingScene3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (!isWebGLAvailable() || prefersReducedMotion()) return;

    const canvas = canvasRef.current;
    let isRunning = true;
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scrollProgress = 0;
    const clock = new THREE.Clock();

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030318, 0.012);

    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 200);
    camera.position.set(0, 0, 30);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: window.devicePixelRatio < 2,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Particle Texture
    const particleTexCanvas = document.createElement('canvas');
    particleTexCanvas.width = 64;
    particleTexCanvas.height = 64;
    const pCtx = particleTexCanvas.getContext('2d')!;
    const half = 32;
    const gradient = pCtx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.15)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    pCtx.fillStyle = gradient;
    pCtx.fillRect(0, 0, 64, 64);
    const particleTexture = new THREE.CanvasTexture(particleTexCanvas);

    // Particles
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 350 : 800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const phases = new Float32Array(count);

    const cyan = new THREE.Color(0x22d3ee);
    const violet = new THREE.Color(0xa78bfa);
    const amber = new THREE.Color(0xfbbf24);
    const white = new THREE.Color(0xe0e7ff);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const radius = 8 + Math.random() * 55;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi) - 10;

      const r = Math.random();
      let color;
      if (r < 0.4) color = cyan;
      else if (r < 0.6) color = violet;
      else if (r < 0.78) color = white;
      else color = amber;

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      speeds[i] = 0.05 + Math.random() * 0.15;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pMat = new THREE.PointsMaterial({
      size: isMobile ? 0.18 : 0.22,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);
    const origPositions = new Float32Array(positions);

    // Orb Group
    const orbGroup = new THREE.Group();

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireframe = new THREE.Mesh(new THREE.IcosahedronGeometry(5, 2), wireMat);
    orbGroup.add(wireframe);

    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.45,
    });
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(5, 1)),
      edgesMat
    );
    orbGroup.add(edges);

    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const glowSphere = new THREE.Mesh(new THREE.SphereGeometry(3.8, 32, 32), glowMat);
    orbGroup.add(glowSphere);

    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    const core = new THREE.Mesh(new THREE.SphereGeometry(1.2, 24, 24), coreMat);
    orbGroup.add(core);

    orbGroup.position.set(7, 1.5, -5);
    scene.add(orbGroup);

    // Orbital Rings
    const rings: THREE.Mesh[] = [];
    const ringConfigs = [
      { radius: 7.0, tube: 0.02, rotX: 0.3, rotZ: 0.2, speed: 0.08, opacity: 0.25 },
      { radius: 9.5, tube: 0.02, rotX: -0.5, rotZ: 0.4, speed: -0.05, opacity: 0.18 },
      { radius: 12, tube: 0.015, rotX: 0.8, rotZ: -0.3, speed: 0.03, opacity: 0.12 },
    ];

    for (const cfg of ringConfigs) {
      const rGeo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
      const rMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: cfg.opacity,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(rGeo, rMat);
      ringMesh.rotation.x = cfg.rotX;
      ringMesh.rotation.z = cfg.rotZ;
      ringMesh.position.copy(orbGroup.position);
      ringMesh.userData.speed = cfg.speed;
      rings.push(ringMesh);
      scene.add(ringMesh);
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0x111133, 0.3);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 2.5, 60);
    cyanLight.position.set(10, 4, -3);
    scene.add(cyanLight);

    const amberLight = new THREE.PointLight(0xfbbf24, 1.5, 50);
    amberLight.position.set(-8, -3, 5);
    scene.add(amberLight);

    const violetLight = new THREE.PointLight(0xa78bfa, 1.0, 40);
    violetLight.position.set(0, 8, -15);
    scene.add(violetLight);

    // Event Listeners
    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    };

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    let animationReqId: number;

    const animate = () => {
      if (!isRunning) return;
      animationReqId = requestAnimationFrame(animate);

      const elapsed = clock.getElapsedTime();

      // Mouse lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Camera parallax
      const scrollOffset = scrollProgress * 12;
      camera.position.x = mouse.x * 1.8;
      camera.position.y = mouse.y * 1.2 - scrollOffset * 0.15;
      camera.position.z = 30 - scrollOffset * 0.5;
      camera.lookAt(0, -scrollOffset * 0.1, -10);

      // Particle drift
      const posAttr = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const phase = phases[i];
        const speed = speeds[i];

        arr[i3] = origPositions[i3] + Math.sin(elapsed * speed + phase) * 1.5;
        arr[i3 + 1] = origPositions[i3 + 1] + Math.cos(elapsed * speed * 0.7 + phase) * 1.2;
        arr[i3 + 2] = origPositions[i3 + 2] + Math.sin(elapsed * speed * 0.5 + phase * 1.3) * 0.8;
      }
      posAttr.needsUpdate = true;

      particles.rotation.y = elapsed * 0.008;
      particles.rotation.x = Math.sin(elapsed * 0.003) * 0.05;

      // Orb animation
      wireframe.rotation.y = elapsed * 0.12;
      wireframe.rotation.x = elapsed * 0.06;
      edges.rotation.y = elapsed * 0.12;
      edges.rotation.x = elapsed * 0.06;

      orbGroup.rotation.x = mouse.y * 0.15;
      orbGroup.rotation.y = mouse.x * 0.15;

      const pulse = Math.sin(elapsed * 1.8) * 0.5 + 0.5;
      coreMat.opacity = 0.3 + pulse * 0.35;
      core.scale.setScalar(1 + pulse * 0.15);
      glowMat.opacity = 0.04 + pulse * 0.04;

      const orbScale = 1 - scrollProgress * 0.3;
      orbGroup.scale.setScalar(Math.max(orbScale, 0.4));
      orbGroup.position.y = 1.5 - scrollProgress * 8;

      for (const ring of rings) {
        ring.rotation.y += (ring.userData.speed as number) * 0.016;
        ring.position.y = orbGroup.position.y;
        ring.scale.setScalar(Math.max(orbScale, 0.4));
      }

      cyanLight.position.y = orbGroup.position.y + 3;
      cyanLight.intensity = 2.0 + pulse * 1.0;

      pMat.opacity = Math.max(0.85 - scrollProgress * 0.4, 0.3);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isRunning = false;
      if (animationReqId) cancelAnimationFrame(animationReqId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);

      renderer.dispose();
      particleTexture.dispose();
      pGeo.dispose();
      pMat.dispose();

      scene.traverse((obj) => {
        if ('geometry' in obj && obj.geometry) (obj.geometry as THREE.BufferGeometry).dispose();
        if ('material' in obj && obj.material) {
          const mat = obj.material as THREE.Material | THREE.Material[];
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        }
      });
    };
  }, []);

  return <canvas ref={canvasRef} id="landing-3d-canvas" className="landing-canvas" />;
};
