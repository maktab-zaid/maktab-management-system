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
  addActivityLogEntry,
  createId,
  getStudents,
  getTeachers,
  saveStudents,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { STUDENT_CLASS_OPTIONS } from "@/types/index";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Filter,
  MessageCircle,
  Moon,
  Pencil,
  Phone,
  Plus,
  Search,
  Sun,
  Trash2,
  UserCircle2,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface StudentsPageProps {
  session: Session;
  onNavigate?: (page: AppPage) => void;
}

const PAGE_SIZE = 10;

// No hardcoded teacher names — all teachers come from Admin-managed storage.

const SESSION_LIST = ["Morning", "Afternoon", "Evening"] as const;
type SessionType = (typeof SESSION_LIST)[number];

const defaultForm = {
  name: "",
  fatherName: "",
  parentMobile: "",
  timeSlot: "" as SessionType | "",
  teacherName: "",
  address: "",
  rollNumber: "",
  admissionDate: "",
  fees: "1000",
  feesStatus: "pending" as "paid" | "pending",
  studentClass: "",
};

type FormState = typeof defaultForm;

function sessionLabel(slot: string | undefined): string {
  if (!slot) return "—";
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

function SessionBadge({ slot }: { slot?: string }) {
  if (!slot) return <span className="text-muted-foreground text-xs">—</span>;
  const lower = slot.toLowerCase();
  if (lower === "morning")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-medium dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-400">
        <Sun className="w-3 h-3" />
        Morning
      </span>
    );
  if (lower === "afternoon")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-400">
        <Clock className="w-3 h-3" />
        Afternoon
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-medium dark:bg-indigo-950/20 dark:border-indigo-800 dark:text-indigo-400">
      <Moon className="w-3 h-3" />
      Evening
    </span>
  );
}

// Resolve teachers for a given session from storage only (no hardcoded fallback)
function getUstaadsForSession(
  teachers: Teacher[],
  session: SessionType | "",
): string[] {
  if (!session) return [];
  return teachers
    .filter((t) => {
      const ts = t.timeSlot ?? "";
      const tsStr = Array.isArray(ts) ? ts.join(",") : ts;
      return tsStr.toLowerCase().includes(session.toLowerCase());
    })
    .map((t) => t.name);
}

