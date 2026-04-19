import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  type Session,
  addParentActivity,
  getActivityLog,
  getAttendance,
  getFees,
  getNotices,
  getSabak,
  getStudents,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { STUDENT_CLASS_OPTIONS } from "@/types/index";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Clock,
  Edit,
  IndianRupee,
  MessageCircle,
  Moon,
  Plus,
  Star,
  Sun,
  TrendingDown,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

interface DashboardPageProps {
  onNavigate: (page: AppPage) => void;
  session?: Session;
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 22 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};

/* ── Quick actions ──────────────────────────────────────────────────────── */
const QUICK_ACTIONS = [
  {
    label: "Add Student",
    icon: Plus,
    ocid: "dashboard.add_student_button",
    page: "students" as AppPage,
    color: "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
  },
  {
    label: "Mark Attendance",
    icon: UserCheck,
    ocid: "dashboard.mark_attendance_button",
    page: "attendance" as AppPage,
    color: "hover:border-success/50 hover:bg-success/5 hover:text-success",
  },
  {
    label: "Collect Fees",
    icon: IndianRupee,
    ocid: "dashboard.collect_fees_button",
    page: "fees" as AppPage,
    color: "hover:border-gold/50 hover:bg-gold/5 hover:text-gold-dark",
  },
] as const;

