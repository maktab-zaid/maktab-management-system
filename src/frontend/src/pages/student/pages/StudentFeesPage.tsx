import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getFees, getStudents } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";
import { DollarSign } from "lucide-react";

interface Props {
  mobileNumber: string;
}

export default function StudentFeesPage({ mobileNumber }: Props) {
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
        console.error("[StudentFeesPage] getStudents:", e);
        return null;
      }
    },
    enabled: !!mobileNumber,
    staleTime: 30_000,
  });

  const { data: feeRecords = [], isLoading: feesLoading } = useQuery({
    queryKey: ["fees", student?.id ?? ""],
    queryFn: async () => {
      if (!student?.id) return [];
      try {
        const all = await getFees();
        return all.filter((f) => f.studentId === student.id);
      } catch (e) {
        console.error("[StudentFeesPage] getFees:", e);
        return [];
      }
    },
    enabled: !!student?.id,
    staleTime: 30_000,
  });

  const isLoading = studentLoading || feesLoading;

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
        Contact admin to link your account.
      </div>
    );
  }

  return (
    <div data-ocid="student.fees.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Fees</h1>
        <p className="text-muted-foreground text-sm">
          Fees status
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
            {student.fees ? `₹${student.fees}` : "Not set"}
          </p>
        </div>
        <div
          className={`rounded-xl border p-4 ${
            student.feesStatus === "paid"
              ? "bg-success/10 border-success/30"
              : "bg-warning/10 border-warning/30"
          }`}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Current Status
          </p>
          <p
            className={`text-xl font-bold ${
              student.feesStatus === "paid"
                ? "text-success-foreground"
                : "text-warning-foreground"
            }`}
          >
            {student.feesStatus || "N/A"}
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Fee Records
          </p>
          <p className="text-xl font-bold text-foreground">
            {feeRecords.length}
          </p>
        </div>
      </div>

      {feeRecords.length > 0 && (
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          {feeRecords.map((f, i) => (
            <div
              key={f.id}
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
                <p className="text-xs text-muted-foreground">₹{f.amount}</p>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  f.status === "paid"
                    ? "bg-success/10 text-success-foreground border-success/30"
                    : "bg-warning/10 text-warning-foreground border-warning/30"
                }`}
              >
                {f.status}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {feeRecords.length === 0 && (
        <div
          className="text-center py-12 bg-card rounded-xl border border-border"
          data-ocid="student.fees.list.empty_state"
        >
          <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No fee records found</p>
        </div>
      )}
    </div>
  );
}
