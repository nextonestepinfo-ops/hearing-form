const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const loader = document.querySelector("[data-loader]");
const progress = document.querySelector("[data-scroll-progress]");
const parallaxNodes = document.querySelectorAll("[data-parallax]");
const compactView = window.matchMedia("(max-width: 620px)");
let scrollTicking = false;

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
    { threshold: 0.13 },
  );

  targets.forEach((node) => observer.observe(node));
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
  if (!reduceMotion && !compactView.matches) {
    parallaxNodes.forEach((node) => {
      const depth = Number(node.dataset.parallax || 0);
      node.style.setProperty("--parallax-y", `${window.scrollY * depth}px`);
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

window.setTimeout(() => loader?.classList.add("is-hidden"), 380);
window.addEventListener("load", () => window.setTimeout(() => loader?.classList.add("is-hidden"), 120));

setupSplitText();
revealOnScroll();
setupTiltCards();
setupSparkles();
setupHeroParallax();
