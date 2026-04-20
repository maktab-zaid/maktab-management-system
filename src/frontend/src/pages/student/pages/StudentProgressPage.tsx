import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SabakRecord, Student } from "@/lib/storage";
import { getStudentSabakLatest, getStudents } from "@/lib/storage";
import { BookOpen, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useStudentByMobile } from "../../../hooks/useGoogleSheets";

interface Props {
  mobileNumber: string;
}

type Section = "quran" | "urdu" | "dua" | "hadees";

const SECTIONS: { id: Section; label: string; emoji: string }[] = [
  { id: "quran", label: "Quran / Hifz Progress", emoji: "📖" },
  { id: "urdu", label: "Urdu Progress", emoji: "🔤" },
  { id: "dua", label: "Dua Progress", emoji: "🤲" },
  { id: "hadees", label: "Hadees Progress", emoji: "📜" },
];

function formatSectionValue(
  id: Section,
  record: Record<string, unknown>,
): string {
  if (id === "quran") {
    const surah = record.surahName as string | undefined;
    const ayat = record.ayatNumber as number | undefined;
    if (surah && ayat) return `Surah ${surah} — Ayat ${ayat}`;
    if (surah) return `Surah ${surah}`;
    return (record.currentLesson as string) || "—";
  }
  const count = record.countCompleted as number | undefined;
  if (id === "urdu")
    return count != null
      ? `${count} lessons completed`
      : (record.currentLesson as string) || "—";
  if (id === "dua") return count != null ? `${count} duas memorized` : "—";
  if (id === "hadees") return count != null ? `${count} hadees memorized` : "—";
  return "—";
}

