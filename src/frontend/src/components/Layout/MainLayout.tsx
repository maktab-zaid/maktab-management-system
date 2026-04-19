import type { Session } from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface MainLayoutProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
  children: React.ReactNode;
  session: Session | null;
  onLogout?: () => void;
}

export function MainLayout({
  activePage,
  onNavigate,
  children,
  session,
  onLogout,
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background islamic-bg">
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
        session={session}
      />

      {/* Main content area — offset on desktop based on collapsed state */}
      <div
        className={[
          "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "md:pl-[4.5rem]" : "md:pl-64",
        ].join(" ")}
      >
        <Topbar
          activePage={activePage}
          onMenuClick={() => setSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          session={session}
          onLogout={onLogout}
          onNavigate={onNavigate}
        />

        {/* Page content — padding below fixed header */}
        <main className="flex-1 pt-16 overflow-auto" data-ocid="main_content">
          <div className="p-4 md:p-6 lg:p-8 page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
}
