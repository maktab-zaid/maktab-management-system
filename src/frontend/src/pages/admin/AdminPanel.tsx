import LogoBadge from "@/components/LogoBadge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { AdminPage } from "../../types";
import AcademicPage from "./pages/AcademicPage";
import AdminDashboard from "./pages/AdminDashboard";
import AttendancePage from "./pages/AttendancePage";
import ReportsPage from "./pages/ReportsPage";
import StudentsPage from "./pages/StudentsPage";
import TeachersPage from "./pages/TeachersPage";

interface Props {
  onLogout: () => void;
  mobileNumber: string;
}

const navItems: { id: AdminPage; label: string; icon: React.ReactNode }[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "students",
    label: "Students",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  { id: "teachers", label: "Teachers", icon: <Users className="w-4 h-4" /> },
  {
    id: "attendance",
    label: "Attendance",
    icon: <ClipboardList className="w-4 h-4" />,
  },
  { id: "academic", label: "Academic", icon: <BookOpen className="w-4 h-4" /> },
  { id: "reports", label: "Reports", icon: <FileText className="w-4 h-4" /> },
];

export default function AdminPanel({ onLogout, mobileNumber }: Props) {
  const [activePage, setActivePage] = useState<AdminPage>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentNav = navItems.find((n) => n.id === activePage);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <AdminDashboard />;
      case "students":
        return <StudentsPage />;
      case "teachers":
        return <TeachersPage />;
      case "attendance":
        return <AttendancePage />;
      case "academic":
        return <AcademicPage />;
      case "reports":
        return <ReportsPage />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile overlay */}
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
            <p className="text-white text-sm font-medium">Admin</p>
            <p className="text-white/50 text-xs truncate">{mobileNumber}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1" data-ocid="admin.panel">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              data-ocid={`admin.${item.id}.link`}
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
            data-ocid="admin.logout_button"
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
            data-ocid="admin.menu.toggle"
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
