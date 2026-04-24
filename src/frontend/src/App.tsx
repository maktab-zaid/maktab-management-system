import { Toaster } from "@/components/ui/sonner";
import React from "react";
import { useEffect, useState } from "react";
import { MainLayout } from "./components/Layout/MainLayout";
import {
  type Session,
  clearSession,
  getAppSettings,
  getSession,
} from "./lib/storage";
import AboutUsPage from "./pages/AboutUsPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import AdminProfilePage from "./pages/AdminProfilePage";
import AttendancePage from "./pages/AttendancePage";
import ContactPage from "./pages/ContactPage";
import DashboardPage from "./pages/DashboardPage";
import FeesPage from "./pages/FeesPage";
import GalleryPage from "./pages/GalleryPage";
import ManageTeachersPage from "./pages/ManageTeachersPage";
import MonthlyReportPage from "./pages/MonthlyReportPage";
import NoticesPage from "./pages/NoticesPage";
import NotificationsPage from "./pages/NotificationsPage";
import ParentProfilePage from "./pages/ParentProfilePage";
import SabakPage from "./pages/SabakPage";
import SettingsPage from "./pages/SettingsPage";
import StudentsPage from "./pages/StudentsPage";
import UstaadAttendancePage from "./pages/UstaadAttendancePage";
import UstaadProfilePage from "./pages/UstaadProfilePage";
import UstaadTimePage from "./pages/UstaadTimePage";
import AboutUsAdminPage from "./pages/admin/pages/AboutUsAdminPage";
import LoginPage from "./pages/auth/LoginPage";
import type { AppPage } from "./types/dashboard";

// ─── Error Boundary ────────────────────────────────────────────────────────────

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AppErrorBoundary] Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
            padding: "24px",
            textAlign: "center",
            background: "#f8f9fa",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "#1a5c38",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            🕌
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
            Maktab Zaid Bin Sabit
          </h1>
          <p style={{ color: "#555", maxWidth: 340 }}>
            Something went wrong. Please refresh the page to continue.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              background: "#1a5c38",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AppErrorBoundary>
      <AppInner />
    </AppErrorBoundary>
  );
}

function AppInner() {
  console.log("App loaded");
  const [session, setSession] = useState<Session | null>(() => getSession());
  const [activePage, setActivePage] = useState<AppPage>("dashboard");

  // Apply saved settings on startup
  useEffect(() => {
    const settings = getAppSettings();
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleLogin = (s: Session) => {
    setSession(s);
  };

  const handleLogout = () => {
    clearSession();
    setSession(null);
    setActivePage("dashboard");
  };

  if (!session) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardPage onNavigate={setActivePage} session={session} />;
      case "students":
        return <StudentsPage session={session} onNavigate={setActivePage} />;
      case "attendance":
        return (
          <AttendancePage session={session} setActivePage={setActivePage} />
        );
      case "fees":
        return <FeesPage session={session} setActivePage={setActivePage} />;
      case "sabak":
        return <SabakPage session={session} setActivePage={setActivePage} />;
      case "notices":
        return <NoticesPage session={session} />;
      case "gallery":
      case "ustaad-gallery":
        return <GalleryPage session={session} />;
      case "contact":
        return <ContactPage session={session} />;
      case "manage-teachers":
        return <ManageTeachersPage />;
      case "settings":
        return <SettingsPage setActivePage={setActivePage} />;
      case "admin-profile":
        return <AdminProfilePage setActivePage={setActivePage} />;
      case "ustaad-attendance":
        return <UstaadAttendancePage setActivePage={setActivePage} />;
      case "monthly-report":
        return <MonthlyReportPage setActivePage={setActivePage} />;
      case "about-us":
        return <AboutUsPage setActivePage={setActivePage} />;
      case "admin-about-us":
        return <AboutUsAdminPage setActivePage={setActivePage} />;
      case "notifications":
        return <NotificationsPage setActivePage={setActivePage} />;
      case "activity-log":
        return <ActivityLogPage setActivePage={setActivePage} />;
      case "ustaad-profile":
        return (
          <UstaadProfilePage session={session} setActivePage={setActivePage} />
        );
      case "parent-profile":
        return (
          <ParentProfilePage session={session} setActivePage={setActivePage} />
        );
      case "ustaad-morning":
        return (
          <UstaadTimePage
            timeSlot="morning"
            setActivePage={setActivePage}
            session={session}
          />
        );
      case "ustaad-afternoon":
        return (
          <UstaadTimePage
            timeSlot="afternoon"
            setActivePage={setActivePage}
            session={session}
          />
        );
      case "ustaad-evening":
        return (
          <UstaadTimePage
            timeSlot="evening"
            setActivePage={setActivePage}
            session={session}
          />
        );
      default:
        return <DashboardPage onNavigate={setActivePage} session={session} />;
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <MainLayout
        activePage={activePage}
        onNavigate={setActivePage}
        session={session}
        onLogout={handleLogout}
      >
        {renderPage()}
      </MainLayout>
    </>
  );
}
