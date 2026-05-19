const CONFIG = {
  appsScriptUrl:
    "https://script.google.com/macros/s/AKfycby-OzGcHJEWcxmi2dAX_-BFCOZDhDeeqmciFLEyD39oZ9r7mb3ASAYUSLW_cMGJeEL8/exec",
  spreadsheetUrl:
    "https://docs.google.com/spreadsheets/d/1JnJ0YsQ1FhIbr-lmO0HW7Zlg1VdBtxF2pCLRapMir1M/edit#gid=1974068998",
};

const form = document.querySelector("[data-website-form]");
const submitButton = document.querySelector("[data-submit-button]");
const result = document.querySelector("[data-form-result]");
const requiredCount = document.querySelector("[data-required-count]");
const configStatus = document.querySelector("[data-config-status]");
const sheetLink = document.querySelector("[data-sheet-link]");
const siteNeedsError = document.querySelector("[data-site-needs-error]");
let siteNeedsTouched = false;

const endpointReady = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(
  CONFIG.appsScriptUrl,
);

sheetLink.href = CONFIG.spreadsheetUrl;
configStatus.textContent = endpointReady ? "スプレッドシート連携中" : "連携URL未設定";
configStatus.classList.add(endpointReady ? "ready" : "demo");

function value(name) {
  return form.elements[name]?.value?.trim() || "";
}

function getCheckedValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function line(label, content) {
  if (Array.isArray(content)) {
    return content.length ? `${label}: ${content.join(" / ")}` : "";
  }
  return content ? `${label}: ${content}` : "";
}

function updateProgress() {
  const checks = [
    Boolean(value("storeName")),
    Boolean(value("siteRoles")),
    Boolean(value("targetAudience")),
    Boolean(value("references")),
    Boolean(value("projectConditions")),
  ];
  const count = checks.filter(Boolean).length;
  const hasSiteNeeds = getCheckedValues("siteNeeds").length > 0;
  requiredCount.textContent = `${count}/5`;
  siteNeedsError.textContent =
    siteNeedsTouched && !hasSiteNeeds ? "必要なページ・機能を1つ以上選択してください。" : "";
}

function collectPayload() {
  const siteNeeds = getCheckedValues("siteNeeds");
  const supportNeeds = getCheckedValues("supportNeeds");
  const industryNotes = [
    line("飲食店向け", value("industry_1")),
    line("クリニック・治療院向け", value("industry_2")),
    line("コーポレートサイト向け", value("industry_3")),
    line("サロン・美容業向け", value("industry_4")),
  ].filter(Boolean);

  const memoLines = [
    line("Q1 期待する3つの役割", value("siteRoles")),
    line("Q2 現状数字と目標数字", value("targetMetrics")),
    line("Q3 競合比較", value("competitors")),
    line("Q4 きっかけの出来事", value("triggerStory")),
    line("Q5 ターゲット1人", value("targetAudience")),
    line("Q6 褒め言葉", value("praiseWords")),
    line("Q7 失注・離脱理由", value("lossReasons")),
    line("Q8 参考サイト", value("references")),
    line("Q9 NGデザイン", value("ngDesign")),
    line("Q10 ブランド素材", value("brandAssets")),
    line("Q11 必要ページ・機能", siteNeeds),
    line("Q12 更新頻度・担当者", value("updatePlan")),
    line("Q13 SEOキーワード", value("seoKeywords")),
    line("Q14 予算・納期・決裁", value("projectConditions")),
    line("Q15 保守希望", [...supportNeeds, value("supportNotes")].filter(Boolean)),
    ...industryNotes,
    line("追加メモ", value("memo")),
  ].filter(Boolean);

  return {
    source: "github-pages-website-briefing-sheet-v2",
    submittedAt: new Date().toISOString(),
    storeName: value("storeName"),
    industry: value("industry") || "Webサイト制作",
    route: value("route") || "フォーム",
    currentSite: value("currentSite"),
    contactName: value("contactName"),
    contact: value("contact"),
    purpose: value("siteRoles"),
    targetAudience: value("targetAudience"),
    desiredImpression: [value("praiseWords"), value("ngDesign")].filter(Boolean).join("\n"),
    currentIssue: [value("triggerStory"), value("lossReasons")].filter(Boolean).join("\n"),
    siteNeeds,
    photoStatus: value("photoStatus") || "未確認",
    textStatus: value("textStatus") || "未確認",
    logoStatus: value("logoStatus") || "未確認",
    domainStatus: value("domainStatus") || "未確認",
    serverStatus: value("serverStatus") || "未確認",
    references: value("references"),
    budget: value("budget") || "未定",
    timeline: value("timeline") || "未定",
    maintenanceInterest: value("maintenanceInterest") || "未確認",
    owner: value("owner") || "浦田",
    memo: memoLines.join("\n"),
  };
}

function validate(payload) {
  if (!payload.storeName) return "会社名・店舗名を入力してください。";
  if (!payload.purpose) return "Q1: サイトに期待する3つの役割を入力してください。";
  if (!payload.targetAudience) return "Q5: メインターゲット顧客を入力してください。";
  if (!payload.references) return "Q8: 参考にしたいサイトを入力してください。";
  if (!value("projectConditions")) return "Q14: 予算感・希望納期・決裁プロセスを入力してください。";
  if (payload.siteNeeds.length === 0) return "Q11: 必要なページ・機能を1つ以上選択してください。";
  return "";
}

function saveDemoDraft(payload) {
  const key = "nos_website_briefing_sheet_drafts";
  const drafts = JSON.parse(localStorage.getItem(key) || "[]");
  drafts.push(payload);
  localStorage.setItem(key, JSON.stringify(drafts.slice(-20)));
}

async function sendPayload(payload) {
  if (!endpointReady) {
    saveDemoDraft(payload);
    return {
      mode: "demo",
      message: "連携URL未設定のため、ブラウザ内に下書き保存しました。",
    };
  }

  await fetch(CONFIG.appsScriptUrl, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  return {
    mode: "sent",
    message: "送信しました。スプレッドシートに追記されます。",
  };
}

function setResult(message, type) {
  result.textContent = message;
  result.className = `form-result ${type}`;
}

form.addEventListener("input", updateProgress);
form.addEventListener("change", (event) => {
  if (event.target.name === "siteNeeds") {
    siteNeedsTouched = true;
  }
  updateProgress();
});
updateProgress();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = collectPayload();
  const error = validate(payload);

  if (error) {
    siteNeedsTouched = true;
    setResult(error, "error");
    updateProgress();
    return;
  }

  submitButton.disabled = true;
  setResult("送信中です。", "warning");

  try {
    const response = await sendPayload(payload);
    setResult(response.message, response.mode === "demo" ? "warning" : "success");
    form.reset();
    siteNeedsTouched = false;
    updateProgress();
  } catch (sendError) {
    setResult("送信できませんでした。通信状態とApps Script URLを確認してください。", "error");
  } finally {
    submitButton.disabled = false;
  }
});
