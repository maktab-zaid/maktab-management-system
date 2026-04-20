import LogoBadge from "@/components/LogoBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Bell,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Cloud,
  Image,
  Info,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useStudentsSheet } from "../../hooks/useGoogleSheets";
import { getSession, getUnreadCount } from "../../lib/storage";
import type { TeacherPage } from "../../types";
import { normalizeMobile } from "../../utils/googleSheets";
import AboutUsTeacherPage from "./pages/AboutUsTeacherPage";
import AddStudentTeacherPage from "./pages/AddStudentTeacherPage";
import MyStudentsPage from "./pages/MyStudentsPage";
import TeacherAttendancePage from "./pages/TeacherAttendancePage";
import TimeSlotStudentsPage from "./pages/TimeSlotStudentsPage";
import UpdateSabakPage from "./pages/UpdateSabakPage";
import UstaadGalleryPage from "./pages/UstaadGalleryPage";
import UstaadNotificationsPage from "./pages/UstaadNotificationsPage";
import UstaadProfilePage from "./pages/UstaadProfilePage";
import UstaadSettingsPage from "./pages/UstaadSettingsPage";

type ExtendedTeacherPage =
  | TeacherPage
  | "morning"
  | "afternoon"
  | "evening"
  | "gallery"
  | "notifications"
  | "profile"
  | "settings"
  | "about-us";

interface Props {
  onLogout: () => void;
  mobileNumber: string;
}

