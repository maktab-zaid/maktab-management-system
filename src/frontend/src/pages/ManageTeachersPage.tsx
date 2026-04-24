import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type ParentActivity,
  type SalaryRecord,
  type Teacher,
  createId,
  getSalaries,
  getTeachers,
  saveSalaries,
  addTeacher as supabaseAddTeacher,
  deleteTeacher as supabaseDeleteTeacher,
} from "@/lib/storage";
import {
  CheckCircle,
  Clock,
  IndianRupee,
  MessageCircle,
  Moon,
  Pencil,
  Plus,
  Sun,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [
  String(CURRENT_YEAR - 1),
  String(CURRENT_YEAR),
  String(CURRENT_YEAR + 1),
];

const SESSION_LIST = ["Morning", "Afternoon", "Evening"] as const;

function sessionIcon(slot?: string) {
  const lower = (slot ?? "").toLowerCase();
  if (lower === "morning")
    return <Sun className="w-3.5 h-3.5 text-yellow-500" />;
  if (lower === "afternoon")
    return <Clock className="w-3.5 h-3.5 text-orange-500" />;
  return <Moon className="w-3.5 h-3.5 text-indigo-500" />;
}

function sessionBadgeClass(slot?: string) {
  const lower = (slot ?? "").toLowerCase();
  if (lower === "morning")
    return "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-400";
  if (lower === "afternoon")
    return "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-400";
  return "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:border-indigo-800 dark:text-indigo-400";
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  action,
}: {
  icon: React.ElementType;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 bg-primary border-b border-border rounded-t-xl">
      <div className="flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-[#D4AF37]" />
        <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
      </div>
      {action}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ManageTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const parentActivity: ParentActivity[] = [];

  // Load from Supabase on mount
  useEffect(() => {
    console.log("Fetching teachers...");
    getTeachers()
      .then((data) => {
        console.log("Teachers data:", data);
        setTeachers(data);
      })
      .catch((e) => {
        console.error("[ManageTeachersPage] Failed to fetch teachers:", e);
        setTeachers([]);
      });
    getSalaries()
      .then(setSalaries)
      .catch(() => setSalaries([]));
  }, []);

  // Teacher modals
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);
  const [editClassTeacher, setEditClassTeacher] = useState<Teacher | null>(
    null,
  );
  const [deleteTeacher, setDeleteTeacher] = useState<Teacher | null>(null);

  // Salary modals
  const [addSalaryOpen, setAddSalaryOpen] = useState(false);
  const [whatsappSalary, setWhatsappSalary] = useState<SalaryRecord | null>(
    null,
  );

  // Add teacher form
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    mobile: "",
    timeSlot: "",
  });
  const [editTimeSlot, setEditTimeSlot] = useState("");

  // Add salary form
  const [newSalary, setNewSalary] = useState({
    teacherName: "",
    month: "April",
    year: String(CURRENT_YEAR),
    amount: "",
  });

  // ── Teacher handlers ────────────────────────────────────────────────────────

  const handleAddTeacher = async () => {
    if (!newTeacher.name.trim() || !newTeacher.timeSlot) return;
    const result = await supabaseAddTeacher(
      newTeacher.name.trim(),
      newTeacher.mobile.trim(),
      newTeacher.timeSlot,
    );
    if (result !== null) {
      const updated = await getTeachers();
      setTeachers(updated);
    }
    setNewTeacher({ name: "", mobile: "", timeSlot: "" });
    setAddTeacherOpen(false);
  };

  const handleEditClass = async () => {
    if (!editClassTeacher || !editTimeSlot) return;
    const updated = teachers.map((t) =>
      t.id === editClassTeacher.id
        ? {
            ...t,
            className: editTimeSlot,
            timeSlot: editTimeSlot.toLowerCase() as
              | "morning"
              | "afternoon"
              | "evening",
          }
        : t,
    );
    // Re-insert the updated teacher via upsert (addTeacher uses insert, so use supabase upsert directly via saveTeachers)
    try {
      const { supabase } = await import("@/lib/supabase");
      if (supabase) {
        const updated_teacher = updated.find(
          (t) => t.id === editClassTeacher.id,
        );
        if (updated_teacher) {
          const { error } = await supabase
            .from("teachers")
            .update({
              time_slot: editTimeSlot.toLowerCase(),
              class_name: editTimeSlot,
            })
            .eq("id", editClassTeacher.id);
          if (error) console.error("[ManageTeachersPage] editClass:", error);
        }
      }
      const refreshed = await getTeachers();
      setTeachers(refreshed);
    } catch (e) {
      console.error("[ManageTeachersPage] editClass failed:", e);
      setTeachers(updated);
    }
    setEditClassTeacher(null);
    setEditTimeSlot("");
  };

  const handleDeleteTeacher = async () => {
    if (!deleteTeacher) return;
    try {
      await supabaseDeleteTeacher(deleteTeacher.id);
      const refreshed = await getTeachers();
      setTeachers(refreshed);
    } catch (e) {
      console.error("[ManageTeachersPage] deleteTeacher failed:", e);
      setTeachers((prev) => prev.filter((t) => t.id !== deleteTeacher.id));
    }
    setDeleteTeacher(null);
  };

  // ── Salary handlers ─────────────────────────────────────────────────────────

  const handleAddSalary = async () => {
    if (!newSalary.teacherName || !newSalary.amount) return;
    const record: SalaryRecord = {
      id: createId(),
      teacherId:
        teachers.find((t) => t.name === newSalary.teacherName)?.id ??
        createId(),
      teacherName: newSalary.teacherName,
      month: newSalary.month,
      year: newSalary.year,
      amount: Number(newSalary.amount),
      status: "pending",
    };
    const updated = [...salaries, record];
    await saveSalaries(updated);
    setSalaries(updated);
    setNewSalary({
      teacherName: "",
      month: "April",
      year: String(CURRENT_YEAR),
      amount: "",
    });
    setAddSalaryOpen(false);
  };

  const handleMarkPaid = async (record: SalaryRecord) => {
    const updated = salaries.map((s) =>
      s.id === record.id
        ? {
            ...s,
            status: "paid" as const,
            paidDate: new Date().toISOString().slice(0, 10),
          }
        : s,
    );
    await saveSalaries(updated);
    setSalaries(updated);
    setWhatsappSalary({
      ...record,
      status: "paid",
      paidDate: new Date().toISOString().slice(0, 10),
    });
  };

  // ── Session-grouped teacher list ────────────────────────────────────────────

  const grouped = SESSION_LIST.map((session) => ({
    session,
    teachers: teachers.filter((t) => {
      const ts = t.timeSlot ?? "";
      const tsStr = Array.isArray(ts) ? ts.join(",") : ts;
      return tsStr.toLowerCase().includes(session.toLowerCase());
    }),
  }));

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-4 md:p-6" data-ocid="manage_teachers.page">
      {/* ── Section 1: Session-Grouped Teacher List ── */}
      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        <SectionHeader
          icon={Users}
          title="Ustaad List by Session"
          action={
            <Button
              size="sm"
              className="bg-[#D4AF37] hover:bg-[#c49f30] text-[#166534] font-bold text-xs h-8 px-3"
              onClick={() => setAddTeacherOpen(true)}
              data-ocid="manage_teachers.add_teacher_button"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Ustaad
            </Button>
          }
        />
        <div className="divide-y divide-border">
          {grouped.map(({ session, teachers: sessionTeachers }) => (
            <div key={session}>
              {/* Session header row */}
              <div className="flex items-center gap-2 px-5 py-2.5 bg-muted/30">
                {sessionIcon(session)}
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {session}
                </span>
                <span className="ml-auto text-xs text-muted-foreground font-medium">
                  {sessionTeachers.length} Ustaad
                  {sessionTeachers.length !== 1 ? "s" : ""}
                </span>
              </div>
              {sessionTeachers.length === 0 ? (
                <div className="px-5 py-4 text-xs text-muted-foreground italic">
                  No Ustaads assigned to {session} yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/20 border-b border-border/60">
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">
                          #
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">
                          Session
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">
                          Mobile
                        </th>
                        <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionTeachers.map((teacher, idx) => (
                        <tr
                          key={teacher.id}
                          className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                          data-ocid={`manage_teachers.teachers.item.${teachers.indexOf(teacher) + 1}`}
                        >
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-medium text-foreground">
                            {teacher.name}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${sessionBadgeClass(Array.isArray(teacher.timeSlot) ? teacher.timeSlot[0] : teacher.timeSlot)}`}
                            >
                              {sessionIcon(
                                Array.isArray(teacher.timeSlot)
                                  ? teacher.timeSlot[0]
                                  : teacher.timeSlot,
                              )}
                              {teacher.timeSlot
                                ? (Array.isArray(teacher.timeSlot)
                                    ? teacher.timeSlot.join(", ")
                                    : teacher.timeSlot
                                  )
                                    .charAt(0)
                                    .toUpperCase() +
                                  (Array.isArray(teacher.timeSlot)
                                    ? teacher.timeSlot.join(", ")
                                    : teacher.timeSlot
                                  ).slice(1)
                                : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-sm">
                            {teacher.mobile || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs border-primary/30 text-primary hover:bg-primary/5"
                                onClick={() => {
                                  setEditClassTeacher(teacher);
                                  const tsStr = Array.isArray(teacher.timeSlot)
                                    ? teacher.timeSlot[0]
                                    : teacher.timeSlot;
                                  setEditTimeSlot(
                                    tsStr
                                      ? tsStr.charAt(0).toUpperCase() +
                                          tsStr.slice(1)
                                      : "",
                                  );
                                }}
                                data-ocid={`manage_teachers.teachers.edit_button.${teachers.indexOf(teacher) + 1}`}
                              >
                                <Pencil className="w-3 h-3 mr-1" /> Edit Slot
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/5"
                                onClick={() => setDeleteTeacher(teacher)}
                                data-ocid={`manage_teachers.teachers.delete_button.${teachers.indexOf(teacher) + 1}`}
                              >
                                <Trash2 className="w-3 h-3 mr-1" /> Remove
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
          {teachers.length === 0 && (
            <div
              className="px-5 py-10 text-center text-muted-foreground text-sm"
              data-ocid="manage_teachers.teachers.empty_state"
            >
              No Ustaads added yet. Click "Add Ustaad" to begin.
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Salary ── */}
      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        <SectionHeader
          icon={IndianRupee}
          title="Teacher Salary"
          action={
            <Button
              size="sm"
              className="bg-[#D4AF37] hover:bg-[#c49f30] text-[#166534] font-bold text-xs h-8 px-3"
              onClick={() => setAddSalaryOpen(true)}
              data-ocid="manage_teachers.add_salary_button"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Record
            </Button>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Teacher
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Month
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Year
                </th>
                <th className="text-right px-4 py-3 font-semibold text-foreground">
                  Amount (₹)
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Date Paid
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {salaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="manage_teachers.salary.empty_state"
                  >
                    No salary records yet.
                  </td>
                </tr>
              ) : (
                salaries.map((rec, idx) => (
                  <tr
                    key={rec.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-ocid={`manage_teachers.salary.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {rec.teacherName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {rec.month}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {rec.year}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground tabular-nums">
                      ₹{rec.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      {rec.status === "paid" ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs">
                          Paid
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {rec.paidDate ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {rec.status === "pending" ? (
                        <Button
                          size="sm"
                          className="h-7 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleMarkPaid(rec)}
                          data-ocid={`manage_teachers.salary.mark_paid_button.${idx + 1}`}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" /> Mark Paid
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 3: Parent Activity ── */}
      <div className="bg-card rounded-xl border border-border shadow-soft overflow-hidden">
        <SectionHeader icon={Users} title="Parent Activity Tracking" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Student Name
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Parent Mobile
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Last Login
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Recent Activity
                </th>
              </tr>
            </thead>
            <tbody>
              {parentActivity.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="manage_teachers.parent_activity.empty_state"
                  >
                    No parent logins yet.
                  </td>
                </tr>
              ) : (
                parentActivity.map((pa, idx) => (
                  <tr
                    key={pa.parentMobile}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    data-ocid={`manage_teachers.parent_activity.item.${idx + 1}`}
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {pa.studentName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {pa.parentMobile}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {pa.lastLogin
                        ? new Date(pa.lastLogin).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {pa.recentActivities.slice(0, 3).length === 0 ? (
                        <span className="text-xs text-muted-foreground">
                          No activity
                        </span>
                      ) : (
                        <ul className="space-y-0.5">
                          {pa.recentActivities.slice(0, 3).map((act, ai) => (
                            <li
                              key={`${pa.parentMobile}-${ai}`}
                              className="text-xs text-muted-foreground"
                            >
                              <span className="font-medium text-foreground">
                                {act.action}
                              </span>
                              {" — "}
                              {new Date(act.timestamp).toLocaleString("en-IN", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: Add Teacher ── */}
      <Dialog open={addTeacherOpen} onOpenChange={setAddTeacherOpen}>
        <DialogContent
          className="sm:max-w-md"
          data-ocid="manage_teachers.add_teacher_dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add New Ustaad
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label
                htmlFor="t-name"
                className="text-sm font-medium text-foreground"
              >
                Ustaad Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="t-name"
                placeholder="e.g. Hafiz Abdullah"
                value={newTeacher.name}
                onChange={(e) =>
                  setNewTeacher((p) => ({ ...p, name: e.target.value }))
                }
                className="mt-1"
                data-ocid="manage_teachers.add_teacher_name_input"
              />
            </div>
            <div>
              <Label
                htmlFor="t-mobile"
                className="text-sm font-medium text-foreground"
              >
                Mobile Number
              </Label>
              <Input
                id="t-mobile"
                placeholder="10-digit mobile"
                value={newTeacher.mobile}
                onChange={(e) =>
                  setNewTeacher((p) => ({ ...p, mobile: e.target.value }))
                }
                className="mt-1"
                data-ocid="manage_teachers.add_teacher_mobile_input"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">
                Session <span className="text-destructive">*</span>
              </Label>
              <Select
                value={newTeacher.timeSlot}
                onValueChange={(v) =>
                  setNewTeacher((p) => ({ ...p, timeSlot: v }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="manage_teachers.add_teacher_class_select"
                >
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_LIST.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setAddTeacherOpen(false)}
                data-ocid="manage_teachers.add_teacher_cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddTeacher}
                disabled={!newTeacher.name.trim() || !newTeacher.timeSlot}
                className="bg-primary hover:bg-primary/90"
                data-ocid="manage_teachers.add_teacher_submit_button"
              >
                Add Ustaad
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Edit Session ── */}
      <Dialog
        open={!!editClassTeacher}
        onOpenChange={(o) => {
          if (!o) setEditClassTeacher(null);
        }}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="manage_teachers.edit_class_dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit Session — {editClassTeacher?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-sm font-medium text-foreground">
                New Session
              </Label>
              <Select value={editTimeSlot} onValueChange={setEditTimeSlot}>
                <SelectTrigger
                  className="mt-1"
                  data-ocid="manage_teachers.edit_class_select"
                >
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {SESSION_LIST.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setEditClassTeacher(null)}
                data-ocid="manage_teachers.edit_class_cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditClass}
                disabled={!editTimeSlot}
                className="bg-primary hover:bg-primary/90"
                data-ocid="manage_teachers.edit_class_confirm_button"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Confirm Delete ── */}
      <Dialog
        open={!!deleteTeacher}
        onOpenChange={(o) => {
          if (!o) setDeleteTeacher(null);
        }}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="manage_teachers.delete_teacher_dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Remove Ustaad
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-foreground">
                {deleteTeacher?.name}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTeacher(null)}
              data-ocid="manage_teachers.delete_teacher_cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTeacher}
              data-ocid="manage_teachers.delete_teacher_confirm_button"
            >
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Add Salary ── */}
      <Dialog open={addSalaryOpen} onOpenChange={setAddSalaryOpen}>
        <DialogContent
          className="sm:max-w-md"
          data-ocid="manage_teachers.add_salary_dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add Salary Record
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div>
              <Label className="text-sm font-medium text-foreground">
                Teacher <span className="text-destructive">*</span>
              </Label>
              <Select
                value={newSalary.teacherName}
                onValueChange={(v) =>
                  setNewSalary((p) => ({ ...p, teacherName: v }))
                }
              >
                <SelectTrigger
                  className="mt-1"
                  data-ocid="manage_teachers.add_salary_teacher_select"
                >
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Month
                </Label>
                <Select
                  value={newSalary.month}
                  onValueChange={(v) =>
                    setNewSalary((p) => ({ ...p, month: v }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="manage_teachers.add_salary_month_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Year
                </Label>
                <Select
                  value={newSalary.year}
                  onValueChange={(v) =>
                    setNewSalary((p) => ({ ...p, year: v }))
                  }
                >
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="manage_teachers.add_salary_year_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label
                htmlFor="salary-amount"
                className="text-sm font-medium text-foreground"
              >
                Amount (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="salary-amount"
                type="number"
                placeholder="e.g. 8000"
                value={newSalary.amount}
                onChange={(e) =>
                  setNewSalary((p) => ({ ...p, amount: e.target.value }))
                }
                className="mt-1"
                data-ocid="manage_teachers.add_salary_amount_input"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setAddSalaryOpen(false)}
                data-ocid="manage_teachers.add_salary_cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSalary}
                disabled={!newSalary.teacherName || !newSalary.amount}
                className="bg-primary hover:bg-primary/90"
                data-ocid="manage_teachers.add_salary_submit_button"
              >
                Add Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: WhatsApp Payment Confirmation ── */}
      <Dialog
        open={!!whatsappSalary}
        onOpenChange={(o) => {
          if (!o) setWhatsappSalary(null);
        }}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="manage_teachers.whatsapp_salary_dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-5 h-5" /> Salary Marked as Paid
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <p className="text-sm text-muted-foreground">
              Send a payment confirmation to{" "}
              <span className="font-semibold text-foreground">
                {whatsappSalary?.teacherName}
              </span>{" "}
              via WhatsApp:
            </p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-sm font-medium text-emerald-900">
                Payment done by Maktab Zaid Bin Sabit
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button
              variant="outline"
              onClick={() => setWhatsappSalary(null)}
              data-ocid="manage_teachers.whatsapp_salary_close_button"
            >
              Close
            </Button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent("Payment done by Maktab Zaid Bin Sabit")}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setWhatsappSalary(null)}
              data-ocid="manage_teachers.whatsapp_salary_send_button"
            >
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                <MessageCircle className="w-4 h-4" /> Send via WhatsApp
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
