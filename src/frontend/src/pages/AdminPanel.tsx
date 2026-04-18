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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  APPS_SCRIPT_URL,
  type ReportRow,
  type StudentRow,
  addStudent,
  getReports,
  getStudents,
} from "@/lib/api";
import {
  ArrowLeft,
  FileText,
  Loader2,
  RefreshCw,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

const CLASS_OPTIONS = ["Hifz", "Nazra", "Qaida", "Other"];

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [className, setClassName] = useState("");
  const [teacher, setTeacher] = useState("");
  const [fees, setFees] = useState("");
  const [saving, setSaving] = useState(false);

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);

  const [reports, setReports] = useState<ReportRow[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState(false);

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
      setStudents(rows);
    } catch {
      clearTimeout(timer);
      setStudentsError(true);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError(false);
    const timer = setTimeout(() => {
      setReportsLoading(false);
      setReportsError(true);
    }, 2000);
    try {
      const rows = await getReports();
      clearTimeout(timer);
      setReports(rows);
    } catch {
      clearTimeout(timer);
      setReportsError(true);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
    loadReports();
  }, [loadStudents, loadReports]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (mobile && mobile.length !== 10) {
      toast.error("Mobile must be 10 digits");
      return;
    }
    setSaving(true);
    try {
      await addStudent({
        name: name.trim(),
        mobile: mobile.trim(),
        className: className || "Other",
        teacher: teacher.trim(),
        fees: fees.trim(),
        addedAt: new Date().toLocaleDateString("en-IN"),
      });
      setName("");
      setMobile("");
      setClassName("");
      setTeacher("");
      setFees("");
      toast.success(`Student "${name.trim()}" added successfully`);
      await loadStudents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="islamic-bg min-h-screen">
      <div className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md">
        <Button
          data-ocid="admin.back.button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-primary-foreground hover:bg-white/20 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-bold text-lg leading-tight">Admin Panel</h1>
          <p className="text-primary-foreground/75 text-xs">
            Manage Students &amp; Reports
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!APPS_SCRIPT_URL && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            ⚙️ Setup required: Paste your Apps Script Web App URL in{" "}
            <code className="font-mono text-xs bg-amber-100 px-1 rounded">
              src/frontend/src/lib/api.ts
            </code>{" "}
            to enable live data sync.
          </div>
        )}

        <Tabs defaultValue="add" className="w-full">
          <TabsList className="w-full mb-6 bg-secondary/50 rounded-xl p-1">
            <TabsTrigger
              data-ocid="admin.add-student.tab"
              value="add"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg text-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Student
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.students-list.tab"
              value="students"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg text-sm"
            >
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger
              data-ocid="admin.reports.tab"
              value="reports"
              className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg text-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          {/* Add Student Tab */}
          <TabsContent value="add">
            <Card className="shadow-card border-0 overflow-hidden">
              <div className="gold-shimmer" />
              <CardHeader>
                <CardTitle className="text-primary text-lg">
                  Add New Student
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  data-ocid="admin.add-student.panel"
                  onSubmit={handleAddStudent}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="student-name">Student Name *</Label>
                    <Input
                      data-ocid="admin.student-name.input"
                      id="student-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-mobile">Mobile Number</Label>
                    <Input
                      data-ocid="admin.student-mobile.input"
                      id="student-mobile"
                      value={mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 10) setMobile(val);
                      }}
                      placeholder="10 digit mobile"
                      inputMode="numeric"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-class">Class</Label>
                    <Select value={className} onValueChange={setClassName}>
                      <SelectTrigger
                        data-ocid="admin.student-class.select"
                        id="student-class"
                        className="mt-1"
                      >
                        <SelectValue placeholder="Select class" />
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
                  <div>
                    <Label htmlFor="student-teacher">Teacher</Label>
                    <Input
                      data-ocid="admin.student-teacher.input"
                      id="student-teacher"
                      value={teacher}
                      onChange={(e) => setTeacher(e.target.value)}
                      placeholder="Assigned teacher"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="student-fees">Monthly Fees (₹)</Label>
                    <Input
                      data-ocid="admin.student-fees.input"
                      id="student-fees"
                      value={fees}
                      onChange={(e) =>
                        setFees(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Amount in rupees"
                      inputMode="numeric"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    data-ocid="admin.add-student.submit_button"
                    type="submit"
                    disabled={saving}
                    className="w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl mt-2"
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-5 h-5 mr-2" />
                    )}
                    {saving ? "Saving..." : "Add Student"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students List Tab */}
          <TabsContent value="students">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-primary text-base">
                  Students List
                </h2>
                <Button
                  data-ocid="admin.students.refresh.button"
                  variant="outline"
                  size="sm"
                  onClick={loadStudents}
                  disabled={studentsLoading}
                  className="text-primary border-primary/30"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1 ${
                      studentsLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>

              {studentsError && (
                <div
                  data-ocid="admin.students.error_state"
                  className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
                >
                  ⚠️ Could not fetch from Google Sheets. Check your Apps Script
                  URL and sheet permissions.
                </div>
              )}

              {studentsLoading ? (
                <div
                  data-ocid="admin.students.loading_state"
                  className="space-y-2"
                >
                  {["s1", "s2", "s3"].map((k) => (
                    <Card key={k} className="shadow-card border-0">
                      <CardContent className="p-4">
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-28" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-2">
                  {students.map((s, idx) => (
                    <Card
                      key={`student-${s.Mobile || s.Name}-${idx}`}
                      data-ocid={`admin.sheet-student.item.${idx + 1}`}
                      className="shadow-card border-0"
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">
                            {s.Name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {s.Class}
                            {s.Teacher ? ` · ${s.Teacher}` : ""}
                          </p>
                        </div>
                        {s.Fees && (
                          <p className="text-sm font-medium text-primary">
                            ₹{s.Fees}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div
                  data-ocid="admin.students.empty_state"
                  className="text-center py-12 text-muted-foreground"
                >
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No students found</p>
                  <p className="text-xs mt-1">
                    Add students using the &quot;Add Student&quot; tab
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Monthly Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-primary text-base">
                  Monthly Reports
                </h2>
                <Button
                  data-ocid="admin.reports.refresh.button"
                  variant="outline"
                  size="sm"
                  onClick={loadReports}
                  disabled={reportsLoading}
                  className="text-primary border-primary/30"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1 ${
                      reportsLoading ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>

              {reportsError && (
                <div
                  data-ocid="admin.reports.error_state"
                  className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
                >
                  ⚠️ Could not fetch from Google Sheets. Check your Apps Script
                  URL and sheet permissions.
                </div>
              )}

              {reportsLoading ? (
                <div
                  data-ocid="admin.reports.loading_state"
                  className="space-y-2"
                >
                  {["r1", "r2", "r3"].map((k) => (
                    <Card key={k} className="shadow-card border-0">
                      <CardContent className="p-4">
                        <Skeleton className="h-5 w-40 mb-2" />
                        <Skeleton className="h-4 w-56" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : reports.length > 0 ? (
                <div className="space-y-2">
                  {reports.map((r, idx) => (
                    <Card
                      key={`report-${r.StudentName}-${idx}`}
                      data-ocid={`admin.report.item.${idx + 1}`}
                      className="shadow-card border-0"
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between mb-1">
                          <p className="font-semibold">{r.StudentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {r.Date}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                          <span>Attendance: {r.Attendance} days</span>
                          <span>Fees: {r.Fees}</span>
                          <span>Sabak: {r.Sabak}</span>
                          <span>Akhlaq: {r.Akhlaq}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div
                  data-ocid="admin.reports.empty_state"
                  className="text-center py-12 text-muted-foreground"
                >
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No reports yet</p>
                  <p className="text-xs mt-1">
                    Reports submitted by teachers will appear here
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
