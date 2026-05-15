const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const loader = document.querySelector("[data-loader]");
const progress = document.querySelector("[data-scroll-progress]");
const hero = document.querySelector(".hero");
const ACCESS_HASH = "9497683cb70785d3626818bc7a71924c14482e16636edd6668cc2664b75ed8fe";
const ACCESS_STORAGE_KEY = "shirokami-konoha-v2-collage-access";
let pageStarted = false;

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
    // Session storage may be unavailable in strict privacy settings.
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

function playIntroSequence() {
  if (!loader) return;
  const hideDelay = reduceMotion ? 700 : 1850;
  document.documentElement.classList.add("intro-playing");
  loader.classList.remove("is-hidden");
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
    document.documentElement.classList.remove("intro-playing");
  }, hideDelay);
}

function unlockAccess() {
  rememberAccess();
  document.documentElement.classList.remove("access-locked");
  document.querySelector("[data-access-gate]")?.remove();
  initPage();
  playIntroSequence();
}

function setupAccessGate() {
  const form = document.querySelector("[data-access-form]");
  const error = document.querySelector("[data-access-error]");
  const input = form?.querySelector('input[name="password"]');
  const button = form?.querySelector("button");

  if (!form || hasAccess()) {
    unlockAccess();
    return;
  }

  loader?.classList.add("is-hidden");
  input?.focus();

  form.addEventListener("submit", async (event) => {
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

function setupNavigation() {
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
}

function revealOnScroll() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;

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
    { threshold: 0.14 },
  );

  targets.forEach((node) => observer.observe(node));
  window.requestAnimationFrame(() => {
    targets.forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.94 && rect.bottom > 0) {
        node.classList.add("is-visible");
      }
    });
  });
}

function updateProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const amount = max <= 0 ? 0 : (window.scrollY / max) * 100;
  progress.style.width = `${Math.min(100, Math.max(0, amount))}%`;
  updateHeroMotion();
}

function updateHeroMotion() {
  if (!hero || reduceMotion) {
    document.documentElement.style.setProperty("--hero-shift", "0px");
    document.documentElement.style.setProperty("--hero-lift", "0px");
    document.documentElement.style.setProperty("--hero-scale", "0");
    return;
  }

  const heroHeight = Math.max(hero.offsetHeight || window.innerHeight, 1);
  const ratio = Math.min(1, Math.max(0, window.scrollY / heroHeight));
  document.documentElement.style.setProperty("--hero-shift", `${(ratio * 92).toFixed(2)}px`);
  document.documentElement.style.setProperty("--hero-lift", `${(ratio * -48).toFixed(2)}px`);
  document.documentElement.style.setProperty("--hero-scale", (ratio * 0.026).toFixed(4));
}

function setupTiltCards() {
  if (reduceMotion) return;
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -3.2}deg) rotateY(${x * 4.4}deg) translateY(-3px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setupPointerSparkles() {
  if (reduceMotion) return;
  window.addEventListener("pointerdown", (event) => {
    const sparkle = document.createElement("span");
    sparkle.className = "pointer-sparkle";
    sparkle.style.left = `${event.clientX}px`;
    sparkle.style.top = `${event.clientY}px`;
    document.body.appendChild(sparkle);
    window.setTimeout(() => sparkle.remove(), 760);
  });
}

function initPage() {
  if (pageStarted) return;
  pageStarted = true;
  setupNavigation();
  revealOnScroll();
  setupTiltCards();
  setupPointerSparkles();
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

setupAccessGate();
