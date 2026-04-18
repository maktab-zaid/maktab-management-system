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
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAcademicRecord,
  useStudentsByTeacher,
  useUpdateAcademicRecord,
} from "../../../hooks/useQueries";
import type { AcademicRecord } from "../../../types";

interface Props {
  teacherId: string;
}

function StarRating({
  value,
  onChange,
}: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1" data-ocid="teacher.sabak.akhlaq.input">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-colors"
        >
          <Star
            className={`w-6 h-6 ${star <= value ? "fill-warning text-warning" : "text-muted-foreground"}`}
          />
        </button>
      ))}
    </div>
  );
}

function SabakForm({ studentId }: { studentId: string }) {
  const { data: record, isLoading } = useAcademicRecord(studentId);
  const updateRecord = useUpdateAcademicRecord();
  const [form, setForm] = useState<Partial<AcademicRecord>>({});
  const [initialized, setInitialized] = useState(false);

  if (record && !initialized) {
    setInitialized(true);
    setForm({
      currentSabak: record.currentSabak,
      previousSabak: record.previousSabak,
      monthlyProgress: record.monthlyProgress,
      akhlaqRating: record.akhlaqRating,
    });
  }

  if (isLoading)
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );

  const handleSave = async () => {
    try {
      await updateRecord.mutateAsync({
        id: record?.id ?? `academic-${studentId}`,
        studentId,
        currentSabak: form.currentSabak ?? "",
        previousSabak: form.previousSabak ?? "",
        monthlyProgress: form.monthlyProgress ?? "Good",
        akhlaqRating: form.akhlaqRating ?? BigInt(3),
        updatedAt: BigInt(Date.now()),
      });
      toast.success("Sabak updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <Card className="shadow-card">
      <CardContent className="p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Current Sabak</Label>
            <Input
              data-ocid="teacher.sabak.currentsabak.input"
              value={form.currentSabak ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, currentSabak: e.target.value }))
              }
              placeholder="e.g. Surah Al-Baqarah Ruku 3"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Previous Sabak</Label>
            <Input
              data-ocid="teacher.sabak.prevsabak.input"
              value={form.previousSabak ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, previousSabak: e.target.value }))
              }
              placeholder="e.g. Surah Al-Baqarah Ruku 2"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Monthly Progress</Label>
            <Select
              value={form.monthlyProgress ?? "Good"}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, monthlyProgress: v }))
              }
            >
              <SelectTrigger data-ocid="teacher.sabak.progress.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Excellent",
                  "Very Good",
                  "Good",
                  "Average",
                  "Below Average",
                  "Needs Improvement",
                ].map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Akhlaq Rating</Label>
            <StarRating
              value={Number(form.akhlaqRating ?? 3)}
              onChange={(v) =>
                setForm((p) => ({ ...p, akhlaqRating: BigInt(v) }))
              }
            />
          </div>
        </div>
        <Button
          data-ocid="teacher.sabak.save_button"
          onClick={handleSave}
          disabled={updateRecord.isPending}
        >
          {updateRecord.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          Save Sabak
        </Button>
      </CardContent>
    </Card>
  );
}

export default function UpdateSabakPage({ teacherId }: Props) {
  const { data: students = [], isLoading } = useStudentsByTeacher(teacherId);
  const [selectedId, setSelectedId] = useState("");

  return (
    <div data-ocid="teacher.sabak.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Update Sabak</h1>
        <p className="text-muted-foreground text-sm">
          Update sabak and progress for your students
        </p>
      </div>

      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger
          data-ocid="teacher.sabak.student.select"
          className="max-w-sm"
        >
          <SelectValue
            placeholder={isLoading ? "Loading..." : "Select a student"}
          />
        </SelectTrigger>
        <SelectContent>
          {students.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name} — {s.className}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!selectedId ? (
        <div
          className="text-center py-16 bg-card rounded-xl border border-border"
          data-ocid="teacher.sabak.empty_state"
        >
          Select a student to update their sabak
        </div>
      ) : (
        <SabakForm studentId={selectedId} />
      )}
    </div>
  );
}
