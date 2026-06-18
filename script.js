/**
 * Beauty Pasion Ibiza — JavaScript principal
 *
 * Módulos:
 *  1. Header (transparente → glassmorphism al scroll)
 *  2. Menú lateral móvil (sidebar animado)
 *  3. Scroll Reveal (IntersectionObserver con delays)
 *  4. Parallax sutil en el Hero
 *  5. Carrusel de testimonios (autoplay + controles)
 *  6. Smooth scroll & active nav link
 *  7. Año dinámico en el footer
 */

/* ─────────────────────────────────────────────
   UTILIDADES
───────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/** Aplica estilos en requestAnimationFrame para evitar layout thrashing */
const raf = fn => requestAnimationFrame(fn);

/** Clamp un valor entre min y max */
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);


/* ─────────────────────────────────────────────
   1. HEADER — SCROLL BEHAVIOR
   Cambia clase según scroll Y para activar
   el efecto glassmorphism.
───────────────────────────────────────────── */
const initHeader = () => {
  const header = $('#siteHeader');
  if (!header) return;

  const SCROLL_THRESHOLD = 60;

  const updateHeader = () => {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    header.classList.toggle('site-header--scrolled', scrolled);
    header.classList.toggle('site-header--transparent', !scrolled);
  };

  // Estado inicial
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
};


/* ─────────────────────────────────────────────
   2. MENÚ LATERAL MÓVIL
   Controla la apertura/cierre del sidebar,
   el overlay y el bloqueo del scroll del body.
───────────────────────────────────────────── */
const initMobileMenu = () => {
  const toggle  = $('#navToggle');
  const menu    = $('#navMobile');
  const overlay = $('#navOverlay');
  if (!toggle || !menu || !overlay) return;

  let isOpen = false;

  const openMenu = () => {
    isOpen = true;
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('is-open');
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    isOpen = false;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('is-open');
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => isOpen ? closeMenu() : openMenu());
  overlay.addEventListener('click', closeMenu);

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });

  // Cerrar al pulsar cualquier enlace del menú
  $$('[data-close-menu]', menu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });
};


/* ─────────────────────────────────────────────
   3. SCROLL REVEAL
   Usa IntersectionObserver para añadir
   .is-visible en cuanto cada elemento entra
   en el viewport. Soporta delay via
   data-delay="ms".
───────────────────────────────────────────── */
const initScrollReveal = () => {
  const elements = $$('.reveal-up, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);

        setTimeout(() => {
          el.classList.add('is-visible');
        }, delay);

        // Dejar de observar una vez revelado
        observer.unobserve(el);
      });
    },
    {
      threshold:   0.12,   // Entra en pantalla un 12%
      rootMargin: '0px 0px -50px 0px',
    }
  );

  elements.forEach(el => observer.observe(el));
};


/* ─────────────────────────────────────────────
   4. PARALLAX EN HERO
   Mueve la imagen de fondo ligeramente al
   hacer scroll para crear profundidad sutil.
   Usa rAF para rendimiento óptimo.
───────────────────────────────────────────── */
const initParallax = () => {
  const bgEl = $('#heroBg');
  if (!bgEl) return;

  // Desactivar en móvil (prefiere-movimiento reducido o pantalla pequeña)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let ticking = false;
  let lastY = 0;

  const update = () => {
    const progress = clamp(lastY / window.innerHeight, 0, 1);
    // Movimiento máximo de 80px (muy sutil)
    const y = progress * 80;
    bgEl.style.transform = `translateY(${y}px)`;
    ticking = false;
  };

  const onScroll = () => {
    lastY = window.scrollY;
    if (!ticking) {
      raf(update);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
};


/* ─────────────────────────────────────────────
   5. CARRUSEL DE TESTIMONIOS
   Autoplay cada 5s, pausa al hover,
   navegación manual por botones y dots,
   accesibilidad ARIA.
───────────────────────────────────────────── */
const initCarousel = () => {
  const track     = $('#carouselTrack');
  const prevBtn   = $('#carouselPrev');
  const nextBtn   = $('#carouselNext');
  const dotsWrap  = $('#carouselDots');
  if (!track) return;

  const slides  = $$('.testimonial-slide', track);
  const total   = slides.length;
  let current   = 0;
  let timer     = null;
  const INTERVAL = 5000; // 5 segundos

  /* ── Crear dots ── */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Ir a reseña ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = $$('.carousel-dot', dotsWrap);

  /* ── Ir a slide ── */
  const goTo = (index, direction = 'next') => {
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('is-active');
    dots[current].setAttribute('aria-selected', 'false');

    current = (index + total) % total;

    track.style.transform = `translateX(-${current * 100}%)`;

    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('is-active');
    dots[current].setAttribute('aria-selected', 'true');
  };

  /* ── Autoplay ── */
  const startAutoplay = () => {
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  };

  const stopAutoplay = () => {
    clearInterval(timer);
  };

  /* ── Controles ── */
  if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); goTo(current - 1); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); goTo(current + 1); startAutoplay(); });

  /* ── Pausa al hover ── */
  const carousel = track.closest('.carousel');
  if (carousel) {
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin',    stopAutoplay);
    carousel.addEventListener('focusout',   startAutoplay);
  }

  /* ── Swipe táctil ── */
  let touchStartX = 0;

  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    stopAutoplay();
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
    startAutoplay();
  }, { passive: true });

  /* ── Init ── */
  goTo(0);
  startAutoplay();
};


/* ─────────────────────────────────────────────
   6. SMOOTH SCROLL & ACTIVE NAV
   Resalta el enlace de navegación según la
   sección visible en el viewport.
───────────────────────────────────────────── */
const initActiveNav = () => {
  const navLinks  = $$('.nav-link[href^="#"]');
  const sections  = $$('section[id]');
  if (!sections.length) return;

  const HEADER_OFFSET = 90;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('active', isActive);
        });
      });
    },
    {
      rootMargin: `-${HEADER_OFFSET}px 0px -60% 0px`,
      threshold: 0,
    }
  );

  sections.forEach(sec => observer.observe(sec));
};


/* ─────────────────────────────────────────────
   7. AÑO DINÁMICO EN EL FOOTER
───────────────────────────────────────────── */
const initYear = () => {
  const el = $('#currentYear');
  if (el) el.textContent = new Date().getFullYear();
};


/* ─────────────────────────────────────────────
   8. ANIMACIÓN DE ENTRADA DEL HERO
   Aplicada directamente (no por observer)
   porque siempre está visible al cargar.
───────────────────────────────────────────── */
const initHeroEntrance = () => {
  // Los elementos del hero con .reveal-up usan data-delay
  // Los forzamos visibles con un ligero delay escalonado
  const heroReveals = $$('.hero .reveal-up, .hero .reveal-right');
  heroReveals.forEach(el => {
    const delay = parseInt(el.dataset.delay || '0', 10);
    setTimeout(() => el.classList.add('is-visible'), delay + 100);
  });
};


/* ─────────────────────────────────────────────
   INICIALIZACIÓN
   Espera a que el DOM esté listo.
───────────────────────────────────────────── */
const init = () => {
  initHeader();
  initMobileMenu();
  initScrollReveal();
  initParallax();
  initCarousel();
  initActiveNav();
  initYear();
  initHeroEntrance();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
