// ============================================================
// motion.js — Cinematic Interactive Motion System
// Comet-style interactive effects with constellation physics
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========================================
  // THREE.JS INTERACTIVE STAR FIELD (Comet-style)
  // ========================================
  if (typeof THREE !== 'undefined' && !prefersReducedMotion) {
    const container = document.querySelector('.star-field');
    if (container) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 50;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Interactive star particles
      const starCount = 2000;
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);
      const starSizes = new Float32Array(starCount);
      const starVelocities = [];
      const starOriginalPos = new Float32Array(starCount * 3);

      const colors = [
        new THREE.Color(0xa8c5e6),  // Type-O Systems
        new THREE.Color(0xf4d58d),  // Type-F Full-Stack
        new THREE.Color(0xe67350),  // Type-K ML
        new THREE.Color(0x4a7c9e),  // Type-M Database
        new THREE.Color(0xffffff),  // Neutral
        new THREE.Color(0xffffff),  // Weighted more white
      ];

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        const x = (Math.random() - 0.5) * 200;
        const y = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 100;

        starPositions[i3] = x;
        starPositions[i3 + 1] = y;
        starPositions[i3 + 2] = z;

        starOriginalPos[i3] = x;
        starOriginalPos[i3 + 1] = y;
        starOriginalPos[i3 + 2] = z;

        const color = colors[Math.floor(Math.random() * colors.length)];
        starColors[i3] = color.r;
        starColors[i3 + 1] = color.g;
        starColors[i3 + 2] = color.b;

        starSizes[i] = Math.random() * 2 + 0.5;

        starVelocities.push({
          x: (Math.random() - 0.5) * 0.015,
          y: (Math.random() - 0.5) * 0.015,
          z: (Math.random() - 0.5) * 0.008
        });
      }

      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
      starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

      const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          mouse: { value: new THREE.Vector2(0, 0) },
          pixelRatio: { value: renderer.getPixelRatio() }
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          uniform float time;
          uniform vec2 mouse;
          uniform float pixelRatio;

          void main() {
            vColor = color;
            vec3 pos = position;

            // Mouse interaction - gravitational lensing
            vec2 mouseWorld = mouse * 100.0;
            vec2 toMouse = mouseWorld - pos.xy;
            float dist = length(toMouse);
            float influence = smoothstep(60.0, 0.0, dist);
            pos.xy += normalize(toMouse) * influence * 3.0;

            // Gentle breathing drift
            pos.x += sin(time * 0.3 + position.y * 0.05) * 0.3;
            pos.y += cos(time * 0.2 + position.x * 0.05) * 0.3;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * pixelRatio * (200.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;

          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;

            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            float glow = exp(-dist * 3.0);

            gl_FragColor = vec4(vColor, alpha * 0.8 + glow * 0.4);
          }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);

      // ========================================
      // CONSTELLATION LINES (drawn on cluster hover)
      // ========================================
      const constellationLines = [];
      const lineGroup = new THREE.Group();
      scene.add(lineGroup);

      // Create procedural constellation lines that activate on hover
      const numConstellations = 5;
      for (star in {}) {}

      // Simpler: store line segments that fade in/out based on mouse proximity
      const lineCount = 40;
      const lineGeometry = new THREE.BufferGeometry();
      const linePositions = new Float32Array(lineCount * 2 * 3);
      const lineColors = new Float32Array(lineCount * 2 * 3);
      const lineOpacities = new Float32Array(lineCount * 2);

      for (let i = 0; i < lineCount; i++) {
        const i6 = i * 6;
        const startIdx = Math.floor(Math.random() * starCount);
        const endIdx = Math.floor(Math.random() * starCount);

        linePositions[i6] = starOriginalPos[startIdx * 3];
        linePositions[i6 + 1] = starOriginalPos[startIdx * 3 + 1];
        linePositions[i6 + 2] = starOriginalPos[startIdx * 3 + 2];
        linePositions[i6 + 3] = starOriginalPos[endIdx * 3];
        linePositions[i6 + 4] = starOriginalPos[endIdx * 3 + 1];
        linePositions[i6 + 5] = starOriginalPos[endIdx * 3 + 2];

        const color = new THREE.Color(0xa8c5e6);
        lineColors[i6] = color.r;
        lineColors[i6 + 1] = color.g;
        lineColors[i6 + 2] = color.b;
        lineColors[i6 + 3] = color.r;
        lineColors[i6 + 4] = color.g;
        lineColors[i6 + 5] = color.b;

        lineOpacities[i * 2] = 0;
        lineOpacities[i * 2 + 1] = 0;
      }

      const linePositionAttr = new THREE.BufferAttribute(linePositions, 3);
      const lineColorAttr = new THREE.BufferAttribute(lineColors, 3);
      const lineOpacityAttr = new THREE.BufferAttribute(lineOpacities, 1);

      lineGeometry.setAttribute('position', linePositionAttr);
      lineGeometry.setAttribute('color', lineColorAttr);
      lineGeometry.setAttribute('opacity', lineOpacityAttr);

      const lineMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          attribute float opacity;
          varying vec3 vColor;
          varying float vOpacity;
          void main() {
            vColor = color;
            vOpacity = opacity;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vOpacity;
          void main() {
            gl_FragColor = vec4(vColor, vOpacity * 0.3);
          }
        `,
        transparent: true,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      lineGroup.add(lines);

      // Track hover state for constellation activation
      let constellationActive = false;
      let mouseHoverIntensity = 0;

      // Mouse tracking for interaction
      const mouse = { x: 0, y: 0 };
      const targetMouse = { x: 0, y: 0 };

      document.addEventListener('mousemove', (e) => {
        targetMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      });

      // Detect hover over clusters
      document.querySelectorAll('.star-cluster').forEach(cluster => {
        cluster.addEventListener('mouseenter', () => {
          constellationActive = true;
        });
        cluster.addEventListener('mouseleave', () => {
          constellationActive = false;
        });
      });

      // Animation loop
      let time = 0;
      function animate() {
        requestAnimationFrame(animate);
        time += 0.016;

        // Smooth mouse following
        mouse.x += (targetMouse.x - mouse.x) * 0.05;
        mouse.y += (targetMouse.y - mouse.y) * 0.05;

        starMaterial.uniforms.time.value = time;
        starMaterial.uniforms.mouse.value.set(mouse.x, mouse.y);

        // Smooth constellation intensity
        mouseHoverIntensity += ((constellationActive ? 1 : 0) - mouseHoverIntensity) * 0.05;

        // Update line opacity based on hover proximity
        const opacities = lineGeometry.attributes.opacity.array;
        for (let i = 0; i < lineCount; i++) {
          const i2 = i * 2;
          opacities[i2] = mouseHoverIntensity * (0.5 + Math.sin(time * 2 + i) * 0.3);
          opacities[i2 + 1] = mouseHoverIntensity * (0.5 + Math.sin(time * 2 + i + 1) * 0.3);
        }
        lineGeometry.attributes.opacity.needsUpdate = true;

        // Update star positions for comet effect
        const positions = starGeometry.attributes.position.array;
        for (let i = 0; i < starCount; i++) {
          const i3 = i * 3;
          positions[i3] += starVelocities[i].x;
          positions[i3 + 1] += starVelocities[i].y;
          positions[i3 + 2] += starVelocities[i].z;

          // Wrap around
          if (positions[i3] > 100) positions[i3] = -100;
          if (positions[i3] < -100) positions[i3] = 100;
          if (positions[i3 + 1] > 100) positions[i3 + 1] = -100;
          if (positions[i3 + 1] < -100) positions[i3 + 1] = 100;
        }
        starGeometry.attributes.position.needsUpdate = true;

        // Subtle camera movement
        camera.position.x += (mouse.x * 5 - camera.position.x) * 0.02;
        camera.position.y += (mouse.y * 5 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        starMaterial.uniforms.pixelRatio.value = renderer.getPixelRatio();
      });

      container.style.background = 'none';
    }
  }

  // ========================================
  // SIMPLE GSAP REVEALS (no scroll hijacking)
  // ========================================
  if (typeof gsap !== 'undefined') {
    // Simple fade-in on load for hero
    gsap.from('.mission-badge', {
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      delay: 0.2,
      ease: 'power3.out'
    });

    gsap.from('.coordinate-display', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.4,
      ease: 'power3.out'
    });

    gsap.from('.stellar-markers .stellar-marker', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.1,
      delay: 0.6,
      ease: 'power2.out'
    });

    gsap.from('.primary-action, .spectral-readouts', {
      opacity: 0,
      y: 20,
      duration: 0.5,
      delay: 0.8,
      ease: 'power2.out'
    });

    // Intersection observer for scroll reveals
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out'
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.stellar-system, .star-cluster, .observatory-panel, .achievement-category').forEach(el => {
      gsap.set(el, { opacity: 0, y: 40 });
      observer.observe(el);
    });
  }

  // ========================================
  // LIGHTWEIGHT CURSOR EFFECT
  // ========================================
  if (!prefersReducedMotion && window.innerWidth > 768) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
    document.body.appendChild(cursor);

    const cursorStyles = document.createElement('style');
    cursorStyles.textContent = `
      .cursor-glow {
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: screen;
      }
      .cursor-dot {
        position: absolute;
        width: 6px;
        height: 6px;
        background: #a8c5e6;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 15px #a8c5e6;
      }
      .cursor-ring {
        position: absolute;
        width: 30px;
        height: 30px;
        border: 1px solid rgba(168, 197, 230, 0.4);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: transform 0.2s ease, border-color 0.2s;
      }
      .cursor-glow.hovering .cursor-ring {
        transform: translate(-50%, -50%) scale(1.3);
        border-color: rgba(168, 197, 230, 0.7);
      }
    `;
    document.head.appendChild(cursorStyles);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    document.querySelectorAll('a, button, .stellar-marker, .constellation-star').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  // ========================================
  // SUBTLE HOVER GLOW ON CARDS
  // ========================================
  if (!prefersReducedMotion) {
    document.querySelectorAll('.stellar-marker, .stellar-system').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  }

  // ========================================
  // MAGNETIC HOVER PHYSICS (cards pull toward cursor)
  // ========================================
  if (!prefersReducedMotion && window.innerWidth > 768) {
    const magneticCards = document.querySelectorAll('.stellar-system, .stellar-marker, .tech-node, .constellation-star');

    magneticCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.05;
        const deltaY = (e.clientY - centerY) * 0.05;

        card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  // ========================================
  // SCROLL PROGRESS (lightweight)
  // ========================================
  const progressBar = document.createElement('div');
  progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
  progressBar.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:2px;background:rgba(10,13,20,0.5);z-index:10000;';
  document.body.appendChild(progressBar);

  const progressStyles = document.createElement('style');
  progressStyles.textContent = `
    .scroll-progress-bar {
      height:100%;
      width:0%;
      background:linear-gradient(90deg,#a8c5e6,#f4d58d,#e67350);
      transition:width 0.1s;
    }
  `;
  document.head.appendChild(progressStyles);

  const progressBarInner = progressBar.querySelector('.scroll-progress-bar');
  window.addEventListener('scroll', () => {
    const progress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progressBarInner.style.width = `${progress}%`;
  }, { passive: true });

  console.log('%c✧ Motion System Ready ✧', 'color:#a8c5e6;font-family:monospace;');
});
