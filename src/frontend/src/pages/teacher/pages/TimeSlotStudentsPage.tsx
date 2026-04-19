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
import { Card, CardContent } from "@/components/ui/card";
import {
  type Student,
  addActivityLogEntry,
  getStudents,
  saveStudents,
} from "@/lib/storage";
import {
  ArrowLeft,
  Cloud,
  GraduationCap,
  Moon,
  Sun,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Props {
  timeSlot: "morning" | "afternoon" | "evening";
  onBack: () => void;
  /** Name of the currently logged-in Ustaad */
  ustaadName?: string;
}

const SLOT_META: Record<
  "morning" | "afternoon" | "evening",
  { label: string; icon: React.ReactNode; color: string }
> = {
  morning: {
    label: "Morning",
    icon: <Sun className="w-5 h-5" />,
    color: "text-warning",
  },
  afternoon: {
    label: "Afternoon",
    icon: <Cloud className="w-5 h-5" />,
    color: "text-blue-400",
  },
  evening: {
    label: "Evening",
    icon: <Moon className="w-5 h-5" />,
    color: "text-primary",
  },
};

export default function TimeSlotStudentsPage({
  timeSlot,
  onBack,
  ustaadName = "Ustaad",
}: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [removeTarget, setRemoveTarget] = useState<Student | null>(null);

  useEffect(() => {
    const all = getStudents();
    setStudents(all.filter((s) => s.timeSlot === timeSlot));
  }, [timeSlot]);

  const confirmRemove = () => {
    if (!removeTarget) return;
    const all = getStudents().filter((s) => s.id !== removeTarget.id);
    saveStudents(all);

    // Log the action
    addActivityLogEntry({
      actorName: ustaadName,
      actorRole: "ustaad",
      action: "removed_student",
      targetStudentName: removeTarget.name,
      details: `from ${SLOT_META[timeSlot].label} shift`,
    });

    toast.success(
      `${removeTarget.name} removed from ${SLOT_META[timeSlot].label} shift`,
    );
    setRemoveTarget(null);
    // Refresh list
    setStudents(all.filter((s) => s.timeSlot === timeSlot));
  };

  const meta = SLOT_META[timeSlot];

  return (
    <div data-ocid={`teacher.${timeSlot}.page`} className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-ocid={`teacher.${timeSlot}.back_button`}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <div className={`flex items-center gap-2 ${meta.color}`}>
            {meta.icon}
            <h1 className="text-2xl font-bold text-foreground">
              {meta.label} Students
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Students attending the {meta.label.toLowerCase()} session
          </p>
        </div>
      </div>

      {students.length === 0 ? (
        <div
          className="text-center py-16 bg-card rounded-xl border border-border"
          data-ocid={`teacher.${timeSlot}.empty_state`}
        >
          <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-foreground mb-1">No students found</p>
          <p className="text-sm text-muted-foreground">
            No students are assigned to the {meta.label.toLowerCase()} time slot
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20"
            >
              {students.length} student{students.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((s, i) => (
              <Card
                key={s.id}
                data-ocid={`teacher.${timeSlot}.item.${i + 1}`}
                className="shadow-card hover:shadow-card-hover transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{s.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.fatherName}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {s.className}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            s.feesStatus === "paid"
                              ? "bg-success/10 text-success-foreground border-success/30"
                              : "bg-warning/10 text-warning-foreground border-warning/30"
                          }`}
                        >
                          Fees: {s.feesStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {s.teacherName}
                      </p>
                    </div>
                    {/* Remove button */}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => setRemoveTarget(s)}
                      data-ocid={`teacher.${timeSlot}.delete_button.${i + 1}`}
                      aria-label={`Remove ${s.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Confirm Remove Dialog */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
      >
        <AlertDialogContent data-ocid={`teacher.${timeSlot}.remove.dialog`}>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {removeTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove <strong>{removeTarget?.name}</strong> from the{" "}
              <strong>{meta.label}</strong> shift? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid={`teacher.${timeSlot}.remove.cancel_button`}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid={`teacher.${timeSlot}.remove.confirm_button`}
              onClick={confirmRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
