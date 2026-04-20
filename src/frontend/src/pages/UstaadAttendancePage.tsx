import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type Teacher,
  type UstaadAttendance,
  addUstaadAttendanceRecord,
  createId,
  getTeachers,
  loadUstaadAttendance,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { ArrowLeft, CalendarCheck, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UstaadAttendancePageProps {
  setActivePage: (page: AppPage) => void;
}

export default function UstaadAttendancePage({
  setActivePage,
}: UstaadAttendancePageProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [records, setRecords] = useState<UstaadAttendance[]>([]);

  useEffect(() => {
    getTeachers()
      .then(setTeachers)
      .catch(() => setTeachers([]));
    loadUstaadAttendance()
      .then((r) => setRecords(r.sort((a, b) => b.date.localeCompare(a.date))))
      .catch(() => setRecords([]));
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    ustaadName: "",
    date: today,
    status: "present" as "present" | "absent",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ustaadName) {
      toast.error("Please select an Ustaad");
      return;
    }
    const teacher = teachers.find((t) => t.name === form.ustaadName);
    const record: UstaadAttendance = {
      id: createId(),
      ustaadId: teacher?.id ?? createId(),
      ustaadName: form.ustaadName,
      date: form.date,
      status: form.status,
      notes: form.notes || undefined,
    };
    await addUstaadAttendanceRecord(record);
    const refreshed = await loadUstaadAttendance();
    setRecords(refreshed.sort((a, b) => b.date.localeCompare(a.date)));
    toast.success(`Attendance marked for ${form.ustaadName}`);
    setForm({ ustaadName: "", date: today, status: "present", notes: "" });
  }

  return (
    <div className="space-y-5 page-enter" data-ocid="ustaad_attendance.page">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActivePage("dashboard")}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        data-ocid="ustaad_attendance.back_button"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <UserCheck className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Ustaad Attendance
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage Ustaad presence
          </p>
        </div>
      </div>

      {/* Add Record Form */}
      <Card className="card-elevated border-border/60">
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-primary" />
            Mark Attendance
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="ua-ustaad" className="text-sm font-medium">
                Ustaad
              </Label>
              <select
                id="ua-ustaad"
                value={form.ustaadName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, ustaadName: e.target.value }))
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="ustaad_attendance.ustaad_select"
              >
                <option value="">-- Select Ustaad --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ua-date" className="text-sm font-medium">
                Date
              </Label>
              <Input
                id="ua-date"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                data-ocid="ustaad_attendance.date_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ua-status" className="text-sm font-medium">
                Status
              </Label>
              <select
                id="ua-status"
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    status: e.target.value as "present" | "absent",
                  }))
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                data-ocid="ustaad_attendance.status_select"
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ua-notes" className="text-sm font-medium">
                Notes (optional)
              </Label>
              <Input
                id="ua-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Any notes..."
                data-ocid="ustaad_attendance.notes_input"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 gap-2"
                data-ocid="ustaad_attendance.submit_button"
              >
                <CalendarCheck className="w-4 h-4" />
                Mark Attendance
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card className="card-elevated border-border/60 overflow-hidden">
        <CardContent className="p-0">
          <div className="px-5 py-3 border-b border-border bg-muted/30">
            <h2 className="text-sm font-semibold text-foreground">
              Attendance Records
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    #
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Ustaad Name
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {records.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-muted-foreground"
                      data-ocid="ustaad_attendance.empty_state"
                    >
                      No attendance records yet. Mark attendance above.
                    </td>
                  </tr>
                ) : (
                  records.map((rec, i) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-muted/20 transition-colors"
                      data-ocid={`ustaad_attendance.item.${i + 1}`}
                    >
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {rec.ustaadName}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(`${rec.date}T00:00:00`).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            rec.status === "present"
                              ? "bg-success/10 text-success border-success/20 text-xs"
                              : "bg-destructive/10 text-destructive border-destructive/20 text-xs"
                          }
                        >
                          {rec.status === "present" ? "Present" : "Absent"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {rec.notes ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
