// Google Apps Script Web App URL — paste your deployed URL here after setup
// Example: "https://script.google.com/macros/s/AKfycby.../exec"
export const APPS_SCRIPT_URL = "";

export interface StudentRow {
  Name: string;
  Mobile: string;
  Class: string;
  Teacher: string;
  Fees: string;
  AddedAt: string;
  [key: string]: string;
}

export interface ReportRow {
  StudentName: string;
  Attendance: string;
  Sabak: string;
  Akhlaq: string;
  Fees: string;
  Date: string;
  [key: string]: string;
}

export interface NewStudent {
  name: string;
  mobile: string;
  className: string;
  teacher: string;
  fees: string;
  addedAt: string;
}

export interface NewReport {
  studentName: string;
  attendance: string;
  sabak: string;
  akhlaq: string;
  fees: string;
  date: string;
}

function checkUrl(): void {
  if (!APPS_SCRIPT_URL) {
    throw new Error("Apps Script URL not configured");
  }
}

export async function getStudents(): Promise<StudentRow[]> {
  checkUrl();
  const res = await fetch(`${APPS_SCRIPT_URL}?action=getStudents`, {
    signal: AbortSignal.timeout(5000),
  });
  const json = await res.json();
  return (json.data ?? json) as StudentRow[];
}

export async function addStudent(data: NewStudent): Promise<void> {
  checkUrl();
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "addStudent", data }),
    signal: AbortSignal.timeout(5000),
  });
  const json = await res.json();
  if (json.status === "error") {
    throw new Error(json.message ?? "Failed to add student");
  }
}

export async function getReports(): Promise<ReportRow[]> {
  checkUrl();
  const res = await fetch(`${APPS_SCRIPT_URL}?action=getReports`, {
    signal: AbortSignal.timeout(5000),
  });
  const json = await res.json();
  return (json.data ?? json) as ReportRow[];
}

export async function addReport(data: NewReport): Promise<void> {
  checkUrl();
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify({ action: "addReport", data }),
    signal: AbortSignal.timeout(5000),
  });
  const json = await res.json();
  if (json.status === "error") {
    throw new Error(json.message ?? "Failed to add report");
  }
}
