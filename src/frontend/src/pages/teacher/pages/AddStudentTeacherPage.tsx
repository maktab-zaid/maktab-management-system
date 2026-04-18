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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddStudent } from "../../../hooks/useQueries";
import { FeesStatus } from "../../../types";
import type { Student } from "../../../types";
import { CLASS_OPTIONS, TIMING_OPTIONS } from "../../../types";

interface Props {
  teacherId: string;
  onSuccess: () => void;
}

export default function AddStudentTeacherPage({ teacherId, onSuccess }: Props) {
  const addStudent = useAddStudent();

  const [form, setForm] = useState<Omit<Student, "id" | "createdAt">>({
    name: "",
    fatherName: "",
    mobileNumber: "",
    className: "Naazra",
    assignedTeacherId: teacherId,
    timing: "Subah",
    feesStatus: FeesStatus.active,
    monthlyFees: BigInt(800),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      await addStudent.mutateAsync({
        id: `student-${crypto.randomUUID()}`,
        createdAt: BigInt(Date.now()),
        ...form,
        assignedTeacherId: teacherId || form.assignedTeacherId,
      });
      toast.success("Student added successfully");
      onSuccess();
    } catch {
      toast.error("Failed to add student");
    }
  };

  return (
    <div data-ocid="teacher.add_student.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add New Student</h1>
        <p className="text-muted-foreground text-sm">
          Register a new student under your supervision
        </p>
      </div>

      <Card className="shadow-card max-w-2xl">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Student Name *</Label>
                <Input
                  data-ocid="teacher.add_student.name.input"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Father&apos;s Name</Label>
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
                <Label>Mobile Number</Label>
                <Input
                  data-ocid="teacher.add_student.mobile.input"
                  value={form.mobileNumber}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, mobileNumber: e.target.value }))
                  }
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Monthly Fees (Rs.)</Label>
                <Input
                  data-ocid="teacher.add_student.fees.input"
                  type="number"
                  value={Number(form.monthlyFees)}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      monthlyFees: BigInt(e.target.value || 0),
                    }))
                  }
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
              <div className="space-y-1.5">
                <Label>Timing</Label>
                <Select
                  value={form.timing}
                  onValueChange={(v) => setForm((p) => ({ ...p, timing: v }))}
                >
                  <SelectTrigger data-ocid="teacher.add_student.timing.select">
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
            </div>

            <Button
              data-ocid="teacher.add_student.submit_button"
              type="submit"
              className="bg-primary text-primary-foreground"
              disabled={addStudent.isPending}
            >
              {addStudent.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Add Student
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
