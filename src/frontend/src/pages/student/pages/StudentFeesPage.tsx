import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign } from "lucide-react";
import { useStudentByMobile } from "../../../hooks/useGoogleSheets";

interface Props {
  mobileNumber: string;
}

export default function StudentFeesPage({ mobileNumber }: Props) {
  const { student, reports, isLoading } = useStudentByMobile(mobileNumber);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div
        className="text-center py-16 bg-card rounded-xl border border-border"
        data-ocid="student.fees.empty_state"
      >
        Contact admin.
      </div>
    );
  }

  const feesReports = reports.filter((r) => r.feesStatus);

  return (
    <div data-ocid="student.fees.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Fees</h1>
        <p className="text-muted-foreground text-sm">
          Fees status from Google Sheets
          <Badge
            variant="outline"
            className="ml-2 text-xs bg-primary/5 text-primary border-primary/20"
          >
            Live Data
          </Badge>
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Monthly Fee
          </p>
          <p className="text-xl font-bold text-foreground">
            {student.monthlyFees ? `Rs. ${student.monthlyFees}` : "Not set"}
          </p>
        </div>
        <div
          className={`rounded-xl border p-4 ${
            student.feesStatus?.toLowerCase() === "paid" ||
            student.feesStatus?.toLowerCase() === "active"
              ? "bg-success/10 border-success/30"
              : "bg-warning/10 border-warning/30"
          }`}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Current Status
          </p>
          <p
            className={`text-xl font-bold ${
              student.feesStatus?.toLowerCase() === "paid" ||
              student.feesStatus?.toLowerCase() === "active"
                ? "text-success-foreground"
                : "text-warning-foreground"
            }`}
          >
            {student.feesStatus || "N/A"}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Monthly Reports
          </p>
          <p className="text-xl font-bold text-foreground">
            {feesReports.length}
          </p>
        </div>
      </div>

      {feesReports.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {feesReports.map((f, i) => (
            <div
              key={f.month || String(i)}
              data-ocid={`student.fees.item.${i + 1}`}
              className="flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {f.month || "Unknown Month"}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  f.feesStatus.toLowerCase() === "paid"
                    ? "bg-success/10 text-success-foreground border-success/30"
                    : "bg-warning/10 text-warning-foreground border-warning/30"
                }`}
              >
                {f.feesStatus}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {feesReports.length === 0 && (
        <div
          className="text-center py-12 bg-card rounded-xl border border-border"
          data-ocid="student.fees.list.empty_state"
        >
          <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            No monthly fee records in Google Sheet
          </p>
        </div>
      )}
    </div>
  );
}
