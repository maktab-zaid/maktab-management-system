import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AppPage } from "@/types/dashboard";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  GraduationCap,
  Star,
  Target,
} from "lucide-react";

interface AboutUsPageProps {
  setActivePage: (page: AppPage) => void;
}

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
  { slot: "Fajr (Morning)", time: "7:00 AM to 9:00 AM", icon: "🌅" },
  { slot: "Afternoon", time: "2:00 PM to 4:00 PM", icon: "☀️" },
  { slot: "Evening", time: "Maghrib Azaan to Isha Azaan", icon: "🌙" },
];

const UPCOMING_PROGRAMS = [
  { name: "AI Classes", icon: "🤖" },
  { name: "Video Editing", icon: "🎬" },
  { name: "Poster Design", icon: "🎨" },
  { name: "Website Design", icon: "🌐" },
  { name: "E-commerce Business", icon: "🛒" },
];

export default function AboutUsPage({ setActivePage }: AboutUsPageProps) {
  return (
    <div className="space-y-6 page-enter" data-ocid="about_us.page">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setActivePage("dashboard")}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        data-ocid="about_us.back_button"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {/* Title Banner */}
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
            <h1 className="text-2xl font-bold text-white">
              About Maktab Zaid Bin Sabit
            </h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Academic Year 2026–27
            </p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <Card className="card-elevated border-border/60 border-l-4 border-l-gold">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-gold-dark" />
            <h2 className="text-base font-bold text-foreground">
              Mission & Vision
            </h2>
          </div>
          <blockquote className="text-sm text-foreground leading-relaxed border-l-2 border-gold/50 pl-4 italic">
            "To make Maktab digital and provide every child with basic Islamic
            knowledge which is farz, and make them capable in both Deen and
            Duniya."
          </blockquote>
        </CardContent>
      </Card>

      {/* Courses Offered */}
      <Card className="card-elevated border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Courses Offered
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COURSES.map((course, i) => (
              <div
                key={course}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40"
                data-ocid={`about_us.course.${i + 1}`}
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {course}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Structure */}
      <Card className="card-elevated border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Class Time Structure
            </h2>
          </div>
          <div className="space-y-3">
            {TIME_STRUCTURE.map((t, i) => (
              <div
                key={t.slot}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border/40"
                data-ocid={`about_us.time.${i + 1}`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {t.icon}
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

      {/* Quality Education */}
      <Card className="card-elevated border-border/60 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-gold-dark" />
            <h2 className="text-base font-bold text-foreground">
              Quality Education
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Maktab Zaid Bin Sabit is committed to providing every child with
            high-quality Islamic education. Our experienced Ustaads ensure
            individual attention to each student, tracking their Quran
            recitation, sabak progress, and overall development with a modern
            digital management system.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              "Certified Ustaads",
              "Digital Tracking",
              "Parent Updates",
              "Monthly Reports",
            ].map((feat) => (
              <div
                key={feat}
                className="flex items-center gap-2 text-sm text-foreground"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                {feat}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Programs */}
      <Card className="card-elevated border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl" aria-hidden="true">
              🚀
            </span>
            <h2 className="text-base font-bold text-foreground">
              Upcoming Programs
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            In addition to Islamic education, we are introducing modern skills
            for our students:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {UPCOMING_PROGRAMS.map((prog, i) => (
              <div
                key={prog.name}
                className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border/60 bg-muted/20"
                data-ocid={`about_us.upcoming.${i + 1}`}
              >
                <span className="text-xl" aria-hidden="true">
                  {prog.icon}
                </span>
                <span className="text-sm font-medium text-foreground">
                  {prog.name}
                </span>
                <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  Coming Soon
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-4 border-t border-border">
        <p className="text-sm font-bold text-foreground">
          Maktab Zaid Bin Sabit
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Nurturing faith, knowledge and character — 2026–27
        </p>
      </div>
    </div>
  );
}
