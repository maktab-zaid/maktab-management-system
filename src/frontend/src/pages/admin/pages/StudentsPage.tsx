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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useStudentsSheet } from "../../../hooks/useGoogleSheets";
import {
  useAddStudent,
  useAllStudents,
  useAllTeachers,
  useDeleteStudent,
  useUpdateStudent,
} from "../../../hooks/useQueries";
import type { Student } from "../../../types";
import { FeesStatus } from "../../../types";
import { CLASS_OPTIONS, TIMING_OPTIONS } from "../../../types";

const EMPTY_STUDENT: Omit<Student, "id" | "createdAt"> = {
  name: "",
  fatherName: "",
  mobileNumber: "",
  className: "Naazra",
  assignedTeacherId: "",
  timing: "Subah",
  feesStatus: FeesStatus.active,
  monthlyFees: BigInt(800),
};

export default function StudentsPage() {
  // ICP local data
  const { data: students = [], isLoading } = useAllStudents();
  const { data: teachers = [] } = useAllTeachers();
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  // Google Sheets data
  const { data: sheetStudents = [], isLoading: sheetLoading } =
    useStudentsSheet();

  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [formData, setFormData] =
    useState<Omit<Student, "id" | "createdAt">>(EMPTY_STUDENT);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(search.toLowerCase()) ||
      s.mobileNumber.includes(search);
    const matchClass = classFilter === "all" || s.className === classFilter;
    return matchSearch && matchClass;
  });

  const filteredSheet = sheetStudents.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search);
    const matchClass = classFilter === "all" || s.className === classFilter;
    return matchSearch && matchClass;
  });

  const openAdd = useCallback(() => {
    setEditStudent(null);
    setFormData(EMPTY_STUDENT);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((s: Student) => {
    setEditStudent(s);
    setFormData({
      name: s.name,
      fatherName: s.fatherName,
      mobileNumber: s.mobileNumber,
      className: s.className,
      assignedTeacherId: s.assignedTeacherId,
      timing: s.timing,
      feesStatus: s.feesStatus,
      monthlyFees: s.monthlyFees,
    });
    setDialogOpen(true);
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (editStudent) {
        await updateStudent.mutateAsync({
          id: editStudent.id,
          student: { ...editStudent, ...formData },
        });
        toast.success("Student updated");
      } else {
        const id = `student-${crypto.randomUUID()}`;
        await addStudent.mutateAsync({
          id,
          createdAt: BigInt(Date.now()),
          ...formData,
        });
        toast.success("Student added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save student");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStudent.mutateAsync(deleteId);
      toast.success("Student removed");
    } catch {
      toast.error("Failed to delete student");
    } finally {
      setDeleteId(null);
    }
  };

  const getTeacherName = (id: string) =>
    teachers.find((t) => t.id === id)?.name ?? "—";

  const isSaving = addStudent.isPending || updateStudent.isPending;

  return (
    <div data-ocid="admin.students.page" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground text-sm">
            {sheetStudents.length} in Google Sheets &bull; {students.length}{" "}
            local records
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="admin.students.search_input"
            placeholder="Search by name, father name or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger
            data-ocid="admin.students.class.select"
            className="w-48"
          >
            <SelectValue placeholder="Filter by class" />
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
      </div>

      <Tabs defaultValue="sheet">
        <TabsList>
          <TabsTrigger value="sheet">
            Google Sheets
            <Badge
              className="ml-2 text-xs bg-primary/10 text-primary border-0"
              variant="outline"
            >
              {sheetStudents.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="local">
            Local Records
            <Badge className="ml-2 text-xs" variant="outline">
              {students.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* Sheet Data Tab */}
        <TabsContent value="sheet">
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden mt-3">
            {sheetLoading ? (
              <div
                className="p-6 space-y-2"
                data-ocid="admin.students.loading_state"
              >
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredSheet.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {search || classFilter !== "all"
                  ? "No students match your search"
                  : "No data in Google Sheet yet. Make sure the sheet is publicly shared."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5 border-b border-border">
                      <TableHead className="font-semibold">#</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">Father</TableHead>
                      <TableHead className="font-semibold">Mobile</TableHead>
                      <TableHead className="font-semibold">Class</TableHead>
                      <TableHead className="font-semibold">Teacher</TableHead>
                      <TableHead className="font-semibold">Fees</TableHead>
                      <TableHead className="font-semibold">
                        Attendance
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSheet.map((s, i) => (
                      <TableRow
                        key={`${s.mobile}-${i}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-muted-foreground text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">
                          {s.name || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.fatherName || "—"}
                        </TableCell>
                        <TableCell className="text-sm font-mono">
                          {s.mobile}
                        </TableCell>
                        <TableCell>
                          {s.className ? (
                            <Badge variant="outline" className="text-xs">
                              {s.className}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {s.teacher || "—"}
                        </TableCell>
                        <TableCell>
                          {s.feesStatus ? (
                            <Badge
                              className={`text-xs ${
                                s.feesStatus.toLowerCase() === "paid" ||
                                s.feesStatus.toLowerCase() === "active"
                                  ? "bg-success/15 text-success-foreground border-success/30"
                                  : "bg-warning/15 text-warning-foreground border-warning/30"
                              }`}
                              variant="outline"
                            >
                              {s.feesStatus}
                            </Badge>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {s.attendance || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Local Records Tab */}
        <TabsContent value="local">
          <div className="flex justify-end mt-3 mb-2">
            <Button
              data-ocid="admin.students.open_modal_button"
              onClick={openAdd}
              className="bg-primary text-primary-foreground gap-2"
            >
              <Plus className="w-4 h-4" /> Add Student
            </Button>
          </div>
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {search || classFilter !== "all"
                  ? "No students match your search"
                  : "No local students added yet"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-primary/5 border-b border-border">
                      <TableHead className="font-semibold">#</TableHead>
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">
                        Father Name
                      </TableHead>
                      <TableHead className="font-semibold">Class</TableHead>
                      <TableHead className="font-semibold">Teacher</TableHead>
                      <TableHead className="font-semibold">Timing</TableHead>
                      <TableHead className="font-semibold">Fees</TableHead>
                      <TableHead className="font-semibold text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((s, i) => (
                      <TableRow
                        key={s.id}
                        data-ocid={`admin.students.item.${i + 1}`}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="text-muted-foreground text-sm">
                          {i + 1}
                        </TableCell>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.fatherName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {s.className}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {getTeacherName(s.assignedTeacherId)}
                        </TableCell>
                        <TableCell className="text-sm">{s.timing}</TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${
                              s.feesStatus === "active"
                                ? "bg-success/15 text-success-foreground border-success/30"
                                : s.feesStatus === "pending"
                                  ? "bg-warning/15 text-warning-foreground border-warning/30"
                                  : "bg-destructive/15 text-destructive border-destructive/30"
                            }`}
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
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 hover:text-destructive"
                              onClick={() => setDeleteId(s.id)}
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
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="admin.students.dialog" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editStudent ? "Edit Student" : "Add New Student"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                data-ocid="admin.students.name.input"
                value={formData.name}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Student name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Father Name</Label>
              <Input
                data-ocid="admin.students.fathername.input"
                value={formData.fatherName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, fatherName: e.target.value }))
                }
                placeholder="Father's name"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile Number</Label>
              <Input
                data-ocid="admin.students.mobile.input"
                value={formData.mobileNumber}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, mobileNumber: e.target.value }))
                }
                placeholder="03XX-XXXXXXX"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Monthly Fees (Rs.)</Label>
              <Input
                data-ocid="admin.students.fees.input"
                type="number"
                value={Number(formData.monthlyFees)}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    monthlyFees: BigInt(e.target.value || 0),
                  }))
                }
                placeholder="800"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select
                value={formData.className}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, className: v }))
                }
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
              <Label>Timing</Label>
              <Select
                value={formData.timing}
                onValueChange={(v) => setFormData((p) => ({ ...p, timing: v }))}
              >
                <SelectTrigger data-ocid="admin.students.timing_select.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMING_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assigned Teacher</Label>
              <Select
                value={formData.assignedTeacherId}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, assignedTeacherId: v }))
                }
              >
                <SelectTrigger data-ocid="admin.students.teacher_select.select">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Fees Status</Label>
              <Select
                value={formData.feesStatus}
                onValueChange={(v) =>
                  setFormData((p) => ({ ...p, feesStatus: v as FeesStatus }))
                }
              >
                <SelectTrigger data-ocid="admin.students.fees_status.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
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
              {editStudent ? "Update" : "Add Student"}
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