/* ── Time Slot Student Count Cards ──────────────────────────────────────── */
function TimeSlotStats() {
  const students = useMemo(() => getStudents(), []);
  const teachersList = useMemo(() => {
    try {
      const raw = localStorage.getItem("madrasa_teachers");
      return raw
        ? (JSON.parse(raw) as Array<{
            name: string;
            timeSlot?: string | string[];
            shifts?: string[];
          }>)
        : [];
    } catch {
      return [];
    }
  }, []);

  const morningCount = students.filter(
    (s) => (s.timeSlot ?? "").toLowerCase() === "morning",
  ).length;
  const afternoonCount = students.filter(
    (s) => (s.timeSlot ?? "").toLowerCase() === "afternoon",
  ).length;
  const eveningCount = students.filter(
    (s) => (s.timeSlot ?? "").toLowerCase() === "evening",
  ).length;

  function countUstaadsForShift(shift: string) {
    return teachersList.filter((t) => {
      const allShifts =
        t.shifts && t.shifts.length > 0
          ? t.shifts
          : Array.isArray(t.timeSlot)
            ? t.timeSlot
            : t.timeSlot
              ? t.timeSlot.split(",").map((s: string) => s.trim())
              : [];
      return allShifts
        .map((s: string) => s.toLowerCase())
        .includes(shift.toLowerCase());
    }).length;
  }

  const slots = [
    {
      label: "Morning",
      count: morningCount,
      ustaadCount: countUstaadsForShift("morning"),
      icon: Sun,
      colorClass: "text-yellow-600",
      bg: "bg-yellow-50 dark:bg-yellow-950/20",
      border: "border-t-yellow-400",
      progressColor: "bg-yellow-400",
    },
    {
      label: "Afternoon",
      count: afternoonCount,
      ustaadCount: countUstaadsForShift("afternoon"),
      icon: Clock,
      colorClass: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/20",
      border: "border-t-orange-400",
      progressColor: "bg-orange-400",
    },
    {
      label: "Evening",
      count: eveningCount,
      ustaadCount: countUstaadsForShift("evening"),
      icon: Moon,
      colorClass: "text-indigo-600",
      bg: "bg-indigo-50 dark:bg-indigo-950/20",
      border: "border-t-indigo-400",
      progressColor: "bg-indigo-400",
    },
  ];

  return (
    <div
      className="grid grid-cols-3 gap-3"
      data-ocid="dashboard.timeslot_stats"
    >
      {slots.map((slot, i) => {
        const total = morningCount + afternoonCount + eveningCount;
        const pct = total > 0 ? Math.round((slot.count / total) * 100) : 0;
        return (
          <motion.div key={slot.label} variants={cardVariants}>
            <Card
              className={`h-full border-border/60 border-t-[3px] ${slot.border} rounded-xl stat-card-hover card-elevated`}
              data-ocid={`dashboard.timeslot_card.${i + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg ${slot.bg} flex items-center justify-center`}
                  >
                    <slot.icon className={`w-4 h-4 ${slot.colorClass}`} />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium text-right leading-tight">
                    {slot.ustaadCount} Ustaad
                    {slot.ustaadCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-2xl font-bold text-foreground tracking-tight">
                  {slot.count}
                </p>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                  {slot.label}
                </p>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Share</span>
                    <span className="font-semibold">{pct}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted/40">
                    <motion.div
                      className={`h-full rounded-full ${slot.progressColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: 0.3,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Class Analytics ─────────────────────────────────────────────────────── */
function ClassAnalytics() {
  const students = useMemo(() => getStudents(), []);

  const classCounts = useMemo(() => {
    return STUDENT_CLASS_OPTIONS.map((cls) => ({
      name: cls,
      count: students.filter((s) => s.studentClass === cls).length,
    }));
  }, [students]);

  const total = students.length;

  return (
    <Card
      className="card-elevated border-border/60 rounded-xl"
      data-ocid="dashboard.class_analytics"
    >
      <CardContent className="p-5">
        <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-primary" />
          Students by Class
        </h3>
        <div className="space-y-2">
          {classCounts.map((cls) => {
            const pct = total > 0 ? Math.round((cls.count / total) * 100) : 0;
            return (
              <div key={cls.name} className="flex items-center gap-3">
                <span className="text-xs font-medium text-foreground w-36 shrink-0 truncate">
                  {cls.name}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-muted/40">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
                <span className="text-xs font-bold text-foreground tabular-nums w-6 text-right shrink-0">
                  {cls.count}
                </span>
              </div>
            );
          })}
          {total === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3 italic">
              No students yet. Add students to see class distribution.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Parent Dashboard ───────────────────────────────────────────────────── */
function ParentDashboard({
  session,
  onNavigate,
}: {
  session: Session;
  onNavigate: (page: AppPage) => void;
}) {
  const students = getStudents();
  const child = students.find((s) => s.parentMobile === session.mobile);
  const [shiftFilter, setShiftFilter] = useState<string>("all");

  useEffect(() => {
    if (session.mobile) {
      addParentActivity(session.mobile, "Viewed dashboard");
    }
  }, [session.mobile]);

  const attendance = getAttendance();
  const childAttendance = child
    ? attendance.filter((a) => a.studentId === child.id)
    : [];
  const presentCount = childAttendance.filter(
    (a) => a.status === "present",
  ).length;
  const totalAttendance = childAttendance.length;
  const attendancePct =
    totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : null;

  const allSabak = getSabak();
  const childSabak = child
    ? allSabak
        .filter((s) => s.studentId === child.id)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
    : null;

  const noticesList = [] as Array<{
    id: string;
    title: string;
    message: string;
    date: string;
    createdBy: string;
  }>;
  try {
    const stored = localStorage.getItem("madrasa_notices");
    if (stored) {
      const parsed = JSON.parse(stored) as Array<{
        id: string;
        title: string;
        message: string;
        date: string;
        createdBy: string;
      }>;
      parsed.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      noticesList.push(...parsed);
    }
  } catch {
    // fallback
  }
  const latestNotice = noticesList[0] ?? null;

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const SHIFTS = ["Morning", "Afternoon", "Evening"];

  // Apply shift filter to child data display
  const childMatchesFilter =
    shiftFilter === "all" ||
    (child &&
      (child.timeSlot ?? "").toLowerCase() === shiftFilter.toLowerCase());

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={containerVariants}
      data-ocid="dashboard.page"
    >
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl overflow-hidden relative bg-primary text-primary-foreground p-6 shadow-elevated">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='0.5'%3E%3Cpath d='M30 0l3 9 9-3-3 9 9 3-9 3 3 9-9-3-3 9-3-9-9 3 3-9-9-3 9-3-3-9 9 3z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <p className="text-primary-foreground/70 text-sm font-medium">
              {todayDate}
            </p>
            <h2 className="text-2xl font-bold mt-1">
              Assalamu Alaikum{child ? `, ${child.fatherName}` : ""}
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              {child
                ? `Viewing ${child.name}'s progress at Maktab Zaid Bin Sabit`
                : "Welcome to Maktab Zaid Bin Sabit"}
            </p>
          </div>
          <div
            className="gold-shimmer absolute bottom-0 left-0 right-0"
            aria-hidden="true"
          />
          <div
            className="absolute right-6 top-1/2 -translate-y-1/2 text-primary-foreground/10 text-8xl font-bold select-none pointer-events-none hidden md:block"
            aria-hidden="true"
          >
            مكتب
          </div>
        </div>
      </motion.div>

      {/* Child Info Card */}
      {child && (
        <motion.div variants={cardVariants}>
          <Card className="card-elevated border-border/60 rounded-xl">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                Student Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Student Name</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {child.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Class</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {child.studentClass || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ustaad</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {child.teacherName || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Shift</p>
                  <p className="font-semibold text-foreground text-sm mt-0.5 capitalize">
                    {child.timeSlot || "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Shift filter */}
      <motion.div variants={fadeUp}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Filter by Shift
        </p>
        <div
          className="flex flex-wrap gap-2"
          data-ocid="dashboard.shift_filter"
        >
          <button
            type="button"
            onClick={() => setShiftFilter("all")}
            data-ocid="dashboard.shift_filter_all"
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 ${
              shiftFilter === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/60 text-muted-foreground hover:bg-muted/40"
            }`}
          >
            All
          </button>
          {SHIFTS.map((shift) => (
            <button
              key={shift}
              type="button"
              onClick={() => setShiftFilter(shift)}
              data-ocid={`dashboard.shift_filter_${shift.toLowerCase()}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 ${
                shiftFilter === shift
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border/60 text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {shift}
            </button>
          ))}
        </div>
      </motion.div>

      {child && childMatchesFilter && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          variants={containerVariants}
          data-ocid="dashboard.child_stats"
        >
          <motion.div variants={cardVariants}>
            <Card
              className="h-full border-border/60 border-t-[3px] border-t-success rounded-xl stat-card-hover card-elevated cursor-pointer"
              onClick={() => onNavigate("attendance")}
              data-ocid="dashboard.child_attendance_card"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center shadow-sm">
                    <CalendarCheck className="w-5 h-5 text-success" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {attendancePct !== null ? `${attendancePct}%` : "—"}
                </p>
                <p className="text-sm font-semibold text-foreground/80 mt-1">
                  Attendance
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalAttendance > 0
                    ? `${presentCount} of ${totalAttendance} days present`
                    : "No records yet"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card
              className="h-full border-border/60 border-t-[3px] border-t-primary rounded-xl stat-card-hover card-elevated cursor-pointer"
              onClick={() => onNavigate("sabak")}
              data-ocid="dashboard.child_sabak_card"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shadow-sm">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {childSabak ? `${childSabak.progress ?? 0}%` : "—"}
                </p>
                <p className="text-sm font-semibold text-foreground/80 mt-1">
                  Sabak Progress
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {childSabak
                    ? (childSabak.lessonName ??
                      childSabak.currentLesson ??
                      "Recorded")
                    : "No records yet"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card
              className={`h-full border-border/60 border-t-[3px] rounded-xl stat-card-hover card-elevated cursor-pointer ${child.feesStatus === "paid" ? "border-t-success" : "border-t-warning"}`}
              onClick={() => onNavigate("fees")}
              data-ocid="dashboard.child_fees_card"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${child.feesStatus === "paid" ? "bg-success/10" : "bg-warning/10"}`}
                  >
                    <IndianRupee
                      className={`w-5 h-5 ${child.feesStatus === "paid" ? "text-success" : "text-warning"}`}
                    />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  ₹{child.fees.toLocaleString("en-IN")}
                </p>
                <p className="text-sm font-semibold text-foreground/80 mt-1">
                  Monthly Fees
                </p>
                <p
                  className={`text-xs mt-1 font-semibold ${child.feesStatus === "paid" ? "text-success" : "text-warning"}`}
                >
                  {child.feesStatus === "paid" ? "✓ Paid" : "● Pending"}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {child && !childMatchesFilter && (
        <motion.div variants={cardVariants}>
          <Card
            className="card-elevated border-border/60 rounded-xl"
            data-ocid="dashboard.shift_no_match_state"
          >
            <CardContent className="p-8 text-center">
              <p className="font-semibold text-foreground">
                No data for {shiftFilter} shift
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Your child is enrolled in the{" "}
                <span className="font-medium capitalize">{child.timeSlot}</span>{" "}
                session.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {latestNotice && (
        <motion.div variants={cardVariants}>
          <Card
            className="card-elevated border-border/60 rounded-xl"
            data-ocid="dashboard.latest_notice"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gold-dark" />
                  Latest Notice
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("notices")}
                  className="text-primary hover:text-primary hover:bg-primary/10 text-xs"
                  data-ocid="dashboard.view_notices_button"
                >
                  All Notices <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              <div className="rounded-xl border-2 border-gold/60 bg-gold/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gold/20 text-gold-dark border border-gold/30">
                    <Star className="w-3 h-3" />
                    Latest
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(latestNotice.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {latestNotice.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                  {latestNotice.message}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {!child && (
        <motion.div variants={cardVariants} className="col-span-full">
          <Card
            className="card-elevated border-border/60 rounded-xl"
            data-ocid="dashboard.no_child_state"
          >
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-semibold text-foreground">No student linked</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                No student is linked to your mobile number. Please contact the
                admin to register your child.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div variants={fadeUp} data-ocid="dashboard.quick_actions">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Quick Access
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            {
              label: "Attendance",
              icon: CalendarCheck,
              page: "attendance" as AppPage,
              ocid: "dashboard.view_attendance_button",
              color:
                "hover:border-success/50 hover:bg-success/5 hover:text-success",
            },
            {
              label: "Sabak Progress",
              icon: BookOpen,
              page: "sabak" as AppPage,
              ocid: "dashboard.view_sabak_link_button",
              color:
                "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
            },
            {
              label: "Notices",
              icon: Bell,
              page: "notices" as AppPage,
              ocid: "dashboard.view_notices_link_button",
              color:
                "hover:border-gold/50 hover:bg-gold/5 hover:text-gold-dark",
            },
            {
              label: "Pay Fees",
              icon: IndianRupee,
              page: "fees" as AppPage,
              ocid: "dashboard.pay_fees_link_button",
              color:
                "hover:border-warning/50 hover:bg-warning/5 hover:text-warning",
            },
          ].map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className={`flex items-center gap-2 rounded-xl border-border/60 transition-all duration-200 shadow-sm font-medium ${action.color}`}
              onClick={() => onNavigate(action.page)}
              data-ocid={action.ocid}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Live Recent Activity (reads from ActivityLog) ──────────────────────── */
function LiveRecentActivity() {
  const logs = useMemo(() => getActivityLog().slice(0, 5), []);

  if (logs.length === 0) {
    return (
      <div
        className="py-4 text-center"
        data-ocid="dashboard.activity.empty_state"
      >
        <CalendarDays className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground">No activity yet</p>
        <p className="text-xs text-muted-foreground/60 mt-0.5">
          Ustaad actions will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {logs.map((entry, idx) => {
        const isAdded = entry.action === "added_student";
        const isRemoved = entry.action === "removed_student";
        const iconBg = isAdded
          ? "bg-success/10"
          : isRemoved
            ? "bg-destructive/10"
            : "bg-primary/10";
        const iconColor = isAdded
          ? "text-success"
          : isRemoved
            ? "text-destructive"
            : "text-primary";
        const Icon = isAdded ? UserPlus : isRemoved ? UserMinus : Edit;
        const verb = isAdded ? "added" : isRemoved ? "removed" : "updated";
        const text = `${entry.actorName} ${verb} ${entry.targetStudentName}`;
        const ts = new Date(entry.timestamp);
        const timeStr = `${ts.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        })} ${ts.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}`;

        return (
          <div
            key={entry.id}
            className="flex items-start gap-3"
            data-ocid={`dashboard.activity.${idx + 1}`}
          >
            <div
              className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
            >
              <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-foreground leading-snug">{text}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{timeStr}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Monthly Summary WhatsApp Button ────────────────────────────────────── */
function MonthlySummaryButton() {
  const students = useMemo(() => getStudents(), []);
  const fees = useMemo(() => getFees(), []);
  const attendance = useMemo(() => getAttendance(), []);

  const totalStudents = students.length;
  const feesCollected = fees
    .filter((f) => f.status === "paid")
    .reduce((s, f) => s + f.amount, 0);
  const feesPending = fees
    .filter((f) => f.status === "pending")
    .reduce((s, f) => s + f.amount, 0);
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const totalAttendance = attendance.length;
  const attendancePct =
    totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0;

  const monthYear = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const message = [
    "Monthly Summary - Maktab Zaid Bin Sabit",
    `Total Students: ${totalStudents}`,
    `Fees Collected: ₹${feesCollected.toLocaleString("en-IN")}`,
    `Pending Fees: ₹${feesPending.toLocaleString("en-IN")}`,
    `Attendance: ${attendancePct}%`,
    `Month: ${monthYear}`,
  ].join("\n");

  const waLink = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <Card
      className="card-elevated border-border/60 rounded-xl"
      data-ocid="dashboard.monthly_summary"
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              Monthly Summary — WhatsApp
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Send {monthYear} summary to parents or management
            </p>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid="dashboard.send_monthly_summary_button"
          >
            <Button
              type="button"
              className="gap-2 font-semibold whitespace-nowrap"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" />
              Send Monthly Summary
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Teacher Dashboard (Session-filtered) ───────────────────────────────── */
function TeacherDashboard({
  session,
  onNavigate,
}: {
  session: Session;
  onNavigate: (page: AppPage) => void;
}) {
  const assignedSessions: string[] =
    session.teacherSessions && session.teacherSessions.length > 0
      ? session.teacherSessions.map((s) => s.toLowerCase())
      : session.teacherTimeSlot
        ? [session.teacherTimeSlot.toLowerCase()]
        : [];

  const allStudents = useMemo(() => getStudents(), []);
  const myStudents = useMemo(
    () =>
      assignedSessions.length > 0
        ? allStudents.filter((s) =>
            assignedSessions.includes((s.timeSlot ?? "").toLowerCase()),
          )
        : allStudents,
    [allStudents, assignedSessions],
  );

  const myStudentIds = useMemo(
    () => new Set(myStudents.map((s) => s.id)),
    [myStudents],
  );

  const attendance = useMemo(() => getAttendance(), []);
  const fees = useMemo(() => getFees(), []);

  const myAttendance = useMemo(
    () => attendance.filter((a) => myStudentIds.has(a.studentId)),
    [attendance, myStudentIds],
  );
  const myFees = useMemo(
    () => fees.filter((f) => myStudentIds.has(f.studentId)),
    [fees, myStudentIds],
  );

  const presentCount = myAttendance.filter(
    (a) => a.status === "present",
  ).length;
  const totalAttendance = myAttendance.length;
  const attendancePct =
    totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0;

  const feesCollected = myFees
    .filter((f) => f.status === "paid")
    .reduce((s, f) => s + f.amount, 0);
  const feesPending = myFees
    .filter((f) => f.status === "pending")
    .reduce((s, f) => s + f.amount, 0);
  const pendingStudentsCount = myStudents.filter(
    (s) => s.feesStatus === "pending",
  ).length;

  const sessionLabel =
    assignedSessions.length > 0
      ? assignedSessions
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(", ")
      : "All Sessions";

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const teacherStats = [
    {
      label: "My Students",
      value: String(myStudents.length),
      sub: `${sessionLabel} session`,
      icon: Users,
      trendPct: `${assignedSessions.length} session${assignedSessions.length !== 1 ? "s" : ""}`,
      up: true,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      borderColor: "border-t-primary",
    },
    {
      label: "Attendance Rate",
      value: `${attendancePct}%`,
      sub: `${presentCount} present of ${totalAttendance} records`,
      icon: CalendarCheck,
      trendPct: `${attendancePct}%`,
      up: attendancePct >= 70,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      borderColor: "border-t-success",
    },
    {
      label: "Fees Collected",
      value: `₹${feesCollected.toLocaleString("en-IN")}`,
      sub: "My students",
      icon: IndianRupee,
      trendPct: "Paid",
      up: true,
      iconColor: "text-gold-dark",
      iconBg: "bg-gold/10",
      borderColor: "border-t-gold",
    },
    {
      label: "Fees Pending",
      value: `₹${feesPending.toLocaleString("en-IN")}`,
      sub: `${pendingStudentsCount} students pending`,
      icon: AlertCircle,
      trendPct: "Pending",
      up: false,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      borderColor: "border-t-warning",
    },
  ];

  const teacherQuickActions = [
    {
      label: "Mark Attendance",
      icon: UserCheck,
      ocid: "dashboard.mark_attendance_button",
      page: "attendance" as AppPage,
      color: "hover:border-success/50 hover:bg-success/5 hover:text-success",
    },
    {
      label: "Sabak Progress",
      icon: BookOpen,
      ocid: "dashboard.sabak_button",
      page: "sabak" as AppPage,
      color: "hover:border-primary/50 hover:bg-primary/5 hover:text-primary",
    },
    {
      label: "Fees",
      icon: IndianRupee,
      ocid: "dashboard.fees_button",
      page: "fees" as AppPage,
      color: "hover:border-gold/50 hover:bg-gold/5 hover:text-gold-dark",
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={containerVariants}
      data-ocid="dashboard.page"
    >
      {/* Welcome banner */}
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl overflow-hidden relative bg-primary text-primary-foreground p-6 shadow-elevated">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='0.5'%3E%3Cpath d='M30 0l3 9 9-3-3 9 9 3-9 3 3 9-9-3-3 9-3-9-9 3 3-9-9-3 9-3-3-9 9 3z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <p className="text-primary-foreground/70 text-sm font-medium">
              {todayDate} · Academic Year 2026–27
            </p>
            <h2 className="text-xl font-bold mt-1">
              Assalamu Alaikum, {session.name}
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Viewing data for:{" "}
              <span className="font-semibold">{sessionLabel}</span>
            </p>
          </div>
          <div
            className="gold-shimmer absolute bottom-0 left-0 right-0"
            aria-hidden="true"
          />
          <div
            className="absolute right-6 top-1/2 -translate-y-1/2 text-primary-foreground/10 text-8xl font-bold select-none pointer-events-none hidden md:block"
            aria-hidden="true"
          >
            مكتب
          </div>
        </div>
      </motion.div>

      {/* Session badges */}
      {assignedSessions.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider self-center mr-1">
            Your Sessions:
          </span>
          {assignedSessions.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
            >
              {s === "morning" && <Sun className="w-3 h-3" />}
              {s === "afternoon" && <Clock className="w-3 h-3" />}
              {s === "evening" && <Moon className="w-3 h-3" />}
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          ))}
        </motion.div>
      )}

      {/* Stats filtered to Ustaad's sessions */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        variants={containerVariants}
        data-ocid="dashboard.stats"
      >
        {teacherStats.map((stat, i) => (
          <motion.div key={stat.label} variants={cardVariants}>
            <Card
              className={`h-full border-border/60 border-t-[3px] ${stat.borderColor} rounded-xl stat-card-hover card-elevated`}
              data-ocid={`dashboard.stat_card.${i + 1}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-sm`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${stat.up ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
                  >
                    {stat.up ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.trendPct}
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-foreground/80 mt-1">
                  {stat.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp} data-ocid="dashboard.quick_actions">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-3">
          {teacherQuickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className={`flex items-center gap-2 rounded-xl border-border/60 transition-all duration-200 shadow-sm font-medium ${action.color}`}
              onClick={() => onNavigate(action.page)}
              data-ocid={action.ocid}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={cardVariants}>
        <Card
          className="card-elevated border-border/60 rounded-xl"
          data-ocid="dashboard.recent_activity"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-gold-dark" />
                Recent Activity
              </h3>
            </div>
            <LiveRecentActivity />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function DashboardPage({
  onNavigate,
  session,
}: DashboardPageProps) {
  const liveNotices = useMemo(() => getNotices().slice(0, 3), []);

  if (session?.role === "parent") {
    return <ParentDashboard session={session} onNavigate={onNavigate} />;
  }

  if (session?.role === "teacher") {
    return <TeacherDashboard session={session} onNavigate={onNavigate} />;
  }

  // Admin dashboard — all stats computed from real data
  const students = getStudents();
  const attendance = getAttendance();
  const fees = getFees();

  const totalStudents = students.length;
  const presentCount = attendance.filter((a) => a.status === "present").length;
  const totalAttendance = attendance.length;
  const attendancePct =
    totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 0;
  const feesCollected = fees
    .filter((f) => f.status === "paid")
    .reduce((s, f) => s + f.amount, 0);
  const feesPending = fees
    .filter((f) => f.status === "pending")
    .reduce((s, f) => s + f.amount, 0);

  const STATS = [
    {
      label: "Total Students",
      value: String(totalStudents),
      sub: `${totalStudents} enrolled`,
      icon: Users,
      trendPct: totalStudents > 0 ? `${totalStudents} total` : "0 total",
      up: true,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      borderColor: "border-t-primary",
    },
    {
      label: "Attendance Rate",
      value: `${attendancePct}%`,
      sub:
        totalAttendance > 0
          ? `${presentCount} present of ${totalAttendance}`
          : "No records yet",
      icon: CalendarCheck,
      trendPct: `${attendancePct}%`,
      up: attendancePct >= 70,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      borderColor: "border-t-success",
    },
    {
      label: "Fees Collected",
      value: `₹${feesCollected.toLocaleString("en-IN")}`,
      sub: feesCollected > 0 ? "Total paid" : "No fees collected yet",
      icon: IndianRupee,
      trendPct: "Paid",
      up: true,
      iconColor: "text-gold-dark",
      iconBg: "bg-gold/10",
      borderColor: "border-t-gold",
    },
    {
      label: "Fees Pending",
      value: `₹${feesPending.toLocaleString("en-IN")}`,
      sub: feesPending > 0 ? "Total pending" : "No pending fees",
      icon: AlertCircle,
      trendPct: "Pending",
      up: feesPending === 0,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      borderColor: "border-t-warning",
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={containerVariants}
      data-ocid="dashboard.page"
    >
      {/* ── Welcome banner ──────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl overflow-hidden relative bg-primary text-primary-foreground p-6 shadow-elevated">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='0.5'%3E%3Cpath d='M30 0l3 9 9-3-3 9 9 3-9 3 3 9-9-3-3 9-3-9-9 3 3-9-9-3 9-3-3-9 9 3z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
            aria-hidden="true"
          />
          <div className="relative z-10">
            <p className="text-primary-foreground/70 text-sm font-medium">
              Academic Year 2026–27
            </p>
            <h2 className="text-xl font-bold mt-1">
              Maktab Zaid Bin Sabit Management Software
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Admin dashboard — full system overview
            </p>
          </div>
          <div
            className="gold-shimmer absolute bottom-0 left-0 right-0"
            aria-hidden="true"
          />
          <div
            className="absolute right-6 top-1/2 -translate-y-1/2 text-primary-foreground/10 text-8xl font-bold select-none pointer-events-none hidden md:block"
            aria-hidden="true"
          >
            مكتب
          </div>
        </div>
      </motion.div>

      {/* ── Time Slot Student Counts (Admin only) ──────────────────── */}
      <motion.div variants={fadeUp}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Students by Time Slot
        </p>
        <TimeSlotStats />
      </motion.div>

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        variants={containerVariants}
        data-ocid="dashboard.stats"
      >
        {STATS.map((stat, i) => (
          <motion.div key={stat.label} variants={cardVariants}>
            <Card
              className={`h-full border-border/60 border-t-[3px] ${stat.borderColor} rounded-xl stat-card-hover card-elevated`}
              data-ocid={`dashboard.stat_card.${i + 1}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-sm`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <span
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${stat.up ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
                  >
                    {stat.up ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {stat.trendPct}
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm font-semibold text-foreground/80 mt-1">
                  {stat.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Quick Actions ─────────────────────────────────────────── */}
      <motion.div variants={fadeUp} data-ocid="dashboard.quick_actions">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className={`flex items-center gap-2 rounded-xl border-border/60 transition-all duration-200 shadow-sm font-medium ${action.color}`}
              onClick={() => {
                toast.success(action.label, {
                  description: `Navigating to ${action.label}...`,
                });
                onNavigate(action.page);
              }}
              data-ocid={action.ocid}
            >
              <action.icon className="w-4 h-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* ── Middle row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={cardVariants}>
          <Card
            className="card-elevated border-border/60 rounded-xl h-full"
            data-ocid="dashboard.recent_notices"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Bell className="w-4 h-4 text-gold-dark" />
                  Recent Notices
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("notices")}
                  className="text-primary hover:text-primary hover:bg-primary/10 text-xs"
                  data-ocid="dashboard.view_notices_button"
                >
                  View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {liveNotices.length === 0 ? (
                  <div
                    className="py-4 text-center"
                    data-ocid="dashboard.notices.empty_state"
                  >
                    <Bell className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-xs text-muted-foreground">
                      No notices yet
                    </p>
                  </div>
                ) : (
                  liveNotices.map((notice, idx) => (
                    <div
                      key={notice.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors border border-transparent hover:border-border/50 cursor-pointer"
                      data-ocid={`dashboard.notice.${idx + 1}`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bell className="w-3.5 h-3.5 text-gold-dark" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {notice.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {notice.date}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            · {notice.createdBy}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Sabak Progress (empty state if no data) ────────── */}
        <motion.div variants={cardVariants}>
          <Card
            className="card-elevated border-border/60 rounded-xl h-full"
            data-ocid="dashboard.sabak_progress"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Sabak Progress Overview
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate("sabak")}
                  className="text-primary hover:text-primary hover:bg-primary/10 text-xs"
                  data-ocid="dashboard.view_sabak_button"
                >
                  View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
              <div
                className="py-6 text-center"
                data-ocid="dashboard.sabak_progress.empty_state"
              >
                <BookOpen className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs font-semibold text-muted-foreground">
                  No sabak data yet
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  Add sabak records to see progress here
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Class Analytics ────────────────────────────────────────── */}
      <motion.div variants={cardVariants}>
        <ClassAnalytics />
      </motion.div>

      {/* ── Bottom row ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={cardVariants}>
          <Card
            className="card-elevated border-border/60 rounded-xl h-full"
            data-ocid="dashboard.top_performers"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold-dark" />
                  Top Performers (Sabak)
                </h3>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  This month
                </span>
              </div>
              <div
                className="py-4 text-center"
                data-ocid="dashboard.top_performers.empty_state"
              >
                <Star className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">
                  No performance data yet
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card
            className="card-elevated card-gold-accent border-border/60 rounded-xl h-full"
            data-ocid="dashboard.recent_activity"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gold-dark" />
                  Recent Activity
                </h3>
                {session?.role === "admin" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate("activity-log")}
                    className="text-primary hover:text-primary hover:bg-primary/10 text-xs"
                    data-ocid="dashboard.view_activity_log_button"
                  >
                    View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                )}
              </div>
              <LiveRecentActivity />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Summary WhatsApp — admin only */}
      {session?.role === "admin" && (
        <motion.div variants={fadeUp}>
          <MonthlySummaryButton />
        </motion.div>
      )}
    </motion.div>
  );
}
