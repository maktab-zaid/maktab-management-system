import LogoBadge from "@/components/LogoBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import {
  useAdminSheetStats,
  useStudentsSheet,
} from "../../../hooks/useGoogleSheets";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  isLoading?: boolean;
}

function StatCard({
  label,
  value,
  icon,
  color,
  badge,
  isLoading,
}: StatCardProps) {
  return (
    <Card className="stat-card-hover shadow-card border-border">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}
          >
            {icon}
          </div>
          <div className="min-w-0">
            {isLoading ? (
              <Skeleton className="h-7 w-16 mb-1" />
            ) : (
              <p className="text-2xl font-bold text-foreground">{value}</p>
            )}
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              {label}
            </p>
            {badge && (
              <Badge
                variant="outline"
                className="text-xs mt-1 bg-primary/5 text-primary border-primary/20"
              >
                {badge}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const {
    totalStudents,
    totalTeachers,
    feesPaid,
    feesPending,
    classCounts,
    teacherNames,
    isLoading,
  } = useAdminSheetStats();
  const { data: students = [] } = useStudentsSheet();
  const queryClient = useQueryClient();

  const allClasses = Object.keys(classCounts);
  const totalClassCount = Object.values(classCounts).reduce((a, b) => a + b, 0);

  return (
    <div data-ocid="admin.dashboard.page" className="space-y-6">
      {/* Dashboard header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <LogoBadge size="sm" className="mt-0.5" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Maktab Zaid Bin Sabit &mdash; Live Google Sheets Data
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-primary border-primary/30 hover:bg-primary/5"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["sheet-students"] });
            queryClient.invalidateQueries({ queryKey: ["sheet-reports"] });
          }}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <StatCard
            label="Total Students"
            value={totalStudents}
            icon={<GraduationCap className="w-6 h-6 text-white" />}
            color="bg-primary"
            badge="Google Sheets"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            label="Total Teachers"
            value={totalTeachers}
            icon={<Users className="w-6 h-6 text-white" />}
            color="bg-chart-2"
            badge="Google Sheets"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatCard
            label="Fees Paid"
            value={feesPaid}
            icon={<BookOpen className="w-6 h-6 text-white" />}
            color="bg-chart-3"
            isLoading={isLoading}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            label="Fees Pending"
            value={feesPending}
            icon={<AlertCircle className="w-6 h-6 text-white" />}
            color="bg-destructive"
            isLoading={isLoading}
          />
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Class-wise count */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              Class-wise Student Count
              <Badge
                variant="outline"
                className="text-xs bg-primary/5 text-primary border-primary/20"
              >
                Live
              </Badge>
            </h2>
            {isLoading ? (
              <div
                className="space-y-2"
                data-ocid="admin.dashboard.loading_state"
              >
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : allClasses.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No class data in Google Sheet yet
              </p>
            ) : (
              <div className="space-y-2">
                {allClasses.map((cls) => {
                  const count = classCounts[cls] ?? 0;
                  const pct =
                    totalClassCount > 0 ? (count / totalClassCount) * 100 : 0;
                  return (
                    <div key={cls} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-36 shrink-0 truncate">
                        {cls}
                      </span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground w-6 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teachers from sheet */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              Teachers
              <Badge
                variant="outline"
                className="text-xs bg-primary/5 text-primary border-primary/20"
              >
                Live
              </Badge>
            </h2>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : teacherNames.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No teacher data in Google Sheet yet
              </p>
            ) : (
              <div className="space-y-3">
                {teacherNames.slice(0, 6).map((name, i) => {
                  const count = students.filter(
                    (s) => s.teacher.toLowerCase() === name.toLowerCase(),
                  ).length;
                  return (
                    <div
                      key={name}
                      data-ocid={`admin.dashboard.teacher.item.${i + 1}`}
                      className="flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {count} student{count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
