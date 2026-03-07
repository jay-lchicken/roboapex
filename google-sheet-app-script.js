const SHEET_NAME = "Term 1"; // change if needed
const TZ = "Asia/Singapore";

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const secret = PropertiesService.getScriptProperties().getProperty("WEBHOOK_SECRET");
    if (!secret || body.secret !== secret) return json({ error: "Unauthorized" }, 401);

    const action = body.action || "syncAttendance";
    if (action === "loadAttendance") return loadAttendance(body);
    return syncAttendance(body);
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
}
function str(v) {
  return v === null || v === undefined ? "" : String(v).trim();
}

function createPhotoUrlExtractor(sheet) {
  const range = sheet.getDataRange();
  const values = range.getValues(); // single full-sheet read [web:3][web:18]

  function extractPhotoUrl(r, c) {
    const v = values[r][c];

    if (v && typeof v === "object") {
      try {
        if (typeof v.getContentUrl === "function") {
          const u = v.getContentUrl();
          if (u) return String(u).trim();
        }
      } catch (_) {}
      try {
        if (typeof v.getUrl === "function") {
          const u = v.getUrl();
          if (u) return String(u).trim();
        }
      } catch (_) {}
      try {
        if (typeof v.toBuilder === "function") {
          const b = v.toBuilder();
          if (b && typeof b.getSourceUrl === "function") {
            const u = b.getSourceUrl();
            if (u) return String(u).trim();
          }
        }
      } catch (_) {}
    }

    return "";
  }

  return { values, extractPhotoUrl };
}

function loadAttendance(body) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);

  const { values, extractPhotoUrl } = createPhotoUrlExtractor(sheet);

  const headerRow = findHeaderRow(values);
  const headers = values[headerRow];
  const batchId = String(body.batchId || "").trim();

  const noCol = indexOfHeader(headers, "No.");
  const nameCol = indexOfHeader(headers, "Name");
  const classCol = indexOfHeader(headers, "Class");
  const regCol = indexOfHeader(headers, "Class Reg. No");
  const genderCol = indexOfHeader(headers, "Gender");
  const emailCol = indexOfHeader(headers, "Email");
  const photoCol = indexOfHeader(headers, "Photo");

  const picked = pickDateColumn(headers, body.dateLabel);
  const dateCol = picked.dateCol;
  const dateLabel = picked.dateLabel;

  const rows = [];
  let inBatch = !batchId;

  for (let r = headerRow + 1; r < values.length; r++) {
    const row = values[r];
    const rowText = row.map(x => String(x || "").trim());

    if (batchId && rowText.includes(batchId)) {
      inBatch = true;
      continue;
    }
    if (inBatch && rowText.some(t => /Batch$/i.test(t)) && !rowText.includes(batchId)) break;
    if (!inBatch) continue;

    const noVal = String(row[noCol] || "").trim();
    if (!/^\d+$/.test(noVal)) continue;

    rows.push({
      memberId: noVal,
      memberName: String(row[nameCol] || "").trim(),
      className: String(row[classCol] || "").trim(),
      classRegNo: String(row[regCol] || "").trim(),
      gender: String(row[genderCol] || "").trim(),
      email: String(row[emailCol] || "").trim(),
      photo: extractPhotoUrl(r, photoCol),
      attendanceStatus: dateCol >= 0 ? str(row[dateCol]) : "",
      remarks: dateCol >= 0 ? str(row[dateCol + 1]) : "",
    });
  }

  return json({ ok: true, dateLabel, students: rows });
}

function findBatchBounds(values, headerRow, batchId) {
  if (!batchId) return { start: headerRow + 1, end: values.length - 1 };

  let start = -1;
  let end = values.length - 1;

  for (let r = headerRow + 1; r < values.length; r++) {
    const rowText = values[r].map(x => String(x || "").trim());
    if (rowText.includes(batchId)) {
      start = r + 1; // data starts after batch marker row
      break;
    }
  }
  if (start < 0) throw new Error("Batch not found: " + batchId);

  for (let r = start; r < values.length; r++) {
    const rowText = values[r].map(x => String(x || "").trim());
    if (rowText.some(t => /Batch$/i.test(t)) && !rowText.includes(batchId)) {
      end = r - 1;
      break;
    }
  }

  return { start, end };
}

function headerLabel(v) {
  if (Object.prototype.toString.call(v) === "[object Date]" && !isNaN(v)) {
    return Utilities.formatDate(v, TZ, "d MMMM"); // e.g. "2 January"
  }
  return String(v || "").replace(/\u00A0/g, " ").trim();
}

