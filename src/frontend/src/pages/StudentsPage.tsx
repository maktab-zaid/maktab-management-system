import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  type Session,
  type Student,
  type Teacher,
  createId,
  getStudents,
  getTeachers,
  saveStudents,
} from "@/lib/storage";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserCircle2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface StudentsPageProps {
  session: Session;
}

const PAGE_SIZE = 10;

const defaultForm = {
  name: "",
  fatherName: "",
  parentMobile: "",
  className: "",
  teacherName: "",
  fees: "1000",
  feesStatus: "pending" as "paid" | "pending",
};

type FormState = typeof defaultForm;

export default function StudentsPage({ session }: StudentsPageProps) {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editForm, setEditForm] = useState<FormState>(defaultForm);

  // Load from localStorage on mount
  useEffect(() => {
    setAllStudents(getStudents());
    setTeachers(getTeachers());
  }, []);

  // Role-scoped student list
  const scopedStudents =
    session.role === "teacher"
      ? allStudents.filter((s) => s.className === session.teacherClass)
      : session.role === "parent"
        ? allStudents.filter((s) => s.parentMobile === session.mobile)
        : allStudents;

  // Class options derived from teachers
  const classOptions = teachers.map((t) => t.className);
  const allClassFilters = ["All Classes", ...Array.from(new Set(classOptions))];

  // Resolve teacher name from class selection
  const resolveTeacher = (className: string): string => {
    return teachers.find((t) => t.className === className)?.name ?? "";
  };

  // Filtered list
  const filtered = scopedStudents.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.fatherName.toLowerCase().includes(q) ||
      s.parentMobile.includes(q);
    const matchClass =
      classFilter === "All Classes" || s.className === classFilter;
    return matchSearch && matchClass;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const paidCount = scopedStudents.filter(
    (s) => s.feesStatus === "paid",
  ).length;
  const pendingCount = scopedStudents.filter(
    (s) => s.feesStatus === "pending",
  ).length;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleSearchChange = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  const handleClassChange = (v: string) => {
    setClassFilter(v);
    setPage(1);
  };

  const handleAdd = () => {
    if (!form.name.trim() || !form.className || !form.teacherName) return;
    const newStudent: Student = {
      id: createId(),
      name: form.name.trim(),
      fatherName: form.fatherName.trim(),
      parentMobile: form.parentMobile.trim(),
      className: form.className,
      teacherName: form.teacherName,
      fees: Number(form.fees) || 0,
      feesStatus: form.feesStatus,
    };
    const updated = [newStudent, ...allStudents];
    saveStudents(updated);
    setAllStudents(updated);
    setForm(defaultForm);
    setShowAddModal(false);
    setPage(1);
    toast.success(`${newStudent.name} added successfully`);
  };

  const handleEditOpen = (student: Student) => {
    setEditTarget(student);
    setEditForm({
      name: student.name,
      fatherName: student.fatherName,
      parentMobile: student.parentMobile,
      className: student.className,
      teacherName: student.teacherName,
      fees: String(student.fees),
      feesStatus: student.feesStatus,
    });
  };

  const handleEditSave = () => {
    if (!editTarget || !editForm.name.trim()) return;
    const updated = allStudents.map((s) =>
      s.id === editTarget.id
        ? {
            ...s,
            name: editForm.name.trim(),
            fatherName: editForm.fatherName.trim(),
            parentMobile: editForm.parentMobile.trim(),
            className: editForm.className,
            teacherName: editForm.teacherName,
            fees: Number(editForm.fees) || 0,
            feesStatus: editForm.feesStatus,
          }
        : s,
    );
    saveStudents(updated);
    setAllStudents(updated);
    setEditTarget(null);
    toast.success("Student updated successfully");
  };

  const handleDelete = (id: string) => {
    const updated = allStudents.filter((s) => s.id !== id);
    saveStudents(updated);
    setAllStudents(updated);
    setDeleteTarget(null);
    toast.success("Student removed");
  };

  const isAdmin = session.role === "admin";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 page-enter" data-ocid="students.page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              Students
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {session.role === "teacher"
                ? `${session.teacherClass} — your class`
                : session.role === "parent"
                  ? "Your child's profile"
                  : "Manage all enrolled students"}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button
            type="button"
            className="btn-gold gap-2 flex-shrink-0 font-semibold shadow-sm"
            onClick={() => setShowAddModal(true)}
            data-ocid="students.add_student_button"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </Button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card-base rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-foreground leading-tight">
              {scopedStudents.length}
            </p>
          </div>
        </div>
        <div className="card-base rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-success block" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fees Paid</p>
            <p className="text-lg font-bold text-foreground leading-tight">
              {paidCount}
            </p>
          </div>
        </div>
        <div className="card-base rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-destructive block" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-bold text-foreground leading-tight">
              {pendingCount}
            </p>
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by name, father name, or mobile..."
            className="pl-9 h-10 border-border/70 focus:border-primary/50 transition-colors duration-200"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            data-ocid="students.search_input"
          />
        </div>
        {session.role !== "parent" && (
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
            <Select value={classFilter} onValueChange={handleClassChange}>
              <SelectTrigger
                className="w-44 pl-8 h-10 border-border/70"
                data-ocid="students.class_filter.select"
              >
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                {allClassFilters.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Summary row */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filtered.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {scopedStudents.length}
          </span>{" "}
          students
          {search && (
            <span className="ml-1 text-primary font-medium">
              for &ldquo;{search}&rdquo;
            </span>
          )}
        </span>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-xs font-medium gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
            {paidCount} Paid
          </Badge>
          <Badge
            variant="outline"
            className="text-xs font-medium gap-1 text-destructive border-destructive/30"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block" />
            {pendingCount} Pending
          </Badge>
        </div>
      </div>

      {/* Table */}
      <Card
        className="card-elevated border-border/60 overflow-hidden rounded-xl"
        data-ocid="students.table"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground w-10 text-xs uppercase tracking-wide">
                  #
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Student
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Father Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Mobile
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden md:table-cell">
                  Class
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">
                  Ustaad
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Fees
                </th>
                {isAdmin && (
                  <th className="px-4 py-3 text-center font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={isAdmin ? 8 : 7}
                    className="px-4 py-16 text-center"
                    data-ocid="students.empty_state"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center">
                        <UserCircle2 className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          No students found
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {search || classFilter !== "All Classes"
                            ? "Try adjusting your search or filters"
                            : isAdmin
                              ? "Add your first student to get started"
                              : "No students in your class yet"}
                        </p>
                      </div>
                      {(search || classFilter !== "All Classes") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearch("");
                            setClassFilter("All Classes");
                          }}
                          className="text-xs"
                        >
                          Clear filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((student, i) => {
                  const rowIndex = (page - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr
                      key={student.id}
                      className="border-b border-border/40 odd:bg-background even:bg-muted/15 hover:bg-primary/5 transition-colors duration-150 group"
                      data-ocid={`students.item.${rowIndex}`}
                    >
                      <td className="px-4 py-3.5 text-muted-foreground text-xs font-mono">
                        {String(rowIndex).padStart(2, "0")}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20 group-hover:border-primary/40 transition-colors duration-150">
                            <span className="text-xs font-bold text-primary">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <p className="font-semibold text-foreground truncate leading-tight">
                            {student.name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-sm">
                        {student.fatherName || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />
                          <span className="font-mono text-xs text-muted-foreground">
                            {student.parentMobile || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/8 border border-primary/15 text-primary text-xs font-medium">
                          {student.className}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-sm hidden lg:table-cell">
                        {student.teacherName}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`fee-badge ${student.feesStatus === "paid" ? "fee-paid" : "fee-pending"}`}
                        >
                          {student.feesStatus === "paid" ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-success inline-block mr-1.5" />
                              Paid
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-destructive inline-block mr-1.5" />
                              Pending
                            </>
                          )}
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-150"
                              title="View"
                              data-ocid={`students.view_button.${rowIndex}`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors duration-150"
                              title="Edit"
                              onClick={() => handleEditOpen(student)}
                              data-ocid={`students.edit_button.${rowIndex}`}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150"
                              title="Delete"
                              onClick={() => setDeleteTarget(student.id)}
                              data-ocid={`students.delete_button.${rowIndex}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-muted/20">
            <span className="text-xs text-muted-foreground">
              Page <span className="font-semibold text-foreground">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalPages}
              </span>
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 gap-1 text-xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                data-ocid="students.pagination_prev"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, k) => {
                const pg =
                  totalPages <= 5 ? k + 1 : page <= 3 ? k + 1 : page + k - 2;
                if (pg < 1 || pg > totalPages) return null;
                return (
                  <Button
                    key={pg}
                    type="button"
                    variant={pg === page ? "default" : "outline"}
                    size="sm"
                    className={`h-8 w-8 p-0 text-xs ${pg === page ? "btn-green pointer-events-none" : ""}`}
                    onClick={() => setPage(pg)}
                  >
                    {pg}
                  </Button>
                );
              })}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-3 gap-1 text-xs"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                data-ocid="students.pagination_next"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Add Student Modal ──────────────────────────────────────────────── */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent
          className="max-w-md w-full"
          data-ocid="students.add_modal.dialog"
        >
          <div className="gold-shimmer -mx-6 -mt-6 mb-2 rounded-t-lg" />
          <DialogHeader className="pt-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Add New Student
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="add-name" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="add-name"
                  placeholder="e.g. Ahmed Ibrahim"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.name.input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="add-father" className="text-sm font-medium">
                  Father Name
                </Label>
                <Input
                  id="add-father"
                  placeholder="e.g. Ibrahim Ali"
                  value={form.fatherName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fatherName: e.target.value }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.father_name.input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="add-mobile" className="text-sm font-medium">
                  Parent Mobile
                </Label>
                <Input
                  id="add-mobile"
                  placeholder="10-digit mobile number"
                  value={form.parentMobile}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, parentMobile: e.target.value }))
                  }
                  className="mt-1.5 font-mono border-border/70 focus:border-primary/50"
                  data-ocid="students.mobile.input"
                />
              </div>
              <div>
                <Label htmlFor="add-class" className="text-sm font-medium">
                  Class <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.className}
                  onValueChange={(v) => {
                    const teacherName = resolveTeacher(v);
                    setForm((f) => ({ ...f, className: v, teacherName }));
                  }}
                >
                  <SelectTrigger
                    id="add-class"
                    className="mt-1.5"
                    data-ocid="students.class.select"
                  >
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="add-teacher" className="text-sm font-medium">
                  Ustaad
                </Label>
                <Input
                  id="add-teacher"
                  value={form.teacherName}
                  readOnly
                  placeholder="Auto-filled"
                  className="mt-1.5 border-border/70 bg-muted/40 text-muted-foreground cursor-default"
                  data-ocid="students.teacher.input"
                />
              </div>
              <div>
                <Label htmlFor="add-fees" className="text-sm font-medium">
                  Monthly Fees (₹)
                </Label>
                <Input
                  id="add-fees"
                  type="number"
                  min="0"
                  placeholder="1000"
                  value={form.fees}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fees: e.target.value }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.fees.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="add-fees-status"
                  className="text-sm font-medium"
                >
                  Fees Status
                </Label>
                <Select
                  value={form.feesStatus}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      feesStatus: v as "paid" | "pending",
                    }))
                  }
                >
                  <SelectTrigger
                    id="add-fees-status"
                    className="mt-1.5"
                    data-ocid="students.fees_status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(defaultForm);
                setShowAddModal(false);
              }}
              data-ocid="students.add_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="btn-gold"
              onClick={handleAdd}
              disabled={!form.name.trim() || !form.className}
              data-ocid="students.add_modal.submit_button"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Student Modal ─────────────────────────────────────────────── */}
      <Dialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent
          className="max-w-md w-full"
          data-ocid="students.edit_modal.dialog"
        >
          <div className="gold-shimmer -mx-6 -mt-6 mb-2 rounded-t-lg" />
          <DialogHeader className="pt-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                <Pencil className="w-4 h-4 text-gold" />
              </div>
              <DialogTitle className="text-lg font-bold text-foreground">
                Edit Student
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.edit.name.input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-father" className="text-sm font-medium">
                  Father Name
                </Label>
                <Input
                  id="edit-father"
                  value={editForm.fatherName}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, fatherName: e.target.value }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.edit.father_name.input"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-mobile" className="text-sm font-medium">
                  Parent Mobile
                </Label>
                <Input
                  id="edit-mobile"
                  value={editForm.parentMobile}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      parentMobile: e.target.value,
                    }))
                  }
                  className="mt-1.5 font-mono border-border/70 focus:border-primary/50"
                  data-ocid="students.edit.mobile.input"
                />
              </div>
              <div>
                <Label htmlFor="edit-class" className="text-sm font-medium">
                  Class
                </Label>
                <Select
                  value={editForm.className}
                  onValueChange={(v) => {
                    const teacherName = resolveTeacher(v);
                    setEditForm((f) => ({
                      ...f,
                      className: v,
                      teacherName,
                    }));
                  }}
                >
                  <SelectTrigger
                    id="edit-class"
                    className="mt-1.5"
                    data-ocid="students.edit.class.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-teacher" className="text-sm font-medium">
                  Ustaad
                </Label>
                <Input
                  id="edit-teacher"
                  value={editForm.teacherName}
                  readOnly
                  className="mt-1.5 border-border/70 bg-muted/40 text-muted-foreground cursor-default"
                  data-ocid="students.edit.teacher.input"
                />
              </div>
              <div>
                <Label htmlFor="edit-fees" className="text-sm font-medium">
                  Monthly Fees (₹)
                </Label>
                <Input
                  id="edit-fees"
                  type="number"
                  min="0"
                  value={editForm.fees}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, fees: e.target.value }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.edit.fees.input"
                />
              </div>
              <div>
                <Label
                  htmlFor="edit-fees-status"
                  className="text-sm font-medium"
                >
                  Fees Status
                </Label>
                <Select
                  value={editForm.feesStatus}
                  onValueChange={(v) =>
                    setEditForm((f) => ({
                      ...f,
                      feesStatus: v as "paid" | "pending",
                    }))
                  }
                >
                  <SelectTrigger
                    id="edit-fees-status"
                    className="mt-1.5"
                    data-ocid="students.edit.fees_status.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditTarget(null)}
              data-ocid="students.edit_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="btn-gold"
              onClick={handleEditSave}
              disabled={!editForm.name.trim()}
              data-ocid="students.edit_modal.save_button"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ─────────────────────────────────────── */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="students.delete_modal.dialog"
        >
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Remove Student?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This will permanently remove the student from the list. This action
            cannot be undone.
          </p>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              data-ocid="students.delete_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              data-ocid="students.delete_modal.confirm_button"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
