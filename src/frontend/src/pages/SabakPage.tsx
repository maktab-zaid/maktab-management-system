import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  type SabakRecord,
  type Session,
  type Student,
  createId,
  getSabak,
  getStudents,
  saveSabak,
} from "@/lib/storage";
import {
  BookOpen,
  CalendarDays,
  Edit2,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

// ── Props ────────────────────────────────────────────────────────────────────

export interface SabakPageProps {
  session: Session;
}

// ── Progress helpers ─────────────────────────────────────────────────────────

function progressColor(pct: number): string {
  if (pct >= 75)
    return "linear-gradient(90deg, oklch(0.40 0.14 145), oklch(0.55 0.18 145))";
  if (pct >= 50)
    return "linear-gradient(90deg, oklch(0.72 0.16 55), oklch(0.82 0.18 68))";
  return "linear-gradient(90deg, oklch(0.55 0.22 27), oklch(0.68 0.20 45))";
}

function progressTextColor(pct: number): string {
  if (pct >= 75) return "oklch(0.40 0.14 145)";
  if (pct >= 50) return "oklch(0.65 0.16 55)";
  return "oklch(0.50 0.22 27)";
}

function gradeLabel(pct: number): string {
  if (pct >= 75) return "Excellent";
  if (pct >= 50) return "Good";
  return "Needs Improvement";
}

function gradeBadgeClass(pct: number): string {
  if (pct >= 75) return "bg-success/10 text-success border border-success/20";
  if (pct >= 50) return "bg-primary/10 text-primary border border-primary/20";
  return "bg-warning/10 text-warning border border-warning/20";
}

// ── Edit Modal Form type ──────────────────────────────────────────────────────

interface EditForm {
  studentId: string;
  lessonName: string;
  progress: number;
  remarks: string;
}

const EMPTY_FORM: EditForm = {
  studentId: "",
  lessonName: "",
  progress: 50,
  remarks: "",
};

// ── Student Progress Card ────────────────────────────────────────────────────

interface SabakCardProps {
  rec: SabakRecord;
  index: number;
  canEdit: boolean;
  onEdit: (rec: SabakRecord) => void;
}

function SabakCard({ rec, index, canEdit, onEdit }: SabakCardProps) {
  const pct = Math.min(100, Math.max(0, rec.progress));
  const barColor = progressColor(pct);
  const textColor = progressTextColor(pct);
  const grade = gradeLabel(pct);
  const badgeCls = gradeBadgeClass(pct);

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
        className="overflow-hidden card-elevated group cursor-default"
        style={{
          borderLeft: "3px solid oklch(0.75 0.18 75)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 16px 32px -6px rgba(0,60,30,0.16), 0 4px 8px -2px rgba(0,60,30,0.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 4px 12px -2px rgba(0,60,30,0.08), 0 2px 4px -1px rgba(0,60,30,0.04)";
        }}
      >
        <CardContent className="p-0">
          {/* Card Header */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground truncate text-sm leading-tight">
                  {rec.studentName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Updated by {rec.updatedBy}
                </p>
              </div>
              <Badge className={`text-xs shrink-0 font-medium ${badgeCls}`}>
                {grade}
              </Badge>
            </div>

            {/* Lesson Name */}
            <div className="flex items-center gap-1.5 mt-2.5">
              <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground truncate">
                {rec.lessonName}
              </span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                Progress
              </span>
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: textColor }}
              >
                {pct}% Complete
              </span>
            </div>
            {/* Track */}
            <div
              className="w-full h-2.5 rounded-full overflow-hidden"
              style={{ background: "oklch(0.90 0.02 145)" }}
            >
              <motion.div
                className="h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.07 + 0.15,
                  ease: "easeOut",
                }}
                style={{ background: barColor }}
              />
            </div>
            {/* Tick marks */}
            <div className="flex justify-between mt-1 px-0.5">
              <span className="text-[10px] text-muted-foreground">0%</span>
              <span className="text-[10px] text-muted-foreground">50%</span>
              <span className="text-[10px] text-muted-foreground">100%</span>
            </div>
          </div>

          {/* Remarks */}
          {rec.remarks && (
            <div
              className="mx-4 mb-3 px-3 py-2 rounded-md text-xs text-muted-foreground italic leading-relaxed"
              style={{ background: "oklch(0.95 0.015 145)" }}
            >
              &ldquo;{rec.remarks}&rdquo;
            </div>
          )}

          {/* Footer */}
          <div
            className="px-4 py-2 flex items-center justify-between border-t"
            style={{ borderColor: "oklch(0.90 0.02 145)" }}
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {rec.updatedAt}
            </span>
            {canEdit ? (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1"
                onClick={() => onEdit(rec)}
                data-ocid={`sabak.edit_button.${index + 1}`}
              >
                <Edit2 className="w-3 h-3" />
                Update
              </Button>
            ) : (
              <TrendingUp className="w-3.5 h-3.5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Update Sabak Modal ───────────────────────────────────────────────────────

interface UpdateSabakModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditForm) => void;
  initial: EditForm;
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
}: UpdateSabakModalProps) {
  const [form, setForm] = useState<EditForm>(initial);

  // Sync form when initial changes (opening modal for different records)
  const [lastInitial, setLastInitial] = useState<EditForm>(initial);
  if (lastInitial !== initial) {
    setLastInitial(initial);
    setForm(initial);
  }

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, progress: Number(e.target.value) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
    onClose();
  }

  const sliderTextColor = progressTextColor(form.progress);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full" data-ocid="sabak.dialog">
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
              name="studentId"
              value={form.studentId}
              onChange={handleChange}
              required
              disabled={isEdit}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
              data-ocid="sabak.select"
            >
              <option value="">Select a student</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.className}
                </option>
              ))}
            </select>
          </div>

          {/* Lesson Name */}
          <div className="space-y-1.5">
            <Label htmlFor="sabak-lesson">Lesson Name</Label>
            <Input
              id="sabak-lesson"
              name="lessonName"
              placeholder="e.g. Para 28 — Al-Mujadila"
              value={form.lessonName}
              onChange={handleChange}
              required
              data-ocid="sabak.input"
            />
          </div>

          {/* Progress Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sabak-progress">Progress %</Label>
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: sliderTextColor }}
              >
                {form.progress}%
              </span>
            </div>
            <input
              id="sabak-progress"
              name="progress"
              type="range"
              min="0"
              max="100"
              step="1"
              value={form.progress}
              onChange={handleSlider}
              className="w-full h-2 rounded-full cursor-pointer appearance-none"
              style={{
                background: `linear-gradient(90deg, oklch(0.55 0.18 145) ${form.progress}%, oklch(0.90 0.02 145) ${form.progress}%)`,
                accentColor: "oklch(0.32 0.09 155)",
              }}
              data-ocid="sabak.input"
            />
            {/* Mini progress preview */}
            <div
              className="w-full h-2 rounded-full overflow-hidden"
              style={{ background: "oklch(0.90 0.02 145)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${form.progress}%`,
                  background: progressColor(form.progress),
                }}
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1.5">
            <Label htmlFor="sabak-remarks">Remarks</Label>
            <Textarea
              id="sabak-remarks"
              name="remarks"
              placeholder="Any notes or observations..."
              value={form.remarks}
              onChange={handleChange}
              rows={2}
              className="resize-none"
              data-ocid="sabak.textarea"
            />
          </div>

          {/* Actions */}
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

