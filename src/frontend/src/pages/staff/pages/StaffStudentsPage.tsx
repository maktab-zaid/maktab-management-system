import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudents } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Search } from "lucide-react";
import { useState } from "react";

interface Props {
  teacherName: string;
}

export default function StaffStudentsPage({ teacherName }: Props) {
  const { data: allStudents = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        return await getStudents();
      } catch (e) {
        console.error("[StaffStudentsPage] getStudents:", e);
        return [];
      }
    },
    staleTime: 30_000,
  });

  const students = teacherName
    ? allStudents.filter(
        (s) =>
          s.teacherName.toLowerCase().trim() ===
          teacherName.toLowerCase().trim(),
      )
    : allStudents;

  const [search, setSearch] = useState("");

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.parentMobile.includes(search),
  );

  return (
    <div data-ocid="staff.students.page" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  {students.length} from Supabase
                </Badge>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="staff.students.search_input"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="staff.students.loading_state"
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-16 bg-card rounded-xl border border-border"
          data-ocid="staff.students.empty_state"
        >
          <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">
            {search
              ? "No students match your search"
              : teacherName
                ? `No students assigned to ${teacherName}`
                : "No students found"}
          </p>
          {!search && (
            <p className="text-xs text-muted-foreground mt-1">
              Ask Admin to add students to your session
            </p>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <Card
              key={s.id}
              data-ocid={`staff.students.item.${i + 1}`}
              className="shadow-card hover:shadow-card-hover transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    {(s.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground truncate">
                      {s.name || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.fatherName || ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(s.studentClass ?? s.className) && (
                        <Badge variant="outline" className="text-xs">
                          {s.studentClass ?? s.className}
                        </Badge>
                      )}
                      {s.timeSlot && (
                        <Badge variant="outline" className="text-xs">
                          {s.timeSlot}
                        </Badge>
                      )}
                      {s.feesStatus && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            s.feesStatus === "paid"
                              ? "bg-success/10 text-success-foreground border-success/30"
                              : "bg-warning/10 text-warning-foreground border-warning/30"
                          }`}
                        >
                          {s.feesStatus}
                        </Badge>
                      )}
                    </div>
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
