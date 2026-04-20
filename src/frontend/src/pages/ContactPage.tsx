import { Card, CardContent } from "@/components/ui/card";
import {
  type Session,
  type Student,
  type Teacher,
  getStudents,
  getTeachers,
} from "@/lib/storage";
import { MessageCircle, Phone, Users } from "lucide-react";
import { useEffect, useState } from "react";

interface ContactPageProps {
  session: Session;
}

function formatMobile(mobile: string): string {
  const digits = mobile.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return mobile;
}

function TeacherContactCard({
  teacher,
  index,
}: {
  teacher: Teacher;
  index: number;
}) {
  return (
    <Card
      className="card-elevated card-gold-accent"
      data-ocid={`contact.teacher_card.${index}`}
    >
      <CardContent className="p-4 space-y-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary">
              {teacher.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {teacher.name}
            </p>
            <p className="text-xs text-muted-foreground">{teacher.className}</p>
          </div>
        </div>

        {/* Mobile */}
        <p className="text-sm text-foreground font-mono">
          {formatMobile(teacher.mobile)}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1">
          <a
            href={`tel:+91${teacher.mobile}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground transition-smooth hover:bg-green-mid hover:-translate-y-0.5 shadow-sm"
            data-ocid={`contact.call_button.${index}`}
          >
            <Phone className="w-3.5 h-3.5" />
            Call
          </a>
          <a
            href={`https://wa.me/91${teacher.mobile}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-[oklch(0.45_0.15_145)] text-primary-foreground transition-smooth hover:bg-[oklch(0.38_0.12_145)] hover:-translate-y-0.5 shadow-sm"
            data-ocid={`contact.whatsapp_button.${index}`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Parent Contact View ──────────────────────────────────────────────────────

interface ParentContactViewProps {
  session: Session;
  child: Student | null;
  teacher: Teacher | null;
}

function ParentContactView({
  session,
  child,
  teacher,
}: ParentContactViewProps) {
  // Track activity once on mount
  useEffect(() => {
    if (session.mobile) {
      // addParentActivity no longer needed — parent activity is not stored
    }
  }, [session.mobile]);

  return (
    <div className="space-y-5 page-enter" data-ocid="contact.page">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Contact</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Your child's teacher contact information
        </p>
      </div>

      {child && teacher ? (
        <div className="max-w-sm">
          {/* Child info banner */}
          <div className="mb-4 rounded-lg border border-border bg-muted/40 px-4 py-3">
            <p className="text-xs text-muted-foreground">Child</p>
            <p className="text-sm font-semibold text-foreground">
              {child.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {child.className} · Father: {child.fatherName}
            </p>
          </div>
          <TeacherContactCard teacher={teacher} index={1} />
        </div>
      ) : child && !teacher ? (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3 text-center card-base rounded-xl"
          data-ocid="contact.error_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Users className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Teacher information not available
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              The teacher assigned to your child has not been registered yet.
              Please contact the admin.
            </p>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3 text-center card-base rounded-xl"
          data-ocid="contact.empty_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Users className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No student found</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              No student is linked to your mobile number. Please contact the
              admin to get your child registered.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function ContactPage({ session }: ContactPageProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    getTeachers()
      .then(setTeachers)
      .catch(() => setTeachers([]));
    getStudents()
      .then(setStudents)
      .catch(() => setStudents([]));
  }, []);

  // ── PARENT VIEW ────────────────────────────────────────────────────────────
  if (session.role === "parent") {
    const child = students.find((s) => s.parentMobile === session.mobile);
    const teacher = child
      ? teachers.find((t) => t.name === child.teacherName)
      : null;

    return (
      <ParentContactView
        session={session}
        child={child ?? null}
        teacher={teacher ?? null}
      />
    );
  }

  // ── ADMIN VIEW ─────────────────────────────────────────────────────────────
  if (session.role === "admin") {
    return (
      <div className="space-y-5 page-enter" data-ocid="contact.page">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            All teacher contact information
          </p>
        </div>

        {teachers.length > 0 ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="contact.teachers_list"
          >
            {teachers.map((teacher, i) => (
              <TeacherContactCard
                key={teacher.id}
                teacher={teacher}
                index={i + 1}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-16 gap-3 text-center card-base rounded-xl"
            data-ocid="contact.empty_state"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <Users className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <p className="font-semibold text-foreground">
              No teachers registered yet
            </p>
          </div>
        )}
      </div>
    );
  }

  // ── TEACHER VIEW ───────────────────────────────────────────────────────────
  const classStudents = students.filter((s) => s.teacherName === session.name);

  return (
    <div className="space-y-5 page-enter" data-ocid="contact.page">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Contact</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Parent contacts for your class students
        </p>
      </div>

      {classStudents.length > 0 ? (
        <div
          className="card-base rounded-xl overflow-hidden"
          data-ocid="contact.parents_list"
        >
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 bg-muted/50 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Student</span>
            <span className="hidden sm:block">Father Name</span>
            <span>Mobile</span>
            <span>Actions</span>
          </div>

          {/* Rows */}
          {classStudents.map((student, i) => (
            <div
              key={student.id}
              className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-4 py-3 items-center border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors duration-150"
              data-ocid={`contact.parent_row.${i + 1}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {student.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {student.className}
                </p>
              </div>

              <p className="text-sm text-muted-foreground hidden sm:block truncate">
                {student.fatherName}
              </p>

              <p className="text-xs font-mono text-foreground whitespace-nowrap">
                {formatMobile(student.parentMobile)}
              </p>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={`tel:+91${student.parentMobile}`}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-smooth"
                  aria-label={`Call parent of ${student.name}`}
                  data-ocid={`contact.call_button.${i + 1}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`https://wa.me/91${student.parentMobile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[oklch(0.45_0.15_145/0.1)] text-[oklch(0.38_0.12_145)] hover:bg-[oklch(0.45_0.15_145)] hover:text-primary-foreground transition-smooth"
                  aria-label={`WhatsApp parent of ${student.name}`}
                  data-ocid={`contact.whatsapp_button.${i + 1}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-16 gap-3 text-center card-base rounded-xl"
          data-ocid="contact.empty_state"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
            <Users className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              No students in your class
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              No students are assigned to your class yet.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
