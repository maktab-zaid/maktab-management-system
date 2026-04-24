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
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ActivityLog, getActivityLog } from "@/lib/storage";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MinusCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useAddTeacher,
  useAllTeachers,
  useDeleteTeacher,
  useUpdateTeacher,
} from "../../../hooks/useQueries";
import type { Teacher } from "../../../types";

type TimeSlot = "morning" | "afternoon" | "evening";

const TIME_SLOTS: { value: TimeSlot; label: string; emoji: string }[] = [
  { value: "morning", label: "Morning", emoji: "🌅" },
  { value: "afternoon", label: "Afternoon", emoji: "☀️" },
  { value: "evening", label: "Evening", emoji: "🌙" },
];

const TIME_SLOT_COLORS: Record<TimeSlot, string> = {
  morning: "bg-yellow-500/10 text-yellow-700 border-yellow-400/30",
  afternoon: "bg-blue-500/10 text-blue-700 border-blue-400/30",
  evening: "bg-teal-500/10 text-teal-700 border-teal-400/30",
};

interface TeacherFormData {
  name: string;
  mobile: string;
  timeSlot: TimeSlot | "";
}

const EMPTY_FORM: TeacherFormData = {
  name: "",
  mobile: "",
  timeSlot: "",
};

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function actionLabel(action: ActivityLog["action"]): string {
  if (action === "added_student") return "added student";
  if (action === "removed_student") return "removed student";
  return "updated student";
}

function actionDotColor(action: ActivityLog["action"]): string {
  if (action === "added_student") return "bg-green-500";
  if (action === "removed_student") return "bg-red-500";
  return "bg-yellow-500";
}

function actionIcon(action: ActivityLog["action"]) {
  if (action === "added_student")
    return <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />;
  if (action === "removed_student")
    return <MinusCircle className="w-3.5 h-3.5 text-red-500" />;
  return <RefreshCw className="w-3.5 h-3.5 text-yellow-600" />;
}

