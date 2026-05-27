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
let sceneTransitionTimer = 0;
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

function setupSectionSceneTransitions() {
  const sections = Array.from(document.querySelectorAll(".section-shell"));
  if (!sections.length) return;

  sections.forEach((section) => section.classList.add("scene-ready"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("is-scene-active", "is-scene-content"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.classList.contains("is-scene-content")) return;
        entry.target.classList.add("is-scene-active");
        window.setTimeout(() => entry.target.classList.add("is-scene-content"), 720);
      });
    },
    { rootMargin: "0px 0px -34% 0px", threshold: 0.08 },
  );

  sections.forEach((section) => observer.observe(section));
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
  if (mood === "links") return "night";
  if (mood === "movie") return "pink";
  if (mood === "profile" || mood === "contact") return "mint";
  return "white";
}

function playSceneTransition(nextScene) {
  if (reduceMotion) return;
  const currentScene = document.body.dataset.scene || "moon";
  if (nextScene === currentScene) return;

  const sceneOrder = { white: 0, mint: 1, night: 2, pink: 3 };
  const direction = (sceneOrder[nextScene] ?? 0) >= (sceneOrder[currentScene] ?? 0) ? "forward" : "back";
  window.clearTimeout(sceneTransitionTimer);
  document.body.dataset.sceneDirection = direction;
  document.body.classList.remove("is-scene-switching");
  void document.body.offsetWidth;
  document.body.classList.add("is-scene-switching");
  sceneTransitionTimer = window.setTimeout(() => {
    document.body.classList.remove("is-scene-switching");
  }, 960);
}

