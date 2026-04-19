import LogoBadge from "@/components/LogoBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  CreditCard,
  DollarSign,
  Info,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { StudentPage } from "../../types";
import AboutUsPage from "./pages/AboutUsPage";
import StudentAttendancePage from "./pages/StudentAttendancePage";
import StudentFeesPage from "./pages/StudentFeesPage";
import StudentIdCardPage from "./pages/StudentIdCardPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import StudentProgressPage from "./pages/StudentProgressPage";

interface Props {
  onLogout: () => void;
  mobileNumber: string;
}

type ExtendedStudentPage = StudentPage | "about-us" | "idcard";

const navItems: {
  id: ExtendedStudentPage;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "profile", label: "My Profile", icon: <User className="w-4 h-4" /> },
  {
    id: "attendance",
    label: "Attendance",
    icon: <CalendarDays className="w-4 h-4" />,
  },
  { id: "fees", label: "Fees", icon: <DollarSign className="w-4 h-4" /> },
  { id: "progress", label: "Progress", icon: <BookOpen className="w-4 h-4" /> },
  { id: "idcard", label: "ID Card", icon: <CreditCard className="w-4 h-4" /> },
  { id: "about-us", label: "About Us", icon: <Info className="w-4 h-4" /> },
];

export default function StudentPanel({ onLogout, mobileNumber }: Props) {
  const [activePage, setActivePage] = useState<ExtendedStudentPage>("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentNav = navItems.find((n) => n.id === activePage);

  const renderPage = () => {
    switch (activePage) {
      case "profile":
        return <StudentProfilePage mobileNumber={mobileNumber} />;
      case "attendance":
        return <StudentAttendancePage mobileNumber={mobileNumber} />;
      case "fees":
        return <StudentFeesPage mobileNumber={mobileNumber} />;
      case "progress":
        return <StudentProgressPage mobileNumber={mobileNumber} />;
      case "idcard":
        return <StudentIdCardPage mobileNumber={mobileNumber} />;
      case "about-us":
        return <AboutUsPage onBack={() => setActivePage("profile")} />;
      default:
        return <StudentProfilePage mobileNumber={mobileNumber} />;
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
            <p className="text-white/60 text-xs">Talib</p>
            <p className="text-white text-sm font-medium">Student</p>
            <p className="text-white/50 text-xs truncate">{mobileNumber}</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              data-ocid={`student.${item.id}.link`}
              onClick={() => {
                setActivePage(item.id);
                setSidebarOpen(false);
              }}
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
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <Button
            data-ocid="student.logout_button"
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Student Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span>{currentNav?.label}</span>
          </div>
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