// ── Monthly Summary Table ────────────────────────────────────────────────────

function MonthlySummary({ records }: { records: SabakRecord[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      data-ocid="sabak.summary_section"
    >
      <h2 className="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
        <Star className="w-4 h-4 text-primary" />
        Monthly Summary — April 2026
      </h2>
      <Card className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b"
                style={{
                  borderColor: "oklch(0.88 0.02 145)",
                  background: "oklch(0.94 0.01 145)",
                }}
              >
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  #
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Student
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Lesson
                </th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">
                  Grade
                </th>
                <th className="text-center px-4 py-3 font-semibold text-foreground">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, i) => {
                const pct = Math.min(100, Math.max(0, rec.progress));
                const barColor = progressColor(pct);
                const txtColor = progressTextColor(pct);
                return (
                  <tr
                    key={rec.id}
                    className="border-b last:border-0 transition-colors duration-150 hover:bg-muted/40"
                    style={{ borderColor: "oklch(0.88 0.02 145)" }}
                    data-ocid={`sabak.summary.item.${i + 1}`}
                  >
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {rec.studentName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs truncate max-w-[160px]">
                      {rec.lessonName}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs ${gradeBadgeClass(pct)}`}>
                        {gradeLabel(pct)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-16 h-1.5 rounded-full overflow-hidden"
                          style={{ background: "oklch(0.90 0.02 145)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: barColor }}
                          />
                        </div>
                        <span
                          className="text-xs font-semibold tabular-nums"
                          style={{ color: txtColor }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </motion.div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SabakPage({ session }: SabakPageProps) {
  const allStudents = getStudents();
  const allSabak = getSabak();

  // Determine which students this role can see
  const visibleStudents: Student[] =
    session.role === "admin"
      ? allStudents
      : session.role === "teacher"
        ? allStudents.filter(
            (s) =>
              s.teacherName === session.name ||
              s.className === session.teacherClass,
          )
        : (() => {
            // parent — find their child only
            const child = allStudents.find(
              (s) => s.parentMobile === session.mobile,
            );
            return child ? [child] : [];
          })();

  const visibleStudentIds = new Set(visibleStudents.map((s) => s.id));

  // Filter sabak records to visible students
  const visibleRecords: SabakRecord[] =
    session.role === "parent"
      ? // parent sees only their child's most recent record
        (() => {
          const child = visibleStudents[0];
          if (!child) return [];
          const childRecords = allSabak
            .filter((r) => r.studentId === child.id)
            .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
          return childRecords.slice(0, 1);
        })()
      : allSabak.filter((r) => visibleStudentIds.has(r.studentId));

  const [records, setRecords] = useState<SabakRecord[]>(visibleRecords);
  const [filterStudent, setFilterStudent] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SabakRecord | null>(null);

  const canEdit = session.role === "admin" || session.role === "teacher";

  const studentNames = Array.from(new Set(records.map((r) => r.studentName)));

  const filtered =
    filterStudent === "all"
      ? records
      : records.filter((r) => r.studentName === filterStudent);

  const avgProgress =
    records.length > 0
      ? Math.round(records.reduce((s, r) => s + r.progress, 0) / records.length)
      : 0;
  const nearComplete = records.filter((r) => r.progress >= 80).length;
  const excellentCount = records.filter((r) => r.progress >= 75).length;

  function openAddModal() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function openEditModal(rec: SabakRecord) {
    setEditTarget(rec);
    setModalOpen(true);
  }

  function buildInitialForm(): EditForm {
    if (editTarget) {
      return {
        studentId: editTarget.studentId,
        lessonName: editTarget.lessonName,
        progress: editTarget.progress,
        remarks: editTarget.remarks,
      };
    }
    return EMPTY_FORM;
  }

  function handleSave(data: EditForm) {
    const student = visibleStudents.find((s) => s.id === data.studentId);
    if (!student) return;

    const allStored = getSabak();

    if (editTarget) {
      // Update existing record
      const updated = allStored.map((r) =>
        r.id === editTarget.id
          ? {
              ...r,
              lessonName: data.lessonName,
              progress: data.progress,
              remarks: data.remarks,
              updatedBy: session.name,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : r,
      );
      saveSabak(updated);
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editTarget.id
            ? {
                ...r,
                lessonName: data.lessonName,
                progress: data.progress,
                remarks: data.remarks,
                updatedBy: session.name,
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : r,
        ),
      );
    } else {
      // Check if a record for this student already exists
      const existingIdx = allStored.findIndex(
        (r) => r.studentId === data.studentId,
      );
      const newRecord: SabakRecord = {
        id: existingIdx >= 0 ? allStored[existingIdx].id : createId(),
        studentId: student.id,
        studentName: student.name,
        lessonName: data.lessonName,
        progress: data.progress,
        remarks: data.remarks,
        updatedBy: session.name,
        updatedAt: new Date().toISOString().slice(0, 10),
      };

      let updatedAll: SabakRecord[];
      if (existingIdx >= 0) {
        updatedAll = allStored.map((r, i) =>
          i === existingIdx ? newRecord : r,
        );
      } else {
        updatedAll = [newRecord, ...allStored];
      }
      saveSabak(updatedAll);

      setRecords((prev) => {
        const existingLocalIdx = prev.findIndex(
          (r) => r.studentId === data.studentId,
        );
        if (existingLocalIdx >= 0) {
          return prev.map((r, i) => (i === existingLocalIdx ? newRecord : r));
        }
        return [newRecord, ...prev];
      });
    }

    toast.success("Sabak record saved successfully");
    setEditTarget(null);
  }

  return (
    <div className="space-y-6 page-enter" data-ocid="sabak.page">
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
              ? "Your child's Quran memorisation progress"
              : "Track Quran memorisation and recitation for each student"}
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

      {/* Stats Row */}
      {session.role !== "parent" && (
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          data-ocid="sabak.stats"
        >
          {[
            {
              id: "learners",
              icon: <Users className="w-5 h-5 text-primary" />,
              iconBg: "bg-primary/10",
              value: records.length,
              label: "Active Learners",
              delay: 0,
            },
            {
              id: "avg-completion",
              icon: (
                <TrendingUp
                  className="w-5 h-5"
                  style={{ color: "oklch(0.58 0.14 68)" }}
                />
              ),
              iconBg: "bg-warning/10",
              value: `${avgProgress}%`,
              label: "Avg Completion",
              delay: 0.05,
            },
            {
              id: "excellent",
              icon: <Star className="w-5 h-5 text-success" />,
              iconBg: "bg-success/10",
              value: excellentCount,
              label: `Excellent · ${nearComplete} near complete`,
              delay: 0.1,
            },
          ].map((stat) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: stat.delay }}
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

      {/* Filter (admin/teacher only with multiple records) */}
      {canEdit && studentNames.length > 1 && (
        <motion.div
          className="flex items-center gap-3 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          data-ocid="sabak.filter"
        >
          <label
            htmlFor="sabak-filter"
            className="text-sm font-medium text-foreground shrink-0"
          >
            Filter by student:
          </label>
          <select
            id="sabak-filter"
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[200px]"
            data-ocid="sabak.select"
          >
            <option value="all">All Students ({records.length})</option>
            {studentNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {filterStudent !== "all" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilterStudent("all")}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Clear
            </Button>
          )}
        </motion.div>
      )}

      {/* Cards Grid */}
      {filtered.length === 0 ? (
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
          {filtered.map((rec, i) => (
            <SabakCard
              key={rec.id}
              rec={rec}
              index={i}
              canEdit={canEdit}
              onEdit={openEditModal}
            />
          ))}
        </div>
      )}

      {/* Monthly Summary (admin/teacher only) */}
      {session.role !== "parent" && records.length > 0 && (
        <MonthlySummary records={records} />
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
          isEdit={editTarget !== null}
        />
      )}
    </div>
  );
}
