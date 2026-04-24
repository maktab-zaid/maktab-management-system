import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAttendance, getStudents } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";

interface Props {
  mobileNumber: string;
}

export default function StudentAttendancePage({ mobileNumber }: Props) {
  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ["student-by-mobile", mobileNumber],
    queryFn: async () => {
      try {
        const all = await getStudents();
        return (
          all.find(
            (s) =>
              s.parentMobile.replace(/\D/g, "") ===
              mobileNumber.replace(/\D/g, ""),
          ) ?? null
        );
      } catch (e) {
        console.error("[StudentAttendancePage] getStudents:", e);
        return null;
      }
    },
    enabled: !!mobileNumber,
    staleTime: 30_000,
  });

  const { data: attendanceRecords = [], isLoading: attendanceLoading } =
    useQuery({
      queryKey: ["attendance", student?.id ?? ""],
      queryFn: async () => {
        if (!student?.id) return [];
        try {
          const all = await getAttendance();
          return all.filter((a) => a.studentId === student.id);
        } catch (e) {
          console.error("[StudentAttendancePage] getAttendance:", e);
          return [];
        }
      },
      enabled: !!student?.id,
      staleTime: 30_000,
    });

  const isLoading = studentLoading || attendanceLoading;

  const presentCount = attendanceRecords.filter(
    (r) => r.status === "present",
  ).length;
  const absentCount = attendanceRecords.filter(
    (r) => r.status === "absent",
  ).length;

  return (
    <div data-ocid="student.attendance.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground text-sm">
          Attendance records
          <Badge
            variant="outline"
            className="ml-2 text-xs bg-primary/5 text-primary border-primary/20"
          >
            Live Data
          </Badge>
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="student.attendance.loading_state">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary */}
          {attendanceRecords.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-success/10 rounded-xl border border-success/30 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {presentCount}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Present
                  </p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
              </div>
              <div className="bg-warning/10 rounded-xl border border-warning/30 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning flex items-center justify-center text-white text-lg font-bold shrink-0">
                  {absentCount}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Absent
                  </p>
                  <p className="text-xs text-muted-foreground">days</p>
                </div>
              </div>
            </div>
          )}

          {attendanceRecords.length === 0 ? (
            <div
              className="text-center py-16 bg-card rounded-xl border border-border"
              data-ocid="student.attendance.empty_state"
            >
              <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                No attendance records found
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Marked By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((r, i) => (
                    <TableRow
                      key={r.id}
                      data-ocid={`student.attendance.day.${i + 1}`}
                    >
                      <TableCell className="font-medium">{r.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            r.status === "present"
                              ? "bg-success/15 text-success-foreground border-success/30"
                              : "bg-warning/15 text-warning-foreground border-warning/30"
                          }
                        >
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.markedBy || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
