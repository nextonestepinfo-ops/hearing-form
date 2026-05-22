const pageButtons = document.querySelectorAll("[data-guide-page]");
const pageLinks = document.querySelectorAll("[data-guide-jump]");
const pagePanels = document.querySelectorAll("[data-guide-panel]");
const deck = document.querySelector("#guide-pages");
const estimateInputs = document.querySelectorAll(".estimate-layout input");
const estimateTotal = document.querySelector("[data-estimate-total]");
const estimateNote = document.querySelector("[data-estimate-note]");
const estimateMeter = document.querySelector("[data-estimate-meter]");
const diagnosisInputs = document.querySelectorAll("[data-diagnosis]");
const diagnosisKicker = document.querySelector("[data-diagnosis-kicker]");
const diagnosisTitle = document.querySelector("[data-diagnosis-title]");
const diagnosisPrice = document.querySelector("[data-diagnosis-price]");
const diagnosisCopy = document.querySelector("[data-diagnosis-copy]");
const diagnosisTags = document.querySelector("[data-diagnosis-tags]");
const evolvePreview = document.querySelector("[data-evolve-preview]");
const evolvePreviewImage = document.querySelector(".evolve-preview > img");
const evolveButtons = document.querySelectorAll("[data-evolve-stage]");
const evolveKicker = document.querySelector("[data-evolve-kicker]");
const evolveTitle = document.querySelector("[data-evolve-title]");
const evolveCopy = document.querySelector("[data-evolve-copy]");
const evolveList = document.querySelector("[data-evolve-list]");
const labPreview = document.querySelector("[data-lab-preview]");
const labInputs = document.querySelectorAll("[data-lab-option]");
const labTotal = document.querySelector("[data-lab-total]");
const adHookPreview = document.querySelector("[data-ad-hook-preview]");
const adHookReplay = document.querySelector("[data-ad-hook-replay]");
const planPreviewCards = document.querySelectorAll("[data-plan-preview-trigger]");
const planPreviewGrid = document.querySelector(".guide-plan-grid");
const planPreview = document.querySelector("[data-plan-preview]");
const planPreviewKicker = document.querySelector("[data-plan-preview-kicker]");
const planPreviewImage = document.querySelector("[data-plan-preview-image]");
const planPreviewTags = document.querySelector("[data-plan-preview-tags]");
const planPreviewPrice = document.querySelector("[data-plan-preview-price]");
const planPreviewTitle = document.querySelector("[data-plan-preview-title]");
const planPreviewCopy = document.querySelector("[data-plan-preview-copy]");
const planPreviewList = document.querySelector("[data-plan-preview-list]");
const yenFormat = new Intl.NumberFormat("ja-JP");

const plans = {
  starter: {
    kicker: "BASIC",
    title: "基本制作",
    price: "10,000円〜",
    copy: "ロゴ、メインビジュアル、SNSリンクをまとめ、公式サイトとして見せられる入口を作ります。",
    tags: ["トップ", "SNSリンク", "スマホ対応"],
    list: ["トップ1画面", "ロゴ/メインビジュアル/SNSリンク", "スマホ基本調整"],
  },
  standard: {
    kicker: "CONTENTS",
    title: "情報追加",
    price: "+8,000円〜",
    copy: "プロフィール、活動先、タグ、リンクを整理し、初見の人にも活動内容が伝わる構成にします。",
    tags: ["プロフィール", "タグ", "リンク"],
    list: ["プロフィール/活動紹介", "リンク/タグ整理", "追加セクション構成"],
  },
  recommend: {
    kicker: "MOTION",
    title: "演出追加",
    price: "+5,000円〜",
    copy: "ロード画面や背景の動きを加え、SNSで見た時の印象を強くします。",
    tags: ["ローディング", "コメント風", "背景演出"],
    list: ["ローディング演出", "背景/コメント風モーション", "ホバー/スクロール反応"],
  },
  full: {
    kicker: "FULL SET",
    title: "おまかせセット",
    price: "49,800円以内目安",
    copy: "必要な要素をまとめて、スマホでもPCでも見栄えのする公式サイトに仕上げます。",
    tags: ["まとめて制作", "動画表示", "PC/SP"],
    list: ["YouTube/Twitch表示", "PC/スマホ両方の見せ場", "公開後の軽微修正込み"],
  },
};

