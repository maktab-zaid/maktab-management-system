import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { MainLayout } from "./components/Layout/MainLayout";
import { type Session, clearSession, getSession } from "./lib/storage";
import AttendancePage from "./pages/AttendancePage";
import ContactPage from "./pages/ContactPage";
import DashboardPage from "./pages/DashboardPage";
import FeesPage from "./pages/FeesPage";
import GalleryPage from "./pages/GalleryPage";
import ManageTeachersPage from "./pages/ManageTeachersPage";
import NoticesPage from "./pages/NoticesPage";
import SabakPage from "./pages/SabakPage";
import StudentsPage from "./pages/StudentsPage";
import LoginPage from "./pages/auth/LoginPage";
import type { AppPage } from "./types/dashboard";

export default function App() {
  const [session, setSession] = useState<Session | null>(() => getSession());
  const [activePage, setActivePage] = useState<AppPage>("dashboard");

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
        return <StudentsPage session={session} />;
      case "attendance":
        return <AttendancePage session={session} />;
      case "fees":
        return <FeesPage session={session} />;
      case "sabak":
        return <SabakPage session={session} />;
      case "notices":
        return <NoticesPage session={session} />;
      case "gallery":
        return <GalleryPage session={session} />;
      case "contact":
        return <ContactPage session={session} />;
      case "manage-teachers":
        return <ManageTeachersPage />;
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
