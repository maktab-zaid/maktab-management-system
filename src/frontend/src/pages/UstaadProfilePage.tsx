import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type Session,
  type UstaadProfile,
  getUstaadProfile,
  saveUstaadProfile,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { ArrowLeft, Camera, Clock, Moon, Save, Sun, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UstaadProfilePageProps {
  session: Session;
  setActivePage: (page: AppPage) => void;
}

const SESSION_ICONS: Record<string, React.ElementType> = {
  morning: Sun,
  afternoon: Clock,
  evening: Moon,
};

const SESSION_COLORS: Record<string, string> = {
  morning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  afternoon: "bg-orange-50 text-orange-700 border-orange-200",
  evening: "bg-indigo-50 text-indigo-700 border-indigo-200",
};

export default function UstaadProfilePage({
  session,
  setActivePage,
}: UstaadProfilePageProps) {
  const [existingProfile, setExistingProfile] = useState<UstaadProfile | null>(
    null,
  );

  const [profile, setProfile] = useState<
    Omit<UstaadProfile, "id" | "createdAt">
  >({
    name: session.name ?? "",
    phone: session.mobile ?? "",
    email: "",
    bio: "",
    timeSlot: session.teacherTimeSlot ?? session.teacherSessions?.[0] ?? "",
    address: "",
    profileImage: "",
  });

  useEffect(() => {
    getUstaadProfile(session.name)
      .then((existing) => {
        if (existing) {
          setExistingProfile(existing);
          setProfile({
            name: existing.name,
            phone: existing.phone,
            email: existing.email,
            bio: existing.bio,
            timeSlot: existing.timeSlot,
            address: existing.address ?? "",
            profileImage: existing.profileImage ?? "",
          });
        }
      })
      .catch(() => {});
  }, [session.name]);

  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const assignedSessions: string[] =
    session.teacherSessions && session.teacherSessions.length > 0
      ? session.teacherSessions.map((s) => s.toLowerCase())
      : session.teacherTimeSlot
        ? [session.teacherTimeSlot.toLowerCase()]
        : [];

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
    setSaved(false);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((p) => ({ ...p, profileImage: reader.result as string }));
      setSaved(false);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const toSave: UstaadProfile = {
      id:
        existingProfile?.id ??
        `up-${session.name.replace(/\s+/g, "-").toLowerCase()}`,
      ...profile,
      createdAt: existingProfile?.createdAt ?? new Date().toISOString(),
    };
    await saveUstaadProfile(toSave);
    setSaved(true);
    toast.success("Profile saved successfully!");
  }

  return (
    <div className="space-y-5 page-enter" data-ocid="ustaad_profile.page">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActivePage("dashboard")}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        data-ocid="ustaad_profile.back_button"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            Edit your personal details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Photo Card */}
        <Card className="card-elevated border-border/60 md:col-span-1">
          <CardContent className="p-5 flex flex-col items-center text-center gap-4">
            {/* Photo preview */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-primary/10 border-4 border-primary/20 flex items-center justify-center">
                {profile.profileImage ? (
                  <img
                    src={profile.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {(profile.name || session.name || "U").charAt(0)}
                  </span>
                )}
              </div>
              <button
                type="button"
                aria-label="Upload photo"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="ustaad_profile.upload_button"
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors shadow-md border-2 border-card"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                data-ocid="ustaad_profile.photo_input"
              />
            </div>

            <div>
              <p className="font-semibold text-foreground">
                {profile.name || session.name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Ustaad</p>
            </div>

            {/* Assigned Sessions — read-only */}
            {assignedSessions.length > 0 && (
              <div className="w-full">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Assigned Sessions
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {assignedSessions.map((s) => {
                    const Icon = SESSION_ICONS[s] ?? User;
                    const color =
                      SESSION_COLORS[s] ??
                      "bg-primary/10 text-primary border-primary/20";
                    return (
                      <Badge
                        key={s}
                        variant="outline"
                        className={`text-xs font-semibold border flex items-center gap-1 ${color}`}
                        data-ocid={`ustaad_profile.session_badge.${s}`}
                      >
                        <Icon className="w-3 h-3" />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Click the camera icon to upload a photo
            </p>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="card-elevated border-border/60 md:col-span-2">
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="up-name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="up-name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  data-ocid="ustaad_profile.name_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="up-phone" className="text-sm font-medium">
                  Mobile Number
                </Label>
                <Input
                  id="up-phone"
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  data-ocid="ustaad_profile.phone_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="up-address" className="text-sm font-medium">
                  Address
                </Label>
                <Input
                  id="up-address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Your address"
                  data-ocid="ustaad_profile.address_input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="up-email" className="text-sm font-medium">
                  Email (optional)
                </Label>
                <Input
                  id="up-email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  data-ocid="ustaad_profile.email_input"
                />
              </div>

              {/* Assigned Sessions (read-only info) */}
              {assignedSessions.length > 0 && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Assigned Sessions
                  </Label>
                  <div className="flex flex-wrap gap-2 px-3 py-2 rounded-md border border-input bg-muted/30">
                    {assignedSessions.map((s) => {
                      const Icon = SESSION_ICONS[s] ?? User;
                      const color =
                        SESSION_COLORS[s] ??
                        "bg-primary/10 text-primary border-primary/20";
                      return (
                        <span
                          key={s}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${color}`}
                        >
                          <Icon className="w-3 h-3" />
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </span>
                      );
                    })}
                    <span className="text-xs text-muted-foreground self-center">
                      (Contact admin to update)
                    </span>
                  </div>
                </div>
              )}

              {saved && (
                <div
                  className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2"
                  data-ocid="ustaad_profile.success_state"
                >
                  ✓ Profile saved successfully
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 gap-2"
                data-ocid="ustaad_profile.save_button"
              >
                <Save className="w-4 h-4" />
                Save Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
