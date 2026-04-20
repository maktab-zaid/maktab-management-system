import LogoBadge from "@/components/LogoBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Download,
  GraduationCap,
  LayoutDashboard,
  Phone,
  ShieldX,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { loginAsAdmin, loginAsParent, loginAsTeacher } from "../../lib/auth";
import { type Session, type Teacher, getTeachers } from "../../lib/storage";

interface LoginPageProps {
  onLogin: (session: Session) => void;
}

type Tab = "admin" | "teacher" | "parent";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

const TAB_CONFIG: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: "admin",
    label: "Admin",
    icon: <LayoutDashboard className="w-4 h-4" />,
  },
  {
    id: "teacher",
    label: "Ustaad",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  { id: "parent", label: "Parent", icon: <User className="w-4 h-4" /> },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<Tab>("admin");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [parentMobile, setParentMobile] = useState("");
  const [parentLoginError, setParentLoginError] = useState<string | null>(null);
  const [teacherLoginError, setTeacherLoginError] = useState<string | null>(
    null,
  );
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  // Load teachers from Supabase on mount
  useEffect(() => {
    setLoadingTeachers(true);
    getTeachers()
      .then((data) => setTeachers(data))
      .catch(() => setTeachers([]))
      .finally(() => setLoadingTeachers(false));
  }, []);

  // Deduplicate by name for login dropdown
  const uniqueTeachers = teachers.filter(
    (t, idx) => teachers.findIndex((x) => x.name === t.name) === idx,
  );

  // Get shifts for selected teacher
  const selectedTeacherData = uniqueTeachers.find(
    (t) => t.name === teacherName,
  );
  const selectedTeacherShifts: string[] = selectedTeacherData
    ? selectedTeacherData.shifts && selectedTeacherData.shifts.length > 0
      ? selectedTeacherData.shifts
      : Array.isArray(selectedTeacherData.timeSlot)
        ? selectedTeacherData.timeSlot
        : selectedTeacherData.timeSlot
          ? selectedTeacherData.timeSlot.split(",").map((s) => s.trim())
          : []
    : [];

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const session = loginAsAdmin(adminUsername, adminPassword);
    if (!session) {
      toast.error("Invalid credentials. Use username: admin, password: 1234");
      return;
    }
    onLogin(session);
  };

  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherLoginError(null);
    if (!teacherName) {
      toast.error("Please select your name");
      return;
    }
    setLoggingIn(true);
    try {
      const session = await loginAsTeacher(teacherName);
      if (!session) {
        setTeacherLoginError(
          "Ustaad not found. Please contact Admin to be added to the system.",
        );
        return;
      }
      onLogin(session);
    } catch {
      setTeacherLoginError("Login failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentLoginError(null);
    if (parentMobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoggingIn(true);
    try {
      const session = await loginAsParent(parentMobile);
      if (!session) {
        setParentLoginError(
          "Login Failed. Mobile number not found in student records.",
        );
        return;
      }
      onLogin(session);
    } catch {
      setParentLoginError("Login failed. Please try again.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center islamic-bg p-4 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, oklch(0.96 0.02 155 / 0.7) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="bg-card rounded-2xl shadow-card-hover border border-border overflow-hidden"
        >
          {/* Gold shimmer top line */}
          <div className="gold-shimmer" />

          {/* Green header */}
          <div className="sidebar-gradient px-8 pt-8 pb-10 text-center relative">
            <div
              className="absolute top-3 left-3 w-8 h-8 opacity-20"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M0 0 L32 0 L32 4 L4 4 L4 32 L0 32 Z"
                  fill="oklch(0.75 0.18 75)"
                />
              </svg>
            </div>
            <div
              className="absolute top-3 right-3 w-8 h-8 opacity-20 rotate-90"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M0 0 L32 0 L32 4 L4 4 L4 32 L0 32 Z"
                  fill="oklch(0.75 0.18 75)"
                />
              </svg>
            </div>
            <div className="flex justify-center mb-5">
              <LogoBadge size="lg" withGoldRing />
            </div>
            <h1 className="text-xl font-bold text-white tracking-wide">
              Maktab Zaid Bin Sabit
            </h1>
            <p className="text-white/65 text-xs mt-1.5 tracking-widest uppercase">
              Management Portal
            </p>
          </div>

          {/* Tab selector */}
          <div className="flex border-b border-border bg-muted/20">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-ocid={`login.tab.${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors duration-200",
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                ].join(" ")}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form section */}
          <div className="px-7 py-7">
            <AnimatePresence mode="wait">
              {activeTab === "admin" && (
                <motion.form
                  key="admin"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleAdminSubmit}
                  className="space-y-4"
                  noValidate
                >
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="admin-username"
                      className="text-sm font-medium"
                    >
                      Username
                    </Label>
                    <Input
                      id="admin-username"
                      data-ocid="login.admin.username_input"
                      type="text"
                      placeholder="admin"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      autoComplete="username"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="admin-password"
                      className="text-sm font-medium"
                    >
                      Password
                    </Label>
                    <Input
                      id="admin-password"
                      data-ocid="login.admin.password_input"
                      type="password"
                      placeholder="••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                  </div>
                  <Button
                    data-ocid="login.admin.submit_button"
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                  >
                    Login as Admin
                  </Button>
                </motion.form>
              )}

              {activeTab === "teacher" && (
                <motion.form
                  key="teacher"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleTeacherSubmit}
                  className="space-y-4"
                  noValidate
                >
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="teacher-select"
                      className="text-sm font-medium"
                    >
                      Select Your Name
                    </Label>
                    {loadingTeachers ? (
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border px-3 py-3">
                        <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0 animate-pulse" />
                        <p className="text-sm text-muted-foreground">
                          Loading Ustaad list...
                        </p>
                      </div>
                    ) : uniqueTeachers.length === 0 ? (
                      <div className="flex items-center gap-2 rounded-lg bg-muted/50 border border-border px-3 py-3">
                        <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
                        <p className="text-sm text-muted-foreground">
                          No Ustaad added by Admin yet.
                        </p>
                      </div>
                    ) : (
                      <select
                        id="teacher-select"
                        data-ocid="login.teacher.select"
                        value={teacherName}
                        onChange={(e) => {
                          setTeacherName(e.target.value);
                          setTeacherLoginError(null);
                        }}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">-- Select Ustaad --</option>
                        {uniqueTeachers.map((t) => {
                          const shifts =
                            t.shifts && t.shifts.length > 0
                              ? t.shifts
                              : Array.isArray(t.timeSlot)
                                ? t.timeSlot
                                : t.timeSlot
                                  ? t.timeSlot.split(",").map((s) => s.trim())
                                  : [];
                          const shiftDisplay =
                            shifts.length > 0
                              ? ` (${shifts.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")})`
                              : "";
                          return (
                            <option key={t.id} value={t.name}>
                              {t.name}
                              {shiftDisplay}
                            </option>
                          );
                        })}
                      </select>
                    )}
                  </div>

                  {teacherName && selectedTeacherShifts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-1">
                      <span className="text-xs text-muted-foreground">
                        Assigned shifts:
                      </span>
                      {selectedTeacherShifts.map((shift) => (
                        <span
                          key={shift}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                        >
                          {shift.charAt(0).toUpperCase() + shift.slice(1)}
                        </span>
                      ))}
                    </div>
                  )}

                  {teacherLoginError && (
                    <div
                      data-ocid="login.teacher.error_state"
                      className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2.5"
                      role="alert"
                    >
                      <ShieldX className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <p className="text-sm text-destructive leading-snug">
                        {teacherLoginError}
                      </p>
                    </div>
                  )}

                  <Button
                    data-ocid="login.teacher.submit_button"
                    type="submit"
                    disabled={uniqueTeachers.length === 0 || loggingIn}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 disabled:opacity-50"
                  >
                    {loggingIn ? "Logging in..." : "Login as Ustaad"}
                  </Button>
                </motion.form>
              )}

              {activeTab === "parent" && (
                <motion.form
                  key="parent"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleParentSubmit}
                  className="space-y-4"
                  noValidate
                >
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="parent-mobile"
                      className="text-sm font-medium"
                    >
                      Child's Mobile Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="parent-mobile"
                        data-ocid="login.parent.mobile_input"
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit mobile number"
                        value={parentMobile}
                        onChange={(e) => {
                          setParentMobile(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          );
                          setParentLoginError(null);
                        }}
                        maxLength={10}
                        className="pl-9 font-mono tracking-wider"
                        autoComplete="tel"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {parentMobile.length}/10
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the mobile number registered with your child's
                      admission
                    </p>
                  </div>
                  {parentLoginError && (
                    <div
                      data-ocid="login.parent.error_state"
                      className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/30 px-3 py-2.5"
                      role="alert"
                    >
                      <ShieldX className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                      <p className="text-sm text-destructive leading-snug">
                        {parentLoginError}
                      </p>
                    </div>
                  )}
                  <Button
                    data-ocid="login.parent.submit_button"
                    type="submit"
                    disabled={loggingIn}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11 disabled:opacity-50"
                  >
                    {loggingIn ? "Checking..." : "View My Child's Progress"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            <div
              data-ocid="login.error_state"
              aria-live="polite"
              className="sr-only"
            />

            {installPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <Button
                  data-ocid="login.install.button"
                  type="button"
                  variant="outline"
                  className="w-full gap-2 border-dashed border-primary/40 text-primary hover:bg-primary/5"
                  onClick={handleInstall}
                >
                  <Download className="w-4 h-4" />
                  Install App
                </Button>
              </motion.div>
            )}

            <p className="text-center text-xs text-muted-foreground mt-6">
              &copy; {new Date().getFullYear()}. Built with ♥ using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
