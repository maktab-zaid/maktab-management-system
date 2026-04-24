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
  type Student,
  type Teacher,
  addStudent,
  createId,
  getStudents,
  getTeachers,
} from "@/lib/storage";
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

const CLASS_OPTIONS = [
  "Ibtidayyah",
  "Nisf Qaida",
  "Mukammal Qaida",
  "Nisf Amma Para",
  "Mukammal Amma",
  "Nazra",
  "Hifz",
  "Other",
];

interface AdminPanelProps {
  onBack: () => void;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [className, setClassName] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [fees, setFees] = useState("");
  const [saving, setSaving] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  const loadTeachers = useCallback(async () => {
    setTeachersLoading(true);
    try {
      const rows = await getTeachers();
      setTeachers(rows);
    } catch (e) {
      console.error("[AdminPanel] loadTeachers:", e);
    } finally {
      setTeachersLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    setStudentsLoading(true);
    setStudentsError(false);
    try {
      const rows = await getStudents();
      setStudents(rows);
    } catch (e) {
      console.error("[AdminPanel] loadStudents:", e);
      setStudentsError(true);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
    loadTeachers();
  }, [loadStudents, loadTeachers]);

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

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
      const newStudent: Student = {
        id: createId(),
        name: name.trim(),
        fatherName: "",
        parentMobile: mobile.trim(),
        timeSlot: "",
        teacherName: selectedTeacher?.name ?? "",
        fees: Number(fees) || 0,
        feesStatus: "pending",
        studentClass: className || "Other",
        admissionDate: new Date().toLocaleDateString("en-IN"),
      };
      await addStudent(newStudent);
      setName("");
      setMobile("");
      setClassName("");
      setSelectedTeacherId("");
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
                    {teachersLoading ? (
                      <div className="mt-1 h-10 rounded-md border bg-muted animate-pulse" />
                    ) : (
                      <Select
                        value={selectedTeacherId}
                        onValueChange={setSelectedTeacherId}
                      >
                        <SelectTrigger
                          data-ocid="admin.student-teacher.select"
                          id="student-teacher"
                          className="mt-1"
                        >
                          <SelectValue
                            placeholder={
                              teachers.length === 0
                                ? "No teachers yet — add teachers first"
                                : "Select teacher"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                              {t.shifts && t.shifts.length > 0
                                ? ` (${t.shifts.join(", ")})`
                                : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
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
                  ⚠️ Could not fetch students from Supabase. Check your
                  connection and try again.
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
                      key={s.id}
                      data-ocid={`admin.sheet-student.item.${idx + 1}`}
                      className="shadow-card border-0"
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">
                            {s.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {s.studentClass || s.className || ""}
                            {s.teacherName ? ` · ${s.teacherName}` : ""}
                          </p>
                        </div>
                        {s.fees > 0 && (
                          <p className="text-sm font-medium text-primary">
                            ₹{s.fees}
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
            <div
              data-ocid="admin.reports.empty_state"
              className="text-center py-12 text-muted-foreground"
            >
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Reports are available in the main Admin dashboard</p>
              <p className="text-xs mt-1">
                Use the full admin panel to view attendance, fees, and sabak
                reports
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
