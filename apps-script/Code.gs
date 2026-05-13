const CONFIG = {
  SHEET_ID: "1JnJ0YsQ1FhIbr-lmO0HW7Zlg1VdBtxF2pCLRapMir1M",
  TARGET_SHEET_NAME: "ヒアリング入力",
  PORTAL_SHEET_NAME: "取引先ポータル",
  PORTAL_MESSAGE_SHEET_NAME: "取引先やり取り",
  TIMEZONE: "Asia/Tokyo",
};

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = text(params.action);
  const token = text(params.token || params.key);

  if (action === "clientPortal" || token) {
    return jsonOutput(getClientPortalData(token), params.callback);
  }

  return jsonOutput({
    ok: true,
    message: "NosTechnology hearing form endpoint is active.",
    targetSheet: CONFIG.TARGET_SHEET_NAME,
    supportedForms: ["store-operations", "website", "client-portal"],
    portalAction: "clientPortal",
  });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const payload = parsePayload(e);

    if (isClientPortalMessagePayload(payload)) {
      return jsonOutput(appendClientPortalMessage(payload));
    }

    validatePayload(payload);

    const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
    const sheet = getSheetOrThrow(spreadsheet, CONFIG.TARGET_SHEET_NAME);
    const row = isWebsitePayload(payload) ? buildWebsiteRow(payload) : buildHearingRow(payload);

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
  if (isWebsitePayload(payload)) {
    if (!text(payload.purpose)) throw new Error("purpose is required.");
    return;
  }
  if (!text(payload.manualTask)) throw new Error("manualTask is required.");
}

function isWebsitePayload(payload) {
  return text(payload.source) === "github-pages-website-hearing-form" || Boolean(text(payload.purpose));
}

function isClientPortalMessagePayload(payload) {
  return text(payload.source) === "client-portal-message";
}

function getClientPortalData(token) {
  const safeToken = text(token);
  if (!safeToken) {
    return {
      ok: false,
      error: "アクセスキーを入力してください。",
      projects: [],
      messages: [],
    };
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const projects = getSheetRows(spreadsheet, CONFIG.PORTAL_SHEET_NAME)
    .filter((row) => isPublicPortalRow(row, safeToken))
    .map(toPublicProject);
  const messages = getSheetRows(spreadsheet, CONFIG.PORTAL_MESSAGE_SHEET_NAME)
    .filter((row) => text(row["アクセスキー"]) === safeToken)
    .map(toPublicMessage);

  if (projects.length === 0) {
    return {
      ok: false,
      error: "該当する公開プロジェクトが見つかりません。",
      projects: [],
      messages: [],
    };
  }

  return {
    ok: true,
    projects: projects,
    messages: messages,
    updatedAt: Utilities.formatDate(new Date(), CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss"),
  };
}

function appendClientPortalMessage(payload) {
  const token = text(payload.token || payload.key);
  const portal = getClientPortalData(token);

  if (!portal.ok || portal.projects.length === 0) {
    throw new Error("有効なアクセスキーではありません。");
  }

  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const sheet = getSheetOrThrow(spreadsheet, CONFIG.PORTAL_MESSAGE_SHEET_NAME);
  const now = new Date();
  const nowText = Utilities.formatDate(now, CONFIG.TIMEZONE, "yyyy-MM-dd HH:mm:ss");
  const messageId = "MSG-" + Utilities.formatDate(now, CONFIG.TIMEZONE, "yyyyMMdd-HHmmss");
  const caseId = text(payload.caseId) || portal.projects[0].caseId;

  sheet.appendRow([
    messageId,
    nowText,
    token,
    caseId,
    text(payload.name) || "取引先",
    text(payload.messageType) || "連絡",
    text(payload.message),
    text(payload.attachmentUrl),
    "未対応",
    "浦田",
    "",
    nowText,
  ]);

  return {
    ok: true,
    messageId: messageId,
    row: sheet.getLastRow(),
  };
}

function getSheetRows(spreadsheet, sheetName) {
  const sheet = getSheetOrThrow(spreadsheet, sheetName);
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headers = values[0].map((header) => text(header));
  return values.slice(1)
    .filter((row) => row.some((cell) => text(cell)))
    .map((row) => {
      const object = {};
      headers.forEach((header, index) => {
        if (header) object[header] = text(row[index]);
      });
      return object;
    });
}

function getSheetOrThrow(spreadsheet, sheetName) {
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new Error("Sheet not found: " + sheetName);
  return sheet;
}

function isPublicPortalRow(row, token) {
  return text(row["アクセスキー"]) === token && isTruthy(row["公開可"]);
}

function isTruthy(value) {
  const normalized = text(value).toLowerCase();
  return value === true || ["true", "1", "yes", "y", "公開", "公開可"].includes(normalized);
}

function toPublicProject(row) {
  return {
    caseId: text(row["案件ID"]),
    clientName: text(row["取引先名"]),
    projectName: text(row["プロジェクト名"]),
    status: text(row["ステータス"]),
    priority: text(row["優先度"]),
    phase: text(row["現在フェーズ"]),
    progress: Number(text(row["進捗%"]).replace("%", "")) || 0,
    nextAction: text(row["次アクション"]),
    dueDate: text(row["次回期限"]),
    owner: text(row["担当"]),
    lastUpdated: text(row["最終更新"]),
    sharedMemo: text(row["共有メモ"]),
    deliverableUrl: text(row["納品物URL"]),
    referenceUrl: text(row["参考URL"]),
    updatedAt: text(row["更新日時"]),
  };
}

function toPublicMessage(row) {
  return {
    messageId: text(row["受付ID"]),
    postedAt: text(row["投稿日"]),
    caseId: text(row["案件ID"]),
    author: text(row["投稿者"]),
    type: text(row["種別"]),
    body: text(row["内容"]),
    attachmentUrl: text(row["添付URL"]),
    status: text(row["ステータス"]),
    updatedAt: text(row["最終更新"]),
  };
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
    fieldLine("備品/在庫", payload.inventoryManagement),
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
    "未判断",
    "",
    `送信元: ${text(payload.source) || "github-pages-hearing-form"} / 興味: ${interests || "未選択"}`,
    now,
  ];
}

function makeCaseId(date) {
  return "HF-" + Utilities.formatDate(date, CONFIG.TIMEZONE, "yyyyMMdd-HHmmss");
}

function makeWebsiteCaseId(date) {
  return "WS-" + Utilities.formatDate(date, CONFIG.TIMEZONE, "yyyyMMdd-HHmmss");
}

function buildWebsiteRow(payload) {
  const now = new Date();
  const needs = listText(payload.siteNeeds);
  const priority = deriveWebsitePriority(payload);
  const proposal = deriveWebsiteProposal(payload);
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
    makeWebsiteCaseId(now),
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
    deriveWebsiteNextAction(payload),
    "",
    text(payload.owner) || "浦田",
    proposal,
    "",
    "未判断",
    "",
    `送信元: ${text(payload.source) || "github-pages-website-hearing-form"} / 必要項目: ${needs || "未選択"}`,
    now,
  ];
}

