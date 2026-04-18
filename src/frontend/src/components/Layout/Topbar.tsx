import type { Session } from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";
import { useState } from "react";

const PAGE_TITLES: Record<AppPage, string> = {
  dashboard: "Dashboard",
  students: "Students",
  attendance: "Attendance",
  fees: "Fees Management",
  sabak: "Sabak Tracking",
  notices: "Notices",
  gallery: "Gallery",
  contact: "Contact",
  "manage-teachers": "Manage Teachers",
};

const PAGE_SUBTITLES: Record<AppPage, string> = {
  dashboard: "Maktab Zaid Bin Sabit",
  students: "All enrolled students",
  attendance: "Daily attendance register",
  fees: "Fee collection & records",
  sabak: "Quran progress tracking",
  notices: "Announcements & events",
  gallery: "Photos & media",
  contact: "Teacher contacts",
  "manage-teachers": "Add, remove & assign teachers",
};

const ROLE_BADGE: Record<
  "admin" | "teacher" | "parent",
  { label: string; cls: string }
> = {
  admin: {
    label: "Admin",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  teacher: {
    label: "Ustaad",
    cls: "bg-blue-100 text-blue-800 border-blue-200",
  },
  parent: {
    label: "Parent",
    cls: "bg-orange-100 text-orange-800 border-orange-200",
  },
};

interface TopbarProps {
  activePage: AppPage;
  onMenuClick: () => void;
  sidebarCollapsed?: boolean;
  session: Session | null;
  onLogout?: () => void;
}

export function Topbar({
  activePage,
  onMenuClick,
  sidebarCollapsed,
  session,
  onLogout,
}: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const role = session?.role ?? "admin";
  const roleBadge = ROLE_BADGE[role];

  return (
    <header
      className={[
        "fixed top-0 right-0 z-20 bg-card border-b border-border h-16 flex items-center px-4 gap-4 shadow-soft",
        "transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "left-0 md:left-[4.5rem]" : "left-0 md:left-64",
      ].join(" ")}
      data-ocid="topbar"
    >
      {/* Hamburger (mobile) */}
      <button
        type="button"
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex-shrink-0"
        aria-label="Open navigation"
        data-ocid="topbar.menu_button"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title block */}
      <div className="flex-1 min-w-0">
        <h1
          className="text-base md:text-lg font-bold text-foreground leading-tight truncate"
          data-ocid="topbar.page_title"
        >
          {PAGE_TITLES[activePage]}
        </h1>
        <p className="text-xs text-muted-foreground hidden sm:block truncate leading-tight">
          {PAGE_SUBTITLES[activePage]}
        </p>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {/* Notification bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotifOpen((v) => !v);
              setProfileOpen(false);
            }}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            data-ocid="topbar.notifications_button"
          >
            <Bell className="w-5 h-5" />
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full ring-2 ring-card"
              aria-hidden="true"
            />
          </button>

          {notifOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
                onKeyDown={(e) => e.key === "Escape" && setNotifOpen(false)}
                role="button"
                tabIndex={-1}
                aria-label="Close notifications"
              />
              <div
                className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-elevated z-50 overflow-hidden page-enter"
                data-ocid="topbar.notifications_popover"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                  <p className="text-sm font-semibold text-foreground">
                    Notifications
                  </p>
                  <span className="text-xs bg-gold/10 text-[#a37c00] px-2 py-0.5 rounded-full font-medium border border-gold/20">
                    3 new
                  </span>
                </div>
                {[
                  {
                    id: "fees-due",
                    title: "Fees due in 3 days",
                    sub: "5 students have pending fees",
                    time: "2h ago",
                    dot: "bg-yellow-400",
                  },
                  {
                    id: "attendance-marked",
                    title: "Attendance marked",
                    sub: "Today's attendance saved — 92%",
                    time: "5h ago",
                    dot: "bg-emerald-500",
                  },
                  {
                    id: "new-student",
                    title: "New student enrolled",
                    sub: "Ahmad Bilal added to Naazra class",
                    time: "Yesterday",
                    dot: "bg-primary",
                  },
                ].map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border/50 last:border-0 cursor-pointer"
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{n.sub}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                      {n.time}
                    </span>
                  </div>
                ))}
                <div className="px-4 py-2.5 bg-muted/20">
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors w-full text-center"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProfileOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-lg hover:bg-muted/60 transition-colors"
            data-ocid="topbar.profile_button"
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-gold/40 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">
                {session?.name?.charAt(0).toUpperCase() ?? "A"}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-foreground leading-tight truncate max-w-[90px]">
                  {session?.name ?? "Admin"}
                </p>
                <span
                  className={`hidden md:inline text-[10px] font-semibold px-1.5 py-0.5 rounded-full border leading-none ${roleBadge.cls}`}
                  data-ocid="topbar.role_badge"
                >
                  {roleBadge.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-tight capitalize">
                {role}
              </p>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`}
            />
          </button>

          {profileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setProfileOpen(false)}
                onKeyDown={(e) => e.key === "Escape" && setProfileOpen(false)}
                role="button"
                tabIndex={-1}
                aria-label="Close profile menu"
              />
              <div
                className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-elevated z-50 py-1 overflow-hidden page-enter"
                data-ocid="topbar.profile_dropdown"
              >
                <div className="px-4 py-3 border-b border-border bg-muted/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-gold/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {session?.name?.charAt(0).toUpperCase() ?? "A"}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {session?.name ?? "Administrator"}
                      </p>
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border leading-none ${roleBadge.cls}`}
                      >
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  data-ocid="topbar.profile_link"
                >
                  <User className="w-4 h-4 text-muted-foreground" /> My Profile
                </button>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  data-ocid="topbar.settings_link"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />{" "}
                  Settings
                </button>
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
                    data-ocid="topbar.logout_button"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
