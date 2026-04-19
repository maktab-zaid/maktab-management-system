import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSabakRecords, getStudents } from "@/lib/storage";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Lightbulb,
  Moon,
  RefreshCw,
  Sparkles,
  Star,
  Sun,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";

const COURSES = [
  "Ibtidayyah",
  "Nisf Qaidah",
  "Mukammal Qaidah",
  "Nisf Amma Para",
  "Mukammal Amma Para",
  "Nazra",
  "Hifz",
];

const TIME_STRUCTURE = [
  {
    slot: "Morning",
    time: "Fajr to 8:00 AM",
    icon: <Sun className="w-4 h-4" />,
    emoji: "🌅",
  },
  {
    slot: "Afternoon",
    time: "Zuhr to 3:00 PM",
    icon: <Clock className="w-4 h-4" />,
    emoji: "☀️",
  },
  {
    slot: "Evening",
    time: "After Asr Prayer",
    icon: <Moon className="w-4 h-4" />,
    emoji: "🌙",
  },
];

const UPCOMING_PROGRAMS = [
  {
    name: "AI Classes",
    icon: <Lightbulb className="w-3.5 h-3.5" />,
    emoji: "🤖",
  },
  {
    name: "Video Editing",
    icon: <Sparkles className="w-3.5 h-3.5" />,
    emoji: "🎬",
  },
  {
    name: "Poster Design",
    icon: <Star className="w-3.5 h-3.5" />,
    emoji: "🎨",
  },
  {
    name: "Website Design",
    icon: <BookOpen className="w-3.5 h-3.5" />,
    emoji: "🌐",
  },
  {
    name: "E-commerce Business",
    icon: <Target className="w-3.5 h-3.5" />,
    emoji: "🛒",
  },
];

const SABAK_SECTIONS = [
  { id: "quran" as const, label: "Quran / Hifz", emoji: "📖" },
  { id: "urdu" as const, label: "Urdu", emoji: "🔤" },
  { id: "dua" as const, label: "Dua", emoji: "🤲" },
  { id: "hadees" as const, label: "Hadees", emoji: "📜" },
];

export default function AcademicPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const students = useMemo(() => {
    void refreshKey;
    return getStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);
  const sabakRecords = useMemo(() => {
    void refreshKey;
    return getSabakRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Sabak summary: count students with records per section
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sec of SABAK_SECTIONS) {
      const uniqueStudents = new Set(
        sabakRecords
          .filter((r) => r.section === sec.id)
          .map((r) => r.studentId),
      );
      counts[sec.id] = uniqueStudents.size;
    }
    return counts;
  }, [sabakRecords]);

  // Recent sabak updates (last 10)
  const recentUpdates = useMemo(() => {
    return [...sabakRecords]
      .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
      .slice(0, 10);
  }, [sabakRecords]);

  return (
    <div data-ocid="admin.academic.page" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            📖 Academic Overview
          </h1>
          <p className="text-muted-foreground text-sm">
            Sabak progress updated by Ustaads — {students.length} students,{" "}
            {sabakRecords.length} records
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setRefreshKey((k) => k + 1)}
          data-ocid="admin.academic.refresh_button"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </Button>
      </div>

      {/* Sabak section summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {SABAK_SECTIONS.map((sec) => (
          <Card key={sec.id} className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">
                {sec.emoji}
              </span>
              <div>
                <p className="text-xl font-bold text-foreground">
                  {sectionCounts[sec.id] ?? 0}
                </p>
                <p className="text-xs text-muted-foreground">{sec.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent sabak updates */}
      <Card className="shadow-card">
        <CardContent className="p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            🕐 Recent Sabak Updates
          </h2>
          {recentUpdates.length === 0 ? (
            <p
              className="text-muted-foreground text-sm"
              data-ocid="admin.academic.empty_state"
            >
              No sabak records yet. Ustaads will update progress from their
              panel.
            </p>
          ) : (
            <div className="space-y-2">
              {recentUpdates.map((r, i) => {
                const section = SABAK_SECTIONS.find((s) => s.id === r.section);
                return (
                  <div
                    key={r.id}
                    data-ocid={`admin.academic.sabak.item.${i + 1}`}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <span className="text-lg shrink-0" aria-hidden="true">
                      {section?.emoji ?? "📚"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {r.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {section?.label} — {r.currentLesson}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {r.progressPercent ?? r.progress ?? 0}%
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.updatedAt}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* About Us content inline */}
      <div className="rounded-2xl bg-primary text-primary-foreground p-6 relative overflow-hidden shadow-elevated">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='0.5'%3E%3Cpath d='M30 0l3 9 9-3-3 9 9 3-9 3 3 9-9-3-3 9-3-9-9 3 3-9-9-3 9-3-3-9 9 3z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              🕌 Maktab Zaid Bin Sabit
            </h2>
            <p className="text-white/75 text-sm mt-0.5">
              Academic Year 2026–27
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Courses */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" /> Courses Offered
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {COURSES.map((c, i) => (
                <div
                  key={c}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40"
                  data-ocid={`admin.academic.course.${i + 1}`}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {c}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time structure + upcoming */}
        <div className="space-y-4">
          <Card className="shadow-card">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Class Time Structure
              </h3>
              <div className="space-y-2">
                {TIME_STRUCTURE.map((t, i) => (
                  <div
                    key={t.slot}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40"
                    data-ocid={`admin.academic.time.${i + 1}`}
                  >
                    <span className="text-xl" aria-hidden="true">
                      {t.emoji}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t.slot} Session
                      </p>
                      <p className="text-xs text-muted-foreground">{t.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-5">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                🚀 Upcoming Programs
              </h3>
              <div className="space-y-2">
                {UPCOMING_PROGRAMS.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 p-2 rounded-lg border border-dashed border-border/60"
                    data-ocid={`admin.academic.upcoming.${i + 1}`}
                  >
                    <span className="text-lg" aria-hidden="true">
                      {p.emoji}
                    </span>
                    <span className="text-sm font-medium text-foreground flex-1">
                      {p.name}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Soon
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
