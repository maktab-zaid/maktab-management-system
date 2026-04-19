import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type SabakRecord,
  type Session,
  type Student,
  createId,
  getSabak,
  getStudents,
  saveSabak,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { ArrowLeft, BookOpen, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

export interface SabakPageProps {
  session: Session;
  setActivePage?: (page: AppPage) => void;
}

// ── 7 manual sabak sections ───────────────────────────────────────────────────

const SABAK_SECTIONS = [
  {
    key: "qaida" as const,
    label: "Qaida",
    emoji: "📗",
    placeholder: "Enter Qaida progress...",
  },
  {
    key: "ammaPara" as const,
    label: "Amma Para",
    emoji: "📙",
    placeholder: "Enter Amma Para progress...",
  },
  {
    key: "quran" as const,
    label: "Quran",
    emoji: "📖",
    placeholder: "Enter Quran progress...",
  },
  {
    key: "dua" as const,
    label: "Dua",
    emoji: "🤲",
    placeholder: "Enter Dua progress...",
  },
  {
    key: "hadees" as const,
    label: "Hadees",
    emoji: "📿",
    placeholder: "Enter Hadees progress...",
  },
  {
    key: "urdu" as const,
    label: "Urdu",
    emoji: "📚",
    placeholder: "Enter Urdu progress...",
  },
  {
    key: "hifz" as const,
    label: "Hifz",
    emoji: "🌙",
    placeholder: "Enter Hifz progress...",
  },
] as const;

type SabakKey =
  | "qaida"
  | "ammaPara"
  | "quran"
  | "dua"
  | "hadees"
  | "urdu"
  | "hifz";

interface SabakFormData {
  studentId: string;
  qaida: string;
  ammaPara: string;
  quran: string;
  dua: string;
  hadees: string;
  urdu: string;
  hifz: string;
}

const EMPTY_FORM: SabakFormData = {
  studentId: "",
  qaida: "",
  ammaPara: "",
  quran: "",
  dua: "",
  hadees: "",
  urdu: "",
  hifz: "",
};

function getSessionLabel(slot?: string): string {
  if (!slot) return "—";
  return slot.charAt(0).toUpperCase() + slot.slice(1);
}

// ── Student Sabak Card ────────────────────────────────────────────────────────

interface SabakCardProps {
  student: Student;
  record: SabakRecord | null;
  index: number;
  canEdit: boolean;
  onEdit: (student: Student, record: SabakRecord | null) => void;
}

function SabakCard({
  student,
  record,
  index,
  canEdit,
  onEdit,
}: SabakCardProps) {
  const hasAny =
    record && SABAK_SECTIONS.some((s) => record[s.key as SabakKey]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.38,
        delay: index * 0.07,
        ease: [0.34, 1.56, 0.64, 1],
      }}
      data-ocid={`sabak.item.${index + 1}`}
    >
      <Card
        className="overflow-hidden card-elevated"
        style={{ borderLeft: "3px solid oklch(0.75 0.18 75)" }}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate text-sm">
                {student.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {getSessionLabel(student.timeSlot)}
                {student.teacherName && ` · ${student.teacherName}`}
              </p>
              {student.studentClass && (
                <p className="text-xs text-primary font-medium mt-0.5">
                  {student.studentClass}
                </p>
              )}
            </div>
            {canEdit && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1 shrink-0"
                onClick={() => onEdit(student, record)}
                data-ocid={`sabak.edit_button.${index + 1}`}
              >
                <BookOpen className="w-3 h-3" />
                Update
              </Button>
            )}
          </div>

          {/* Sections grid */}
          <div
            className="mx-4 mb-4 rounded-lg overflow-hidden border"
            style={{ borderColor: "oklch(0.90 0.02 145)" }}
          >
            {SABAK_SECTIONS.map((sec, si) => {
              const value = record ? record[sec.key as SabakKey] : undefined;
              return (
                <div
                  key={sec.key}
                  className={`flex items-center gap-3 px-3 py-2.5 ${si < SABAK_SECTIONS.length - 1 ? "border-b" : ""}`}
                  style={{
                    borderColor: "oklch(0.90 0.02 145)",
                    background:
                      si % 2 === 0 ? "oklch(0.97 0.005 145)" : "white",
                  }}
                  data-ocid={`sabak.section.${sec.key}.${index + 1}`}
                >
                  <span
                    className="text-base w-5 shrink-0 text-center"
                    aria-hidden="true"
                  >
                    {sec.emoji}
                  </span>
                  <span className="text-xs font-semibold w-20 shrink-0 text-foreground">
                    {sec.label}
                  </span>
                  <span className="text-xs text-foreground flex-1 min-w-0 truncate">
                    {value ? (
                      value
                    ) : (
                      <span className="text-muted-foreground italic">
                        Not recorded
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {!hasAny && (
            <div
              className="mx-4 mb-4 px-3 py-2 rounded-md text-xs text-muted-foreground italic"
              style={{ background: "oklch(0.95 0.015 145)" }}
            >
              No sabak records yet.
            </div>
          )}

          {record && (
            <div
              className="px-4 py-2 flex items-center justify-between border-t text-xs text-muted-foreground"
              style={{ borderColor: "oklch(0.90 0.02 145)" }}
            >
              <span>
                Updated by {record.updatedBy} · {record.updatedAt}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Update Modal ──────────────────────────────────────────────────────────────

interface UpdateModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SabakFormData) => void;
  initial: SabakFormData;
  students: Student[];
  isEdit: boolean;
}

function UpdateSabakModal({
  open,
  onClose,
  onSubmit,
  initial,
  students,
  isEdit,
}: UpdateModalProps) {
  const [form, setForm] = useState<SabakFormData>(initial);
  const [lastInitial, setLastInitial] = useState<SabakFormData>(initial);
  if (lastInitial !== initial) {
    setLastInitial(initial);
    setForm(initial);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.studentId) {
      toast.error("Please select a student");
      return;
    }
    onSubmit(form);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg w-full max-h-[90vh] overflow-y-auto"
        data-ocid="sabak.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {isEdit ? "Update Sabak Record" : "Add Sabak Record"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          {/* Student */}
          <div className="space-y-1.5">
            <Label htmlFor="sabak-student">Student</Label>
            <select
              id="sabak-student"
              value={form.studentId}
              onChange={(e) =>
                setForm((p) => ({ ...p, studentId: e.target.value }))
              }
              required
              disabled={isEdit}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
              data-ocid="sabak.select"
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {getSessionLabel(s.timeSlot)}
                </option>
              ))}
            </select>
          </div>

          {/* 7 manual section inputs */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Sabak Sections
            </p>
            {SABAK_SECTIONS.map((sec) => (
              <div key={sec.key} className="space-y-1">
                <Label
                  htmlFor={`sabak-${sec.key}`}
                  className="text-sm flex items-center gap-1.5"
                >
                  <span aria-hidden="true">{sec.emoji}</span>
                  {sec.label}
                </Label>
                <Input
                  id={`sabak-${sec.key}`}
                  placeholder={sec.placeholder}
                  value={form[sec.key as SabakKey]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [sec.key]: e.target.value }))
                  }
                  data-ocid={`sabak.${sec.key}_input`}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="sabak.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-green"
              data-ocid="sabak.submit_button"
            >
              Save Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SabakPage({ session, setActivePage }: SabakPageProps) {
  const allStudents = getStudents();
  const allSabak = getSabak();

  // Teacher sees only students in their assigned time slot
  const visibleStudents: Student[] =
    session.role === "admin"
      ? allStudents
      : session.role === "teacher"
        ? allStudents.filter(
            (s) =>
              s.teacherName === session.name ||
              (session.teacherTimeSlot &&
                s.timeSlot === session.teacherTimeSlot) ||
              session.teacherSessions
                ?.map((x) => x.toLowerCase())
                .includes((s.timeSlot ?? "").toLowerCase()) === true,
          )
        : (() => {
            const child = allStudents.find(
              (s) => s.parentMobile === session.mobile,
            );
            return child ? [child] : [];
          })();

  const visibleStudentIds = new Set(visibleStudents.map((s) => s.id));

  // Get latest combined sabak record per student
  function getLatestSabakForStudent(studentId: string): SabakRecord | null {
    const recs = allSabak.filter(
      (r) =>
        r.studentId === studentId &&
        (r.qaida ||
          r.ammaPara ||
          r.quran ||
          r.dua ||
          r.hadees ||
          r.urdu ||
          r.hifz),
    );
    if (recs.length === 0) return null;
    return recs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  }

  const [records, setRecords] = useState<SabakRecord[]>(() =>
    allSabak.filter((r) => visibleStudentIds.has(r.studentId)),
  );
  const [filterStudent, setFilterStudent] = useState<string>("all");
  const [filterSession, setFilterSession] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<{
    student: Student;
    record: SabakRecord | null;
  } | null>(null);

  const canEdit = session.role === "admin" || session.role === "teacher";

  // All entries: one per visible student
  const allEntries = visibleStudents;

  // Apply filters
  const sessionFilteredEntries =
    filterSession === "all"
      ? allEntries
      : allEntries.filter(
          (s) =>
            (s.timeSlot ?? "").toLowerCase() === filterSession.toLowerCase(),
        );

  const filteredEntries =
    filterStudent === "all"
      ? sessionFilteredEntries
      : sessionFilteredEntries.filter((s) => s.id === filterStudent);

  const studentNames = sessionFilteredEntries.map((s) => ({
    id: s.id,
    name: s.name,
  }));

  const totalWithRecords = allEntries.filter(
    (s) => getLatestSabakForStudent(s.id) !== null,
  ).length;

  function openAddModal() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEditModal(student: Student, record: SabakRecord | null) {
    setEditTarget({ student, record });
    setModalOpen(true);
  }

  function buildInitialForm(): SabakFormData {
    if (editTarget?.record) {
      const rec = editTarget.record;
      return {
        studentId: rec.studentId,
        qaida: rec.qaida ?? "",
        ammaPara: rec.ammaPara ?? "",
        quran: rec.quran ?? "",
        dua: rec.dua ?? "",
        hadees: rec.hadees ?? "",
        urdu: rec.urdu ?? "",
        hifz: rec.hifz ?? "",
      };
    }
    return {
      ...EMPTY_FORM,
      studentId: editTarget?.student?.id ?? "",
    };
  }

  function handleSave(data: SabakFormData) {
    const student = visibleStudents.find((s) => s.id === data.studentId);
    if (!student) return;

    const existing = allSabak.find(
      (r) =>
        r.studentId === data.studentId &&
        (r.qaida !== undefined ||
          r.ammaPara !== undefined ||
          r.quran !== undefined),
    );

    const newRecord: SabakRecord = {
      id: existing?.id ?? createId(),
      studentId: student.id,
      studentName: student.name,
      remarks: "",
      updatedBy: session.name,
      updatedAt: new Date().toISOString().slice(0, 10),
      qaida: data.qaida || undefined,
      ammaPara: data.ammaPara || undefined,
      quran: data.quran || undefined,
      dua: data.dua || undefined,
      hadees: data.hadees || undefined,
      urdu: data.urdu || undefined,
      hifz: data.hifz || undefined,
    };

    const allStored = getSabak();
    let updatedAll: SabakRecord[];
    if (existing) {
      updatedAll = allStored.map((r) => (r.id === existing.id ? newRecord : r));
    } else {
      updatedAll = [newRecord, ...allStored];
    }
    saveSabak(updatedAll);

    setRecords(updatedAll.filter((r) => visibleStudentIds.has(r.studentId)));
    toast.success("Sabak record saved successfully");
    setEditTarget(null);
  }

  return (
    <div className="space-y-6 page-enter" data-ocid="sabak.page">
      {setActivePage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActivePage("dashboard")}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          data-ocid="sabak.back_button"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      )}

      {/* Page Header */}
      <motion.div
        className="flex items-center justify-between gap-3 flex-wrap"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-xl font-bold text-foreground">Sabak Progress</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {session.role === "parent"
              ? "Your child's Islamic studies progress"
              : "Track sabak progress for each student across 7 sections"}
          </p>
        </div>
        {canEdit && (
          <Button
            className="btn-green gap-2 shrink-0"
            onClick={openAddModal}
            data-ocid="sabak.open_modal_button"
          >
            <BookOpen className="w-4 h-4" />
            Add / Update Sabak
          </Button>
        )}
      </motion.div>

      {/* Section legend */}
      <div className="flex flex-wrap gap-2" data-ocid="sabak.legend">
        {SABAK_SECTIONS.map((sec) => (
          <span
            key={sec.key}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border"
            style={{
              background: "oklch(0.95 0.01 145)",
              borderColor: "oklch(0.85 0.04 145)",
              color: "oklch(0.35 0.10 145)",
            }}
          >
            {sec.emoji} {sec.label}
          </span>
        ))}
      </div>

      {/* Stats Row (admin/teacher only) */}
      {session.role !== "parent" && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-ocid="sabak.stats"
        >
          {[
            {
              id: "learners",
              icon: <Users className="w-5 h-5 text-primary" />,
              iconBg: "bg-primary/10",
              value: totalWithRecords,
              label: "Students with Records",
            },
            {
              id: "total",
              icon: <BookOpen className="w-5 h-5 text-emerald-600" />,
              iconBg: "bg-emerald-50",
              value: visibleStudents.length,
              label: "Total Visible Students",
            },
          ].map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card className="card-elevated stat-card-hover border-border/60">
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center shrink-0`}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      {canEdit && (
        <motion.div
          className="flex items-center gap-3 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          data-ocid="sabak.filter"
        >
          {/* Session filter (admin only) */}
          {session.role === "admin" && (
            <select
              value={filterSession}
              onChange={(e) => {
                setFilterSession(e.target.value);
                setFilterStudent("all");
              }}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[170px]"
              data-ocid="sabak.session_filter"
              aria-label="Filter by session"
            >
              <option value="all">All Sessions ({allEntries.length})</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          )}

          {/* Student name filter */}
          {studentNames.length > 1 && (
            <>
              <label
                htmlFor="sabak-filter"
                className="text-sm font-medium text-foreground shrink-0"
              >
                Student:
              </label>
              <select
                id="sabak-filter"
                value={filterStudent}
                onChange={(e) => setFilterStudent(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[200px]"
                data-ocid="sabak.student_select"
              >
                <option value="all">
                  All Students ({sessionFilteredEntries.length})
                </option>
                {studentNames.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </>
          )}

          {(filterStudent !== "all" || filterSession !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterStudent("all");
                setFilterSession("all");
              }}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Clear filters
            </Button>
          )}
        </motion.div>
      )}

      {/* Student Cards Grid */}
      {filteredEntries.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="sabak.empty_state"
        >
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No records found</p>
          <p className="text-sm mt-1">
            {canEdit
              ? "Add a sabak record to get started."
              : "No progress records available yet."}
          </p>
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          data-ocid="sabak.list"
        >
          {filteredEntries.map((student, i) => {
            const record =
              records.find(
                (r) =>
                  r.studentId === student.id &&
                  (r.qaida !== undefined ||
                    r.ammaPara !== undefined ||
                    r.quran !== undefined ||
                    r.dua !== undefined ||
                    r.hadees !== undefined ||
                    r.urdu !== undefined ||
                    r.hifz !== undefined),
              ) ?? null;
            return (
              <SabakCard
                key={student.id}
                student={student}
                record={record}
                index={i}
                canEdit={canEdit}
                onEdit={openEditModal}
              />
            );
          })}
        </div>
      )}

      {/* Update Modal */}
      {canEdit && (
        <UpdateSabakModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditTarget(null);
          }}
          onSubmit={handleSave}
          initial={buildInitialForm()}
          students={visibleStudents}
          isEdit={editTarget?.record != null}
        />
      )}
    </div>
  );
}