const navSections = [
  {
    label: "Classes by Time",
    items: [
      {
        id: "morning" as ExtendedTeacherPage,
        label: "🌅 Morning",
        icon: <Sun className="w-4 h-4" />,
      },
      {
        id: "afternoon" as ExtendedTeacherPage,
        label: "☀️ Afternoon",
        icon: <Cloud className="w-4 h-4" />,
      },
      {
        id: "evening" as ExtendedTeacherPage,
        label: "🌙 Evening",
        icon: <Moon className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Teaching",
    items: [
      {
        id: "my-students" as ExtendedTeacherPage,
        label: "My Students",
        icon: <Users className="w-4 h-4" />,
      },
      {
        id: "add-student" as ExtendedTeacherPage,
        label: "Add Student",
        icon: <UserPlus className="w-4 h-4" />,
      },
      {
        id: "attendance" as ExtendedTeacherPage,
        label: "Daily Attendance",
        icon: <ClipboardList className="w-4 h-4" />,
      },
      {
        id: "sabak" as ExtendedTeacherPage,
        label: "📖 Sabak",
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        id: "gallery" as ExtendedTeacherPage,
        label: "Gallery",
        icon: <Image className="w-4 h-4" />,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        id: "profile" as ExtendedTeacherPage,
        label: "My Profile",
        icon: <User className="w-4 h-4" />,
      },
      {
        id: "settings" as ExtendedTeacherPage,
        label: "Settings",
        icon: <Settings className="w-4 h-4" />,
      },
      {
        id: "about-us" as ExtendedTeacherPage,
        label: "About Us",
        icon: <Info className="w-4 h-4" />,
      },
    ],
  },
];

const PAGE_LABELS: Record<ExtendedTeacherPage, string> = {
  "my-students": "My Students",
  "add-student": "Add Student",
  attendance: "Daily Attendance",
  sabak: "Sabak Tracking",
  morning: "Morning Students",
  afternoon: "Afternoon Students",
  evening: "Evening Students",
  gallery: "Gallery",
  notifications: "Notifications",
  profile: "My Profile",
  settings: "Settings",
  "about-us": "About Us",
};

export default function TeacherPanel({ onLogout, mobileNumber }: Props) {
  const [activePage, setActivePage] =
    useState<ExtendedTeacherPage>("my-students");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { data: sheetStudents = [] } = useStudentsSheet();
  const normalizedMobile = normalizeMobile(mobileNumber);
  const teacherRecord = sheetStudents.find(
    (s) => normalizeMobile(s.mobile) === normalizedMobile,
  );
  const teacherName = teacherRecord?.name ?? "";
  const teacherId = `teacher-mobile-${normalizedMobile}`;

  // Get teacher's assigned time slot from session
  const session = getSession();
  const teacherTimeSlot = session?.teacherTimeSlot;

  useEffect(() => {
    getUnreadCount()
      .then(setUnreadCount)
      .catch(() => setUnreadCount(0));
    const interval = setInterval(() => {
      getUnreadCount()
        .then(setUnreadCount)
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const navigate = (page: ExtendedTeacherPage) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (activePage) {
      case "my-students":
        return (
          <MyStudentsPage
            teacherName={teacherName}
            onBack={() => navigate("my-students")}
          />
        );
      case "add-student":
        return (
          <AddStudentTeacherPage
            teacherName={teacherName}
            teacherTimeSlot={
              teacherTimeSlot as "morning" | "afternoon" | "evening" | undefined
            }
            onSuccess={() => navigate("my-students")}
          />
        );
      case "morning":
        return (
          <TimeSlotStudentsPage
            timeSlot="morning"
            onBack={() => navigate("my-students")}
            ustaadName={teacherName || session?.name || "Ustaad"}
          />
        );
      case "afternoon":
        return (
          <TimeSlotStudentsPage
            timeSlot="afternoon"
            onBack={() => navigate("my-students")}
            ustaadName={teacherName || session?.name || "Ustaad"}
          />
        );
      case "evening":
        return (
          <TimeSlotStudentsPage
            timeSlot="evening"
            onBack={() => navigate("my-students")}
            ustaadName={teacherName || session?.name || "Ustaad"}
          />
        );
      case "attendance":
        return (
          <TeacherAttendancePage
            teacherId={teacherId}
            onBack={() => navigate("my-students")}
          />
        );
      case "sabak":
        return (
          <UpdateSabakPage
            teacherId={teacherId}
            onBack={() => navigate("my-students")}
          />
        );
      case "gallery":
        return (
          <UstaadGalleryPage
            teacherName={teacherName}
            onBack={() => navigate("my-students")}
          />
        );
      case "notifications":
        return (
          <UstaadNotificationsPage
            onBack={() => navigate("my-students")}
            onUnreadChange={setUnreadCount}
          />
        );
      case "profile":
        return (
          <UstaadProfilePage
            teacherName={teacherName}
            onBack={() => navigate("my-students")}
          />
        );
      case "settings":
        return <UstaadSettingsPage onBack={() => navigate("my-students")} />;
      case "about-us":
        return <AboutUsTeacherPage onBack={() => navigate("my-students")} />;
      default:
        return (
          <MyStudentsPage
            teacherName={teacherName}
            onBack={() => navigate("my-students")}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {sidebarOpen && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: overlay close
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 sidebar-gradient flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="px-5 py-5 border-b border-sidebar-border flex items-center gap-3">
          <LogoBadge size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-white font-bold text-sm leading-tight">
              Maktab Zaid
            </p>
            <p className="text-white/60 text-xs leading-tight">Bin Sabit</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <p className="text-white/60 text-xs">Ustaad</p>
            <p className="text-white text-sm font-medium">
              {teacherName || "Teacher"}
            </p>
            <p className="text-white/50 text-xs truncate">{mobileNumber}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 overflow-y-auto space-y-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-white/40 text-xs uppercase tracking-wider px-3 mb-1">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    data-ocid={`teacher.${item.id}.link`}
                    onClick={() => navigate(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                      activePage === item.id
                        ? "bg-white/20 text-white border-l-4 border-white/80"
                        : "text-sidebar-foreground/70 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Button
            data-ocid="teacher.logout_button"
            variant="ghost"
            className="w-full text-white/70 hover:text-white hover:bg-white/10 justify-start gap-2"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-card border-b border-border flex items-center gap-4 px-4 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1 min-w-0">
            <span className="font-medium text-foreground">Teacher Panel</span>
            <ChevronRight className="w-3 h-3 shrink-0" />
            <span className="truncate">{PAGE_LABELS[activePage]}</span>
          </div>

          <button
            type="button"
            data-ocid="teacher.notifications.bell"
            onClick={() => navigate("notifications")}
            className="relative p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-foreground" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 text-[10px] bg-destructive text-white border-0 flex items-center justify-center"
                data-ocid="teacher.notifications.badge"
              >
                {unreadCount}
              </Badge>
            )}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {renderPage()}
          </motion.div>
        </main>

        <footer className="py-3 px-4 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with &hearts; using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