const planPreviewMeta = {
  starter: {
    kicker: "基本制作プレビュー",
    image: "./assets/pricing-konoha-hero-desktop.png",
    alt: "基本制作の表示イメージ",
    tags: ["トップ", "SNS", "スマホ"],
  },
  standard: {
    kicker: "情報追加プレビュー",
    image: "./assets/pricing-konoha-profile.png",
    alt: "情報追加の表示イメージ",
    tags: ["プロフィール", "タグ", "リンク"],
  },
  recommend: {
    kicker: "演出追加プレビュー",
    image: "./assets/pricing-konoha-movie.png",
    alt: "演出追加の表示イメージ",
    tags: ["ロード", "コメント", "動き"],
  },
  full: {
    kicker: "おまかせプレビュー",
    image: "./assets/pricing-konoha-hero-desktop.png",
    alt: "おまかせセットの表示イメージ",
    tags: ["まとめて", "動画表示", "PC/SP"],
  },
};

function showGuidePage(pageName, shouldScroll = true) {
  pageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.guidePage === pageName);
  });
  pagePanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.guidePanel === pageName);
  });
  if (shouldScroll && deck) {
    deck.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (pageName === "hook") {
    replayAdHook();
  }
}

function renderTagList(node, tags) {
  if (!node) return;
  node.textContent = "";
  tags.forEach((tag) => {
    const item = document.createElement("b");
    item.textContent = tag;
    node.append(item);
  });
}

function updateDiagnosis() {
  const score = Array.from(diagnosisInputs).reduce((sum, input) => (
    input.checked ? sum + Number(input.dataset.diagnosis || 0) : sum
  ), 0);
  const key = score >= 11 ? "full" : score >= 7 ? "recommend" : score >= 3 ? "standard" : "starter";
  const plan = plans[key];
  if (diagnosisKicker) diagnosisKicker.textContent = plan.kicker;
  if (diagnosisTitle) diagnosisTitle.textContent = plan.title;
  if (diagnosisPrice) diagnosisPrice.textContent = plan.price;
  if (diagnosisCopy) diagnosisCopy.textContent = plan.copy;
  renderTagList(diagnosisTags, plan.tags);
}

function updateEvolve(stage) {
  const plan = plans[stage] || plans.starter;
  const meta = planPreviewMeta[stage] || planPreviewMeta.starter;
  evolveButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.evolveStage === stage);
  });
  if (evolvePreview) evolvePreview.dataset.evolvePreview = stage;
  if (evolvePreviewImage) {
    evolvePreviewImage.src = meta.image;
    evolvePreviewImage.alt = `${plan.title} の段階プレビュー`;
  }
  if (evolveKicker) evolveKicker.textContent = plan.kicker;
  if (evolveTitle) evolveTitle.textContent = plan.title;
  if (evolveCopy) evolveCopy.textContent = plan.copy;
  if (evolveList) {
    evolveList.textContent = "";
    plan.list.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      evolveList.append(item);
    });
  }
}

function placePlanPreview(stage) {
  if (!planPreview || !planPreviewGrid) return;
  const selectedCard = document.querySelector(`[data-plan-preview-trigger="${stage}"]`);
  if (window.matchMedia("(max-width: 620px)").matches && selectedCard) {
    selectedCard.insertAdjacentElement("afterend", planPreview);
    return;
  }
  planPreviewGrid.insertAdjacentElement("afterend", planPreview);
}