export default function StudentsPage({
  session,
  onNavigate,
}: StudentsPageProps) {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState<string>("All Sessions");
  const [page, setPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editForm, setEditForm] = useState<FormState>(defaultForm);
  const [addedStudentWa, setAddedStudentWa] = useState<{
    name: string;
    mobile: string;
    timeSlot: string;
  } | null>(null);

  useEffect(() => {
    setAllStudents(getStudents());
    setTeachers(getTeachers());
  }, []);

  const isAdmin = session.role === "admin";
  const isTeacher = session.role === "teacher";
  const canManage = isAdmin || isTeacher;

  // Role-scoped student list
  const scopedStudents =
    session.role === "parent"
      ? allStudents.filter((s) => s.parentMobile === session.mobile)
      : isTeacher && session.teacherTimeSlot
        ? allStudents.filter(
            (s) =>
              s.timeSlot?.toLowerCase() ===
              session.teacherTimeSlot?.toLowerCase(),
          )
        : allStudents;

  const allSessionFilters = ["All Sessions", ...SESSION_LIST] as const;

  // Filtered list
  const filtered = scopedStudents.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.fatherName.toLowerCase().includes(q) ||
      s.parentMobile.includes(q);
    const matchSession =
      sessionFilter === "All Sessions" ||
      (s.timeSlot ?? "").toLowerCase() === sessionFilter.toLowerCase();
    return matchSearch && matchSession;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const paidCount = scopedStudents.filter(
    (s) => s.feesStatus === "paid",
  ).length;
  const pendingCount = scopedStudents.filter(
    (s) => s.feesStatus === "pending",
  ).length;

  // Ustaads available for the form's currently selected session
  const addFormUstaads = getUstaadsForSession(
    teachers,
    form.timeSlot as SessionType | "",
  );
  const editFormUstaads = getUstaadsForSession(
    teachers,
    editForm.timeSlot as SessionType | "",
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleAdd = () => {
    if (!form.name.trim() || !form.timeSlot) return;
    const newStudent: Student = {
      id: createId(),
      name: form.name.trim(),
      fatherName: form.fatherName.trim(),
      parentMobile: form.parentMobile.trim(),
      className: form.timeSlot,
      teacherName: form.teacherName,
      fees: Number(form.fees) || 0,
      feesStatus: form.feesStatus,
      timeSlot: form.timeSlot.toLowerCase() as
        | "morning"
        | "afternoon"
        | "evening",
      address: form.address.trim(),
      rollNumber: form.rollNumber.trim(),
      admissionDate: form.admissionDate,
      studentClass: form.studentClass,
    };
    const updated = [newStudent, ...allStudents];
    saveStudents(updated);
    setAllStudents(updated);

    // Activity log
    const actor = isTeacher ? session.name : "Admin";
    addActivityLogEntry({
      actorName: actor,
      actorRole: isTeacher ? "ustaad" : "admin",
      action: "added_student",
      targetStudentName: newStudent.name,
      details: `Session: ${form.timeSlot}`,
    });

    setForm(defaultForm);
    setShowAddModal(false);
    setPage(1);
    toast.success(`${newStudent.name} added successfully`);
    // Show WhatsApp notification option
    setAddedStudentWa({
      name: newStudent.name,
      mobile: newStudent.parentMobile,
      timeSlot: form.timeSlot,
    });
  };

  const handleEditOpen = (student: Student) => {
    setEditTarget(student);
    setEditForm({
      name: student.name,
      fatherName: student.fatherName,
      parentMobile: student.parentMobile,
      timeSlot: (sessionLabel(student.timeSlot) as SessionType) || "",
      teacherName: student.teacherName,
      address: student.address ?? "",
      rollNumber: student.rollNumber ?? "",
      admissionDate: student.admissionDate ?? "",
      fees: String(student.fees),
      feesStatus: student.feesStatus,
      studentClass: student.studentClass ?? "",
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
            className: editForm.timeSlot,
            teacherName: editForm.teacherName,
            fees: Number(editForm.fees) || 0,
            feesStatus: editForm.feesStatus,
            timeSlot: (editForm.timeSlot
              ? editForm.timeSlot.toLowerCase()
              : s.timeSlot) as string,
            address: editForm.address.trim(),
            rollNumber: editForm.rollNumber.trim(),
            admissionDate: editForm.admissionDate,
            studentClass: editForm.studentClass,
          }
        : s,
    );
    saveStudents(updated);
    setAllStudents(updated);
    setEditTarget(null);
    addActivityLogEntry({
      actorName: isTeacher ? session.name : "Admin",
      actorRole: isTeacher ? "ustaad" : "admin",
      action: "updated_student",
      targetStudentName: editForm.name.trim(),
    });
    toast.success("Student updated successfully");
  };

  const handleDelete = (id: string, name: string) => {
    const updated = allStudents.filter((s) => s.id !== id);
    saveStudents(updated);
    setAllStudents(updated);
    setDeleteTarget(null);
    addActivityLogEntry({
      actorName: isTeacher ? session.name : "Admin",
      actorRole: isTeacher ? "ustaad" : "admin",
      action: "removed_student",
      targetStudentName: name,
    });
    toast.success("Student removed");
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 page-enter" data-ocid="students.page">
      {/* Back button */}
      {onNavigate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("dashboard")}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          data-ocid="students.back_button"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
      )}

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
                ? `${sessionLabel(session.teacherTimeSlot)} session — your students`
                : session.role === "parent"
                  ? "Your child's profile"
                  : "Manage all enrolled students"}
            </p>
          </div>
        </div>
        {canManage && (
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
      {/* WhatsApp notification after student add */}
      {addedStudentWa && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30"
          data-ocid="students.add_whatsapp_notification"
        >
          <MessageCircle className="w-5 h-5 text-[#25D366] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {addedStudentWa.name} added
            </p>
            <p className="text-xs text-muted-foreground">
              Notify parent via WhatsApp?
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`https://wa.me/91${addedStudentWa.mobile}?text=${encodeURIComponent(`Assalamualaikum, ${addedStudentWa.name} ka Maktab Zaid Bin Sabit mein daakhila ho gaya. Session: ${addedStudentWa.timeSlot}. - Maktab Zaid Bin Sabit`)}`}
              target="_blank"
              rel="noopener noreferrer"
              data-ocid="students.add_whatsapp_button"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Send
            </a>
            <button
              type="button"
              onClick={() => setAddedStudentWa(null)}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-xs"
              aria-label="Dismiss"
              data-ocid="students.add_whatsapp_dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            data-ocid="students.search_input"
          />
        </div>
        {session.role !== "parent" && (
          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
            <Select
              value={sessionFilter}
              onValueChange={(v) => {
                setSessionFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger
                className="w-44 pl-8 h-10 border-border/70"
                data-ocid="students.session_filter.select"
              >
                <SelectValue placeholder="All Sessions" />
              </SelectTrigger>
              <SelectContent>
                {allSessionFilters.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
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
                  Session
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">
                  Class
                </th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide hidden lg:table-cell">
                  Ustaad
                </th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                  Fees
                </th>
                {canManage && (
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
                    colSpan={canManage ? 9 : 8}
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
                          {search || sessionFilter !== "All Sessions"
                            ? "Try adjusting your search or filters"
                            : canManage
                              ? "Add your first student to get started"
                              : "No students in your session yet"}
                        </p>
                      </div>
                      {(search || sessionFilter !== "All Sessions") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearch("");
                            setSessionFilter("All Sessions");
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
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground truncate leading-tight">
                              {student.name}
                            </p>
                            {student.rollNumber && (
                              <p className="text-xs text-muted-foreground">
                                Roll #{student.rollNumber}
                              </p>
                            )}
                          </div>
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
                        <SessionBadge slot={student.timeSlot} />
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-xs hidden lg:table-cell">
                        {student.studentClass || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-muted-foreground text-sm hidden lg:table-cell">
                        {student.teacherName || "—"}
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
                      {canManage && (
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
                              onClick={() =>
                                setDeleteTarget({
                                  id: student.id,
                                  name: student.name,
                                })
                              }
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
          className="max-w-lg w-full max-h-[90vh] overflow-y-auto"
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
                  Mobile Number
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
                <Label className="text-sm font-medium">
                  Session <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.timeSlot}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      timeSlot: v as SessionType,
                      teacherName: "",
                    }))
                  }
                >
                  <SelectTrigger
                    className="mt-1.5"
                    data-ocid="students.session.select"
                  >
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_LIST.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Ustaad</Label>
                <Select
                  value={form.teacherName}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, teacherName: v }))
                  }
                  disabled={!form.timeSlot}
                >
                  <SelectTrigger
                    className="mt-1.5"
                    data-ocid="students.teacher.select"
                  >
                    <SelectValue
                      placeholder={
                        form.timeSlot ? "Select Ustaad" : "Select session first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {addFormUstaads.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="add-address" className="text-sm font-medium">
                  Address
                </Label>
                <Input
                  id="add-address"
                  placeholder="e.g. 123 Main Street"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.address.input"
                />
              </div>
              <div>
                <Label htmlFor="add-roll" className="text-sm font-medium">
                  Roll Number
                </Label>
                <Input
                  id="add-roll"
                  placeholder="e.g. 042"
                  value={form.rollNumber}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rollNumber: e.target.value }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.roll_number.input"
                />
              </div>
              <div>
                <Label htmlFor="add-admission" className="text-sm font-medium">
                  Admission Date
                </Label>
                <Input
                  id="add-admission"
                  type="date"
                  value={form.admissionDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, admissionDate: e.target.value }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.admission_date.input"
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
              <div className="col-span-2">
                <Label className="text-sm font-medium">Class / Level</Label>
                <Select
                  value={form.studentClass}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, studentClass: v }))
                  }
                >
                  <SelectTrigger
                    className="mt-1.5"
                    data-ocid="students.class.select"
                  >
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDENT_CLASS_OPTIONS.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
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
              disabled={!form.name.trim() || !form.timeSlot}
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
          className="max-w-lg w-full max-h-[90vh] overflow-y-auto"
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
                  Mobile Number
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
                <Label className="text-sm font-medium">Session</Label>
                <Select
                  value={editForm.timeSlot}
                  onValueChange={(v) =>
                    setEditForm((f) => ({
                      ...f,
                      timeSlot: v as SessionType,
                      teacherName: "",
                    }))
                  }
                >
                  <SelectTrigger
                    className="mt-1.5"
                    data-ocid="students.edit.session.select"
                  >
                    <SelectValue placeholder="Select session" />
                  </SelectTrigger>
                  <SelectContent>
                    {SESSION_LIST.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Ustaad</Label>
                <Select
                  value={editForm.teacherName}
                  onValueChange={(v) =>
                    setEditForm((f) => ({ ...f, teacherName: v }))
                  }
                  disabled={!editForm.timeSlot}
                >
                  <SelectTrigger
                    className="mt-1.5"
                    data-ocid="students.edit.teacher.select"
                  >
                    <SelectValue placeholder="Select Ustaad" />
                  </SelectTrigger>
                  <SelectContent>
                    {editFormUstaads.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="edit-address" className="text-sm font-medium">
                  Address
                </Label>
                <Input
                  id="edit-address"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, address: e.target.value }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.edit.address.input"
                />
              </div>
              <div>
                <Label htmlFor="edit-roll" className="text-sm font-medium">
                  Roll Number
                </Label>
                <Input
                  id="edit-roll"
                  value={editForm.rollNumber}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, rollNumber: e.target.value }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.edit.roll_number.input"
                />
              </div>
              <div>
                <Label htmlFor="edit-admission" className="text-sm font-medium">
                  Admission Date
                </Label>
                <Input
                  id="edit-admission"
                  type="date"
                  value={editForm.admissionDate}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      admissionDate: e.target.value,
                    }))
                  }
                  className="mt-1.5 border-border/70 focus:border-primary/50"
                  data-ocid="students.edit.admission_date.input"
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
              <div className="col-span-2">
                <Label className="text-sm font-medium">Class / Level</Label>
                <Select
                  value={editForm.studentClass}
                  onValueChange={(v) =>
                    setEditForm((f) => ({ ...f, studentClass: v }))
                  }
                >
                  <SelectTrigger
                    className="mt-1.5"
                    data-ocid="students.edit.class.select"
                  >
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDENT_CLASS_OPTIONS.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
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
            This will permanently remove{" "}
            <span className="font-semibold text-foreground">
              {deleteTarget?.name}
            </span>{" "}
            from the list. This action cannot be undone.
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
              onClick={() =>
                deleteTarget && handleDelete(deleteTarget.id, deleteTarget.name)
              }
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
