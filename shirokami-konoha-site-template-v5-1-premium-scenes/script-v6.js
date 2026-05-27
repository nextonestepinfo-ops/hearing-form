const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const root = document.documentElement;
const body = document.body;
const loader = document.querySelector("[data-loader]");
const progress = document.querySelector("[data-scroll-progress]");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const hero = document.querySelector(".hero");
const CONFIG_URL = "./site-config.json";
const ACCESS_HASH = "9497683cb70785d3626818bc7a71924c14482e16636edd6668cc2664b75ed8fe";
const ACCESS_STORAGE_KEY = "shirokami-konoha-v5-premium-scenes-access";
const SCENE_BY_MOOD = {
  hero: "moon",
  profile: "silver",
  links: "live",
  movie: "moon",
  tags: "silver",
  contact: "live",
};

let pageStarted = false;
let scrollFrame = 0;
let lastScrollY = Math.max(0, window.scrollY || 0);
let scrollDirection = "down";
let activeMood = "";
let activeSection = null;
let sceneTimer = 0;
let revealObserver = null;
let sectionObserver = null;
const sceneTimers = new WeakMap();

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
    // Session storage can be disabled by browser settings.
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

function scrollToCurrentHash() {
  const id = window.location.hash?.slice(1);
  if (!id) return;
  const target = document.getElementById(decodeURIComponent(id));
  if (!target) return;
  const offset = window.innerWidth <= 720 ? 86 : 112;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
}

function playIntroSequence() {
  if (!loader) return;
  const delay = reduceMotion ? 420 : 1180;
  root.classList.add("intro-playing");
  body.classList.remove("site-assembled", "intro-finished");
  loader.classList.remove("is-hidden");

  window.setTimeout(() => {
    loader.classList.add("is-hidden");
    root.classList.remove("intro-playing");
    body.classList.add("site-assembled", "intro-finished");
    requestAnimationFrame(() => {
      scrollToCurrentHash();
      updateScrollState();
    });
  }, delay);
}

function unlockAccess() {
  rememberAccess();
  root.classList.remove("access-locked");
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
      if (error) error.textContent = "Password is incorrect.";
    } catch {
      if (error) error.textContent = "This browser could not verify the password.";
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
      siteNav?.classList.remove("is-open");
    });
  });
}

function setupReveal() {
  const targets = Array.from(document.querySelectorAll("[data-reveal]"));
  targets.forEach((node, index) => {
    node.style.setProperty("--reveal-delay", `${Math.min(index * 42, 210)}ms`);
  });

  if (!targets.length) return;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
      });
    },
    { rootMargin: "-7% 0px -10% 0px", threshold: 0.08 },
  );

  targets.forEach((node) => revealObserver.observe(node));
}

function resetSectionScene(section) {
  const timer = sceneTimers.get(section);
  if (timer) window.clearTimeout(timer);
  section.classList.remove("is-scene-active", "is-scene-content");
}

function playSectionScene(section) {
  if (!section || reduceMotion) {
    section?.classList.add("is-scene-active", "is-scene-content");
    return;
  }

  resetSectionScene(section);
  section.classList.toggle("scene-dir-up", scrollDirection === "up");
  section.classList.toggle("scene-dir-down", scrollDirection !== "up");
  void section.offsetWidth;
  section.classList.add("is-scene-active");

  const timer = window.setTimeout(() => {
    section.classList.add("is-scene-content");
  }, 90);
  sceneTimers.set(section, timer);
}

function moodForSection(section) {
  if (!section) return "hero";
  if (section.classList.contains("hero")) return "hero";
  return section.id || "hero";
}

function setMood(nextMood) {
  if (!nextMood || nextMood === activeMood) return;
  const nextScene = SCENE_BY_MOOD[nextMood] || "moon";
  const currentScene = body.dataset.scene || "moon";
  activeMood = nextMood;
  body.dataset.mood = nextMood;

  if (nextScene !== currentScene && !reduceMotion) {
    window.clearTimeout(sceneTimer);
    const order = { moon: 0, live: 1, silver: 2 };
    const direction = (order[nextScene] ?? 0) >= (order[currentScene] ?? 0) ? "forward" : "back";
    body.dataset.sceneDirection = direction;
    body.classList.remove("is-scene-switching");
    void body.offsetWidth;
    body.classList.add("is-scene-switching");
    sceneTimer = window.setTimeout(() => body.classList.remove("is-scene-switching"), 620);
  }

  body.dataset.scene = nextScene;
  siteNav?.querySelectorAll("a[href^='#']").forEach((link) => {
    const id = link.getAttribute("href")?.slice(1);
    link.classList.toggle("is-active", id === nextMood);
  });
}

function setupSectionScenes() {
  const sections = [hero, ...document.querySelectorAll(".section-shell")].filter(Boolean);
  sections.forEach((section) => section.classList.add("scene-ready"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("is-scene-active", "is-scene-content"));
    return;
  }

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) return;
        resetSectionScene(entry.target);
      });
    },
    { rootMargin: "34% 0px 34% 0px", threshold: 0 },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

function findCurrentSection() {
  const marker = window.innerHeight * (window.innerWidth <= 720 ? 0.82 : 0.64);
  const sections = [hero, ...document.querySelectorAll(".section-shell")].filter(Boolean);
  let current = sections[0] || null;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= marker && rect.bottom >= marker) current = section;
  });

  return current;
}

function updateScrollDirection() {
  const currentY = Math.max(0, window.scrollY || 0);
  if (Math.abs(currentY - lastScrollY) > 2) {
    scrollDirection = currentY > lastScrollY ? "down" : "up";
    body.dataset.scrollDirection = scrollDirection;
    lastScrollY = currentY;
  }
}

