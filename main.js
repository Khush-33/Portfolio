// ============================================================
// main.js — Interstellar Cartography Archive interactions
// Celestial navigation, modal/lightbox, deep linking, magnetic physics
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---- Modal System ----
  const modals = {
    system: document.getElementById('systemModal'),
    cert: document.getElementById('certLightbox'),
    pub: document.getElementById('pubLightbox'),
    screenshot: document.getElementById('screenshotLightbox')
  };

  let lastFocusedElement = null;

  function openModal(modalName, data = {}) {
    const modal = modals[modalName];
    if (!modal) return;

    lastFocusedElement = document.activeElement;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Focus trap
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (firstFocusable) firstFocusable.focus();

    // Populate modal content based on type
    if (modalName === 'system') populateSystemModal(data);
    if (modalName === 'cert') populateCertLightbox(data);
    if (modalName === 'pub') populatePubLightbox(data);
    if (modalName === 'screenshot') populateScreenshotLightbox(data);

    // Trap focus
    modal.addEventListener('keydown', trapFocus);
    function trapFocus(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
    modal._trapFocus = trapFocus;
  }

  function closeModal(modalName) {
    const modal = modals[modalName];
    if (!modal) return;

    modal.classList.remove('open');
    document.body.style.overflow = '';

    // Remove focus trap
    if (modal._trapFocus) {
      modal.removeEventListener('keydown', modal._trapFocus);
    }

    // Return focus
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  }

  function closeAllModals() {
    Object.keys(modals).forEach(name => closeModal(name));
  }

  // ---- System Modal Population ----
  function populateSystemModal(data) {
    const modal = modals.system;
    if (!modal) return;

    const systemEl = document.getElementById(`system-${data.systemId}`);
    if (!systemEl) return;

    const name = systemEl.querySelector('.system-name')?.textContent || 'Unknown System';
    const designation = systemEl.querySelector('.system-designation')?.textContent || '';
    const catalog = systemEl.querySelector('.catalog-number')?.textContent || data.systemId.toUpperCase();
    const classType = systemEl.querySelector('.class-type')?.textContent || '';
    const classDesc = systemEl.querySelector('.class-desc')?.textContent || '';
    const screenshotEl = systemEl.querySelector('.system-screenshot img');
    const screenshotPlaceholder = systemEl.querySelector('.system-screenshot .screenshot-placeholder');
    const screenshotSrc = screenshotEl?.src || (screenshotPlaceholder ? '' : '');
    const descriptionItems = Array.from(systemEl.querySelectorAll('.system-description li')).map(li => li.textContent);
    const techNodes = Array.from(systemEl.querySelectorAll('.tech-node')).map(node => ({
      text: node.textContent,
      class: node.className.split(' ').find(c => c !== 'tech-node') || ''
    }));
    const links = Array.from(systemEl.querySelectorAll('.system-link')).map(a => ({
      text: a.textContent.trim(),
      href: a.href,
      class: a.className.includes('live') ? 'live' : 'repo'
    }));

    modal.querySelector('.system-modal-catalog').textContent = catalog;
    modal.querySelector('.system-modal-name').textContent = name;
    modal.querySelector('.system-modal-designation').textContent = designation;
    modal.querySelector('.system-modal-classification .class-type').textContent = classType;
    modal.querySelector('.system-modal-classification .class-desc').textContent = classDesc;

    const screenshotEl = modal.querySelector('.system-modal-screenshot img');
    screenshotEl.src = screenshotSrc;
    screenshotEl.alt = `${name} Screenshot`;

    const descList = modal.querySelector('.system-modal-description');
    descList.innerHTML = descriptionItems.map(item => `<li>${item}</li>`).join('');

    const techOrbit = modal.querySelector('.system-modal-tech-orbit');
    techOrbit.innerHTML = techNodes.map(node =>
      `<span class="tech-node ${node.class}">${node.text}</span>`
    ).join('');

    const linksContainer = modal.querySelector('.system-modal-links');
    linksContainer.innerHTML = links.map(link =>
      `<a href="${link.href}" target="_blank" class="system-link ${link.class}"><span class="link-icon">${link.class === 'live' ? '●' : '⌘'}</span>${link.text}</a>`
    ).join('');
  }

  // ---- Certification Lightbox ----
  function populateCertLightbox(data) {
    const modal = modals.cert;
    if (!modal) return;

    const lightboxContent = modal.querySelector('.lightbox-content');
    const verifyLink = modal.querySelector('.lightbox-verify');

    if (data.isPlaceholder || !data.imageSrc) {
      lightboxContent.innerHTML = `
        <div class="lightbox-placeholder">
          <span class="placeholder-icon">↑</span>
          <span class="placeholder-text">${data.alt || 'Add Certificate'}</span>
        </div>
      `;
    } else {
      lightboxContent.innerHTML = `<img src="${data.imageSrc}" alt="${data.alt || 'Certificate'}" loading="lazy">`;
    }
    verifyLink.href = data.verifyUrl || '#';
  }

  // ---- Publication Lightbox ----
  function populatePubLightbox(data) {
    const modal = modals.pub;
    if (!modal) return;

    const lightboxContent = modal.querySelector('.lightbox-content');
    const doiLink = modal.querySelector('.lightbox-doi');

    if (data.isPlaceholder || !data.imageSrc) {
      lightboxContent.innerHTML = `
        <div class="lightbox-placeholder">
          <span class="placeholder-icon">↑</span>
          <span class="placeholder-text">${data.alt || 'Add Cover'}</span>
        </div>
      `;
    } else {
      lightboxContent.innerHTML = `<img src="${data.imageSrc}" alt="${data.alt || 'Publication Cover'}" loading="lazy">`;
    }
    doiLink.href = data.doiUrl || '#';
  }

  // ---- Screenshot Lightbox ----
  function populateScreenshotLightbox(data) {
    const modal = modals.screenshot;
    if (!modal) return;

    const lightboxContent = modal.querySelector('.lightbox-content');

    if (data.isPlaceholder || !data.imageSrc) {
      lightboxContent.innerHTML = `
        <div class="lightbox-placeholder">
          <span class="placeholder-icon">↑</span>
          <span class="placeholder-text">${data.alt || 'Add Screenshot'}</span>
        </div>
      `;
    } else {
      lightboxContent.innerHTML = `<img src="${data.imageSrc}" alt="${data.alt || 'Project Screenshot'}" loading="lazy">`;
    }
  }

  // ---- Event Listeners for Opening Modals ----
  // System cards click
  document.querySelectorAll('.stellar-system').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Don't open if clicking on links
      if (e.target.closest('.system-link, .screenshot-expand')) return;
      const systemId = card.dataset.systemId;
      if (systemId) openModal('system', { systemId });
    });

    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const systemId = card.dataset.systemId;
        if (systemId) openModal('system', { systemId });
      }
    });
  });

  // Screenshot expand button
  document.querySelectorAll('.screenshot-expand').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const container = btn.closest('.system-screenshot');
      const img = container.querySelector('img');
      const placeholder = container.querySelector('.screenshot-placeholder');
      if (placeholder) {
        // Show placeholder in lightbox too
        openModal('screenshot', {
          imageSrc: '',
          alt: 'Add Screenshot',
          isPlaceholder: true
        });
      } else if (img) {
        openModal('screenshot', {
          imageSrc: img.src,
          alt: img.alt
        });
      }
    });
  });

  // Certificate thumbnails
  document.querySelectorAll('.cert-thumbnail').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const img = thumb.querySelector('img');
      const placeholder = thumb.querySelector('.cert-placeholder');
      const verifyLink = thumb.closest('.cert-with-image').querySelector('.cert-verify');
      if (placeholder) {
        openModal('cert', {
          imageSrc: '',
          alt: 'Add Certificate',
          verifyUrl: verifyLink?.href || '#',
          isPlaceholder: true
        });
      } else if (img) {
        openModal('cert', {
          imageSrc: img.src,
          alt: img.alt,
          verifyUrl: verifyLink?.href || '#'
        });
      }
    });

    thumb.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        thumb.click();
      }
    });
  });

  // Publication cover
  document.querySelectorAll('.pub-cover').forEach(cover => {
    cover.addEventListener('click', () => {
      const img = cover.querySelector('img');
      const placeholder = cover.querySelector('.pub-placeholder');
      const doiLink = cover.closest('.pub-with-image').querySelector('.pub-doi');
      if (placeholder) {
        openModal('pub', {
          imageSrc: '',
          alt: 'Add Cover',
          doiUrl: doiLink?.href || '#',
          isPlaceholder: true
        });
      } else if (img) {
        openModal('pub', {
          imageSrc: img.src,
          alt: img.alt,
          doiUrl: doiLink?.href || '#'
        });
      }
    });

    cover.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cover.click();
      }
    });
  });

  // ---- Modal Close Buttons ----
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal.id === 'systemModal') closeModal('system');
      else if (modal.id === 'certLightbox') closeModal('cert');
      else if (modal.id === 'pubLightbox') closeModal('pub');
      else if (modal.id === 'screenshotLightbox') closeModal('screenshot');
    });
  });

  // Close on overlay click
  Object.values(modals).forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllModals();
  });

  // ---- Deep Linking for Projects ----
  function handleDeepLink() {
    const hash = window.location.hash;
    if (hash.startsWith('#system-')) {
      const systemId = hash.replace('#system-', '');
      const systemEl = document.getElementById(`system-${systemId}`);
      if (systemEl) {
        systemEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => openModal('system', { systemId }), 500);
      }
    }
  }

  window.addEventListener('hashchange', handleDeepLink);
  handleDeepLink(); // Initial load

  // Update URL on system click (without reload)
  document.querySelectorAll('.stellar-marker, .stellar-system').forEach(el => {
    if (el.dataset.systemId) {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.system-link, .screenshot-expand, .cert-thumbnail, .pub-cover')) return;
        history.pushState(null, null, `#system-${el.dataset.systemId}`);
      });
    }
  });

  // ---- Smooth Scroll for Navigation ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      // Let modal triggers handle their own
      if (this.closest('.stellar-system') || this.closest('.screenshot-expand') ||
          this.closest('.cert-thumbnail') || this.closest('.pub-cover')) return;

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
  const sections = ['mission-specialist', 'charted-systems', 'constellation', 'github-observatory', 'achievements', 'contact'];
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
      const systemsSection = document.getElementById('charted-systems');
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
        img.classList.remove('loading');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px'
  });

  images.forEach(img => {
    img.classList.add('loading');
    imageObserver.observe(img);
  });

  // Also handle images that don't have data-src but might need loading state
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (!img.complete) {
      img.classList.add('loading');
      img.addEventListener('load', () => img.classList.remove('loading'));
    }
  });

  // ---- Touch/Swipe Support for Project Cards ----
  let touchStartX = 0;
  let touchStartY = 0;

  document.querySelectorAll('.stellar-system').forEach(card => {
    card.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    card.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Tap detection (small movement)
      if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        const systemId = card.dataset.systemId;
        if (systemId) openModal('system', { systemId });
      }
    }, { passive: true });
  });

  // ---- Console Easter Egg ----
  console.log('%c✧ Interstellar Cartography Archive ✧',
    'font-size: 16px; color: #a8c5e6; font-family: monospace; padding: 8px;');
  console.log('%cCatalog ID: KJ-ARCHIVE-001 | Epoch: J2026.5',
    'font-size: 11px; color: #c5d1d9; font-family: monospace;');
  console.log('%cWelcome, navigator. Explore the stellar systems.',
    'font-size: 11px; color: #7a8591; font-family: monospace;');

});
