import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTeacherStudents } from "../../../hooks/useGoogleSheets";

interface Props {
  teacherName: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface ReportEntry {
  studentName: string;
  month: string;
  presentDays: string;
  sabak: string;
  akhlaq: string;
  notes: string;
}

const EMPTY_REPORT: ReportEntry = {
  studentName: "",
  month: "",
  presentDays: "",
  sabak: "",
  akhlaq: "",
  notes: "",
};

const CURRENT_MONTH = MONTHS[new Date().getMonth()];

export default function MonthlyReportPage({ teacherName }: Props) {
  const { data: students = [], isLoading } = useTeacherStudents(teacherName);
  const [form, setForm] = useState<ReportEntry>({
    ...EMPTY_REPORT,
    month: CURRENT_MONTH,
  });
  const [submitted, setSubmitted] = useState(false);
  const [savedReports, setSavedReports] = useState<ReportEntry[]>(() => {
    try {
      const stored = localStorage.getItem("staff_monthly_reports");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const handleSave = () => {
    if (!form.studentName) {
      toast.error("Please select a student");
      return;
    }
    if (!form.month) {
      toast.error("Please select a month");
      return;
    }

    const updated = [form, ...savedReports];
    setSavedReports(updated);
    localStorage.setItem("staff_monthly_reports", JSON.stringify(updated));
    toast.success(`Report saved for ${form.studentName} — ${form.month}`);
    setSubmitted(true);
    setForm({ ...EMPTY_REPORT, month: CURRENT_MONTH });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div data-ocid="staff.report.page" className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Monthly Report</h1>
        <p className="text-muted-foreground text-sm">
          Fill student monthly performance report
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <Card className="shadow-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-primary" />
              New Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student selection */}
            <div className="space-y-1.5">
              <Label>Student *</Label>
              <Select
                value={form.studentName}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, studentName: v }))
                }
              >
                <SelectTrigger data-ocid="staff.report.student.select">
                  <SelectValue
                    placeholder={isLoading ? "Loading..." : "Select student"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s, i) => (
                    <SelectItem key={`${s.mobile}-${i}`} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month */}
            <div className="space-y-1.5">
              <Label>Month *</Label>
              <Select
                value={form.month}
                onValueChange={(v) => setForm((p) => ({ ...p, month: v }))}
              >
                <SelectTrigger data-ocid="staff.report.month.select">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Present days */}
            <div className="space-y-1.5">
              <Label>Present Days</Label>
              <Input
                data-ocid="staff.report.present_days.input"
                type="number"
                placeholder="e.g. 22"
                min={0}
                max={31}
                value={form.presentDays}
                onChange={(e) =>
                  setForm((p) => ({ ...p, presentDays: e.target.value }))
                }
              />
            </div>

            {/* Sabak */}
            <div className="space-y-1.5">
              <Label>Current Sabak</Label>
              <Input
                data-ocid="staff.report.sabak.input"
                placeholder="e.g. Surah Al-Baqarah v.45"
                value={form.sabak}
                onChange={(e) =>
                  setForm((p) => ({ ...p, sabak: e.target.value }))
                }
              />
            </div>

            {/* Akhlaq */}
            <div className="space-y-1.5">
              <Label>Akhlaq Rating</Label>
              <Select
                value={form.akhlaq}
                onValueChange={(v) => setForm((p) => ({ ...p, akhlaq: v }))}
              >
                <SelectTrigger data-ocid="staff.report.akhlaq.select">
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Very Good">Very Good</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Average">Average</SelectItem>
                  <SelectItem value="Needs Improvement">
                    Needs Improvement
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                data-ocid="staff.report.notes.textarea"
                placeholder="Any additional notes..."
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                rows={3}
                className="resize-none"
              />
            </div>

            <Button
              data-ocid="staff.report.submit_button"
              onClick={handleSave}
              className="w-full bg-primary text-primary-foreground"
            >
              {submitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Saved!
                </>
              ) : (
                "Save Report"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Saved reports */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">
            Recent Reports
            <Badge variant="outline" className="ml-2 text-xs">
              {savedReports.length}
            </Badge>
          </h2>
          {savedReports.length === 0 ? (
            <div
              className="text-center py-12 bg-card rounded-xl border border-border"
              data-ocid="staff.report.empty_state"
            >
              <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No reports saved yet
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedReports.slice(0, 8).map((r, i) => (
                <Card
                  key={`${r.studentName}-${r.month}-${i}`}
                  data-ocid={`staff.report.item.${i + 1}`}
                  className="shadow-card"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground text-sm">
                        {r.studentName}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {r.month}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      {r.presentDays && (
                        <span>
                          Present: <strong>{r.presentDays} days</strong>
                        </span>
                      )}
                      {r.akhlaq && (
                        <span>
                          Akhlaq: <strong>{r.akhlaq}</strong>
                        </span>
                      )}
                      {r.sabak && (
                        <span className="col-span-2">
                          Sabak: <strong>{r.sabak}</strong>
                        </span>
                      )}
                      {r.notes && (
                        <span className="col-span-2 text-muted-foreground/80">
                          {r.notes}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
