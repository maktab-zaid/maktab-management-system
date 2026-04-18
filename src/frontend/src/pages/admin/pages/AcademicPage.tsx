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
  useAllStudents,
  useUpdateAcademicRecord,
} from "../../../hooks/useQueries";
import type { AcademicRecord } from "../../../types";

function StarRating({
  value,
  onChange,
}: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1" data-ocid="admin.academic.akhlaq.input">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="transition-colors"
        >
          <Star
            className={`w-6 h-6 ${
              star <= value
                ? "fill-warning text-warning"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function AcademicForm({ studentId }: { studentId: string }) {
  const { data: record, isLoading } = useAcademicRecord(studentId);
  const updateRecord = useUpdateAcademicRecord();

  const [form, setForm] = useState<Partial<AcademicRecord>>({
    currentSabak: "",
    previousSabak: "",
    monthlyProgress: "Good",
    akhlaqRating: BigInt(3),
  });
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

  if (isLoading) {
    return (
      <div
        className="flex justify-center py-10"
        data-ocid="admin.academic.loading_state"
      >
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateRecord.mutateAsync({
        id: record?.id ?? `academic-${studentId}`,
        studentId,
        currentSabak: form.currentSabak ?? "",
        previousSabak: form.previousSabak ?? "",
        monthlyProgress: form.monthlyProgress ?? "",
        akhlaqRating: form.akhlaqRating ?? BigInt(3),
        updatedAt: BigInt(Date.now()),
      });
      toast.success("Academic record updated");
    } catch {
      toast.error("Failed to update record");
    }
  };

  return (
    <Card className="shadow-card">
      <CardContent className="p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Current Sabak</Label>
            <Input
              data-ocid="admin.academic.currentsabak.input"
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
              data-ocid="admin.academic.prevsabak.input"
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
              <SelectTrigger data-ocid="admin.academic.progress.select">
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
        {record && (
          <p className="text-xs text-muted-foreground">
            Last updated:{" "}
            {new Date(Number(record.updatedAt)).toLocaleDateString()}
          </p>
        )}
        <div className="flex gap-2">
          <Button
            data-ocid="admin.academic.save_button"
            onClick={handleSave}
            disabled={updateRecord.isPending}
          >
            {updateRecord.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Save Record
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AcademicPage() {
  const { data: students = [], isLoading } = useAllStudents();
  const [selectedStudentId, setSelectedStudentId] = useState("");

  return (
    <div data-ocid="admin.academic.page" className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Academic Records</h1>
        <p className="text-muted-foreground text-sm">
          Track sabak, progress and akhlaq for each student
        </p>
      </div>

      <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
        <SelectTrigger
          data-ocid="admin.academic.student.select"
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

      {!selectedStudentId ? (
        <div
          className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border"
          data-ocid="admin.academic.empty_state"
        >
          Select a student to view academic record
        </div>
      ) : (
        <AcademicForm studentId={selectedStudentId} />
      )}
    </div>
  );
}
