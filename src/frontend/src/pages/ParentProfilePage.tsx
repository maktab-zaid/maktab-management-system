import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type Session,
  getParentProfileByMobile,
  getStudents,
  saveParentProfileRecord,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { ArrowLeft, Camera, Save, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ParentProfilePageProps {
  session: Session;
  setActivePage: (page: AppPage) => void;
}

export default function ParentProfilePage({
  session,
  setActivePage,
}: ParentProfilePageProps) {
  const mobile = session.mobile ?? "";
  const [child, setChild] = useState<import("@/lib/storage").Student | null>(
    null,
  );
  const [profile, setProfile] = useState({
    name: session.name ?? "",
    address: "",
    profileImage: "",
  });
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getStudents()
      .then((students) => {
        const found = students.find((s) => s.parentMobile === mobile);
        setChild(found ?? null);
      })
      .catch(() => {});
    getParentProfileByMobile(mobile)
      .then((existing) => {
        if (existing) {
          setProfile({
            name: existing.name ?? session.name ?? "",
            address: existing.address ?? "",
            profileImage: existing.profileImage ?? "",
          });
        }
      })
      .catch(() => {});
  }, [mobile, session.name]);

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
    await saveParentProfileRecord({
      mobile,
      name: profile.name,
      address: profile.address,
      profileImage: profile.profileImage,
      updatedAt: new Date().toISOString(),
    });
    setSaved(true);
    toast.success("Profile saved successfully!");
  }

  return (
    <div className="space-y-5 page-enter" data-ocid="parent_profile.page">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActivePage("dashboard")}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        data-ocid="parent_profile.back_button"
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
            View and edit your parent details
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
                    {(profile.name || "P").charAt(0)}
                  </span>
                )}
              </div>
              <button
                type="button"
                aria-label="Upload photo"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="parent_profile.upload_button"
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
                data-ocid="parent_profile.photo_input"
              />
            </div>

            <div>
              <p className="font-semibold text-foreground">
                {profile.name || "Parent"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Parent</p>
            </div>

            {/* Child info */}
            {child && (
              <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-3 text-left">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  My Child
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {child.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {child.timeSlot
                    ? child.timeSlot.charAt(0).toUpperCase() +
                      child.timeSlot.slice(1)
                    : "—"}{" "}
                  Session · {child.teacherName}
                </p>
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
                <Label htmlFor="pp-name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="pp-name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  data-ocid="parent_profile.name_input"
                />
              </div>

              {/* Mobile — read-only */}
              <div className="space-y-1.5">
                <Label htmlFor="pp-mobile" className="text-sm font-medium">
                  Mobile Number{" "}
                  <span className="text-xs text-muted-foreground font-normal">
                    (Login ID — cannot change)
                  </span>
                </Label>
                <div
                  id="pp-mobile"
                  className="h-10 px-3 flex items-center rounded-md border border-input bg-muted/30 text-sm text-foreground font-mono"
                  data-ocid="parent_profile.mobile_display"
                >
                  {mobile || "—"}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pp-address" className="text-sm font-medium">
                  Address
                </Label>
                <Input
                  id="pp-address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  placeholder="Your home address"
                  data-ocid="parent_profile.address_input"
                />
              </div>

              {/* Child name — read-only info */}
              {child && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">
                    Child's Name{" "}
                    <span className="text-xs text-muted-foreground font-normal">
                      (read-only)
                    </span>
                  </Label>
                  <div className="h-10 px-3 flex items-center rounded-md border border-input bg-muted/30 text-sm text-foreground">
                    {child.name}
                  </div>
                </div>
              )}

              {saved && (
                <div
                  className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2"
                  data-ocid="parent_profile.success_state"
                >
                  ✓ Profile saved successfully
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 gap-2"
                data-ocid="parent_profile.save_button"
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
