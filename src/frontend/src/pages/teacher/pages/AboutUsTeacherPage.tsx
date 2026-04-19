import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  GraduationCap,
  Lightbulb,
  Moon,
  Sparkles,
  Star,
  Sun,
  Target,
} from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onBack: () => void;
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
  { slot: "Morning", time: "Fajr to 8:00 AM", emoji: "🌅" },
  { slot: "Afternoon", time: "Zuhr to 3:00 PM", emoji: "☀️" },
  { slot: "Evening", time: "After Asr Prayer", emoji: "🌙" },
];

const UPCOMING_PROGRAMS = [
  { name: "AI Classes", emoji: "🤖" },
  { name: "Video Editing", emoji: "🎬" },
  { name: "Poster Design", emoji: "🎨" },
  { name: "Website Design", emoji: "🌐" },
  { name: "E-commerce Business", emoji: "🛒" },
];

export default function AboutUsTeacherPage({ onBack }: Props) {
  return (
    <div
      className="space-y-6 page-enter max-w-2xl"
      data-ocid="teacher.about_us.page"
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        data-ocid="teacher.about_us.back_button"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </Button>

      {/* Title Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
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
                🕌 Maktab Zaid Bin Sabit
              </h1>
              <p className="text-primary-foreground/80 text-sm mt-1">
                Digital Islamic Education System · Academic Year 2026–27
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mission & Vision */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <Card className="card-elevated border-l-4 border-l-primary">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Mission & Vision
              </h2>
            </div>
            <blockquote className="text-sm text-foreground leading-relaxed border-l-2 border-primary/30 pl-4 italic">
              "To make Maktab digital and provide every child with basic Islamic
              knowledge which is farz, and make them capable in both Deen and
              Duniya."
            </blockquote>
          </CardContent>
        </Card>
      </motion.div>

      {/* Courses */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Courses Offered
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {COURSES.map((c, i) => (
                <div
                  key={c}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/40"
                  data-ocid={`teacher.about_us.course.${i + 1}`}
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
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
      </motion.div>

      {/* Time Structure */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <Card>
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
                  data-ocid={`teacher.about_us.time.${i + 1}`}
                >
                  <span className="text-2xl" aria-hidden="true">
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
      </motion.div>

      {/* Quality Education */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Quality Education
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We are committed to providing every child with a strong foundation
              in Deen and Duniya. Our certified Ustaads ensure individual
              attention and progress tracking.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Programs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl" aria-hidden="true">
                🚀
              </span>
              <h2 className="text-base font-bold text-foreground">
                Upcoming Programs
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {UPCOMING_PROGRAMS.map((p, i) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border/60 bg-muted/20"
                  data-ocid={`teacher.about_us.upcoming.${i + 1}`}
                >
                  <span className="text-xl" aria-hidden="true">
                    {p.emoji}
                  </span>
                  <span className="text-sm font-medium text-foreground flex-1">
                    {p.name}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    Coming Soon
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="text-center py-4 border-t border-border">
        <p className="text-sm font-bold text-foreground">
          🕌 Maktab Zaid Bin Sabit
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Nurturing faith, knowledge and character — 2026–27
        </p>
      </div>
    </div>
  );
}
