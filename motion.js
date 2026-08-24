// ============================================================
// motion.js — Lightweight Apple-Style Motion System
// Fluid 60fps animations, respect reduced motion, no scroll hijacking
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ========================================
  // SIMPLE STAR FIELD (CSS-only, no Three.js)
  // ========================================
  if (!prefersReducedMotion) {
    const starField = document.querySelector('.star-field');
    if (starField) {
      // Add subtle twinkle via CSS animation (already defined in CSS)
      // No JS needed - pure CSS is smoother
    }
  }

  // ========================================
  // GSAP ENTRANCE ANIMATIONS (lightweight)
  // ========================================
  if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
    // Hero entrance - staggered, smooth
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });

    tl.from('.mission-badge', { opacity: 0, scale: 0.95, y: 20 }, 0.1)
      .from('.coordinate-display', { opacity: 0, y: 30 }, '-=0.4')
      .from('.specialist-title', { opacity: 0, y: 20 }, '-=0.3')
      .from('.specialist-brief', { opacity: 0, y: 20 }, '-=0.2')
      .from('.stellar-markers .stellar-marker', { opacity: 0, y: 20, stagger: 0.08 }, '-=0.3')
      .from('.primary-action', { opacity: 0, y: 20 }, '-=0.2')
      .from('.spectral-readouts .readout-item', { opacity: 0, y: 15, stagger: 0.06 }, '-=0.2');

    // Scroll-triggered reveals (IntersectionObserver + GSAP)
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
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.stellar-system, .star-cluster, .observatory-panel, .achievement-category').forEach(el => {
      gsap.set(el, { opacity: 0, y: 30 });
      observer.observe(el);
    });
  } else {
    // No GSAP / reduced motion: instant reveal
    document.querySelectorAll('.stellar-system, .star-cluster, .observatory-panel, .achievement-category').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  // ========================================
  // LIGHTWEIGHT HOVER EFFECTS (CSS variables)
  // ========================================
  if (!prefersReducedMotion) {
    // Magnetic hover - only on interactive cards, using transform (GPU accelerated)
    document.querySelectorAll('.stellar-system, .stellar-marker, .tech-node').forEach(card => {
      let rafId = null;

      card.addEventListener('mousemove', (e) => {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (e.clientX - centerX) * 0.03;
          const deltaY = (e.clientY - centerY) * 0.03;

          card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
          rafId = null;
        });
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ========================================
  // COMPASS ROSE ACTIVE STATE (scroll-based)
  // ========================================
  const sections = ['mission-specialist', 'charted-systems', 'constellation', 'github-observatory', 'achievements', 'contact'];
  const compassPoints = document.querySelectorAll('.compass-point');

  let ticking = false;
  function updateActiveSection() {
    const scrollPos = window.scrollY + window.innerHeight / 2;

    sections.forEach((sectionId, index) => {
      const section = document.getElementById(sectionId);
      if (section) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
          compassPoints.forEach(point => point.classList.remove('active'));
          if (compassPoints[index]) {
            compassPoints[index].classList.add('active');
          }
        }
      }
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateActiveSection);
      ticking = true;
    }
  }, { passive: true });
  updateActiveSection();

  // ========================================
  // SCROLL PROGRESS BAR (lightweight)
  // ========================================
  const progressBar = document.createElement('div');
  progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
  progressBar.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:2px;background:rgba(10,13,20,0.5);z-index:10000;pointer-events:none;';

  const progressStyles = document.createElement('style');
  progressStyles.textContent = `
    .scroll-progress-bar {
      height:100%;
      width:0%;
      background:linear-gradient(90deg,var(--type-o-systems),var(--type-f-fullstack),var(--type-k-ml));
      will-change: width;
    }
  `;
  document.head.appendChild(progressStyles);
  document.body.appendChild(progressBar);

  const progressBarInner = progressBar.querySelector('.scroll-progress-bar');
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const progress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBarInner.style.width = `${progress}%`;
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // ========================================
  // CURSOR GLOW (optional, desktop only)
  // ========================================
  if (!prefersReducedMotion && window.innerWidth > 768) {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    cursor.innerHTML = '<div class="cursor-dot"></div>';
    document.body.appendChild(cursor);

    const cursorStyles = document.createElement('style');
    cursorStyles.textContent = `
      .cursor-glow {
        position: fixed;
        top: 0; left: 0;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: opacity 0.2s ease;
      }
      .cursor-dot {
        width: 8px; height: 8px;
        background: var(--type-o-systems);
        border-radius: 50%;
        box-shadow: 0 0 20px var(--type-o-systems), 0 0 40px var(--type-o-systems);
        opacity: 0.6;
      }
      .cursor-glow.hidden { opacity: 0; }
    `;
    document.head.appendChild(cursorStyles);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      // Smooth follow
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      requestAnimationFrame(updateCursor);
    }
    updateCursor();

    // Hide on leave
    document.addEventListener('mouseleave', () => cursor.classList.add('hidden'));
    document.addEventListener('mouseenter', () => cursor.classList.remove('hidden'));

    // Hover state on interactive elements
    document.querySelectorAll('a, button, .stellar-marker, .stellar-system, .tech-node, .constellation-star').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.style.transform += ' scale(1.5)');
      el.addEventListener('mouseleave', () => cursor.style.transform = cursor.style.transform.replace(' scale(1.5)', ''));
    });
  }

  // ========================================
  // KEYBOARD NAVIGATION VISUAL
  // ========================================
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
  });
  document.addEventListener('mousedown', () => document.body.classList.remove('keyboard-nav'));

  const keyboardStyle = document.createElement('style');
  keyboardStyle.textContent = `
    body.keyboard-nav *:focus-visible {
      outline: 2px solid var(--type-o-systems) !important;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(keyboardStyle);

  console.log('%c✧ Motion System Ready ✧', 'color:var(--type-o-systems);font-family:monospace;');
});