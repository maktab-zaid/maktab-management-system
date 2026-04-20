import {
  type Notification,
  type Session,
  getNotifications,
  getUnreadCount,
  markNotificationRead,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";

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
  settings: "Settings",
  "admin-profile": "Admin Profile",
  "ustaad-attendance": "Ustaad Attendance",
  "monthly-report": "Monthly Reports",
  "ustaad-morning": "Morning Session",
  "ustaad-afternoon": "Afternoon Session",
  "ustaad-evening": "Evening Session",
  "ustaad-gallery": "Gallery",
  "about-us": "About Us",
  "admin-about-us": "About Us",
  notifications: "Notifications",
  "activity-log": "Activity Log",
  "ustaad-profile": "My Profile",
  "parent-profile": "My Profile",
};

const PAGE_SUBTITLES: Record<AppPage, string> = {
  dashboard: "Maktab Zaid Bin Sabit · 2026–27",
  students: "All enrolled students",
  attendance: "Daily attendance register",
  fees: "Fee collection & records",
  sabak: "Quran progress tracking",
  notices: "Announcements & events",
  gallery: "Photos & media",
  contact: "Teacher contacts",
  "manage-teachers": "Add, remove & assign teachers",
  settings: "App preferences",
  "admin-profile": "Edit your profile",
  "ustaad-attendance": "Track Ustaad presence",
  "monthly-report": "Download PDF reports",
  "ustaad-morning": "Morning session students",
  "ustaad-afternoon": "Afternoon session students",
  "ustaad-evening": "Evening session students",
  "ustaad-gallery": "Class photos & media",
  "about-us": "Maktab Zaid Bin Sabit",
  "admin-about-us": "Maktab Zaid Bin Sabit",
  notifications: "All notifications",
  "activity-log": "Ustaad & Admin actions log",
  "ustaad-profile": "Edit your Ustaad profile",
  "parent-profile": "Edit your parent profile",
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
  onNavigate?: (page: AppPage) => void;
}

export function Topbar({
  activePage,
  onMenuClick,
  sidebarCollapsed,
  session,
  onLogout,
  onNavigate,
}: TopbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    getNotifications()
      .then((n) => setNotifList(n.slice(0, 5)))
      .catch(() => setNotifList([]));
    getUnreadCount()
      .then(setUnreadCount)
      .catch(() => setUnreadCount(0));
  }, []);

  const role = session?.role ?? "admin";
  const roleBadge = ROLE_BADGE[role];

  async function handleNotifOpen() {
    const n = await getNotifications().catch(() => []);
    setNotifList(n.slice(0, 5));
    setNotifOpen((v) => !v);
    setProfileOpen(false);
  }

  async function handleNotifClick(id: string) {
    await markNotificationRead(id).catch(() => {});
    const n = await getNotifications().catch(() => []);
    setNotifList(n.slice(0, 5));
    const count = await getUnreadCount().catch(() => 0);
    setUnreadCount(count);
  }

  function handleViewAll() {
    setNotifOpen(false);
    onNavigate?.("notifications");
  }

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
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
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
            onClick={handleNotifOpen}
            className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            data-ocid="topbar.notifications_button"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full ring-2 ring-card"
                aria-hidden="true"
              />
            )}
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
                  {unreadCount > 0 && (
                    <span className="text-xs bg-gold/10 text-[#a37c00] px-2 py-0.5 rounded-full font-medium border border-gold/20">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {notifList.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifList.map((n, i) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => handleNotifClick(n.id)}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors border-b border-border/50 last:border-0 cursor-pointer ${!n.isRead ? "bg-primary/3" : ""}`}
                      data-ocid={`topbar.notification.${i + 1}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.isRead ? "bg-muted-foreground/30" : "bg-primary"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                        {new Date(n.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </button>
                  ))
                )}
                <div className="px-4 py-2.5 bg-muted/20">
                  <button
                    type="button"
                    onClick={handleViewAll}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors w-full text-center"
                    data-ocid="topbar.view_all_notifications_button"
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
                {role === "admin" && (
                  <button
                    type="button"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setProfileOpen(false);
                      onNavigate?.("admin-profile");
                    }}
                    data-ocid="topbar.profile_link"
                  >
                    <User className="w-4 h-4 text-muted-foreground" /> My
                    Profile
                  </button>
                )}
                <button
                  type="button"
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate?.("settings");
                  }}
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
