import type { Session } from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Image,
  Info,
  LayoutDashboard,
  Moon,
  Phone,
  Settings,
  Sun,
  User,
  UserCheck,
  UserCog,
  Users,
  Wallet,
  X,
} from "lucide-react";

interface NavItem {
  id: AppPage;
  label: string;
  icon: React.ElementType;
}

const ADMIN_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "activity-log", label: "Activity Log", icon: ClipboardList },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "fees", label: "Fees", icon: Wallet },
  { id: "sabak", label: "Sabak", icon: BookOpen },
  { id: "notices", label: "Notices", icon: Bell },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "manage-teachers", label: "Manage Teachers", icon: UserCog },
  { id: "ustaad-attendance", label: "Ustaad Attendance", icon: UserCheck },
  { id: "monthly-report", label: "Monthly Reports", icon: FileText },
  { id: "admin-profile", label: "Admin Profile", icon: User },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "admin-about-us", label: "About Us", icon: Info },
];

const TEACHER_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "ustaad-morning", label: "Morning", icon: Sun },
  { id: "ustaad-afternoon", label: "Afternoon", icon: Clock },
  { id: "ustaad-evening", label: "Evening", icon: Moon },
  { id: "ustaad-gallery", label: "Gallery", icon: Image },
  { id: "students", label: "Students", icon: Users },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "fees", label: "Fees", icon: Wallet },
  { id: "sabak", label: "Sabak", icon: BookOpen },
  { id: "notices", label: "Notices", icon: Bell },
  { id: "ustaad-profile", label: "Profile", icon: User },
  { id: "about-us", label: "About Us", icon: Info },
];

const PARENT_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "parent-profile", label: "Profile", icon: User },
  { id: "gallery", label: "Gallery", icon: Image },
  { id: "notices", label: "Notices", icon: Bell },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "fees", label: "Fees", icon: Wallet },
  { id: "sabak", label: "Sabak", icon: BookOpen },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "about-us", label: "About Us", icon: Info },
];

interface SidebarProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  session: Session | null;
}

export function Sidebar({
  activePage,
  onNavigate,
  isOpen,
  onClose,
  collapsed,
  onToggleCollapse,
  session,
}: SidebarProps) {
  const role = session?.role ?? "admin";

  const navItems =
    role === "admin"
      ? ADMIN_NAV
      : role === "teacher"
        ? TEACHER_NAV
        : PARENT_NAV;

  const handleNavClick = (page: AppPage) => {
    onNavigate(page);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 backdrop-blur-sm md:hidden"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={-1}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={[
          "fixed top-0 left-0 z-40 h-full flex flex-col sidebar-gradient shadow-xl",
          "transition-all duration-300 ease-in-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "md:w-[4.5rem]" : "w-64",
        ].join(" ")}
        data-ocid="sidebar"
      >
        {/* Islamic geometric background overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M30 0l3 9 9-3-3 9 9 3-9 3 3 9-9-3-3 9-3-9-9 3 3-9-9-3 9-3-3-9 9 3zM0 30l3 9 9-3-3 9 9 3-9 3 3 9-9-3-3 9-3-9-9 3 3-9-9-3 9-3-3-9 9 3zM60 30l3 9 9-3-3 9 9 3-9 3 3 9-9-3-3 9-3-9-9 3 3-9-9-3 9-3-3-9 9 3z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />

        {/* Header */}
        <div
          className={[
            "relative flex items-center border-b border-white/20 transition-all duration-300",
            collapsed
              ? "justify-center px-2 py-5"
              : "justify-between px-4 py-5",
          ].join(" ")}
        >
          {!collapsed && (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white leading-tight truncate">
                  Maktab Zaid
                </p>
                <p className="text-xs text-[#D4AF37] leading-tight">
                  Bin Sabit
                </p>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-[#D4AF37]" />
            </div>
          )}

          {/* Mobile close */}
          {!collapsed && (
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
              aria-label="Close sidebar"
              data-ocid="sidebar.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button
                key={`${id}-${label}`}
                type="button"
                onClick={() => handleNavClick(id)}
                title={collapsed ? label : undefined}
                data-ocid={`sidebar.${id}.link`}
                className={[
                  "w-full flex items-center gap-3 rounded-lg text-sm font-medium",
                  "transition-all duration-200 group",
                  collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
                  isActive
                    ? "bg-[#D4AF37] text-[#166534] font-bold shadow-sm"
                    : "text-white/90 hover:text-white hover:bg-white/10 border border-transparent",
                ].join(" ")}
              >
                <Icon
                  className={`flex-shrink-0 transition-colors ${isActive ? "text-[#166534]" : "text-white/80 group-hover:text-white"}`}
                  size={18}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{label}</span>
                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#166534]/70 flex-shrink-0" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer + Desktop collapse toggle */}
        <div className="relative px-2 py-3 border-t border-white/20 space-y-2">
          {!collapsed && (
            <p className="text-xs text-white/50 text-center px-2">
              Academic Year 2026–27
            </p>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            data-ocid="sidebar.collapse_button"
            className={[
              "hidden md:flex items-center justify-center w-full rounded-lg py-2",
              "text-white/60 hover:text-white hover:bg-white/10",
              "transition-all duration-200 border border-transparent hover:border-white/20",
              collapsed ? "px-0" : "gap-2 px-3",
            ].join(" ")}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
