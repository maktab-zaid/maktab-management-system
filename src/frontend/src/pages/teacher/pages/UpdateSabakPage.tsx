import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type SabakRecord,
  getSabakHistory,
  getSabakRecords,
  getStudents,
  upsertSabakRecord,
} from "@/lib/storage";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  History,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  teacherId: string;
  onBack?: () => void;
}

type SabakSection = "quran" | "urdu" | "dua" | "hadees";

const SECTIONS: {
  id: SabakSection;
  label: string;
  emoji: string;
  color: string;
}[] = [
  {
    id: "quran",
    label: "Quran / Hifz Progress",
    emoji: "📖",
    color: "bg-emerald-50 border-emerald-300 text-emerald-800",
  },
  {
    id: "urdu",
    label: "Urdu Progress",
    emoji: "📚",
    color: "bg-blue-50 border-blue-300 text-blue-800",
  },
  {
    id: "dua",
    label: "Dua Progress",
    emoji: "🤲",
    color: "bg-amber-50 border-amber-300 text-amber-800",
  },
  {
    id: "hadees",
    label: "Hadees Progress",
    emoji: "📿",
    color: "bg-purple-50 border-purple-300 text-purple-800",
  },
];

// Surah list for datalist autocomplete
const SURAH_LIST = [
  "Al-Fatiha",
  "Al-Baqarah",
  "Aal-Imran",
  "An-Nisa",
  "Al-Maidah",
  "Al-Anam",
  "Al-Araf",
  "Al-Anfal",
  "At-Tawbah",
  "Yunus",
  "Hud",
  "Yusuf",
  "Ar-Rad",
  "Ibrahim",
  "Al-Hijr",
  "An-Nahl",
  "Al-Isra",
  "Al-Kahf",
  "Maryam",
  "Ta-Ha",
  "Al-Anbiya",
  "Al-Hajj",
  "Al-Muminun",
  "An-Nur",
  "Al-Furqan",
  "Ash-Shuara",
  "An-Naml",
  "Al-Qasas",
  "Al-Ankabut",
  "Ar-Rum",
  "Luqman",
  "As-Sajdah",
  "Al-Ahzab",
  "Saba",
  "Fatir",
  "Ya-Sin",
  "As-Saffat",
  "Sad",
  "Az-Zumar",
  "Ghafir",
  "Fussilat",
  "Ash-Shura",
  "Az-Zukhruf",
  "Ad-Dukhan",
  "Al-Jathiyah",
  "Al-Ahqaf",
  "Muhammad",
  "Al-Fath",
  "Al-Hujurat",
  "Qaf",
  "Adh-Dhariyat",
  "At-Tur",
  "An-Najm",
  "Al-Qamar",
  "Ar-Rahman",
  "Al-Waqiah",
  "Al-Hadid",
  "Al-Mujadilah",
  "Al-Hashr",
  "Al-Mumtahanah",
  "As-Saf",
  "Al-Jumuah",
  "Al-Munafiqun",
  "At-Taghabun",
  "At-Talaq",
  "At-Tahrim",
  "Al-Mulk",
  "Al-Qalam",
  "Al-Haqqah",
  "Al-Maarij",
  "Nuh",
  "Al-Jinn",
  "Al-Muzzammil",
  "Al-Muddaththir",
  "Al-Qiyamah",
  "Al-Insan",
  "Al-Mursalat",
  "An-Naba",
  "An-Naziat",
  "Abasa",
  "At-Takwir",
  "Al-Infitar",
  "Al-Mutaffifin",
  "Al-Inshiqaq",
  "Al-Buruj",
  "At-Tariq",
  "Al-Ala",
  "Al-Ghashiyah",
  "Al-Fajr",
  "Al-Balad",
  "Ash-Shams",
  "Al-Layl",
  "Ad-Duha",
  "Ash-Sharh",
  "At-Tin",
  "Al-Alaq",
  "Al-Qadr",
  "Al-Bayyinah",
  "Az-Zalzalah",
  "Al-Adiyat",
  "Al-Qariah",
  "At-Takathur",
  "Al-Asr",
  "Al-Humazah",
  "Al-Fil",
  "Quraysh",
  "Al-Maun",
  "Al-Kawthar",
  "Al-Kafirun",
  "An-Nasr",
  "Al-Masad",
  "Al-Ikhlas",
  "Al-Falaq",
  "An-Nas",
];

const SURAH_DATALIST = "teacher-surah-list";

