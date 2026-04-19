import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  GraduationCap,
  Heart,
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
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Quranic Studies",
    desc: "Nazra & Hifz — Recitation and memorisation of the Holy Quran",
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: "Islamic Studies",
    desc: "Urdu, Dua & Hadees — Essential knowledge for every Muslim",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Character Building",
    desc: "Akhlaq — Developing Islamic manners, values, and etiquette",
  },
];

const TIME_SLOTS = [
  {
    icon: <Moon className="w-5 h-5" />,
    label: "Morning Session",
    time: "Early Morning after Fajr",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: <Sun className="w-5 h-5" />,
    label: "Afternoon Session",
    time: "After Zuhr",
    color:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    icon: <Star className="w-5 h-5" />,
    label: "Evening Session",
    time: "After Asr / Maghrib",
    color: "bg-primary/10 text-primary",
  },
];

const UPCOMING = [
  { label: "AI Classes", icon: <Lightbulb className="w-3.5 h-3.5" /> },
  { label: "Video Editing", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { label: "Poster Design", icon: <Star className="w-3.5 h-3.5" /> },
  { label: "Website Design", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { label: "E-commerce Business", icon: <Target className="w-3.5 h-3.5" /> },
];

export default function AboutUsPage({ onBack }: Props) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <Button
        data-ocid="about_us.back_button"
        variant="ghost"
        size="sm"
        className="gap-2 text-muted-foreground hover:text-foreground -ml-1"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="overflow-hidden">
          <div className="sidebar-gradient px-6 py-8 text-center relative">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id="geo"
                    x="0"
                    y="0"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <polygon
                      points="20,2 38,11 38,29 20,38 2,29 2,11"
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#geo)" />
              </svg>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/20 border-2 border-white/30 mb-4">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-wide">
                Maktab Zaid Bin Sabit
              </h1>
              <p className="text-white/75 text-sm mt-1">
                Digital Islamic Education System
              </p>
              <div className="mt-3 inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full border border-white/30">
                Academic Year 2026–27
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Mission & Vision */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card>
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-bold text-foreground">Our Vision</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              To make Maktab digital and provide every child with basic Islamic
              knowledge which is farz, and make them capable in both{" "}
              <span className="text-foreground font-medium">Deen</span> and{" "}
              <span className="text-foreground font-medium">Duniya</span>.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Course Details */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-3"
      >
        <h2 className="font-bold text-foreground text-sm uppercase tracking-wider px-1">
          Course Details
        </h2>
        {COURSES.map((course, i) => (
          <motion.div
            key={course.title}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15 + i * 0.07 }}
          >
            <Card>
              <CardContent className="pt-4 pb-4 px-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  {course.icon}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    {course.title}
                  </p>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-snug">
                    {course.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Time Structure */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-3"
      >
        <h2 className="font-bold text-foreground text-sm uppercase tracking-wider px-1">
          Time Structure
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {TIME_SLOTS.map((slot, i) => (
            <motion.div
              key={slot.label}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.22 + i * 0.07 }}
            >
              <Card>
                <CardContent className="pt-4 pb-4 px-4 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${slot.color}`}
                  >
                    {slot.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-sm">
                      {slot.label}
                    </p>
                    <p className="text-muted-foreground text-xs">{slot.time}</p>
                  </div>
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quality Education */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-5 pb-5 px-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-bold text-foreground">Quality Education</h2>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We are committed to providing every child with a strong foundation
              in Deen and Duniya. Our certified Ustaads ensure individual
              attention and progress tracking.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Courses */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-3"
      >
        <h2 className="font-bold text-foreground text-sm uppercase tracking-wider px-1">
          Upcoming Courses
        </h2>
        <Card>
          <CardContent className="pt-4 pb-4 px-4">
            <p className="text-xs text-muted-foreground mb-3">
              Exciting new programmes coming soon to expand your skills:
            </p>
            <div className="flex flex-wrap gap-2">
              {UPCOMING.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: 0.38 + i * 0.06 }}
                >
                  <Badge
                    data-ocid={`about_us.upcoming_course.item.${i + 1}`}
                    variant="outline"
                    className="gap-1.5 py-1 px-2.5 border-primary/30 text-primary bg-primary/5 font-medium"
                  >
                    {item.icon}
                    {item.label}
                    <span className="ml-1 text-[9px] font-bold uppercase bg-amber-400 text-amber-900 rounded px-1 py-0.5 leading-none">
                      New
                    </span>
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
