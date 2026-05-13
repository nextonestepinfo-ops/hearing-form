const CONFIG = {
  SHEET_ID: "1JnJ0YsQ1FhIbr-lmO0HW7Zlg1VdBtxF2pCLRapMir1M",
  TARGET_SHEET_NAME: "ヒアリング入力",
};

function doGet() {
  return jsonOutput({
    ok: true,
    message: "NosTechnology hearing form endpoint is active.",
    targetSheet: CONFIG.TARGET_SHEET_NAME,
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = parsePayload(e);
    validatePayload(payload);

    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = spreadsheet.getSheetByName(CONFIG.TARGET_SHEET_NAME);
    if (!sheet) {
      throw new Error(`Target sheet not found: ${CONFIG.TARGET_SHEET_NAME}`);
    }

    const row = buildHearingRow(payload);
    sheet.appendRow(row);

    const appendedRow = sheet.getLastRow();
    sheet.getRange(appendedRow, 2).setNumberFormat("yyyy-mm-dd hh:mm");
    sheet.getRange(appendedRow, 28).setNumberFormat("yyyy-mm-dd hh:mm");

    return jsonOutput({
      ok: true,
      caseId: row[0],
      row: appendedRow,
    });
  } catch (error) {
    return jsonOutput({
      ok: false,
      error: String(error && error.message ? error.message : error),
    });
  } finally {
    lock.releaseLock();
  }
}

function parsePayload(e) {
  if (e && e.postData && e.postData.contents) {
    return JSON.parse(e.postData.contents);
  }

  return e && e.parameter ? e.parameter : {};
}

function validatePayload(payload) {
  if (!text(payload.storeName)) throw new Error("storeName is required.");
  if (!text(payload.manualTask)) throw new Error("manualTask is required.");
}

function buildHearingRow(payload) {
  const now = new Date();
  const methods = listText(payload.managementMethods);
  const interests = listText(payload.interests);
  const firstInterest = firstListItem(payload.interests);
  const priority = derivePriority(payload);
  const proposal = deriveProposal(payload);
  const memo = [
    fieldLine("スタッフ人数", payload.staffCount),
    fieldLine("現在の管理方法", methods),
    fieldLine("備品/食材", payload.inventoryManagement),
    fieldLine("シフト", payload.shiftManagement),
    fieldLine("追加メモ", payload.memo),
  ]
    .filter(Boolean)
    .join("\n");

  return [
    makeCaseId(now),
    now,
    text(payload.route) || "フォーム",
    "見込み",
    priority,
    text(payload.storeName),
    text(payload.industry),
    text(payload.contactName),
    text(payload.contact),
    text(payload.currentChannel),
    text(payload.manualTask),
    text(payload.monthlyWork),
    text(payload.monthlyHours),
    firstInterest || text(payload.manualTask),
    text(payload.timeline) || "未定",
    text(payload.budget) || "未定",
    text(payload.maintenanceInterest) || "未確認",
    "",
    memo,
    deriveNextAction(payload),
    "",
    text(payload.owner) || "浦田",
    proposal,
    "",
    "未判定",
    "",
    `送信元: ${text(payload.source) || "github-pages-hearing-form"} / 興味: ${interests || "未選択"}`,
    now,
  ];
}

function makeCaseId(date) {
  const timezone = Session.getScriptTimeZone() || "Asia/Tokyo";
  return `HF-${Utilities.formatDate(date, timezone, "yyyyMMdd-HHmmss")}`;
}

function derivePriority(payload) {
  const timeline = text(payload.timeline);
  const budget = text(payload.budget);
  const hasNearTimeline = ["急ぎ", "1週間以内", "1か月以内"].includes(timeline);
  const hasBudget = Boolean(budget && !["未定", "1万円未満"].includes(budget));

  if (hasNearTimeline && hasBudget) return "A";
  if (hasNearTimeline || hasBudget || text(payload.manualTask)) return "B";
  return "C";
}

function deriveProposal(payload) {
  const firstInterest = firstListItem(payload.interests);
  if (firstInterest && firstInterest !== "まだ未定") return firstInterest;
  return "店内業務ミニ診断メモ";
}

function deriveNextAction(payload) {
  const priority = derivePriority(payload);
  if (priority === "A") return "ミニ診断メモ送付";
  if (priority === "B") return "課題整理して追加ヒアリング";
  return "情報確認";
}

function fieldLine(label, value) {
  const cleaned = text(value);
  return cleaned ? `${label}: ${cleaned}` : "";
}

function firstListItem(value) {
  if (Array.isArray(value)) return text(value[0]);
  return text(value).split(/[、,]/).map(text).filter(Boolean)[0] || "";
}

function listText(value) {
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join("、");
  return text(value);
}

function text(value) {
  return value == null ? "" : String(value).trim();
}

function jsonOutput(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