function updatePlanPreview(stage, shouldScroll = false) {
  const key = plans[stage] ? stage : "starter";
  const plan = plans[key];
  const meta = planPreviewMeta[key] || planPreviewMeta.starter;
  placePlanPreview(key);

  planPreviewCards.forEach((card) => {
    const isSelected = card.dataset.planPreviewTrigger === key;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-pressed", isSelected ? "true" : "false");
  });

  if (planPreview) planPreview.dataset.planPreview = key;
  if (planPreviewKicker) planPreviewKicker.textContent = meta.kicker;
  if (planPreviewImage) {
    planPreviewImage.src = meta.image;
    planPreviewImage.alt = meta.alt;
  }
  if (planPreviewPrice) planPreviewPrice.textContent = plan.price;
  if (planPreviewTitle) planPreviewTitle.textContent = plan.title;
  if (planPreviewCopy) planPreviewCopy.textContent = plan.copy;
  renderTagList(planPreviewTags, meta.tags);
  if (planPreviewList) {
    planPreviewList.textContent = "";
    plan.list.forEach((text) => {
      const item = document.createElement("li");
      item.textContent = text;
      planPreviewList.append(item);
    });
  }

  if (shouldScroll && planPreview && window.matchMedia("(max-width: 980px)").matches) {
    planPreview.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

function updateLab() {
  let total = 0;
  labInputs.forEach((input) => {
    const option = input.dataset.labOption;
    if (!option || !labPreview) return;
    labPreview.classList.toggle(`has-${option}`, input.checked);
    if (input.checked) total += Number(input.value || 0);
  });
  if (labTotal) labTotal.textContent = total ? `+${yenFormat.format(total)}円〜` : "0円";
}

function replayAdHook() {
  if (!adHookPreview) return;
  adHookPreview.classList.remove("is-playing");
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      adHookPreview.classList.add("is-playing");
    });
  });
}

function updateEstimate() {
  const checkedPlan = document.querySelector(".estimate-layout input[name='plan']:checked");
  const base = Number(checkedPlan?.value || 0);
  const options = Array.from(document.querySelectorAll(".estimate-layout input[type='checkbox']:checked"))
    .reduce((sum, input) => sum + Number(input.value || 0), 0);
  const total = base + options;
  const meter = Math.min(100, Math.round((total / 49800) * 100));
  const isOverCap = total > 49800;

  if (estimateTotal) {
    estimateTotal.textContent = isOverCap ? "49,800円内で調整" : `${yenFormat.format(total)}円〜`;
  }
  if (estimateMeter) estimateMeter.style.width = `${meter}%`;
  if (!estimateNote) return;

  if (total <= 24800) {
    estimateNote.textContent = "まずは公式サイトの入口を整えたい方に向いた価格帯です。";
  } else if (total <= 39800) {
    estimateNote.textContent = "プロフィール、タグ、アーカイブ、軽い演出まで組み合わせやすい価格帯です。";
  } else if (total <= 49800) {
    estimateNote.textContent = "トップの見せ場、スマホ表示、動画導線までまとめて整えやすい価格帯です。";
  } else {
    estimateNote.textContent = `${yenFormat.format(total)}円分の内容です。5万円未満に収まるよう優先度を整理してご提案します。`;
  }
}

pageButtons.forEach((button) => {
  button.addEventListener("click", () => showGuidePage(button.dataset.guidePage));
});

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showGuidePage(link.dataset.guideJump);
  });
});

diagnosisInputs.forEach((input) => input.addEventListener("change", updateDiagnosis));
evolveButtons.forEach((button) => {
  button.addEventListener("click", () => updateEvolve(button.dataset.evolveStage));
});
planPreviewCards.forEach((card) => {
  card.addEventListener("click", () => updatePlanPreview(card.dataset.planPreviewTrigger, true));
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    updatePlanPreview(card.dataset.planPreviewTrigger, true);
  });
});
adHookReplay?.addEventListener("click", replayAdHook);
labInputs.forEach((input) => input.addEventListener("change", updateLab));
estimateInputs.forEach((input) => input.addEventListener("change", updateEstimate));

window.addEventListener("resize", () => {
  placePlanPreview(planPreview?.dataset.planPreview || "starter");
});

document.querySelectorAll(".guide-plan-card, .example-card, .option-detail-grid article, .motion-demo-card").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--card-x", `${Math.max(0, Math.min(100, x)).toFixed(2)}%`);
    card.style.setProperty("--card-y", `${Math.max(0, Math.min(100, y)).toFixed(2)}%`);
  });
});

updateDiagnosis();
updateEvolve("starter");
updatePlanPreview("starter");
updateLab();
updateEstimate();
