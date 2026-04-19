import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AdminProfile,
  getAdminProfile,
  saveAdminProfile,
} from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import { ArrowLeft, Save, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AdminProfilePageProps {
  setActivePage: (page: AppPage) => void;
}

export default function AdminProfilePage({
  setActivePage,
}: AdminProfilePageProps) {
  const [profile, setProfile] = useState<AdminProfile>(() => {
    return (
      getAdminProfile() ?? {
        name: "Admin",
        designation: "Principal",
        email: "",
        phone: "",
        address: "",
      }
    );
  });
  const [saved, setSaved] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
    setSaved(false);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveAdminProfile(profile);
    setSaved(true);
    toast.success("Profile saved successfully!");
  }

  return (
    <div className="space-y-5 page-enter" data-ocid="admin_profile.page">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActivePage("dashboard")}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        data-ocid="admin_profile.back_button"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Admin Profile</h1>
          <p className="text-sm text-muted-foreground">
            Edit your admin details
          </p>
        </div>
      </div>

      <Card className="card-elevated border-border/60 max-w-lg">
        <CardContent className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="profile-name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Admin name"
                data-ocid="admin_profile.name_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="profile-designation"
                className="text-sm font-medium"
              >
                Designation
              </Label>
              <Input
                id="profile-designation"
                name="designation"
                value={profile.designation}
                onChange={handleChange}
                placeholder="e.g. Principal"
                data-ocid="admin_profile.designation_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="profile-email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="admin@maktab.com"
                data-ocid="admin_profile.email_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-phone" className="text-sm font-medium">
                Phone
              </Label>
              <Input
                id="profile-phone"
                name="phone"
                type="tel"
                value={profile.phone}
                onChange={handleChange}
                placeholder="10-digit mobile"
                data-ocid="admin_profile.phone_input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-address" className="text-sm font-medium">
                Address
              </Label>
              <Input
                id="profile-address"
                name="address"
                value={profile.address}
                onChange={handleChange}
                placeholder="Maktab address"
                data-ocid="admin_profile.address_input"
              />
            </div>

            {saved && (
              <div
                className="flex items-center gap-2 text-sm text-success bg-success/10 border border-success/20 rounded-lg px-3 py-2"
                data-ocid="admin_profile.success_state"
              >
                ✓ Profile saved successfully
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 gap-2"
              data-ocid="admin_profile.save_button"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
