import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  type Student,
  addActivityLogEntry,
  getStudents,
  saveStudents,
} from "@/lib/storage";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  teacherName?: string;
  onSuccess?: () => void;
  teacherId?: string;
  /** Ustaad's assigned time slot — pre-filled and locked */
  teacherTimeSlot?: "morning" | "afternoon" | "evening";
}

const CLASS_OPTIONS = [
  "Ibtidayyah",
  "Nisf Qaidah",
  "Mukammal Qaidah",
  "Nisf Amma Para",
  "Mukammal Amma Para",
  "Nazra",
  "Hifz",
] as const;

type TimeSlot = "morning" | "afternoon" | "evening";

const SLOT_LABELS: Record<TimeSlot, string> = {
  morning: "🌅 Morning",
  afternoon: "☀️ Afternoon",
  evening: "🌙 Evening",
};

const EMPTY_FORM = {
  name: "",
  fatherName: "",
  parentMobile: "",
  className: "Ibtidayyah" as string,
  address: "",
  rollNumber: "",
  admissionDate: new Date().toISOString().slice(0, 10),
};

export default function AddStudentTeacherPage({
  teacherName = "",
  onSuccess,
  teacherTimeSlot,
}: Props) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  // Resolve effective time slot: use prop if set, else default to morning
  const effectiveSlot: TimeSlot = teacherTimeSlot ?? "morning";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    setSaving(true);
    try {
      const student: Student = {
        id: `ms-${Date.now()}`,
        name: form.name.trim(),
        fatherName: form.fatherName.trim(),
        parentMobile: form.parentMobile.trim(),
        className: form.className,
        teacherName: teacherName,
        fees: 800,
        feesStatus: "pending",
        timeSlot: effectiveSlot,
        address: form.address,
        rollNumber: form.rollNumber,
        admissionDate: form.admissionDate,
      };
      const all = getStudents();
      saveStudents([...all, student]);

      // Activity log
      if (teacherName) {
        addActivityLogEntry({
          actorName: teacherName,
          actorRole: "ustaad",
          action: "added_student",
          targetStudentName: student.name,
          details: `in ${SLOT_LABELS[effectiveSlot]} shift`,
        });
      }

      toast.success("Student added successfully");
      setForm({ ...EMPTY_FORM });
      onSuccess?.();
    } catch {
      toast.error("Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-ocid="teacher.add_student.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-primary" /> Add New Student
        </h1>
        <p className="text-muted-foreground text-sm">
          Register a new student — saved to shared system for Admin visibility
        </p>
      </div>

      <Card className="shadow-card max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  data-ocid="teacher.add_student.name.input"
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
                  data-ocid="teacher.add_student.fathername.input"
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
                  data-ocid="teacher.add_student.mobile.input"
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
                  onValueChange={(v) =>
                    setForm((p) => ({ ...p, className: v }))
                  }
                >
                  <SelectTrigger data-ocid="teacher.add_student.class.select">
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

              {/* Time Slot — pre-filled and locked to Ustaad's shift */}
              <div className="space-y-1.5">
                <Label>Time Slot 🕌</Label>
                <div
                  data-ocid="teacher.add_student.timeslot.select"
                  className="flex items-center h-9 px-3 rounded-md border border-input bg-muted/30 text-sm text-foreground cursor-not-allowed"
                >
                  {SLOT_LABELS[effectiveSlot]}
                  <span className="ml-2 text-xs text-muted-foreground">
                    (auto-assigned to your shift)
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Roll Number</Label>
                <Input
                  data-ocid="teacher.add_student.rollnumber.input"
                  value={form.rollNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, rollNumber: e.target.value }))
                  }
                  placeholder="e.g. 013"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Admission Date</Label>
                <Input
                  type="date"
                  data-ocid="teacher.add_student.admissiondate.input"
                  value={form.admissionDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, admissionDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Address</Label>
                <Input
                  data-ocid="teacher.add_student.address.input"
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="Student's address"
                />
              </div>
            </div>

            {teacherName && (
              <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 border border-border/50">
                📌 Student will be assigned to: <strong>{teacherName}</strong>{" "}
                &bull; Shift: <strong>{SLOT_LABELS[effectiveSlot]}</strong>
              </p>
            )}

            <Button
              data-ocid="teacher.add_student.submit_button"
              type="submit"
              className="bg-primary text-primary-foreground gap-2"
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : null}
              Add Student
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