export default function StudentProgressPage({ mobileNumber }: Props) {
  const { isLoading } = useStudentByMobile(mobileNumber);
  const [localStudent, setLocalStudent] = useState<Student | undefined>(
    undefined,
  );
  const [sabakLatest, setSabakLatest] = useState<
    Partial<Record<string, SabakRecord>>
  >({});

  useEffect(() => {
    getStudents()
      .then((students) => {
        const found = students.find((s) => s.parentMobile === mobileNumber);
        setLocalStudent(found);
        if (found) {
          getStudentSabakLatest(found.id)
            .then(setSabakLatest)
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [mobileNumber]);

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const student = localStudent;
    const pageW = 210;
    const margin = 20;
    let y = 20;

    // Header
    doc.setFillColor(22, 101, 52);
    doc.rect(0, 0, pageW, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Maktab Zaid Bin Sabit", pageW / 2, 12, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Student Report Card", pageW / 2, 20, { align: "center" });
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, pageW / 2, 27, {
      align: "center",
    });

    y = 42;
    doc.setTextColor(0, 0, 0);

    // Student Info Box
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, y, pageW - margin * 2, 52, 3, 3, "F");
    doc.setDrawColor(22, 101, 52);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, pageW - margin * 2, 52, 3, 3, "S");

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52);
    doc.text("Student Information", margin + 5, y + 9);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(50, 50, 50);
    const col1x = margin + 5;
    const col2x = margin + 90;

    const infoRows = [
      [
        "Name:",
        student?.name || "—",
        "Father Name:",
        student?.fatherName || "—",
      ],
      [
        "Roll Number:",
        student?.rollNumber || "—",
        "Session:",
        student?.timeSlot
          ? student.timeSlot.charAt(0).toUpperCase() + student.timeSlot.slice(1)
          : "—",
      ],
      [
        "Ustaad:",
        student?.teacherName || "—",
        "Admission Date:",
        student?.admissionDate || "—",
      ],
    ];

    for (let idx = 0; idx < infoRows.length; idx++) {
      const row = infoRows[idx];
      const rowY = y + 18 + idx * 11;
      doc.setFont("helvetica", "bold");
      doc.text(row[0], col1x, rowY);
      doc.setFont("helvetica", "normal");
      doc.text(row[1], col1x + 28, rowY);
      doc.setFont("helvetica", "bold");
      doc.text(row[2], col2x, rowY);
      doc.setFont("helvetica", "normal");
      doc.text(row[3], col2x + 30, rowY);
    }

    y += 62;

    // Progress heading
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52);
    doc.text("Learning Progress", margin, y);
    y += 8;

    // Progress sections
    for (const sec of SECTIONS) {
      const record = sabakLatest[sec.id] as Record<string, unknown> | undefined;
      const value = record
        ? formatSectionValue(sec.id, record)
        : "No record yet";
      const remarks = record
        ? (record.remarks as string | undefined)
        : undefined;
      const updatedAt = record
        ? (record.updatedAt as string | undefined)
        : undefined;

      doc.setFillColor(249, 250, 251);
      doc.roundedRect(
        margin,
        y,
        pageW - margin * 2,
        remarks ? 30 : 22,
        2,
        2,
        "F",
      );
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.roundedRect(
        margin,
        y,
        pageW - margin * 2,
        remarks ? 30 : 22,
        2,
        2,
        "S",
      );

      // Colored left border
      doc.setFillColor(22, 101, 52);
      doc.rect(margin, y, 3, remarks ? 30 : 22, "F");

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(`${sec.emoji}  ${sec.label}`, margin + 8, y + 8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(value, margin + 8, y + 16);

      if (remarks) {
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(8);
        doc.text(`Remarks: ${remarks}`, margin + 8, y + 24);
      }

      if (updatedAt) {
        doc.setTextColor(150, 150, 150);
        doc.setFontSize(7.5);
        doc.text(`Updated: ${updatedAt}`, pageW - margin - 5, y + 8, {
          align: "right",
        });
      }

      y += (remarks ? 30 : 22) + 5;
    }

    // Footer
    doc.setFillColor(22, 101, 52);
    doc.rect(0, 282, pageW, 15, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Academic Year: 2026–27  •  Maktab Zaid Bin Sabit",
      pageW / 2,
      291,
      { align: "center" },
    );

    doc.save(`Report_Card_${student?.name || "Student"}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="space-y-5" data-ocid="student.progress.loading_state">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div data-ocid="student.progress.page" className="space-y-5 max-w-2xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Report Card
          </h1>
          <p className="text-muted-foreground text-sm">
            Sabak progress updated by your Ustaad — Academic Year 2026–27
          </p>
        </div>
        <Button
          data-ocid="student.progress.download_button"
          onClick={handleDownloadPDF}
          className="gap-2 shrink-0"
          size="sm"
        >
          <Download className="w-4 h-4" />
          Download Report Card PDF
        </Button>
      </div>

      {/* Student Summary Card */}
      {localStudent && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Student Name</p>
                <p className="font-semibold text-foreground">
                  {localStudent.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Father Name</p>
                <p className="font-semibold text-foreground">
                  {localStudent.fatherName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Roll Number</p>
                <p className="font-semibold text-foreground">
                  {localStudent.rollNumber || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Session</p>
                <p className="font-semibold text-foreground capitalize">
                  {localStudent.timeSlot || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ustaad</p>
                <p className="font-semibold text-foreground">
                  {localStudent.teacherName || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Admission Date</p>
                <p className="font-semibold text-foreground">
                  {localStudent.admissionDate || "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 4 Sabak Sections */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-foreground">
          Learning Progress
        </h2>
        {SECTIONS.map((sec) => {
          const record = sabakLatest[sec.id] as
            | Record<string, unknown>
            | undefined;
          const secRemarks = record?.remarks as string | undefined;
          const secUpdatedAt = record?.updatedAt as string | undefined;
          const secUpdatedBy = record?.updatedBy as string | undefined;
          return (
            <Card
              key={sec.id}
              className="shadow-card border-border"
              data-ocid={`student.progress.${sec.id}.card`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5" aria-hidden="true">
                    {sec.emoji}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground mb-1">
                      {sec.label}
                    </h3>
                    {record ? (
                      <div className="space-y-1">
                        <p className="text-sm text-primary font-medium">
                          {formatSectionValue(sec.id, record)}
                        </p>
                        {secRemarks && (
                          <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">
                            "{secRemarks}"
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Updated: {secUpdatedAt} · by {secUpdatedBy}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground py-1">
                        No record yet — ask your Ustaad to update
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
