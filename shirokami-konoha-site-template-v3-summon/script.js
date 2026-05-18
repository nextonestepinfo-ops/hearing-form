const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const loader = document.querySelector("[data-loader]");
const progress = document.querySelector("[data-scroll-progress]");
const hero = document.querySelector(".hero");
const CONFIG_URL = "./site-config.json";
const ACCESS_HASH = "9497683cb70785d3626818bc7a71924c14482e16636edd6668cc2664b75ed8fe";
const ACCESS_STORAGE_KEY = "shirokami-konoha-v3-summon-access";
let pageStarted = false;
let siteConfig = null;

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
  const iconSources = config?.links?.map((link) => link.icon).filter(Boolean) || [];
  flight.textContent = "";

  videos.slice(0, 4).forEach((video, index) => {
    const link = document.createElement("a");
    link.className = `flying-thumb thumb-${String.fromCharCode(97 + index)}`;
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
  loadSiteConfig();
  setupNavigation();
  revealOnScroll();
  setupTiltCards();
  setupPointerSparkles();
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
}

setupAccessGate();
