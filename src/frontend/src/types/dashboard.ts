export type AppPage =
  | "dashboard"
  | "students"
  | "attendance"
  | "fees"
  | "sabak"
  | "notices"
  | "gallery"
  | "contact"
  | "manage-teachers";

export interface Student {
  id: string;
  name: string;
  mobile: string;
  class: string;
  teacher: string;
  fees: number;
  status: "Active" | "Inactive";
  admissionDate: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  date: string;
  status: "Present" | "Absent" | "Leave";
}

export type FeeStatus = "Paid" | "Pending" | "Partial";

export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  teacher: string;
  amount: number;
  paidAmount: number;
  status: FeeStatus;
  dueDate: string;
  paidDate?: string;
}

export type SabakGrade = "Excellent" | "Good" | "Needs Improvement";

export interface SabakRecord {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  teacher: string;
  currentLesson: string;
  surahName: string;
  completedAyahs: number;
  totalAyahs: number;
  progressPercent: number;
  grade: SabakGrade;
  teacherNotes: string;
  lastUpdated: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  category: "Announcement" | "Holiday" | "Event" | "Exam";
  priority: "Low" | "Medium" | "High";
  createdBy: string;
  createdAt: string;
  visibility?: "public" | "admin";
  preview?: string;
}