function parseHeaderDate(s) {
  if (Object.prototype.toString.call(s) === "[object Date]" && !isNaN(s)) {
    return { day: s.getDate(), month: s.getMonth() };
  }

  const text = headerLabel(s);
  const m = text.match(/^(\d{1,2})\s+([A-Za-z]+)$/);
  if (!m) return null;

  const months = {
    jan:0,january:0,feb:1,february:1,mar:2,march:2,apr:3,april:3,may:4,
    jun:5,june:5,jul:6,july:6,aug:7,august:7,sep:8,september:8,
    oct:9,october:9,nov:10,november:10,dec:11,december:11
  };

  const month = months[m[2].toLowerCase()];
  if (month === undefined) return null;
  return { day: Number(m[1]), month };
}

function pickDateColumn(headers, preferred) {
  const headerTexts = headers.map(headerLabel);
  const normPref = headerLabel(preferred);

  if (normPref) {
    const exact = headerTexts.findIndex(h => h === normPref);
    if (exact >= 0) return { dateCol: exact, dateLabel: normPref };
  }

  const parsedPref = parseHeaderDate(normPref);
  const dateCols = [];
  headerTexts.forEach((h, i) => {
    const p = parseHeaderDate(h);
    if (p) dateCols.push({ i, label: h, month: p.month, day: p.day });
  });

  if (!dateCols.length) return { dateCol: -1, dateLabel: "" };
  if (!parsedPref) {
    const last = dateCols[dateCols.length - 1];
    return { dateCol: last.i, dateLabel: last.label };
  }

  const prefVal = parsedPref.month * 100 + parsedPref.day;
  let candidate = null;
  for (const d of dateCols) {
    const v = d.month * 100 + d.day;
    if (v <= prefVal) candidate = d;
  }
  if (!candidate) candidate = dateCols[0];

  return { dateCol: candidate.i, dateLabel: candidate.label };
}

function syncAttendance(body) {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Sheet not found: " + SHEET_NAME);

  const values = sheet.getDataRange().getValues();
  const headerRow = findHeaderRow(values);
  const headers = values[headerRow];

  const batchId = String(body.batchId || "").trim();
  if (!batchId) throw new Error("batchId is required.");

  const noCol = indexOfHeader(headers, "No.");
  const nameCol = indexOfHeader(headers, "Name");
  const { dateCol } = pickDateColumn(headers, body.dateLabel);
  if (dateCol < 0) throw new Error("No date column found.");

  const { start, end } = findBatchBounds(values, headerRow, batchId);

  // Build lookup: memberId/name → row index (0-based)
  const map = new Map();
  for (let r = start; r <= end; r++) {
    const noVal = String(values[r][noCol] || "").trim();
    const nameVal = String(values[r][nameCol] || "").trim().toLowerCase();
    if (/^\d+$/.test(noVal)) map.set("id:" + noVal, r);
    if (nameVal) map.set("name:" + nameVal, r);
  }

  const records = Array.isArray(body.records) ? body.records : [];
  const changes = []; // { row, status, excuse }
  records.forEach(rec => {
    const id = String(rec.memberId || "").trim();
    const name = String(rec.memberName || "").trim().toLowerCase();
    const row = map.get("id:" + id) ?? map.get("name:" + name);
    if (row === undefined) return;
    changes.push({
      row,
      status: str(rec.attendanceStatus),
      excuse: str(rec.excuseType),
    });
  });

  if (changes.length === 0) return json({ ok: true, updated: 0 });

  // Batch read + write for the whole batch range [web:3][web:18]
  const batchRows = end - start + 1;
  const existing = sheet
    .getRange(start + 1, dateCol + 1, batchRows, 2)
    .getValues();

  changes.forEach(c => {
    const offset = c.row - start;
    existing[offset][0] = c.status;
    existing[offset][1] = c.excuse;
  });

  sheet
    .getRange(start + 1, dateCol + 1, batchRows, 2)
    .setValues(existing);

  return json({ ok: true, updated: changes.length });
}

function norm(s) {
  return String(s || "")
    .replace(/\u00A0/g, " ")      // non-breaking space
    .replace(/[\u200B-\u200D]/g, "") // zero-width chars
    .trim()
    .replace(/:$/, "")
    .toLowerCase();
}

function findHeaderRow(values) {
  for (let i = 0; i < values.length; i++) {
    const row = values[i].map(norm);
    const hasNo = row.some(v => v === "no." || v === "no");
    const hasName = row.some(v => v === "name");
    const hasEmail = row.some(v => v === "email");
    if (hasNo && hasName && hasEmail) return i;
  }
  throw new Error("Header row not found.");
}

function indexOfHeader(headers, label) {
  const aliases = {
    "No.": ["no.", "no"],
    "Name": ["name"],
    "Class": ["class"],
    "Class Reg. No": ["class reg. no", "class reg no"],
    "Gender": ["gender"],
    "Email": ["email"],
  };

  const wanted = aliases[label] || [norm(label)];
  const idx = headers.findIndex((h) => wanted.includes(norm(h)));
  if (idx === -1) throw new Error("Missing header: " + label);
  return idx;
}

function json(obj, code) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}
