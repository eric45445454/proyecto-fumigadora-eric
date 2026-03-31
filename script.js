/* =============================================
   TACTICAL BY MONGO — Sistema de Fumigación Inteligente
   script.js — Interactividad y animaciones
   ============================================= */

/* ── NAVBAR: scroll y toggle móvil ──────────── */
(function initNavbar() {
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  // Añade clase .scrolled al hacer scroll
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    // Muestra botón scroll-to-top
    const scrollTopBtn = document.getElementById('scrollTop');
    if (scrollTopBtn) {
      scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    }
  }, { passive: true });

  // Toggle menú móvil
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  // Cierra menú al hacer clic en un enlace
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.classList.remove('open');
    });
  });
})();

/* ── SCROLL TO TOP ──────────────────────────── */
(function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── INTERSECTION OBSERVER — animaciones reveal ─ */
(function initReveal() {
  const targets = document.querySelectorAll(
    '.reveal, .reveal-hero, .reveal-hero-media'
  );

  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Deja de observar una vez revelado
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  targets.forEach(el => observer.observe(el));
})();

/* ── AUTOPLAY DE VIDEO AL HACER SCROLL ───────── */
(function initScrollAutoplayVideos() {
  const videos = document.querySelectorAll('.autoplay-scroll-video');
  if (!videos.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    {
      threshold: [0.2, 0.4, 0.6, 0.8]
    }
  );

  videos.forEach((video) => observer.observe(video));
})();

/* ── ACTIVE NAV LINK al hacer scroll ────────── */
(function initActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(section => observer.observe(section));
})();

/* ── DASHBOARD ANIMADO ───────────────────────── */
(function initDashboard() {
  const tempEl       = document.getElementById('dashTemp');
  const gaugeFill    = document.getElementById('gaugeFill');
  const gaugeNeedle  = document.getElementById('gaugeNeedle');

  if (!tempEl) return;

  // Simulación de temperatura que oscila entre 55 y 78°C
  const MIN_TEMP    = 40;
  const MAX_TEMP    = 100;
  const THRESHOLD   = 65;
  let   currentTemp = 58;
  let   direction   = 1; // 1 = subiendo, -1 = bajando
  let   dashActive  = false;

  function updateDashboard() {
    // Simula variación realista de temperatura
    const step = (Math.random() * 0.8 + 0.2) * direction;
    currentTemp += step;

    if (currentTemp >= 79)  direction = -1;
    if (currentTemp <= 54)  direction =  1;

    // Redondea a 1 decimal
    const display = currentTemp.toFixed(1);
    tempEl.textContent = display;

    // Calcula ángulo del gauge (0° = izq, 180° = der)
    const pct       = (currentTemp - MIN_TEMP) / (MAX_TEMP - MIN_TEMP);
    const clampPct  = Math.max(0, Math.min(1, pct));
    const angle     = clampPct * 180;          // 0–180°
    const needleRot = -90 + angle;             // CSS: -90 = izq, +90 = der

    gaugeNeedle.style.setProperty('transform', `translateX(-50%) rotate(${needleRot}deg)`);

    // Color del valor: verde si está en umbral, blanco si no
    if (currentTemp >= THRESHOLD) {
      tempEl.style.color = 'var(--lime)';
    } else {
      tempEl.style.color = 'var(--white)';
    }
  }

  // Solo activa el intervalo cuando el dashboard es visible
  const dashEl = document.querySelector('.dashboard-preview');
  if (!dashEl) return;

  const dashObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !dashActive) {
          dashActive = true;
          setInterval(updateDashboard, 900);
          updateDashboard();
        }
      });
    },
    { threshold: 0.3 }
  );

  dashObserver.observe(dashEl);
})();

