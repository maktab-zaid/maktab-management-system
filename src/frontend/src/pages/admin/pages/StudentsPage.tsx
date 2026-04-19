import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type Student,
  getStudents,
  getTeachers,
  saveStudents,
} from "@/lib/storage";
import {
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

const CLASS_OPTIONS = [
  "Ibtidayyah",
  "Nisf Qaidah",
  "Mukammal Qaidah",
  "Nisf Amma Para",
  "Mukammal Amma Para",
  "Nazra",
  "Hifz",
] as const;

const TIME_SLOT_OPTIONS = ["morning", "afternoon", "evening"] as const;

type TimeSlotValue = (typeof TIME_SLOT_OPTIONS)[number];

const EMPTY_FORM: Omit<Student, "id"> = {
  name: "",
  fatherName: "",
  parentMobile: "",
  className: "Ibtidayyah",
  teacherName: "",
  fees: 800,
  feesStatus: "pending",
  timeSlot: "morning",
  address: "",
  rollNumber: "",
  admissionDate: new Date().toISOString().slice(0, 10),
};

function useLocalStudents() {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  const students = getStudents();
  // force re-render when tick changes
  void tick;
  return { students, refresh };
}

export default function StudentsPage() {
  const { students, refresh } = useLocalStudents();
  const allTeacherNames = useMemo(() => {
    // Merge names from both storage.getTeachers() and student teacherName fields
    const fromStorage = getTeachers().map((t) => t.name);
    const fromStudents = students.map((s) => s.teacherName).filter(Boolean);
    return Array.from(new Set([...fromStorage, ...fromStudents])).sort();
  }, [students]);

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [ustaadFilter, setUstaadFilter] = useState("all");
  const [admissionMonth, setAdmissionMonth] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Student, "id">>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(search.toLowerCase()) ||
        s.parentMobile.includes(search) ||
        (s.rollNumber ?? "").includes(search);
      const matchClass = classFilter === "all" || s.className === classFilter;
      const matchTime = timeFilter === "all" || s.timeSlot === timeFilter;
      const matchUstaad =
        ustaadFilter === "all" || s.teacherName === ustaadFilter;
      const matchMonth =
        !admissionMonth ||
        (s.admissionDate ?? "").startsWith(admissionMonth.slice(0, 7));
      const matchYear =
        !admissionYear || (s.admissionDate ?? "").startsWith(admissionYear);
      return (
        matchSearch &&
        matchClass &&
        matchTime &&
        matchUstaad &&
        matchMonth &&
        matchYear
      );
    });
  }, [
    students,
    search,
    classFilter,
    timeFilter,
    ustaadFilter,
    admissionMonth,
    admissionYear,
  ]);

  const openAdd = useCallback(() => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((s: Student) => {
    setEditId(s.id);
    setForm({
      name: s.name,
      fatherName: s.fatherName,
      parentMobile: s.parentMobile,
      className: s.className,
      teacherName: s.teacherName,
      fees: s.fees,
      feesStatus: s.feesStatus,
      timeSlot: s.timeSlot,
      address: s.address ?? "",
      rollNumber: s.rollNumber ?? "",
      admissionDate: s.admissionDate ?? "",
    });
    setDialogOpen(true);
  }, []);

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (!form.fatherName.trim()) {
      toast.error("Father Name is required");
      return;
    }
    if (!form.parentMobile.trim()) {
      toast.error("Mobile is required");
      return;
    }
    setIsSaving(true);
    try {
      const all = getStudents();
      if (editId) {
        const updated = all.map((s) =>
          s.id === editId ? { ...s, ...form } : s,
        );
        saveStudents(updated);
        toast.success("Student updated");
      } else {
        const newStudent: Student = {
          id: `ms-${Date.now()}`,
          ...form,
        };
        saveStudents([...all, newStudent]);
        toast.success("Student added");
      }
      setDialogOpen(false);
      refresh();
    } catch {
      toast.error("Failed to save student");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (!deleteId) return;
    const all = getStudents().filter((s) => s.id !== deleteId);
    saveStudents(all);
    toast.success("Student removed");
    setDeleteId(null);
    refresh();
  };

  const slotLabel = (slot?: string) => {
    if (slot === "morning") return "Morning";
    if (slot === "afternoon") return "Afternoon";
    if (slot === "evening") return "Evening";
    return slot ?? "—";
  };

  const slotColor = (slot?: string) => {
    if (slot === "morning")
      return "bg-amber-100 text-amber-800 border-amber-300";
    if (slot === "afternoon")
      return "bg-blue-100 text-blue-800 border-blue-300";
    if (slot === "evening")
      return "bg-purple-100 text-purple-800 border-purple-300";
    return "";
  };

  // Admission stats
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisYear = new Date().getFullYear().toString();
  const monthlyCount = students.filter((s) =>
    (s.admissionDate ?? "").startsWith(thisMonth),
  ).length;
  const yearlyCount = students.filter((s) =>
    (s.admissionDate ?? "").startsWith(thisYear),
  ).length;

  return (
    <div data-ocid="admin.students.page" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" /> Students
          </h1>
          <p className="text-muted-foreground text-sm">
            {students.length} total &bull; {monthlyCount} this month &bull;{" "}
            {yearlyCount} this year
          </p>
        </div>
        <Button
          data-ocid="admin.students.open_modal_button"
          onClick={openAdd}
          className="bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" /> Add Student
        </Button>
      </div>

      {/* Admission filter bar */}
      <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded-xl border border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
          <CalendarDays className="w-3.5 h-3.5" /> Filter Admissions:
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Month</Label>
          <Input
            type="month"
            className="h-7 text-xs w-36"
            value={admissionMonth}
            onChange={(e) => setAdmissionMonth(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-xs">Year</Label>
          <Input
            type="number"
            className="h-7 text-xs w-24"
            placeholder="2026"
            value={admissionYear}
            onChange={(e) => setAdmissionYear(e.target.value)}
          />
        </div>
        {(admissionMonth || admissionYear) && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => {
              setAdmissionMonth("");
              setAdmissionYear("");
            }}
          >
            Clear
          </Button>
        )}
        {(admissionMonth || admissionYear) && (
          <span className="text-xs font-semibold text-primary self-center">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="admin.students.search_input"
            placeholder="Search by name, father, mobile, roll no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger
            data-ocid="admin.students.class.select"
            className="w-44"
          >
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASS_OPTIONS.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger
            data-ocid="admin.students.timeslot.select"
            className="w-40"
          >
            <SelectValue placeholder="All Slots" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time Slots</SelectItem>
            <SelectItem value="morning">🌅 Morning</SelectItem>
            <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
            <SelectItem value="evening">🌙 Evening</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ustaadFilter} onValueChange={setUstaadFilter}>
          <SelectTrigger
            data-ocid="admin.students.ustaad.select"
            className="w-44"
          >
            <SelectValue placeholder="All Ustaad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ustaad</SelectItem>
            {allTeacherNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Result count */}
      <div className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
        of{" "}
        <span className="font-semibold text-foreground">{students.length}</span>{" "}
        students
        {(search ||
          classFilter !== "all" ||
          timeFilter !== "all" ||
          ustaadFilter !== "all") && (
          <button
            type="button"
            className="ml-2 text-primary text-xs underline underline-offset-2"
            onClick={() => {
              setSearch("");
              setClassFilter("all");
              setTimeFilter("all");
              setUstaadFilter("all");
            }}
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div
            className="text-center py-14 text-muted-foreground text-sm"
            data-ocid="admin.students.empty_state"
          >
            No students found.{" "}
            {!search &&
              classFilter === "all" &&
              timeFilter === "all" &&
              ustaadFilter === "all" &&
              "Add your first student above."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5 border-b border-border">
                  <TableHead className="font-semibold text-sm">#</TableHead>
                  <TableHead className="font-semibold text-sm">Name</TableHead>
                  <TableHead className="font-semibold text-sm">
                    Father
                  </TableHead>
                  <TableHead className="font-semibold text-sm">
                    Mobile
                  </TableHead>
                  <TableHead className="font-semibold text-sm">Class</TableHead>
                  <TableHead className="font-semibold text-sm">
                    Time Slot
                  </TableHead>
                  <TableHead className="font-semibold text-sm">
                    Roll No
                  </TableHead>
                  <TableHead className="font-semibold text-sm">
                    Admission
                  </TableHead>
                  <TableHead className="font-semibold text-sm">Fees</TableHead>
                  <TableHead className="font-semibold text-right text-sm">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s, i) => (
                  <TableRow
                    key={s.id}
                    data-ocid={`admin.students.item.${i + 1}`}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-muted-foreground text-sm">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {s.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {s.fatherName || "—"}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {s.parentMobile}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {s.className}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${slotColor(s.timeSlot)}`}
                      >
                        {slotLabel(s.timeSlot)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.rollNumber || "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.admissionDate || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-xs ${s.feesStatus === "paid" ? "bg-success/15 text-success-foreground border-success/30" : "bg-warning/15 text-warning-foreground border-warning/30"}`}
                        variant="outline"
                      >
                        {s.feesStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => openEdit(s)}
                          data-ocid={`admin.students.edit_button.${i + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:text-destructive"
                          onClick={() => setDeleteId(s.id)}
                          data-ocid={`admin.students.delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          data-ocid="admin.students.dialog"
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <DialogHeader>
            <DialogTitle>
              📖 {editId ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input
                data-ocid="admin.students.name.input"
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Student full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Father Name *</Label>
              <Input
                data-ocid="admin.students.fathername.input"
                value={form.fatherName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fatherName: e.target.value }))
                }
                placeholder="Father's full name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile *</Label>
              <Input
                data-ocid="admin.students.mobile.input"
                value={form.parentMobile}
                onChange={(e) =>
                  setForm((p) => ({ ...p, parentMobile: e.target.value }))
                }
                placeholder="Parent mobile number"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select
                value={form.className}
                onValueChange={(v) => setForm((p) => ({ ...p, className: v }))}
              >
                <SelectTrigger data-ocid="admin.students.class_select.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLASS_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Time Slot 🕌</Label>
              <Select
                value={form.timeSlot ?? "morning"}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, timeSlot: v as TimeSlotValue }))
                }
              >
                <SelectTrigger data-ocid="admin.students.timeslot.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">🌅 Morning</SelectItem>
                  <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                  <SelectItem value="evening">🌙 Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Roll Number</Label>
              <Input
                data-ocid="admin.students.rollnumber.input"
                value={form.rollNumber ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, rollNumber: e.target.value }))
                }
                placeholder="e.g. 001"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Admission Date</Label>
              <Input
                type="date"
                data-ocid="admin.students.admissiondate.input"
                value={form.admissionDate ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, admissionDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Fees (₹)</Label>
              <Input
                data-ocid="admin.students.fees.input"
                type="number"
                value={form.fees}
                onChange={(e) =>
                  setForm((p) => ({ ...p, fees: Number(e.target.value) || 0 }))
                }
                placeholder="800"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Address</Label>
              <Input
                data-ocid="admin.students.address.input"
                value={form.address ?? ""}
                onChange={(e) =>
                  setForm((p) => ({ ...p, address: e.target.value }))
                }
                placeholder="Student address"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Assigned Teacher</Label>
              <Input
                data-ocid="admin.students.teacher.input"
                value={form.teacherName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, teacherName: e.target.value }))
                }
                placeholder="Teacher name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Fees Status</Label>
              <Select
                value={form.feesStatus}
                onValueChange={(v) =>
                  setForm((p) => ({
                    ...p,
                    feesStatus: v as "paid" | "pending",
                  }))
                }
              >
                <SelectTrigger data-ocid="admin.students.fees_status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="admin.students.cancel_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.students.save_button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {editId ? "Update" : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="admin.students.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.students.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.students.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
