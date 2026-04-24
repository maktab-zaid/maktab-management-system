import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudents } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, GraduationCap, User } from "lucide-react";

interface Props {
  mobileNumber: string;
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <span className="text-sm text-muted-foreground w-24 shrink-0">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">
        {value || "—"}
      </span>
    </div>
  );
}

export default function StudentProfilePage({ mobileNumber }: Props) {
  const { data: student, isLoading } = useQuery({
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
        console.error("[StudentProfilePage] getStudents:", e);
        return null;
      }
    },
    enabled: !!mobileNumber,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-5" data-ocid="student.profile.loading_state">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-16 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div
        className="text-center py-16 bg-card rounded-xl border border-border"
        data-ocid="student.profile.empty_state"
      >
        <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground">Student profile not found</p>
        <p className="text-xs text-muted-foreground mt-1">
          Contact admin if this is an error
        </p>
      </div>
    );
  }

  return (
    <div data-ocid="student.profile.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground text-sm">
          Your student information
          <Badge
            variant="outline"
            className="ml-2 text-xs bg-primary/5 text-primary border-primary/20"
          >
            Live Data
          </Badge>
        </p>
      </div>

      <Card className="shadow-card max-w-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {(student.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {student.name}
              </h2>
              {student.fatherName && (
                <p className="text-muted-foreground text-sm">
                  Son of {student.fatherName}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-0">
            <InfoRow
              icon={<GraduationCap className="w-4 h-4" />}
              label="Class"
              value={student.studentClass ?? student.className ?? ""}
            />
            <InfoRow
              icon={<User className="w-4 h-4" />}
              label="Teacher"
              value={student.teacherName}
            />
            <InfoRow
              icon={<Clock className="w-4 h-4" />}
              label="Timing"
              value={student.timeSlot}
            />
            <InfoRow
              icon={<BookOpen className="w-4 h-4" />}
              label="Roll No."
              value={student.rollNumber ?? ""}
            />
            <InfoRow
              icon={<span className="text-xs font-bold">#</span>}
              label="Admission"
              value={student.admissionDate ?? ""}
            />
            <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <span className="text-xs font-bold">₹</span>
              </div>
              <span className="text-sm text-muted-foreground w-24 shrink-0">
                Monthly Fees
              </span>
              <span className="text-sm font-medium text-foreground">
                {student.fees ? `₹${student.fees}` : "—"}
              </span>
              {student.feesStatus && (
                <Badge
                  className={`ml-auto text-xs ${
                    student.feesStatus === "paid"
                      ? "bg-success/10 text-success-foreground border-success/30"
                      : "bg-warning/10 text-warning-foreground border-warning/30"
                  }`}
                  variant="outline"
                >
                  {student.feesStatus}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
