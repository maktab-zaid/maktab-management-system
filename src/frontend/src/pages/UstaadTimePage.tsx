import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type Session,
  getAttendance,
  getFees,
  getSabak,
  getStudents,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { ArrowLeft, BookOpen, CalendarCheck, IndianRupee } from "lucide-react";
import { useMemo } from "react";

interface UstaadTimePageProps {
  timeSlot: "morning" | "afternoon" | "evening";
  setActivePage: (page: AppPage) => void;
  session: Session;
}

export default function UstaadTimePage({
  timeSlot,
  setActivePage,
  session,
}: UstaadTimePageProps) {
  const allStudents = getStudents();
  const allAttendance = getAttendance();
  const allFees = getFees();
  const allSabak = getSabak();

  const today = new Date().toISOString().slice(0, 10);

  // Gate: if this Ustaad is NOT assigned to this session, show empty state
  const isAssigned =
    !session.teacherSessions ||
    session.teacherSessions.length === 0 ||
    session.teacherSessions
      .map((s) => s.toLowerCase())
      .includes(timeSlot.toLowerCase());

  const students = useMemo(
    () => allStudents.filter((s) => s.timeSlot === timeSlot),
    [allStudents, timeSlot],
  );

  const slotLabel = timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1);

  function getAttendanceToday(studentId: string) {
    return allAttendance.find(
      (a) => a.studentId === studentId && a.date === today,
    );
  }

  function getFeeStatus(studentId: string) {
    const fee = allFees
      .filter((f) => f.studentId === studentId)
      .sort((a, b) => b.month.localeCompare(a.month))[0];
    return fee?.status ?? null;
  }

  function getSabakProgress(studentId: string) {
    const rec = allSabak
      .filter((s) => s.studentId === studentId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
    return rec ? { lesson: rec.lessonName, progress: rec.progress } : null;
  }

  return (
    <div className="space-y-5 page-enter" data-ocid={`ustaad_${timeSlot}.page`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActivePage("dashboard")}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        data-ocid={`ustaad_${timeSlot}.back_button`}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {!isAssigned ? (
        <Card
          className="card-elevated border-border/60"
          data-ocid={`ustaad_${timeSlot}.not_assigned_state`}
        >
          <CardContent className="p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-muted/40 flex items-center justify-center mx-auto mb-4">
              <ArrowLeft className="w-6 h-6 text-muted-foreground/40 rotate-[-90deg]" />
            </div>
            <p className="font-semibold text-foreground text-base">
              Not Assigned
            </p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
              You are not assigned to the{" "}
              <span className="font-semibold text-foreground">{slotLabel}</span>{" "}
              session. Contact the admin to update your session assignment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {slotLabel} Session
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {students.length} students — {session.name}
            </p>
          </div>

          {students.length === 0 ? (
            <Card
              className="card-elevated border-border/60"
              data-ocid={`ustaad_${timeSlot}.empty_state`}
            >
              <CardContent className="p-10 text-center">
                <p className="font-semibold text-muted-foreground">
                  No students assigned to {slotLabel} session
                </p>
              </CardContent>
            </Card>
          ) : (
            <div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              data-ocid={`ustaad_${timeSlot}.list`}
            >
              {students.map((student, idx) => {
                const attendance = getAttendanceToday(student.id);
                const feeStatus = getFeeStatus(student.id);
                const sabak = getSabakProgress(student.id);

                return (
                  <Card
                    key={student.id}
                    className="card-elevated border-border/60 rounded-xl"
                    data-ocid={`ustaad_${timeSlot}.item.${idx + 1}`}
                  >
                    <CardContent className="p-4">
                      {/* Student Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {student.className} · {student.fatherName}
                          </p>
                        </div>
                      </div>

                      {/* Status Row */}
                      <div className="space-y-2">
                        {/* Attendance */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <CalendarCheck className="w-3.5 h-3.5" /> Today
                          </span>
                          {attendance ? (
                            <Badge
                              className={
                                attendance.status === "present"
                                  ? "bg-success/10 text-success border-success/20 text-xs"
                                  : "bg-destructive/10 text-destructive border-destructive/20 text-xs"
                              }
                            >
                              {attendance.status === "present"
                                ? "Present"
                                : "Absent"}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground"
                            >
                              Not marked
                            </Badge>
                          )}
                        </div>

                        {/* Fees */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <IndianRupee className="w-3.5 h-3.5" /> Fees
                          </span>
                          {feeStatus ? (
                            <Badge
                              className={
                                feeStatus === "paid"
                                  ? "bg-success/10 text-success border-success/20 text-xs"
                                  : "bg-warning/10 text-warning border-warning/20 text-xs"
                              }
                            >
                              {feeStatus === "paid" ? "Paid" : "Pending"}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs text-muted-foreground"
                            >
                              —
                            </Badge>
                          )}
                        </div>

                        {/* Sabak */}
                        {sabak && (
                          <div className="mt-2 pt-2 border-t border-border/40">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                              <BookOpen className="w-3.5 h-3.5" /> Sabak
                            </div>
                            <p className="text-xs font-medium text-foreground truncate">
                              {sabak.lesson}
                            </p>
                            <div
                              className="mt-1 progress-bar-track"
                              style={{ height: "4px" }}
                            >
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${sabak.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-primary font-semibold mt-0.5">
                              {sabak.progress}%
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-7 border-primary/30 text-primary hover:bg-primary/5"
                          onClick={() => setActivePage("attendance")}
                          data-ocid={`ustaad_${timeSlot}.attendance_button.${idx + 1}`}
                        >
                          Attendance
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-7 border-primary/30 text-primary hover:bg-primary/5"
                          onClick={() => setActivePage("sabak")}
                          data-ocid={`ustaad_${timeSlot}.sabak_button.${idx + 1}`}
                        >
                          Sabak
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-7 border-primary/30 text-primary hover:bg-primary/5"
                          onClick={() => setActivePage("fees")}
                          data-ocid={`ustaad_${timeSlot}.fees_button.${idx + 1}`}
                        >
                          Fees
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
