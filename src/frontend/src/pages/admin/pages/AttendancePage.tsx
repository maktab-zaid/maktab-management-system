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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type Teacher,
  type UstaadAttendance,
  addUstaadAttendanceRecord,
  getTeachers,
  getUstaadAttendance,
} from "@/lib/storage";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AttendanceStatus,
  useAllStudents,
  useMarkAttendance,
  useMonthlyAttendance,
} from "../../../hooks/useQueries";
import type { Attendance } from "../../../types";

function getMonthStr(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getDaysInMonth(monthStr: string) {
  const [yr, mo] = monthStr.split("-").map(Number);
  return new Date(yr, mo, 0).getDate();
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Student Attendance Tab ───────────────────────────────────────────────────

function StudentAttendanceTab() {
  const { data: students = [], isLoading: studentsLoading } = useAllStudents();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [month, setMonth] = useState(getMonthStr(0));
  const {
    data: records = [],
    isLoading: attendanceLoading,
    refetch,
  } = useMonthlyAttendance(selectedStudentId, month);
  const markAttendance = useMarkAttendance();

  const daysInMonth = getDaysInMonth(month);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const [yr, mo] = month.split("-");

  const getRecord = (day: number): Attendance | undefined => {
    const dateStr = `${yr}-${mo}-${String(day).padStart(2, "0")}`;
    return records.find((r) => r.date === dateStr);
  };

  const handleToggle = async (day: number) => {
    if (!selectedStudentId) return;
    const dateStr = `${yr}-${mo}-${String(day).padStart(2, "0")}`;
    const existing = getRecord(day);
    const newStatus =
      existing?.status === AttendanceStatus.present
        ? AttendanceStatus.absent
        : AttendanceStatus.present;
    try {
      await markAttendance.mutateAsync({
        id: existing?.id ?? `att-${selectedStudentId}-${dateStr}`,
        studentId: selectedStudentId,
        date: dateStr,
        status: newStatus,
        markedBy: "admin",
        createdAt: BigInt(Date.now()),
      });
      refetch();
    } catch {
      toast.error("Failed to update attendance");
    }
  };

  const presentCount = records.filter(
    (r) => r.status === AttendanceStatus.present,
  ).length;
  const absentCount = records.filter(
    (r) => r.status === AttendanceStatus.absent,
  ).length;
  const monthOptions = Array.from({ length: 6 }, (_, i) => getMonthStr(-i));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger
            data-ocid="admin.attendance.student.select"
            className="flex-1"
          >
            <SelectValue
              placeholder={studentsLoading ? "Loading..." : "Select a student"}
            />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name} - {s.className}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger
            data-ocid="admin.attendance.month.select"
            className="w-40"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStudentId && (
        <div className="flex gap-4">
          <Badge
            className="bg-success/15 text-success-foreground border-success/30"
            variant="outline"
          >
            Present: {presentCount}
          </Badge>
          <Badge
            className="bg-destructive/15 text-destructive border-destructive/30"
            variant="outline"
          >
            Absent: {absentCount}
          </Badge>
          <Badge variant="outline">Total: {daysInMonth}</Badge>
        </div>
      )}

      {!selectedStudentId ? (
        <div
          className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border"
          data-ocid="admin.attendance.empty_state"
        >
          Select a student to view attendance
        </div>
      ) : attendanceLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="admin.attendance.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card p-5">
          <h3 className="font-semibold text-foreground mb-4">
            Attendance for {month} &mdash;{" "}
            {students.find((s) => s.id === selectedStudentId)?.name}
          </h3>
          <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
            {days.map((day) => {
              const record = getRecord(day);
              const isPresent = record?.status === AttendanceStatus.present;
              const isAbsent = record?.status === AttendanceStatus.absent;
              const dateStr = `${yr}-${mo}-${String(day).padStart(2, "0")}`;
              const isFuture = new Date(dateStr) > new Date();
              return (
                <button
                  key={day}
                  type="button"
                  data-ocid={`admin.attendance.day.${day}`}
                  onClick={() => !isFuture && handleToggle(day)}
                  disabled={isFuture || markAttendance.isPending}
                  className={cn(
                    "h-10 w-full rounded-lg text-sm font-medium transition-all duration-150 border",
                    isFuture
                      ? "bg-muted/30 text-muted-foreground/40 border-border cursor-not-allowed"
                      : isPresent
                        ? "bg-success/20 text-success-foreground border-success/40 hover:bg-success/30"
                        : isAbsent
                          ? "bg-destructive/20 text-destructive border-destructive/40 hover:bg-destructive/30"
                          : "bg-muted/50 text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-success/30 border border-success/40" />
              Present
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-destructive/30 border border-destructive/40" />
              Absent
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-muted border border-border" />
              Not marked
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Ustaad Attendance Tab ────────────────────────────────────────────────────

function UstaadAttendanceTab() {
  const [date, setDate] = useState(getTodayStr());
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [records, setRecords] = useState<UstaadAttendance[]>([]);

  useEffect(() => {
    getTeachers()
      .then(setTeachers)
      .catch(() => setTeachers([]));
    getUstaadAttendance()
      .then(setRecords)
      .catch(() => setRecords([]));
  }, []);

  const getStatus = (name: string) =>
    records.find((r) => r.ustaadName === name && r.date === date)?.status ??
    null;

  const handleMark = async (name: string, status: "present" | "absent") => {
    const id = `ua-${name}-${date}`;
    await addUstaadAttendanceRecord({
      id,
      ustaadId: id,
      ustaadName: name,
      date,
      status,
    });
    const refreshed = await getUstaadAttendance();
    setRecords(refreshed);
    toast.success(`${name} marked as ${status}`);
  };

  const presentCount = teachers.filter(
    (t) => getStatus(t.name) === "present",
  ).length;
  const absentCount = teachers.filter(
    (t) => getStatus(t.name) === "absent",
  ).length;

  // History: last 30 records sorted by date desc
  const history = [...records]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 30);

  return (
    <div className="space-y-5">
      {/* Date selector + summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="ustaad-att-date"
            className="text-sm font-medium text-foreground"
          >
            Date:
          </label>
          <input
            id="ustaad-att-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-input rounded-lg px-3 py-2 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            data-ocid="admin.ustaad_attendance.date.input"
          />
        </div>
        <div className="flex gap-3">
          <Badge
            className="bg-success/15 text-success-foreground border-success/30"
            variant="outline"
          >
            Present: {presentCount}
          </Badge>
          <Badge
            className="bg-destructive/15 text-destructive border-destructive/30"
            variant="outline"
          >
            Absent: {absentCount}
          </Badge>
        </div>
      </div>

      {/* Mark attendance */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-primary/5">
          <h3 className="font-semibold text-foreground text-sm">
            Mark Ustaad Attendance — {date}
          </h3>
        </div>
        {teachers.length === 0 ? (
          <div
            className="text-center py-10 text-muted-foreground text-sm"
            data-ocid="admin.ustaad_attendance.empty_state"
          >
            No teachers found. Add teachers first.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {teachers.map((t, i) => {
              const status = getStatus(t.name);
              return (
                <div
                  key={t.id}
                  data-ocid={`admin.ustaad_attendance.item.${i + 1}`}
                  className="flex items-center justify-between px-5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {t.name}
                      </p>
                      {t.timeSlot && (
                        <p className="text-xs text-muted-foreground capitalize">
                          {t.timeSlot}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs capitalize mr-1",
                          status === "present"
                            ? "bg-success/10 text-success-foreground border-success/30"
                            : "bg-destructive/10 text-destructive border-destructive/30",
                        )}
                      >
                        {status}
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant={status === "present" ? "default" : "outline"}
                      className={cn(
                        "h-7 text-xs",
                        status === "present" &&
                          "bg-success/80 hover:bg-success text-white border-0",
                      )}
                      onClick={() => handleMark(t.name, "present")}
                      data-ocid={`admin.ustaad_attendance.present.${i + 1}`}
                    >
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "absent" ? "destructive" : "outline"}
                      className="h-7 text-xs"
                      onClick={() => handleMark(t.name, "absent")}
                      data-ocid={`admin.ustaad_attendance.absent.${i + 1}`}
                    >
                      Absent
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Attendance history table */}
      {history.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-primary/5">
            <h3 className="font-semibold text-foreground text-sm">
              Recent Attendance Records
            </h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="font-semibold text-foreground">
                  Ustaad Name
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-foreground">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((r, i) => (
                <TableRow
                  key={r.id}
                  data-ocid={`admin.ustaad_attendance.record.${i + 1}`}
                  className="hover:bg-muted/20"
                >
                  <TableCell className="font-medium">{r.ustaadName}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.date}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize",
                        r.status === "present"
                          ? "bg-success/10 text-success-foreground border-success/30"
                          : "bg-destructive/10 text-destructive border-destructive/30",
                      )}
                    >
                      {r.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type AttendanceTab = "students" | "ustaad";

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<AttendanceTab>("students");

  return (
    <div data-ocid="admin.attendance.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground text-sm">
          View and manage monthly attendance
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-muted/50 rounded-xl p-1 max-w-xs">
        {(["students", "ustaad"] as AttendanceTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            data-ocid={`admin.attendance.tab.${tab}`}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 capitalize",
              activeTab === tab
                ? "bg-card shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab === "ustaad" ? "Ustaad" : "Students"}
          </button>
        ))}
      </div>

      {activeTab === "students" ? (
        <StudentAttendanceTab />
      ) : (
        <UstaadAttendanceTab />
      )}
    </div>
  );
}
