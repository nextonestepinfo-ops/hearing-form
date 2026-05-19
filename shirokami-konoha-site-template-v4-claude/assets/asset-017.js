// =====================================
// 白狼このは 公式サイト — B案
// =====================================

(() => {
  // scroll progress + FAB
  const bar = document.getElementById('scrollbar');
  const fab = document.getElementById('fab');
  function onScroll() {
    const h = document.documentElement;
    const pct = h.scrollTop / Math.max(1, (h.scrollHeight - h.clientHeight));
    if (bar) bar.style.width = (pct * 100) + '%';
    if (fab) fab.classList.toggle('show', h.scrollTop > 500);
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  if (fab) fab.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // mobile nav toggle
  const navBtn = document.getElementById('nav-mobile');
  const navLinks = document.querySelector('.nav-links');
  if (navBtn && navLinks) {
    navBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('.nav-btn').forEach(a => a.addEventListener('click', () => {
      navLinks.classList.remove('open');
    }));
  }

  // remove loader
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => { loader.remove(); }, 3200);
  }

  // smooth-scroll for hash links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // intersection observer for fade-in
  const ioTargets = document.querySelectorAll('.card, .big-tag, .movie-card, .platform-card, .sched-card, .gallery .cell, .sub-title');
  ioTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .6s cubic-bezier(.22,.61,.36,1), transform .6s cubic-bezier(.22,.61,.36,1)';
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '';
        e.target.style.transform = '';
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  ioTargets.forEach(el => io.observe(el));

  // =====================================
  // MOUSE PARALLAX + CURSOR FOLLOWER
  // =====================================
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none)').matches;

  const mouseParaEls = Array.from(document.querySelectorAll('[data-mouse-parallax]'));
  const cursor = document.getElementById('pixel-cursor');
  let mx = 0, my = 0;
  let rafId = null;

  function onMouseMove(e) {
    mx = e.clientX; my = e.clientY;
    if (cursor) {
      cursor.classList.add('show');
      cursor.style.transform = `translate3d(${mx - 14}px, ${my - 14}px, 0)`;
      const t = e.target;
      const interactive = t && t.closest && t.closest('a, button, .btn, .chip, .movie-card, .platform-card, .sched-card, .nav-btn, .nav-logo, .tp-radio button');
      cursor.classList.toggle('hover', !!interactive);
    }
    if (!rafId) rafId = requestAnimationFrame(applyMouseParallax);
  }
  function applyMouseParallax() {
    rafId = null;
    if (reduced) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (mx - cx);
    const dy = (my - cy);
    for (const el of mouseParaEls) {
      const k = parseFloat(el.dataset.mouseParallax) || 0.04;
      // combine with possible scroll parallax stored
      const sy = el.__scrollY || 0;
      el.style.transform = `translate3d(${dx * k}px, ${dy * k + sy}px, 0)`;
    }
  }
  if (!isTouch) {
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', () => { if (cursor) cursor.classList.remove('show'); });
  }

  // =====================================
  // SCROLL PARALLAX
  // =====================================
  const scrollParaEls = Array.from(document.querySelectorAll('[data-scroll-parallax]'));
  function applyScrollParallax() {
    if (reduced) return;
    const sy = window.scrollY;
    const winH = window.innerHeight;
    for (const el of scrollParaEls) {
      const k = parseFloat(el.dataset.scrollParallax) || 0.2;
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      // distance from viewport center
      const dy = (centerY - winH / 2) * -k;
      el.__scrollY = dy;
      // if not also a mouse-parallax element, apply directly
      if (!el.dataset.mouseParallax) {
        el.style.transform = `translate3d(0, ${dy}px, 0)`;
      }
    }
  }
  let scrollPending = false;
  document.addEventListener('scroll', () => {
    if (!scrollPending) {
      scrollPending = true;
      requestAnimationFrame(() => {
        applyScrollParallax();
        scrollPending = false;
      });
    }
  }, { passive: true });
  applyScrollParallax();

  // =====================================
  // SCROLL-SYNCED HERO TINT
  // =====================================
  function onDocScroll() {
    document.body.classList.toggle('is-deep-scrolled', window.scrollY > 600);
  }
  document.addEventListener('scroll', onDocScroll, { passive: true });

  // =====================================
  // TWEAKS PANEL
  // =====================================
  const TWEAKS_DEFAULTS = (window.TWEAK_DEFAULS) || { vibe: 'pixel', deco: 'default', layout: 'stacked' };
  const tweaks = { ...TWEAKS_DEFAULTS };
  const panel = document.getElementById('tweaks-panel');

  function applyTweaks() {
    document.body.dataset.vibe = tweaks.vibe;
    document.body.dataset.deco = tweaks.deco;
    document.body.dataset.layout = tweaks.layout;
    document.querySelectorAll('.tp-radio').forEach(g => {
      const key = g.dataset.key;
      g.querySelectorAll('button').forEach(b => {
        b.classList.toggle('active', b.dataset.val === tweaks[key]);
      });
    });
  }
  applyTweaks();

  // 1. Register listener FIRST
  window.addEventListener('message', (e) => {
    const d = e.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === '__activate_edit_mode' && panel) {
      panel.hidden = false;
    } else if (d.type === '__deactivate_edit_mode' && panel) {
      panel.hidden = true;
    }
  });
  // 2. Announce availability
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

  // 3. Close button
  const closeBtn = document.getElementById('tp-close');
  if (closeBtn && panel) {
    closeBtn.addEventListener('click', () => {
      panel.hidden = true;
      try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch (e) {}
    });
  }

  // 4. Radio button handlers
  document.querySelectorAll('.tp-radio').forEach(g => {
    g.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        const key = g.dataset.key;
        tweaks[key] = b.dataset.val;
        applyTweaks();
        try {
          window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: b.dataset.val } }, '*');
        } catch (e) {}
      });
    });
  });
})();