/** Summary line for a record */
function formatSummary(rec: SabakRecord): string {
  if (rec.section === "quran") {
    if (rec.surahName && rec.ayatNumber != null) {
      return `Surah ${rec.surahName} — Ayat ${rec.ayatNumber}`;
    }
    return rec.currentLesson ?? rec.lessonName ?? "—";
  }
  if (rec.countCompleted != null) {
    if (rec.section === "urdu")
      return `${rec.countCompleted} lessons completed`;
    if (rec.section === "dua") return `${rec.countCompleted} memorized`;
    if (rec.section === "hadees") return `${rec.countCompleted} memorized`;
  }
  const pct = rec.progressPercent ?? rec.progress;
  if (pct != null) return `${pct}% complete`;
  return rec.currentLesson ?? rec.lessonName ?? "—";
}

// ── Section form state ────────────────────────────────────────────────────────

interface QuranForm {
  surahName: string;
  ayatNumber: string;
  remarks: string;
}

interface CountForm {
  countCompleted: string;
  remarks: string;
}

function SectionCard({
  section,
  studentId,
  studentName,
  teacherName,
}: {
  section: { id: SabakSection; label: string; emoji: string; color: string };
  studentId: string;
  studentName: string;
  teacherName: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<SabakRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const latest = getSabakRecords().find(
    (r) => r.studentId === studentId && r.section === section.id,
  );

  const [quranForm, setQuranForm] = useState<QuranForm>(() => ({
    surahName: latest?.surahName ?? "",
    ayatNumber: latest?.ayatNumber != null ? String(latest.ayatNumber) : "",
    remarks: latest?.remarks ?? "",
  }));

  const [countForm, setCountForm] = useState<CountForm>(() => ({
    countCompleted:
      latest?.countCompleted != null ? String(latest.countCompleted) : "",
    remarks: latest?.remarks ?? "",
  }));

  const isQuran = section.id === "quran";

  const handleSave = () => {
    setSaving(true);
    try {
      let record: SabakRecord;
      if (isQuran) {
        record = {
          id: `sabak-${Date.now()}-${section.id}`,
          studentId,
          studentName,
          section: section.id,
          currentLesson: quranForm.surahName
            ? `Surah ${quranForm.surahName} — Ayat ${quranForm.ayatNumber}`
            : "",
          surahName: quranForm.surahName || undefined,
          ayatNumber: quranForm.ayatNumber
            ? Number(quranForm.ayatNumber)
            : undefined,
          remarks: quranForm.remarks,
          updatedBy: teacherName,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      } else {
        record = {
          id: `sabak-${Date.now()}-${section.id}`,
          studentId,
          studentName,
          section: section.id,
          currentLesson: `Count: ${countForm.countCompleted}`,
          countCompleted: countForm.countCompleted
            ? Number(countForm.countCompleted)
            : undefined,
          remarks: countForm.remarks,
          updatedBy: teacherName,
          updatedAt: new Date().toISOString().slice(0, 10),
        };
      }
      upsertSabakRecord(record);
      toast.success(`${section.label} saved`);
      setExpanded(false);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const loadHistory = () => {
    const h = getSabakHistory(studentId, section.id);
    setHistory(h);
    setShowHistory(true);
  };

  const latestSummary = latest ? formatSummary(latest) : null;

  return (
    <>
      <datalist id={SURAH_DATALIST}>
        {SURAH_LIST.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <Card
        className={cn(
          "border-2 transition-all duration-200",
          expanded ? "shadow-md" : "shadow-sm",
        )}
      >
        <CardContent className="p-0">
          {/* Section header */}
          <button
            type="button"
            className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors rounded-t-xl"
            onClick={() => setExpanded((v) => !v)}
            data-ocid={`teacher.sabak.section.${section.id}`}
          >
            <span className="text-2xl" aria-hidden="true">
              {section.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground text-sm">
                {section.label}
              </p>
              {latestSummary && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {latestSummary}
                </p>
              )}
            </div>
            {latest && (
              <Badge
                className="text-[10px] shrink-0"
                style={{
                  background: "oklch(0.94 0.04 145)",
                  color: "oklch(0.35 0.12 145)",
                  border: "1px solid oklch(0.82 0.06 145)",
                }}
              >
                Recorded
              </Badge>
            )}
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full border",
                section.color,
              )}
            >
              {expanded ? "▲" : "▼"}
            </span>
          </button>

          {expanded && (
            <div className="px-5 pb-5 space-y-4 border-t border-border">
              {isQuran ? (
                /* Quran form: Surah + Ayat */
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Surah Name</Label>
                    <Input
                      data-ocid={`teacher.sabak.${section.id}.surah.input`}
                      list={SURAH_DATALIST}
                      value={quranForm.surahName}
                      onChange={(e) =>
                        setQuranForm((p) => ({
                          ...p,
                          surahName: e.target.value,
                        }))
                      }
                      placeholder="e.g. Al-Baqarah"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Ayat Number</Label>
                    <Input
                      type="number"
                      min={1}
                      data-ocid={`teacher.sabak.${section.id}.ayat.input`}
                      value={quranForm.ayatNumber}
                      onChange={(e) =>
                        setQuranForm((p) => ({
                          ...p,
                          ayatNumber: e.target.value,
                        }))
                      }
                      placeholder="e.g. 204"
                    />
                    {quranForm.surahName && quranForm.ayatNumber && (
                      <p className="text-xs font-medium text-primary flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Surah {quranForm.surahName} — Ayat{" "}
                        {quranForm.ayatNumber}
                      </p>
                    )}
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label className="text-xs font-semibold">Remarks</Label>
                    <Input
                      data-ocid={`teacher.sabak.${section.id}.remarks.input`}
                      value={quranForm.remarks}
                      onChange={(e) =>
                        setQuranForm((p) => ({ ...p, remarks: e.target.value }))
                      }
                      placeholder="Teacher's remarks..."
                    />
                  </div>
                </div>
              ) : (
                /* Count-based form: Urdu / Dua / Hadees */
                <div className="grid sm:grid-cols-2 gap-4 pt-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {section.id === "urdu"
                        ? "Lessons Completed"
                        : section.id === "dua"
                          ? "Duas Memorized"
                          : "Hadees Memorized"}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      data-ocid={`teacher.sabak.${section.id}.count.input`}
                      value={countForm.countCompleted}
                      onChange={(e) =>
                        setCountForm((p) => ({
                          ...p,
                          countCompleted: e.target.value,
                        }))
                      }
                      placeholder="Enter number"
                    />
                    {countForm.countCompleted && (
                      <p className="text-xs font-medium text-primary">
                        {section.id === "urdu" &&
                          `Urdu: ${countForm.countCompleted} lessons`}
                        {section.id === "dua" &&
                          `Dua: ${countForm.countCompleted} memorized`}
                        {section.id === "hadees" &&
                          `Hadees: ${countForm.countCompleted} memorized`}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Remarks</Label>
                    <Input
                      data-ocid={`teacher.sabak.${section.id}.remarks.input`}
                      value={countForm.remarks}
                      onChange={(e) =>
                        setCountForm((p) => ({ ...p, remarks: e.target.value }))
                      }
                      placeholder="Teacher's remarks..."
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  data-ocid={`teacher.sabak.${section.id}.save_button`}
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={loadHistory}
                  data-ocid={`teacher.sabak.${section.id}.history_button`}
                >
                  <History className="w-3.5 h-3.5" />
                  History
                </Button>
              </div>

              {/* History list */}
              {showHistory && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Recent History
                  </p>
                  {history.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No history yet
                    </p>
                  ) : (
                    history.slice(0, 5).map((h, i) => (
                      <div
                        key={h.id}
                        className="flex items-start gap-3 py-2 px-3 rounded-lg bg-muted/30 border border-border/50"
                        data-ocid={`teacher.sabak.${section.id}.history.${i + 1}`}
                      >
                        <span className="text-xs font-bold text-muted-foreground w-4 shrink-0">
                          {i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">
                            {formatSummary(h)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {h.remarks}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {h.updatedAt}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function UpdateSabakPage({ teacherId, onBack }: Props) {
  const allStudents = getStudents();
  const [selectedId, setSelectedId] = useState("");

  const selectedStudent = allStudents.find((s) => s.id === selectedId);
  const teacherName = teacherId.replace("teacher-mobile-", "");

  return (
    <div data-ocid="teacher.sabak.page" className="space-y-5">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            data-ocid="teacher.sabak.back_button"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Sabak Tracking
          </h1>
          <p className="text-muted-foreground text-sm">
            Track: 📖 Quran (Surah + Ayat) · 📚 Urdu (lessons) · 🤲 Dua (count)
            · 📿 Hadees (count)
          </p>
        </div>
      </div>

      <Select value={selectedId} onValueChange={setSelectedId}>
        <SelectTrigger
          data-ocid="teacher.sabak.student.select"
          className="max-w-sm"
        >
          <SelectValue placeholder="Select a student" />
        </SelectTrigger>
        <SelectContent>
          {allStudents.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name} — {s.className}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!selectedId ? (
        <div
          className="text-center py-16 bg-card rounded-xl border border-border"
          data-ocid="teacher.sabak.empty_state"
        >
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Select a student to update their sabak progress
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {SECTIONS.map((s) => (
              <span
                key={s.id}
                className={cn("text-xs px-3 py-1 rounded-full border", s.color)}
              >
                {s.emoji} {s.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="teacher.sabak.sections">
          <p className="text-sm font-medium text-foreground">
            {selectedStudent?.name} — {selectedStudent?.className}
          </p>
          {SECTIONS.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              studentId={selectedId}
              studentName={selectedStudent?.name ?? ""}
              teacherName={teacherName}
            />
          ))}
        </div>
      )}
    </div>
  );
}
