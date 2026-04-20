import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  type UstaadProfile,
  createId,
  getUstaadProfile,
  saveUstaadProfile,
} from "../../../lib/storage";

interface Props {
  teacherName: string;
  onBack: () => void;
}

export default function UstaadProfilePage({ teacherName, onBack }: Props) {
  const [form, setForm] = useState<UstaadProfile>({
    id: createId(),
    name: teacherName,
    phone: "",
    email: "",
    bio: "",
    timeSlot: "morning",
    createdAt: new Date().toISOString(),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUstaadProfile(teacherName)
      .then((existing) => {
        if (existing) {
          setForm(existing);
        } else {
          setForm((p) => ({ ...p, name: teacherName }));
        }
      })
      .catch(() => {
        setForm((p) => ({ ...p, name: teacherName }));
      });
  }, [teacherName]);

  const handleChange = (field: keyof UstaadProfile, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    saveUstaadProfile({ ...form, name: teacherName })
      .then(() => toast.success("Profile saved successfully"))
      .catch(() => toast.error("Failed to save profile"))
      .finally(() => setSaving(false));
  };

  return (
    <div data-ocid="teacher.profile.page" className="space-y-5 max-w-xl">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          data-ocid="teacher.profile.back_button"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground text-sm">
            Manage your profile information
          </p>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {teacherName ? (
                teacherName.charAt(0).toUpperCase()
              ) : (
                <User className="w-7 h-7" />
              )}
            </div>
            <div>
              <p className="font-bold text-foreground text-lg">
                {teacherName || "Teacher"}
              </p>
              <p className="text-sm text-muted-foreground">Ustaad</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Full Name</Label>
            <Input
              id="profile-name"
              data-ocid="teacher.profile.name.input"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Your full name"
              disabled
              className="bg-muted/50 cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Name is managed by Admin
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-phone">Phone Number</Label>
            <Input
              id="profile-phone"
              data-ocid="teacher.profile.phone.input"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="e.g. 9876543210"
              type="tel"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-email">Email Address</Label>
            <Input
              id="profile-email"
              data-ocid="teacher.profile.email.input"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="ustaad@example.com"
              type="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-timeslot">Time Slot</Label>
            <Select
              value={form.timeSlot}
              onValueChange={(v) =>
                handleChange("timeSlot", v as UstaadProfile["timeSlot"])
              }
            >
              <SelectTrigger
                id="profile-timeslot"
                data-ocid="teacher.profile.timeslot.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-bio">Bio / About</Label>
            <Textarea
              id="profile-bio"
              data-ocid="teacher.profile.bio.textarea"
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Brief description about yourself, your teaching style..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            data-ocid="teacher.profile.save_button"
            className="w-full gap-2"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
