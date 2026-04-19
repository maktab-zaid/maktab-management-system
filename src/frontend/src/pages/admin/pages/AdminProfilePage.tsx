import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAdminProfile, saveAdminProfile } from "@/lib/storage";
import type { AdminProfile } from "@/lib/storage";
import { Building2, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const DEFAULT_PROFILE: AdminProfile = {
  name: "",
  designation: "",
  email: "",
  phone: "",
  address: "",
  bio: "",
  organization: "Maktab Zaid Bin Sabit",
};

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile>(() => {
    return getAdminProfile() ?? { ...DEFAULT_PROFILE };
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof AdminProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      saveAdminProfile(profile);
      toast.success("Profile saved successfully");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-ocid="admin.profile.page" className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage your profile information
        </p>
      </div>

      {/* Avatar header card */}
      <Card className="shadow-card border-border overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary to-primary/70" />
        <CardContent className="pt-0 pb-5 px-5">
          <div className="flex items-end gap-4 -mt-8">
            <div className="w-16 h-16 rounded-full bg-primary border-4 border-card flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile.name ? profile.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="pb-1">
              <p className="font-bold text-foreground text-lg leading-tight">
                {profile.name || "Admin"}
              </p>
              <p className="text-muted-foreground text-sm">
                {profile.organization || "Maktab Zaid Bin Sabit"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit form */}
      <Card className="shadow-card border-border">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-name"
                  className="flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  Full Name *
                </Label>
                <Input
                  id="admin-name"
                  data-ocid="admin.profile.name.input"
                  value={profile.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Admin name"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-org"
                  className="flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  Organization
                </Label>
                <Input
                  id="admin-org"
                  data-ocid="admin.profile.organization.input"
                  value={profile.organization}
                  onChange={(e) => handleChange("organization", e.target.value)}
                  placeholder="Organization name"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-email"
                  className="flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  Email
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  data-ocid="admin.profile.email.input"
                  value={profile.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="admin-phone"
                  className="flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  Phone
                </Label>
                <Input
                  id="admin-phone"
                  data-ocid="admin.profile.phone.input"
                  value={profile.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-bio">Bio</Label>
              <Textarea
                id="admin-bio"
                data-ocid="admin.profile.bio.textarea"
                value={profile.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="A short description about the admin..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                data-ocid="admin.profile.save_button"
                disabled={saving}
                className="bg-primary text-primary-foreground"
              >
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
