import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useMarkAttendance,
  useStudentsByTeacher,
} from "../../../hooks/useQueries";
import { AttendanceStatus } from "../../../hooks/useQueries";

interface Props {
  teacherId: string;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TeacherAttendancePage({ teacherId }: Props) {
  const [selectedDate, setSelectedDate] = useState(today());
  const { data: students = [], isLoading: studentsLoading } =
    useStudentsByTeacher(teacherId);
  const markAttendance = useMarkAttendance();

  const [localStatus, setLocalStatus] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const handleMark = async (studentId: string, status: AttendanceStatus) => {
    setLocalStatus((p) => ({ ...p, [studentId]: status }));
    setSaving((p) => ({ ...p, [studentId]: true }));
    try {
      await markAttendance.mutateAsync({
        id: `att-${studentId}-${selectedDate}`,
        studentId,
        date: selectedDate,
        status,
        markedBy: teacherId,
        createdAt: BigInt(Date.now()),
      });
      toast.success("Attendance marked");
    } catch {
      toast.error("Failed to mark attendance");
      setLocalStatus((p) => {
        const n = { ...p };
        delete n[studentId];
        return n;
      });
    } finally {
      setSaving((p) => ({ ...p, [studentId]: false }));
    }
  };

  const presentCount = Object.values(localStatus).filter(
    (s) => s === AttendanceStatus.present,
  ).length;
  const absentCount = Object.values(localStatus).filter(
    (s) => s === AttendanceStatus.absent,
  ).length;

  return (
    <div data-ocid="teacher.attendance.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Daily Attendance</h1>
        <p className="text-muted-foreground text-sm">
          Mark attendance for your students
        </p>
      </div>

      <div className="flex items-end gap-4">
        <div className="space-y-1.5">
          <Label>Select Date</Label>
          <Input
            data-ocid="teacher.attendance.date.input"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setLocalStatus({});
            }}
            max={today()}
            className="w-48"
          />
        </div>
        {Object.keys(localStatus).length > 0 && (
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
        )}
      </div>

      {studentsLoading ? (
        <div
          className="flex justify-center py-12"
          data-ocid="teacher.attendance.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : students.length === 0 ? (
        <div
          className="text-center py-16 bg-card rounded-xl border border-border"
          data-ocid="teacher.attendance.empty_state"
        >
          No students assigned to mark attendance
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {students.map((s, i) => {
            const status = localStatus[s.id];
            const isSavingThis = saving[s.id];
            return (
              <div
                key={s.id}
                data-ocid={`teacher.attendance.item.${i + 1}`}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0",
                  status === AttendanceStatus.present && "bg-success/5",
                  status === AttendanceStatus.absent && "bg-destructive/5",
                )}
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.className} &bull; {s.timing}
                  </p>
                </div>
                <div className="flex gap-2">
                  {isSavingThis ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <>
                      <Button
                        data-ocid={`teacher.attendance.present.${i + 1}`}
                        size="sm"
                        variant={
                          status === AttendanceStatus.present
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "gap-1",
                          status === AttendanceStatus.present &&
                            "bg-success text-white border-success",
                        )}
                        onClick={() =>
                          handleMark(s.id, AttendanceStatus.present)
                        }
                      >
                        <Check className="w-3.5 h-3.5" /> P
                      </Button>
                      <Button
                        data-ocid={`teacher.attendance.absent.${i + 1}`}
                        size="sm"
                        variant={
                          status === AttendanceStatus.absent
                            ? "default"
                            : "outline"
                        }
                        className={cn(
                          "gap-1",
                          status === AttendanceStatus.absent &&
                            "bg-destructive text-white border-destructive",
                        )}
                        onClick={() =>
                          handleMark(s.id, AttendanceStatus.absent)
                        }
                      >
                        <X className="w-3.5 h-3.5" /> A
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
