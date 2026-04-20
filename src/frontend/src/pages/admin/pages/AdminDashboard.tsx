import LogoBadge from "@/components/LogoBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type Student,
  type Teacher,
  getStudents,
  getTeachers,
} from "@/lib/storage";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  Clock,
  GraduationCap,
  LayoutGrid,
  Moon,
  Plus,
  RefreshCw,
  Sunrise,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  useAdminSheetStats,
  useStudentsSheet,
} from "../../../hooks/useGoogleSheets";

// ── Shift Overview Component ─────────────────────────────────────────────────

function ShiftOverview() {
  const [localStudents, setLocalStudents] = useState<Student[]>([]);
  const [localTeachers, setLocalTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    getStudents()
      .then(setLocalStudents)
      .catch(() => setLocalStudents([]));
    getTeachers()
      .then(setLocalTeachers)
      .catch(() => setLocalTeachers([]));
  }, []);

  const shifts = [
    {
      key: "morning",
      label: "Morning",
      emoji: "🌅",
      icon: <Sunrise className="w-5 h-5" />,
      studentCount: localStudents.filter((s) => s.timeSlot === "morning")
        .length,
      ustaadCount: localTeachers.filter(
        (t) => (t.timeSlot as string) === "morning",
      ).length,
      bg: "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200",
      iconBg: "bg-amber-100 text-amber-700",
      valueCls: "text-amber-800",
      labelCls: "text-amber-600",
    },
    {
      key: "afternoon",
      label: "Afternoon",
      emoji: "☀️",
      icon: <Clock className="w-5 h-5" />,
      studentCount: localStudents.filter((s) => s.timeSlot === "afternoon")
        .length,
      ustaadCount: localTeachers.filter(
        (t) => (t.timeSlot as string) === "afternoon",
      ).length,
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200",
      iconBg: "bg-emerald-100 text-emerald-700",
      valueCls: "text-emerald-800",
      labelCls: "text-emerald-600",
    },
    {
      key: "evening",
      label: "Evening",
      emoji: "🌙",
      icon: <Moon className="w-5 h-5" />,
      studentCount: localStudents.filter(
        (s) => s.timeSlot === "evening" || (s.timeSlot as string) === "maghrib",
      ).length,
      ustaadCount: localTeachers.filter(
        (t) =>
          (t.timeSlot as string) === "evening" ||
          (t.timeSlot as string) === "maghrib",
      ).length,
      bg: "bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200",
      iconBg: "bg-teal-100 text-teal-700",
      valueCls: "text-teal-800",
      labelCls: "text-teal-600",
    },
  ];

  return (
    <Card className="shadow-card border-primary/10">
      <CardContent className="p-5">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-primary" />
          Shift Overview
          <Badge
            variant="outline"
            className="text-xs bg-primary/5 text-primary border-primary/20"
          >
            Live
          </Badge>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {shifts.map((shift) => (
            <div
              key={shift.key}
              className={`rounded-xl border p-4 ${shift.bg}`}
              data-ocid={`admin.dashboard.shift.${shift.key}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${shift.iconBg}`}>
                  {shift.icon}
                </div>
                <span className="text-lg">{shift.emoji}</span>
              </div>
              <p className={`text-2xl font-bold ${shift.valueCls}`}>
                {shift.studentCount}
              </p>
              <p
                className={`text-xs font-semibold uppercase tracking-wide mt-0.5 ${shift.valueCls}`}
              >
                {shift.label} Students
              </p>
              <div
                className={`mt-2 pt-2 border-t border-current/10 flex items-center gap-1.5 ${shift.labelCls}`}
              >
                <Users className="w-3 h-3" />
                <span className="text-xs font-medium">
                  {shift.ustaadCount} Ustaad
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  isLoading?: boolean;
}

function StatCard({
  label,
  value,
  icon,
  color,
  badge,
  isLoading,
}: StatCardProps) {
  return (
    <Card className="stat-card-hover shadow-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            {isLoading ? (
              <Skeleton className="h-7 w-16 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{value}</p>
            )}
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {label}
            </p>
            {badge && (
              <Badge
                variant="outline"
                className="text-xs mt-1 bg-primary/5 text-primary border-primary/20"
              >
                {badge}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type TimeSlotFilter = "all" | "morning" | "afternoon" | "evening";

const TIME_SLOT_OPTIONS: {
  value: TimeSlotFilter;
  label: string;
  icon: React.ReactNode;
  emoji: string;
}[] = [
  {
    value: "all",
    label: "All",
    icon: <GraduationCap className="w-3.5 h-3.5" />,
    emoji: "📚",
  },
  {
    value: "morning",
    label: "Morning",
    icon: <Sunrise className="w-3.5 h-3.5" />,
    emoji: "🌅",
  },
  {
    value: "afternoon",
    label: "Afternoon",
    icon: <Clock className="w-3.5 h-3.5" />,
    emoji: "☀️",
  },
  {
    value: "evening",
    label: "Evening",
    icon: <Moon className="w-3.5 h-3.5" />,
    emoji: "🌙",
  },
];

interface AdminDashboardProps {
  onNavigate?: (page: string) => void;
}

export default function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const {
    totalStudents,
    totalTeachers,
    feesPaid,
    feesPending,
    classCounts,
    teacherNames,
    isLoading,
  } = useAdminSheetStats();
  const { data: students = [] } = useStudentsSheet();
  const queryClient = useQueryClient();
  const [timeSlotFilter, setTimeSlotFilter] = useState<TimeSlotFilter>("all");
  const [localStudents, setLocalStudents] = useState<Student[]>([]);
  const [localTeachers, setLocalTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    getStudents()
      .then(setLocalStudents)
      .catch(() => setLocalStudents([]));
    getTeachers()
      .then(setLocalTeachers)
      .catch(() => setLocalTeachers([]));
  }, []);

  // Time slot breakdown counts
  const morningCount = localStudents.filter(
    (s) => s.timeSlot === "morning",
  ).length;
  const afternoonCount = localStudents.filter(
    (s) => s.timeSlot === "afternoon",
  ).length;
  const eveningCount = localStudents.filter(
    (s) => s.timeSlot === "evening",
  ).length;

  const filteredCount =
    timeSlotFilter === "all"
      ? localStudents.length
      : localStudents.filter((s) => s.timeSlot === timeSlotFilter).length;

  const allClasses = Object.keys(classCounts);
  const totalClassCount = Object.values(classCounts).reduce((a, b) => a + b, 0);

  return (
    <div data-ocid="admin.dashboard.page" className="space-y-6">
      {/* Dashboard header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <LogoBadge size="sm" className="mt-0.5" />
          <div>
            <h1 className="text-xl font-bold text-foreground leading-tight">
              🕌 Maktab Zaid Bin Sabit Management Software
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground text-sm">Admin Dashboard</p>
              <Badge
                variant="outline"
                className="text-xs bg-primary/5 text-primary border-primary/20"
              >
                Academic Year 2026-27
              </Badge>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-primary border-primary/30 hover:bg-primary/5 shrink-0"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["sheet-students"] });
            queryClient.invalidateQueries({ queryKey: ["sheet-reports"] });
          }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Time slot filter + counts */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium mr-1">
            📊 Filter by time slot:
          </span>
          {TIME_SLOT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              data-ocid={`admin.dashboard.timeslot.${opt.value}`}
              onClick={() => setTimeSlotFilter(opt.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150",
                timeSlotFilter === opt.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:bg-primary/5 hover:text-primary hover:border-primary/30",
              )}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
          {timeSlotFilter !== "all" && (
            <span className="ml-2 text-sm font-semibold text-foreground">
              {filteredCount} student{filteredCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        {/* Quick slot breakdown pills */}
        <div className="flex gap-3 flex-wrap">
          {[
            {
              label: "Morning",
              count: morningCount,
              emoji: "🌅",
              color: "bg-amber-50 border-amber-200 text-amber-800",
            },
            {
              label: "Afternoon",
              count: afternoonCount,
              emoji: "☀️",
              color: "bg-blue-50 border-blue-200 text-blue-800",
            },
            {
              label: "Evening",
              count: eveningCount,
              emoji: "🌙",
              color: "bg-purple-50 border-purple-200 text-purple-800",
            },
          ].map((slot) => (
            <div
              key={slot.label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${slot.color}`}
            >
              <span>{slot.emoji}</span>
              {slot.label}:{" "}
              <span className="font-bold ml-0.5">{slot.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Shift Overview ─────────────────────────────────────────────── */}
      <ShiftOverview />

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <StatCard
            label={
              timeSlotFilter === "all"
                ? "Total Students"
                : `${timeSlotFilter.charAt(0).toUpperCase() + timeSlotFilter.slice(1)} Students`
            }
            value={timeSlotFilter === "all" ? totalStudents : filteredCount}
            icon={<GraduationCap className="w-6 h-6 text-white" />}
            color="bg-primary"
            badge="Live"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            label="Total Teachers"
            value={totalTeachers}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-chart-2"
            badge="Live"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatCard
            label="Fees Paid"
            value={feesPaid}
            icon={<BookOpen className="w-6 h-6 text-white" />}
            color="bg-chart-3"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            label="Fees Pending"
            value={feesPending}
            icon={<AlertCircle className="w-6 h-6 text-white" />}
            color="bg-destructive"
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-card">
        <CardContent className="p-5">
          <h2 className="font-semibold text-foreground mb-4">
            ⚡ Quick Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              data-ocid="admin.dashboard.add_ustaad_button"
              size="sm"
              className="gap-2 bg-primary text-primary-foreground"
              onClick={() => onNavigate?.("teachers")}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Ustaad
            </Button>
            <Button
              data-ocid="admin.dashboard.remove_ustaad_button"
              size="sm"
              variant="outline"
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => onNavigate?.("teachers")}
            >
              Remove Ustaad
            </Button>
            <Button
              data-ocid="admin.dashboard.add_student_button"
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => onNavigate?.("students")}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Student
            </Button>
            <Button
              data-ocid="admin.dashboard.attendance_button"
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => onNavigate?.("attendance")}
            >
              Mark Attendance
            </Button>
            <Button
              data-ocid="admin.dashboard.reports_button"
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => onNavigate?.("monthly-report")}
            >
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Class-wise count */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              📖 Class-wise Student Count
              <Badge
                variant="outline"
                className="text-xs bg-primary/5 text-primary border-primary/20"
              >
                Live
              </Badge>
            </h2>
            {isLoading ? (
              <div
                className="space-y-2"
                data-ocid="admin.dashboard.loading_state"
              >
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : allClasses.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No class data in Google Sheet yet
              </p>
            ) : (
              <div className="space-y-2">
                {allClasses.map((cls) => {
                  const count = classCounts[cls] ?? 0;
                  const pct =
                    totalClassCount > 0 ? (count / totalClassCount) * 100 : 0;
                  return (
                    <div key={cls} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-36 shrink-0 truncate">
                        {cls}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-6 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teachers */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              👨‍🏫 Teachers
              <Badge
                variant="outline"
                className="text-xs bg-primary/5 text-primary border-primary/20"
              >
                Live
              </Badge>
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : teacherNames.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No teacher data in Google Sheet yet
              </p>
            ) : (
              <div className="space-y-3">
                {teacherNames.slice(0, 6).map((name, i) => {
                  const count = students.filter(
                    (s) => s.teacher.toLowerCase() === name.toLowerCase(),
                  ).length;
                  const lt = localTeachers.find(
                    (t) => t.name.toLowerCase() === name.toLowerCase(),
                  );
                  return (
                    <div
                      key={name}
                      data-ocid={`admin.dashboard.teacher.item.${i + 1}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {count} student{count !== 1 ? "s" : ""}
                          {lt?.timeSlot ? ` · ${lt.timeSlot}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
