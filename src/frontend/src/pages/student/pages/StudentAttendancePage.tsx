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
import { CalendarDays } from "lucide-react";
import { useStudentByMobile } from "../../../hooks/useGoogleSheets";

interface Props {
  mobileNumber: string;
}

export default function StudentAttendancePage({ mobileNumber }: Props) {
  const { student, reports, isLoading } = useStudentByMobile(mobileNumber);

  const totalPresent = reports.reduce(
    (sum, r) => sum + (Number.parseInt(r.presentDays, 10) || 0),
    0,
  );

  return (
    <div data-ocid="student.attendance.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground text-sm">
          Attendance from Google Sheets
          <Badge
            variant="outline"
            className="ml-2 text-xs bg-primary/5 text-primary border-primary/20"
          >
            Monthly Reports
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
          {/* Summary card */}
          {student?.attendance && (
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold shrink-0">
                {student.attendance}
              </div>
              <div>
                <p className="font-semibold text-foreground">Present Days</p>
                <p className="text-sm text-muted-foreground">
                  Current month attendance
                </p>
              </div>
            </div>
          )}

          {reports.length === 0 ? (
            <div
              className="text-center py-16 bg-card rounded-xl border border-border"
              data-ocid="student.attendance.empty_state"
            >
              <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                No monthly reports found in Google Sheet
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5">
                    <TableHead className="font-semibold">Month</TableHead>
                    <TableHead className="font-semibold">
                      Present Days
                    </TableHead>
                    <TableHead className="font-semibold">Sabak</TableHead>
                    <TableHead className="font-semibold">Akhlaq</TableHead>
                    <TableHead className="font-semibold">Fees</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r, i) => (
                    <TableRow
                      key={r.month || String(i)}
                      data-ocid={`student.attendance.day.${i + 1}`}
                    >
                      <TableCell className="font-medium">
                        {r.month || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="bg-success/15 text-success-foreground border-success/30"
                          variant="outline"
                        >
                          {r.presentDays || "0"} days
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.sabak || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.akhlaq || "—"}
                      </TableCell>
                      <TableCell>
                        {r.feesStatus ? (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              r.feesStatus.toLowerCase() === "paid"
                                ? "bg-success/10 text-success-foreground border-success/30"
                                : "bg-warning/10 text-warning-foreground border-warning/30"
                            }`}
                          >
                            {r.feesStatus}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalPresent > 0 && (
                <div className="px-4 py-3 border-t border-border bg-muted/30 text-sm text-muted-foreground">
                  Total present days across all reports:{" "}
                  <span className="font-semibold text-foreground">
                    {totalPresent}
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
