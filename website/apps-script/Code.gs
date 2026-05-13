const CONFIG = {
  SHEET_ID: "1JnJ0YsQ1FhIbr-lmO0HW7Zlg1VdBtxF2pCLRapMir1M",
  TARGET_SHEET_NAME: "ヒアリング入力",
};

function doGet() {
  return jsonOutput({
    ok: true,
    message: "NosTechnology website hearing form endpoint is active.",
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

    const row = buildWebsiteRow(payload);
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
  if (!text(payload.purpose)) throw new Error("purpose is required.");
}

function buildWebsiteRow(payload) {
  const now = new Date();
  const needs = listText(payload.siteNeeds);
  const priority = derivePriority(payload);
  const proposal = deriveProposal(payload);
  const materialSummary = [
    fieldLine("写真", payload.photoStatus),
    fieldLine("原稿", payload.textStatus),
    fieldLine("ロゴ", payload.logoStatus),
  ]
    .filter(Boolean)
    .join(" / ");
  const memo = [
    fieldLine("目的", payload.purpose),
    fieldLine("困りごと", payload.currentIssue),
    fieldLine("見てほしい相手", payload.targetAudience),
    fieldLine("見せたい印象", payload.desiredImpression),
    fieldLine("参考サイト", payload.references),
    fieldLine("ドメイン", payload.domainStatus),
    fieldLine("サーバー", payload.serverStatus),
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
    text(payload.industry) || "Webサイト制作",
    text(payload.contactName),
    text(payload.contact),
    text(payload.currentSite),
    text(payload.purpose),
    text(payload.currentIssue),
    "",
    firstListItem(payload.siteNeeds) || "Webサイト制作",
    text(payload.timeline) || "未定",
    text(payload.budget) || "未定",
    text(payload.maintenanceInterest) || "未確認",
    materialSummary,
    memo,
    deriveNextAction(payload),
    "",
    text(payload.owner) || "浦田",
    proposal,
    "",
    "未判定",
    "",
    `送信元: ${text(payload.source) || "github-pages-website-hearing-form"} / 必要項目: ${needs || "未選択"}`,
    now,
  ];
}

function makeCaseId(date) {
  const timezone = Session.getScriptTimeZone() || "Asia/Tokyo";
  return `WS-${Utilities.formatDate(date, timezone, "yyyyMMdd-HHmmss")}`;
}

function derivePriority(payload) {
  const timeline = text(payload.timeline);
  const budget = text(payload.budget);
  const hasNearTimeline = ["急ぎ", "1週間以内", "1か月以内"].includes(timeline);
  const hasBudget = Boolean(budget && !["未定", "3万円未満"].includes(budget));

  if (hasNearTimeline && hasBudget) return "A";
  if (hasNearTimeline || hasBudget || text(payload.purpose)) return "B";
  return "C";
}

function deriveProposal(payload) {
  const needs = listText(payload.siteNeeds);
  if (needs.includes("予約導線")) return "予約導線付きWebサイト制作";
  if (needs.includes("問い合わせフォーム")) return "問い合わせ導線付きWebサイト制作";
  if (needs.includes("採用ページ")) return "採用ページ付きWebサイト制作";
  return "小規模Webサイト制作";
}

function deriveNextAction(payload) {
  const photo = text(payload.photoStatus);
  const textStatus = text(payload.textStatus);
  if (photo === "撮影が必要" || textStatus === "作成が必要") return "素材準備範囲を確認";
  if (derivePriority(payload) === "A") return "サイト構成案と概算見積を送付";
  return "必要ページを整理して追加ヒアリング";
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