function setupGeneratedLineBackground() {
  const canvas = document.querySelector("[data-konoha-line-field]");
  if (!canvas) return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const palettes = {
    white: {
      grid: "rgba(42, 150, 154, 0.28)",
      nodeAlpha: 0.52,
      power: 1.24,
      colors: [
        [26, 196, 178],
        [94, 236, 222],
        [146, 170, 184],
        [255, 174, 211],
      ],
    },
    mint: {
      grid: "rgba(20, 184, 164, 0.31)",
      nodeAlpha: 0.56,
      power: 1.28,
      colors: [
        [14, 202, 178],
        [76, 240, 216],
        [166, 255, 242],
        [245, 255, 255],
      ],
    },
    pink: {
      grid: "rgba(232, 92, 164, 0.28)",
      nodeAlpha: 0.54,
      power: 1.24,
      colors: [
        [255, 104, 179],
        [255, 184, 221],
        [64, 221, 205],
        [255, 227, 138],
      ],
    },
    night: {
      grid: "rgba(116, 245, 232, 0.34)",
      nodeAlpha: 0.66,
      power: 1.32,
      colors: [
        [103, 255, 236],
        [40, 226, 220],
        [255, 230, 142],
        [238, 255, 255],
      ],
    },
  };

  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    lanes: [],
    raf: 0,
  };

  function activePalette() {
    return palettes[document.body.dataset.scene] || palettes.white;
  }

  function createLane(index, total) {
    const band = index / Math.max(total - 1, 1);
    return {
      colorIndex: index % 4,
      x: Math.random(),
      y: (band + Math.random() * 0.075) % 1,
      length: 0.28 + Math.random() * 0.5,
      speed: 0.065 + Math.random() * 0.15,
      drift: -0.18 + Math.random() * 0.36,
      width: 1.25 + Math.random() * 3.25,
      alpha: 0.44 + Math.random() * 0.54,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.55);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.dpr = dpr;
    canvas.width = Math.round(state.width * dpr);
    canvas.height = Math.round(state.height * dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const laneCount = state.width < 720 ? 34 : state.width < 1180 ? 52 : 68;
    state.lanes = Array.from({ length: laneCount }, (_, index) => createLane(index, laneCount));
  }

  function lineGradient(x1, y1, x2, y2, lane, palette, pulse) {
    const gradient = context.createLinearGradient(x1, y1, x2, y2);
    const [r, g, b] = palette.colors[lane.colorIndex % palette.colors.length];
    const alpha = lane.alpha * palette.power;
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
    gradient.addColorStop(0.18, `rgba(${r}, ${g}, ${b}, ${alpha * 0.42})`);
    gradient.addColorStop(0.72, `rgba(${r}, ${g}, ${b}, ${alpha * pulse})`);
    gradient.addColorStop(0.86, `rgba(255, 255, 255, ${0.12 * pulse})`);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    return gradient;
  }

  function drawCircuit(time, palette) {
    context.save();
    context.strokeStyle = palette.grid;
    context.lineWidth = state.width < 720 ? 1.1 : 1.45;

    const spacing = state.width < 720 ? 74 : 104;
    const offset = (time * 34) % spacing;
    for (let x = -spacing * 2; x < state.width + spacing * 2; x += spacing) {
      context.beginPath();
      context.moveTo(x + offset, -24);
      context.lineTo(x + offset - state.height * 0.28, state.height + 24);
      context.stroke();
    }
    context.restore();
  }

  function drawLane(lane, time, index, palette) {
    const span = state.width + state.height * 0.44;
    const travel = (lane.x + time * lane.speed) % 1.24;
    const baseX = travel * span - state.width * 0.18;
    const baseY = lane.y * state.height + Math.sin(time * 1.55 + lane.pulse) * 28;
    const angle = -0.22 + lane.drift * 0.1;
    const length = lane.length * Math.max(state.width, 420);
    const x2 = baseX + Math.cos(angle) * length;
    const y2 = baseY + Math.sin(angle) * length;
    const pulse = 0.58 + Math.sin(time * 2.25 + lane.pulse) * 0.28;

    context.lineCap = "round";
    context.lineWidth = lane.width;
    context.strokeStyle = lineGradient(baseX, baseY, x2, y2, lane, palette, pulse);
    context.beginPath();
    context.moveTo(baseX, baseY);
    context.lineTo(x2, y2);
    context.stroke();

    if (index % 4 === 0) {
      const [r, g, b] = palette.colors[(lane.colorIndex + 1) % palette.colors.length];
      context.fillStyle = `rgba(${r}, ${g}, ${b}, ${palette.nodeAlpha * pulse})`;
      context.fillRect(x2 - 4, y2 - 4, 8, 8);
    }
  }

  function draw(now) {
    const time = now / 1000;
    const palette = activePalette();
    context.clearRect(0, 0, state.width, state.height);

    drawCircuit(time, palette);
    state.lanes.forEach((lane, index) => drawLane(lane, time, index, palette));

    if (!reduceMotion && !document.hidden) {
      state.raf = window.requestAnimationFrame(draw);
    }
  }

  function start() {
    resize();
    window.cancelAnimationFrame(state.raf);
    state.raf = window.requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.cancelAnimationFrame(state.raf);
      return;
    }
    start();
  });

  start();
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
  const nextScene = sceneForMood(nextMood);
  playSceneTransition(nextScene);
  document.body.dataset.mood = nextMood;
  document.body.dataset.scene = nextScene;
  moodNavLinks.forEach((link) => {
    const target = link.getAttribute("href")?.replace("#", "");
    const isActive = target === nextMood || (nextMood === "links" && target === "links");
    link.classList.toggle("is-active", isActive);
  });
}

function setupTiltCards() {
  // V5.1 keeps card UI stable and removes mouse-follow work.
}

function setupPointerSparkles() {
  // V5.1 removes pointer sparkle effects for a calmer, lighter site.
}

function setupInteractionGimmicks() {
  updateInteractionMood();
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
  setupSectionSceneTransitions();
  setupGeneratedLineBackground();
  setupTiltCards();
  setupPointerSparkles();
  setupInteractionGimmicks();
  updateProgress();
  window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
  window.addEventListener("resize", scheduleProgressUpdate);
}

setupAccessGate();