/* ── GALERÍA — clic para ampliar (lightbox simple) ── */
(function initLightbox() {
  const items = document.querySelectorAll('.gallery-item');
  if (!items.length) return;

  // Solo activa lightbox si el item tiene una imagen o video real (no placeholder)
  items.forEach(item => {
    const img   = item.querySelector('img');
    const video = item.querySelector('video');
    if (!img && !video) return;

    item.style.cursor = 'zoom-in';

    item.addEventListener('click', () => {
      const overlay = document.createElement('div');
      overlay.className = 'lightbox-overlay';
      overlay.style.cssText = `
        position:fixed; inset:0; z-index:9999;
        background:rgba(0,0,0,0.92); display:flex;
        align-items:center; justify-content:center;
        cursor:zoom-out; padding:2rem;
        animation: lb-in 0.25s ease;
      `;

      const style = document.createElement('style');
      style.textContent = `@keyframes lb-in { from{opacity:0} to{opacity:1} }`;
      document.head.appendChild(style);

      let media;
      if (img) {
        media = img.cloneNode();
        media.style.cssText = 'max-width:90vw; max-height:85vh; border-radius:8px; object-fit:contain;';
      } else {
        media = video.cloneNode(true);
        media.style.cssText = 'max-width:90vw; max-height:85vh; border-radius:8px;';
        media.controls = true;
      }

      overlay.appendChild(media);
      overlay.addEventListener('click', () => overlay.remove());

      document.body.appendChild(overlay);
    });
  });
})();

/* ── SMOOTH HOVER en tarjetas ────────────────── */
(function initCardTilt() {
  const cards = document.querySelectorAll('.comp-card, .info-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;

      card.style.transform = `
        perspective(600px)
        rotateY(${x * 6}deg)
        rotateX(${-y * 6}deg)
        translateY(-3px)
      `;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ── STAGGER de cards al revelar ─────────────── */
(function initStagger() {
  // Aplica delay progresivo a los items dentro de grids
  const grids = document.querySelectorAll(
    '.components-grid, .benefits-grid, .meca-areas, .mejoras-grid'
  );

  grids.forEach(grid => {
    const children = grid.querySelectorAll('.comp-card, .benefit-card, .meca-area, .mejora-item');
    children.forEach((child, i) => {
      // Solo si no tiene un delay ya definido por CSS
      if (!child.style.transitionDelay) {
        child.style.transitionDelay = `${i * 0.06}s`;
      }
    });
  });
})();

/* ── ACTIVE NAV STYLE ────────────────────────── */
(function addActiveNavStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .nav-link.active {
      color: var(--lime) !important;
    }
  `;
  document.head.appendChild(style);
})();

/* ── CURSOR personalizado (sutil) ────────────── */
(function initCustomCursor() {
  // Solo en pantallas grandes
  if (window.innerWidth < 1024) return;

  const cursor = document.createElement('div');
  cursor.id    = 'custom-cursor';
  cursor.style.cssText = `
    position: fixed;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--lime, #b5f23d);
    pointer-events: none;
    z-index: 10000;
    transition: transform 0.15s ease, opacity 0.3s ease;
    transform: translate(-50%, -50%);
    opacity: 0;
  `;
  document.body.appendChild(cursor);

  document.addEventListener('mousemove', (e) => {
    cursor.style.left    = e.clientX + 'px';
    cursor.style.top     = e.clientY + 'px';
    cursor.style.opacity = '0.7';
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });

  // Agranda el cursor al pasar sobre links y botones
  const interactives = document.querySelectorAll('a, button, .comp-card, .benefit-card');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(3)';
      cursor.style.opacity   = '0.4';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.opacity   = '0.7';
    });
  });
})();

/* ── CONSOLE SIGNATURE ───────────────────────── */
console.log(
  '%c⚙ TACTICAL BY MONGO — Sistema de Fumigación Inteligente\n' +
  '%cProyecto mecatrónico universitario. Todos los derechos reservados.',
  'color: #b5f23d; font-weight: bold; font-size: 14px;',
  'color: #888; font-size: 11px;'
);