function updateScrollState() {
  updateScrollDirection();

  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const ratio = Math.min(1, Math.max(0, window.scrollY / max));
  if (progress) progress.style.transform = `scaleX(${ratio.toFixed(4)})`;

  const heroHeight = Math.max(hero?.offsetHeight || window.innerHeight, 1);
  const heroRatio = Math.min(1, Math.max(0, window.scrollY / heroHeight));
  root.style.setProperty("--hero-progress", heroRatio.toFixed(4));
  root.style.setProperty("--scene-y", `${(Math.min(72, window.scrollY * 0.018) * -1).toFixed(2)}px`);
  body.classList.toggle("is-past-hero", heroRatio > 0.42);

  const current = findCurrentSection();
  if (current && current !== activeSection) {
    activeSection = current;
    playSectionScene(current);
  } else if (current && !current.classList.contains("is-scene-active")) {
    playSectionScene(current);
  }
  setMood(moodForSection(current));
}

function scheduleScrollUpdate() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    updateScrollState();
  });
}

function setupScroll() {
  updateScrollState();
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);
  window.addEventListener("hashchange", scrollToCurrentHash);
}

function setupPerformanceHints() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  if (connection?.saveData || lowPower) body.classList.add("perf-lite");
  document.addEventListener("visibilitychange", () => {
    body.classList.toggle("is-tab-hidden", document.hidden);
  });
}

function youtubeThumb(video, quality = "hqdefault") {
  if (video.thumb) return video.thumb;
  return video.id ? `https://i.ytimg.com/vi/${video.id}/${quality}.jpg` : "";
}

function normalizeVideo(raw, quality) {
  const id = raw.id || raw.videoId || raw.youtubeId || "";
  const url = raw.url || (id ? `https://www.youtube.com/watch?v=${id}` : "#");
  return {
    id,
    url,
    title: raw.title || "YouTube Archive",
    thumb: raw.thumb || raw.thumbnail || youtubeThumb({ id }, quality),
    published: raw.published || raw.date || "",
  };
}

function formatArchiveDate(value) {
  if (!value) return "Archive";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Archive";
  return new Intl.DateTimeFormat("ja-JP", { month: "2-digit", day: "2-digit" }).format(date);
}

function mapLatestPayload(payload, quality) {
  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.feed?.items)
      ? payload.feed.items
      : [];

  return items
    .map((item) => {
      const url = item.url || item.link || item.guid || "";
      const id = item.id || item.videoId || String(url).match(/(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[?&/]|$)/)?.[1] || "";
      return normalizeVideo(
        {
          id,
          url: url || (id ? `https://www.youtube.com/watch?v=${id}` : "#"),
          title: item.title,
          thumb: item.thumbnail || item.thumb || item.media?.thumbnail?.url,
          published: item.published || item.date,
        },
        quality,
      );
    })
    .filter((video) => video.id || video.thumb)
    .slice(0, 6);
}

async function loadYoutubeVideos(config) {
  const quality = config?.youtube?.thumbnailQuality || "hqdefault";
  const fallback = (config?.youtube?.fallbackVideos || [])
    .map((video) => normalizeVideo(video, quality))
    .filter((video) => video.id || video.thumb);
  const endpoint = config?.youtube?.latestJsonUrl;
  if (!endpoint) return fallback;

  try {
    const response = await fetch(endpoint, { cache: "no-store" });
    if (!response.ok) throw new Error(`YouTube endpoint returned ${response.status}`);
    const latest = mapLatestPayload(await response.json(), quality);
    return latest.length ? latest : fallback;
  } catch {
    return fallback;
  }
}

function renderArchiveStrip(videos) {
  const strip = document.querySelector("[data-archive-strip]");
  if (!strip || !videos.length) return;
  strip.textContent = "";

  videos.slice(0, 6).forEach((video) => {
    const link = document.createElement("a");
    link.className = "archive-card";
    link.href = video.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.setAttribute("aria-label", video.title);

    const img = document.createElement("img");
    img.src = video.thumb;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";

    const caption = document.createElement("span");
    caption.textContent = video.title;

    const date = document.createElement("em");
    date.textContent = formatArchiveDate(video.published);

    link.append(img, caption, date);
    strip.append(link);
  });
}

function renderFeaturedVideo(videos) {
  const featuredLink = document.querySelector("[data-featured-video]");
  const featuredThumb = document.querySelector("[data-featured-thumb]");
  const featuredTitle = document.querySelector("[data-featured-title]");
  const featuredMeta = document.querySelector("[data-featured-meta]");
  const video = videos[0];
  if (!video || !featuredLink || !featuredThumb) return;

  featuredLink.href = video.url;
  featuredThumb.src = video.thumb;
  featuredThumb.alt = video.title;
  if (featuredTitle) featuredTitle.textContent = video.title;
  if (featuredMeta) featuredMeta.textContent = `${formatArchiveDate(video.published)} / YouTube Archive`;
}

async function loadSiteConfig() {
  try {
    const response = await fetch(CONFIG_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Config returned ${response.status}`);
    const config = await response.json();
    if (config.site?.title && !body.hasAttribute("data-builder-page")) document.title = config.site.title;
    const footerDate = document.querySelector(".site-footer span:last-child");
    if (footerDate && config.site?.updated) footerDate.textContent = `Last updated ${config.site.updated}`;
    const videos = await loadYoutubeVideos(config);
    renderFeaturedVideo(videos);
    renderArchiveStrip(videos);
  } catch {
    // Static fallback content remains visible.
  }
}

function initPage() {
  if (pageStarted) return;
  pageStarted = true;
  setupPerformanceHints();
  setupNavigation();
  setupReveal();
  setupSectionScenes();
  setupScroll();
  loadSiteConfig();
}

setupAccessGate();
