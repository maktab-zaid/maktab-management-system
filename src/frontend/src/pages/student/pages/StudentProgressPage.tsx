import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { BookOpen, Star } from "lucide-react";
import { useStudentByMobile } from "../../../hooks/useGoogleSheets";

interface Props {
  mobileNumber: string;
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "w-5 h-5",
            s <= value ? "fill-warning text-warning" : "text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}

export default function StudentProgressPage({ mobileNumber }: Props) {
  const { student, reports, isLoading } = useStudentByMobile(mobileNumber);

  if (isLoading) {
    return (
      <div className="space-y-5" data-ocid="student.progress.loading_state">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestReport = reports.length > 0 ? reports[reports.length - 1] : null;
  const akhlaqNum = Number.parseInt(
    latestReport?.akhlaq || student?.akhlaq || "0",
    10,
  );

  return (
    <div data-ocid="student.progress.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Progress</h1>
        <p className="text-muted-foreground text-sm">
          Academic record from Google Sheets
        </p>
      </div>

      {!student && !isLoading ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border">
          <p className="text-muted-foreground">
            Profile not found. Contact admin.
          </p>
        </div>
      ) : (
        <>
          <Card className="shadow-card max-w-lg">
            <CardContent className="p-6 space-y-1">
              {/* Current Sabak */}
              <div className="flex items-start gap-3 py-3 border-b border-border">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Sabak</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    {latestReport?.sabak || student?.currentSabak || "Not set"}
                  </p>
                </div>
              </div>

              {/* Attendance */}
              <div className="flex items-start gap-3 py-3 border-b border-border">
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center text-success-foreground shrink-0">
                  <span className="text-xs font-bold">%</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                  <p className="font-medium text-foreground mt-0.5">
                    {latestReport?.presentDays
                      ? `${latestReport.presentDays} days present`
                      : student?.attendance
                        ? `${student.attendance} days present`
                        : "Not set"}
                  </p>
                </div>
              </div>

              {/* Akhlaq */}
              <div className="flex items-start gap-3 py-3">
                <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center text-warning shrink-0">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Akhlaq</p>
                  {akhlaqNum > 0 ? (
                    <div className="mt-1">
                      <StarRow value={akhlaqNum} />
                    </div>
                  ) : (
                    <p className="font-medium text-foreground mt-0.5">
                      {latestReport?.akhlaq || student?.akhlaq || "Not set"}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historical reports */}
          {reports.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                Monthly History
              </h2>
              <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                {reports.map((r, i) => (
                  <div
                    key={r.month || String(i)}
                    className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <span className="text-xs font-bold">{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground">
                        {r.month || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {r.sabak ? `Sabak: ${r.sabak}` : ""}
                        {r.presentDays ? ` • Present: ${r.presentDays}` : ""}
                      </p>
                    </div>
                    {r.akhlaq && (
                      <span className="text-xs text-muted-foreground">
                        Akhlaq: {r.akhlaq}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
