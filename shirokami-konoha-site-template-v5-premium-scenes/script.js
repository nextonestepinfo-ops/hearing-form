const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const loader = document.querySelector("[data-loader]");
const progress = document.querySelector("[data-scroll-progress]");
const hero = document.querySelector(".hero");
const root = document.documentElement;
const CONFIG_URL = "./site-config.json";
const ACCESS_HASH = "9497683cb70785d3626818bc7a71924c14482e16636edd6668cc2664b75ed8fe";
const ACCESS_STORAGE_KEY = "shirokami-konoha-v5-premium-scenes-access";
let pageStarted = false;
let siteConfig = null;
let progressFrame = 0;
let depthSections = [];
let moodSections = [];
let moodNavLinks = [];
let activeMood = "";

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
  const hideDelay = reduceMotion ? 700 : 2200;
  document.documentElement.classList.add("intro-playing");
  document.body.classList.remove("site-assembled");
  loader.classList.remove("is-hidden");
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
    document.documentElement.classList.remove("intro-playing");
    document.body.classList.add("site-assembled");
    window.requestAnimationFrame(scrollToCurrentHash);
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
  moodNavLinks = Array.from(siteNav?.querySelectorAll("a[href^='#']") || []);
}

function scrollToCurrentHash() {
  const id = window.location.hash?.slice(1);
  if (!id) return;
  const target = document.getElementById(decodeURIComponent(id));
  if (!target) return;
  const offset = window.innerWidth <= 620 ? 84 : 104;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
}

function setupRevealDelays(targets) {
  const groups = [hero, ...document.querySelectorAll(".section-shell")].filter(Boolean);
  groups.forEach((group) => {
    group.querySelectorAll("[data-reveal]").forEach((node, index) => {
      node.style.setProperty("--reveal-delay", `${Math.min(index * 90, 360)}ms`);
    });
  });

  targets.forEach((node, index) => {
    if (!node.style.getPropertyValue("--reveal-delay")) {
      node.style.setProperty("--reveal-delay", `${Math.min(index * 60, 300)}ms`);
    }
  });
}

function revealOnScroll() {
  const targets = Array.from(document.querySelectorAll("[data-reveal]"));
  if (!targets.length) return;
  setupRevealDelays(targets);

  if (!("IntersectionObserver" in window)) {
    targets.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.16 },
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
  const ratio = max <= 0 ? 0 : window.scrollY / max;
  const amount = ratio * 100;
  progress.style.width = `${Math.min(100, Math.max(0, amount))}%`;
  updateSceneMotion(ratio);
  updateHeroMotion();
  updateSectionDepth();
  updateInteractionMood();
}

function scheduleProgressUpdate() {
  if (progressFrame) return;
  progressFrame = window.requestAnimationFrame(() => {
    progressFrame = 0;
    updateProgress();
  });
}

function updateSectionDepth() {
  if (!depthSections.length) {
    depthSections = Array.from(document.querySelectorAll(".hero, .section-shell"));
  }
  if (!depthSections.length) return;

  depthSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const total = window.innerHeight + rect.height;
    const rawProgress = total <= 0 ? 0 : (window.innerHeight - rect.top) / total;
    const progress = Math.min(1, Math.max(0, rawProgress));
    const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
    const normalizedOffset = Math.min(1, Math.max(-1, centerOffset / Math.max(window.innerHeight, 1)));
    const focus = 1 - Math.min(1, Math.abs(normalizedOffset));

    section.style.setProperty("--section-progress", progress.toFixed(4));
    section.style.setProperty("--section-offset", normalizedOffset.toFixed(4));
    section.style.setProperty("--section-focus", focus.toFixed(4));
    section.style.setProperty("--section-y", `${(normalizedOffset * -72).toFixed(2)}px`);
    section.style.setProperty("--section-shift", `${(normalizedOffset * 44).toFixed(2)}px`);
  });
}

function updateSceneMotion(ratio = 0) {
  const safeRatio = Math.min(1, Math.max(0, ratio));
  if (reduceMotion) {
    root.style.setProperty("--scene-scroll", "0px");
    root.style.setProperty("--scene-lift", "0px");
    root.style.setProperty("--scene-light", "0px");
    return;
  }

  root.style.setProperty("--scene-scroll", `${(safeRatio * -96).toFixed(2)}px`);
  root.style.setProperty("--scene-lift", `${(safeRatio * 54).toFixed(2)}px`);
  root.style.setProperty("--scene-light", `${(safeRatio * 126).toFixed(2)}px`);
}

