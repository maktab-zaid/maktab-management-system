import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NOTICES, SABAK_RECORDS } from "@/data/mockData";
import {
  type Session,
  addParentActivity,
  getAttendance,
  getSabak,
  getStudents,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  IndianRupee,
  Plus,
  Star,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { toast } from "sonner";

interface DashboardPageProps {
  onNavigate: (page: AppPage) => void;
  session?: Session;
}

/* ── Static stat values per requirements ───────────────────────────────── */
const STATS = [
  {
    label: "Total Students",
    value: "24",
    sub: "22 active students",
    icon: Users,
    trend: "+2 this month",
    trendPct: "+5%",
    up: true,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    borderColor: "border-t-primary",
  },
  {
    label: "Attendance Rate",
    value: "87%",
    sub: "20 present today",
    icon: CalendarCheck,
    trend: "+3% this week",
    trendPct: "+3%",
    up: true,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    borderColor: "border-t-success",
  },
  {
    label: "Fees Collected",
    value: "₹45,200",
    sub: "April 2026",
    icon: IndianRupee,
    trend: "78% of target",
    trendPct: "78%",
    up: true,
    iconColor: "text-gold-dark",
    iconBg: "bg-gold/10",
    borderColor: "border-t-gold",
  },
  {
    label: "Fees Pending",
    value: "₹12,800",
    sub: "7 students pending",
    icon: AlertCircle,
    trend: "Due Apr 20",
    trendPct: "22%",
    up: false,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    borderColor: "border-t-warning",
  },
] as const;

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

/* ── Sabak top performers ───────────────────────────────────────────────── */
const TOP_PERFORMERS = SABAK_RECORDS.sort(
  (a, b) => b.progressPercent - a.progressPercent,
).slice(0, 4);

/* ── Class progress ─────────────────────────────────────────────────────── */
const CLASS_PROGRESS = [
  { name: "Class Hifz", pct: 100, color: "bg-primary" },
  { name: "Class Naazra", pct: 60, color: "bg-success" },
  { name: "Class Mukammal Qaida", pct: 20, color: "bg-gold" },
  { name: "Class Nisf Qaida", pct: 30, color: "bg-warning" },
] as const;

/* ── Recent activity feed ───────────────────────────────────────────────── */
const RECENT_ACTIVITY = [
  {
    id: 1,
    icon: Users,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    text: "Ahmed Ibrahim enrolled in Hifz class",
    time: "Today, 9:15 AM",
  },
  {
    id: 2,
    icon: IndianRupee,
    iconBg: "bg-success/10",
    iconColor: "text-success",
    text: "Fee payment ₹1,500 received from Yusuf Ansari",
    time: "Today, 8:40 AM",
  },
  {
    id: 3,
    icon: CalendarDays,
    iconBg: "bg-gold/10",
    iconColor: "text-gold-dark",
    text: "Attendance marked for all classes",
    time: "Today, 8:00 AM",
  },
  {
    id: 4,
    icon: Bell,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    text: "Notice posted: Eid-ul-Fitr Holiday Apr 21–23",
    time: "Yesterday",
  },
  {
    id: 5,
    icon: BookOpen,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    text: "Sabak record updated for Omar Farooq — Para 22",
    time: "Yesterday",
  },
];

/* ── Animation variants ─────────────────────────────────────────────────── */
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

  // Track activity on mount
  useEffect(() => {
    if (session.mobile) {
      addParentActivity(session.mobile, "Viewed dashboard");
    }
  }, [session.mobile]);

  // Get child's attendance
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

  // Get child's sabak
  const allSabak = getSabak();
  const childSabak = child
    ? allSabak
        .filter((s) => s.studentId === child.id)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
    : null;

  // Get latest notice
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
    // fallback to empty
  }
  const latestNotice = noticesList[0] ?? null;

  const todayDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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
              {todayDate}
            </p>
            <h2 className="text-2xl font-bold mt-1">
              Assalamu Alaikum
              {child ? `, ${child.fatherName}` : ""}
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

      {/* Child info summary cards */}
      {child && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          variants={containerVariants}
          data-ocid="dashboard.child_stats"
        >
          {/* Attendance card */}
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

          {/* Sabak progress card */}
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
                  {childSabak ? `${childSabak.progress}%` : "—"}
                </p>
                <p className="text-sm font-semibold text-foreground/80 mt-1">
                  Sabak Progress
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {childSabak ? childSabak.lessonName : "No records yet"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Fees card */}
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

      {/* Child sabak detail + Latest notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sabak detail */}
        {childSabak && (
          <motion.div variants={cardVariants}>
            <Card
              className="card-elevated border-border/60 rounded-xl h-full"
              data-ocid="dashboard.child_sabak_detail"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    {child?.name}'s Sabak
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate("sabak")}
                    className="text-primary hover:text-primary hover:bg-primary/10 text-xs"
                    data-ocid="dashboard.view_sabak_button"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Current Lesson
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      {childSabak.lessonName}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold text-primary">
                        {childSabak.progress}%
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${childSabak.progress}%` }}
                        transition={{
                          duration: 0.8,
                          ease: "easeOut",
                          delay: 0.3,
                        }}
                      />
                    </div>
                  </div>
                  {childSabak.remarks && (
                    <div className="rounded-md bg-muted/40 px-3 py-2">
                      <p className="text-xs text-muted-foreground italic">
                        "{childSabak.remarks}"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        — {childSabak.updatedBy}, {childSabak.updatedAt}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Latest notice */}
        {latestNotice && (
          <motion.div variants={cardVariants}>
            <Card
              className="card-elevated border-border/60 rounded-xl h-full"
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

        {/* If no child found */}
        {!child && (
          <motion.div variants={cardVariants} className="col-span-full">
            <Card
              className="card-elevated border-border/60 rounded-xl"
              data-ocid="dashboard.no_child_state"
            >
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="font-semibold text-foreground">
                  No student linked
                </p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                  No student is linked to your mobile number. Please contact the
                  admin to register your child.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Quick links for parent */}
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

/* ── Component ──────────────────────────────────────────────────────────── */
export default function DashboardPage({
  onNavigate,
  session,
}: DashboardPageProps) {
  // Parent sees their own personalised dashboard
  if (session?.role === "parent") {
    return <ParentDashboard session={session} onNavigate={onNavigate} />;
  }

  // Admin / teacher see the full dashboard
  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="show"
      variants={containerVariants}
      data-ocid="dashboard.page"
    >
      {/* ── Welcome banner ────────────────────────────────────────────── */}
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
              Friday, 17 April 2026
            </p>
            <h2 className="text-2xl font-bold mt-1">
              Assalamu Alaikum,{" "}
              {session?.role === "teacher" ? session.name : "Admin"}
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Here&apos;s what&apos;s happening at Maktab Zaid Bin Sabit today.
            </p>
          </div>
          {/* Gold shimmer line */}
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

      {/* ── Stat cards ────────────────────────────────────────────────── */}
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
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      stat.up
                        ? "bg-success/10 text-success"
                        : "bg-warning/10 text-warning"
                    }`}
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
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
                <p className="text-xs text-muted-foreground/70 mt-1 italic">
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Quick Actions ─────────────────────────────────────────────── */}
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

      {/* ── Middle row: Recent Notices + Sabak Progress ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent Notices */}
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
                {NOTICES.slice(0, 3).map((notice, idx) => (
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
                        <Badge
                          variant="outline"
                          className={`text-xs py-0 ${
                            notice.priority === "High"
                              ? "border-destructive/40 text-destructive"
                              : notice.priority === "Medium"
                                ? "border-warning/40 text-warning"
                                : "border-border text-muted-foreground"
                          }`}
                        >
                          {notice.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {notice.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sabak Progress Overview */}
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
              <div className="space-y-3">
                {CLASS_PROGRESS.map((cls) => (
                  <div key={cls.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium text-xs">
                        {cls.name}
                      </span>
                      <span className="text-muted-foreground font-semibold text-xs">
                        {cls.pct}%
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <motion.div
                        className={`h-full rounded-full ${cls.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${cls.pct}%` }}
                        transition={{
                          duration: 0.8,
                          ease: "easeOut",
                          delay: 0.3,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Bottom row: Top Performers + Recent Activity ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Performers */}
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
              <div className="space-y-3">
                {TOP_PERFORMERS.map((rec, idx) => (
                  <div
                    key={rec.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors"
                    data-ocid={`dashboard.top_performer.${idx + 1}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        idx === 0
                          ? "bg-gold/20 text-gold-dark"
                          : idx === 1
                            ? "bg-muted text-muted-foreground"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {rec.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rec.surahName}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span
                        className={`text-sm font-bold ${
                          rec.progressPercent >= 80
                            ? "text-success"
                            : rec.progressPercent >= 60
                              ? "text-primary"
                              : "text-warning"
                        }`}
                      >
                        {rec.progressPercent}%
                      </span>
                      <div className="w-16 mt-1">
                        <div className="progress-bar-track">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${rec.progressPercent}%` }}
                            transition={{
                              duration: 0.7,
                              ease: "easeOut",
                              delay: 0.4 + idx * 0.1,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
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
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                  Today
                </span>
              </div>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3"
                    data-ocid={`dashboard.activity.${idx + 1}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      <item.icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground leading-snug">
                        {item.text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
