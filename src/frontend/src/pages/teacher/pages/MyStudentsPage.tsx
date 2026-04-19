import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, GraduationCap } from "lucide-react";
import { useTeacherStudents } from "../../../hooks/useGoogleSheets";

interface Props {
  teacherName: string;
  onBack?: () => void;
}

export default function MyStudentsPage({ teacherName, onBack }: Props) {
  const { data: students = [], isLoading } = useTeacherStudents(teacherName);

  return (
    <div data-ocid="teacher.students.page" className="space-y-5">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            data-ocid="teacher.students.back_button"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Students</h1>
          <p className="text-muted-foreground text-sm">
            {teacherName
              ? `Students assigned to ${teacherName}`
              : "Your assigned students"}
            {!isLoading && (
              <span className="ml-2">
                <Badge
                  variant="outline"
                  className="text-xs bg-primary/5 text-primary border-primary/20"
                >
                  {students.length} from Google Sheets
                </Badge>
              </span>
            )}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="teacher.students.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <div
          className="text-center py-16 bg-card rounded-xl border border-border"
          data-ocid="teacher.students.empty_state"
        >
          <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            {teacherName
              ? `No students assigned to ${teacherName} in Google Sheet`
              : "No students found in Google Sheet"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Make sure your name matches exactly in the Teacher column
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s, i) => (
            <Card
              key={`${s.mobile}-${i}`}
              data-ocid={`teacher.students.item.${i + 1}`}
              className="shadow-card hover:shadow-card-hover transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    {(s.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      {s.name || "—"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {s.fatherName || ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {s.className && (
                        <Badge variant="outline" className="text-xs">
                          {s.className}
                        </Badge>
                      )}
                      {s.timing && (
                        <Badge variant="outline" className="text-xs">
                          {s.timing}
                        </Badge>
                      )}
                      {s.feesStatus && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            s.feesStatus.toLowerCase() === "paid" ||
                            s.feesStatus.toLowerCase() === "active"
                              ? "bg-success/10 text-success-foreground border-success/30"
                              : "bg-warning/10 text-warning-foreground border-warning/30"
                          }`}
                        >
                          {s.feesStatus}
                        </Badge>
                      )}
                    </div>
                    {s.currentSabak && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Sabak: {s.currentSabak}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
