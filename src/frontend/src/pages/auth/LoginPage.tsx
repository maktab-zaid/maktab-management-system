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
import { type Session, getTeachers } from "../../lib/storage";

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
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(
    null,
  );

  const teachers = getTeachers();

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

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName) {
      toast.error("Please select your name");
      return;
    }
    const session = loginAsTeacher(teacherName);
    if (!session) {
      toast.error("Teacher not found");
      return;
    }
    onLogin(session);
  };

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parentMobile.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    const session = loginAsParent(parentMobile);
    if (!session) {
      toast.error("No student found with this mobile number");
      return;
    }
    onLogin(session);
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
                    <select
                      id="teacher-select"
                      data-ocid="login.teacher.select"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">-- Select Ustaad --</option>
                      {teachers.map((t) => (
                        <option key={t.name} value={t.name}>
                          {t.name} ({t.className})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    data-ocid="login.teacher.submit_button"
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                  >
                    Login as Ustaad
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
                        onChange={(e) =>
                          setParentMobile(
                            e.target.value.replace(/\D/g, "").slice(0, 10),
                          )
                        }
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
                  <Button
                    data-ocid="login.parent.submit_button"
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-11"
                  >
                    View My Child's Progress
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Error display is handled via sonner toasts */}
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