function derivePriority(payload) {
  const timeline = text(payload.timeline);
  const budget = text(payload.budget);
  const hasNearTimeline = ["急ぎ", "1週間以内", "1カ月以内"].includes(timeline);
  const hasBudget = Boolean(budget && !["未定", "1万円未満"].includes(budget));

  if (hasNearTimeline && hasBudget) return "A";
  if (hasNearTimeline || hasBudget || text(payload.manualTask)) return "B";
  return "C";
}

function deriveProposal(payload) {
  const firstInterest = firstListItem(payload.interests);
  if (firstInterest && firstInterest !== "まだ未定") return firstInterest;
  return "店舗業務ミニ診断メモ";
}

function deriveNextAction(payload) {
  const priority = derivePriority(payload);
  if (priority === "A") return "ミニ診断メモ送付";
  if (priority === "B") return "課題整理して追加ヒアリング";
  return "情報確認";
}

function deriveWebsitePriority(payload) {
  const timeline = text(payload.timeline);
  const budget = text(payload.budget);
  const hasNearTimeline = ["急ぎ", "1週間以内", "1カ月以内"].includes(timeline);
  const hasBudget = Boolean(budget && !["未定", "3万円未満"].includes(budget));

  if (hasNearTimeline && hasBudget) return "A";
  if (hasNearTimeline || hasBudget || text(payload.purpose)) return "B";
  return "C";
}

function deriveWebsiteProposal(payload) {
  const needs = listText(payload.siteNeeds);
  if (needs.includes("予約導線")) return "予約導線付きWebサイト制作";
  if (needs.includes("問い合わせフォーム")) return "問い合わせ導線付きWebサイト制作";
  if (needs.includes("採用ページ")) return "採用ページ付きWebサイト制作";
  return "小規模Webサイト制作";
}

function deriveWebsiteNextAction(payload) {
  const photo = text(payload.photoStatus);
  const textStatus = text(payload.textStatus);
  if (photo === "撮影が必要" || textStatus === "作成が必要") return "素材準備範囲を確認";
  if (deriveWebsitePriority(payload) === "A") return "サイト構成案と概算見積を送付";
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

function jsonOutput(data, callback) {
  const callbackName = text(callback);
  const body = JSON.stringify(data);

  if (callbackName && isSafeCallbackName(callbackName)) {
    return ContentService.createTextOutput(callbackName + "(" + body + ");").setMimeType(
      ContentService.MimeType.JAVASCRIPT,
    );
  }

  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function isSafeCallbackName(value) {
  return /^[A-Za-z_$][0-9A-Za-z_$]*(\.[A-Za-z_$][0-9A-Za-z_$]*)*$/.test(value);
}
