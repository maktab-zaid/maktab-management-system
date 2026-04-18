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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  useAddTeacher,
  useAllTeachers,
  useDeleteTeacher,
  useUpdateTeacher,
} from "../../../hooks/useQueries";
import type { Teacher } from "../../../types";

const EMPTY_TEACHER: Omit<Teacher, "id" | "createdAt"> = {
  name: "",
  class: "",
  mobile: "",
};

export default function TeachersPage() {
  const { data: teachers = [], isLoading } = useAllTeachers();
  const addTeacher = useAddTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] =
    useState<Omit<Teacher, "id" | "createdAt">>(EMPTY_TEACHER);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.mobile ?? "").includes(search),
  );

  const openAdd = useCallback(() => {
    setEditTeacher(null);
    setFormData(EMPTY_TEACHER);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((t: Teacher) => {
    setEditTeacher(t);
    setFormData({ name: t.name, class: t.class ?? "", mobile: t.mobile ?? "" });
    setDialogOpen(true);
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      if (editTeacher) {
        await updateTeacher.mutateAsync({
          id: editTeacher.id,
          teacher: { ...editTeacher, ...formData },
        });
        toast.success("Teacher updated");
      } else {
        await addTeacher.mutateAsync({
          id: `teacher-${crypto.randomUUID()}`,
          createdAt: BigInt(Date.now()),
          ...formData,
        });
        toast.success("Teacher added");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save teacher");
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
          <h1 className="text-2xl font-bold text-foreground">Teachers</h1>
          <p className="text-muted-foreground text-sm">
            {teachers.length} teachers registered
          </p>
        </div>
        <Button
          data-ocid="admin.teachers.open_modal_button"
          onClick={openAdd}
          className="bg-primary text-primary-foreground gap-2"
        >
          <Plus className="w-4 h-4" /> Add Teacher
        </Button>
      </div>

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
            {search ? "No teachers match search" : "No teachers added yet"}
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
                  <TableCell className="text-muted-foreground text-sm">
                    {t.createdAt
                      ? new Date(Number(t.createdAt)).toLocaleDateString()
                      : "—"}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="admin.teachers.dialog" className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editTeacher ? "Edit Teacher" : "Add New Teacher"}
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
                value={formData.mobile ?? ""}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, mobile: e.target.value }))
                }
                placeholder="03XX-XXXXXXX"
              />
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
              {editTeacher ? "Update" : "Add Teacher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="admin.teachers.delete.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Teacher?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the teacher record.
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
