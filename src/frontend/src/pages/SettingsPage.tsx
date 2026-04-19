import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  type AppSettings,
  getAppSettings,
  saveAppSettings,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { ArrowLeft, Monitor, Moon, Settings, Sun } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SettingsPageProps {
  setActivePage: (page: AppPage) => void;
}

export default function SettingsPage({ setActivePage }: SettingsPageProps) {
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());

  function toggleDarkMode() {
    const next = !settings.darkMode;
    const updated = { ...settings, darkMode: next };
    saveAppSettings(updated);
    setSettings(updated);
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast.success(next ? "Dark mode enabled" : "Light mode enabled");
  }

  function toggleDesktopView() {
    const next = !settings.desktopView;
    const updated = { ...settings, desktopView: next };
    saveAppSettings(updated);
    setSettings(updated);
    toast.success(next ? "Desktop view enabled" : "App view enabled");
  }

  return (
    <div className="space-y-5 page-enter" data-ocid="settings.page">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActivePage("dashboard")}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        data-ocid="settings.back_button"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">App preferences</p>
        </div>
      </div>

      <div className="space-y-4 max-w-md">
        {/* Dark Mode Toggle */}
        <Card className="card-elevated border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  {settings.darkMode ? (
                    <Moon className="w-5 h-5 text-indigo-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {settings.darkMode ? "Dark Mode" : "Light Mode"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                data-ocid="settings.dark_mode_toggle"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${settings.darkMode ? "bg-primary" : "bg-muted-foreground/30"}`}
                role="switch"
                aria-checked={settings.darkMode}
                aria-label="Toggle dark mode"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.darkMode ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Desktop View Toggle */}
        <Card className="card-elevated border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {settings.desktopView ? "Desktop View" : "App View"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Switch between app view and desktop view
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDesktopView}
                data-ocid="settings.desktop_view_toggle"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${settings.desktopView ? "bg-primary" : "bg-muted-foreground/30"}`}
                role="switch"
                aria-checked={settings.desktopView}
                aria-label="Toggle desktop view"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${settings.desktopView ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Academic Year (read-only) */}
        <Card className="card-elevated border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <span className="text-sm font-bold text-gold-dark">📅</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Academic Year
                </p>
                <p
                  className="text-base font-bold text-primary"
                  data-ocid="settings.academic_year"
                >
                  {settings.academicYear}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