export default function TeachersPage() {
  const { data: teachers = [], isLoading } = useAllTeachers();
  const addTeacher = useAddTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [search, setSearch] = useState("");
  const [shiftTab, setShiftTab] = useState<"all" | TimeSlot>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<TeacherFormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [logExpanded, setLogExpanded] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  const refreshLog = useCallback(() => {
    getActivityLog()
      .then((logs) => setActivityLog(logs.slice(0, 20)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshLog();
  }, [refreshLog]);

  const filtered = teachers.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.mobile ?? "").includes(search);
    const matchShift =
      shiftTab === "all" || (t.timeSlot as TimeSlot) === shiftTab;
    return matchSearch && matchShift;
  });

  // Count per shift for badges
  const countForShift = (slot: TimeSlot) =>
    teachers.filter((t) => (t.timeSlot as TimeSlot) === slot).length;

  const openAdd = useCallback(() => {
    setEditTeacher(null);
    setFormData(EMPTY_FORM);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((t: Teacher) => {
    setEditTeacher(t);
    setFormData({
      name: t.name,
      mobile: t.mobile ?? "",
      timeSlot: (t.timeSlot as TimeSlot) ?? "",
    });
    setDialogOpen(true);
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      const teacherData: Teacher = {
        ...(editTeacher ?? {}),
        id: editTeacher?.id ?? `teacher-${crypto.randomUUID()}`,
        name: formData.name.trim(),
        class: editTeacher?.class ?? "",
        mobile: formData.mobile.trim(),
        timeSlot: formData.timeSlot || undefined,
      };
      if (editTeacher) {
        await updateTeacher.mutateAsync({
          id: editTeacher.id,
          teacher: teacherData,
        });
        toast.success("Teacher updated");
      } else {
        await addTeacher.mutateAsync(teacherData);
        toast.success("Teacher added");
      }
      setDialogOpen(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save teacher";
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteTeacher.mutateAsync(deleteId);
      toast.success("Teacher removed");
    } catch {
      toast.error("Failed to delete teacher");
    } finally {
      setDeleteId(null);
    }
  };

  const isSaving = addTeacher.isPending || updateTeacher.isPending;

  return (
    <div data-ocid="admin.teachers.page" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Teachers (Ustaad)
          </h1>
          <p className="text-muted-foreground text-sm">
            {teachers.length} teachers registered
          </p>
        </div>
        <Button
          data-ocid="admin.teachers.open_modal_button"
          onClick={openAdd}
          className="bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" /> Add Ustaad
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="admin.teachers.search_input"
          placeholder="Search teachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Shift Filter Tabs */}
      <Tabs
        value={shiftTab}
        onValueChange={(v) => setShiftTab(v as "all" | TimeSlot)}
        data-ocid="admin.teachers.shift.tab"
      >
        <TabsList className="bg-muted/40 border border-border h-9">
          <TabsTrigger value="all" className="text-xs px-3 h-7">
            All ({teachers.length})
          </TabsTrigger>
          {TIME_SLOTS.map((ts) => (
            <TabsTrigger
              key={ts.value}
              value={ts.value}
              className="text-xs px-3 h-7"
            >
              {ts.emoji} {ts.label} ({countForShift(ts.value)})
            </TabsTrigger>
          ))}
        </TabsList>

        {/* We use one tab content for all views — the filtering is applied above */}
        {(["all", "morning", "afternoon", "evening"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-3">
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              {isLoading ? (
                <div
                  className="flex justify-center py-12"
                  data-ocid="admin.teachers.loading_state"
                >
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : filtered.length === 0 ? (
                <div
                  className="text-center py-12 text-muted-foreground"
                  data-ocid="admin.teachers.empty_state"
                >
                  {search
                    ? "No teachers match search"
                    : tab === "all"
                      ? "No teachers added yet"
                      : `No teachers in ${tab} shift`}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5 border-b border-border">
                      <TableHead className="font-semibold text-foreground">
                        #
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Name
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Mobile Number
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Time Slot
                      </TableHead>
                      <TableHead className="font-semibold text-foreground">
                        Added
                      </TableHead>
                      <TableHead className="font-semibold text-foreground text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t, i) => (
                      <TableRow
                        key={t.id}
                        data-ocid={`admin.teachers.item.${i + 1}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-muted-foreground text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                              {t.name.charAt(0)}
                            </div>
                            <span className="font-medium">{t.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {t.mobile ?? t.mobileNumber ?? "—"}
                        </TableCell>
                        <TableCell>
                          {t.timeSlot ? (
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${TIME_SLOT_COLORS[t.timeSlot as TimeSlot] ?? ""}`}
                            >
                              {
                                TIME_SLOTS.find((ts) => ts.value === t.timeSlot)
                                  ?.emoji
                              }{" "}
                              {t.timeSlot}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {"—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              data-ocid={`admin.teachers.edit_button.${i + 1}`}
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-primary"
                              onClick={() => openEdit(t)}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              data-ocid={`admin.teachers.delete_button.${i + 1}`}
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(t.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Activity Log Section */}
      <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
        <button
          type="button"
          data-ocid="admin.teachers.activity_log.toggle"
          onClick={() => {
            setLogExpanded((v) => !v);
            refreshLog();
          }}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
        >
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <UserCheck className="w-4 h-4 text-primary" />
            Activity Log
            <Badge
              variant="outline"
              className="text-xs bg-primary/5 text-primary border-primary/20"
            >
              {activityLog.length}
            </Badge>
          </div>
          {logExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {logExpanded && (
          <>
            <Separator />
            <div className="p-4" data-ocid="admin.teachers.activity_log.panel">
              {activityLog.length === 0 ? (
                <p
                  className="text-center text-muted-foreground text-sm py-6"
                  data-ocid="admin.teachers.activity_log.empty_state"
                >
                  No activity recorded yet. Actions by Ustaads will appear here.
                </p>
              ) : (
                <ul className="space-y-3">
                  {activityLog.map((entry, i) => (
                    <li
                      key={entry.id}
                      data-ocid={`admin.teachers.activity_log.item.${i + 1}`}
                      className="flex items-start gap-3 text-sm"
                    >
                      {/* Colored dot */}
                      <div className="mt-1.5 shrink-0">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${actionDotColor(entry.action)}`}
                        />
                      </div>
                      {/* Icon */}
                      <div className="mt-0.5 shrink-0">
                        {actionIcon(entry.action)}
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-foreground">
                          Ustaad {entry.actorName}
                        </span>{" "}
                        <span className="text-muted-foreground">
                          {actionLabel(entry.action)}
                        </span>{" "}
                        <span className="font-medium text-foreground">
                          {entry.targetStudentName}
                        </span>
                        {entry.details && (
                          <span className="text-muted-foreground">
                            {" "}
                            — {entry.details}
                          </span>
                        )}
                      </div>
                      {/* Time */}
                      <div className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {timeAgo(entry.timestamp)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="admin.teachers.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTeacher ? "Edit Ustaad" : "Add New Ustaad"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                data-ocid="admin.teachers.name.input"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Teacher name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile Number</Label>
              <Input
                data-ocid="admin.teachers.mobile.input"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, mobile: e.target.value }))
                }
                placeholder="Mobile number"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Time Slot</Label>
              <Select
                value={formData.timeSlot}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, timeSlot: v as TimeSlot }))
                }
              >
                <SelectTrigger data-ocid="admin.teachers.timeslot.select">
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((ts) => (
                    <SelectItem key={ts.value} value={ts.value}>
                      {ts.emoji} {ts.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="admin.teachers.cancel_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="admin.teachers.save_button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {editTeacher ? "Update" : "Add Ustaad"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="admin.teachers.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Ustaad?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the teacher record permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.teachers.delete.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.teachers.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