function updateHeroMotion() {
  if (!hero) {
    root.style.setProperty("--hero-shift", "0px");
    root.style.setProperty("--hero-lift", "0px");
    root.style.setProperty("--hero-scale", "0");
    root.style.setProperty("--premium-parallax", "0px");
    root.style.setProperty("--premium-light-shift", "0px");
    document.body.classList.remove("is-past-hero");
    return;
  }

  const heroHeight = Math.max(hero.offsetHeight || window.innerHeight, 1);
  const ratio = Math.min(1, Math.max(0, window.scrollY / heroHeight));
  document.body.classList.toggle("is-past-hero", ratio > 0.38);

  if (reduceMotion) {
    root.style.setProperty("--hero-shift", "0px");
    root.style.setProperty("--hero-lift", "0px");
    root.style.setProperty("--hero-scale", "0");
    root.style.setProperty("--premium-parallax", "0px");
    root.style.setProperty("--premium-light-shift", "0px");
    return;
  }

  root.style.setProperty("--hero-shift", `${(ratio * 92).toFixed(2)}px`);
  root.style.setProperty("--hero-lift", `${(ratio * -48).toFixed(2)}px`);
  root.style.setProperty("--hero-scale", (ratio * 0.026).toFixed(4));
  root.style.setProperty("--premium-parallax", `${(ratio * -42).toFixed(2)}px`);
  root.style.setProperty("--premium-light-shift", `${(ratio * 68).toFixed(2)}px`);
}

function sceneForMood(mood) {
  if (mood === "links" || mood === "movie") return "live";
  if (mood === "tags" || mood === "contact") return "silver";
  return "moon";
}

function updateInteractionMood() {
  const marker = window.innerHeight * (window.innerWidth <= 620 ? 0.72 : 0.58);
  if (!moodSections.length) {
    moodSections = [
      ["hero", document.querySelector(".hero")],
      ["profile", document.querySelector("#profile")],
      ["links", document.querySelector("#links")],
      ["movie", document.querySelector("#movie")],
      ["tags", document.querySelector("#tags")],
      ["contact", document.querySelector("#contact")],
    ].filter(([, section]) => section);
  }
  let nextMood = "hero";

  moodSections.forEach(([mood, section]) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= marker && rect.bottom >= marker) {
      nextMood = mood;
    }
  });

  if (nextMood === activeMood) return;
  activeMood = nextMood;
  document.body.dataset.mood = nextMood;
  document.body.dataset.scene = sceneForMood(nextMood);
  moodNavLinks.forEach((link) => {
    const target = link.getAttribute("href")?.replace("#", "");
    const isActive = target === nextMood || (nextMood === "links" && target === "links");
    link.classList.toggle("is-active", isActive);
  });
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

function setupInteractionGimmicks() {
  const hoverSelector = ".link-card, .tag-grid article, .archive-strip a, .movie-feature, .contact-window, .featured-media";
  let pointerFrame = 0;
  let pointerIdleTimer = 0;

  const setHoverPoint = (event) => {
    if (event.pointerType === "touch") return;
    const target = event.target instanceof Element ? event.target.closest(hoverSelector) : null;
    if (!target) return;
    const rect = target.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100));
    target.style.setProperty("--card-x", `${x.toFixed(2)}%`);
    target.style.setProperty("--card-y", `${y.toFixed(2)}%`);
    target.classList.add("is-hovering");
  };

  const clearHoverPoint = (event) => {
    const target = event.target instanceof Element ? event.target.closest(hoverSelector) : null;
    const next = event.relatedTarget instanceof Element ? event.relatedTarget : null;
    if (target && !target.contains(next)) target.classList.remove("is-hovering");
  };

  document.addEventListener("pointermove", setHoverPoint, { passive: true });
  document.addEventListener("pointerout", clearHoverPoint, { passive: true });
  updateInteractionMood();

  if (reduceMotion) return;

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType === "touch") return;
      if (pointerFrame) return;

      pointerFrame = window.requestAnimationFrame(() => {
        const width = Math.max(window.innerWidth, 1);
        const height = Math.max(window.innerHeight, 1);
        const dx = event.clientX / width - 0.5;
        const dy = event.clientY / height - 0.5;

        root.style.setProperty("--cursor-x", `${event.clientX.toFixed(1)}px`);
        root.style.setProperty("--cursor-y", `${event.clientY.toFixed(1)}px`);
        root.style.setProperty("--pointer-shift-x", `${(-dx * 18).toFixed(2)}px`);
        root.style.setProperty("--pointer-shift-y", `${(-dy * 13).toFixed(2)}px`);
        root.style.setProperty("--decor-shift-x", `${(dx * 14).toFixed(2)}px`);
        root.style.setProperty("--decor-shift-y", `${(dy * 10).toFixed(2)}px`);
        document.body.classList.add("is-pointer-active");

        window.clearTimeout(pointerIdleTimer);
        pointerIdleTimer = window.setTimeout(() => {
          document.body.classList.remove("is-pointer-active");
        }, 1000);
        pointerFrame = 0;
      });
    },
    { passive: true },
  );

  window.addEventListener("pointerleave", () => document.body.classList.remove("is-pointer-active"));
  window.addEventListener("blur", () => document.body.classList.remove("is-pointer-active"));
}

