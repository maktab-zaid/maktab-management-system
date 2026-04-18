import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APPS_SCRIPT_URL, addReport, getStudents } from "@/lib/api";
import { ArrowLeft, BookOpen, Loader2, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface TeacherPanelProps {
  onBack: () => void;
}

export default function TeacherPanel({ onBack }: TeacherPanelProps) {
  const [studentNames, setStudentNames] = useState<string[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [attendance, setAttendance] = useState("");
  const [sabak, setSabak] = useState("");
  const [akhlaq, setAkhlaq] = useState("Good");
  const [feesStatus, setFeesStatus] = useState("Paid");
  const [submitting, setSubmitting] = useState(false);

  const loadStudents = useCallback(async () => {
    setStudentsLoading(true);
    setStudentsError(false);
    const timer = setTimeout(() => {
      setStudentsLoading(false);
      setStudentsError(true);
    }, 2000);
    try {
      const rows = await getStudents();
      clearTimeout(timer);
      setStudentNames(rows.map((s) => s.Name).filter(Boolean));
    } catch {
      clearTimeout(timer);
      setStudentsError(true);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }
    if (!attendance) {
      toast.error("Please enter attendance days");
      return;
    }

    setSubmitting(true);
    try {
      await addReport({
        studentName: selectedStudent,
        attendance,
        sabak,
        akhlaq,
        fees: feesStatus,
        date: new Date().toLocaleDateString("en-IN"),
      });
      setSelectedStudent("");
      setAttendance("");
      setSabak("");
      setAkhlaq("Good");
      setFeesStatus("Paid");
      toast.success(`Report for "${selectedStudent}" submitted successfully.`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to submit report",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="islamic-bg min-h-screen">
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md">
        <Button
          data-ocid="teacher.back.button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-primary-foreground hover:bg-white/20 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-bold text-lg leading-tight">Teacher Panel</h1>
          <p className="text-primary-foreground/75 text-xs">
            Submit Monthly Reports
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {!APPS_SCRIPT_URL && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            ⚙️ Setup required: Paste your Apps Script Web App URL in{" "}
            <code className="font-mono text-xs bg-amber-100 px-1 rounded">
              src/frontend/src/lib/api.ts
            </code>{" "}
            to enable live data sync.
          </div>
        )}

        <Card className="shadow-card border-0 overflow-hidden">
          <div className="gold-shimmer" />
          <CardHeader>
            <CardTitle className="text-primary text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Monthly Report Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              data-ocid="teacher.report-form.panel"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <Label htmlFor="select-student">Select Student *</Label>
                {studentsLoading ? (
                  <div
                    data-ocid="teacher.students.loading_state"
                    className="mt-1 h-10 rounded-md border bg-muted animate-pulse"
                  />
                ) : (
                  <Select
                    value={selectedStudent}
                    onValueChange={setSelectedStudent}
                  >
                    <SelectTrigger
                      data-ocid="teacher.student.select"
                      id="select-student"
                      className="mt-1"
                    >
                      <SelectValue
                        placeholder={
                          studentsError
                            ? "Sheet unavailable — type name below"
                            : studentNames.length === 0
                              ? "No students found"
                              : "Choose a student"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {studentNames.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {studentsError && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Could not load from Google Sheets
                  </p>
                )}
                {(studentsError || studentNames.length === 0) && (
                  <Input
                    data-ocid="teacher.student-name-manual.input"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    placeholder="Or type student name manually"
                    className="mt-2"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="attendance">Attendance (days present) *</Label>
                <Input
                  data-ocid="teacher.attendance.input"
                  id="attendance"
                  value={attendance}
                  onChange={(e) =>
                    setAttendance(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="e.g. 24"
                  inputMode="numeric"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="sabak">Sabak (lesson)</Label>
                <Input
                  data-ocid="teacher.sabak.input"
                  id="sabak"
                  value={sabak}
                  onChange={(e) => setSabak(e.target.value)}
                  placeholder="e.g. Surah Al-Baqarah v1-5"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Akhlaq (Character)</Label>
                <RadioGroup
                  data-ocid="teacher.akhlaq.radio"
                  value={akhlaq}
                  onValueChange={setAkhlaq}
                  className="flex gap-4 mt-2"
                >
                  {["Good", "Best", "Excellent"].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={opt}
                        id={`akhlaq-${opt.toLowerCase()}`}
                      />
                      <Label
                        htmlFor={`akhlaq-${opt.toLowerCase()}`}
                        className="cursor-pointer font-normal"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label>Fees Status</Label>
                <RadioGroup
                  data-ocid="teacher.fees.radio"
                  value={feesStatus}
                  onValueChange={setFeesStatus}
                  className="flex gap-6 mt-2"
                >
                  {["Paid", "Pending"].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <RadioGroupItem
                        value={opt}
                        id={`fees-${opt.toLowerCase()}`}
                      />
                      <Label
                        htmlFor={`fees-${opt.toLowerCase()}`}
                        className="cursor-pointer font-normal"
                      >
                        {opt}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <Button
                data-ocid="teacher.submit-report.button"
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl mt-2"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 mr-2" />
                )}
                {submitting ? "Submitting..." : "Submit Report"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
