const CONFIG = {
  appsScriptUrl: "PASTE_APPS_SCRIPT_WEB_APP_URL_HERE",
  spreadsheetUrl:
    "https://docs.google.com/spreadsheets/d/1JnJ0YsQ1FhIbr-lmO0HW7Zlg1VdBtxF2pCLRapMir1M/edit#gid=1974068998",
};

const form = document.querySelector("[data-hearing-form]");
const submitButton = document.querySelector("[data-submit-button]");
const result = document.querySelector("[data-form-result]");
const requiredCount = document.querySelector("[data-required-count]");
const configStatus = document.querySelector("[data-config-status]");
const sheetLink = document.querySelector("[data-sheet-link]");
const groupError = document.querySelector("[data-group-error]");
let methodGroupTouched = false;

const endpointReady = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(
  CONFIG.appsScriptUrl,
);

sheetLink.href = CONFIG.spreadsheetUrl;
configStatus.textContent = endpointReady ? "スプレッドシート連携中" : "連携URL未設定";
configStatus.classList.add(endpointReady ? "ready" : "demo");

function getCheckedValues(name) {
  return [...form.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function updateProgress() {
  const storeNameReady = Boolean(form.elements.storeName.value.trim());
  const manualTaskReady = Boolean(form.elements.manualTask.value.trim());
  const methodsReady = getCheckedValues("managementMethods").length > 0;
  const readyCount = [storeNameReady, manualTaskReady, methodsReady].filter(Boolean).length;
  requiredCount.textContent = `${readyCount}/3`;
  groupError.textContent =
    methodGroupTouched && !methodsReady ? "現在の管理方法を1つ以上選択してください。" : "";
}

function collectPayload() {
  const data = new FormData(form);
  const fields = Object.fromEntries(data.entries());

  return {
    source: "github-pages-hearing-form",
    submittedAt: new Date().toISOString(),
    storeName: fields.storeName?.trim() || "",
    industry: fields.industry || "",
    route: fields.route || "フォーム",
    currentChannel: fields.currentChannel?.trim() || "",
    contactName: fields.contactName?.trim() || "",
    contact: fields.contact?.trim() || "",
    managementMethods: getCheckedValues("managementMethods"),
    staffCount: fields.staffCount?.trim() || "",
    monthlyHours: fields.monthlyHours?.trim() || "",
    monthlyWork: fields.monthlyWork?.trim() || "",
    inventoryManagement: fields.inventoryManagement?.trim() || "",
    shiftManagement: fields.shiftManagement?.trim() || "",
    manualTask: fields.manualTask?.trim() || "",
    interests: getCheckedValues("interests"),
    budget: fields.budget || "未定",
    timeline: fields.timeline || "未定",
    maintenanceInterest: fields.maintenanceInterest || "未確認",
    owner: fields.owner || "浦田",
    memo: fields.memo?.trim() || "",
  };
}

function validate(payload) {
  if (!payload.storeName) return "店舗名・事業名を入力してください。";
  if (payload.managementMethods.length === 0) return "現在の管理方法を1つ以上選択してください。";
  if (!payload.manualTask) return "まず減らしたい手作業を入力してください。";
  return "";
}

function saveDemoDraft(payload) {
  const key = "nos_hearing_form_drafts";
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
  if (event.target.name === "managementMethods") {
    methodGroupTouched = true;
  }
  updateProgress();
});
updateProgress();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = collectPayload();
  const error = validate(payload);

  if (error) {
    methodGroupTouched = true;
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
    methodGroupTouched = false;
    updateProgress();
  } catch (sendError) {
    setResult("送信できませんでした。通信状態とApps Script URLを確認してください。", "error");
  } finally {
    submitButton.disabled = false;
  }
});
