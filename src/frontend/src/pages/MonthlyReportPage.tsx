import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getAttendance,
  getFees,
  getSabak,
  getStudents,
  getTeachers,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { useMemo, useState } from "react";

interface MonthlyReportPageProps {
  setActivePage: (page: AppPage) => void;
}

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

type SessionFilter = "all" | "morning" | "afternoon" | "evening";

const SESSION_LABELS: Record<string, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  evening: "Evening",
};

function getSessionLabel(slot?: string): string {
  if (!slot) return "—";
  return SESSION_LABELS[slot] ?? slot;
}

export default function MonthlyReportPage({
  setActivePage,
}: MonthlyReportPageProps) {
  const teachers = getTeachers();
  const allStudents = getStudents();
  const allAttendance = getAttendance();
  const allFees = getFees();
  const allSabak = getSabak();

  const currentMonth = new Date().toISOString().slice(5, 7);
  const currentYear = String(new Date().getFullYear());

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(currentYear);
  const [selectedSession, setSelectedSession] = useState<SessionFilter>("all");
  const [selectedUstaad, setSelectedUstaad] = useState("");

  const monthLabel = MONTHS.find((m) => m.value === month)?.label ?? month;

  // Build filtered student list based on session + ustaad
  const reportStudents = useMemo(() => {
    let students = allStudents;
    if (selectedSession !== "all") {
      students = students.filter((s) => s.timeSlot === selectedSession);
    }
    if (selectedUstaad) {
      students = students.filter((s) => s.teacherName === selectedUstaad);
    }
    return students;
  }, [selectedSession, selectedUstaad, allStudents]);

  // 1. Student list data
  const studentListData = useMemo(
    () =>
      reportStudents.map((s) => ({
        rollNumber: s.rollNumber ?? "—",
        name: s.name,
        fatherName: s.fatherName,
        session: getSessionLabel(s.timeSlot),
        ustaad: s.teacherName,
        mobile: s.parentMobile,
        address: s.address ?? "—",
        admissionDate: s.admissionDate ?? "—",
      })),
    [reportStudents],
  );

  // 2. Fees data
  const feesData = useMemo(
    () =>
      reportStudents.map((s) => {
        const fee = allFees.find(
          (f) =>
            f.studentId === s.id &&
            f.month.toLowerCase().includes(monthLabel.toLowerCase()),
        );
        return {
          rollNumber: s.rollNumber ?? "—",
          name: s.name,
          session: getSessionLabel(s.timeSlot),
          ustaad: s.teacherName,
          amount: fee?.amount ?? s.fees,
          status: fee?.status ?? s.feesStatus,
          month: monthLabel,
        };
      }),
    [reportStudents, allFees, monthLabel],
  );

  // 3. Attendance data
  const attendanceData = useMemo(
    () =>
      reportStudents.flatMap((s) => {
        const recs = allAttendance.filter(
          (a) => a.studentId === s.id && a.date.startsWith(`${year}-${month}`),
        );
        if (recs.length === 0) {
          return [
            {
              rollNumber: s.rollNumber ?? "—",
              name: s.name,
              session: getSessionLabel(s.timeSlot),
              date: `${year}-${month}`,
              status: "—",
            },
          ];
        }
        return recs.map((a) => ({
          rollNumber: s.rollNumber ?? "—",
          name: s.name,
          session: getSessionLabel(s.timeSlot),
          date: a.date,
          status: a.status === "present" ? "Present" : "Absent",
        }));
      }),
    [reportStudents, allAttendance, year, month],
  );

  // 4. Sabak progress data — all 4 sections per student
  const sabakProgressData = useMemo(
    () =>
      reportStudents.map((s) => {
        const studentRecs = allSabak.filter((r) => r.studentId === s.id);
        const quranRec = studentRecs.find((r) => r.section === "quran");
        const urduRec = studentRecs.find((r) => r.section === "urdu");
        const duaRec = studentRecs.find((r) => r.section === "dua");
        const hadeesRec = studentRecs.find((r) => r.section === "hadees");

        const quranProgress =
          quranRec?.surahName && quranRec.ayatNumber != null
            ? `${quranRec.surahName} — Ayat ${quranRec.ayatNumber}`
            : (quranRec?.currentLesson ?? "—");

        return {
          rollNumber: s.rollNumber ?? "—",
          name: s.name,
          session: getSessionLabel(s.timeSlot),
          ustaad: s.teacherName,
          quranProgress,
          urduLessons:
            urduRec?.countCompleted != null
              ? `${urduRec.countCompleted} lessons`
              : "—",
          duaCount:
            duaRec?.countCompleted != null
              ? `${duaRec.countCompleted} memorized`
              : "—",
          hadeesCount:
            hadeesRec?.countCompleted != null
              ? `${hadeesRec.countCompleted} memorized`
              : "—",
        };
      }),
    [reportStudents, allSabak],
  );

  function handlePrint() {
    window.print();
  }

  const sessionFilterLabel =
    selectedSession === "all"
      ? "All Sessions"
      : SESSION_LABELS[selectedSession];

  return (
    <div className="space-y-5 page-enter" data-ocid="monthly_report.page">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActivePage("dashboard")}
        className="gap-1.5 text-muted-foreground hover:text-foreground print:hidden"
        data-ocid="monthly_report.back_button"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex items-center gap-3 print:hidden">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Monthly Reports</h1>
          <p className="text-sm text-muted-foreground">
            Download PDF reports for Student List, Fees, Attendance, and Sabak
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="card-elevated border-border/60 print:hidden">
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Month */}
            <div className="space-y-1.5">
              <label
                htmlFor="report-month"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Month
              </label>
              <select
                id="report-month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="monthly_report.month_select"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="space-y-1.5">
              <label
                htmlFor="report-year"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Year
              </label>
              <select
                id="report-year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="monthly_report.year_select"
              >
                {["2025", "2026", "2027"].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Session */}
            <div className="space-y-1.5">
              <label
                htmlFor="report-session"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Session
              </label>
              <select
                id="report-session"
                value={selectedSession}
                onChange={(e) =>
                  setSelectedSession(e.target.value as SessionFilter)
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="monthly_report.session_select"
              >
                <option value="all">All Sessions</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            {/* Ustaad */}
            <div className="space-y-1.5">
              <label
                htmlFor="report-ustaad"
                className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
              >
                Ustaad
              </label>
              <select
                id="report-ustaad"
                value={selectedUstaad}
                onChange={(e) => setSelectedUstaad(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="monthly_report.ustaad_select"
              >
                <option value="">All Ustaads</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handlePrint}
              className="bg-primary hover:bg-primary/90 gap-2"
              data-ocid="monthly_report.download_button"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Printable Report */}
      <div id="printable-report" className="space-y-6">
        {/* Report Header */}
        <div className="text-center py-4 border-b-2 border-primary print:block">
          <h1 className="text-2xl font-bold text-foreground">
            Maktab Zaid Bin Sabit
          </h1>
          <p className="text-muted-foreground mt-1">
            Monthly Report — {monthLabel} {year}
          </p>
          <p className="text-sm text-muted-foreground">Academic Year 2026–27</p>
          <p className="text-sm font-semibold text-primary mt-1">
            Session: {sessionFilterLabel}
            {selectedUstaad && ` · Ustaad: ${selectedUstaad}`}
          </p>
        </div>

        {/* Section 1: Student List */}
        <Card className="card-elevated border-border/60">
          <CardContent className="p-0">
            <div className="px-5 py-3 border-b border-border bg-muted/30">
              <h2 className="text-sm font-bold text-foreground">
                1. Student List
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Roll No
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Father Name
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Session
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Ustaad
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Mobile
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Address
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Admission
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {studentListData.map((row, i) => (
                    <tr
                      key={`${row.name}-${i}`}
                      className="hover:bg-muted/20"
                      data-ocid={`monthly_report.students.item.${i + 1}`}
                    >
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {row.rollNumber}
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground text-xs">
                        {row.name}
                      </td>
                      <td className="px-3 py-2 text-foreground text-xs">
                        {row.fatherName}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                          {row.session}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-foreground text-xs">
                        {row.ustaad}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {row.mobile}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground text-xs truncate max-w-[120px]">
                        {row.address}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {row.admissionDate}
                      </td>
                    </tr>
                  ))}
                  {studentListData.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-6 text-center text-muted-foreground text-xs"
                      >
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Fees Report */}
        <Card className="card-elevated border-border/60">
          <CardContent className="p-0">
            <div className="px-5 py-3 border-b border-border bg-muted/30">
              <h2 className="text-sm font-bold text-foreground">
                2. Fees Report
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Roll No
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Session
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Ustaad
                    </th>
                    <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Month
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {feesData.map((row, i) => (
                    <tr
                      key={`${row.name}-${i}`}
                      className="hover:bg-muted/20"
                      data-ocid={`monthly_report.fees.item.${i + 1}`}
                    >
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {row.rollNumber}
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground text-xs">
                        {row.name}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                          {row.session}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-foreground text-xs">
                        {row.ustaad}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-foreground text-xs">
                        ₹{row.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            row.status === "paid"
                              ? "bg-success/10 text-success"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {row.status === "paid" ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {row.month}
                      </td>
                    </tr>
                  ))}
                  {feesData.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-6 text-center text-muted-foreground text-xs"
                      >
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Attendance Report */}
        <Card className="card-elevated border-border/60">
          <CardContent className="p-0">
            <div className="px-5 py-3 border-b border-border bg-muted/30">
              <h2 className="text-sm font-bold text-foreground">
                3. Attendance Report
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Roll No
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Session
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {attendanceData.map((row, i) => (
                    <tr
                      key={`${row.name}-${row.date}-${i}`}
                      className="hover:bg-muted/20"
                      data-ocid={`monthly_report.attendance.item.${i + 1}`}
                    >
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {row.rollNumber}
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground text-xs">
                        {row.name}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                          {row.session}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {row.date}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            row.status === "Present"
                              ? "bg-success/10 text-success"
                              : row.status === "Absent"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {attendanceData.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-muted-foreground text-xs"
                      >
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Sabak Progress Report */}
        <Card className="card-elevated border-border/60">
          <CardContent className="p-0">
            <div className="px-5 py-3 border-b border-border bg-muted/30">
              <h2 className="text-sm font-bold text-foreground">
                4. Sabak Progress Report
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Roll No
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Name
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Session
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      Ustaad
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      📖 Quran
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      📚 Urdu
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      🤲 Dua
                    </th>
                    <th className="text-left px-3 py-2.5 text-xs font-semibold text-muted-foreground">
                      📿 Hadees
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {sabakProgressData.map((row, i) => (
                    <tr
                      key={`${row.name}-${i}`}
                      className="hover:bg-muted/20"
                      data-ocid={`monthly_report.sabak.item.${i + 1}`}
                    >
                      <td className="px-3 py-2 text-muted-foreground text-xs">
                        {row.rollNumber}
                      </td>
                      <td className="px-3 py-2 font-medium text-foreground text-xs">
                        {row.name}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                          {row.session}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-foreground text-xs">
                        {row.ustaad}
                      </td>
                      <td className="px-3 py-2 text-xs text-foreground truncate max-w-[160px]">
                        {row.quranProgress}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {row.urduLessons}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {row.duaCount}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {row.hadeesCount}
                      </td>
                    </tr>
                  ))}
                  {sabakProgressData.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-6 text-center text-muted-foreground text-xs"
                      >
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
