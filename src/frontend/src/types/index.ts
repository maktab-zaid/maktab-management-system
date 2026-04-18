// Local types for frontend-only Maktab Management System

export interface Student {
  id: string;
  name: string;
  fatherName: string;
  mobileNumber: string;
  className: string;
  assignedTeacherId: string;
  timing: string;
  feesStatus: FeesStatus;
  monthlyFees: bigint;
  createdAt: bigint;
}

export interface Teacher {
  id: string;
  name: string;
  class: string;
  mobile: string;
  subject?: string;
  mobileNumber?: string;
  createdAt?: bigint;
}

export interface SalaryRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  month: string;
  year: string;
  amount: number;
  status: "paid" | "pending";
  paidDate?: string;
}

export interface ParentActivity {
  parentMobile: string;
  studentId: string;
  studentName: string;
  lastLogin: string;
  recentActivities: Array<{ action: string; timestamp: string }>;
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  createdAt: bigint;
}

export interface AcademicRecord {
  id: string;
  studentId: string;
  currentSabak: string;
  previousSabak: string;
  monthlyProgress: string;
  akhlaqRating: bigint;
  updatedAt: bigint;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  month: string;
  amount: bigint;
  status: FeesPaymentStatus;
  createdAt: bigint;
}

export interface UserProfile {
  id: string;
  name: string;
  role: string;
}

export type FeesStatus = "active" | "pending" | "cancelled";
export const FeesStatus = {
  active: "active" as FeesStatus,
  pending: "pending" as FeesStatus,
  cancelled: "cancelled" as FeesStatus,
};

export type AttendanceStatus = "present" | "absent";
export const AttendanceStatus = {
  present: "present" as AttendanceStatus,
  absent: "absent" as AttendanceStatus,
};

export type FeesPaymentStatus = "paid" | "pending";
export const FeesPaymentStatus = {
  paid: "paid" as FeesPaymentStatus,
  pending: "pending" as FeesPaymentStatus,
};

export type AppRole = "admin" | "staff" | "teacher" | "student";

export type AdminPage =
  | "dashboard"
  | "students"
  | "teachers"
  | "attendance"
  | "academic"
  | "reports";

export type TeacherPage =
  | "my-students"
  | "add-student"
  | "attendance"
  | "sabak";

export type StaffPage = "my-students" | "monthly-report" | "student-data";

export type StudentPage = "profile" | "attendance" | "fees" | "progress";

export interface AuthState {
  step: "login" | "app";
  mobileNumber: string;
  role: AppRole | null;
}

export const CLASS_OPTIONS = [
  "Ibtidayyah",
  "Nisf Qaidah",
  "Mukammal Qaidah",
  "Nisf Amma Para",
  "Mukammal Amma Para",
  "Nazra",
  "Hifz",
] as const;

export const CLASS_LIST = CLASS_OPTIONS;

export const TIMING_OPTIONS = ["Subah", "Dopahar", "Shaam"] as const;

export type ClassName = (typeof CLASS_OPTIONS)[number];
export type TimingName = (typeof TIMING_OPTIONS)[number];
