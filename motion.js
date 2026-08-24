// ============================================================
// motion.js — Advanced Motion Graphics & Scroll Effects
// Lenis smooth scroll + GSAP ScrollTrigger + Three.js star field
// 21st.dev / Framer-style motion system
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========================================
  // LENIS SMOOTH SCROLL
  // ========================================
  let lenis = null;

  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo ease out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrate with GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    }
  }

  // ========================================
  // THREE.JS STAR FIELD WITH ORBITAL MECHANICS
  // ========================================
  if (typeof THREE !== 'undefined' && !prefersReducedMotion) {
    const container = document.querySelector('.star-field');
    if (container) {
      // Scene setup
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

      // Star particles
      const starCount = 2000;
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = new Float32Array(starCount * 3);
      const starColors = new Float32Array(starCount * 3);
      const starSizes = new Float32Array(starCount);

      const colors = [
        new THREE.Color(0xa8c5e6), // Type-O blue-white
        new THREE.Color(0xf4d58d), // Type-F yellow
        new THREE.Color(0xe67350), // Type-K orange
        new THREE.Color(0x4a7c9e), // Type-M blue
        new THREE.Color(0xffffff), // White
      ];

      for (let i = 0; i < starCount; i++) {
        const i3 = i * 3;

        // Distribute stars in a sphere
        const radius = 100 + Math.random() * 200;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);

        starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starPositions[i3 + 2] = radius * Math.cos(phi);

        // Random color from palette
        const color = colors[Math.floor(Math.random() * colors.length)];
        starColors[i3] = color.r;
        starColors[i3 + 1] = color.g;
        starColors[i3 + 2] = color.b;

        starSizes[i] = Math.random() * 2 + 0.5;
      }

      starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
      starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

      // Custom shader material for stars
      const starMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          pixelRatio: { value: renderer.getPixelRatio() }
        },
        vertexShader: `
          attribute float size;
          varying vec3 vColor;
          uniform float time;
          uniform float pixelRatio;

          void main() {
            vColor = color;
            vec3 pos = position;

            // Orbital motion
            float angle = time * 0.02 + length(position) * 0.01;
            float s = sin(angle);
            float c = cos(angle);
            pos.xz = mat2(c, -s, s, c) * pos.xz;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          varying vec3 vColor;

          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;

            float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
            float glow = exp(-dist * 4.0);

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

      // Nebula clouds (subtle background atmosphere)
      const nebulaGeometry = new THREE.BufferGeometry();
      const nebulaCount = 50;
      const nebulaPositions = new Float32Array(nebulaCount * 3);
      const nebulaSizes = new Float32Array(nebulaCount);

      for (let i = 0; i < nebulaCount; i++) {
        const i3 = i * 3;
        nebulaPositions[i3] = (Math.random() - 0.5) * 400;
        nebulaPositions[i3 + 1] = (Math.random() - 0.5) * 400;
        nebulaPositions[i3 + 2] = (Math.random() - 0.5) * 200 - 100;
        nebulaSizes[i] = Math.random() * 80 + 40;
      }

      nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
      nebulaGeometry.setAttribute('size', new THREE.BufferAttribute(nebulaSizes, 1));

      const nebulaMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x1a4d5c) },
          color2: { value: new THREE.Color(0x0a0d14) }
        },
        vertexShader: `
          attribute float size;
          varying float vSize;
          uniform float time;

          void main() {
            vSize = size;
            vec3 pos = position;
            pos.y += sin(time * 0.1 + position.x * 0.01) * 5.0;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          varying float vSize;

          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;

            float alpha = smoothstep(0.5, 0.0, dist) * 0.15;
            vec3 color = mix(color1, color2, dist * 2.0);

            gl_FragColor = vec4(color, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
      scene.add(nebula);

      // Animation loop
      let time = 0;
      function animate() {
        requestAnimationFrame(animate);
        time += 0.016;

        starMaterial.uniforms.time.value = time;
        nebulaMaterial.uniforms.time.value = time;

        // Parallax with scroll
        if (lenis) {
          const scrollProgress = lenis.progress || 0;
          stars.rotation.x = scrollProgress * 0.2;
          camera.position.y = -scrollProgress * 20;
        }

        renderer.render(scene, camera);
      }
      animate();

      // Resize handler
      window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        starMaterial.uniforms.pixelRatio.value = renderer.getPixelRatio();
      });

      // Hide CSS star field
      container.style.background = 'none';
    }
  }

  // ========================================
  // GSAP SCROLL-TRIGGERED ANIMATIONS
  // ========================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance sequence
    const heroTimeline = gsap.timeline({ defaults: { ease: 'power4.out' } });

    heroTimeline
      .from('.mission-badge', {
        opacity: 0,
        scale: 0.8,
        rotation: -10,
        duration: 1.2,
        delay: 0.3
      })
      .from('.coordinate-display .coord-label', {
        opacity: 0,
        y: 30,
        duration: 0.8
      }, '-=0.8')
      .from('.coord-values .coord-line', {
        opacity: 0,
        y: 20,
        duration: 0.6,
        stagger: 0.1
      }, '-=0.6')
      .from('.specialist-designation', {
        opacity: 0,
        y: 30,
        duration: 0.8
      }, '-=0.5')
      .from('.stellar-markers .stellar-marker', {
        opacity: 0,
        y: 40,
        scale: 0.9,
        duration: 0.7,
        stagger: 0.12
      }, '-=0.4')
      .from('.primary-action', {
        opacity: 0,
        scale: 0.9,
        duration: 0.6
      }, '-=0.3')
      .from('.spectral-readouts .readout-item', {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.6,
        stagger: 0.08
      }, '-=0.3');

    // Section headers animation
    gsap.utils.toArray('.section-header').forEach(header => {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 60,
        duration: 1,
        ease: 'power3.out'
      });
    });

    // Stellar systems - 3D card reveal
    gsap.utils.toArray('.stellar-system').forEach((system, index) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: system,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        }
      });

      tl.from(system, {
        opacity: 0,
        y: 80,
        rotateX: 10,
        duration: 0.8,
        ease: 'power3.out'
      })
      .from(system.querySelectorAll('.system-header, .system-name, .system-designation'), {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.4')
      .from(system.querySelectorAll('.system-details > *'), {
        opacity: 0,
        y: 15,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out'
      }, '-=0.2');
    });

    // Constellation stars - staggered glow
    gsap.utils.toArray('.star-cluster').forEach(cluster => {
      const stars = cluster.querySelectorAll('.constellation-star');

      gsap.from(stars, {
        scrollTrigger: {
          trigger: cluster,
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        scale: 0,
        duration: 0.5,
        stagger: {
          each: 0.05,
          from: 'random'
        },
        ease: 'back.out(1.7)'
      });
    });

    // Observatory panels
    gsap.utils.toArray('.observatory-panel').forEach((panel, index) => {
      gsap.from(panel, {
        scrollTrigger: {
          trigger: panel,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        y: 50,
        x: index % 2 === 0 ? -30 : 30,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    // Achievement markers
    gsap.utils.toArray('.achievement-category').forEach(category => {
      const markers = category.querySelectorAll('.achievement-marker');

      gsap.from(markers, {
        scrollTrigger: {
          trigger: category,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        opacity: 0,
        x: -30,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });
    });

    // Compass rose - active section highlighting
    const sections = ['mission-specialist', 'charted-systems', 'constellation', 'contact-coordinates'];

    sections.forEach((sectionId, index) => {
      const section = document.getElementById(sectionId);
      if (section) {
        ScrollTrigger.create({
          trigger: section,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => updateCompass(index),
          onEnterBack: () => updateCompass(index)
        });
      }
    });

    function updateCompass(activeIndex) {
      const points = document.querySelectorAll('.compass-point');
      points.forEach((point, i) => {
        if (i === activeIndex) {
          point.classList.add('active');
          gsap.to(point, { color: '#a8c5e6', duration: 0.3 });
        } else {
          point.classList.remove('active');
          gsap.to(point, { color: '#7a8591', duration: 0.3 });
        }
      });
    }

    // Parallax layers
    gsap.utils.toArray('.catalog-section').forEach(section => {
      gsap.to(section, {
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        },
        backgroundPositionY: '50%',
        ease: 'none'
      });
    });
  }

  // ========================================
  // MAGNETIC HOVER EFFECTS
  // ========================================
  if (!prefersReducedMotion) {
    const magneticElements = document.querySelectorAll('.stellar-marker, .chart-course-btn, .constellation-star, .system-link');

    magneticElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(el, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      el.addEventListener('mouseleave', () => {
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        });
      });
    });
  }

  // ========================================
  // CURSOR GLOW EFFECT
  // ========================================
  if (!prefersReducedMotion) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    cursor.innerHTML = `
      <div class="cursor-dot"></div>
      <div class="cursor-ring"></div>
    `;
    document.body.appendChild(cursor);

    // Add cursor styles
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
        width: 8px;
        height: 8px;
        background: #a8c5e6;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 20px #a8c5e6, 0 0 40px #a8c5e6;
      }
      .cursor-ring {
        position: absolute;
        width: 40px;
        height: 40px;
        border: 1px solid rgba(168, 197, 230, 0.5);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.3s, height 0.3s, border-color 0.3s;
      }
      .cursor-glow.hovering .cursor-ring {
        width: 60px;
        height: 60px;
        border-color: rgba(168, 197, 230, 0.8);
      }
      @media (max-width: 768px) {
        .cursor-glow { display: none; }
      }
    `;
    document.head.appendChild(cursorStyles);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;

      cursorX += dx * 0.15;
      cursorY += dy * 0.15;

      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hover state for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .stellar-marker, .constellation-star, .stellar-system');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  }

  // ========================================
  // TEXT REVEAL ANIMATION (Split-text style)
  // ========================================
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    const textElements = document.querySelectorAll('.section-title, .specialist-title');

    textElements.forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';

      // Split into characters
      [...text].forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? ' ' : char;
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(40px) rotateX(-90deg)';
        el.appendChild(span);
      });

      // Animate on scroll
      gsap.to(el.children, {
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reverse'
        },
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        stagger: 0.02,
        ease: 'power3.out'
      });
    });
  }

  // ========================================
  // SCROLL PROGRESS INDICATOR
  // ========================================
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
  document.body.appendChild(progressBar);

  const progressStyles = document.createElement('style');
  progressStyles.textContent = `
    .scroll-progress {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: rgba(10, 13, 20, 0.5);
      z-index: 10000;
    }
    .scroll-progress-bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #a8c5e6, #f4d58d, #e67350);
      transition: width 0.1s ease;
    }
  `;
  document.head.appendChild(progressStyles);

  const progressBarInner = progressBar.querySelector('.scroll-progress-bar');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    progressBarInner.style.width = `${progress}%`;
  });

  // ========================================
  // NOISE/GRAIN OVERLAY
  // ========================================
  const noiseOverlay = document.createElement('div');
  noiseOverlay.className = 'noise-overlay';
  noiseOverlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(noiseOverlay);

  const noiseStyles = document.createElement('style');
  noiseStyles.textContent = `
    .noise-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 9998;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    }
  `;
  document.head.appendChild(noiseStyles);

  // ========================================
  // ORBITAL RING ANIMATION
  // ========================================
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    gsap.to('.orbital-ring', {
      rotation: 360,
      duration: 60,
      repeat: -1,
      ease: 'none',
      transformOrigin: 'center center'
    });

    // Counter-rotate the text to keep it readable
    gsap.to('.orbital-text', {
      rotation: -360,
      duration: 60,
      repeat: -1,
      ease: 'none',
      transformOrigin: 'center center'
    });
  }

  // ========================================
  // PULSE GLOW ANIMATION FOR METRICS
  // ========================================
  if (!prefersReducedMotion && typeof gsap !== 'undefined') {
    gsap.utils.toArray('.readout-value').forEach((value, index) => {
      gsap.to(value, {
        textShadow: '0 0 30px currentColor',
        duration: 1.5 + index * 0.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
  }

  console.log('%c✧ Motion Graphics System Initialized ✧',
    'font-size: 14px; color: #a8c5e6; font-family: monospace; padding: 8px;');
});
