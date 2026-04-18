// ============================================================
// Maktab Management System - Google Apps Script Backend
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Go to: https://script.google.com
// 2. Create a new project
// 3. Paste this entire file into the editor
// 4. Update the SHEET IDs below if needed
// 5. Click Deploy > New deployment > Web App
//    - Execute as: Me
//    - Who has access: Anyone
// 6. Click Deploy, authorize, copy the Web App URL
// 7. Paste the URL in: src/frontend/src/lib/api.ts (APPS_SCRIPT_URL)
// ============================================================

var STUDENTS_SHEET_ID = "1RNqBfZGfjpLXbHB9pJpqUNR5gfWxKTSWyomYfp41f7s";
var REPORTS_SHEET_ID  = "1N1tlOyn3I8_p9xvxn34481u961ij4gPzo92kgYerNuQ";

var STUDENTS_TAB = "Sheet1";
var REPORTS_TAB  = "Sheet1";

// ---- Column headers ----
// Students Sheet columns (row 1 must have these headers):
//   Name | Mobile | Class | Teacher | Fees | AddedAt
// Reports Sheet columns (row 1 must have these headers):
//   StudentName | Attendance | Sabak | Akhlaq | Fees | Date

function doGet(e) {
  var action = e.parameter.action;
  try {
    if (action === "getStudents") {
      return jsonResponse({ success: true, data: getStudents() });
    }
    if (action === "getReports") {
      return jsonResponse({ success: true, data: getReports() });
    }
    return jsonResponse({ success: false, error: "Unknown action" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    if (action === "addStudent") {
      addStudent(body.data);
      return jsonResponse({ success: true });
    }
    if (action === "addReport") {
      addReport(body.data);
      return jsonResponse({ success: true });
    }
    return jsonResponse({ success: false, error: "Unknown action" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function getStudents() {
  var sheet = SpreadsheetApp.openById(STUDENTS_SHEET_ID).getSheetByName(STUDENTS_TAB);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i] !== undefined ? String(row[i]) : ""; });
    return obj;
  }).filter(function(r) { return r[headers[0]]; }); // skip empty rows
}

function addStudent(data) {
  var sheet = SpreadsheetApp.openById(STUDENTS_SHEET_ID).getSheetByName(STUDENTS_TAB);
  // Ensure header row exists
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Name", "Mobile", "Class", "Teacher", "Fees", "AddedAt"]);
  }
  sheet.appendRow([
    data.name     || "",
    data.mobile   || "",
    data.className|| "",
    data.teacher  || "",
    data.fees     || "",
    data.addedAt  || new Date().toLocaleDateString("en-IN")
  ]);
}

function getReports() {
  var sheet = SpreadsheetApp.openById(REPORTS_SHEET_ID).getSheetByName(REPORTS_TAB);
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i] !== undefined ? String(row[i]) : ""; });
    return obj;
  }).filter(function(r) { return r[headers[0]]; });
}

function addReport(data) {
  var sheet = SpreadsheetApp.openById(REPORTS_SHEET_ID).getSheetByName(REPORTS_TAB);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["StudentName", "Attendance", "Sabak", "Akhlaq", "Fees", "Date"]);
  }
  sheet.appendRow([
    data.studentName || "",
    data.attendance  || "",
    data.sabak       || "",
    data.akhlaq      || "",
    data.fees        || "",
    data.date        || new Date().toLocaleDateString("en-IN")
  ]);
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
