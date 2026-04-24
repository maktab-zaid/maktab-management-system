import LogoBadge from "@/components/LogoBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronRight,
  ClipboardList,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { StaffPage } from "../../types";

import MonthlyReportPage from "./pages/MonthlyReportPage";
import StaffStudentDataPage from "./pages/StaffStudentDataPage";
import StaffStudentsPage from "./pages/StaffStudentsPage";

interface Props {
  onLogout: () => void;
  mobileNumber: string;
}

const navItems: { id: StaffPage; label: string; icon: React.ReactNode }[] = [
  {
    id: "my-students",
    label: "My Students",
    icon: <Users className="w-4 h-4" />,
  },
  {
    id: "monthly-report",
    label: "Monthly Report",
    icon: <ClipboardList className="w-4 h-4" />,
  },
  {
    id: "student-data",
    label: "Student Data",
    icon: <BookOpen className="w-4 h-4" />,
  },
];

export default function StaffPanel({ onLogout, mobileNumber }: Props) {
  const [activePage, setActivePage] = useState<StaffPage>("my-students");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Staff name from mobile number — passed in from login context
  const staffName = "";
  const teacherName = "";

  const currentNav = navItems.find((n) => n.id === activePage);

  const renderPage = () => {
    switch (activePage) {
      case "my-students":
        return <StaffStudentsPage teacherName={staffName || teacherName} />;
      case "monthly-report":
        return <MonthlyReportPage teacherName={staffName || teacherName} />;
      case "student-data":
        return <StaffStudentDataPage teacherName={staffName || teacherName} />;
      default:
        return <StaffStudentsPage teacherName={staffName || teacherName} />;
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

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 sidebar-gradient flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
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

        {/* Role badge */}
        <div className="px-4 py-3">
          <div className="bg-white/10 rounded-lg px-3 py-2">
            <p className="text-white/60 text-xs">Logged in as</p>
            <p className="text-white text-sm font-medium">
              {staffName || "Staff"}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs bg-white/15 text-white/80 rounded px-1.5 py-0.5 font-medium">
                Staff
              </span>
            </div>
            <p className="text-white/50 text-xs truncate mt-1">
              {mobileNumber}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1" data-ocid="staff.panel">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              data-ocid={`staff.${item.id.replace("-", "_")}.link`}
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
              {activePage === item.id && (
                <ChevronRight className="w-3 h-3 ml-auto" />
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-sidebar-border">
          <Button
            data-ocid="staff.logout_button"
            variant="ghost"
            className="w-full text-white/70 hover:text-white hover:bg-white/10 justify-start gap-2"
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center gap-4 px-4 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
            data-ocid="staff.menu.toggle"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <LogoBadge size="sm" />
            <span className="font-semibold text-sm text-foreground">
              Maktab Zaid Bin Sabit
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ChevronRight className="w-3 h-3 hidden lg:block" />
            <span className="font-medium text-foreground">Staff Panel</span>
            <ChevronRight className="w-3 h-3" />
            <span>{currentNav?.label}</span>
          </div>
        </header>

        {/* Page content */}
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

        {/* Footer */}
        <footer className="py-3 px-4 border-t border-border text-center text-xs text-muted-foreground no-print">
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
