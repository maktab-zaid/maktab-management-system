import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Bell, Monitor, Save, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type AppSettings,
  getAppSettings,
  saveAppSettings,
} from "../../../lib/storage";

interface Props {
  onBack: () => void;
}

export default function UstaadSettingsPage({ onBack }: Props) {
  const [settings, setSettings] = useState<AppSettings>(() => getAppSettings());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(getAppSettings());
  }, []);

  const handleSave = () => {
    setSaving(true);
    try {
      saveAppSettings(settings);
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-ocid="teacher.settings.page" className="space-y-5 max-w-md">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-ocid="teacher.settings.back_button"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your app preferences
          </p>
        </div>
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6 space-y-6">
          {/* Notifications */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-sm font-medium cursor-pointer">
                  Notifications
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Receive alerts for attendance, fees, and reminders
                </p>
              </div>
            </div>
            <Switch
              data-ocid="teacher.settings.notifications.switch"
              checked={settings.notifications}
              onCheckedChange={(v) =>
                setSettings((p) => ({ ...p, notifications: v }))
              }
            />
          </div>

          <div className="h-px bg-border" />

          {/* View Mode */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-sm font-medium">Display Mode</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose how the app is displayed
                </p>
              </div>
            </div>
            <div className="flex gap-3 pl-11">
              <button
                type="button"
                data-ocid="teacher.settings.view_app.button"
                onClick={() => setSettings((p) => ({ ...p, viewMode: "app" }))}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  settings.viewMode === "app"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <Smartphone className="w-5 h-5" />
                App View
              </button>
              <button
                type="button"
                data-ocid="teacher.settings.view_desktop.button"
                onClick={() =>
                  setSettings((p) => ({ ...p, viewMode: "desktop" }))
                }
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  settings.viewMode === "desktop"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <Monitor className="w-5 h-5" />
                Desktop View
              </button>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Academic Year info */}
          <div className="bg-muted/40 rounded-lg px-4 py-3">
            <p className="text-xs text-muted-foreground">Academic Year</p>
            <p className="font-semibold text-foreground">
              {settings.academicYear}
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            data-ocid="teacher.settings.save_button"
            className="w-full gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
