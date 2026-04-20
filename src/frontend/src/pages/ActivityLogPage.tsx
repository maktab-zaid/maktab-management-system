import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type ActivityLog, getActivityLog } from "@/lib/storage";
import type { AppPage } from "@/types/dashboard";
import {
  ArrowLeft,
  ClipboardList,
  Edit,
  Filter,
  Search,
  UserMinus,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface ActivityLogPageProps {
  setActivePage?: (page: AppPage) => void;
}

const SESSION_FILTERS = ["All", "Morning", "Afternoon", "Evening"] as const;
type SessionFilter = (typeof SESSION_FILTERS)[number];

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const datePart = d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}

function getActionIcon(action: ActivityLog["action"]) {
  switch (action) {
    case "added_student":
      return { Icon: UserPlus, bg: "bg-success/10", color: "text-success" };
    case "removed_student":
      return {
        Icon: UserMinus,
        bg: "bg-destructive/10",
        color: "text-destructive",
      };
    case "updated_student":
      return { Icon: Edit, bg: "bg-primary/10", color: "text-primary" };
    default:
      return { Icon: Edit, bg: "bg-muted", color: "text-muted-foreground" };
  }
}

function getActionLabel(action: ActivityLog["action"]): string {
  switch (action) {
    case "added_student":
      return "Added";
    case "removed_student":
      return "Removed";
    case "updated_student":
      return "Updated";
    default:
      return "Action";
  }
}

function buildActionText(entry: ActivityLog): string {
  const verb =
    entry.action === "added_student"
      ? "added student"
      : entry.action === "removed_student"
        ? "removed student"
        : "updated student";
  return `${entry.actorName} ${verb} ${entry.targetStudentName}`;
}

function sessionFromDetails(details?: string): string | null {
  if (!details) return null;
  const lower = details.toLowerCase();
  if (lower.includes("morning")) return "Morning";
  if (lower.includes("afternoon")) return "Afternoon";
  if (lower.includes("evening")) return "Evening";
  return null;
}

export default function ActivityLogPage({
  setActivePage,
}: ActivityLogPageProps) {
  const [search, setSearch] = useState("");
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>("All");
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    getActivityLog()
      .then(setLogs)
      .catch(() => setLogs([]));
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((entry) => {
      const text = buildActionText(entry).toLowerCase();
      const matchSearch = search === "" || text.includes(search.toLowerCase());
      const entrySession = sessionFromDetails(entry.details);
      const matchSession =
        sessionFilter === "All" ||
        (entrySession
          ? entrySession.toLowerCase() === sessionFilter.toLowerCase()
          : true);
      return matchSearch && matchSession;
    });
  }, [logs, search, sessionFilter]);

  const addedCount = logs.filter((e) => e.action === "added_student").length;
  const removedCount = logs.filter(
    (e) => e.action === "removed_student",
  ).length;
  const updatedCount = logs.filter(
    (e) => e.action === "updated_student",
  ).length;

  return (
    <div className="space-y-5 page-enter" data-ocid="activity_log.page">
      {/* Back button */}
      {setActivePage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setActivePage("dashboard")}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          data-ocid="activity_log.back_button"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      )}

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Activity Log</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All Ustaad and Admin actions — {logs.length} entries
          </p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <UserPlus className="w-3.5 h-3.5 text-success" />
          <span className="text-xs font-semibold text-success">
            {addedCount} Added
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20">
          <UserMinus className="w-3.5 h-3.5 text-destructive" />
          <span className="text-xs font-semibold text-destructive">
            {removedCount} Removed
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Edit className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">
            {updatedCount} Updated
          </span>
        </div>
      </div>

      {/* Search + Filter */}
      <Card className="card-elevated border-border/60">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search by name or action..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
                data-ocid="activity_log.search_input"
              />
            </div>
            <div
              className="flex items-center gap-2"
              data-ocid="activity_log.session_filter"
            >
              <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex gap-1.5 flex-wrap">
                {SESSION_FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSessionFilter(f)}
                    data-ocid={`activity_log.filter.${f.toLowerCase()}`}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
                      sessionFilter === f
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log entries */}
      <Card
        className="card-elevated border-border/60 overflow-hidden"
        data-ocid="activity_log.list"
      >
        <CardHeader className="px-4 py-3 border-b border-border bg-muted/30">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            Recent Activity — Latest First
          </p>
        </CardHeader>

        <div className="divide-y divide-border/40">
          {filtered.length === 0 ? (
            <div
              className="py-16 text-center"
              data-ocid="activity_log.empty_state"
            >
              <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">
                No activity yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Actions by Ustaads and Admin will appear here
              </p>
            </div>
          ) : (
            filtered.map((entry, i) => {
              const { Icon, bg, color } = getActionIcon(entry.action);
              const actionLabel = getActionLabel(entry.action);
              const actionText = buildActionText(entry);
              const entrySession = sessionFromDetails(entry.details);

              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 px-4 py-3.5 hover:bg-muted/20 transition-colors duration-150"
                  data-ocid={`activity_log.item.${i + 1}`}
                >
                  {/* Icon */}
                  <div
                    className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground leading-snug">
                      {actionText}
                    </p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                      {entrySession && (
                        <span className="text-xs text-muted-foreground/60">
                          · {entrySession}
                        </span>
                      )}
                      {entry.details && !entrySession && (
                        <span className="text-xs text-muted-foreground/60 italic truncate max-w-[200px]">
                          {entry.details}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badge */}
                  <Badge
                    variant="outline"
                    className={`flex-shrink-0 text-xs ${
                      entry.action === "added_student"
                        ? "border-success/30 text-success bg-success/8"
                        : entry.action === "removed_student"
                          ? "border-destructive/30 text-destructive bg-destructive/8"
                          : "border-primary/30 text-primary bg-primary/8"
                    }`}
                  >
                    {actionLabel}
                  </Badge>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