function youtubeThumb(video, quality = "hqdefault") {
  if (video.thumb) return video.thumb;
  if (!video.id) return "";
  return `https://i.ytimg.com/vi/${video.id}/${quality}.jpg`;
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
  return new Intl.DateTimeFormat("ja-JP", {
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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
  featuredThumb.alt = `${video.title}のサムネイル`;
  if (featuredTitle) featuredTitle.textContent = video.title;
  if (featuredMeta) {
    featuredMeta.textContent = `${formatArchiveDate(video.published)} / YouTube Archive`;
  }
}

function renderThumbnailFlight(videos, config) {
  const flight = document.querySelector("[data-thumbnail-flight]");
  if (!flight || !videos.length) return;
  const isMovieFlight = flight.dataset.thumbnailFlight === "movie";
  const iconSources = isMovieFlight ? [] : config?.links?.map((link) => link.icon).filter(Boolean) || [];
  flight.textContent = "";

  videos.slice(0, 4).forEach((video, index) => {
    const link = document.createElement("a");
    link.className = isMovieFlight
      ? `movie-flying-thumb movie-thumb-${String.fromCharCode(97 + index)}`
      : `flying-thumb thumb-${String.fromCharCode(97 + index)}`;
    link.href = video.url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.setAttribute("aria-label", video.title);

    const img = document.createElement("img");
    img.src = video.thumb;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    link.append(img);
    flight.append(link);
  });

  iconSources.forEach((src, index) => {
    const icon = document.createElement("span");
    icon.className = `flying-icon icon-${index + 1}`;
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    icon.append(img);
    flight.append(icon);
  });
}

function applyConfigBasics(config) {
  if (!config) return;
  if (!document.body?.hasAttribute("data-builder-page")) {
    document.title = config.site?.title || document.title;
  }
  const description = document.querySelector('meta[name="description"]');
  if (description && config.site?.description) {
    description.setAttribute("content", config.site.description);
  }

  const footerDate = document.querySelector(".site-footer span:last-child");
  if (footerDate && config.site?.updated) {
    footerDate.textContent = `Last updated ${config.site.updated}`;
  }
}

async function loadSiteConfig() {
  try {
    const response = await fetch(CONFIG_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Config returned ${response.status}`);
    siteConfig = await response.json();
  } catch {
    siteConfig = null;
  }

  applyConfigBasics(siteConfig);
  const videos = await loadYoutubeVideos(siteConfig);
  if (videos.length) {
    renderFeaturedVideo(videos);
    renderArchiveStrip(videos);
    renderThumbnailFlight(videos, siteConfig);
  }
}

function initPage() {
  if (pageStarted) return;
  pageStarted = true;
  depthSections = Array.from(document.querySelectorAll(".hero, .section-shell"));
  moodSections = [
    ["hero", document.querySelector(".hero")],
    ["profile", document.querySelector("#profile")],
    ["links", document.querySelector("#links")],
    ["movie", document.querySelector("#movie")],
    ["tags", document.querySelector("#tags")],
    ["contact", document.querySelector("#contact")],
  ].filter(([, section]) => section);
  loadSiteConfig();
  setupNavigation();
  revealOnScroll();
  setupTiltCards();
  setupPointerSparkles();
  setupInteractionGimmicks();
  updateProgress();
  window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
  window.addEventListener("resize", scheduleProgressUpdate);
}

setupAccessGate();
