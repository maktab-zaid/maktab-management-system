// CSV parser utility for Google Sheets integration

export interface SheetStudent {
  name: string;
  fatherName: string;
  mobile: string;
  className: string;
  teacher: string;
  timing: string;
  feesStatus: string;
  monthlyFees: string;
  role: string;
  currentSabak: string;
  attendance: string;
  akhlaq: string;
}

export interface SheetReport {
  mobile: string;
  month: string;
  presentDays: string;
  sabak: string;
  akhlaq: string;
  feesStatus: string;
}

export interface SheetAdmin {
  mobile: string;
  name: string;
  role: string;
}

export interface SheetUser {
  mobile: string; // normalized (digits only)
  name: string;
  role: string; // "Admin" or "Staff" (case-insensitive)
}

// Parse CSV string into array of objects keyed by header
export function parseCSV(csv: string): Record<string, string>[] {
  if (!csv || csv.trim().length === 0) return [];

  const lines = csv.split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? "").trim();
    });
    // Skip completely empty rows
    if (Object.values(row).every((v) => v === "")) continue;
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Find column value by trying multiple possible names (case-insensitive)
export function getCol(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    for (const rowKey of Object.keys(row)) {
      if (rowKey.toLowerCase().trim() === key.toLowerCase().trim()) {
        return row[rowKey] ?? "";
      }
    }
  }
  return "";
}

// Normalize mobile number by stripping non-digits
export function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, "");
}

export function parseStudentsSheet(csv: string): SheetStudent[] {
  const rows = parseCSV(csv);
  return rows
    .map((row) => ({
      name: getCol(row, "name", "student name", "student_name", "full name"),
      fatherName: getCol(
        row,
        "father name",
        "father_name",
        "father",
        "walid ka naam",
      ),
      mobile: normalizeMobile(
        getCol(row, "mobile", "mobile number", "phone", "contact", "cell"),
      ),
      className: getCol(
        row,
        "class",
        "class name",
        "class_name",
        "darjah",
        "level",
      ),
      teacher: getCol(
        row,
        "teacher",
        "teacher name",
        "assigned teacher",
        "ustad",
      ),
      timing: getCol(row, "timing", "session", "time", "waqt"),
      feesStatus: getCol(
        row,
        "fees status",
        "fee status",
        "fees",
        "payment status",
      ),
      monthlyFees: getCol(
        row,
        "monthly fees",
        "fees amount",
        "amount",
        "monthly fee",
        "fee",
      ),
      role: getCol(row, "role", "user role", "type").toLowerCase(),
      currentSabak: getCol(
        row,
        "current sabak",
        "sabak",
        "current lesson",
        "lesson",
      ),
      attendance: getCol(
        row,
        "attendance",
        "present days",
        "days present",
        "hazri",
      ),
      akhlaq: getCol(row, "akhlaq", "akhlaq rating", "character", "conduct"),
    }))
    .filter((s) => s.mobile.length > 0);
}

export function parseMonthlyReports(csv: string): SheetReport[] {
  const rows = parseCSV(csv);
  return rows
    .map((row) => ({
      mobile: normalizeMobile(
        getCol(row, "mobile", "mobile number", "phone", "contact"),
      ),
      month: getCol(row, "month", "maah", "period"),
      presentDays: getCol(
        row,
        "present days",
        "attendance",
        "days present",
        "hazri",
        "present",
      ),
      sabak: getCol(row, "sabak", "current sabak", "lesson", "current lesson"),
      akhlaq: getCol(row, "akhlaq", "akhlaq rating", "character"),
      feesStatus: getCol(row, "fees status", "fee status", "fees", "payment"),
    }))
    .filter((r) => r.mobile.length > 0);
}

export function parseAdminSheet(csv: string): SheetAdmin[] {
  const rows = parseCSV(csv);
  return rows
    .map((row) => ({
      mobile: normalizeMobile(
        getCol(row, "mobile", "mobile number", "phone", "contact"),
      ),
      name: getCol(row, "name", "admin name", "full name"),
      role: getCol(row, "role", "user role", "type").toLowerCase(),
    }))
    .filter((r) => r.mobile.length > 0);
}

export function parseUsersSheet(csv: string): SheetUser[] {
  const rows = parseCSV(csv);
  return rows
    .map((row) => ({
      mobile: normalizeMobile(
        getCol(
          row,
          "mobile",
          "mobile number",
          "phone",
          "contact",
          "cell",
          "number",
        ),
      ),
      name: getCol(row, "name", "full name", "user name", "staff name"),
      role: getCol(row, "role", "user role", "type", "designation"),
    }))
    .filter((u) => u.mobile.length > 0);
}
