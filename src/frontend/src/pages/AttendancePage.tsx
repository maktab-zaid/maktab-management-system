import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type AttendanceRecord,
  type Session,
  type Student,
  createId,
  getAttendance,
  getStudents,
  saveAttendance,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  History,
  MessageCircle,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface AttendancePageProps {
  session: Session;
  setActivePage?: (page: AppPage) => void;
}

type AttendanceStatus = "Present" | "Absent";

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildWhatsAppUrl(mobile: string, message: string): string {
  const digits = mobile.replace(/\D/g, "");
  const num = digits.startsWith("91") ? digits : `91${digits}`;
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

// ─── WhatsApp helper ────────────────────────────────────────────────────────

interface AbsentAlert {
  studentName: string;
  fatherName: string;
  parentMobile: string;
  message: string;
}

function buildAbsenceMessage(studentName: string): string {
  return `Assalamu Alaikum, your child ${studentName} was absent today in Maktab. Please ensure regular attendance. - Maktab Zaid Bin Sabit`;
}

// ─── Send All Reminders Modal ────────────────────────────────────────────────

interface SendAllModalProps {
  alerts: AbsentAlert[];
  onClose: () => void;
}

function SendAllModal({ alerts, onClose }: SendAllModalProps) {
  return (
    <dialog
      open
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent w-full h-full max-w-none max-h-none"
      aria-labelledby="send-all-modal-title"
      data-ocid="attendance.send_all.dialog"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="presentation"
      />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2
                id="send-all-modal-title"
                className="text-sm font-bold text-foreground"
              >
                Send Absence Reminders
              </h2>
              <p className="text-xs text-muted-foreground">
                {alerts.length} absent student
                {alerts.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            data-ocid="attendance.send_all.close_button"
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 divide-y divide-border/40">
          {alerts.map((alert, i) => (
            <div key={alert.studentName} className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-destructive">
                    {alert.studentName.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {alert.studentName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Father: {alert.fatherName}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">
                    📱 +91 {alert.parentMobile}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-destructive/30 text-destructive bg-destructive/8 text-xs flex-shrink-0"
                >
                  Absent
                </Badge>
              </div>
              <div className="bg-muted/30 border border-border/50 rounded-xl p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {alert.message}
                </p>
              </div>
              <a
                href={buildWhatsAppUrl(alert.parentMobile, alert.message)}
                target="_blank"
                rel="noopener noreferrer"
                data-ocid={`attendance.send_all.send_button.${i + 1}`}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                style={{ background: "#25D366" }}
              >
                <MessageCircle className="w-4 h-4" />
                Send to {alert.fatherName}
              </a>
            </div>
          ))}
        </div>

        <div className="px-5 py-4 border-t border-border bg-muted/20">
          <Button
            type="button"
            onClick={onClose}
            data-ocid="attendance.send_all.done_button"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Done
          </Button>
        </div>
      </div>
    </dialog>
  );
}

// ─── Parent Read-Only View ────────────────────────────────────────────────────

function ParentAttendanceView({ session }: { session: Session }) {
  const [myStudents, setMyStudents] = useState<Student[]>([]);
  const [allAttendance, setAllAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    getStudents()
      .then((students) =>
        setMyStudents(
          students.filter((s) => s.parentMobile === session.mobile),
        ),
      )
      .catch(() => setMyStudents([]));
    getAttendance()
      .then(setAllAttendance)
      .catch(() => setAllAttendance([]));
  }, [session.mobile]);

  if (myStudents.length === 0) {
    return (
      <Card
        className="card-elevated border-border/60"
        data-ocid="attendance.parent.empty_state"
      >
        <CardContent className="py-16 text-center">
          <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-semibold text-muted-foreground">
            No student found for this mobile number
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Contact the Maktab admin to link your child's record
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5" data-ocid="attendance.parent.page">
      {myStudents.map((student) => {
        const records = allAttendance
          .filter((r) => r.studentId === student.id)
          .sort((a, b) => b.date.localeCompare(a.date))
          .slice(0, 15);

        const presentCount = records.filter(
          (r) => r.status === "present",
        ).length;
        const absentCount = records.filter((r) => r.status === "absent").length;
        const pct =
          records.length > 0
            ? Math.round((presentCount / records.length) * 100)
            : 0;

        return (
          <Card
            key={student.id}
            className="card-elevated border-border/60 overflow-hidden"
            data-ocid={`attendance.parent.student.${student.id}`}
          >
            <CardHeader className="px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {student.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {student.timeSlot
                        ? student.timeSlot.charAt(0).toUpperCase() +
                          student.timeSlot.slice(1)
                        : student.className}{" "}
                      · {student.teacherName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">{pct}%</p>
                  <p className="text-xs text-muted-foreground">
                    {presentCount}P / {absentCount}A
                  </p>
                </div>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {records.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-8 text-center text-sm text-muted-foreground"
                      >
                        No attendance records yet
                      </td>
                    </tr>
                  ) : (
                    records.map((rec, i) => (
                      <tr
                        key={rec.id}
                        className="hover:bg-muted/20 transition-colors duration-150"
                        data-ocid={`attendance.parent.record.${i + 1}`}
                      >
                        <td className="px-4 py-2.5 font-medium text-foreground">
                          {formatShortDate(rec.date)}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <Badge
                            variant="outline"
                            className={
                              rec.status === "present"
                                ? "border-success/30 text-success bg-success/8"
                                : "border-destructive/30 text-destructive bg-destructive/8"
                            }
                          >
                            {rec.status === "present" ? (
                              <Check className="w-3 h-3 mr-1" />
                            ) : (
                              <X className="w-3 h-3 mr-1" />
                            )}
                            {rec.status === "present" ? "Present" : "Absent"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AttendancePage({
  session,
  setActivePage,
}: AttendancePageProps) {
  // Parent: read-only view
  if (session.role === "parent") {
    return (
      <div className="space-y-4">
        {setActivePage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActivePage("dashboard")}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            data-ocid="attendance.back_button"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
        )}
        <ParentAttendanceView session={session} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {setActivePage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActivePage("dashboard")}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          data-ocid="attendance.back_button"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      )}
      <AttendanceEditView session={session} />
    </div>
  );
}

function AttendanceEditView({ session }: { session: Session }) {
  const today = formatDate(new Date());

  const SESSION_LIST_ATT = ["Morning", "Afternoon", "Evening"] as const;
  const allClasses = SESSION_LIST_ATT as unknown as readonly string[];

  const isTeacher = session.role === "teacher";
  const teacherSessionSlot = session.teacherTimeSlot
    ? session.teacherTimeSlot.charAt(0).toUpperCase() +
      session.teacherTimeSlot.slice(1)
    : null;
  const fixedClass = isTeacher ? (teacherSessionSlot ?? "") : null;

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedClass, setSelectedClass] = useState<string>(
    fixedClass ?? "Morning",
  );
  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [submitted, setSubmitted] = useState(false);
  const [savedDate, setSavedDate] = useState<string | null>(null);
  const [showSendAllModal, setShowSendAllModal] = useState(false);

  // Load students and attendance from Supabase on mount
  useEffect(() => {
    const todayStr = formatDate(new Date());
    getStudents().then((students) => {
      setAllStudents(students);
      getAttendance().then((existing) => {
        setAllAttendanceRecords(existing);
        const init: Record<string, AttendanceStatus> = {};
        for (const s of students) {
          const rec = existing.find(
            (r) => r.studentId === s.id && r.date === todayStr,
          );
          init[s.id] = rec
            ? rec.status === "present"
              ? "Present"
              : "Absent"
            : "Present";
        }
        setAttendance(init);
      });
    });
  }, []);

  // Re-filter students based on selected class
  const filtered = useMemo(
    () =>
      selectedClass
        ? allStudents.filter(
            (s) =>
              (s.timeSlot ?? "").toLowerCase() === selectedClass.toLowerCase(),
          )
        : allStudents,
    [allStudents, selectedClass],
  );

  // Pre-fill attendance when session/date changes (uses in-memory state)
  const syncAttendanceFromRecords = (
    students: Student[],
    date: string,
    records: AttendanceRecord[],
  ) => {
    setAttendance((prev) => {
      const updated = { ...prev };
      for (const s of students) {
        const rec = records.find(
          (r) => r.studentId === s.id && r.date === date,
        );
        if (rec) {
          updated[s.id] = rec.status === "present" ? "Present" : "Absent";
        } else if (!(s.id in updated)) {
          updated[s.id] = "Present";
        }
      }
      return updated;
    });
  };

  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    const students = allStudents.filter(
      (s) => (s.timeSlot ?? "").toLowerCase() === cls.toLowerCase(),
    );
    syncAttendanceFromRecords(students, selectedDate, allAttendanceRecords);
    setSubmitted(false);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    syncAttendanceFromRecords(filtered, date, allAttendanceRecords);
    setSubmitted(false);
  };

  const setStatus = (id: string, status: AttendanceStatus) => {
    setAttendance((prev) => ({ ...prev, [id]: status }));
    if (submitted) setSubmitted(false);
  };

  const markAll = (status: AttendanceStatus) => {
    setAttendance((prev) => {
      const updated = { ...prev };
      for (const s of filtered) updated[s.id] = status;
      return updated;
    });
  };

  const handleSubmit = async () => {
    const studentIds = new Set(filtered.map((s) => s.id));
    const existing = allAttendanceRecords.filter(
      (r) => !studentIds.has(r.studentId) || r.date !== selectedDate,
    );

    const newRecords: AttendanceRecord[] = filtered.map((s) => ({
      id: createId(),
      studentId: s.id,
      studentName: s.name,
      date: selectedDate,
      status: attendance[s.id] === "Present" ? "present" : "absent",
      markedBy: session.name,
    }));

    const merged = [...existing, ...newRecords];
    await saveAttendance(merged);
    setAllAttendanceRecords(merged);
    setSubmitted(true);
    setSavedDate(selectedDate);

    const presentCount = filtered.filter(
      (s) => attendance[s.id] === "Present",
    ).length;
    const absentStudents = filtered.filter(
      (s) => attendance[s.id] === "Absent",
    );

    toast.success("Attendance saved successfully!", {
      description:
        absentStudents.length > 0
          ? `${presentCount} present · ${absentStudents.length} absent — click 🔔 to send reminders`
          : `${presentCount} present · 0 absent — ${formatShortDate(selectedDate)}`,
    });
  };

  const presentCount = filtered.filter(
    (s) => attendance[s.id] === "Present",
  ).length;
  const absentCount = filtered.filter(
    (s) => attendance[s.id] === "Absent",
  ).length;
  const attendancePct =
    filtered.length > 0
      ? Math.round((presentCount / filtered.length) * 100)
      : 0;

  // Bell icon: show on absent students when attendance for current date was saved
  const showBells = submitted && savedDate === selectedDate;

  // Build absent alerts for "Send All Reminders"
  const absentStudentsForBell = filtered.filter(
    (s) => attendance[s.id] === "Absent",
  );
  const sendAllAlerts: AbsentAlert[] = absentStudentsForBell.map((s) => ({
    studentName: s.name,
    fatherName: s.fatherName,
    parentMobile: s.parentMobile,
    message: buildAbsenceMessage(s.name),
  }));

  // History: computed from in-memory allAttendanceRecords
  type DayStats = {
    date: string;
    present: number;
    absent: number;
    total: number;
  };
  const historyRows = useMemo<DayStats[]>(() => {
    const classStudentIds = new Set(filtered.map((s) => s.id));
    const map: Record<string, DayStats> = {};
    for (const rec of allAttendanceRecords) {
      if (!classStudentIds.has(rec.studentId)) continue;
      if (!map[rec.date]) {
        map[rec.date] = { date: rec.date, present: 0, absent: 0, total: 0 };
      }
      map[rec.date].total += 1;
      if (rec.status === "present") map[rec.date].present += 1;
      else map[rec.date].absent += 1;
    }
    return Object.values(map)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);
  }, [filtered, allAttendanceRecords]);

  return (
    <>
      <div className="space-y-5 page-enter" data-ocid="attendance.page">
        {/* ── Controls Row ─────────────────────────────────────────────── */}
        <Card className="card-elevated border-border/60">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              {/* Session selector — admin only; teacher sees fixed label */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="class-select-trigger"
                    className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider"
                  >
                    Session
                  </label>
                  {isTeacher ? (
                    <div className="h-10 px-3 flex items-center rounded-md border border-input bg-muted/30 text-sm font-medium text-foreground">
                      <span className="text-muted-foreground mr-1.5">
                        Your Session:
                      </span>
                      {fixedClass || "—"}
                    </div>
                  ) : (
                    <Select
                      value={selectedClass}
                      onValueChange={handleClassChange}
                    >
                      <SelectTrigger
                        id="class-select-trigger"
                        className="bg-background border-input h-10"
                        data-ocid="attendance.class.select"
                      >
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        {allClasses.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Date picker */}
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor="attendance-date"
                    className="text-xs font-semibold text-muted-foreground mb-1.5 block uppercase tracking-wider"
                  >
                    Date
                  </label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      id="attendance-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => handleDateChange(e.target.value)}
                      data-ocid="attendance.date.input"
                      className="w-full h-10 pl-9 pr-3 rounded-md border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Mark All buttons */}
              <div className="flex gap-2 flex-shrink-0 sm:pb-0">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => markAll("Present")}
                  data-ocid="attendance.mark_all_present_button"
                  variant="ghost"
                  className="h-10 bg-success/10 text-success hover:bg-success/20 border border-success/25 font-semibold transition-all duration-200 gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">All Present</span>
                  <span className="sm:hidden">Present</span>
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => markAll("Absent")}
                  data-ocid="attendance.mark_all_absent_button"
                  variant="ghost"
                  className="h-10 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/25 font-semibold transition-all duration-200 gap-1.5"
                >
                  <XCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">All Absent</span>
                  <span className="sm:hidden">Absent</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Summary Stats Bar ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3" data-ocid="attendance.summary">
          <Card className="card-elevated border-l-4 border-l-success border-border/60">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Present
                  </p>
                  <p className="text-3xl font-bold text-success leading-none">
                    {presentCount}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
              </div>
              <div
                className="mt-2 progress-bar-track"
                style={{ height: "3px" }}
              >
                <div
                  className="h-full rounded-full bg-success transition-all duration-500 ease-out"
                  style={{ width: `${attendancePct}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated border-l-4 border-l-destructive border-border/60">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Absent
                  </p>
                  <p className="text-3xl font-bold text-destructive leading-none">
                    {absentCount}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
              </div>
              <div
                className="mt-2 progress-bar-track"
                style={{ height: "3px" }}
              >
                <div
                  className="h-full rounded-full bg-destructive transition-all duration-500 ease-out"
                  style={{
                    width:
                      filtered.length > 0
                        ? `${Math.round((absentCount / filtered.length) * 100)}%`
                        : "0%",
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated border-l-4 border-l-primary border-border/60">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                    Rate
                  </p>
                  <p className="text-3xl font-bold text-primary leading-none">
                    {attendancePct}%
                  </p>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div
                className="mt-2 progress-bar-track"
                style={{ height: "3px" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${attendancePct}%`,
                    background:
                      "linear-gradient(90deg, oklch(0.32 0.09 155), oklch(0.75 0.18 75))",
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Student Attendance List ──────────────────────────────────── */}
        <Card
          className="card-elevated border-border/60 overflow-hidden"
          data-ocid="attendance.list"
        >
          <CardHeader className="px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                {formatDisplayDate(selectedDate)}
              </CardTitle>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-medium">
                  <Users className="w-3 h-3 mr-1" />
                  {filtered.length} students
                </Badge>
                {showBells && absentStudentsForBell.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSendAllModal(true)}
                    data-ocid="attendance.send_all_button"
                    className="h-7 text-xs gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-50 hover:border-amber-500 font-semibold"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Send All Reminders ({absentStudentsForBell.length} absent)
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <div className="divide-y divide-border/40">
            {filtered.length === 0 ? (
              <div
                className="py-12 text-center text-muted-foreground"
                data-ocid="attendance.empty_state"
              >
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">
                  No students in this session
                </p>
                <p className="text-xs mt-1 opacity-70">
                  Select a different session to see students
                </p>
              </div>
            ) : (
              filtered.map((student, i) => {
                const status = attendance[student.id] ?? "Present";
                const isPresent = status === "Present";
                const isAbsent = status === "Absent";

                return (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/20 transition-colors duration-150"
                    data-ocid={`attendance.item.${i + 1}`}
                  >
                    {/* Row number */}
                    <span className="text-xs text-muted-foreground/50 w-5 flex-shrink-0 text-right hidden sm:block">
                      {i + 1}
                    </span>

                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/15">
                      <span className="text-sm font-bold text-primary">
                        {student.name.charAt(0)}
                      </span>
                    </div>

                    {/* Name + session */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student.timeSlot
                          ? student.timeSlot.charAt(0).toUpperCase() +
                            student.timeSlot.slice(1)
                          : student.className}{" "}
                        · Father: {student.fatherName}
                      </p>
                    </div>

                    {/* Session badge — desktop only */}
                    <Badge
                      variant="outline"
                      className="text-xs hidden md:inline-flex border-primary/20 text-primary/80 bg-primary/5 flex-shrink-0"
                    >
                      {student.timeSlot
                        ? student.timeSlot.charAt(0).toUpperCase() +
                          student.timeSlot.slice(1)
                        : student.className}
                    </Badge>

                    {/* Toggle buttons + Bell icon */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div
                        className="flex gap-1.5"
                        data-ocid={`attendance.toggle.${i + 1}`}
                      >
                        <button
                          type="button"
                          aria-label="Mark Present"
                          aria-pressed={isPresent}
                          onClick={() => setStatus(student.id, "Present")}
                          className={[
                            "flex items-center gap-1.5 rounded-full text-xs font-semibold px-3 py-1.5",
                            "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success",
                            isPresent
                              ? "bg-success text-white shadow-md scale-105 ring-2 ring-success/30"
                              : "bg-success/8 text-success/60 border border-success/20 hover:bg-success/15 hover:text-success hover:scale-102",
                          ].join(" ")}
                        >
                          <Check className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="hidden sm:inline">Present</span>
                        </button>

                        <button
                          type="button"
                          aria-label="Mark Absent"
                          aria-pressed={isAbsent}
                          onClick={() => setStatus(student.id, "Absent")}
                          className={[
                            "flex items-center gap-1.5 rounded-full text-xs font-semibold px-3 py-1.5",
                            "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive",
                            isAbsent
                              ? "bg-destructive text-white shadow-md scale-105 ring-2 ring-destructive/30"
                              : "bg-destructive/8 text-destructive/60 border border-destructive/20 hover:bg-destructive/15 hover:text-destructive hover:scale-102",
                          ].join(" ")}
                        >
                          <X className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="hidden sm:inline">Absent</span>
                        </button>
                      </div>

                      {/* Bell icon — shown for absent students after attendance is saved */}
                      {showBells && isAbsent && (
                        <a
                          href={buildWhatsAppUrl(
                            student.parentMobile,
                            buildAbsenceMessage(student.name),
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Send absence reminder to parent"
                          title="Send absence reminder to parent"
                          data-ocid={`attendance.bell_button.${i + 1}`}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white transition-all duration-200 border border-amber-300 flex-shrink-0 ml-1"
                        >
                          <Bell className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Submit button */}
          {filtered.length > 0 && (
            <div className="px-4 py-4 border-t border-border bg-muted/20">
              <Button
                type="button"
                onClick={handleSubmit}
                data-ocid="attendance.submit_button"
                size="lg"
                className={[
                  "w-full font-semibold transition-all duration-300 gap-2",
                  submitted
                    ? "bg-success text-white hover:bg-success/90 shadow-md"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
                ].join(" ")}
              >
                {submitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Attendance Saved ✓
                  </>
                ) : (
                  <>
                    <ClipboardList className="w-4 h-4" />
                    Save Attendance for {formatShortDate(selectedDate)}
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>

        {/* ── Attendance History ───────────────────────────────────────── */}
        <Card
          className="card-elevated border-border/60 overflow-hidden"
          data-ocid="attendance.history"
        >
          <CardHeader className="px-4 py-3 border-b border-border bg-muted/30">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              Attendance History — Last 7 Days
            </CardTitle>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">
                    Class
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-success uppercase tracking-wider">
                    Present
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-destructive uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {historyRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-muted-foreground"
                    >
                      No history available for the selected class
                    </td>
                  </tr>
                ) : (
                  historyRows.map((row, i) => {
                    const pct =
                      row.total > 0
                        ? Math.round((row.present / row.total) * 100)
                        : 0;
                    return (
                      <tr
                        key={row.date}
                        className="hover:bg-muted/20 transition-colors duration-150"
                        data-ocid={`attendance.history.item.${i + 1}`}
                      >
                        <td className="px-4 py-3 text-sm text-foreground font-medium">
                          {formatShortDate(row.date)}
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <Badge
                            variant="outline"
                            className="text-xs border-primary/20 text-primary/80 bg-primary/5"
                          >
                            {selectedClass || "All Sessions"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 font-semibold text-success">
                            <Check className="w-3 h-3" />
                            {row.present}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 font-semibold text-destructive">
                            <X className="w-3 h-3" />
                            {row.absent}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={[
                              "inline-flex items-center gap-1 font-bold text-sm px-2 py-0.5 rounded-full",
                              pct >= 80
                                ? "bg-success/10 text-success"
                                : pct >= 60
                                  ? "bg-warning/10 text-warning"
                                  : "bg-destructive/10 text-destructive",
                            ].join(" ")}
                          >
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ── Send All Reminders Modal ─────────────────────────────────── */}
      {showSendAllModal && sendAllAlerts.length > 0 && (
        <SendAllModal
          alerts={sendAllAlerts}
          onClose={() => setShowSendAllModal(false)}
        />
      )}
    </>
  );
}
