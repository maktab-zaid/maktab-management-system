import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Loader2, Printer, Star } from "lucide-react";
import { useRef, useState } from "react";
import {
  useAcademicRecord,
  useAllStudents,
  useAllTeachers,
  useStudentAttendance,
  useStudentFees,
} from "../../../hooks/useQueries";
import { AttendanceStatus } from "../../../hooks/useQueries";

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

export default function ReportsPage() {
  const { data: students = [], isLoading: studentsLoading } = useAllStudents();
  const { data: teachers = [] } = useAllTeachers();
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const student = students.find((s) => s.id === selectedStudentId);
  const teacher = teachers.find((t) => t.id === student?.assignedTeacherId);

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div data-ocid="admin.reports.page" className="space-y-5">
      <div className="flex items-center justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground text-sm">
            Generate and print student reports
          </p>
        </div>
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

      <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
        <SelectTrigger
          data-ocid="admin.reports.student.select"
          className="max-w-sm no-print"
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

      {!selectedStudentId ? (
        <div
          className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border no-print"
          data-ocid="admin.reports.empty_state"
        >
          Select a student to generate report
        </div>
      ) : isLoading ? (
        <div
          className="flex justify-center py-12 no-print"
          data-ocid="admin.reports.loading_state"
        >
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div
          ref={printRef}
          className="bg-white border border-border rounded-xl shadow-card p-6 print-area space-y-6"
        >
          {/* Report Header */}
          <div className="text-center border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground">
              Maktab Management System
            </h2>
            <p className="text-sm text-muted-foreground">
              Student Progress Report
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Student Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider text-muted-foreground">
              Student Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Name", student?.name],
                ["Father Name", student?.fatherName],
                ["Mobile", student?.mobileNumber],
                ["Class", student?.className],
                ["Teacher", teacher?.name ?? "—"],
                ["Timing", student?.timing],
                ["Monthly Fees", `Rs. ${Number(student?.monthlyFees ?? 0)}`],
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

          {/* Attendance */}
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

          {/* Academic Record */}
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
                    {academic.currentSabak}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    Previous Sabak:{" "}
                  </span>
                  <span className="text-sm font-medium">
                    {academic.previousSabak}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">
                    Progress:{" "}
                  </span>
                  <span className="text-sm font-medium">
                    {academic.monthlyProgress}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">
                    Akhlaq:{" "}
                  </span>
                  <StarRow value={Number(academic.akhlaqRating)} />
                </div>
              </div>
            </div>
          )}

          {/* Fees Summary */}
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
                          className={`text-xs ${
                            f.status === "paid"
                              ? "bg-success/10 text-success-foreground border-success/30"
                              : "bg-destructive/10 text-destructive border-destructive/30"
                          }`}
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
