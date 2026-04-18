import { BookOpenCheck, GraduationCap, Loader2, UserCog } from "lucide-react";
import { motion } from "motion/react";
import type { AppRole } from "../../types";

interface Props {
  onSelect: (role: AppRole) => void;
  isLoading: boolean;
}

const roles: {
  id: AppRole;
  label: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "admin",
    label: "Admin",
    desc: "Full access to manage students, teachers, fees and reports",
    icon: <UserCog className="w-8 h-8" />,
    color: "from-green-dark/90 to-green-mid/80",
  },
  {
    id: "teacher",
    label: "Teacher (Ustad)",
    desc: "Manage your students, mark attendance and update sabak",
    icon: <BookOpenCheck className="w-8 h-8" />,
    color: "from-chart-2/80 to-chart-2/60",
  },
  {
    id: "student",
    label: "Student (Talib)",
    desc: "View your attendance, fees, progress and sabak",
    icon: <GraduationCap className="w-8 h-8" />,
    color: "from-chart-3/80 to-chart-3/60",
  },
];

export default function RoleSelectionPage({ onSelect, isLoading }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Select Your Role
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Choose how you want to access the system
            </p>
          </div>

          {isLoading ? (
            <div
              className="flex justify-center py-12"
              data-ocid="role.loading_state"
            >
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {roles.map((role, i) => (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => onSelect(role.id)}
                  data-ocid={`role.${role.id}.button`}
                  className="w-full text-left bg-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-card-hover transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white shrink-0`}
                    >
                      {role.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors">
                        {role.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {role.desc}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
