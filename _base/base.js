/**
 * Beauty Pasion Ibiza — JavaScript principal
 *
 * Sistema de animaciones premium:
 * El IntersectionObserver observa SECCIONES completas.
 * Cuando una sección entra en viewport, orquesta sus elementos
 * en secuencia según sus atributos data-reveal y data-reveal-delay.
 *
 * Tipos de reveal (data-reveal="tipo"):
 *   from-left   → texto/elementos desde la izquierda
 *   from-right  → texto/elementos desde la derecha
 *   from-bottom → texto emergiendo hacia arriba
 *   scale-in    → tarjetas/badges apareciendo con escala
 *   clip-right  → imágenes con cortina de derecha a izquierda
 *   clip-left   → imágenes con cortina de izquierda a derecha
 *   clip-up     → imágenes con cortina de abajo a arriba
 *
 * Stagger automático: contenedores con [data-reveal-stagger]
 * animan sus .stagger-child hijos con 110ms entre cada uno.
 *
 * Módulos:
 *  1. Header glassmorphism al scroll
 *  2. Menú lateral móvil
 *  3. Hero entrance (orquestado al cargar, no por scroll)
 *  4. Scroll reveal + stagger por sección
 *  5. Parallax sutil en hero
 *  6. Carrusel de testimonios
 *  7. Active nav link
 *  8. Año dinámico en footer
 */

/* ─────────────────────────────────────────────
   UTILIDADES
───────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const raf = fn => requestAnimationFrame(fn);
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);


/* ─────────────────────────────────────────────
   1. HEADER — GLASSMORPHISM AL SCROLL
───────────────────────────────────────────── */
const initHeader = () => {
  const header = $('#siteHeader');
  if (!header) return;

  const update = () => {
    header.classList.toggle('site-header--scrolled',     window.scrollY > 60);
    header.classList.toggle('site-header--transparent', window.scrollY <= 60);
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
};


/* ─────────────────────────────────────────────
   2. MENÚ LATERAL MÓVIL
───────────────────────────────────────────── */
const initMobileMenu = () => {
  const toggle  = $('#navToggle');
  const menu    = $('#navMobile');
  const overlay = $('#navOverlay');
  if (!toggle || !menu || !overlay) return;

  let isOpen = false;

  const open = () => {
    isOpen = true;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('is-open');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('is-open');
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => isOpen ? close() : open());
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });
  $$('[data-close-menu]', menu).forEach(link => link.addEventListener('click', close));
};


/* ─────────────────────────────────────────────
   3. HERO ENTRANCE
   Orquesta los elementos del hero al cargar
   usando data-hero-delay para la secuencia.
   Los hijos de hero-title (.line-mask con
   data-reveal) se animan independientemente
   con data-reveal-delay adicional.
───────────────────────────────────────────── */
const initHeroEntrance = () => {
  const heroItems = $$('[data-hero-item]');
  if (!heroItems.length) return;

  heroItems.forEach(el => {
    const baseDelay = parseInt(el.dataset.heroDelay || '0', 10);

    // El elemento principal se hace visible
    setTimeout(() => {
      el.classList.add('is-visible');

      // Sus hijos con data-reveal (líneas del título, float cards…)
      // se animan con un delay adicional relativo al padre
      $$('[data-reveal]', el).forEach(child => {
        const childDelay = parseInt(child.dataset.revealDelay || '0', 10);
        setTimeout(() => child.classList.add('is-visible'), childDelay + 80);
      });
    }, baseDelay + 200); // +200ms para que el DOM ya esté renderizado
  });
};


/* ─────────────────────────────────────────────
   4. SCROLL REVEAL — ORQUESTACIÓN POR SECCIÓN
   Cuando una sección entra en viewport:
   a) Activa elementos con [data-reveal] respetando data-reveal-delay
   b) Activa grupos stagger [data-reveal-stagger] animando
      sus .stagger-child con 110ms entre cada uno
───────────────────────────────────────────── */
const STAGGER_STEP = 110; // ms entre cada hijo del stagger

