import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStudents } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search } from "lucide-react";
import { useState } from "react";

interface Props {
  teacherName: string;
}

export default function StaffStudentDataPage({ teacherName }: Props) {
  const { data: allStudents = [], isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        return await getStudents();
      } catch (e) {
        console.error("[StaffStudentDataPage] getStudents:", e);
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
      (s.studentClass ?? s.className ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      s.parentMobile.includes(search),
  );

  return (
    <div data-ocid="staff.studentdata.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Student Data</h1>
        <p className="text-muted-foreground text-sm">
          Read-only view of your assigned students
        </p>
      </div>

      {/* Summary cards */}
      {!isLoading && students.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-primary">
                {students.length}
              </p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-success">
                {students.filter((s) => s.feesStatus === "paid").length}
              </p>
              <p className="text-xs text-muted-foreground">Fees Paid</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-warning">
                {students.filter((s) => s.feesStatus === "pending").length}
              </p>
              <p className="text-xs text-muted-foreground">Fees Pending</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-chart-2">
                {
                  [
                    ...new Set(
                      students
                        .map((s) => s.studentClass ?? s.className)
                        .filter(Boolean),
                    ),
                  ].length
                }
              </p>
              <p className="text-xs text-muted-foreground">Classes</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="staff.studentdata.search_input"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        {isLoading ? (
          <div
            className="p-6 space-y-2"
            data-ocid="staff.studentdata.loading_state"
          >
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="staff.studentdata.empty_state"
          >
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">
              {search
                ? "No students match your search"
                : "No student data found"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 border-b border-border">
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Class</TableHead>
                  <TableHead className="font-semibold">Session</TableHead>
                  <TableHead className="font-semibold">Fees</TableHead>
                  <TableHead className="font-semibold">Mobile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s, i) => (
                  <TableRow
                    key={s.id}
                    data-ocid={`staff.studentdata.item.${i + 1}`}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {i + 1}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {s.name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {s.fatherName || ""}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(s.studentClass ?? s.className) ? (
                        <Badge variant="outline" className="text-xs">
                          {s.studentClass ?? s.className}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {s.timeSlot || "—"}
                    </TableCell>
                    <TableCell>
                      {s.feesStatus ? (
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            s.feesStatus === "paid"
                              ? "bg-success/15 text-success-foreground border-success/30"
                              : "bg-warning/15 text-warning-foreground border-warning/30"
                          }`}
                        >
                          {s.feesStatus}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.parentMobile || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
