import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  getAppSettings,
  initDefaultSettings,
  saveAppSettings,
} from "@/lib/storage";
import type { AppSettings } from "@/lib/storage";
import {
  Bell,
  CalendarDays,
  Monitor,
  Moon,
  Smartphone,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

initDefaultSettings();

interface SettingRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  control: React.ReactNode;
}

function SettingRow({ icon, title, description, control }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-0">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());

  useEffect(() => {
    setSettings(getAppSettings());
  }, []);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveAppSettings(updated);
    toast.success("Setting updated");
  };

  return (
    <div data-ocid="admin.settings.page" className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage app preferences and system configuration
        </p>
      </div>

      {/* Appearance */}
      <Card className="shadow-card border-border">
        <CardContent className="px-5 pt-5 pb-1">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground mb-2">
            Appearance
          </h2>
          <SettingRow
            icon={
              settings.theme === "dark" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )
            }
            title="Dark Mode"
            description="Toggle between dark and light theme"
            control={
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-muted-foreground" />
                <Switch
                  data-ocid="admin.settings.theme.switch"
                  checked={settings.theme === "dark"}
                  onCheckedChange={(checked) =>
                    updateSetting("theme", checked ? "dark" : "light")
                  }
                />
                <Moon className="w-4 h-4 text-muted-foreground" />
              </div>
            }
          />
          <SettingRow
            icon={
              settings.viewMode === "app" ? (
                <Smartphone className="w-4 h-4" />
              ) : (
                <Monitor className="w-4 h-4" />
              )
            }
            title="View Mode"
            description="Switch between mobile app view and desktop view"
            control={
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <Switch
                  data-ocid="admin.settings.viewmode.switch"
                  checked={settings.viewMode === "desktop"}
                  onCheckedChange={(checked) =>
                    updateSetting("viewMode", checked ? "desktop" : "app")
                  }
                />
                <Monitor className="w-4 h-4 text-muted-foreground" />
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* System */}
      <Card className="shadow-card border-border">
        <CardContent className="px-5 pt-5 pb-1">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider text-muted-foreground mb-2">
            System
          </h2>
          <SettingRow
            icon={<CalendarDays className="w-4 h-4" />}
            title="Academic Year"
            description="Current academic year (system-defined)"
            control={
              <Badge
                data-ocid="admin.settings.academic_year.badge"
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 font-semibold"
              >
                {settings.academicYear}
              </Badge>
            }
          />
          <SettingRow
            icon={<Bell className="w-4 h-4" />}
            title="Notifications"
            description="Enable or disable in-app notifications"
            control={
              <Switch
                data-ocid="admin.settings.notifications.switch"
                checked={settings.notifications}
                onCheckedChange={(checked) =>
                  updateSetting("notifications", checked)
                }
              />
            }
          />
        </CardContent>
      </Card>

      {/* Current state summary */}
      <Card className="shadow-card border-border bg-muted/30">
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Current Configuration
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Theme", value: settings.theme },
              { label: "View", value: settings.viewMode },
              {
                label: "Notifications",
                value: settings.notifications ? "On" : "Off",
              },
              { label: "Academic Year", value: settings.academicYear },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-card rounded-lg px-3 py-2.5 border border-border"
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground capitalize mt-0.5">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
