const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const loader = document.querySelector("[data-loader]");
const progress = document.querySelector("[data-scroll-progress]");
const parallaxNodes = document.querySelectorAll("[data-parallax]");
const compactView = window.matchMedia("(max-width: 620px)");
const ACCESS_HASH = "9497683cb70785d3626818bc7a71924c14482e16636edd6668cc2664b75ed8fe";
const ACCESS_STORAGE_KEY = "shirokami-konoha-access";
let scrollTicking = false;
let pageStarted = false;
let lastScrollY = window.scrollY;
let scrollMotionTimer = 0;

function hasAccess() {
  try {
    return window.sessionStorage.getItem(ACCESS_STORAGE_KEY) === "ok";
  } catch {
    return false;
  }
}

function rememberAccess() {
  try {
    window.sessionStorage.setItem(ACCESS_STORAGE_KEY, "ok");
  } catch {
    // Session storage can fail in strict privacy modes. The current page can still open.
  }
}

function bytesToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hashText(value) {
  if (!window.crypto?.subtle) return "";
  const data = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return bytesToHex(digest);
}

function unlockAccess() {
  rememberAccess();
  document.documentElement.classList.remove("access-locked");
  document.querySelector("[data-access-gate]")?.remove();
  playIntroSequence();
  initPage();
}

function playIntroSequence() {
  if (!loader) return;
  const logoDelay = reduceMotion ? 260 : 1650;
  const hideDelay = reduceMotion ? 920 : 3600;

  document.documentElement.classList.add("intro-playing");
  loader.classList.remove("is-hidden", "is-logo");

  window.setTimeout(() => loader.classList.add("is-logo"), logoDelay);
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
    document.documentElement.classList.remove("intro-playing");
  }, hideDelay);
}

function setupAccessGate() {
  const gate = document.querySelector("[data-access-gate]");
  const form = document.querySelector("[data-access-form]");
  const error = document.querySelector("[data-access-error]");
  const input = form?.querySelector('input[name="password"]');
  const button = form?.querySelector("button");

  if (!gate || hasAccess()) {
    unlockAccess();
    return;
  }

  loader?.classList.add("is-hidden");
  input?.focus();

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!input) return;

    button?.setAttribute("disabled", "true");
    if (error) error.textContent = "";

    try {
      const digest = await hashText(input.value);
      if (digest === ACCESS_HASH) {
        unlockAccess();
        return;
      }

      input.value = "";
      input.focus();
      if (error) error.textContent = "パスワードが違います。";
    } catch {
      if (error) error.textContent = "このブラウザでは確認できませんでした。";
    } finally {
      button?.removeAttribute("disabled");
    }
  });
}

function revealOnScroll() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;

  const revealVisibleTargets = () => {
    targets.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
        node.classList.add("is-visible");
      }
    });
  };

  if (!("IntersectionObserver" in window)) {
    targets.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.13 },
  );

  revealVisibleTargets();
  targets.forEach((node) => observer.observe(node));
  window.requestAnimationFrame(revealVisibleTargets);
}

function setupSplitText() {
  if (reduceMotion) return;
  const targets = document.querySelectorAll(".section-head h2, .profile-copy h2, .contact-copy h1");
  targets.forEach((target) => {
    if (target.dataset.split === "true") return;
    const text = (target.textContent || "").trim();
    if (!text) return;
    target.textContent = "";
    target.dataset.split = "true";
    target.classList.add("split-text");
    Array.from(text).forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char === " " ? "\u00a0" : char;
      span.style.setProperty("--i", index);
      target.appendChild(span);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { threshold: 0.28 },
  );
  targets.forEach((target) => observer.observe(target));
}

function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const amount = max <= 0 ? 0 : (window.scrollY / max) * 100;
  progress.style.width = `${Math.min(100, Math.max(0, amount))}%`;
}

function updateScrollEffects() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const scrollRatio = max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max));
  const delta = window.scrollY - lastScrollY;
  const pulse = Math.min(1, Math.abs(delta) / 90);
  const direction = delta < 0 ? -1 : 1;

  lastScrollY = window.scrollY;
  document.documentElement.style.setProperty("--scroll-ratio", scrollRatio.toFixed(4));
  document.documentElement.style.setProperty("--scroll-drift", `${(window.scrollY * -0.026).toFixed(2)}px`);
  document.documentElement.style.setProperty("--scroll-bump", `${(-10 * pulse).toFixed(2)}px`);
  document.documentElement.style.setProperty("--scroll-tilt", `${(direction * pulse * 1.15).toFixed(2)}deg`);

  if (pulse > 0.025) {
    document.documentElement.classList.add("is-scrolling");
    window.clearTimeout(scrollMotionTimer);
    scrollMotionTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("is-scrolling");
      document.documentElement.style.setProperty("--scroll-bump", "0px");
      document.documentElement.style.setProperty("--scroll-tilt", "0deg");
    }, 220);
  }

  if (!reduceMotion) {
    const compactFactor = compactView.matches ? 0.44 : 1;
    parallaxNodes.forEach((node) => {
      const depth = Number(node.dataset.parallax || 0);
      node.style.setProperty("--parallax-y", `${(window.scrollY * depth * compactFactor).toFixed(2)}px`);
    });
  } else {
    parallaxNodes.forEach((node) => node.style.setProperty("--parallax-y", "0px"));
  }
  updateProgress();
  scrollTicking = false;
}

function requestScrollEffects() {
  if (scrollTicking) return;
  scrollTicking = true;
  window.requestAnimationFrame(updateScrollEffects);
}

function setupTiltCards() {
  if (reduceMotion) return;
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 5}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setupSparkles() {
  if (reduceMotion) return;
  window.addEventListener("pointerdown", (event) => {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${event.clientX}px`;
    sparkle.style.top = `${event.clientY}px`;
    document.body.appendChild(sparkle);
    window.setTimeout(() => sparkle.remove(), 760);
  });
}

function setupHeroParallax() {
  window.addEventListener("scroll", requestScrollEffects, { passive: true });
  window.addEventListener("resize", requestScrollEffects);
  compactView.addEventListener?.("change", requestScrollEffects);
  requestScrollEffects();
}

navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav?.classList.toggle("is-open", !isOpen);
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navToggle?.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
  });
});

function initPage() {
  if (pageStarted) return;
  pageStarted = true;

  setupSplitText();
  revealOnScroll();
  setupTiltCards();
  setupSparkles();
  setupHeroParallax();
}

setupAccessGate();
