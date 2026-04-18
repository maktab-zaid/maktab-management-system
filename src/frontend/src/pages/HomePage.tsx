import { Button } from "@/components/ui/button";
import { BarChart2, GraduationCap, ShieldCheck } from "lucide-react";

type Page = "home" | "status" | "admin" | "teacher";

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="islamic-bg min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary shadow-lg mb-6 logo-gold-ring">
          <GraduationCap className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">
          مکتب زید بن ثابت
        </h1>
        <h2 className="text-xl font-semibold text-primary mb-1">
          Maktab Zaid Bin Sabit
        </h2>
        <p className="text-muted-foreground text-base">
          Madrasa Management System
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="w-full max-w-xs flex flex-col gap-4">
        <Button
          data-ocid="home.status.button"
          onClick={() => onNavigate("status")}
          className="h-16 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
        >
          <BarChart2 className="w-6 h-6 mr-3" />📊 Status
        </Button>

        <Button
          data-ocid="home.admin.button"
          onClick={() => onNavigate("admin")}
          className="h-16 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
        >
          <ShieldCheck className="w-6 h-6 mr-3" />
          👨‍💼 Admin
        </Button>

        <Button
          data-ocid="home.teacher.button"
          onClick={() => onNavigate("teacher")}
          className="h-16 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5"
        >
          <GraduationCap className="w-6 h-6 mr-3" />
          👨‍🏫 Teacher
        </Button>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-muted-foreground">
        <p>
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
