/**
 * MIGRATION CANDIDATE — landing-scene.js
 *
 * This file is NOT loaded by the browser. The LandingScene class and
 * isWebGLAvailable function have been migrated to:
 *   - src/components/LandingScene3D.tsx
 *
 * Safe to delete after build verification passes.
 */

import * as THREE from 'three';

/**
 * LandingScene — Full-screen Three.js WebGL background for the landing page.
 *
 * Creates an immersive 3D atmosphere with:
 *   - Floating particle system (cyan/violet/amber)
 *   - Wireframe icosahedron orb with inner glow
 *   - 3 orbital rings at different angles
 *   - Dynamic point lights
 *   - Mouse-reactive parallax camera
 *   - Scroll-driven camera movement
 */
export class LandingScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0;
    this.isRunning = true;
    this.clock = new THREE.Clock();

    this.init();
    this.createParticles();
    this.createOrb();
    this.createOrbitalRings();
    this.createLights();
    this.addEventListeners();
    this.animate();
  }

  /* ---------- Setup ---------- */

  init() {
    // Scene + fog for atmospheric depth
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030318, 0.012);

    // Perspective camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 200);
    this.camera.position.set(0, 0, 30);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: window.devicePixelRatio < 2,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
  }

  /* ---------- Particle System ---------- */

  createParticleTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,0.6)');
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.15)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }

  createParticles() {
    const isMobile = window.innerWidth < 768;
    this.particleCount = isMobile ? 350 : 800;
    const count = this.particleCount;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const speeds = new Float32Array(count);     // drift speed per particle
    const phases = new Float32Array(count);     // unique phase offset

    const cyan   = new THREE.Color(0x22d3ee);
    const violet = new THREE.Color(0xa78bfa);
    const amber  = new THREE.Color(0xfbbf24);
    const white  = new THREE.Color(0xe0e7ff);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Distribute in a large sphere volume
      const radius = 8 + Math.random() * 55;
      const theta  = Math.random() * Math.PI * 2;
      const phi    = Math.acos(2 * Math.random() - 1);

      positions[i3]     = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi) - 10; // shift depth

      // Color distribution
      const r = Math.random();
      let color;
      if      (r < 0.40) color = cyan;
      else if (r < 0.60) color = violet;
      else if (r < 0.78) color = white;
      else                color = amber;

      colors[i3]     = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      speeds[i] = 0.05 + Math.random() * 0.15;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: isMobile ? 0.18 : 0.22,
      map: this.createParticleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);

    // Store arrays for animation
    this._pSpeeds = speeds;
    this._pPhases = phases;
    this._pOrigPositions = new Float32Array(positions);
  }

  /* ---------- Wireframe Orb ---------- */

  createOrb() {
    this.orbGroup = new THREE.Group();

    // Outer wireframe icosahedron (detail 2 for more facets)
    const icoGeo = new THREE.IcosahedronGeometry(5, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    this.wireframe = new THREE.Mesh(icoGeo, wireMat);
    this.orbGroup.add(this.wireframe);

    // Brighter edge lines
    const edgesGeo = new THREE.EdgesGeometry(
      new THREE.IcosahedronGeometry(5, 1)
    );
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.45,
    });
    this.edges = new THREE.LineSegments(edgesGeo, edgesMat);
    this.orbGroup.add(this.edges);

    // Inner glow sphere
    const glowGeo = new THREE.SphereGeometry(3.8, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    this.glowSphere = new THREE.Mesh(glowGeo, glowMat);
    this.orbGroup.add(this.glowSphere);

    // Bright core
    const coreGeo = new THREE.SphereGeometry(1.2, 24, 24);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending,
    });
    this.core = new THREE.Mesh(coreGeo, coreMat);
    this.orbGroup.add(this.core);

    // Position orb to right-center of viewport
    this.orbGroup.position.set(7, 1.5, -5);
    this.scene.add(this.orbGroup);
  }

  /* ---------- Orbital Rings ---------- */

  createOrbitalRings() {
    this.rings = [];
    const ringConfigs = [
      { radius: 7.0, tube: 0.02, rotX: 0.3, rotZ: 0.2,  speed:  0.08, opacity: 0.25 },
      { radius: 9.5, tube: 0.02, rotX: -0.5, rotZ: 0.4, speed: -0.05, opacity: 0.18 },
      { radius: 12,  tube: 0.015, rotX: 0.8, rotZ: -0.3, speed:  0.03, opacity: 0.12 },
    ];

    for (const cfg of ringConfigs) {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: cfg.opacity,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = cfg.rotX;
      mesh.rotation.z = cfg.rotZ;
      mesh.position.copy(this.orbGroup.position);
      mesh.userData.speed = cfg.speed;
      this.rings.push(mesh);
      this.scene.add(mesh);
    }
  }

  /* ---------- Lights ---------- */

  createLights() {
    // Very dim ambient
    this.ambientLight = new THREE.AmbientLight(0x111133, 0.3);
    this.scene.add(this.ambientLight);

    // Cyan point light near orb
    this.cyanLight = new THREE.PointLight(0x22d3ee, 2.5, 60);
    this.cyanLight.position.set(10, 4, -3);
    this.scene.add(this.cyanLight);

    // Amber point light opposite side
    this.amberLight = new THREE.PointLight(0xfbbf24, 1.5, 50);
    this.amberLight.position.set(-8, -3, 5);
    this.scene.add(this.amberLight);

    // Violet accent light from behind
    this.violetLight = new THREE.PointLight(0xa78bfa, 1.0, 40);
    this.violetLight.position.set(0, 8, -15);
    this.scene.add(this.violetLight);
  }

  /* ---------- Events ---------- */

  addEventListeners() {
    // Mouse tracking
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Scroll tracking
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    }, { passive: true });

    // Resize
    window.addEventListener('resize', () => this.onResize());

    // Visibility — pause when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.isRunning = false;
      } else {
        this.isRunning = true;
        this.clock.getDelta(); // reset delta to avoid jump
        this.animate();
      }
    });
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  /* ---------- Animation Loop ---------- */

  animate() {
    if (!this.isRunning) return;
    requestAnimationFrame(() => this.animate());

    const elapsed = this.clock.getElapsedTime();
    const delta   = Math.min(this.clock.getDelta(), 0.05);

    // ---- Smooth mouse lerp ----
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.04;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.04;

    // ---- Camera parallax ----
    const scrollOffset = this.scrollProgress * 12;
    this.camera.position.x = this.mouse.x * 1.8;
    this.camera.position.y = this.mouse.y * 1.2 - scrollOffset * 0.15;
    this.camera.position.z = 30 - scrollOffset * 0.5;
    this.camera.lookAt(0, -scrollOffset * 0.1, -10);

    // ---- Particle drift ----
    const posAttr = this.particles.geometry.getAttribute('position');
    const arr = posAttr.array;
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const phase = this._pPhases[i];
      const speed = this._pSpeeds[i];

      arr[i3]     = this._pOrigPositions[i3]     + Math.sin(elapsed * speed + phase) * 1.5;
      arr[i3 + 1] = this._pOrigPositions[i3 + 1] + Math.cos(elapsed * speed * 0.7 + phase) * 1.2;
      arr[i3 + 2] = this._pOrigPositions[i3 + 2] + Math.sin(elapsed * speed * 0.5 + phase * 1.3) * 0.8;
    }
    posAttr.needsUpdate = true;

    // Subtle overall particle rotation
    this.particles.rotation.y = elapsed * 0.008;
    this.particles.rotation.x = Math.sin(elapsed * 0.003) * 0.05;

    // ---- Orb animation ----
    this.wireframe.rotation.y = elapsed * 0.12;
    this.wireframe.rotation.x = elapsed * 0.06;
    this.edges.rotation.y = elapsed * 0.12;
    this.edges.rotation.x = elapsed * 0.06;

    // Mouse-reactive tilt on the orb
    this.orbGroup.rotation.x = this.mouse.y * 0.15;
    this.orbGroup.rotation.y = this.mouse.x * 0.15;

    // Core pulse
    const pulse = Math.sin(elapsed * 1.8) * 0.5 + 0.5;
    this.core.material.opacity = 0.3 + pulse * 0.35;
    this.core.scale.setScalar(1 + pulse * 0.15);
    this.glowSphere.material.opacity = 0.04 + pulse * 0.04;

    // Scroll: orb drifts up and shrinks
    const orbScale = 1 - this.scrollProgress * 0.3;
    this.orbGroup.scale.setScalar(Math.max(orbScale, 0.4));
    this.orbGroup.position.y = 1.5 - this.scrollProgress * 8;

    // ---- Orbital rings ----
    for (const ring of this.rings) {
      ring.rotation.y += ring.userData.speed * 0.016;
      ring.position.y = this.orbGroup.position.y;
      ring.scale.setScalar(Math.max(orbScale, 0.4));
    }

    // ---- Lights follow orb ----
    this.cyanLight.position.y = this.orbGroup.position.y + 3;
    this.cyanLight.intensity = 2.0 + pulse * 1.0;

    // ---- Scroll fade ----
    // Particles fade slightly as user scrolls deep
    this.particles.material.opacity = Math.max(0.85 - this.scrollProgress * 0.4, 0.3);

    this.renderer.render(this.scene, this.camera);
  }

  /* ---------- Cleanup ---------- */

  destroy() {
    this.isRunning = false;
    this.renderer.dispose();
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    });
  }
}

/* ---------- WebGL support check ---------- */

export function isWebGLAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}
