// ============================================================
// main.js — Interstellar Cartography Archive interactions
// Celestial navigation, scroll reveals, gravitational effects
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Smooth Scroll for Navigation ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---- Intersection Observer for Reveal Animations ----
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.stellar-system, .star-cluster, .observatory-panel, .achievement-category, .stellar-marker').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    revealObserver.observe(el);
  });

  // Add visible class styles
  const style = document.createElement('style');
  style.textContent = `
    .stellar-system.visible,
    .star-cluster.visible,
    .observatory-panel.visible,
    .achievement-category.visible,
    .stellar-marker.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);

  // ---- Compass Rose Active State ----
  const sections = ['hero', 'systems', 'constellation', 'contact'];
  const compassPoints = document.querySelectorAll('.compass-point');

  const updateActiveSection = () => {
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
  };

  window.addEventListener('scroll', updateActiveSection);
  updateActiveSection();

  // Add active state styles
  const activeStyle = document.createElement('style');
  activeStyle.textContent = `
    .compass-point.active {
      color: #a8c5e6 !important;
    }
    .compass-point.active .bearing-label {
      opacity: 1;
    }
  `;
  document.head.appendChild(activeStyle);

  // ---- Parallax Effect for Star Field ----
  const starField = document.querySelector('.star-field');
  const coordGrid = document.querySelector('.coordinate-grid');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (starField) {
          starField.style.transform = `translateY(${scrolled * 0.1}px)`;
        }
        if (coordGrid) {
          coordGrid.style.transform = `translateY(${scrolled * 0.05}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  });

  // ---- Gravitational Lensing Hover Effect ----
  const stellarMarkers = document.querySelectorAll('.stellar-marker, .stellar-system');

  stellarMarkers.forEach(marker => {
    marker.addEventListener('mouseenter', () => {
      marker.style.transition = 'transform 0.4s ease-out, box-shadow 0.4s ease';
    });
  });

  // ---- Spectral Glow Animation ----
  const glowElements = document.querySelectorAll('.readout-value');

  const pulseGlow = () => {
    glowElements.forEach((el, index) => {
      const baseIntensity = 16;
      const variation = Math.sin(Date.now() / 1000 + index) * 4;
      const newIntensity = baseIntensity + variation;
      el.style.textShadow = `0 0 ${newIntensity}px currentColor`;
    });
  };

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    setInterval(pulseGlow, 50);
  }

  // ---- Constellation Star Hover ----
  const constellationStars = document.querySelectorAll('.constellation-star');

  constellationStars.forEach(star => {
    const glow = star.querySelector('.star-glow');
    if (glow) {
      star.addEventListener('mouseenter', () => {
        const currentWidth = parseInt(window.getComputedStyle(glow).width);
        glow.style.transform = 'scale(1.3)';
        glow.style.transition = 'transform 0.3s ease';
      });

      star.addEventListener('mouseleave', () => {
        glow.style.transform = 'scale(1)';
      });
    }
  });

  // ---- Tech Node Hover Effect ----
  document.querySelectorAll('.tech-node').forEach(node => {
    node.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-2px) scale(1.05)';
    });

    node.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // ---- Copy Email to Clipboard ----
  const emailLink = document.querySelector('a[href^="mailto:"]');
  if (emailLink) {
    emailLink.addEventListener('click', (e) => {
      e.preventDefault();
      const email = emailLink.getAttribute('href').replace('mailto:', '');
      navigator.clipboard.writeText(email).then(() => {
        const originalText = emailLink.querySelector('.coord-label').textContent;
        emailLink.querySelector('.coord-label').textContent = 'Copied!';
        setTimeout(() => {
          emailLink.querySelector('.coord-label').textContent = originalText;
        }, 2000);
      }).catch(() => {
        window.location.href = emailLink.getAttribute('href');
      });
    });
  }

  // ---- Smooth Reveal for Hero Section ----
  const heroElements = document.querySelectorAll('.mission-badge, .coordinate-display, .stellar-objects-preview, .primary-action, .spectral-readouts');

  heroElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';

    setTimeout(() => {
      el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 200 + (index * 150));
  });

  // ---- Dynamic Coordinate Update ----
  const updateCoordinates = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    // Update RA coordinate based on current time (symbolic)
    const raValue = document.querySelector('.coord-values .coord-value');
    if (raValue && raValue.textContent.includes(':')) {
      // Keep the original symbolic value, but could update dynamically
    }
  };

  updateCoordinates();

  // ---- GitHub Stats Image Loading ----
  const statsImages = document.querySelectorAll('.stats-image');
  statsImages.forEach(img => {
    img.addEventListener('error', () => {
      img.style.display = 'none';
      const fallback = document.createElement('p');
      fallback.className = 'stats-fallback';
      fallback.style.cssText = 'color: var(--silver-dim); font-size: 12px; padding: 20px; text-align: center;';
      fallback.textContent = 'GitHub stats unavailable';
      img.parentNode.appendChild(fallback);
    });
  });

  // ---- Chart Course Button Interaction ----
  const chartCourseBtn = document.querySelector('.chart-course-btn');
  if (chartCourseBtn) {
    chartCourseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const systemsSection = document.getElementById('systems');
      if (systemsSection) {
        systemsSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // ---- Keyboard Navigation ----
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });

  const keyboardStyle = document.createElement('style');
  keyboardStyle.textContent = `
    body.keyboard-nav *:focus {
      outline: 2px solid #a8c5e6 !important;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(keyboardStyle);

  // ---- Performance: Lazy Load Images ----
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px'
  });

  images.forEach(img => imageObserver.observe(img));

  // ---- Console Easter Egg ----
  console.log('%c✧ Interstellar Cartography Archive ✧',
    'font-size: 16px; color: #a8c5e6; font-family: monospace; padding: 8px;');
  console.log('%cCatalog ID: KJ-ARCHIVE-001 | Epoch: J2026.5',
    'font-size: 11px; color: #c5d1d9; font-family: monospace;');
  console.log('%cWelcome, navigator. Explore the stellar systems.',
    'font-size: 11px; color: #7a8591; font-family: monospace;');

});
