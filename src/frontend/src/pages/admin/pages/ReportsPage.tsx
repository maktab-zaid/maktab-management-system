import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AttendanceRecord,
  type FeeRecord,
  type SabakRecord,
  type Student,
  type Teacher,
  getAttendance,
  getFees,
  getSabak,
  getStudents,
  getTeachers,
} from "@/lib/storage";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  Download,
  IndianRupee,
  Loader2,
  Printer,
  Star,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  AttendanceStatus,
  useAcademicRecord,
  useAllStudents,
  useAllTeachers,
  useStudentAttendance,
  useStudentFees,
} from "../../../hooks/useQueries";
import { CLASS_OPTIONS } from "../../../types";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHIFTS = [
  { value: "all", label: "All Shifts" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

// ─── Print helper ─────────────────────────────────────────────────────────────

function openPrintWindow(title: string, bodyHtml: string) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`
    <html><head><title>${title}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; padding: 24px; color: #000; margin: 0; }
      h1 { color: #1a5c38; font-size: 22px; margin: 0 0 2px; }
      h2 { color: #1a5c38; font-size: 15px; margin: 4px 0 2px; }
      .sub { font-size: 12px; color: #555; margin: 2px 0; }
      .header { border-bottom: 2px solid #1a5c38; padding-bottom: 10px; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
      th { background: #1a5c38; color: #fff; padding: 7px 10px; text-align: left; }
      td { border: 1px solid #ccc; padding: 6px 10px; }
      tr:nth-child(even) td { background: #f7f7f7; }
      .summary-row td { font-weight: bold; background: #e8f5ee; border-top: 2px solid #1a5c38; }
      .badge-paid { color: #166534; font-weight: 600; }
      .badge-pending { color: #854d0e; font-weight: 600; }
      .att-high { color: #166534; font-weight: 600; }
      .att-mid { color: #92400e; font-weight: 600; }
      .att-low { color: #991b1b; font-weight: 600; }
      .footer { margin-top: 20px; font-size: 11px; color: #777; border-top: 1px solid #ccc; padding-top: 8px; }
      @media print { body { padding: 10px; } }
    </style>
    </head><body>${bodyHtml}</body></html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

// ─── StarRow ──────────────────────────────────────────────────────────────────

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "w-4 h-4",
            s <= value ? "fill-warning text-warning" : "text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}

// ─── Report 1: Student List ───────────────────────────────────────────────────

function StudentListReportCard() {
  const [localTeachers, setLocalTeachers] = useState<Teacher[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [shift, setShift] = useState("all");
  const [ustaad, setUstaad] = useState("all");

  useEffect(() => {
    getTeachers()
      .then(setLocalTeachers)
      .catch(() => setLocalTeachers([]));
    getStudents()
      .then(setAllStudents)
      .catch(() => setAllStudents([]));
  }, []);

  const filtered = allStudents.filter((s) => {
    const shiftMatch = shift === "all" || s.timeSlot === shift;
    const ustaadMatch = ustaad === "all" || s.teacherName === ustaad;
    return shiftMatch && ustaadMatch;
  });

  const handleDownload = () => {
    const shiftLabel =
      shift === "all"
        ? "All Shifts"
        : shift.charAt(0).toUpperCase() + shift.slice(1);
    const ustaadLabel = ustaad === "all" ? "All Ustaads" : ustaad;
    const rows = filtered
      .map(
        (s, i) => `
      <tr>
        <td>${s.rollNumber ?? i + 1}</td>
        <td>${s.name}</td>
        <td>${s.fatherName ?? "—"}</td>
        <td>${s.className}</td>
        <td>${s.timeSlot ? s.timeSlot.charAt(0).toUpperCase() + s.timeSlot.slice(1) : "—"}</td>
        <td>${s.teacherName ?? "—"}</td>
        <td>${s.parentMobile ?? "—"}</td>
        <td>${s.admissionDate ?? "—"}</td>
      </tr>`,
      )
      .join("");

    const html = `
      <div class="header">
        <h1>Maktab Zaid Bin Sabit</h1>
        <h2>Student List Report</h2>
        <p class="sub">Shift: ${shiftLabel} &nbsp;|&nbsp; Ustaad: ${ustaadLabel} &nbsp;|&nbsp; Total: ${filtered.length} students</p>
      </div>
      <table>
        <thead><tr>
          <th>Roll No.</th><th>Name</th><th>Father Name</th><th>Class</th>
          <th>Time Slot</th><th>Ustaad</th><th>Mobile</th><th>Admission Date</th>
        </tr></thead>
        <tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:#999">No students found</td></tr>'}</tbody>
      </table>
      <div class="footer">Generated on ${new Date().toLocaleDateString()} &nbsp;|&nbsp; Academic Year 2026-27</div>
    `;
    openPrintWindow("Student List Report", html);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            Student List Report
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Full student list with details, filtered by shift or Ustaad
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label
            htmlFor="sl-shift"
            className="text-xs font-medium text-muted-foreground"
          >
            Shift
          </label>
          <select
            id="sl-shift"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            data-ocid="admin.reports.student_list.shift_select"
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {SHIFTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="sl-ustaad"
            className="text-xs font-medium text-muted-foreground"
          >
            Ustaad
          </label>
          <select
            id="sl-ustaad"
            value={ustaad}
            onChange={(e) => setUstaad(e.target.value)}
            data-ocid="admin.reports.student_list.ustaad_select"
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Ustaads</option>
            {localTeachers.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
        {filtered.length} student{filtered.length !== 1 ? "s" : ""} match
        filters
      </div>

      <Button
        onClick={handleDownload}
        data-ocid="admin.reports.student_list.download_button"
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
      >
        <Download className="w-4 h-4" /> Download PDF
      </Button>
    </div>
  );
}

// ─── Report 2: Fees Report ────────────────────────────────────────────────────

function FeesReportCard() {
  const [shift, setShift] = useState("all");
  const [status, setStatus] = useState("all");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allFees, setAllFees] = useState<FeeRecord[]>([]);

  useEffect(() => {
    getStudents()
      .then(setAllStudents)
      .catch(() => setAllStudents([]));
    getFees()
      .then(setAllFees)
      .catch(() => setAllFees([]));
  }, []);

  const filteredStudents = allStudents.filter(
    (s) => shift === "all" || s.timeSlot === shift,
  );

  const feeRows = filteredStudents.map((s) => {
    const fee = allFees.find(
      (f) =>
        f.studentId === s.id &&
        f.month.toLowerCase().includes(month.toLowerCase()),
    );
    const feeStatus = fee?.status ?? s.feesStatus;
    const amount = fee?.amount ?? s.fees;
    return { s, fee, feeStatus, amount };
  });

  const displayed =
    status === "all" ? feeRows : feeRows.filter((r) => r.feeStatus === status);

  const totalPaid = displayed
    .filter((r) => r.feeStatus === "paid")
    .reduce((acc, r) => acc + r.amount, 0);
  const totalPending = displayed
    .filter((r) => r.feeStatus === "pending")
    .reduce((acc, r) => acc + r.amount, 0);

  const handleDownload = () => {
    const shiftLabel =
      shift === "all"
        ? "All Shifts"
        : shift.charAt(0).toUpperCase() + shift.slice(1);
    const statusLabel =
      status === "all"
        ? "All"
        : status.charAt(0).toUpperCase() + status.slice(1);

    const rows = displayed
      .map(
        (r, i) => `
      <tr>
        <td>${r.s.rollNumber ?? i + 1}</td>
        <td>${r.s.name}</td>
        <td>${r.s.className}</td>
        <td>${r.s.timeSlot ? r.s.timeSlot.charAt(0).toUpperCase() + r.s.timeSlot.slice(1) : "—"}</td>
        <td>₹${r.amount.toLocaleString("en-IN")}</td>
        <td class="${r.feeStatus === "paid" ? "badge-paid" : "badge-pending"}">${r.feeStatus === "paid" ? "Paid" : "Pending"}</td>
        <td>${r.fee?.month ?? `${month} 2026`}</td>
      </tr>`,
      )
      .join("");

    const html = `
      <div class="header">
        <h1>Maktab Zaid Bin Sabit</h1>
        <h2>Fees Report</h2>
        <p class="sub">Month: ${month} 2026 &nbsp;|&nbsp; Shift: ${shiftLabel} &nbsp;|&nbsp; Status: ${statusLabel}</p>
      </div>
      <table>
        <thead><tr>
          <th>Roll No.</th><th>Name</th><th>Class</th><th>Time Slot</th>
          <th>Monthly Fee</th><th>Status</th><th>Month</th>
        </tr></thead>
        <tbody>
          ${rows || '<tr><td colspan="7" style="text-align:center;color:#999">No records found</td></tr>'}
          <tr class="summary-row">
            <td colspan="4" style="text-align:right">TOTAL:</td>
            <td colspan="3">Paid: ₹${totalPaid.toLocaleString("en-IN")} &nbsp;|&nbsp; Pending: ₹${totalPending.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
      <div class="footer">Generated on ${new Date().toLocaleDateString()} &nbsp;|&nbsp; Academic Year 2026-27</div>
    `;
    openPrintWindow("Fees Report", html);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
          <IndianRupee className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Fees Report</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monthly fee status — Paid &amp; Pending with totals
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label
            htmlFor="fees-shift"
            className="text-xs font-medium text-muted-foreground"
          >
            Shift
          </label>
          <select
            id="fees-shift"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            data-ocid="admin.reports.fees.shift_select"
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {SHIFTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="fees-status"
            className="text-xs font-medium text-muted-foreground"
          >
            Status
          </label>
          <select
            id="fees-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            data-ocid="admin.reports.fees.status_select"
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label
          htmlFor="fees-month"
          className="text-xs font-medium text-muted-foreground"
        >
          Month
        </label>
        <select
          id="fees-month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          data-ocid="admin.reports.fees.month_select"
          className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m} 2026
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 text-xs">
        <div className="flex-1 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg px-3 py-2 text-center">
          <div className="font-bold text-emerald-700 dark:text-emerald-400">
            ₹{totalPaid.toLocaleString("en-IN")}
          </div>
          <div className="text-muted-foreground">Paid</div>
        </div>
        <div className="flex-1 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 text-center">
          <div className="font-bold text-amber-700 dark:text-amber-400">
            ₹{totalPending.toLocaleString("en-IN")}
          </div>
          <div className="text-muted-foreground">Pending</div>
        </div>
      </div>

      <Button
        onClick={handleDownload}
        data-ocid="admin.reports.fees.download_button"
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
      >
        <Download className="w-4 h-4" /> Download PDF
      </Button>
    </div>
  );
}

// ─── Report 3: Attendance Report ──────────────────────────────────────────────

function AttendanceReportCard() {
  const [localTeachers, setLocalTeachers] = useState<Teacher[]>([]);
  const [shift, setShift] = useState("all");
  const [ustaad, setUstaad] = useState("all");
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    getTeachers()
      .then(setLocalTeachers)
      .catch(() => setLocalTeachers([]));
    getStudents()
      .then(setAllStudents)
      .catch(() => setAllStudents([]));
    getAttendance()
      .then(setAllAttendance)
      .catch(() => setAllAttendance([]));
  }, []);

  const filtered = allStudents.filter((s) => {
    const shiftMatch = shift === "all" || s.timeSlot === shift;
    const ustaadMatch = ustaad === "all" || s.teacherName === ustaad;
    return shiftMatch && ustaadMatch;
  });

  const handleDownload = () => {
    const shiftLabel =
      shift === "all"
        ? "All Shifts"
        : shift.charAt(0).toUpperCase() + shift.slice(1);
    const ustaadLabel = ustaad === "all" ? "All Ustaads" : ustaad;

    const rows = filtered
      .map((s, i) => {
        const recs = allAttendance.filter(
          (a) =>
            a.studentId === s.id &&
            a.date.toLowerCase().includes(month.slice(0, 3).toLowerCase()),
        );
        const present = recs.filter((a) => a.status === "present").length;
        const absent = recs.filter((a) => a.status === "absent").length;
        const total = present + absent;
        const pct = total > 0 ? Math.round((present / total) * 100) : 0;
        const cls =
          pct >= 80
            ? "att-high"
            : pct >= 60
              ? "att-mid"
              : total > 0
                ? "att-low"
                : "";
        return `
        <tr>
          <td>${s.rollNumber ?? i + 1}</td>
          <td>${s.name}</td>
          <td>${s.className}</td>
          <td style="text-align:center">${present}</td>
          <td style="text-align:center">${absent}</td>
          <td class="${cls}" style="text-align:center">${total > 0 ? `${pct}%` : "N/A"}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <div class="header">
        <h1>Maktab Zaid Bin Sabit</h1>
        <h2>Attendance Report</h2>
        <p class="sub">Month: ${month} 2026 &nbsp;|&nbsp; Shift: ${shiftLabel} &nbsp;|&nbsp; Ustaad: ${ustaadLabel}</p>
      </div>
      <table>
        <thead><tr>
          <th>Roll No.</th><th>Name</th><th>Class</th>
          <th style="text-align:center">Present Days</th>
          <th style="text-align:center">Absent Days</th>
          <th style="text-align:center">Attendance %</th>
        </tr></thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;color:#999">No records found</td></tr>'}</tbody>
      </table>
      <p style="font-size:11px;color:#555;margin-top:8px">
        Color coding: <span class="att-high">■ &gt;80% Good</span> &nbsp;
        <span class="att-mid">■ 60–80% Average</span> &nbsp;
        <span class="att-low">■ &lt;60% Poor</span>
      </p>
      <div class="footer">Generated on ${new Date().toLocaleDateString()} &nbsp;|&nbsp; Academic Year 2026-27</div>
    `;
    openPrintWindow("Attendance Report", html);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <CalendarDays className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            Attendance Report
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Present / Absent days with attendance percentage
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label
            htmlFor="att-shift"
            className="text-xs font-medium text-muted-foreground"
          >
            Shift
          </label>
          <select
            id="att-shift"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            data-ocid="admin.reports.attendance.shift_select"
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {SHIFTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="att-ustaad"
            className="text-xs font-medium text-muted-foreground"
          >
            Ustaad
          </label>
          <select
            id="att-ustaad"
            value={ustaad}
            onChange={(e) => setUstaad(e.target.value)}
            data-ocid="admin.reports.attendance.ustaad_select"
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Ustaads</option>
            {localTeachers.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-1">
        <label
          htmlFor="att-month"
          className="text-xs font-medium text-muted-foreground"
        >
          Month
        </label>
        <select
          id="att-month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          data-ocid="admin.reports.attendance.month_select"
          className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {MONTHS.map((m) => (
            <option key={m} value={m}>
              {m} 2026
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 text-xs flex-wrap">
        <span className="flex items-center gap-1 text-emerald-600">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
          &gt;80% Good
        </span>
        <span className="flex items-center gap-1 text-amber-600">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />
          60–80% Avg
        </span>
        <span className="flex items-center gap-1 text-red-600">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" />
          &lt;60% Poor
        </span>
      </div>

      <Button
        onClick={handleDownload}
        data-ocid="admin.reports.attendance.download_button"
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
      >
        <Download className="w-4 h-4" /> Download PDF
      </Button>
    </div>
  );
}

// ─── Report 4: Sabak Progress Report ─────────────────────────────────────────

function SabakProgressReportCard() {
  const [localTeachers, setLocalTeachers] = useState<Teacher[]>([]);
  const [shift, setShift] = useState("all");
  const [ustaad, setUstaad] = useState("all");
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allSabak, setAllSabak] = useState<SabakRecord[]>([]);

  useEffect(() => {
    getTeachers()
      .then(setLocalTeachers)
      .catch(() => setLocalTeachers([]));
    getStudents()
      .then(setAllStudents)
      .catch(() => setAllStudents([]));
    getSabak()
      .then(setAllSabak)
      .catch(() => setAllSabak([]));
  }, []);

  const filtered = allStudents.filter((s) => {
    const shiftMatch = shift === "all" || s.timeSlot === shift;
    const ustaadMatch = ustaad === "all" || s.teacherName === ustaad;
    return shiftMatch && ustaadMatch;
  });

  const handleDownload = () => {
    const shiftLabel =
      shift === "all"
        ? "All Shifts"
        : shift.charAt(0).toUpperCase() + shift.slice(1);
    const ustaadLabel = ustaad === "all" ? "All Ustaads" : ustaad;

    const rows = filtered
      .map((s, i) => {
        const recs = allSabak.filter((r) => r.studentId === s.id);
        const quranRec = recs.find((r) => r.section === "quran");
        const urduRecs = recs.filter((r) => r.section === "urdu");
        const duaRecs = recs.filter((r) => r.section === "dua");
        const hadeesRecs = recs.filter((r) => r.section === "hadees");

        const quranText = quranRec?.currentLesson ?? "Not started";
        const urduCount = urduRecs.length;
        const duaCount = duaRecs.length;
        const hadeesCount = hadeesRecs.length;

        return `
        <tr>
          <td>${s.rollNumber ?? i + 1}</td>
          <td>${s.name}</td>
          <td>${s.className}</td>
          <td>${quranText}</td>
          <td style="text-align:center">${urduCount}</td>
          <td style="text-align:center">${duaCount}</td>
          <td style="text-align:center">${hadeesCount}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <div class="header">
        <h1>Maktab Zaid Bin Sabit</h1>
        <h2>Sabak Progress Report</h2>
        <p class="sub">Shift: ${shiftLabel} &nbsp;|&nbsp; Ustaad: ${ustaadLabel} &nbsp;|&nbsp; Total: ${filtered.length} students</p>
      </div>
      <table>
        <thead><tr>
          <th>Roll No.</th><th>Name</th><th>Class</th>
          <th>Quran (Surah/Ayat)</th>
          <th style="text-align:center">Urdu<br>(Lessons)</th>
          <th style="text-align:center">Dua<br>(Count)</th>
          <th style="text-align:center">Hadees<br>(Count)</th>
        </tr></thead>
        <tbody>${rows || '<tr><td colspan="7" style="text-align:center;color:#999">No records found</td></tr>'}</tbody>
      </table>
      <div class="footer">Generated on ${new Date().toLocaleDateString()} &nbsp;|&nbsp; Academic Year 2026-27</div>
    `;
    openPrintWindow("Sabak Progress Report", html);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">
            Sabak Progress Report
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Quran/Hifz, Urdu, Dua &amp; Hadees progress per student
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label
            htmlFor="sabak-shift"
            className="text-xs font-medium text-muted-foreground"
          >
            Shift
          </label>
          <select
            id="sabak-shift"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            data-ocid="admin.reports.sabak.shift_select"
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {SHIFTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label
            htmlFor="sabak-ustaad"
            className="text-xs font-medium text-muted-foreground"
          >
            Ustaad
          </label>
          <select
            id="sabak-ustaad"
            value={ustaad}
            onChange={(e) => setUstaad(e.target.value)}
            data-ocid="admin.reports.sabak.ustaad_select"
            className="w-full h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">All Ustaads</option>
            {localTeachers.map((t) => (
              <option key={t.id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs text-center">
        {["Quran", "Urdu", "Dua", "Hadees"].map((section) => (
          <div
            key={section}
            className="bg-muted/40 rounded-lg py-2 px-1 text-muted-foreground font-medium"
          >
            {section}
          </div>
        ))}
      </div>

      <Button
        onClick={handleDownload}
        data-ocid="admin.reports.sabak.download_button"
        className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
      >
        <Download className="w-4 h-4" /> Download PDF
      </Button>
    </div>
  );
}

// ─── Per-Class PDF Report (existing) ─────────────────────────────────────────

function ClassReportSection() {
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    MONTHS[new Date().getMonth()],
  );
  const printRef = useRef<HTMLDivElement>(null);
  const [allStudentsRaw, setAllStudentsRaw] = useState<Student[]>([]);
  const [localAttendance, setLocalAttendance] = useState<AttendanceRecord[]>(
    [],
  );
  const [localFees, setLocalFees] = useState<FeeRecord[]>([]);
  const [localSabak, setLocalSabak] = useState<SabakRecord[]>([]);

  useEffect(() => {
    getStudents()
      .then(setAllStudentsRaw)
      .catch(() => setAllStudentsRaw([]));
    getAttendance()
      .then(setLocalAttendance)
      .catch(() => setLocalAttendance([]));
    getFees()
      .then(setLocalFees)
      .catch(() => setLocalFees([]));
    getSabak()
      .then(setLocalSabak)
      .catch(() => setLocalSabak([]));
  }, []);

  const localStudents = allStudentsRaw.filter(
    (s) => s.className === selectedClass,
  );

  const handlePrint = () => {
    if (!selectedClass) return;
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Class Report - ${selectedClass}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ccc; padding: 8px 10px; font-size: 13px; text-align: left; }
        th { background: #1a5c38; color: #fff; }
        h1 { color: #1a5c38; font-size: 20px; margin: 0; }
        h2 { color: #1a5c38; font-size: 15px; margin: 4px 0 0; }
        .header { border-bottom: 2px solid #1a5c38; padding-bottom: 10px; margin-bottom: 16px; }
        .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #555; margin: 16px 0 8px; letter-spacing: 0.05em; }
      </style>
      </head><body>${printContents}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger
            data-ocid="admin.reports.class.select"
            className="w-52"
          >
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {CLASS_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger
            data-ocid="admin.reports.class_month.select"
            className="w-40"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={m}>
                {m} 2026
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedClass && (
          <Button
            data-ocid="admin.reports.class_pdf_button"
            onClick={handlePrint}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        )}
      </div>

      {!selectedClass ? (
        <div
          className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border"
          data-ocid="admin.reports.class.empty_state"
        >
          Select a class to preview the report
        </div>
      ) : (
        <div
          ref={printRef}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <div className="header">
            <h1>Maktab Zaid Bin Sabit</h1>
            <h2>Class Monthly Report — {selectedClass}</h2>
            <p style={{ fontSize: 13, margin: "4px 0 0", color: "#555" }}>
              Month: {selectedMonth} 2026 &nbsp;|&nbsp; Academic Year: 2026-27
              &nbsp;|&nbsp; Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="section-title">Student Attendance &amp; Fees</div>
          {localStudents.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No students in this class
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Father Name</th>
                  <th>Present Days</th>
                  <th>Absent Days</th>
                  <th>Fees Status</th>
                  <th>Sabak</th>
                </tr>
              </thead>
              <tbody>
                {localStudents.map((s, i) => {
                  const attRecords = localAttendance.filter(
                    (a) =>
                      a.studentId === s.id &&
                      a.date.includes(selectedMonth.slice(0, 3)),
                  );
                  const present = attRecords.filter(
                    (a) => a.status === "present",
                  ).length;
                  const absent = attRecords.filter(
                    (a) => a.status === "absent",
                  ).length;
                  const fee = localFees.find((f) => f.studentId === s.id);
                  const sabak = localSabak.find((sb) => sb.studentId === s.id);
                  return (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td>{s.name}</td>
                      <td>{s.fatherName}</td>
                      <td>{present}</td>
                      <td>{absent}</td>
                      <td>{fee?.status ?? s.feesStatus ?? "—"}</td>
                      <td>{sabak?.lessonName ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Per-Ustaad PDF Report (existing) ────────────────────────────────────────

function UstaadReportSection() {
  const [localTeachers, setLocalTeachers] = useState<Teacher[]>([]);
  const [selectedUstaad, setSelectedUstaad] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    MONTHS[new Date().getMonth()],
  );
  const printRef = useRef<HTMLDivElement>(null);
  const [allStudentsRaw2, setAllStudentsRaw2] = useState<Student[]>([]);
  const [localAttendance, setLocalAttendance] = useState<AttendanceRecord[]>(
    [],
  );
  const [localFees, setLocalFees] = useState<FeeRecord[]>([]);
  const [localSabak, setLocalSabak] = useState<SabakRecord[]>([]);

  useEffect(() => {
    getTeachers()
      .then(setLocalTeachers)
      .catch(() => setLocalTeachers([]));
    getStudents()
      .then(setAllStudentsRaw2)
      .catch(() => setAllStudentsRaw2([]));
    getAttendance()
      .then(setLocalAttendance)
      .catch(() => setLocalAttendance([]));
    getFees()
      .then(setLocalFees)
      .catch(() => setLocalFees([]));
    getSabak()
      .then(setLocalSabak)
      .catch(() => setLocalSabak([]));
  }, []);

  const localStudents = allStudentsRaw2.filter(
    (s) => s.teacherName === selectedUstaad,
  );

  const handlePrint = () => {
    if (!selectedUstaad) return;
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Ustaad Report - ${selectedUstaad}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #ccc; padding: 8px 10px; font-size: 13px; text-align: left; }
        th { background: #1a5c38; color: #fff; }
        h1 { color: #1a5c38; font-size: 20px; margin: 0; }
        h2 { color: #1a5c38; font-size: 15px; margin: 4px 0 0; }
        .header { border-bottom: 2px solid #1a5c38; padding-bottom: 10px; margin-bottom: 16px; }
        .section-title { font-size: 13px; font-weight: bold; text-transform: uppercase; color: #555; margin: 16px 0 8px; letter-spacing: 0.05em; }
      </style>
      </head><body>${printContents}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Select value={selectedUstaad} onValueChange={setSelectedUstaad}>
          <SelectTrigger
            data-ocid="admin.reports.ustaad.select"
            className="w-52"
          >
            <SelectValue placeholder="Select Ustaad" />
          </SelectTrigger>
          <SelectContent>
            {localTeachers.map((t) => (
              <SelectItem key={t.id} value={t.name}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger
            data-ocid="admin.reports.ustaad_month.select"
            className="w-40"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m} value={m}>
                {m} 2026
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedUstaad && (
          <Button
            data-ocid="admin.reports.ustaad_pdf_button"
            onClick={handlePrint}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <Download className="w-4 h-4" /> Download PDF
          </Button>
        )}
      </div>

      {!selectedUstaad ? (
        <div
          className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border"
          data-ocid="admin.reports.ustaad.empty_state"
        >
          Select an Ustaad to preview the report
        </div>
      ) : (
        <div
          ref={printRef}
          className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
          <div className="header">
            <h1>Maktab Zaid Bin Sabit</h1>
            <h2>Ustaad Monthly Report — {selectedUstaad}</h2>
            <p style={{ fontSize: 13, margin: "4px 0 0", color: "#555" }}>
              Month: {selectedMonth} 2026 &nbsp;|&nbsp; Academic Year: 2026-27
              &nbsp;|&nbsp; Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="section-title">Students Under {selectedUstaad}</div>
          {localStudents.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No students assigned to this teacher
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Present Days</th>
                  <th>Absent Days</th>
                  <th>Fees Status</th>
                  <th>Sabak / Lesson</th>
                </tr>
              </thead>
              <tbody>
                {localStudents.map((s, i) => {
                  const attRecords = localAttendance.filter(
                    (a) =>
                      a.studentId === s.id &&
                      a.date.includes(selectedMonth.slice(0, 3)),
                  );
                  const present = attRecords.filter(
                    (a) => a.status === "present",
                  ).length;
                  const absent = attRecords.filter(
                    (a) => a.status === "absent",
                  ).length;
                  const fee = localFees.find((f) => f.studentId === s.id);
                  const sabak = localSabak.find((sb) => sb.studentId === s.id);
                  return (
                    <tr key={s.id}>
                      <td>{i + 1}</td>
                      <td>{s.name}</td>
                      <td>{s.className}</td>
                      <td>{present}</td>
                      <td>{absent}</td>
                      <td>{fee?.status ?? s.feesStatus ?? "—"}</td>
                      <td>{sabak?.lessonName ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Student Report Section (existing) ───────────────────────────────────────

function StudentReportSection() {
  const { data: students = [], isLoading: studentsLoading } = useAllStudents();
  const { data: teachers = [] } = useAllTeachers();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const student = students.find((s) => s.id === selectedStudentId);
  const teacher = teachers.find((t) => t.name === student?.teacherName);

  const { data: attendance = [], isLoading: attLoading } =
    useStudentAttendance(selectedStudentId);
  const { data: academic, isLoading: acadLoading } =
    useAcademicRecord(selectedStudentId);
  const { data: fees = [], isLoading: feesLoading } =
    useStudentFees(selectedStudentId);

  const presentCount = attendance.filter(
    (a) => a.status === AttendanceStatus.present,
  ).length;
  const absentCount = attendance.filter(
    (a) => a.status === AttendanceStatus.absent,
  ).length;
  const totalFeesPaid = fees
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + Number(f.amount), 0);
  const totalFeesPending = fees
    .filter((f) => f.status === "pending")
    .reduce((sum, f) => sum + Number(f.amount), 0);
  const isLoading = attLoading || acadLoading || feesLoading;

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger
            data-ocid="admin.reports.student.select"
            className="max-w-sm"
          >
            <SelectValue
              placeholder={studentsLoading ? "Loading..." : "Select a student"}
            />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} — {s.className}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedStudentId && (
          <Button
            data-ocid="admin.reports.print_button"
            onClick={handlePrint}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <Printer className="w-4 h-4" /> Print Report
          </Button>
        )}
      </div>

      {!selectedStudentId ? (
        <div
          className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border"
          data-ocid="admin.reports.empty_state"
        >
          Select a student to generate report
        </div>
      ) : isLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="admin.reports.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div
          ref={printRef}
          className="bg-card border border-border rounded-xl shadow-card p-6 print-area space-y-6"
        >
          <div className="text-center border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">
              Maktab Zaid Bin Sabit
            </h2>
            <p className="text-sm text-muted-foreground">
              Student Progress Report — Academic Year 2026-27
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider text-muted-foreground">
              Student Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Name", student?.name],
                ["Father Name", student?.fatherName],
                ["Mobile", student?.parentMobile],
                ["Class", student?.studentClass ?? student?.className],
                ["Teacher", teacher?.name ?? student?.teacherName ?? "—"],
                ["Timing", student?.timeSlot],
                ["Monthly Fees", `Rs. ${Number(student?.fees ?? 0)}`],
                ["Fee Status", student?.feesStatus],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-muted-foreground text-sm w-28 shrink-0">
                    {label}:
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {value ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider text-muted-foreground">
              Attendance Summary
            </h3>
            <div className="flex gap-4">
              <div className="bg-success/10 rounded-lg px-4 py-3 text-center">
                <p className="text-2xl font-bold text-success-foreground">
                  {presentCount}
                </p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div className="bg-destructive/10 rounded-lg px-4 py-3 text-center">
                <p className="text-2xl font-bold text-destructive">
                  {absentCount}
                </p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
              <div className="bg-muted rounded-lg px-4 py-3 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {attendance.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Marked</p>
              </div>
            </div>
          </div>

          {academic && (
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider text-muted-foreground">
                Academic Record
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-sm">
                    Current Sabak:{" "}
                  </span>
                  <span className="text-sm font-medium">
                    {academic.currentLesson ?? academic.lessonName ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    Previous Sabak:{" "}
                  </span>
                  <span className="text-sm font-medium">
                    {academic.previousLesson ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    Progress:{" "}
                  </span>
                  <span className="text-sm font-medium">
                    {academic.progressPercent != null
                      ? `${academic.progressPercent}%`
                      : academic.progress != null
                        ? `${academic.progress}%`
                        : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Akhlaq:{" "}
                  </span>
                  <StarRow value={0} />
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider text-muted-foreground">
              Fees Summary
            </h3>
            <div className="flex gap-4 mb-3">
              <div className="bg-success/10 rounded-lg px-4 py-3 text-center">
                <p className="text-lg font-bold text-success-foreground">
                  Rs. {totalFeesPaid.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Paid</p>
              </div>
              <div className="bg-destructive/10 rounded-lg px-4 py-3 text-center">
                <p className="text-lg font-bold text-destructive">
                  Rs. {totalFeesPending.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
            {fees.length > 0 && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      Month
                    </th>
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      Amount
                    </th>
                    <th className="text-left py-2 text-muted-foreground font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {fees.map((f) => (
                    <tr key={f.id} className="border-b border-border/50">
                      <td className="py-1.5">{f.month}</td>
                      <td className="py-1.5">
                        Rs. {Number(f.amount).toLocaleString()}
                      </td>
                      <td className="py-1.5">
                        <Badge
                          variant="outline"
                          className={`text-xs ${f.status === "paid" ? "bg-success/10 text-success-foreground border-success/30" : "bg-destructive/10 text-destructive border-destructive/30"}`}
                        >
                          {f.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Reports Page ────────────────────────────────────────────────────────

type ReportTab = "bulk" | "student" | "class" | "ustaad";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("bulk");

  const tabs: { value: ReportTab; label: string }[] = [
    { value: "bulk", label: "PDF Reports" },
    { value: "student", label: "Student Report" },
    { value: "class", label: "Per Class PDF" },
    { value: "ustaad", label: "Per Ustaad PDF" },
  ];

  return (
    <div data-ocid="admin.reports.page" className="space-y-5">
      <div className="no-print">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm">
          Generate and download PDF reports for students, fees, attendance &amp;
          sabak
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 max-w-lg no-print overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            data-ocid={`admin.reports.tab.${tab.value}`}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap",
              activeTab === tab.value
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bulk PDF Reports — 2x2 grid */}
      {activeTab === "bulk" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-1 border-b border-border/60">
            <Download className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Download PDF Reports
            </h2>
            <span className="text-xs text-muted-foreground ml-1">
              — Select filters and download any report as a printable PDF
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StudentListReportCard />
            <FeesReportCard />
            <AttendanceReportCard />
            <SabakProgressReportCard />
          </div>
        </div>
      )}

      {activeTab === "student" && <StudentReportSection />}
      {activeTab === "class" && <ClassReportSection />}
      {activeTab === "ustaad" && <UstaadReportSection />}
    </div>
  );
}