const revealSection = (section) => {
  // ── Elementos individuales con data-reveal ──
  $$('[data-reveal]', section).forEach(el => {
    // Ignorar los que ya están dentro del hero (se manejan en initHeroEntrance)
    if (el.closest('.hero')) return;
    // Ignorar img-reveal-wrap anidados si el padre ya tiene data-reveal
    // (se revelan desde el padre o desde el observador de galería)

    const delay = parseInt(el.dataset.revealDelay || '0', 10);
    setTimeout(() => el.classList.add('is-visible'), delay);
  });

  // ── Grupos stagger ──
  $$('[data-reveal-stagger]', section).forEach(group => {
    const baseDelay = parseInt(group.dataset.revealStaggerDelay || '0', 10);
    $$('.stagger-child', group).forEach((child, i) => {
      setTimeout(() => child.classList.add('is-visible'), baseDelay + i * STAGGER_STEP);
    });
  });
};

const initScrollReveal = () => {
  // Observamos las secciones como unidad
  const sections = $$('main section[id], footer');

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        revealSection(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold:  0.08,
      rootMargin: '0px 0px -60px 0px',
    }
  );

  sections.forEach(sec => observer.observe(sec));
};


/* ─────────────────────────────────────────────
   5. PARALLAX EN HERO
───────────────────────────────────────────── */
const initParallax = () => {
  const bgEl = $('#heroBg');
  if (!bgEl) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  const update = () => {
    const y = clamp(window.scrollY * 0.35, 0, 120);
    bgEl.style.transform = `translateY(${y}px)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { raf(update); ticking = true; }
  }, { passive: true });
};


/* ─────────────────────────────────────────────
   6. CARRUSEL DE TESTIMONIOS
───────────────────────────────────────────── */
const initCarousel = () => {
  const track    = $('#carouselTrack');
  const prevBtn  = $('#carouselPrev');
  const nextBtn  = $('#carouselNext');
  const dotsWrap = $('#carouselDots');
  if (!track) return;

  const slides = $$('.testimonial-slide', track);
  const total  = slides.length;
  let current  = 0;
  let timer    = null;

  // Crear dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Ir a reseña ${i + 1}`);
    dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); });
    dotsWrap.appendChild(dot);
  });

  const dots = $$('.carousel-dot', dotsWrap);

  const goTo = (index) => {
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');

    current = ((index % total) + total) % total;

    track.style.transform = `translateX(-${current * 100}%)`;
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
  };

  const startAuto  = () => { timer = setInterval(() => goTo(current + 1), 5000); };
  const stopAuto   = () => clearInterval(timer);

  if (prevBtn) prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  const carousel = track.closest('.carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);
    carousel.addEventListener('focusin',    stopAuto);
    carousel.addEventListener('focusout',   startAuto);
  }

  // Swipe táctil
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    startAuto();
  }, { passive: true });

  goTo(0);
  startAuto();
};


/* ─────────────────────────────────────────────
   7. ACTIVE NAV LINK
───────────────────────────────────────────── */
const initActiveNav = () => {
  const navLinks = $$('.nav-link[href^="#"]');
  const sections = $$('section[id]');
  if (!sections.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-90px 0px -60% 0px', threshold: 0 }
  );

  sections.forEach(sec => observer.observe(sec));
};


/* ─────────────────────────────────────────────
   8. AÑO DINÁMICO
───────────────────────────────────────────── */
const initYear = () => {
  const el = $('#currentYear');
  if (el) el.textContent = new Date().getFullYear();
};


/* ─────────────────────────────────────────────
   BOOTSTRAP
───────────────────────────────────────────── */
const init = () => {
  initHeader();
  initMobileMenu();
  initHeroEntrance();
  initScrollReveal();
  initParallax();
  initCarousel();
  initActiveNav();
  initYear();
};

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', init)
  : init();
