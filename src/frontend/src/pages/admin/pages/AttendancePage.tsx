import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAllStudents,
  useMarkAttendance,
  useMonthlyAttendance,
} from "../../../hooks/useQueries";
import { AttendanceStatus } from "../../../hooks/useQueries";
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

export default function AttendancePage() {
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
    <div data-ocid="admin.attendance.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground text-sm">
          View and mark monthly attendance
        </p>
      </div>

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
